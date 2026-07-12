# Raspberry Pi Handoff Context & Execution Plan

CONFIDENCE: EXTRACTED
RELATIONS:
- validates::[[pi_hardware_reader.py]]
- relates_to::[[Sensor Infrastructure]]
- relates_to::[[Architecture]]

---

## 1. Context Overview
We have completed a series of resilience refactors on the edge hardware script `Sensors/pi_hardware_reader.py`. These modifications ensure the script runs fully offline without the Next.js Socket.IO server running, and prevents crashes due to missing or broken python library dependencies (specifically the CircuitPython `digitalio` NameError).

## 2. Done (Key Implementation Details)
- **Asynchronous Socket.IO Connection:**
  `sio.connect` is moved to a background daemon thread. The main thread immediately launches `hardware_loop()`, allowing immediate bedside output (terminal and OLED) even if the Next.js server is down. Once Next.js starts, the background thread connects automatically.
- **Defensive Optional Imports:**
  Wrapped `socketio` and `joblib` imports in try/except blocks to define safety flags (`HAS_SOCKETIO` and `HAS_JOBLIB`). If they are missing, it falls back to clinical rules instead of ML and runs in local-only mode.
- **The `digitalio` NameError Bug Fix:**
  `adafruit_ssd1306` contains an internal bug where it crashes on import with `NameError: name 'digitalio' is not defined` if `gpiod`/`Adafruit-Blinka` has a loading issue.
  We implemented a **runtime module injector** that dynamically mocks `digitalio` in `sys.modules` if importing it fails. Since the SSD1306 screen uses I2C and does not use the reset pin, this mock allows `adafruit_ssd1306` to load successfully and **still communicate 100% directly with the physical screen over I2C**.
- **ML Loading Optimization:**
  ML model loading (`load_ml_assets()`) is run immediately on start and guarded with `if is_ml_loaded: return` to prevent double-loading.

## 3. Environment Dependencies on the Pi
To run 100% on physical hardware without mock fallback, ensure the following packages are installed on the Pi:
- **System packages (apt):**
  `sudo apt install -y gpiod libgpiod-dev` (essential for Blinka to speak to Pi 5 GPIO/RP1 chip).
- **Python packages (pip/venv):**
  `pip install Adafruit-Blinka gpiod adafruit-circuitpython-ssd1306 Pillow scikit-learn websocket-client`

## 4. Next Steps for Handoff Agent on the Pi
1. **Pull the latest changes:**
   Merge/pull the latest commits from `origin/master` (the changes are saved on the host Mac workspace):
   ```bash
   git pull origin master
   ```
2. **Launch Node/Next.js Interface (Optional):**
   To check Socket.IO data transmission, run the server bound to `0.0.0.0` (all interfaces) to allow remote browser access from other machines:
   ```bash
   HOST=0.0.0.0 npm run dev
   ```
3. **Execute Hardware Reader:**
   Verify terminal bedside dashboards and local OLED displays:
   ```bash
   python Sensors/pi_hardware_reader.py
   ```
4. **Stress Test:**
   - Turn off the Next.js server, verify the python script starts instantly in `DISCONNECTED` status, and prints telemetry to the terminal/OLED.
   - Start the Next.js server, verify it transitions to `CONNECTED` and streams data seamlessly.
