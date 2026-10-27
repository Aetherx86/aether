#!/usr/bin/env python3
"""
Mímisbrunnr Apple Silicon MLX Bridge
Serves sovereign Apple MLX models on localhost with 16GB Unified Memory cache hygiene:
1. PocketAiHub/Qwen3.8-9B-Abliterated-MLX/4bit (5.57 GiB • 4-bit affine)
2. mlx-community/DeepSeek-R1-Distill-Qwen-14B-4bit (8.8 GiB • 4-bit Metal Reasoning)
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
MODEL_DEEPSEEK_14B = "mlx-community/DeepSeek-R1-Distill-Qwen-14B-4bit"

MODEL_SPECS = {
    MODEL_9B_4BIT: {
        "id": MODEL_9B_4BIT,
        "repo_id": "PocketAiHub/Qwen3.8-9B-Abliterated-MLX",
        "variant": "4bit",
        "repo_dir": BASE_DIR / "Qwen3.8-9B-Abliterated-MLX",
        "variant_dir": BASE_DIR / "Qwen3.8-9B-Abliterated-MLX" / "4bit",
        "status_file": BASE_DIR / "qwen38-9b-4bit-status.json",
        "total_bytes": 5977078438,
        "allow_patterns": ["4bit/*", "LICENSE", "README.md"],
        "required_files": [
            "config.json",
            "tokenizer.json",
            "model.safetensors.index.json",
            "model-00001-of-00002.safetensors",
            "model-00002-of-00002.safetensors",
        ],
    },
    MODEL_DEEPSEEK_14B: {
        "id": MODEL_DEEPSEEK_14B,
        "repo_id": "mlx-community/DeepSeek-R1-Distill-Qwen-14B-4bit",
        "variant": "",
        "repo_dir": BASE_DIR / "DeepSeek-R1-Distill-Qwen-14B-4bit",
        "variant_dir": BASE_DIR / "DeepSeek-R1-Distill-Qwen-14B-4bit",
        "status_file": BASE_DIR / "deepseek-r1-14b-4bit-status.json",
        "total_bytes": 8900000000,
        "allow_patterns": ["*.json", "*.safetensors", "*.txt", "tokenizer*", "LICENSE", "README*"],
        "required_files": [
            "config.json",
            "tokenizer.json",
        ],
    },
}

MODEL_LOCK = threading.Lock()
CURRENT_MODEL_ID = MODEL_DEEPSEEK_14B
LOADED_MODEL = None
LOADED_PROCESSOR = None


def get_spec(model_id: str = None) -> dict:
    if not model_id:
        return MODEL_SPECS.get(CURRENT_MODEL_ID, MODEL_SPECS[MODEL_DEEPSEEK_14B])
    if model_id in MODEL_SPECS:
        return MODEL_SPECS[model_id]
    s = model_id.lower()
    if "deepseek" in s or "14b" in s or "r1" in s:
        return MODEL_SPECS[MODEL_DEEPSEEK_14B]
    return MODEL_SPECS[MODEL_9B_4BIT]


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


def is_spec_complete(spec: dict = None) -> bool:
    if spec is None:
        spec = get_spec()
    vdir: Path = spec["variant_dir"]
    if not vdir.exists():
        return False
    for name in spec["required_files"]:
        fp = vdir / name
        if not fp.exists() or fp.stat().st_size < 50:
            return False
    # Verify at least one safetensors exists
    has_weights = any(f.name.endswith(".safetensors") and f.stat().st_size > 1000 for f in vdir.glob("*.safetensors"))
    return has_weights


def write_spec_status(spec: dict = None, **updates):
    if spec is None:
        spec = get_spec()
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


def download_variant(spec: dict = None) -> Path:
    if spec is None:
        spec = get_spec()
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
            allow_patterns=spec["allow_patterns"],
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


def ensure_model_loaded(target_model_id: str = None):
    global LOADED_MODEL, LOADED_PROCESSOR, CURRENT_MODEL_ID
    spec = get_spec(target_model_id)
    target_id = spec["id"]

    if LOADED_MODEL is not None and LOADED_PROCESSOR is not None and CURRENT_MODEL_ID == target_id:
        return LOADED_MODEL, LOADED_PROCESSOR

    with MODEL_LOCK:
        if LOADED_MODEL is not None and LOADED_PROCESSOR is not None and CURRENT_MODEL_ID == target_id:
            return LOADED_MODEL, LOADED_PROCESSOR

        # Unload previous model if switching
        if LOADED_MODEL is not None:
            LOADED_MODEL = None
            LOADED_PROCESSOR = None
            try:
                import mlx.core as mx
                gc.collect()
                mx.clear_cache()
            except Exception:
                pass

        CURRENT_MODEL_ID = target_id
        variant_path = download_variant(spec)
        write_spec_status(spec, status="loading", percent=100.0, error=None)

        import mlx.core as mx
        try:
            from mlx_lm import load
            model, processor = load(str(variant_path))
        except Exception:
            from mlx_vlm import load
            model, processor = load(str(variant_path))

        try:
            gc.collect()
            mx.clear_cache()
        except Exception:
            pass

        LOADED_MODEL = model
        LOADED_PROCESSOR = processor
        write_spec_status(spec, status="serving", percent=100.0, error=None)
        return LOADED_MODEL, LOADED_PROCESSOR


def generate_chat_reply(messages, model_id=None, temperature=0.7, max_tokens=768) -> str:
    import mlx.core as mx

    spec = get_spec(model_id)
    model, processor = ensure_model_loaded(spec["id"])

    with MODEL_LOCK:
        gen_kwargs = {
            "max_tokens": int(max_tokens),
            "temperature": float(temperature),
        }

        try:
            from mlx_lm import generate
            from mlx_lm.prompt_utils import apply_chat_template
            prompt = apply_chat_template(processor, model.config, messages)
            result = generate(model, processor, prompt, **gen_kwargs)
        except Exception:
            from mlx_vlm import generate
            from mlx_vlm.prompt_utils import apply_chat_template
            try:
                prompt = apply_chat_template(processor, model.config, messages, num_images=0)
            except TypeError:
                prompt = apply_chat_template(processor, model.config, messages)
            result = generate(model, processor, prompt, **gen_kwargs)

        text = result.text if hasattr(result, "text") else str(result)

        # For Qwen 3.8 standard chat, strip think if requested, but for DeepSeek-R1 preserve <think>
        if spec["id"] == MODEL_9B_4BIT and "<think>" in text and "</think>" in text:
            text = text.split("</think>", 1)[1].strip()

        try:
            mx.clear_cache()
        except Exception:
            pass

        return text.strip()


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
            self._send_json(
                200,
                {
                    "ok": True,
                    "ready": LOADED_MODEL is not None,
                    "loadedModel": CURRENT_MODEL_ID if LOADED_MODEL is not None else None,
                    "installed": {
                        MODEL_9B_4BIT: is_spec_complete(MODEL_SPECS[MODEL_9B_4BIT]),
                        MODEL_DEEPSEEK_14B: is_spec_complete(MODEL_SPECS[MODEL_DEEPSEEK_14B]),
                    },
                },
            )
            return

        if self.path.startswith("/v1/models"):
            self._send_json(
                200,
                {
                    "object": "list",
                    "data": [
                        {"id": MODEL_DEEPSEEK_14B, "object": "model", "owned_by": "mlx-community"},
                        {"id": MODEL_9B_4BIT, "object": "model", "owned_by": "PocketAiHub"},
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
            req_model = body.get("model") or CURRENT_MODEL_ID
            threading.Thread(target=ensure_model_loaded, args=(req_model,), daemon=True).start()
            self._send_json(200, {"ok": True, "preloading": req_model})
            return

        if self.path.startswith("/v1/chat/completions"):
            try:
                messages = body.get("messages") or []
                req_model = body.get("model") or CURRENT_MODEL_ID
                temperature = float(body.get("temperature", 0.7))
                max_tokens = int(body.get("max_tokens", 768))
                reply = generate_chat_reply(
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
                        "model": req_model,
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
    parser = argparse.ArgumentParser(description="Mímisbrunnr Apple Silicon MLX Bridge (DeepSeek-R1 14B & Qwen 9B)")
    parser.add_argument("--download-only", action="store_true")
    parser.add_argument("--serve", action="store_true")
    parser.add_argument("--preload", action="store_true")
    parser.add_argument("--model", type=str, default=MODEL_DEEPSEEK_14B)
    parser.add_argument("--port", type=int, default=8088)
    parser.add_argument("--host", type=str, default="127.0.0.1")
    args = parser.parse_args()

    spec = get_spec(args.model)

    if args.download_only:
        p = download_variant(spec)
        print(json.dumps({"ok": True, "model": spec["id"], "path": str(p)}))
        return

    if args.preload and is_spec_complete(spec):
        threading.Thread(target=ensure_model_loaded, args=(spec["id"],), daemon=True).start()

    server = ThreadingHTTPServer((args.host, args.port), MlxBridgeHandler)
    server.serve_forever()


if __name__ == "__main__":
    main()
