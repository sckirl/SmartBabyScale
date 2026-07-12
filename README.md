:qa
# SmartBabyScale: Smart Neonatal Monitoring System

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

> **SmartBabyScale** - A revolutionary non-invasive neonatal health monitoring system using SNAPPE-II metrics.

---

## About The Project: Vision & Purpose

**SmartBabyScale** is a cutting-edge IoT application designed to assist medical professionals in the Neonatal Intensive Care Unit (NICU). 
The core vision of this project is to transform a routine procedure—weighing a newborn—into a comprehensive, non-invasive diagnostic checkpoint. Rather than serving as a long-stay continuous monitor (like a smart bed), it functions precisely as a scale. When a nurse places a baby on the scale for a routine check, the system instantly aggregates physical measurements and dynamically integrates them with clinical lab data to predict the risk of neonatal clinical instability.

---

## 🔬 Research Methodologies

The predictive engine of SmartBabyScale is built upon the **SNAPPE-II (Score for Neonatal Acute Physiology-Perinatal Extension-II)** framework, a globally validated clinical scoring system used to assess illness severity and predict mortality in NICUs.

Our methodology leverages real-world clinical data rather than theoretical mocks:
*   **Data Sourcing:** The risk models are trained exclusively on authentic clinical data extracted from the **MIMIC-III** (Medical Information Mart for Intensive Care) database. 
*   **Feature Engineering:** We extracted 7,880 neonatal records, isolating 14 distinct features. This includes 9 hardware-measurable features (e.g., weight, length, surface temperature, heart rate, SpO2) and 5 clinical/lab parameters (e.g., Apgar score, serum pH, PO2/FiO2 ratio).
*   **Dynamic Updating:** The system is designed for asynchronous clinical environments. If certain lab results (like Apgar scores) are not yet available when the baby is placed on the scale, the prediction engine natively handles the missing values or utilizes baseline demographic defaults, dynamically updating the risk probability the moment the nurse inputs the missing data.

---

## 🧠 Machine Learning Approach & Architecture

To deploy a highly accurate, explainable, and low-latency model to an edge device (Raspberry Pi), we designed a specific tabular machine learning pipeline (`SmartBabyScale_Training.ipynb`). This approach addresses common conference questions regarding model choice, explainability, and hardware constraints.

### 1. Primary Model: XGBoost (Extreme Gradient Boosting)
Tree-based models are the gold standard for medical tabular data. We utilize `XGBClassifier` as our primary prediction engine for several critical reasons:
*   **Native Missing Data Handling:** In a fast-paced NICU, data is often incomplete. XGBoost natively learns the optimal branching direction for `NaN` values. If a nurse hasn't inputted an Apgar score yet, the model won't crash or require clunky statistical imputation; it smoothly infers the risk based on historical MIMIC-III missingness patterns.
*   **Clinical Explainability (Feature Importance):** A "black-box" model is dangerous in healthcare. XGBoost provides instantaneous Feature Importance weights. When the UI flags a baby as "High Risk," it can explicitly explain *why* (e.g., "Risk primarily driven by low temperature and low birth weight"), allowing nurses to make targeted interventions.
*   **Scale Invariance:** XGBoost does not require feature scaling, meaning the raw sensor data (e.g., weight in grams vs. pH in decimals) can be fed directly into the model without preprocessing overhead.

### 2. Ensemble Baseline: Random Forest
We train a `RandomForestClassifier` to serve as the structural "ground truth" against our more aggressive boosting models (like XGBoost). 
*   **Why is this important?** Random Forest utilizes bagging (bootstrap aggregating) to build hundreds of independent decision trees, significantly reducing variance and preventing overfitting. While XGBoost is extremely powerful, boosting can sometimes over-optimize and chase noise in smaller medical datasets. Random Forest provides a stable, highly generalized baseline. If XGBoost's predictions diverge heavily from the Random Forest, it serves as an immediate warning sign of model instability or noise-chasing. Like XGBoost, it requires no feature scaling and provides robust feature importance.

### 3. The Baseline SVR Collapse
As a comparative baseline, we also trained a Support Vector Regressor (SVR) using a Radial Basis Function (RBF) kernel. **It completely collapsed (R² of 0.070, RMSE of 13.97).** 
*   **Why did the RBF kernel fail?** SVR inherently attempts to smooth out errors across a continuous geometric space. This mathematical property makes it structurally incapable of handling the highly rigid, step-wise point distribution clusters of the SNAPPE-II clinical scoring system. The decision trees (XGBoost/RF) naturally thrive on these sharp clinical thresholds, whereas the SVR completely fails to fit the step-wise distribution.

### Why avoid Deep Learning (Neural Networks)?
While an MLP (Multi-Layer Perceptron) could be used, deep learning architectures introduce unnecessary bloat for a 14-feature tabular dataset. They act as opaque black boxes (lacking feature importance), require strict scaling, and consume significantly more RAM—making them suboptimal for a Raspberry Pi edge device compared to the highly efficient, sub-millisecond inference of an XGBoost ensemble.

---

## 📸 Screenshots
<img width="1862" height="932" alt="image" src="https://github.com/user-attachments/assets/58e82df6-1930-47ed-80fc-1f7a8e6c26bf" />
<img width="1860" height="931" alt="image" src="https://github.com/user-attachments/assets/cadc9c31-3250-4dd8-ad7c-94ff5d4c851b" />

## 🍓 Raspberry Pi Wiring
<img width="1860" height="931" alt="image" src="https://github.com/sckirl/SmartBabyScale/blob/master/Schematics.png" />
<img width="1860" height="931" alt="image" src="https://github.com/sckirl/SmartBabyScale/blob/master/Teribble%20BB%20Schem.png" />

---

## ⛃ Entity Relationship Diagram (ERD)
<img width="622" height="520" alt="image" src="https://github.com/user-attachments/assets/48b2e5b0-d686-4b46-b91b-77143e374549" />

---

### 🌟 Key Features

*   **⚡ Real-Time Monitoring:** Live streaming of vital signs (Heart Rate, SpO2, Temp) via WebSocket.
*   **📊 Smart Growth Charts:** Interactive visualization of anthropometric data (Weight, Length) over time.
*   **🤖 AI-Powered Risk Prediction:** Utilizes MLP & SVM models to classify health risks based on sensor data.
*   **🚨 Emergency Alerts:** Instant visual notifications for abnormal vital signs.
*   **📱 Responsive Design:** Built with **Shadcn/UI** and **Tailwind CSS** for a seamless experience on tablets and desktops.

---

## Architecture & Tech Stack

SmartBabyScale employs a Hybrid Architecture combining a robust Node.js server for real-time communication and a Next.js frontend for the user interface.

### **Software Stack**

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 16 (App Router)** | React framework for server-rendered UI. |
| **Styling** | **Tailwind CSS v4** | Utility-first CSS framework. |
| **Components** | **Shadcn/UI** | Beautiful, accessible components. |
| **Charts** | **Recharts** | Composable charting library for React. |
| **Real-time** | **Socket.io** | Bidirectional event-based communication. |
| **IoT Client** | **Python 3.10+** | Simulates/Interfaces with hardware sensors. |

### **Hardware Integration**

The system aggregates data from the following sensors (simulated in `Sensors/simulation.py` and read physically via `Sensors/pi_hardware_reader.py`):

| Component | Function | Precision |
| :--- | :--- | :--- |
| **HX711** | Weight Sensor | ±50 gram |
| **HC-SR04** | Ultrasonic Length Sensor | Automated measurement |
| **MLX90614** | Infrared Thermometer | Contactless temperature |
| **GY-MAX30102** | Pulse Oximeter | SpO2 & Heart Rate |
| **Raspi Cam** | Visual Feed | Real-time baby monitoring |

---

## Getting Started

Follow these steps to set up the SmartBabyScale environment locally.

### Prerequisites

*   **Node.js** (v18+)
*   **Python** (v3.10+)
*   **Git**

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/SmartBabyScale.git
    cd SmartBabyScale/Interface
    ```

2.  **Install Frontend Dependencies**
    ```bash
    npm install
    ```

3.  **Setup Python Virtual Environment (For Sensors)**
    ```bash
    cd ../Sensors
    python -m venv .venv
    # Activate:
    # Windows: .\.venv\Scripts\Activate
    # Mac/Linux: source .venv/bin/activate
    pip install -r requirements.txt
    ```

### ▶️ Running the Application

To experience the full system, you need to run both the Web Server and the IoT Simulation.

**1. Start the Web Server (Terminal 1)**
This starts the Next.js app and the Socket.io server.
```bash
# Inside /Interface
npm run dev
# Server will start at http://localhost:3777
```

**2. Start the Sensor Simulation (Terminal 2)**
This script acts as the IoT device, sending fake sensor data to the web dashboard.
```bash
# Inside the root /Sensors directory
.\.venv\Scripts\Activate
python simulation.py
```
> _You can now input values in the Python terminal (e.g., enter a weight) and see the Web Dashboard update instantly!_

---

## 🗄️ Database Setup & Connection

The project uses a lean MySQL database connected via `mysql2`. For local development, we use Docker to spin up a MySQL container that is automatically seeded with our exact `schema.sql`.

### Starting the Database
To start the database on your Mac, open a terminal in the root directory of this repository and run:
```bash
docker-compose up -d db
```
*(This will pull the MySQL image, map port `3306` to your Mac, and inject `schema.sql` into the container).*

### How to View the Tables (GUI Connection)
Because we mapped port `3306` to your localhost, you can easily view and manage your data using any database GUI client (like **TablePlus**, **DBeaver**, or **DataGrip**). 

Use these credentials to connect:
*   **Host:** `127.0.0.1` (or `localhost`)
*   **Port:** `3306`
*   **Username:** `root`
*   **Password:** `smartbaby`
*   **Database:** `smartbabyscale_db`

Once connected, you will see the 4 minimalist tables (`users`, `patients`, `vital_records`, `predictions`) ready to receive data!

---

## Deployment

This project supports deployment to cloud platforms and self-hosted PaaS. Since the application requires persistent WebSocket connections (Socket.io) for real-time sensor updates, serverless hosting (such as Vercel) is not supported.

### Hosting on Dokploy (Self-Hosted PaaS)

This project contains a [docker-compose.yml](file:///C:/pythonProjects/SmartBabyScale/SmartBabyScale/docker-compose.yml) and [Dockerfile](file:///C:/pythonProjects/SmartBabyScale/SmartBabyScale/Interface/Dockerfile) pre-configured for **Dokploy**:

1. **Create Compose App**: Log in to your Dokploy dashboard, create a new project, and add a **Compose** application.
2. **Repository Configuration**: Connect your Git repository and set the branch (e.g., `main`).
3. **Configure Path**: Ensure the compose path points to `docker-compose.yml` at the repository root.
4. **Environment Variables**:
   - Set `NODE_ENV` to `production`
   - Set `PORT` to `3777`
5. **Port Routing**: In the Dokploy application settings, route your domain's HTTP/HTTPS traffic (port 80/443) to container port `3777`.
6. **Deploy**: Click **Deploy**. Dokploy will pull the code, execute the multi-stage build, and run the container.

### Hosting on Render.com

1. Create a new **Web Service** on Render.
2. Set the **Root Directory** to `Interface`.
3. Set the **Build Command** to `npm install && npm run build`.
4. Set the **Start Command** to `npm start` (which runs `node server.js`).

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
