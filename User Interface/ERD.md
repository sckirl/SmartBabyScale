# EPOSREM Database Schema - Entity Relationship Diagram (ERD)

Berikut adalah visualisasi struktur database untuk sistem EPOSREM. Diagram ini ditulis menggunakan format **Mermaid**, yang kompatibel dengan banyak viewer Markdown (seperti GitHub, GitLab, Notion, Obsidian) dan editor kode (VS Code dengan ekstensi Mermaid).

```mermaid
erDiagram
    %% Relations
    USERS ||--o{ ACTIVITY_LOGS : "logs (one-to-many)"
    USERS ||--o{ CLINICAL_NOTES : "authors (one-to-many)"
    PATIENTS ||--o{ VITAL_RECORDS : "monitored via (one-to-many)"
    PATIENTS ||--o{ ACTIVITY_LOGS : "has (one-to-many)"
    PATIENTS ||--o{ CLINICAL_NOTES : "has (one-to-many)"

    %% Entities
    USERS {
        int id PK
        string username
        string email
        string password_hash
        string full_name
        enum role "admin, doctor, nurse"
        datetime created_at
    }

    PATIENTS {
        int id PK
        string mrn "Medical Record Number (Unique)"
        string full_name
        datetime date_of_birth
        enum gender "male, female"
        string parent_name
        string contact_number
        datetime admission_date
        enum status "active, discharged, critical"
        datetime created_at
    }

    VITAL_RECORDS {
        bigint id PK
        int patient_id FK
        datetime recorded_at "Time Series Timestamp"
        decimal weight_kg "Sensor: HX711"
        decimal length_cm "Sensor: HC-SR04"
        int heart_rate_bpm "Sensor: GY-MAX30102"
        int spo2_percent "Sensor: GY-MAX30102"
        decimal temperature_celsius "Sensor: MLX90614"
        decimal snappe_ii_score "ML Output"
        enum risk_level "low, medium, high (Generated)"
    }

    ACTIVITY_LOGS {
        bigint id PK
        int patient_id FK
        enum activity_type "feeding, sleep, diaper, medication"
        datetime start_time
        datetime end_time
        text details
        int logged_by_user_id FK
        datetime created_at
    }

    CLINICAL_NOTES {
        int id PK
        int patient_id FK
        int author_user_id FK "Null if AI Generated"
        enum note_type "doctor_note, ai_insight, alert"
        text content
        enum severity "info, warning, critical"
        datetime created_at
    }
```

## Keterangan Entitas

1.  **USERS**: Menyimpan data tenaga medis (Dokter/Perawat) yang memiliki akses login.
2.  **PATIENTS**: Data demografis bayi yang sedang dirawat. Kolom `mrn` adalah unique identifier medis.
3.  **VITAL_RECORDS**: Tabel *High-frequency* untuk menyimpan data sensor IoT. Setiap baris mewakili satu "snapshot" pembacaan sensor pada waktu tertentu.
4.  **ACTIVITY_LOGS**: Mencatat interaksi manual seperti pemberian susu, waktu tidur, atau penggantian popok.
5.  **CLINICAL_NOTES**: Menyimpan catatan kualitatif dari dokter maupun *insight* otomatis yang dihasilkan oleh AI/RAG agent.
