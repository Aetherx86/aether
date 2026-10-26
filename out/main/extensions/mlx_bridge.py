#!/usr/bin/env python3
"""
Mímisbrunnr Apple Silicon MLX Bridge
Serves ONLY PocketAiHub/Qwen3.8-27B-Abliterated-MLX (2bit AWQ variant)
on localhost for Aether's airgapped local intelligence engine.
"""

import argparse
import json
import os
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

REPO_ID = "PocketAiHub/Qwen3.8-27B-Abliterated-MLX"
VARIANT = "2bit"
CANONICAL_MODEL_ID = "PocketAiHub/Qwen3.8-27B-Abliterated-MLX/2bit"
EXPECTED_TOTAL_BYTES = 11038999169

BASE_DIR = Path.home() / ".aether" / "models"
REPO_LOCAL_DIR = BASE_DIR / "Qwen3.8-27B-Abliterated-MLX"
VARIANT_DIR = REPO_LOCAL_DIR / VARIANT
STATUS_FILE = BASE_DIR / "qwen38-2bit-status.json"

STATE = {
    "status": "idle",
    "model": CANONICAL_MODEL_ID,
    "downloadedBytes": 0,
    "totalBytes": EXPECTED_TOTAL_BYTES,
    "percent": 0.0,
    "error": None,
    "updatedAt": time.time(),
}

MODEL_LOCK = threading.Lock()
LOADED_MODEL = None
LOADED_PROCESSOR = None


def compute_dir_bytes(directory: Path) -> int:
    if not directory.exists():
        return 0
    total = 0
    for root, _dirs, files in os.walk(directory):
        for f in files:
            try:
                fp = Path(root) / f
                if not fp.is_symlink():
                    total += fp.stat().st_size
            except OSError:
                pass
    return total


def is_variant_complete(variant_dir: Path = VARIANT_DIR) -> bool:
    required = [
        "config.json",
        "tokenizer.json",
        "model.safetensors.index.json",
        "model-00001-of-00003.safetensors",
        "model-00002-of-00003.safetensors",
        "model-00003-of-00003.safetensors",
    ]
    for name in required:
        fp = variant_dir / name
        if not fp.exists() or fp.stat().st_size < 100:
            return False
    return True


def write_status(**updates):
    STATE.update(updates)
    STATE["updatedAt"] = time.time()
    try:
        BASE_DIR.mkdir(parents=True, exist_ok=True)
        tmp = STATUS_FILE.with_suffix(".tmp")
        tmp.write_text(json.dumps(STATE, indent=2), encoding="utf-8")
        tmp.replace(STATUS_FILE)
    except OSError:
        pass


def download_2bit_variant() -> Path:
    if is_variant_complete(VARIANT_DIR):
        write_status(
            status="downloaded",
            downloadedBytes=EXPECTED_TOTAL_BYTES,
            percent=100.0,
            error=None,
        )
        return VARIANT_DIR

    from huggingface_hub import snapshot_download

    BASE_DIR.mkdir(parents=True, exist_ok=True)
    stop_monitor = threading.Event()

    def monitor_progress():
        while not stop_monitor.is_set():
            current = compute_dir_bytes(REPO_LOCAL_DIR)
            pct = min(99.9, round((current / EXPECTED_TOTAL_BYTES) * 100.0, 2))
            write_status(
                status="downloading",
                downloadedBytes=current,
                totalBytes=EXPECTED_TOTAL_BYTES,
                percent=pct,
                error=None,
            )
            stop_monitor.wait(1.5)

    monitor_thread = threading.Thread(target=monitor_progress, daemon=True)
    monitor_thread.start()
    try:
        snapshot_download(
            repo_id=REPO_ID,
            local_dir=str(REPO_LOCAL_DIR),
            allow_patterns=["2bit/*", "LICENSE", "README.md"],
        )
    except Exception as exc:
        stop_monitor.set()
        write_status(status="error", error=str(exc))
        raise
    finally:
        stop_monitor.set()

    final_bytes = compute_dir_bytes(VARIANT_DIR)
    write_status(
        status="downloaded",
        downloadedBytes=max(final_bytes, EXPECTED_TOTAL_BYTES),
        totalBytes=EXPECTED_TOTAL_BYTES,
        percent=100.0,
        error=None,
    )
    return VARIANT_DIR


def ensure_model_loaded():
    global LOADED_MODEL, LOADED_PROCESSOR
    if LOADED_MODEL is not None and LOADED_PROCESSOR is not None:
        return LOADED_MODEL, LOADED_PROCESSOR

    with MODEL_LOCK:
        if LOADED_MODEL is not None and LOADED_PROCESSOR is not None:
            return LOADED_MODEL, LOADED_PROCESSOR

        variant_path = download_2bit_variant()
        write_status(status="loading", percent=100.0, error=None)

        import mlx.core as mx
        from mlx_vlm import load

        model, processor = load(str(variant_path))
        try:
            mx.clear_cache()
        except Exception:
            pass

        LOADED_MODEL = model
        LOADED_PROCESSOR = processor
        write_status(status="serving", percent=100.0, error=None)
        return LOADED_MODEL, LOADED_PROCESSOR


def generate_chat_reply(messages, temperature=0.7, max_tokens=768) -> str:
    import mlx.core as mx
    from mlx_vlm import generate
    from mlx_vlm.prompt_utils import apply_chat_template

    model, processor = ensure_model_loaded()

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
            # Fallback if installed mlx-vlm signature omits enable_thinking
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
        # Strip any residual <think>...</think> prefix if emitted
        if "<think>" in text and "</think>" in text:
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
                    "downloaded": is_variant_complete(VARIANT_DIR),
                    **STATE,
                },
            )
            return

        if self.path.startswith("/v1/models"):
            self._send_json(
                200,
                {
                    "object": "list",
                    "data": [
                        {
                            "id": CANONICAL_MODEL_ID,
                            "object": "model",
                            "owned_by": "PocketAiHub",
                        }
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

        if self.path.startswith("/v1/chat/completions"):
            try:
                messages = body.get("messages") or []
                temperature = float(body.get("temperature", 0.7))
                max_tokens = int(body.get("max_tokens", 768))
                reply = generate_chat_reply(messages, temperature=temperature, max_tokens=max_tokens)
                self._send_json(
                    200,
                    {
                        "id": f"mlx-{int(time.time())}",
                        "object": "chat.completion",
                        "model": CANONICAL_MODEL_ID,
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
    parser = argparse.ArgumentParser(description="Mímisbrunnr MLX 2-bit AWQ Bridge")
    parser.add_argument("--download-only", action="store_true")
    parser.add_argument("--serve", action="store_true")
    parser.add_argument("--preload", action="store_true")
    parser.add_argument("--port", type=int, default=8088)
    parser.add_argument("--host", type=str, default="127.0.0.1")
    args = parser.parse_args()

    if args.download_only:
        path = download_2bit_variant()
        print(json.dumps({"ok": True, "path": str(path), **STATE}))
        return

    if args.preload:
        threading.Thread(target=ensure_model_loaded, daemon=True).start()
    elif is_variant_complete(VARIANT_DIR):
        write_status(
            status="downloaded",
            downloadedBytes=EXPECTED_TOTAL_BYTES,
            percent=100.0,
        )

    server = ThreadingHTTPServer((args.host, args.port), MlxBridgeHandler)
    server.serve_forever()


if __name__ == "__main__":
    main()
