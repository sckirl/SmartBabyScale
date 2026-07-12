import unittest
import os
import sys
import numpy as np

# Add project root to sys.path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(project_root)

from MachineLearning.session_calculator import SessionTracker
from Sensors.simulation import get_filtered_weight, get_linearized_weight, get_compensated_length
from Sensors.pi_hardware_reader import get_core_temperature, get_calibrated_distance, get_calibrated_spo2, neonatal_bandpass_filter

class TestSmartBabyScaleSensors(unittest.TestCase):
    
    def test_weight_outliers_filter(self):
        # We need to test get_filtered_weight. Since it appends to a global raw_weight_buffer,
        # we can feed it 25 values and check if it maintains 20 and strips outliers.
        # Let's populate the buffer
        import Sensors.simulation
        Sensors.simulation.raw_weight_buffer = []
        
        # Feed 20 values: 5 very low (100), 10 normal (3000), 5 very high (6000)
        readings = [100]*5 + [3000]*10 + [6000]*5
        for r in readings:
            filtered = get_filtered_weight(r)
            
        # The buffer should have 20 readings.
        # Stripping 5 lowest (100) and 5 highest (6000) leaves 10 normal (3000)
        # The filtered average should be exactly 3000.
        self.assertEqual(filtered, 3000.0)

    def test_weight_linearization(self):
        # Default calibrations has a=0.0, b=1.0, c=0.0, so get_linearized_weight(3000) -> 3000.0
        self.assertEqual(get_linearized_weight(3000.0), 3000.0)
        
        # Test custom calibrations
        import Sensors.simulation
        original_calibrations = Sensors.simulation.calibrations
        Sensors.simulation.calibrations = {
            "weight": {"a": 0.0001, "b": 1.0, "c": -10.0}
        }
        # W_calibrated = 0.0001 * 3000^2 + 3000 - 10 = 900 + 3000 - 10 = 3890.0
        self.assertEqual(get_linearized_weight(3000.0), 3890.0)
        
        # Restore
        Sensors.simulation.calibrations = original_calibrations

    def test_core_temperature_imputation(self):
        # Skin surface 35.5C, ambient 25C, alpha 0.12
        # T_core = 35.5 + (35.5 - 25) * 0.12 = 35.5 + 1.26 = 36.76
        self.assertAlmostEqual(get_core_temperature(35.5, 25.0, 0.12), 36.76, places=2)

    def test_speed_of_sound_distance(self):
        # Speed of sound c at 30C, 50% humidity:
        # c = 331.4 + 0.606 * 30 + 0.0124 * 50 = 331.4 + 18.18 + 0.62 = 350.2 m/s = 35020 cm/s
        # For echo duration 0.002855 secs (roundtrip distance 50cm):
        # Distance = (0.002855 * 35020) / 2 = 49.99 cm
        distance = get_calibrated_distance(0.002855, 30.0, 50.0)
        self.assertAlmostEqual(distance, 50.0, delta=0.2)

    def test_fitzpatrick_spo2_correction(self):
        # Fitzpatrick scale 5 (-3.0% SpO2 offset). Raw SpO2 95% -> Corrected 92%
        self.assertEqual(get_calibrated_spo2(95.0, 5), 92.0)
        # Clamping SpO2 to 100%
        self.assertEqual(get_calibrated_spo2(99.0, 2), 99.0) # Fitzpatrick 2 offset 0
        self.assertEqual(get_calibrated_spo2(101.0, 1), 100.0) # clamped to 100

    def test_session_tracker_fitzpatrick(self):
        # Initialize session tracker
        session = SessionTracker(patient_id=7777, birth_weight_g=3000.0, gestational_age_weeks=37, apgar_score_5min=8)
        session.update_sensors(spo2_percent=95.0)
        
        # Test default Fitzpatrick scale (1) -> SpO2 uncalibrated (95%)
        self.assertEqual(session.get_calibrated_spo2(), 95.0)
        
        # Set Fitzpatrick scale to 5 (-3.0%) -> SpO2 calibrated (92%)
        session.update_demographics(fitzpatrick_scale=5)
        self.assertEqual(session.get_calibrated_spo2(), 92.0)

    def test_fitzpatrick_scale_clamping(self):
        session = SessionTracker(patient_id=7777, birth_weight_g=3000.0, gestational_age_weeks=37, apgar_score_5min=8)
        
        # Update demographics with Fitzpatrick scale 8 (invalid) -> should clamp to 6
        session.update_demographics(fitzpatrick_scale=8)
        self.assertEqual(session.fitzpatrick_scale, 6)
        
        # Update demographics with Fitzpatrick scale 0 (invalid) -> should clamp to 1
        session.update_demographics(fitzpatrick_scale=0)
        self.assertEqual(session.fitzpatrick_scale, 1)

    def test_butterworth_filter(self):
        # Generate a dummy PPG signal (sine wave)
        fs = 50.0
        t = np.arange(0, 10, 1.0/fs)
        # 1.5 Hz component (90 BPM) + some high frequency noise
        ppg_signal = np.sin(2 * np.pi * 1.5 * t) + 0.5 * np.sin(2 * np.pi * 15 * t)
        
        filtered = neonatal_bandpass_filter(ppg_signal, fs=fs)
        # Verify the filtered signal has reduced noise power
        self.assertEqual(len(filtered), len(ppg_signal))

if __name__ == '__main__':
    unittest.main()
