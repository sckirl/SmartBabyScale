# 🏛️ EPOSREM: Grand Orchestration Plan

## 1. Project Vision & Architecture
**EPOSREM (Electronic POSition & REspiratory Monitoring)** is a near real-time (< 500ms latency) neonatal monitoring system deployed on Edge Computing (Raspberry Pi/ESP32). It features an ML-powered (95% accuracy target) risk prediction model using the SNAPPE-II metric, a Next.js (App Router) interface, and a raw SQL database tailored for Indonesian health administration capabilities.

## 2. Agent Roles & Parallel Workflow

### 👁️ Supervisor Agent
- **Role:** Project Manager & Workflow Enforcer.
- **Responsibilities:**
  - Ensure the latency stays under 500ms.
  - Coordinate the data pipeline from Edge (ESP32/Raspberry Pi) to the Node.js/Next.js backend.
  - Manage the timeline: Database Setup -> Hardware Prototyping (ESP32) -> Edge AI Deployment -> PDF Export functionality.

### 🧠 Business Analyst (BA)
- **Role:** Requirements & Logic Architect.
- **Responsibilities:**
  - **Database Schema:** Design raw SQL queries for minimal data retention (averaging historical data).
  - **Alert Logic:** Define strict rules for emergency alerts (only trigger on sustained/re-occurring abnormal vitals, e.g., continuous high heart rate).
  - **Auth:** Define simple role-based access control for doctors/nurses.
  - **PDF Export:** Specify the format for the end-result PDF report for the stakeholder's internal database.

### 👨‍💻 Developer (DEV)
- **Role:** Full-Stack & IoT Implementer.
- **Responsibilities:**
  - **Backend:** Implement raw SQL connections and basic Auth in Next.js.
  - **Frontend:** Build the UI to display real-time vitals and the PDF export feature. Add UI warnings when data points are insufficient for a 95% accurate ML prediction.
  - **IoT/Hardware:** 
    - Master Branch: Setup efficient camera feed streaming (MJPEG/WebRTC).
    - ESP32 Branch: Implement ESP32 specific sensor data reading and transmission for accuracy testing.
  - **Edge AI:** Deploy the MLP & SVM models directly on the Raspberry Pi for edge computing.

### 🕵️ Quality Assurance (QA)
- **Role:** Gatekeeper & Tester.
- **Responsibilities:**
  - **E2E Testing:** Build automated UI tests using **Playwright**.
  - **Latency Profiling:** Continuously monitor WebSocket/data transmission to ensure < 500ms delay.
  - **Alert Verification:** Test that alerts only fire upon sustained anomalies, not random spikes.

### 🔬 IEEE Researcher
- **Role:** Scientific ML & Algorithm Expert (15+ years exp).
- **Responsibilities:**
  - **Algorithm Extraction:** Read provided PDFs (`Sources/24940.pdf`, etc.) to extract exact mathematical algorithms for SNAPPE-II calculation.
  - **Model Optimization:** Ensure the MLP/SVM model achieves 95% accuracy even with minimal data points.
  - **Paper Review:** Review `CURRENT PAPER.pdf` against `FORMATTING EXAMPLE` folder (waiting on files) to provide minimal, impactful formatting changes to satisfy IEEE reviewers.

## 3. Execution Phases

### Phase 1: Foundation (Master Branch)
- [ ] Initialize Raw SQL database schema.
- [ ] Implement Auth for health administrators.
- [ ] Finalize the SNAPPE-II mathematical algorithm extraction.
- [ ] Establish Playwright E2E testing framework.

### Phase 2: Hardware Prototyping (ESP32 Branch)
- [ ] Create `ESP32` branch.
- [ ] Implement ESP32 specific IoT transmission (testing accuracy).
- [ ] Setup WebSocket/MQTT ingestion on Node.js to receive ESP32 data < 500ms.

### Phase 3: Edge AI & Advanced Features
- [ ] Deploy optimized ML model to Edge Device.
- [ ] Implement sustained-anomaly alert logic.
- [ ] Implement automated PDF report generation.
- [ ] Optimize Camera Feed stream.

---
*Document maintained by the Grand Architect.*
