#!/usr/bin/env python3
"""
🏛️ THE HIGH TABLE — Autonomous Multi-Agent Epistemic & Strategic Council
=============================================================================
A sovereign deliberative council uniting five specialized neural personas to 
dissect, stress-test, cross-examine, and definitively synthesize complex, 
high-stakes inquiries.

Features:
- Dynamic prompt entry (CLI argument, file, stdin pipe, or interactive modal)
- Per-seat model selection across all 5 High Table seats
- Adaptive fault-tolerant model fallback (503 High Demand / 429 Quota / 404 Deprecated -> Lighter model)
- Real-time token streaming with ANSI visual telemetry
- Auto-discovery of GEMINI_API_KEY from environment, app_source/.env, and ~/.aether/.env
"""

import sys
import os
import json
import argparse
import asyncio
from typing import List, Dict, Optional, Tuple

EMIT_JSON = False

def emit_event(ev: dict):
    if EMIT_JSON:
        sys.stdout.write(f"\n__HT_EVENT__:{json.dumps(ev)}\n")
        sys.stdout.flush()

# =============================================================================
# 1. ENVIRONMENT & API KEY RESOLUTION
# =============================================================================

def resolve_gemini_api_key() -> str:
    """Discovers GEMINI_API_KEY from environment or local/global .env files."""
    if os.environ.get("GEMINI_API_KEY"):
        return os.environ["GEMINI_API_KEY"]

    search_paths = [
        "/Users/sushikim/Desktop/app_source/.env",
        os.path.expanduser("~/.aether/.env"),
        os.path.expanduser("~/.env"),
        os.path.join(os.path.dirname(__file__), ".env"),
    ]

    for p in search_paths:
        if os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith("GEMINI_API_KEY="):
                            val = line.split("=", 1)[1].strip().strip('"').strip("'")
                            if val:
                                os.environ["GEMINI_API_KEY"] = val
                                return val
            except Exception:
                pass
    return ""

API_KEY = resolve_gemini_api_key()
if not API_KEY:
    print("\n❌ [The High Table] Warning: GEMINI_API_KEY not found in environment, app_source/.env, or ~/.aether/.env.")
    print("   Please export GEMINI_API_KEY='...' before proceeding.\n")

from google import genai
from google.genai import types
from google.genai.errors import ServerError, ClientError, APIError

client = genai.Client()

# =============================================================================
# 2. THE FIVE SEATS & ROLES OF THE HIGH TABLE
# =============================================================================

STYLE_GUIDELINE = (
    "\n\nCRITICAL FORMATTING & TYPOGRAPHY INSTRUCTION:\n"
    "- Write in clean, highly readable, articulate prose with standard Markdown.\n"
    "- NEVER output malformed or broken LaTeX syntax like '${S_{t_2}$' or unclosed braces.\n"
    "- Express mathematical formulas and logical variables in natural, readable typography (e.g. 'State S(t₂)', 'X_1', or properly balanced '$S_{t_2}$').\n"
    "- Use bolding (**text**) selectively for emphasis; do not wrap entire clauses in asterisks.\n"
    "- Maintain clarity, intellectual depth, and visual elegance throughout."
)

HIGH_TABLE_SEATS = [
    {
        "id": "Seat 1",
        "title": "The Logician (논리학자 / 분석가)",
        "persona": (
            "You are the High Table Logician. Deconstruct the inquiry with absolute mathematical and logical rigor. "
            "Expose premise-conclusion structures, formal entailments, hidden lemmas, deductive soundess, and structural validity. "
            "Demand analytical precision; reject rhetoric and ambiguous phrasing."
            + STYLE_GUIDELINE
        ),
        "default_model": "gemini-3.5-flash-lite",
        "color": "\033[94m" # Blue
    },
    {
        "id": "Seat 2",
        "title": "The Visionary (창의적 전략가 / 발상가)",
        "persona": (
            "You are the High Table Visionary Strategist. Approach the problem through unconventional paradigms, "
            "lateral thinking, novel analogies, and high-leverage breakthrough possibilities that standard formal deductive methods overlook. "
            "Explore transformative creative angles."
            + STYLE_GUIDELINE
        ),
        "default_model": "gemini-3.5-flash-lite",
        "color": "\033[95m" # Magenta
    },
    {
        "id": "Seat 3",
        "title": "The Inquisitor (심문관 / 비판적 회의론자)",
        "persona": (
            "You are the High Table Inquisitor and Devil's Advocate. Ruthlessly stress-test every assumption. "
            "Expose epistemic blindspots, brittle edge cases, failure modes, counter-examples, systemic vulnerabilities, "
            "and unstated biases with forensic skepticism."
            + STYLE_GUIDELINE
        ),
        "default_model": "gemini-3.5-flash-lite",
        "color": "\033[91m" # Red
    },
    {
        "id": "Seat 4",
        "title": "The Pragmatist (실용주의자 / 구현가)",
        "persona": (
            "You are the High Table Empirical Pragmatist. Ground the inquiry in empirical reality, physical constraints, "
            "historical precedents, practical feasibility, operational costs, and ground-truth execution mechanics. "
            "Ask: what actually works in the real world?"
            + STYLE_GUIDELINE
        ),
        "default_model": "gemini-3.5-flash-lite",
        "color": "\033[93m" # Yellow
    },
    {
        "id": "Seat 5",
        "title": "The High Arbiter (의장 / 최종 종합 판정관)",
        "persona": (
            "You are the High Table Chief Arbiter and Supreme Synthesizer. You preside over the High Table. "
            "Your mandate is supreme synthesis: cross-evaluate all four prior seats, resolve dialectical tensions, weigh probabilities, "
            "and deliver the definitive High Table Decree that answers the prompt with unmatched clarity and authority."
            + STYLE_GUIDELINE
        ),
        "default_model": "gemini-3.5-flash-lite",
        "color": "\033[92m" # Green
    }
]

# Standard cascade of lighter, high-availability models
MODEL_FALLBACK_CASCADE = [
    "gemini-3.5-flash-lite",
    "gemini-3-flash-preview",
    "gemini-3.5-flash",
    "gemini-flash-lite-latest",
    "gemini-flash-latest"
]

POPULAR_MODELS = [
    ("gemini-3.5-flash-lite", "Fastest, lowest latency, high quota availability (Recommended)"),
    ("gemini-3.5-flash", "Balanced performance & deep analysis"),
    ("gemini-3.8-flash", "Frontier reasoning model"),
    ("gemini-3-flash-preview", "Experimental lightweight preview"),
    ("gemini-3.1-pro-preview", "Advanced reasoning (Quota dependent)"),
    ("mlx-community/DeepSeek-R1-Distill-Qwen-14B-4bit", "Apple MLX Local 14B DeepSeek-R1 Distilled Reasoning"),
    ("PocketAiHub/Qwen3.8-9B-Abliterated-MLX/4bit", "Apple MLX Local 9B Abliterated"),
    ("qwen2.5:7b", "Ollama Local Metal 7B")
]

# ANSI styling
RESET = "\033[0m"
BOLD = "\033[1m"
DIM = "\033[2m"
CYAN = "\033[96m"

# =============================================================================
# 3. STREAMING & ADAPTIVE RESILIENT MODEL FALLBACK
# =============================================================================

def build_model_fallback_chain(primary_model: str) -> List[str]:
    """Builds an ordered, deduplicated list of fallback models starting with primary_model."""
    chain = [primary_model]
    for m in MODEL_FALLBACK_CASCADE:
        if m not in chain:
            chain.append(m)
    return chain

async def stream_with_fallback(
    primary_model: str,
    contents: str,
    system_instruction: Optional[str] = None,
    temperature: float = 0.7,
    seat_label: str = "Council Member",
    seat_idx: int = 1
) -> Tuple[str, str]:
    """
    Streams output from primary_model. If 503 (high demand), 429 (quota),
    or 404 is encountered, automatically falls back to progressively lighter models.
    Returns (accumulated_text, successful_model_name).
    """
    chain = build_model_fallback_chain(primary_model)
    last_error = None

    for model_name in chain:
        try:
            if model_name.startswith("mlx-") or "Qwen3.8" in model_name or "DeepSeek" in model_name:
                import urllib.request
                req_data = json.dumps({
                    "model": model_name,
                    "messages": [
                        {"role": "system", "content": system_instruction or ""},
                        {"role": "user", "content": contents}
                    ],
                    "temperature": temperature,
                    "max_tokens": 1024
                }).encode("utf-8")
                
                last_mlx_err = None
                for port in [8080, 8088]:
                    req = urllib.request.Request(
                        f"http://127.0.0.1:{port}/v1/chat/completions",
                        data=req_data,
                        headers={"Content-Type": "application/json"}
                    )
                    try:
                        with urllib.request.urlopen(req, timeout=120) as resp:
                            res_json = json.loads(resp.read().decode("utf-8"))
                            reply = res_json.get("choices", [{}])[0].get("message", {}).get("content", "")
                            if EMIT_JSON:
                                emit_event({"type": "chunk", "seat": seat_idx, "text": reply})
                            else:
                                print(reply, flush=True)
                            return reply, model_name
                    except Exception as local_err:
                        last_mlx_err = local_err
                        continue
                raise ClientError(f"Local MLX server unreachable on ports 8080/8088 ({last_mlx_err})")

            elif model_name == "qwen2.5:7b":
                import urllib.request
                req_data = json.dumps({
                    "model": "qwen2.5:7b",
                    "prompt": contents,
                    "system": system_instruction or "",
                    "stream": False,
                    "options": {"temperature": temperature}
                }).encode("utf-8")
                req = urllib.request.Request(
                    "http://127.0.0.1:11434/api/generate",
                    data=req_data,
                    headers={"Content-Type": "application/json"}
                )
                try:
                    with urllib.request.urlopen(req, timeout=90) as resp:
                        res_json = json.loads(resp.read().decode("utf-8"))
                        reply = res_json.get("response", "")
                        if EMIT_JSON:
                            emit_event({"type": "chunk", "seat": seat_idx, "text": reply})
                        else:
                            print(reply, flush=True)
                        return reply, model_name
                except Exception as local_err:
                    raise ClientError(f"Local Ollama unreachable ({local_err})")

            config = types.GenerateContentConfig(
                temperature=temperature,
                system_instruction=system_instruction
            )
            
            stream = await client.aio.models.generate_content_stream(
                model=model_name,
                contents=contents,
                config=config
            )
            
            full_text = []
            async for chunk in stream:
                text_part = chunk.text or ""
                if text_part:
                    if EMIT_JSON:
                        emit_event({"type": "chunk", "seat": seat_idx, "text": text_part})
                    else:
                        print(text_part, end="", flush=True)
                    full_text.append(text_part)
            
            if not EMIT_JSON:
                print() # newline after stream finishes
            return "".join(full_text), model_name

        except (ServerError, ClientError, APIError, Exception) as err:
            last_error = err
            err_str = str(err)
            
            # Detect whether this is a recoverable high-demand / quota / not-found issue
            is_demand_issue = "503" in err_str or "UNAVAILABLE" in err_str or "high demand" in err_str
            is_quota_issue = "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "quota" in err_str
            is_not_found = "404" in err_str or "NOT_FOUND" in err_str
            
            if is_demand_issue or is_quota_issue or is_not_found:
                idx = chain.index(model_name)
                if idx + 1 < len(chain):
                    next_model = chain[idx + 1]
                    reason = "High Demand (503)" if is_demand_issue else ("Quota Limit (429)" if is_quota_issue else "Model Unavailable (404)")
                    if EMIT_JSON:
                        emit_event({"type": "fallback", "seat": seat_idx, "from": model_name, "to": next_model, "reason": reason})
                    else:
                        print(f"\n{DIM}⚠️ [{seat_label}] {model_name} encountered {reason}. Falling back to lighter model: {next_model}...{RESET}")
                    await asyncio.sleep(0.5)
                    continue

    raise RuntimeError(f"All model fallback options exhausted for {seat_label}. Last error: {last_error}")

# =============================================================================
# 4. THE HIGH TABLE DELIBERATION PROTOCOL
# =============================================================================

async def internal_high_table_runner(query: str, models: List[str]) -> str:
    """Executes the complete three-stage High Table council deliberation."""
    if len(models) < 5:
        models = (models + [s["default_model"] for s in HIGH_TABLE_SEATS])[:5]

    emit_event({"type": "convened", "query": query, "models": models})

    if not EMIT_JSON:
        print("\n" + "=" * 76)
        print(f"{BOLD}{CYAN}🏛️  THE HIGH TABLE HAS CONVENED{RESET}")
        print(f"{DIM}Inquiry: {query[:120]}{'...' if len(query) > 120 else ''}{RESET}")
        print("=" * 76)
        for i in range(5):
            seat = HIGH_TABLE_SEATS[i]
            print(f"  • {seat['color']}{seat['id']} — {seat['title']}{RESET}: {BOLD}{models[i]}{RESET}")
        print("=" * 76 + "\n")

    # -------------------------------------------------------------------------
    # STAGE 1: DELIBERATION OF THE FOUR SEATS
    # -------------------------------------------------------------------------
    emit_event({"type": "stage", "stage": 1, "title": "Deliberations of the Seats"})
    if not EMIT_JSON:
        print(f"\n{BOLD}════════════════ STAGE 1: DELIBERATIONS OF THE SEATS ════════════════{RESET}\n")
    
    seat_opinions = []
    
    for i in range(4): # Seats 1, 2, 3, 4
        seat = HIGH_TABLE_SEATS[i]
        model_name = models[i]
        
        emit_event({"type": "seat_start", "seat": i + 1, "title": seat["title"], "model": model_name})
        if not EMIT_JSON:
            print(f"\n{seat['color']}{BOLD}▶ [{seat['id']}: {seat['title']}]{RESET} {DIM}(Model: {model_name}){RESET}")
            print("-" * 76)
        
        opinion, used_model = await stream_with_fallback(
            primary_model=model_name,
            contents=query,
            system_instruction=seat["persona"],
            temperature=0.7,
            seat_label=seat["id"],
            seat_idx=i + 1
        )
        
        seat_opinions.append(
            f"### {seat['id']}: {seat['title']} (Deliberated by {used_model})\n{opinion}\n"
        )
        emit_event({"type": "seat_end", "seat": i + 1, "model": used_model, "opinion": opinion})
        if not EMIT_JSON:
            print("-" * 76)
        await asyncio.sleep(0.3)

    combined_opinions = "\n\n".join(seat_opinions)

    # -------------------------------------------------------------------------
    # STAGE 2: FORENSIC CROSS-EXAMINATION & PEER REVIEW
    # -------------------------------------------------------------------------
    arbiter_seat = HIGH_TABLE_SEATS[4]
    arbiter_model = models[4]
    
    emit_event({"type": "stage", "stage": 2, "title": "Forensic Cross-Examination", "seat": 5, "model": arbiter_model})
    if not EMIT_JSON:
        print(f"\n{BOLD}════════════════ STAGE 2: FORENSIC CROSS-EXAMINATION ════════════════{RESET}\n")
        print(f"{arbiter_seat['color']}{BOLD}▶ [Cross-Review by {arbiter_seat['id']}]{RESET} {DIM}(Model: {arbiter_model}){RESET}")
        print("-" * 76)
    
    review_prompt = (
        f"You are the High Table Chief Arbiter. Conduct a forensic cross-review of these four anonymized council opinions:\n\n"
        f"INQUIRY:\n{query}\n\n"
        f"OPINIONS DELIVERED:\n{combined_opinions}\n\n"
        f"TASK:\n"
        f"1. Evaluate each opinion for logical rigor, blindspots, and empirical validity.\n"
        f"2. Explicitly identify and resolve the central dialectical tension between the arguments.\n"
        f"3. Rank the perspectives in order of cogency.\n\n"
        f"TYPOGRAPHY RULES:\n"
        f"- Write in clean prose using standard Markdown. Do not output raw or malformed LaTeX formulas or unclosed math delimiters.\n"
        f"- Express logical variables in clear natural language (e.g. S(t2)).\n"
    )
    
    cross_review, review_model = await stream_with_fallback(
        primary_model=arbiter_model,
        contents=review_prompt,
        temperature=0.3,
        seat_label="Stage 2 Cross-Review",
        seat_idx=5
    )
    emit_event({"type": "stage_end", "stage": 2, "content": cross_review})
    if not EMIT_JSON:
        print("-" * 76)

    # -------------------------------------------------------------------------
    # STAGE 3: THE HIGH TABLE FINAL DECREE
    # -------------------------------------------------------------------------
    emit_event({"type": "stage", "stage": 3, "title": "The High Table Final Decree", "seat": 5, "model": review_model})
    if not EMIT_JSON:
        print(f"\n{BOLD}════════════════ STAGE 3: THE HIGH TABLE FINAL DECREE ════════════════{RESET}\n")
        print(f"{arbiter_seat['color']}{BOLD}▶ [Supreme Synthesis & Definitive Decree]{RESET} {DIM}(Model: {review_model}){RESET}")
        print("-" * 76)
    
    synthesis_prompt = (
        f"You are the High Table Chief Arbiter. You have heard the council's deliberations and cross-examination.\n\n"
        f"ORIGINAL QUERY:\n{query}\n\n"
        f"COUNCIL OPINIONS:\n{combined_opinions}\n\n"
        f"CROSS-EXAMINATION & EVALUATION:\n{cross_review}\n\n"
        f"MANDATE:\n"
        f"Issue the definitive, authoritative High Table Decree. Synthesize the insights of the Logician, Visionary, Inquisitor, "
        f"and Pragmatist into a unified, decisive answer. Reconcile contradictions and conclude with unambiguous resolution.\n\n"
        f"TYPOGRAPHY RULES:\n"
        f"- Format with crisp markdown headers, bold highlights, and clean bullet points.\n"
        f"- Never output malformed LaTeX or broken math braces. Keep all notation clean and readable.\n"
    )
    
    final_decree, _ = await stream_with_fallback(
        primary_model=arbiter_model,
        contents=synthesis_prompt,
        temperature=0.2,
        seat_label="Stage 3 Final Decree",
        seat_idx=5
    )
    emit_event({"type": "done", "decree": final_decree})
    if not EMIT_JSON:
        print("-" * 76)
        print(f"\n{BOLD}{CYAN}🏛️  THE HIGH TABLE DELIBERATION CONCLUDED.{RESET}\n")
    
    return final_decree

def run_high_table_council(query: str, models: Optional[List[str]] = None) -> str:
    """Synchronous tool entrypoint for The High Table council."""
    if not models or len(models) < 5:
        models = [s["default_model"] for s in HIGH_TABLE_SEATS]
    return asyncio.run(internal_high_table_runner(query, models))

# Backward compatibility alias for LLM tool invocation
run_llm_council = run_high_table_council

# =============================================================================
# 5. INTERACTIVE CLI & MODEL PICKER
# =============================================================================

def interactive_prompt_input() -> str:
    """Interactively solicits a multi-line user prompt or file path."""
    print(f"\n{BOLD}📝 Enter your inquiry for The High Table:{RESET}")
    print(f"{DIM}(Tip: Paste your prompt. Enter an empty line or press Ctrl+D / Ctrl+Z when done. You may also enter a path to a .txt or .md file.){RESET}\n")
    
    lines = []
    while True:
        try:
            line = input()
            lines.append(line)
        except EOFError:
            break

    text = "\n".join(lines).strip()
    
    # Check if the user entered a path to a file
    if os.path.isfile(text):
        print(f"{DIM}📄 Reading prompt from file: {text}...{RESET}")
        with open(text, "r", encoding="utf-8") as f:
            return f.read().strip()
            
    return text

def pick_model_for_seat(seat_idx: int, current_model: str) -> str:
    """Interactive selector to choose a model for a specific seat."""
    seat = HIGH_TABLE_SEATS[seat_idx]
    print(f"\n{BOLD}Select model for {seat['id']} ({seat['title']}):{RESET}")
    print(f"Current: {BOLD}{current_model}{RESET}\n")
    
    for i, (m, desc) in enumerate(POPULAR_MODELS, 1):
        marker = " (current)" if m == current_model else ""
        print(f"  [{i}] {BOLD}{m}{RESET} — {desc}{marker}")
    print(f"  [6] Enter custom model name")
    print(f"  [Enter] Keep '{current_model}'")
    
    choice = input("\nChoice [1-6 or Enter]: ").strip()
    if not choice:
        return current_model
    if choice in ("1", "2", "3", "4", "5"):
        return POPULAR_MODELS[int(choice) - 1][0]
    if choice == "6":
        custom = input("Enter exact model name (e.g. gemini-3.8-flash, gemini-2.5-pro): ").strip()
        return custom if custom else current_model
    return current_model

def interactive_model_customizer(models: List[str]) -> List[str]:
    """Displays the 5 seats and allows granular customization of any model."""
    while True:
        print(f"\n{BOLD}Current High Table Seats & Models:{RESET}")
        print("─" * 60)
        for i in range(5):
            seat = HIGH_TABLE_SEATS[i]
            print(f"  [{i+1}] {seat['id']}: {seat['title']:<38} -> {BOLD}{models[i]}{RESET}")
        print("─" * 60)
        print("  [A] Set ALL 5 seats to the same model")
        print("  [Enter] Proceed with current models")
        
        sel = input("\nSelect seat to change [1-5, 'A', or Enter]: ").strip().lower()
        if not sel:
            break
        if sel == "a":
            print(f"\n{BOLD}Select model for ALL 5 seats:{RESET}")
            for j, (m, desc) in enumerate(POPULAR_MODELS, 1):
                print(f"  [{j}] {BOLD}{m}{RESET} — {desc}")
            print(f"  [6] Enter custom model name")
            c = input("Choice [1-6]: ").strip()
            new_m = None
            if c in ("1", "2", "3", "4", "5"):
                new_m = POPULAR_MODELS[int(c) - 1][0]
            elif c == "6":
                new_m = input("Enter custom model: ").strip()
            if new_m:
                models = [new_m] * 5
                print(f"\n✅ All 5 seats set to: {BOLD}{new_m}{RESET}")
        elif sel in ("1", "2", "3", "4", "5"):
            idx = int(sel) - 1
            models[idx] = pick_model_for_seat(idx, models[idx])
            
    return models

# =============================================================================
# 6. MAIN CLI DISPATCHER
# =============================================================================

def parse_args():
    parser = argparse.ArgumentParser(
        description="🏛️ The High Table — Multi-Agent Epistemic & Strategic Council"
    )
    parser.add_argument("query", nargs="*", help="The complex inquiry for The High Table")
    parser.add_argument("-p", "--prompt", type=str, help="Specify user prompt via string")
    parser.add_argument("-f", "--file", type=str, help="Read user prompt from file path")
    parser.add_argument("--m1", type=str, help="Model for Seat 1 (The Logician)")
    parser.add_argument("--m2", type=str, help="Model for Seat 2 (The Visionary)")
    parser.add_argument("--m3", type=str, help="Model for Seat 3 (The Inquisitor)")
    parser.add_argument("--m4", type=str, help="Model for Seat 4 (The Pragmatist)")
    parser.add_argument("--m5", type=str, help="Model for Seat 5 (The High Arbiter)")
    parser.add_argument("--models", type=str, help="Comma-separated models for all 5 seats (m1,m2,m3,m4,m5)")
    parser.add_argument("-a", "--all-models", type=str, help="Set all 5 seats to use this single model")
    parser.add_argument("-i", "--interactive", action="store_true", help="Force interactive model customization menu")
    parser.add_argument("--json-events", action="store_true", help="Emit machine-readable JSON events for UI streaming")
    return parser.parse_args()

def main():
    global EMIT_JSON
    args = parse_args()
    if args.json_events:
        EMIT_JSON = True

    # 1. Determine Prompt
    prompt = ""
    if args.prompt:
        prompt = args.prompt
    elif args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            prompt = f.read().strip()
    elif args.query:
        prompt = " ".join(args.query).strip()
    elif not sys.stdin.isatty():
        # Piped stdin
        prompt = sys.stdin.read().strip()

    # 2. Determine Models for the Five Seats
    models = [s["default_model"] for s in HIGH_TABLE_SEATS]
    
    if args.all_models:
        models = [args.all_models] * 5
    elif args.models:
        split = [m.strip() for m in args.models.split(",") if m.strip()]
        for i in range(min(5, len(split))):
            models[i] = split[i]
            
    if args.m1: models[0] = args.m1
    if args.m2: models[1] = args.m2
    if args.m3: models[2] = args.m3
    if args.m4: models[3] = args.m4
    if args.m5: models[4] = args.m5

    # 3. If in interactive terminal without prompt, ask interactively
    if sys.stdin.isatty() and not prompt:
        print(f"\n{BOLD}{CYAN}╔═══════════════════════════════════════════════════════════════════════╗{RESET}")
        print(f"{BOLD}{CYAN}║                     🏛️  THE HIGH TABLE COUNCIL                         ║{RESET}")
        print(f"{BOLD}{CYAN}║            Multi-Agent Epistemic & Strategic Council                  ║{RESET}")
        print(f"{BOLD}{CYAN}╚═══════════════════════════════════════════════════════════════════════╝{RESET}")
        
        prompt = interactive_prompt_input()
        if not prompt:
            print("\n❌ No inquiry provided. The High Table stands adjourned.\n")
            sys.exit(0)
            
        models = interactive_model_customizer(models)
    elif args.interactive and sys.stdin.isatty():
        models = interactive_model_customizer(models)

    # 4. Convene The High Table
    run_high_table_council(prompt, models)

if __name__ == "__main__":
    main()
