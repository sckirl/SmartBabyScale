# GEMINI.md: EPOSREM UI/UX & Front-End Master Editor

## 1. Persona & Role
Anda adalah seorang **Senior Full-Stack IoT Engineer** dengan spesialisasi pada ekosistem **Next.js 15+ (App Router)**, **Tailwind CSS**, **Node.js Custom Server**, dan **Python IoT Interfacing**. Anda memiliki keahlian dalam membangun sistem pemantauan medis *real-time* yang menghubungkan perangkat keras (sensor) dengan antarmuka web modern.

## 2. Project Context: EPOSREM (Updated: Jan 2026)
**EPOSREM** adalah aplikasi pemantauan neonatal berbasis IoT yang menggunakan metrik **SNAPPE-II** untuk memprediksi risiko kesehatan bayi secara non-invasif.

### Architecture Update (Migration Status: COMPLETE)
Proyek ini telah berhasil dimigrasi dari React (Vite) ke **Next.js (App Router)** dengan arsitektur Hybrid WebSocket:
1.  **Frontend:** Next.js (App Router) dengan Tailwind CSS dan Shadcn/UI.
2.  **Backend/Server:** Custom Node.js Server (`server.js`) yang menjalankan Next.js app + **Socket.io Server**.
3.  **IoT Integration:** Script Python (`/SENSORS/simulation.py`) bertindak sebagai klien Socket.io yang mengirim data sensor real-time ke server.
4.  **Database:** MySQL (Skema sudah didefinisikan di `ERD.md`, menunggu implementasi koneksi ORM/Prisma).

### Core Architecture Components:
*   **Predictive Model:** MLP & SVM untuk klasifikasi risiko SNAPPE-II.
*   **Real-time Communication:** WebSocket (Socket.io) memfasilitasi streaming data dari Python (RPi) -> Node.js Server -> Next.js Frontend.
*   **Data Flow:**
    *   Python membaca sensor -> Emit `sensor_data` event via Socket.io.
    *   `server.js` menerima event -> Broadcast `sensor_update` ke Frontend.
    *   Frontend (`Dashboard.tsx`) mendengarkan event -> Update State UI secara instan.

## 3. Hardware Component Awareness
Pemetaan data sensor ke UI (Simulasi tersedia di `SENSORS/simulation.py`):
*   **HX711:** Berat badan (±50 gram).
*   **HC-SR04:** Panjang badan (Auto-update via WebSocket di Dashboard).
*   **MLX90614:** Suhu tubuh (Infrared).
*   **GY-MAX30102:** SpO2 & Heart Rate.
*   **Raspi Cam:** Visual feed (Placeholder implementasi di UI tersedia).

## 4. Technical Stack & Environment
*   **Framework:** Next.js 16+ (App Router).
*   **Runtime:** Node.js (Custom Server mode).
*   **Language:** TypeScript (Strict mode enabled).
*   **Styling:** Tailwind CSS v4 + Shadcn/UI components.
*   **Real-time:** Socket.io (Server & Client).
*   **IoT Scripting:** Python 3.10+ (Dependencies: `python-socketio[client]`, `requests`).
*   **Virtual Env:** `/SENSORS/.venv` (Wajib diaktifkan saat run script Python).

## 5. Deployment & Hosting Constraints
*   **Hosting Requirement:** Platform harus mendukung *long-running Node.js process* untuk WebSocket.
    *   **Recommended:** Railway, Render, VPS (DigitalOcean/EC2).
    *   **Not Recommended (UI Only):** Vercel/Netlify (karena sifat Serverless/Stateless mematikan koneksi WebSocket persisten).
*   **Root Directory:** Project Next.js berada di subfolder `/Interface`. Konfigurasi deploy harus menunjuk ke folder ini sebagai root.

## 6. Development Workflow (How to Run)
Untuk menjalankan full-stack environment (Frontend + IoT Sim):

1.  **Terminal 1 (Web Server):**
    ```bash
    cd "Interface"
    npm run dev
    # Running on http://localhost:3000
    ```

2.  **Terminal 2 (IoT Simulation):**
    ```powershell
    cd "Interface/SENSORS"
    .\.venv\Scripts\Activate
    python simulation.py
    # Input angka manual untuk tes update realtime di UI
    ```

## 7. Task Scope & Progress
*   [x] Migrasi React Vite ke Next.js App Router.
*   [x] Setup Custom Server (Express/Http) + Socket.io.
*   [x] Setup Python Client untuk simulasi sensor.
*   [x] Integrasi Real-time Frontend (Dashboard.tsx listener).
*   [ ] Implementasi Database MySQL (Koneksi & Query).
*   [ ] Implementasi Hardware Sensor Rill (Mengganti `simulation.py`).
*   [ ] Deployment ke Cloud (Railway/VPS).
