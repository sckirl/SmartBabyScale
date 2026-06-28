# SmartBabyScale: Smart Neonatal Monitoring System

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

> **SmartBabyScale** - A revolutionary non-invasive neonatal health monitoring system using SNAPPE-II metrics.

---

## About The Project

**SmartBabyScale** is a cutting-edge IoT application designed to assist medical professionals in the Neonatal Intensive Care Unit (NICU). By integrating precise hardware sensors with a modern real-time web interface, SmartBabyScale calculates the **SNAPPE-II (Score for Neonatal Acute Physiology-Perinatal Extension-II)** score to predict health risks in newborns without invasive procedures.

The system bridges the gap between hardware data collection and clinical decision-making, providing a unified dashboard for vital signs, growth tracking, and emergency alerts.

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

The system aggregates data from the following sensors (simulated in `SENSORS/simulation.py`):

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
    cd SENSORS
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
# Inside /Interface/SENSORS
.\.venv\Scripts\Activate
python simulation.py
```
> _You can now input values in the Python terminal (e.g., enter a weight) and see the Web Dashboard update instantly!_

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
