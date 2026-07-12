# 🤖 Multi-Agent Orchestration & Knowledge Graph Directory (AGENTS.md)

This directory is structured as a **Multi-Agent Research & Engineering Workspace** focused on the development of the **SmartBabyScale** clinical decision support system (CDSS). This workspace uses an Obsidian-compatible Knowledge Graph of flat notes (representing key concepts linked via `[[wikilinks]]`) located inside the `BRAIN/` subfolder, paired with specialized AI agent personalities that execute different roles in the system lifecycle.

---

## 👥 The Specialized Agent Team

Three autonomous agent personalities have been created and saved in the [`.agents/`](file:///Users/alvin/OBSIDIAN/Migration/Migration/Thesis/.agents/) directory. Any LLM entering this workspace can adopt these roles by loading their corresponding system prompts.

### 1. 🏥 [[.agents/neonatal_health_agent|Neonatal Health & Clinical Scoring Specialist]] (Dr. Neo)
*   **Role:** Expert on neonatal mortality prediction, clinical scoring indices, and physiology.
*   **Focus:** Ensures medical safety, checks construct validity of sensor proxies, aligns research with clinical guidelines (e.g., TRIPOD+AI, STARD), and prevents clinical overclaiming.
*   **Key Knowledge Domains (located in `BRAIN/`):** `[[SNAPPE-II Original Derivation]]`, `[[SNAPPE-II Scoring Variables and Thresholds]]`, `[[Low Birth Weight - WHO Definitions and Global Epidemiology]]`, `[[TRIPOD+AI 2024 Reporting Guidelines]]`.

### 2. 🔌 [[.agents/iot_systems_agent|IoT Systems & Sensor Engineering Specialist]] (EdgeSpec)
*   **Role:** Expert on edge gateway architecture, sensor precision, and medical device hardware constraints.
*   **Focus:** Audits sensor calibration, SPI/I²C data buses, power/latency trade-offs, artifact rejection, and alignment with medical standards.
*   **Key Knowledge Domains (located in `BRAIN/`):** `[[Load Cell Systems - HX711 24-bit ADC]]`, `[[PPG Sensors - MAX30102 Pulse Oximetry]]`, `[[TROIKA Framework - Motion Artifact Rejection for PPG]]`, `[[Medical Device Standards - IEC 60601 and WHO]]`.

### 3. 🧠 [[.agents/ml_methodology_agent|Machine Learning Methodology Specialist]] (StatRig)
*   **Role:** Expert on statistical learning theory, training validation, and model explainability.
*   **Focus:** Prevents data leakage, audits validation rigor (GroupShuffleSplit, cross-validation), enforces proper evaluation metrics, and checks model calibration and interpretability (SHAP).
*   **Key Knowledge Domains (located in `BRAIN/`):** `[[XGBoost Internals]]`, `[[Data Leakage in Clinical ML]]`, `[[GroupKFold - Patient-wise Splitting Methodology]]`, `[[SHAP (SHapley Additive exPlanations)]]`.

---

## 🗺️ The Knowledge Graph (45 Research Nodes in `BRAIN/`)

The research backing this project is distributed across 45 primary-source notes written flat in the `BRAIN/` directory. These notes use `[[wikilinks]]` to map semantic relationships, creating a mental graph of the system.


### A. Clinical & Neonatal Physiology Nodes
*   `[[SNAPPE-II Original Derivation]]`: Richardson et al. (2001) paper detailing the derivation and scoring system.
*   `[[SNAPPE-II Scoring Variables and Thresholds]]`: Breakdown of the 9 scoring components and clinical thresholds.
*   `[[SNAPPE-II Validation Studies Across Populations]]`: Validation data across Iranian, Brazilian, Indian, and Indonesian cohorts.
*   `[[CRIB-II and Competing Neonatal Scoring Systems]]`: Comparison to SNAP-II, CRIB-II, and Apgar scoring.
*   `[[Low Birth Weight - WHO Definitions and Global Epidemiology]]`: Standards for LBW, VLBW, ELBW, and global SVN burden.
*   `[[Small Vulnerable Newborns - Lancet 2023 Series]]`: Foundational literature on neonatal monitoring priorities.
*   `[[Indonesian Neonatal Mortality and LBW Data]]`: Riskesdas and Kemenkes stats motivating the rural health deployment.
*   `[[Clinical vs Statistical Significance in Neonatal Studies]]`: Analysis of RMSE bounds and clinical safety thresholds.
*   `[[Physiological Ground Truth Quality for SNAPPE-II]]`: Reliability, scoring variation, and ground truth validation.
*   `[[STARD 2015 Diagnostic Accuracy Reporting]]`: Diagnostic accuracy reporting standards.

### B. Hardware & IoT Edge Engineering Nodes
*   `[[Edge Computing Architecture - Raspberry Pi as Medical Edge Node]]`: Pi 5 compute and safety constraints.
*   `[[Load Cell Systems - HX711 24-bit ADC]]`: High-precision weight telemetry specs and 10/80 SPS limits.
*   `[[PPG Sensors - MAX30102 Pulse Oximetry]]`: Non-invasive heart rate/SpO₂ acquisition constraints.
*   `[[TROIKA Framework - Motion Artifact Rejection for PPG]]`: Filtering physiological noise during infant movement.
*   `[[Non-Contact IR Temperature - MLX90614]]`: Core body vs. skin surface temperature correlation.
*   `[[Ultrasonic Length Measurement - HC-SR04]]`: Ultrasonic ranging constraints for neonatal height estimation.
*   `[[SpO2-FiO2 as Non-Invasive Proxy for PaO2-FiO2]]`: Causal/correlational mapping from peripheral to arterial measurements.
*   `[[Skin Tone Bias in Pulse Oximetry]]`: Critical engineering bias in optical sensors.
*   `[[IoT-Based Neonatal Monitoring Systems - Survey]]`: Existing state-of-the-art systems and clinical limitations.
*   `[[Medical Device Standards - IEC 60601 and WHO]]`: Regulatory constraints (IEC 60601-1, body temperature, scales).
*   `[[Real-Time Data Pipeline - MQTT-WebSocket for Medical Telemetry]]`: Low-latency data ingestion from scale to backend.
*   `[[TinyML and Edge AI for Healthcare]]`: QUANTIZATION and inference latency on ARM processors.
*   `[[Neonatal Anthropometry Standards]]`: Physical measurement guidelines for newborn screening.
*   `[[Edge-Fog-Cloud Architecture Trade-offs]]`: Network, latency, and security partitioning.

### C. Machine Learning & Statistical Rigor Nodes
*   `[[XGBoost Internals]]`: Sparsity-aware split finding and gradient boosting tree theory.
*   `[[Random Forest]]`: Breiman bagging baseline model.
*   `[[SVR with RBF Kernel]]`: Continuous SVR failures, scaling requirements, and hyperparameter sensitivity.
*   `[[Data Leakage in Clinical ML]]`: Splitting errors, normalization timing, and preprocessing leakage.
*   `[[GroupKFold - Patient-wise Splitting Methodology]]`: Patient isolation using `SUBJECT_ID` to prevent leakage.
*   `[[Class Imbalance - Cost-Sensitive Learning]]`: sample weight implementations (`Sample_weight = Y + 1.0`).
*   `[[Model Calibration]]`: Reliability curves, Brier scores, and clinical decision calibration.
*   `[[SHAP (SHapley Additive exPlanations)]]`: Game-theoretic local and global feature impact.
*   `[[TRIPOD+AI Reporting Standard]]`: Compliance with reporting requirements for medical ML models.
*   `[[Distribution Shift - Generalization]]`: US tertiary NICU data (MIMIC-III) to Indonesian rural Puskesmas shift.
*   `[[Regression Performance Metrics]]`: R², RMSE, and residual analysis.
*   `[[Cross-Validation Strategies]]`: Nested cross-validation and fold-level statistics.
*   `[[ML on MIMIC-III - Neonatal Applications]]`: SOTA benchmark results using PhysioNet clinical records.
*   `[[SMOTE in Clinical Machine Learning]]`: The dangers of synthetic rows in imbalanced clinical data.
*   `[[MIMIC-III Database Descriptor]]`: Source database details (Johnson et al. 2016).

---

## 🔗 Critical Hubs ("God Nodes")

When tracing information flow or editing the system, pay special attention to these **God Nodes**, which connect the clinical, hardware, and ML domains:

1.  `[[SNAPPE-II Scoring Variables and Thresholds]]` (Clinical ↔ Hardware ↔ ML): Holds the definition of the target variable and features. Any sensor change or feature selection change impacts this.
2.  `[[SpO2-FiO2 as Non-Invasive Proxy for PaO2-FiO2]]` (Clinical ↔ Hardware): Defines the validity of using a low-cost PPG sensor (`[[PPG Sensors - MAX30102 Pulse Oximetry]]`) as a surrogate for invasive clinical blood gas measurements.
3.  `[[Sensor Fusion and Missing Data (MNAR)]]` (Hardware ↔ ML): Bridges the real-world hardware reality (asynchronous sensors, laboratory delays) to the ML model's ability to handle missing values using `[[XGBoost Internals]]`.
4.  `[[TRIPOD+AI 2024 Reporting Guidelines]]` (Clinical ↔ ML): The regulatory quality standard that governs the entire machine learning model development and reporting.

---

## 🛠️ Workflows & Usage

### 1. How to Navigate the BRAIN (Knowledge Graph)
*   **Start at the Center:** Always begin by reading the master index file: **[[BRAIN/Index.md]]**. This acts as the map of MOCs (Maps of Content), linking research theory directly to production code files.
*   **Follow the Relational Edges:** Rather than reading code blindly, traverse the `RELATIONS` metadata defined in each note. The relationship types are strictly classified:
    - `implements::[[Node]]` (e.g. `Sensor Infrastructure.md` implements `pi_hardware_reader.py`)
    - `derived_from::[[Node]]` (e.g. `urine_output` is derived from `HX711 weight`)
    - `validates::[[Node]]` (e.g. `test_sensors.py` validates `calibration_coeffs.json`)
*   **Source Anchoring:** Never create or modify a node in the graph without anchoring it to a verified primary source (under the `PRIMARY SOURCES` section). Every claim must have an accessible URL or a registered DOI.

### 2. How to Continue the Project Flawlessly
When taking over this workspace, future agents must follow this verification lifecycle:
1.  **Read Active Task Lists:** Locate the current project plans in **`tasks/plan.md`** and execution checklist in **`tasks/todo.md`**.
2.  **Verify Hardware Configurations:** Calibrations are stored in **`Sensors/calibration_coeffs.json`**. Verify that modifications here map to equations in `pi_hardware_reader.py` (ultrasonic sound speed, non-contact temp conductivity, and Fitzpatrick SpO₂ offsets).
3.  **Execute the Test Suite:**
    - Run the sensor signal processing tests: `python3 -m unittest test_sensors.py` inside `Sensors/`.
    - Run the edge ML model pipeline integration check: `python3 test_models.py` inside `Sensors/`.
    - Run the lab sparsity stress test: `python3 evaluate_sparsity.py` inside `MachineLearning/`.
    - Run the classifier ROC-AUC validation: `python3 classifier_validation.py` inside `MachineLearning/`.
4.  **Keep the Brain Sync'd:** When code changes affect sensor math or validation metrics, immediately update the corresponding note (e.g., `Sensor Infrastructure.md` or `Fault Tolerance Plan.md`) and rerun `SmartBabyScale_Training.ipynb` end-to-end to refresh model binaries.

### 3. To clean up the paper draft:
Use the **Priority Action Checklist** inside `[[TRIPOD+AI 2024 Reporting Guidelines]]` and `[[Clinical vs Statistical Significance in Neonatal Studies]]` to correct the draft sections, ensuring all R², RMSE, and sensor margins are backed by these verified notes.

---

## ⚖️ Role Specialization & Dual-Workspace Workflow Mandate (Strict Separation)

To maintain scientific integrity and prevent code-prose pollution, all agents must operate under a strict **separation of concerns** across workspaces:

### 1. The Research Workspace (Obsidian `/Thesis/`) — Academic & Peer-Review Mode
*   **Owners & Peer-Review Panel:** **Dr. Neo** (Clinical Specialist), **EdgeSpec** (IoT Specialist - Academic Reviewer), and **StatRig** (ML Methodologist - Academic Reviewer).
*   **Focus:** Joint peer-review auditing of the IEEE Access manuscript draft. While **Dr. Neo** validates clinical risk scoring, **EdgeSpec** and **StatRig** act as critical internal reviewers post-drafting to verify that the sensor calibration limits, speed-of-sound thermodynamics, Fitzpatrick optical biases, statistical leakage preventions, calibration curves, and transductive domain adaptation mathematics are rigorously and accurately presented in the paper text.
*   **Primary Deliverable:** `/Thesis/RECOMMENDATIONS.MD` and `BRAIN/` notes.
*   **Constraint:** *Never* write edge software/IT deployment guides or hardware scripts directly into this workspace.

### 2. The Code Workspace (`/SmartBabyScale/`) — Engineering & IT Mode
*   **Owners:** **EdgeSpec** (IoT Specialist) and **StatRig** (ML Methodologist - Engineering Mode).
*   **Focus:** Edge gateway software (RPi 5), sensor signal processing (HX711 20-sample filtering, MAX30102 bandpass filtering), incubator speed-of-sound thermal equations, Fitzpatrick SpO₂ skin tone offset deltas, Socket.io payload routing, and local script tests.
*   **Primary Deliverable:** `/SmartBabyScale/RECOMMENDATIONS.MD` and codebase files.
*   **Constraint:** *Never* mix academic paper prose, reviewer responses, or bibliographies into this workspace. Keep it strictly centered on what the engineering team must build and calibrate.
