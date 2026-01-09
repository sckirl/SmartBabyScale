# 👶 EPOSREM: Smart Neonatal Monitoring System

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

> **"Electronic POSition & REspiratory Monitoring"** - A revolutionary non-invasive neonatal health monitoring system using SNAPPE-II metrics.

---

## 🏥 About The Project

**EPOSREM** is a cutting-edge IoT application designed to assist medical professionals in the Neonatal Intensive Care Unit (NICU). By integrating precise hardware sensors with a modern real-time web interface, EPOSREM calculates the **SNAPPE-II (Score for Neonatal Acute Physiology-Perinatal Extension-II)** score to predict health risks in newborns without invasive procedures.

The system bridges the gap between hardware data collection and clinical decision-making, providing a unified dashboard for vital signs, growth tracking, and emergency alerts.

### 🌟 Key Features

*   **⚡ Real-Time Monitoring:** Live streaming of vital signs (Heart Rate, SpO2, Temp) via WebSocket.
*   **📊 Smart Growth Charts:** Interactive visualization of anthropometric data (Weight, Length) over time.
*   **🤖 AI-Powered Risk Prediction:** Utilizes MLP & SVM models to classify health risks based on sensor data.
*   **🚨 Emergency Alerts:** Instant visual notifications for abnormal vital signs.
*   **📱 Responsive Design:** Built with **Shadcn/UI** and **Tailwind CSS** for a seamless experience on tablets and desktops.

---

## 🛠️ Architecture & Tech Stack

EPOSREM employs a Hybrid Architecture combining a robust Node.js server for real-time communication and a Next.js frontend for the user interface.

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
| ⚖️ **HX711** | Weight Sensor | ±50 gram |
| 📏 **HC-SR04** | Ultrasonic Length Sensor | Automated measurement |
| 🌡️ **MLX90614** | Infrared Thermometer | Contactless temperature |
| ❤️ **GY-MAX30102** | Pulse Oximeter | SpO2 & Heart Rate |
| 📷 **Raspi Cam** | Visual Feed | Real-time baby monitoring |

---

## 🚀 Getting Started

Follow these steps to set up the EPOSREM environment locally.

### Prerequisites

*   **Node.js** (v18+)
*   **Python** (v3.10+)
*   **Git**

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/EPOSREM.git
    cd EPOSREM/Interface
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
# Server will start at http://localhost:3000
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

## ☁️ Deployment

This project is configured for **Render.com** (or any platform supporting persistent Node.js processes).

*   **Root Directory:** `Interface`
*   **Build Command:** `npm install && npm run build`
*   **Start Command:** `npm start` (Runs `node server.js`)

**Note:** Serverless platforms like Vercel are **not recommended** for the backend because they do not support the persistent WebSocket connections required for real-time monitoring.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request