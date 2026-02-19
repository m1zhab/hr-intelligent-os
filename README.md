# HR Intelligence OS

HR Intelligence OS is a world-class agentic operational console designed for modern workforce management. It leverages advanced cloud intelligence and local compute nodes to transform HR from a reactive administrative function into a proactive intelligence unit.

### Core Capabilities

*   **Engineered** an autonomous operational console for workforce management, integrating cloud and local nodes to streamline hiring workflows through automated legal drafting and persistent behavioral mapping
*   **Constructed** a multimodal recruitment agent using live websocket streams to conduct technical screenings, facilitating natural voice interaction and instant transcription for candidate evaluation across diverse roles
*   **Integrated** heuristic reasoning engines to identify burnout risk and hidden talent, processing complex datasets to deliver strategic recommendations for team retention and internal career growth
*   **Optimized** salary benchmarking using web grounding tools to extract current market data, providing verified insights and legal compliance tracking for thousands of regional employment records

---

### Agentic AI Framework

*   **Autonomous Tool Usage:** Performs real-time market research and salary benchmarking. The system autonomously decides to use search tools, navigates the web for specific fintech data, and returns grounded citations.
*   **Real-time Multimodal Interaction:** Implements a high-state recruitment agent. It maintains a persistent connection to manage turn-taking, detecting speech patterns and processing audio data to generate fluid spoken responses.
*   **Heuristic Reasoning Agents:** Ingests raw telemetry including commits, code reviews, and meeting hours. It applies qualitative reasoning to determine human states like burnout risk or leadership potential.
*   **Document Synthesis:** Acts as an autonomous legal drafter. It weaves structured candidate data into complex legal frameworks, ensuring context-aware clauses for intellectual property and regional labor laws.

---

### Key Features

*   **📊 Team Intel Dashboard:** Multi-parameter workforce mapping. Visualizes behavioral trajectories to identify performance anomalies and mental health signals.
*   **🎙️ Live Interview Node:** A persistent recruitment agent. Features low-latency audio streaming, protocol-driven questioning, and real-time candidate evaluation.
*   **🪜 Career Architect:** Predictive professional growth mapping. Generates 12-month evolution roadmaps and certification paths for technical specialists.
*   **⚖️ Compliance & Registry:** Autonomous monitoring of labor laws, visa statuses, and residency permits with predictive severity alerts.
*   **❤️ Pulse Sentiment Engine:** Real-time analysis of employee morale. Translates raw qualitative feedback into quantitative indexes and strategic action plans.
*   **📜 Invisible Onboarding:** Streamlined hiring workflow. Benchmarks roles against live market data and executes automated provisioning cascades for internal access.

---

### Technical Architecture

*   **Frontend:** React 19, TypeScript, Tailwind CSS
*   **Intelligence:** Google Gemini API (@google/genai)
*   **Local Inference:** Ollama / Mistral / Llama
*   **Visualization:** Recharts (Custom SVG Implementation)
*   **Audio Engine:** Web Audio API (PCM 16/24kHz Encoding)

---

### Getting Started

#### Local Compute Node
To utilize the Local Node functionality, ensure you have Ollama running with appropriate CORS headers:

```bash
# Mac/Linux
OLLAMA_ORIGINS="*" ollama serve

# Windows (Powershell)
$env:OLLAMA_ORIGINS="*"; ollama serve
```

#### Advanced Node
The Advanced Node requires a valid API key configured in the environment. The system automatically handles initialization through the secure execution context.

---

### Preview
Use it here : [HR Dashboard](https://ai.studio/apps/drive/1a381ESYv_EYgjXLkIgx8WtxbHq8YTrdl)
