#!/usr/bin/env python3
"""
Mímisbrunnr Apple Silicon MLX Multi-Model Bridge
Serves PocketAiHub MLX checkpoints on localhost with automatic 16GB RAM VRAM hot-swapping:
  1. PocketAiHub/Qwen3.8-9B-Abliterated-MLX/4bit   (5.57 GiB • 4-bit affine)
  2. PocketAiHub/Qwen3.8-27B-Abliterated-MLX/2bit  (10.28 GiB • 2-bit AWQ)
"""

import argparse
import gc
import json
import os
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

BASE_DIR = Path.home() / ".aether" / "models"

MODEL_9B_4BIT = "PocketAiHub/Qwen3.8-9B-Abliterated-MLX/4bit"
MODEL_27B_2BIT = "PocketAiHub/Qwen3.8-27B-Abliterated-MLX/2bit"

MLX_MODEL_SPECS = {
    MODEL_9B_4BIT: {
        "id": MODEL_9B_4BIT,
        "repo_id": "PocketAiHub/Qwen3.8-9B-Abliterated-MLX",
        "variant": "4bit",
        "repo_dir": BASE_DIR / "Qwen3.8-9B-Abliterated-MLX",
        "variant_dir": BASE_DIR / "Qwen3.8-9B-Abliterated-MLX" / "4bit",
        "status_file": BASE_DIR / "qwen38-9b-4bit-status.json",
        "total_bytes": 5977078438,
        "required_files": [
            "config.json",
            "tokenizer.json",
            "model.safetensors.index.json",
            "model-00001-of-00002.safetensors",
            "model-00002-of-00002.safetensors",
        ],
    },
    MODEL_27B_2BIT: {
        "id": MODEL_27B_2BIT,
        "repo_id": "PocketAiHub/Qwen3.8-27B-Abliterated-MLX",
        "variant": "2bit",
        "repo_dir": BASE_DIR / "Qwen3.8-27B-Abliterated-MLX",
        "variant_dir": BASE_DIR / "Qwen3.8-27B-Abliterated-MLX" / "2bit",
        "status_file": BASE_DIR / "qwen38-2bit-status.json",
        "total_bytes": 11038999169,
        "required_files": [
            "config.json",
            "tokenizer.json",
            "model.safetensors.index.json",
            "model-00001-of-00003.safetensors",
            "model-00002-of-00003.safetensors",
            "model-00003-of-00003.safetensors",
        ],
    },
}

MODEL_LOCK = threading.Lock()
LOADED_MODEL_ID = None
LOADED_MODEL = None
LOADED_PROCESSOR = None


def resolve_spec(model_id: str | None) -> dict:
    if not model_id:
        return MLX_MODEL_SPECS[MODEL_9B_4BIT]
    low = model_id.strip().lower()
    if "9b" in low or "4bit" in low:
        return MLX_MODEL_SPECS[MODEL_9B_4BIT]
    if "27b" in low or "2bit" in low:
        return MLX_MODEL_SPECS[MODEL_27B_2BIT]
    return MLX_MODEL_SPECS.get(model_id, MLX_MODEL_SPECS[MODEL_9B_4BIT])


def compute_dir_bytes(directory: Path) -> int:
    if not directory.exists():
        return 0
    total = 0
    for root, _dirs, files in os.walk(directory):
        for f in files:
            try:
                fp = Path(root) / f
                if not fp.is_symlink():
                    st = fp.stat()
                    blocks_bytes = getattr(st, "st_blocks", 0) * 512
                    total += max(st.st_size if not f.endswith(".incomplete") else 0, blocks_bytes)
            except OSError:
                pass
    return total


def is_spec_complete(spec: dict) -> bool:
    vdir: Path = spec["variant_dir"]
    for name in spec["required_files"]:
        fp = vdir / name
        if not fp.exists() or fp.stat().st_size < 100:
            return False
    return True


def write_spec_status(spec: dict, **updates):
    status_file: Path = spec["status_file"]
    payload = {
        "status": "idle",
        "model": spec["id"],
        "downloadedBytes": 0,
        "totalBytes": spec["total_bytes"],
        "percent": 0.0,
        "error": None,
        "updatedAt": time.time(),
    }
    try:
        if status_file.exists():
            payload.update(json.loads(status_file.read_text(encoding="utf-8")))
    except Exception:
        pass
    payload.update(updates)
    payload["updatedAt"] = time.time()
    try:
        BASE_DIR.mkdir(parents=True, exist_ok=True)
        tmp = status_file.with_suffix(".tmp")
        tmp.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        tmp.replace(status_file)
    except OSError:
        pass


def download_variant(spec: dict) -> Path:
    vdir: Path = spec["variant_dir"]
    total_bytes: int = spec["total_bytes"]
    if is_spec_complete(spec):
        write_spec_status(
            spec,
            status="downloaded",
            downloadedBytes=total_bytes,
            percent=100.0,
            error=None,
        )
        return vdir

    from huggingface_hub import snapshot_download

    BASE_DIR.mkdir(parents=True, exist_ok=True)
    stop_monitor = threading.Event()
    repo_dir: Path = spec["repo_dir"]
    variant_name: str = spec["variant"]

    def monitor_progress():
        while not stop_monitor.is_set():
            current = compute_dir_bytes(repo_dir)
            pct = min(99.9, round((current / total_bytes) * 100.0, 2))
            write_spec_status(
                spec,
                status="downloading",
                downloadedBytes=current,
                totalBytes=total_bytes,
                percent=pct,
                error=None,
            )
            stop_monitor.wait(1.5)

    monitor_thread = threading.Thread(target=monitor_progress, daemon=True)
    monitor_thread.start()
    try:
        snapshot_download(
            repo_id=spec["repo_id"],
            local_dir=str(repo_dir),
            allow_patterns=[f"{variant_name}/*", "LICENSE", "README.md"],
        )
    except Exception as exc:
        stop_monitor.set()
        write_spec_status(spec, status="error", error=str(exc))
        raise
    finally:
        stop_monitor.set()

    write_spec_status(
        spec,
        status="downloaded",
        downloadedBytes=total_bytes,
        totalBytes=total_bytes,
        percent=100.0,
        error=None,
    )
    return vdir


def unload_current_locked():
    global LOADED_MODEL_ID, LOADED_MODEL, LOADED_PROCESSOR
    if LOADED_MODEL is not None or LOADED_PROCESSOR is not None:
        LOADED_MODEL = None
        LOADED_PROCESSOR = None
        LOADED_MODEL_ID = None
        gc.collect()
        try:
            import mlx.core as mx
            mx.clear_cache()
        except Exception:
            pass


def ensure_model_loaded(target_model_id: str | None = None):
    global LOADED_MODEL_ID, LOADED_MODEL, LOADED_PROCESSOR
    spec = resolve_spec(target_model_id or LOADED_MODEL_ID)

    if LOADED_MODEL is not None and LOADED_PROCESSOR is not None and LOADED_MODEL_ID == spec["id"]:
        return LOADED_MODEL, LOADED_PROCESSOR, spec

    with MODEL_LOCK:
        if LOADED_MODEL is not None and LOADED_PROCESSOR is not None and LOADED_MODEL_ID == spec["id"]:
            return LOADED_MODEL, LOADED_PROCESSOR, spec

        # Release previous MLX model from 16GB Unified Memory before loading the next
        unload_current_locked()

        variant_path = download_variant(spec)
        write_spec_status(spec, status="loading", percent=100.0, error=None)

        import mlx.core as mx
        from mlx_vlm import load

        model, processor = load(str(variant_path))
        try:
            mx.clear_cache()
        except Exception:
            pass

        LOADED_MODEL_ID = spec["id"]
        LOADED_MODEL = model
        LOADED_PROCESSOR = processor
        write_spec_status(spec, status="serving", percent=100.0, error=None)
        return LOADED_MODEL, LOADED_PROCESSOR, spec


def generate_chat_reply(messages, model_id=None, temperature=0.7, max_tokens=768) -> tuple[str, str]:
    import mlx.core as mx
    from mlx_vlm import generate
    from mlx_vlm.prompt_utils import apply_chat_template

    model, processor, spec = ensure_model_loaded(model_id)

    with MODEL_LOCK:
        try:
            prompt = apply_chat_template(
                processor,
                model.config,
                messages,
                num_images=0,
                enable_thinking=False,
            )
        except TypeError:
            prompt = apply_chat_template(
                processor,
                model.config,
                messages,
                num_images=0,
            )

        gen_kwargs = {
            "max_tokens": int(max_tokens),
            "temperature": float(temperature),
        }
        try:
            result = generate(
                model,
                processor,
                prompt,
                enable_thinking=False,
                **gen_kwargs,
            )
        except TypeError:
            result = generate(model, processor, prompt, **gen_kwargs)

        text = result.text if hasattr(result, "text") else str(result)
        if "<think>" in text and "</think>" in text:
            text = text.split("</think>", 1)[1].strip()

        try:
            mx.clear_cache()
        except Exception:
            pass

        return text.strip(), spec["id"]


class MlxBridgeHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        return

    def _send_json(self, code: int, obj: dict):
        raw = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self):
        if self.path.startswith("/health"):
            installed_map = {k: is_spec_complete(v) for k, v in MLX_MODEL_SPECS.items()}
            self._send_json(
                200,
                {
                    "ok": True,
                    "ready": LOADED_MODEL is not None,
                    "loadedModel": LOADED_MODEL_ID,
                    "installed": installed_map,
                },
            )
            return

        if self.path.startswith("/v1/models"):
            self._send_json(
                200,
                {
                    "object": "list",
                    "data": [
                        {"id": MODEL_9B_4BIT, "object": "model", "owned_by": "PocketAiHub"},
                        {"id": MODEL_27B_2BIT, "object": "model", "owned_by": "PocketAiHub"},
                    ],
                },
            )
            return

        self._send_json(404, {"error": "Not found"})

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0") or "0")
        raw_body = self.rfile.read(length) if length > 0 else b"{}"
        try:
            body = json.loads(raw_body.decode("utf-8"))
        except Exception:
            body = {}

        if self.path.startswith("/unload"):
            self._send_json(200, {"ok": True, "unloading": True})
            threading.Timer(0.15, lambda: os._exit(0)).start()
            return

        if self.path.startswith("/preload"):
            req_model = body.get("model")
            threading.Thread(target=ensure_model_loaded, args=(req_model,), daemon=True).start()
            self._send_json(200, {"ok": True, "preloading": req_model})
            return

        if self.path.startswith("/v1/chat/completions"):
            try:
                messages = body.get("messages") or []
                req_model = body.get("model")
                temperature = float(body.get("temperature", 0.7))
                max_tokens = int(body.get("max_tokens", 768))
                reply, served_model = generate_chat_reply(
                    messages,
                    model_id=req_model,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                self._send_json(
                    200,
                    {
                        "id": f"mlx-{int(time.time())}",
                        "object": "chat.completion",
                        "model": served_model,
                        "choices": [
                            {
                                "index": 0,
                                "message": {"role": "assistant", "content": reply},
                                "finish_reason": "stop",
                            }
                        ],
                    },
                )
            except Exception as exc:
                self._send_json(500, {"error": {"message": str(exc)}})
            return

        self._send_json(404, {"error": "Not found"})


def main():
    parser = argparse.ArgumentParser(description="Mímisbrunnr Multi-Model MLX Bridge")
    parser.add_argument("--download-only", action="store_true")
    parser.add_argument("--serve", action="store_true")
    parser.add_argument("--preload", action="store_true")
    parser.add_argument("--model", type=str, default=MODEL_9B_4BIT)
    parser.add_argument("--port", type=int, default=8088)
    parser.add_argument("--host", type=str, default="127.0.0.1")
    args = parser.parse_args()

    spec = resolve_spec(args.model)

    if args.download_only:
        path = download_variant(spec)
        print(json.dumps({"ok": True, "model": spec["id"], "path": str(path)}))
        return

    if args.preload and is_spec_complete(spec):
        threading.Thread(target=ensure_model_loaded, args=(spec["id"],), daemon=True).start()

    server = ThreadingHTTPServer((args.host, args.port), MlxBridgeHandler)
    server.serve_forever()


if __name__ == "__main__":
    main()
