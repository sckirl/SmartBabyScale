# CLAUDE.md — Agent Reference & Build Commands

This file serves as the core instruction guide for **Claude Code, Codex, Cursor, and any other AI developer agents** entering this workspace.

---

## 🛠️ Build & Run Commands

### 1. Web Frontend (Interface/)
*   **Run Development Server:** `cd Interface && npm run dev`
*   **Build Production Bundle:** `cd Interface && npm run build`
*   **Start Production Server:** `cd Interface && npm start`
*   **Lint Check:** `cd Interface && npm run lint`

### 2. IoT Sensor Telemetry (Sensors/)
*   **Run Mock Sensor Simulation:** `cd Sensors && ../.venv/bin/python simulation.py`
*   **Run Physical RPi 5 Sensor Reader:** `cd Sensors && ../.venv/bin/python pi_hardware_reader.py`

### 3. Machine Learning (MachineLearning/)
*   **Run Pipeline Training:** `cd MachineLearning && ../.venv/bin/jupyter nbconvert --to notebook --execute SmartBabyScale_Training.ipynb --inplace`

---

## 🔌 Global Agent Skills Reference
When executing complex operations (especially knowledge graph management or structured reasoning), you must load and follow the custom skills defined globally on this machine:

*   **Primary Agent Skill Path:** `/Users/alvin/.gemini/skills/`
*   **Mental Knowledge Graph Skill:** `/Users/alvin/.gemini/skills/brain/SKILL.md`
    *   *Direct Instruction:* Always read and apply this skill when creating, updating, or querying the Obsidian `BRAIN/` notes using `[[wikilinks]]`.

---

## 🧠 Code Style & Philosophy

*   **"Ponytail" (Lazy Senior Dev) Mode:** Keep code minimal, correct, and readable. Do not write boilerplate, speculative features (YAGNI), or introduce dependencies unless explicitly requested.
*   **Vercel Compatibility:** The Socket.io client in `Interface/src/components/Dashboard.tsx` is strictly constrained to `transports: ['websocket']` with limited retries to prevent infinite long-polling loops when running on Vercel's serverless infrastructure. Do not modify this.
*   **Patient Isolation:** All model training splits must use `GroupShuffleSplit` on `SUBJECT_ID` to prevent leakage.
