<div align="center">

# 🌌 AETHER
### *The Sovereign HyperOffice & Intelligence Platform*

**Unified Office Engine • Multi-Tab Tor Browser • Airgapped Local AI • Zero-Knowledge Vault • Anti-DPI VPN • Autonomous Agent**

[![GitLab CI/CD](https://img.shields.io/badge/GitLab_CI%2FCD-278%2F278_Passing-10b981?style=for-the-badge&logo=gitlab)](https://gitlab.com/jk9576/aether)
[![Version](https://img.shields.io/badge/Release-v0.0.1_Stable-6366f1?style=for-the-badge)](https://gitlab.com/jk9576/aether/-/releases)
[![Security](https://img.shields.io/badge/Security-AES--256--GCM_%7C_Tor_Native-f43f5e?style=for-the-badge&logo=torproject)](https://gitlab.com/jk9576/aether)
[![Hardware](https://img.shields.io/badge/Accelerated-Apple_Silicon_M4_%7C_ANE-0ea5e9?style=for-the-badge&logo=apple)](https://gitlab.com/jk9576/aether)
[![Tests](https://img.shields.io/badge/Test_Suite-278_Tests_%7C_100%25_Green-3b82f6?style=for-the-badge)](https://gitlab.com/jk9576/aether)
[![License](https://img.shields.io/badge/License-Apache_2.0-8b5cf6?style=for-the-badge)](LICENSE.txt)

<br/>

> *"Stop leasing your digital sovereignty to the cloud. Aether unifies full-spectrum office productivity, airgapped neural intelligence, and zero-trust privacy into a single, cohesive desktop powerhouse."*

</div>

---

## ⚡ What is Aether?

**Aether**는 단순한 오피스 스위트가 아닙니다.  
클라우드 빅테크의 데이터 수집, ISP 검열, 폐쇄형 SaaS 의존에서 완전히 벗어나기 위해 설계된 **차세대 주권형 데스크톱 하이퍼 플랫폼(Sovereign HyperOffice & Intelligence Workspace)**입니다.

북유럽 신화의 세계수를 모티브로 설계된 **핵심 서브시스템**들이 유기적으로 결합되어, 워드/엑셀/파워포인트/한글(HWP) 등 8대 오피스 문서 편집부터 다중 탭 Tor 브라우징, Apple Silicon M4 기반 오프라인 로컬 LLM, 패킷 분할 안티 DPI VPN, 영지식 암호화 금고, 양방향 지식 그래프, 자율 개발 에이전트까지 단 하나의 통합 앱에서 무결하게 실행됩니다.

```
                              ┌─────────────────────────────────────────┐
                              │            🌌 AETHER CORE               │
                              │   Headless Document Engine & MCP Host   │
                              └────────────────────┬────────────────────┘
                                                   │
         ┌────────────────────────┬────────────────┼────────────────────────┬────────────────────────┐
         │                        │                │                        │                        │
         ▼                        ▼                ▼                        ▼                        ▼
 🌐 AETHERUM              📜 YGGDRASIL      🛡️ SLEIPNIR              🧠 MÍMISBRUNNR           🐉 FAFNIR
 Multi-Tab Privacy        Interactive PTY   Anti-DPI HTTPS SNI       Airgapped Local AI       Zero-Knowledge AES-GCM
 & Tor Onion Browser      Native Terminal   Packet Splitting Proxy   Apple Silicon M4 LLM     Encrypted Safe Vault
         │                        │                │                        │                        │
         └────────────────────────┼────────────────┼────────────────────────┴────────────────────────┘
                                  │                │
                  ┌───────────────┴────────┐       └────────────────┐
                  ▼                        ▼                        ▼
           🗝️ NIBELUNGEN            🐿️ RATATOSKR             🎙️ HEIMDALL
           Local Knowledge Graph    Visual API Client        Acoustic Diarization
           & Obsidian-style Canvas  & Live SQLite Inspector  & Token Telemetry
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
 🤖 AUTONOMOUS AGENT      🏛️ THE HIGH TABLE        💼 8-MODULE HYPEROFFICE
 Sandboxed Workspace      5-Seat AI Council        Docs • Sheets • Slides • PDF •
 Runner & Guards          Forensic Synthesis & UI  Markdown • HTML • Mindmap • HWP
```

---

## 🏛️ The Core Subsystems

### 1. 🌐 Aetherum — Privacy-Hardened Multi-Tab Tor Browser
> *“No trackers. No fingerprints. Pure uncompromised web freedom.”*

* **Native Multi-Layer Adblock & Tracker Shield**:
  * 네트워크 레벨 광고/트래커/팝업 실시간 차단 (글로벌 애드테크 + 네이버·다음·카카오 등 국내 광고 서버 KR-Shield 내장).
  * EasyList CSS 기반 빈 광고 슬롯 엘리먼트 자동 숨김.
  * 유튜브 프리롤 광고 자동 스킵 및 `utm_*`, `fbclid`, `gclid` 추적 파라미터 자동 정제.
  * 브라우저 툴바 내 전용 방패 토글 버튼(`adblockToggle`) 및 실시간 차단 수/화이트리스트 제어 드롭다운 탑재.
  * 전용 설정 허브(`aetherum://adblock` / [adblock.html](file:///Users/sushikim/Desktop/app_source/out/renderer/adblock.html))에서 사용자 커스텀 필터 규칙 실시간 추가/삭제.
* **Native Multi-Tab Workspace**: Chrome 스타일의 직관적인 다중 탭 인터페이스(`⌘T`, `⌘W`, `⌘1`~`⌘9`). 각 탭별 독립 뷰포트 상태 보존.
* **Onion Routing SOCKS5**: 토르 데몬(포트 9050) 연동을 통한 `.onion` 히든 서비스 및 다크웹 보안 브라우징. 원클릭 토르 토글 지원.
* **Flawless Redirection & OAuth**: Chromium 131 순정 헤더 및 `sec-ch-ua` 클라이언트 힌트 적용으로 Proton Mail, Google, Microsoft 365, Turnstile 등 까다로운 로그인/리디렉션 완벽 호환.
* **AI Page Intelligence**: 원클릭 웹페이지 3줄 요약 & 핵심 분석 사이드 드로어 내장.
* **One-Click Word Export**: 현재 웹페이지의 본문을 정제하여 즉시 `.docx` 또는 `.md` 문서로 로컬 저장.

### 2. 📜 Yggdrasil — Hyper-Integrated Developer Terminal
> *“The command center connecting the machine to the cosmos.”*

* **Real PTY Interactive Shell**: macOS `zsh` 및 리눅스 `bash` 기반 네이티브 가상 터미널. ANSI 풀컬러 렌더링 및 인터랙티브 CLI 완벽 구동.
* **Nordic Preset Bar**: Tor 상태 진단, Homebrew 환경 점검, Ollama 로컬 모델 목록, `aether --help` 등 빈번한 작업을 원클릭 실행.
* **Cross-Frame Session Resilience**: 백그라운드 PTY 세션 자동 복구 및 실시간 리사이징 지원.

### 3. 🛡️ Sleipnir — Anti-DPI HTTPS SNI Splitting Engine
> *“Galloping through firewalls and Deep Packet Inspection without a trace.”*

* **SNI Packet Fragmentation**: 차단 장비(SNI 감청/검열)를 무력화하기 위해 TLS ClientHello 패킷의 도메인 헤더를 2바이트 단위로 미세 분할 전송.
* **Zero Speed Penalty**: VPN처럼 제3자 서버를 거치지 않고 로컬 프록시(포트 8087)에서 패킷 구조만 변조하므로 회선 최고 속도 100% 유지.
* **Fail-Safe Socket Recovery**: 빠른 연타 토글 시에도 포트 충돌 없이 우아하게 소켓 자원을 반환하는 복원력 아키텍처.

### 4. 🧠 Mímisbrunnr — Airgapped Sovereign AI Assistant
> *“Your private intellect running directly on Apple Silicon M4 unified memory.”*

* **100% Airgapped Privacy**: 단 하나의 프롬프트나 토큰도 외부 서버로 유출되지 않는 완전한 오프라인 신경망 인텔리전스.
* **Strict 2-Model Whitelist (전용 2대 주권 모델)**:
  1. `PocketAiHub/Qwen3.8-9B-Abliterated-MLX/4bit` — Apple MLX 네이티브 4-bit 직교 가중치 거절 제거(Abliterated) 9B 고속 모델 (`5.57 GiB`, `http://127.0.0.1:8088`)
  2. `qwen2.5:7b` — 고속 Apple Metal 기반 Ollama 7B 엔진 (`4.7 GB`, `http://127.0.0.1:11434`)
* **Apple Silicon M4 Hardware & VRAM Guard**: 16GB 통합 메모리(Unified Memory) 내 스왑 방지를 위해 두 모델 전환 시 비활성 엔진의 VRAM을 즉시 자동 반환(`gc.collect()` + `mx.clear_cache()` / Ollama `keep_alive: 0`).
* **Multi-Task Neural Presets**:
  * ⚡ *Full Control*: 검열 및 인위적 거부 프로토콜 없는 자유 질의
  * 🛡️ *Yggdrasil Script Audit*: 셸 스크립트 및 런처 내 파괴적 명령어(`rm -rf /`, 신뢰할 수 없는 curl 파이프) 사전 감사
  * ✉️ *ProtonMail Thread Digest*: 암호화된 메일 본문 핵심 요약
  * 💻 *Secure Code Synthesizer*: 프라이버시 중심의 안전한 코드 생성

### 5. 🐉 Fafnir Vault — Zero-Knowledge AES-256 Safe
> *“A dragon's hoard guarded by military-grade authenticated cryptography.”*

* **Authenticated Encryption**: `AES-256-GCM` 알고리즘과 `PBKDF2` (100,000 iterations, SHA-256 Salt, 32-byte Key) 기반 군사 등급 영지식 보안.
* **Encrypted Storage (`~/.aether/fafnir_vault`)**: 메타데이터, 원본 파일명, 무결성 태그(Auth Tag)까지 암호문과 함께 단일 `.fafnir` 바이너리 컨테이너로 패키징.
* **Tamper & Bit-Flip Resistance**: 암호문 또는 인증 태그의 1비트 변조도 감지하여 즉시 복호화를 차단하는 무결성 보장.
* **Direct-to-Desktop Decryption**: 메모리 상에서 복호화 후 사용자의 바탕화면으로 즉시 추출. 임시 평문 잔재 영구 제거.

### 6. 🗝️ Nibelungen — Local-First Knowledge Graph & Wiki
> *“Interweave your thoughts in a resilient, bidirectional second brain.”*

* **Bidirectional Wikilinks**: `[[노트 제목]]` 문법을 통한 실시간 양방향 지식 네트워크 링크.
* **Obsidian-Style Interactive Canvas**: SVG 기반 역동적 힘 지향(Force-Directed) 지식 그래프 시각화. 노드 드래그, 링크 탐색, 줌/팬 지원.
* **Markdown Native (`~/.aether/nibelungen`)**: 독점 바이너리 포맷이 아닌 표준 `.md` / `.json` 파일 기반 로컬 동기화 및 즉시 검색.

### 7. 🐿️ Ratatoskr — Visual API Client & SQLite Inspector
> *“The agile messenger traversing networks and relational databases.”*

* **Tor-Tunneled HTTP Client**: SOCKS5 프록시를 경유하여 API 요청을 전송하는 IP 유출 방지 보안 API 디버깅 도구.
* **Cloudflare DoH Presets**: 보안 DNS(`1.1.1.1`) 질의 응답 감사 내장.
* **Live SQLite Database Studio**: 데이터베이스 테이블 스키마 자동 탐색, 파라미터화된 안전한 인라인 SQL 쿼리 러너, 데이터 그리드 뷰어.

### 8. 🎙️ Heimdall — Acoustic Biometric Diarization & Audio Summarizer
> *“The all-hearing guardian capturing voices, separating speakers, and distilling clarity.”*

* **Real-Time Acoustic DSP & 3 Visualizers**: 60fps Canvas 기반 `Jarvis Wave`, `Siri Hologram`, `Cyber Spectrum` 실시간 음향 시각화 및 F0 피치 성문 추적.
* **Biometric Speaker Diarization**: 화자별 음향 피치 학습 자동 분리(`화자 1`, `화자 2`, `화자 3`) 및 비조화 충격 소음 자동 배제.
* **Gemini Flash-Lite & Smart Local Summarizer**: 클라우드 API 및 오프라인 로컬 요약 이중화, 실시간 소모 토큰 및 잔여 토큰 백분율(`% Left`, 1,048,576 Token Budget) 정밀 텔레메트리.

### 9. 💼 8-Module Sovereign Office Suite
> *“Word, Excel, PowerPoint, PDF, Markdown, HTML, Mindmap, and HWP — in one unified suite.”*

* **8개 전용 오피스 모듈 완비**:
  * 📝 **Docs**: 실시간 협업, 서식 편집, `.docx` 완벽 호환
  * 📊 **Sheets**: 고성능 셀 수식 연산, 차트 렌더링, `.xlsx` 완벽 호환
  * 📽️ **Slides**: 프레젠테이션 디자인, 발표자 모드, `.pptx` 완벽 호환
  * 📑 **PDF**: 고속 PDF 주석, 폼 작성, 페이지 추출
  * ✍️ **Markdown**: 실시간 분할 프리뷰 마크다운 편집기
  * 🌐 **HTML Preview**: 라이브 웹 코드 샌드박스 렌더러
  * 🧠 **Mindmap**: 생각 정리 및 지식 브레인스토밍 마인드맵
  * 🇰🇷 **HWP**: 한글 문서 뷰어 및 호환 편집 엔진
* **Seamless AI Cascading**: 클라우드 Gemini(`gemini-2.5-flash-lite` / `gemini-2.5-flash`)부터 Mímisbrunnr 로컬 오프라인 엔진(`PocketAiHub/Qwen3.8-9B-Abliterated-MLX/4bit`, `qwen2.5:7b`)까지 끊김 없는 폴백 연동.

### 10. 🤖 Aether Autonomous Agent & Ask AI RAG
> *“Sovereign autonomous coding agent and context-aware knowledge retrieval.”*

* **Aether Autonomous Agent**: 로컬 프로젝트 폴더를 대상으로 파일 읽기/쓰기, 셸 명령 실행, 변경 사항 분석을 자율 수행하는 독립 에이전트. 루트(`/`) 및 홈(`~`) 디렉토리 보호 가드 및 권한 모드(`ask-commands`, `ask-writes`) 탑재.
* **Ask AI (AI 질문 RAG)**: 사용자가 즐겨찾기(Star)한 문서 기반의 정밀 지식 인출 증강 생성(RAG). 지식 베이스가 비어 있을 때도 일반 질의로 자동 전환되어 중단 없는 대화 보장.

### 11. 🏛️ The High Table — Multi-Agent Council & Supreme Synthesis
> *“Five sovereign intellects in dialectical cross-examination, delivering one definitive supreme decree.”*

* **First-Class UI & Model Dropdown Selectors (`aetherum://high-table` / `⌘⇧C`)**:
  * 복잡한 CLI 명령 없이 Aether 네이티브 탭 인터페이스에서 직관적으로 프롬프트 입력 및 실시간 심의 관전.
  * 5개 좌석마다 개별 신경망 모델 드롭다운(`<select>`) 탑재: 클라우드 Gemini(`gemini-3.5-flash-lite`, `gemini-3.5-flash`, `gemini-3.8-flash`, `gemini-3-flash-preview`, `gemini-3.1-pro-preview`)와 오프라인 에어갭 로컬 모델(`PocketAiHub/Qwen3.8-9B-Abliterated-MLX/4bit`, `qwen2.5:7b`)을 좌석별로 자유롭게 배정.
* **The Five Distinct Council Seats (5대 최고 평의회 좌석)**:
  1. 📐 **Seat 1: The Logician (논리학자 / 분석가)**: 형식 연역 논리, 전제 명시화, 구조적 타당성 및 엄밀성 검증.
  2. 🔮 **Seat 2: The Visionary (창의적 전략가 / 발상가)**: 수평적 사고, 비통상적 가설, 혁신적 패러다임 및 새로운 유추 탐색.
  3. ⚔️ **Seat 3: The Inquisitor (심문관 / 비판적 회의론자)**: 악마의 대변인, 가정 스트레스 테스트, 실패 모드, 반례 및 암묵적 편향 폭로.
  4. 🛠️ **Seat 4: The Pragmatist (실용주의자 / 구현가)**: 경험적 제약, 운영 현실성, 지상 실현 가능성 및 역사적 전례 적용.
  5. 👑 **Seat 5: The High Arbiter (의장 / 최종 종합 판정관)**: 4개 의견의 법의학적 상호 대질, 이율배반 해결 및 최종 최고 훈령(Decree) 선포.
* **Rigorous 3-Stage Deliberation Architecture (3단계 심의 파이프라인)**:
  * **Stage 1 (Individual Preliminary Theses)**: 4개 좌석이 독립적으로 초기 관점 및 제1원칙 논증 전개.
  * **Stage 2 (Forensic Cross-Review & Antinomy Critique)**: 서로의 논거를 교차 비판하고 변증법적 충돌과 취약점 분석.
  * **Stage 3 (The Supreme Decree)**: 의장(High Arbiter)이 모든 갈등을 해소하고 실행 가능한 명확한 최종 결론을 양피지 카드에 종합 선언.
* **Adaptive Resilience Fallback (자동 부하/쿼터 복구 엔진)**:
  * 특정 모델이 피크 타임 `503 UNAVAILABLE` (High Demand) 또는 무료 티어 `429 RESOURCE_EXHAUSTED` (Rate Limit) 에러를 반환할 경우, 중단 없이 즉시 상위 가용 경량 모델(`gemini-3.5-flash-lite`, `gemini-3-flash-preview`)로 자동 폴백.
  * UI 상단 경고 토스트(`fallbackBanner`)를 통해 실시간 모델 변경 내역을 사용자에게 즉각 시각적 안내.
* **Instant Presets & Export Actions**:
  * ⚡ *All Flash-Lite* (초고속 저지연), ⚖️ *Balanced* (속도-추론 균형), 🧠 *Deep Synthesis* (프론티어 심층 분석), 🛡️ *Airgapped Local* (완전 오프라인 로컬).
  * 원클릭 최고 훈령 클립보드 복사(`📋 Copy Decree`) 및 마크다운 회의록 전문 내보내기(`💾 Export Transcript`).

---

## 💻 Aether CLI (`aether`) — Headless Document Engine

```sh
# 전체 사용법 안내
aether --help

# 엑셀/스프레드시트 읽기 및 수정
aether sheet read report.xlsx

# 파워포인트 슬라이드 AI 검사 및 재생성
aether slides audit deck.pptx

# 마이크로소프트 워드 문서 생성 및 변환
aether convert input.md output.docx

# Model Context Protocol (MCP) 서버 구동 (Claude Code, Codex, Cursor 연동)
aether mcp install all
```

---

## 🚀 Quick Start

### 1. 다운로드 및 실행 (macOS)
```sh
# 최신 릴리스 패키지 실행
open /Applications/Aether.app
# 또는 바탕화면 실행
open /Users/$USER/Desktop/Aether.app
```

### 2. CLI 전역 환경변수 등록
```sh
aether install-cli
# 또는 심볼릭 링크 수동 등록
ln -sf /Applications/Aether.app/Contents/Resources/cli/aether ~/.local/bin/aether
```

### 3. 전체 테스트 스위트 실행
```sh
npm test
```

---

## 🧪 Comprehensive 278-Point Master Verification Suite

Aether는 기능 누락, 모델 타임아웃, IPC 충돌, UI 프리컨디션 버그를 원천 방지하기 위해 **15개 서브시스템, 총 278개 단일 assertion 테스트**로 구성된 마스터 테스트 스위트를 구동합니다.

```sh
$ npm test

==================================================================
🧪 [Aether Comprehensive 278-Point Master Verification Suite]
   Testing every single nook, cranny, button, edge case, and tool
==================================================================

📦 Suite 1: System Manifests, File System & Nordic Purity (Tests 1–15)
  ✅ PASS: [#001] package.json product name is strictly 'Aether'
  ✅ PASS: [#002] package.json package name is strictly 'aether'
  ✅ PASS: [#003] package.json version matches '0.0.1'
  ✅ PASS: [#004] version.json product name is strictly 'Aether'
  ✅ PASS: [#005] version.json repository URL points to gitlab.com/jk9576/aether
  ✅ PASS: [#006] Local .env file exists and defines GEMINI_API_KEY
  ✅ PASS: [#007] Local .env file defines DEFAULT_MODEL as gemini-3.5-flash-lite
  ✅ PASS: [#008] Home fallback ~/.aether/.env exists and is synchronized
  ✅ PASS: [#009] Zero forbidden legacy terms in package.json & version.json
  ✅ PASS: [#010] Zero forbidden legacy terms across all 9 HTML views
  ✅ PASS: [#011] Zero forbidden legacy terms across all extension scripts
  ✅ PASS: [#012] Unicorn logo branding asset exists and has valid PNG magic bytes
  ✅ PASS: [#013] CLI launcher script exists and is executable
  ✅ PASS: [#014] Platform check verifies macOS (darwin)
  ✅ PASS: [#015] Unicode path safety: creates and reads files with Korean / CJK characters

🔐 Suite 2: Fafnir Vault Cryptography & Edge Cases (Tests 16–35)
  ✅ PASS: [#016] AES-256-GCM encryption generates valid buffer with salt, IV, tag, and ciphertext
  ✅ PASS: [#017] AES-256-GCM decryption restores exact original plaintext
  ✅ PASS: [#018] Decryption metadata accurately recovers original filename
  ✅ PASS: [#019] Decryption metadata indicates 'AES-256-GCM' cipher
  ✅ PASS: [#020] Decryption throws authentication error on incorrect passphrase
  ✅ PASS: [#021] Decryption throws authentication error on bit-flipped ciphertext payload
  ✅ PASS: [#022] Decryption throws authentication error on bit-flipped auth tag
  ✅ PASS: [#023] Zero-byte empty buffer encrypts and decrypts cleanly to 0 bytes
  ✅ PASS: [#024] Large 128KB buffer stress test encrypts and decrypts with byte-for-byte fidelity
  ✅ PASS: [#025] Unique salt and IV generation: encrypting identical plaintext produces distinct ciphertexts
  ✅ PASS: [#026] Korean Hangul filename metadata preservation in vault format
  ✅ PASS: [#027] Special symbols and spaces in filename metadata preservation
  ✅ PASS: [#028] File-to-vault encryption pipeline writes .fafnir file to vault directory
  ✅ PASS: [#029] Vault-to-file decryption pipeline restores file to destination directory
  ✅ PASS: [#030] File encryption gracefully throws on non-existent file path
  ✅ PASS: [#031] Vault file listing returns an array of vault items
  ✅ PASS: [#032] Vault listing items contain id, filename, size, and cipher properties
  ✅ PASS: [#033] PBKDF2 key derivation length enforces 32 bytes for AES-256
  ✅ PASS: [#034] Empty passphrase handling: encryptBuffer operates with empty string
  ✅ PASS: [#035] registerFafnirIpc export exists as a function

🧠 Suite 3: Mímisbrunnr Sovereign AI & Airgapped Logic (Tests 36–55)
  ✅ PASS: [#036] Strict 2-model whitelist: ALLOWED_MODEL_IDS has length exactly 2
  ✅ PASS: [#037] Strict 2-model whitelist: Model 1 is PocketAiHub/Qwen3.8-9B-Abliterated-MLX/4bit
  ✅ PASS: [#038] Strict 2-model whitelist: Model 2 is qwen2.5:7b
  ✅ PASS: [#039] Zero unabliterated or 27B models in Mímisbrunnr whitelist
  ✅ PASS: [#040] MODEL_MLX_9B constant matches PocketAiHub/Qwen3.8-9B-Abliterated-MLX/4bit
  ✅ PASS: [#041] MODEL_QWEN_7B constant matches qwen2.5:7b
  ✅ PASS: [#042] normalizeMimisbrunnrModel correctly maps 'mlx' alias to MODEL_MLX_9B
  ✅ PASS: [#043] normalizeMimisbrunnrModel correctly maps 'ollama' alias to MODEL_QWEN_7B
  ✅ PASS: [#044] normalizeMimisbrunnrModel correctly maps 'qwen' alias to MODEL_QWEN_7B
  ✅ PASS: [#045] getHardwareInfo reports Apple Silicon chip and architecture
  ✅ PASS: [#046] getHardwareInfo reports Apple Silicon chip and architecture specs
  ✅ PASS: [#047] checkLocalLlm reports privacyMode as 'airgapped'
  ✅ PASS: [#048] checkLocalLlm returns models list with strictly 2 sovereign models
  ✅ PASS: [#049] Offline script debugger approves benign build commands
  ✅ PASS: [#050] Offline script debugger detects 'rm -rf /' destruction attempt
  ✅ PASS: [#051] Offline script debugger detects untrusted curl execution pipe
  ✅ PASS: [#052] Offline email summarizer extracts sender, subject, and core body
  ✅ PASS: [#053] Offline email summarizer handles emails without subject headers
  ✅ PASS: [#054] Offline knowledge responder addresses Apple Intelligence queries accurately
  ✅ PASS: [#055] executeMimisbrunnrChat fallback executes cleanly

🛡️ Suite 4: Sleipnir Stealth SNI & Network Bypass (Tests 56–70)
  ✅ PASS: [#056] TLS ClientHello packet splitting function splits host SNI across packets
  ✅ PASS: [#057] TLS packet splitter splits hostname into 2-byte initial chunk
  ✅ PASS: [#058] Packet splitter handles short single-segment packets gracefully
  ✅ PASS: [#059] Packet splitter processes empty buffer safely without throwing
  ✅ PASS: [#060] Proxy configuration default port is 8087
  ✅ PASS: [#061] Proxy target bypass rules include standard web ports 80 and 443
  ✅ PASS: [#062] Tor proxy fallback target resolves to 127.0.0.1:9050
  ✅ PASS: [#063] DoH provider defaults to Cloudflare 1.1.1.1
  ✅ PASS: [#064] Sleipnir proxy active status tracking variable behaves as boolean
  ✅ PASS: [#065] Synthetic packet delay injection simulation computes latency offset
  ✅ PASS: [#066] Sleipnir TCP proxy server starts and binds to loopback interface
  ✅ PASS: [#067] Sleipnir TCP proxy accepts and terminates client socket connections
  ✅ PASS: [#068] Sleipnir TCP proxy shuts down gracefully and unbinds port
  ✅ PASS: [#069] Repeated start/stop cycle does not leak ports (EADDRINUSE resilience)
  ✅ PASS: [#070] registerSleipnirIpc export exists as a function

🐿️ Suite 5: Ratatoskr Network Client & SQLite Inspector (Tests 71–90)
  ✅ PASS: [#071] Ratatoskr HTTPS API request to Cloudflare 1.1.1.1 succeeds
  ✅ PASS: [#072] Ratatoskr HTTPS response contains JSON data
  ✅ PASS: [#073] Ratatoskr Tor SOCKS5 fallback routes through local Tor proxy
  ✅ PASS: [#074] Ratatoskr gracefully fails on invalid protocol URL
  ✅ PASS: [#075] Ratatoskr gracefully fails on malformed URL string
  ✅ PASS: [#076] SQLite temp database creation (CREATE TABLE)
  ✅ PASS: [#077] SQLite single row insertion (INSERT INTO)
  ✅ PASS: [#078] SQLite row query (SELECT) returns inserted row data
  ✅ PASS: [#079] SQLite schema inspection: listSqliteTables discovers 'users' table
  ✅ PASS: [#080] SQLite schema inspection: table row count matches 1
  ✅ PASS: [#081] SQLite syntax error trapping returns error message without throw
  ✅ PASS: [#082] SQLite non-existent table query returns clean error object
  ✅ PASS: [#083] SQLite parameterized query prevents SQL injection
  ✅ PASS: [#084] SQLite batch insertion of multiple records
  ✅ PASS: [#085] SQLite table DROP operation succeeds
  ✅ PASS: [#086] Ratatoskr API request timeout aborts hung network requests
  ✅ PASS: [#087] Ratatoskr POST request transmits JSON payload successfully
  ✅ PASS: [#088] Ratatoskr custom request headers are delivered intact
  ✅ PASS: [#089] Ratatoskr response time latency calculation is greater than 0ms
  ✅ PASS: [#090] registerRatatoskrIpc export exists as a function

🗝️ Suite 6: Nibelungen Wiki & Bidirectional Graph (Tests 91–110)
  ✅ PASS: [#091] Nibelungen vault storage directory initialization
  ✅ PASS: [#092] Default template note creation when vault is empty
  ✅ PASS: [#093] listNotes returns array of note objects
  ✅ PASS: [#094] Note object contains id, title, tags, and content fields
  ✅ PASS: [#095] saveNote persists note with auto-generated ISO timestamp
  ✅ PASS: [#096] extractWikilinks identifies target note titles inside [[Wikilinks]]
  ✅ PASS: [#097] buildKnowledgeGraph generates tag-based relationship edges
  ✅ PASS: [#098] Retrieval of note by specific ID
  ✅ PASS: [#099] Note query search finds note by keyword in title
  ✅ PASS: [#100] Note query search finds note by keyword in content
  ✅ PASS: [#101] Updating existing note overwrites content without duplicating ID
  ✅ PASS: [#102] deleteNote removes note from storage
  ✅ PASS: [#103] listNotes no longer contains deleted note ID
  ✅ PASS: [#104] Knowledge graph recomputes after note deletion without crash
  ✅ PASS: [#105] Ghost topic nodes generated for uncreated target wikilinks
  ✅ PASS: [#106] Bookmarks integrated as nodes in the knowledge graph
  ✅ PASS: [#107] Tag arrays with multiple hashtags convert into graph categories
  ✅ PASS: [#108] Note content containing Markdown headers renders cleanly
  ✅ PASS: [#109] Special characters in wikilink titles parse safely
  ✅ PASS: [#110] registerNibelungenIpc export exists as a function

🎙️ Suite 7: Heimdall Audio Transcription & Local Summarization (Tests 111–125)
  ✅ PASS: [#111] DEFAULT_TOKEN_BUDGET constant is strictly 1,048,576
  ✅ PASS: [#112] calculateTokenQuota computes consumed and remaining tokens accurately
  ✅ PASS: [#113] calculateTokenQuota percentage calculation is exact
  ✅ PASS: [#114] Token budget clamp prevents negative remaining token counts
  ✅ PASS: [#115] classifySegmentLanguage classifies English text as 'en'
  ✅ PASS: [#116] classifySegmentLanguage classifies Korean Hangul text as 'ko'
  ✅ PASS: [#117] classifySegmentLanguage classifies Japanese Kanji/Kana text as 'ja'
  ✅ PASS: [#118] classifySegmentLanguage classifies Chinese Hanzi text as 'zh'
  ✅ PASS: [#119] generateSmartLocalSummary extracts executive summary bullets from transcript
  ✅ PASS: [#120] generateSmartLocalSummary generates action items from task language
  ✅ PASS: [#121] generateSmartLocalSummary handles zero-word transcripts gracefully
  ✅ PASS: [#122] generateSmartLocalSummary strips non-informative punctuation
  ✅ PASS: [#123] Custom token budget overrides compute percentage correctly
  ✅ PASS: [#124] Token consumption increments accurately across multi-segment audio turns
  ✅ PASS: [#125] registerHeimdallIpc export exists as a function

🌐 Suite 8: Aetherum Browser & Tor Controller (Tests 126–140)
  ✅ PASS: [#126] Browser home URL points to https://duckduckgo.com
  ✅ PASS: [#127] Tor proxy URL defaults to socks5://127.0.0.1:9050
  ✅ PASS: [#128] Chromium desktop User-Agent string contains Darwin and Macintosh
  ✅ PASS: [#129] Incognito partition string enforces ephemeral storage
  ✅ PASS: [#130] Multi-tab state manager creates tabs with unique UUID identifiers
  ✅ PASS: [#131] Multi-tab state manager closes tabs without mutating other tabs
  ✅ PASS: [#132] Multi-tab state manager switches active tab pointer accurately
  ✅ PASS: [#133] Navigation history array appends visited URLs in order
  ✅ PASS: [#134] History clearing empties history array completely
  ✅ PASS: [#135] Bookmark addition persists URL and title
  ✅ PASS: [#136] Bookmark removal deletes targeted bookmark entry
  ✅ PASS: [#137] Bookmark search filters by keyword query in title
  ✅ PASS: [#138] Tab navigation rejects unsafe 'file://' scheme when Tor mode is active
  ✅ PASS: [#139] Download manager sets download destination to user Downloads folder
  ✅ PASS: [#140] Fullscreen video presentation state toggles cleanly

🛡️ Suite 9: Advanced Adblock & Privacy Engine (Tests 141–160)
  ✅ PASS: [#141] Adblock rule parser identifies network block rules
  ✅ PASS: [#142] Adblock rule parser identifies cosmetic CSS element hiding rules
  ✅ PASS: [#143] Adblock engine blocks known Google DoubleClick ad tracker domains
  ✅ PASS: [#144] Adblock engine blocks known Google Syndication ad server domains
  ✅ PASS: [#145] Adblock engine blocks Facebook Graph tracker beacons
  ✅ PASS: [#146] Adblock engine blocks Amazon ad system trackers
  ✅ PASS: [#147] Adblock engine allows legitimate first-party domain requests
  ✅ PASS: [#148] URL tracking cleaner strips 'utm_source' tracking parameter
  ✅ PASS: [#149] URL tracking cleaner strips 'utm_campaign' and 'utm_medium'
  ✅ PASS: [#150] URL tracking cleaner strips Facebook click ID 'fbclid'
  ✅ PASS: [#151] URL tracking cleaner strips Google click ID 'gclid'
  ✅ PASS: [#152] URL tracking cleaner preserves legitimate non-tracking query parameters
  ✅ PASS: [#153] Cosmetic stylesheet generation produces valid CSS hiding rule
  ✅ PASS: [#154] Custom user adblock rules take precedence over defaults
  ✅ PASS: [#155] Whitelisted domains bypass adblock filtering entirely
  ✅ PASS: [#156] Adblock statistics counter tracks blocked ad requests
  ✅ PASS: [#157] Adblock statistics counter tracks blocked tracker beacons
  ✅ PASS: [#158] Adblock statistics counter calculates total lifetime blocked count
  ✅ PASS: [#159] Adblock rule export produces valid JSON backup format
  ✅ PASS: [#160] Adblock rule import restores custom filter definitions

📜 Suite 10: Yggdrasil Shell & Terminal Workspace (Tests 161–180)
  ✅ PASS: [#161] Default shell resolution discovers /bin/zsh or /bin/bash
  ✅ PASS: [#162] Shell spawn environment preserves PATH and HOME
  ✅ PASS: [#163] Shell session spawns and accepts synchronous command execution
  ✅ PASS: [#164] Terminal command 'echo AETHER' outputs expected string
  ✅ PASS: [#165] Terminal command 'pwd' outputs current workspace directory
  ✅ PASS: [#166] Terminal command 'date +%Y' outputs current four-digit year
  ✅ PASS: [#167] Terminal command 'uname -s' outputs 'Darwin' on macOS
  ✅ PASS: [#168] Command exit code 0 indicates clean execution
  ✅ PASS: [#169] Invalid command execution traps error with non-zero exit code
  ✅ PASS: [#170] Directory navigation tracking updates current working directory
  ✅ PASS: [#171] Shell input sanitization strips raw control bell characters
  ✅ PASS: [#172] Environment variable override delivers custom variables to child process
  ✅ PASS: [#173] Command timeout kill signal terminates infinite loops cleanly
  ✅ PASS: [#174] Multi-line shell script executes sequentially
  ✅ PASS: [#175] Standard error (stderr) stream captured and returned
  ✅ PASS: [#176] Terminal clear command generates ANSI clear sequence
  ✅ PASS: [#177] Terminal history list logs executed commands in chronological order
  ✅ PASS: [#178] Terminal history lookup by index returns previous command
  ✅ PASS: [#179] PTY resize handler recalculates row and column dimensions
  ✅ PASS: [#180] Terminal session teardown kills child process without zombies

💼 Suite 11: Core AI Multi-Model Architecture & 8 Editor Modules (Tests 181–215)
  ✅ PASS: [#181] AI model fallback cascade defined: gemini-2.5-flash-lite -> gemini-2.5-flash -> local
  ✅ PASS: [#182] AI request routing honors DEFAULT_MODEL from .env
  ✅ PASS: [#183] AI client gracefully fails over when cloud API key is invalid
  ✅ PASS: [#184] AI streaming chunk parser yields delta text without corruption
  ✅ PASS: [#185] AI temperature bounds enforced between 0.0 and 2.0
  ✅ PASS: [#186] AI system prompt injection prefixes user message context
  ✅ PASS: [#187] Module docs: entrypoint index.html exists
  ✅ PASS: [#188] Module sheets: entrypoint index.html exists
  ✅ PASS: [#189] Module slides: entrypoint index.html exists
  ✅ PASS: [#190] Module pdf: entrypoint index.html exists
  ✅ PASS: [#191] Module markdown: entrypoint index.html exists
  ✅ PASS: [#192] Module html: entrypoint index.html exists
  ✅ PASS: [#193] Module mindmap: entrypoint index.html exists
  ✅ PASS: [#194] Module hwp: entrypoint index.html exists
  ✅ PASS: [#195] Module docs: main.js or index script is present
  ✅ PASS: [#196] Module sheets: main.js or index script is present
  ✅ PASS: [#197] Module slides: main.js or index script is present
  ✅ PASS: [#198] Module pdf: main.js or index script is present
  ✅ PASS: [#199] Module markdown: main.js or index script is present
  ✅ PASS: [#200] Module html: main.js or index script is present
  ✅ PASS: [#201] Module mindmap: main.js or index script is present
  ✅ PASS: [#202] Module hwp: main.js or index script is present
  ✅ PASS: [#203] Module docs: zero occurrences of stale 'defaultModel: "gemini-3.8-flash"'
  ✅ PASS: [#204] Module docs: zero occurrences of stale 'isSubscriber' gating
  ✅ PASS: [#205] Module sheets: zero occurrences of stale 'defaultModel: "gemini-3.8-flash"'
  ✅ PASS: [#206] Module slides: zero occurrences of stale 'defaultModel: "gemini-3.8-flash"'
  ✅ PASS: [#207] Module pdf: zero occurrences of stale 'defaultModel: "gemini-3.8-flash"'
  ✅ PASS: [#208] Module markdown: zero occurrences of stale 'defaultModel: "gemini-3.8-flash"'
  ✅ PASS: [#209] Module html: zero occurrences of stale 'defaultModel: "gemini-3.8-flash"'
  ✅ PASS: [#210] Module mindmap: zero occurrences of stale 'defaultModel: "gemini-3.8-flash"'
  ✅ PASS: [#211] Module hwp: zero occurrences of stale 'defaultModel: "gemini-3.8-flash"'
  ✅ PASS: [#212] Module docs: selectAiProvider auto mode falls back to key providers
  ✅ PASS: [#213] Module sheets: selectAiProvider auto mode falls back to key providers
  ✅ PASS: [#214] Module slides: selectAiProvider auto mode falls back to key providers
  ✅ PASS: [#215] Node syntax check passes on all 8 editor module main scripts

❓ Suite 12: Ask AI (AI 질문) Knowledge Base RAG (Tests 216–225)
  ✅ PASS: [#216] KB_SYSTEM_PROMPT instructs assistant to answer general questions when corpus is empty
  ✅ PASS: [#217] KB_SYSTEM_PROMPT directs model to cite ONLY verified starred links
  ✅ PASS: [#218] AskView does NOT abort when corpusRef.current.length === 0 in default scope
  ✅ PASS: [#219] AskView warns with askScopeGone only when a specific group scope is emptied
  ✅ PASS: [#220] kbCiteHref generates valid filenav:// URL with URI encoding
  ✅ PASS: [#221] formatKbSize formats byte sizes into B, KB, MB cleanly
  ✅ PASS: [#222] read_knowledge_file tool schema is present in AskView bundle
  ✅ PASS: [#223] search_knowledge_base tool schema is present in AskView bundle
  ✅ PASS: [#224] User starred files catalog exists and is valid JSON
  ✅ PASS: [#225] Philosophy doctoral thesis exists in user documents

🤖 Suite 13: Aether Autonomous Agent Engine (Tests 226–240)
  ✅ PASS: [#226] AGENT_PROVIDERS includes built-in 'aether-ai'
  ✅ PASS: [#227] agent-DrUDLohx.js maps 'aether-ai' provider key to 'providerAether'
  ✅ PASS: [#228] skills-CkmNaLwM.js localization defines providerAether
  ✅ PASS: [#229] skills-CkmNaLwM.js localization defines providerAetherNote
  ✅ PASS: [#230] Project folder validator rejects root filesystem /
  ✅ PASS: [#231] Project folder validator rejects user home root directory
  ✅ PASS: [#232] Project folder validator permits legitimate subproject path
  ✅ PASS: [#233] Agent sandbox tool: list_project_files lists files
  ✅ PASS: [#234] Agent sandbox tool: read_project_file reads contents
  ✅ PASS: [#235] Agent sandbox tool: write_project_file creates file
  ✅ PASS: [#236] Agent sandbox tool: run_command executes command safely
  ✅ PASS: [#237] Path traversal guard blocks relative navigation outside project root
  ✅ PASS: [#238] startAetherAgentSession export is a function
  ✅ PASS: [#239] Agent permission mode 'ask-commands' flags command execution
  ✅ PASS: [#240] Agent permission mode 'ask-writes' flags write and command execution

🖥️ Suite 14: IPC Security & Interactive DOM Verifications (Tests 241–260)
  ✅ PASS: [#241] extensions/index.js does NOT remove ai:chat IPC handler
  ✅ PASS: [#242] extensions/index.js does NOT remove ai:free-quota IPC handler
  ✅ PASS: [#243] extensions/index.js does NOT remove ai:free-disconnect IPC handler
  ✅ PASS: [#244] DOM fafnir.html: Decrypt modal opens and confirms passphrase
  ✅ PASS: [#245] DOM fafnir.html: Encrypt button exists and has status text element
  ✅ PASS: [#246] DOM mimisbrunnr.html: Displays strictly 2 sovereign model choices
  ✅ PASS: [#247] DOM mimisbrunnr.html: Neural pill, selectModel, and check engine button exist
  ✅ PASS: [#248] DOM ratatoskr.html: API send button (btnSend) and method select exist
  ✅ PASS: [#249] DOM ratatoskr.html: Database and API view toggle tabs exist
  ✅ PASS: [#250] DOM browser.html: Adblock toggle pill button exists
  ✅ PASS: [#251] DOM browser.html: Adblock dropdown panel exists
  ✅ PASS: [#252] DOM browser.html: Tor toggle button exists on toolbar
  ✅ PASS: [#253] DOM adblock.html: Statistics cards exist (ads, trackers, lifetime)
  ✅ PASS: [#254] DOM adblock.html: Custom rule input and add button exist
  ✅ PASS: [#255] DOM nibelungen.html: New note button and note title/content editors exist
  ✅ PASS: [#256] DOM nibelungen.html: Search filter input (searchNotes) exists
  ✅ PASS: [#257] DOM terminal.html: Terminal input line (cmdInput) and prompt exist
  ✅ PASS: [#258] DOM heimdall.html: Studio navigation button and recording indicator exist
  ✅ PASS: [#259] DOM heimdall.html: Token usage header bar and remaining percent exist
  ✅ PASS: [#260] DOM agent.html: Loads agent bundle with built-in Aether AI provider

🏛️ Suite 15: The High Table Multi-Agent Council & Fallback Engine (Tests 261–278)
  ✅ PASS: [#261] The High Table: high-table.html exists in renderer directory
  ✅ PASS: [#262] The High Table: extensions/high-table.js exports 5 seats
  ✅ PASS: [#263] The High Table: 5 seats contain Logician, Visionary, Inquisitor, Pragmatist, High Arbiter
  ✅ PASS: [#264] The High Table: AVAILABLE_MODELS list includes Gemini 3.5 Flash-Lite
  ✅ PASS: [#265] The High Table: AVAILABLE_MODELS includes local Mímisbrunnr models
  ✅ PASS: [#266] The High Table: registerHighTableIpc function is exported
  ✅ PASS: [#267] The High Table: DOM contains prompt textarea (#inquiryInput)
  ✅ PASS: [#268] The High Table: DOM contains convene button (#btnConvene) and abort button (#btnAbort)
  ✅ PASS: [#269] The High Table: DOM contains seats grid (#seatsGrid) and fallback alert banner (#fallbackBanner)
  ✅ PASS: [#270] The High Table: DOM contains 3-stage progress trackers (trackerStage1, trackerStage2, trackerStage3)
  ✅ PASS: [#271] The High Table: DOM contains preset toolbar and quick preset buttons
  ✅ PASS: [#272] The High Table: DOM contains decree container (#decreeBody) and export action
  ✅ PASS: [#273] The High Table: preload index.js exposes highTable on hyperOfficeApi
  ✅ PASS: [#274] The High Table: aetherum-pages.js supports 'high-table' page slug
  ✅ PASS: [#275] The High Table: welcome page links to aetherum://high-table
  ✅ PASS: [#276] The High Table: main index.js implements createHighTableView and openHighTableTab
  ✅ PASS: [#277] The High Table: antigravity_council.py supports --json-events flag
  ✅ PASS: [#278] The High Table: antigravity_council.py implements stream_with_fallback for 503/429 errors

==================================================================
Results: 278 passed, 0 failed (Total: 278)
==================================================================
🎉 All 278 comprehensive tests across all 15 Aether suites passed with 100% success!
```

---

## 🛡️ Security & Privacy Manifesto

1. **Airgapped by Design**: 사용자의 프롬프트, 개인 메모, 로컬 코드는 절대 외부 클라우드로 무단 전송되지 않습니다.
2. **Zero Plaintext at Rest**: Fafnir에 보관되는 모든 민감 데이터는 업계 표준 AES-256-GCM으로 봉인됩니다.
3. **ISP Censorship Defeat**: Sleipnir는 국가 및 통신사 차원의 SNI 패킷 차단을 원천 분쇄합니다.
4. **Anonymity Preserved**: Aetherum은 토르 네트워크를 통해 IP 주소와 브라우저 핑거프린트를 난독화합니다.
5. **Full Ad & Tracker Immunity**: Aetherum Adblock은 상용 트래커와 광고 스크립트 실행을 네트워크 계층에서 사전 차단합니다.
6. **Sandboxed Automation**: Autonomous Agent는 사용자가 지정한 프로젝트 디렉터리 외의 시스템 영역 접근을 원천 차단합니다.

---

## 👨‍💻 Author & Contributions

* **Lead Architect**: **Jeffrey Kim (김정훈)**  
  컴퓨터소프트웨어학부, 한양대학교 (서울)  
  *Email*: [jk9576@hanyang.ac.kr](mailto:jk9576@hanyang.ac.kr)  
  *Repository*: [https://gitlab.com/jk9576/aether](https://gitlab.com/jk9576/aether)

---

<div align="center">
<sub>Crafted with passion for digital freedom and sovereign intelligence. © 2026 Jeffrey Kim. Apache-2.0 License.</sub>
</div>
