"""
SmartBabyScale - Machine Learning Training Script
This script trains the RBF SVM and MLP models to predict clinical instability (is_unstable)
using the 9 scale-measurable demographic and vital features.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    classification_report, confusion_matrix
)

def train_pipeline(data_path='MachineLearning/neonatal_dataset.csv'):
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        print("Please run the BigQuery SQL query, download the results as a CSV, and save it to that path first.")
        return
        
    print("Loading neonatal training dataset...")
    df = pd.read_csv(data_path)
    
    # 14 Features representing both scale sensors and optional bedside/lab metrics
    feature_cols = [
        'birth_weight_g', 'gestational_age_weeks', 'sga', 'apgar_score_5min',
        'current_weight_g', 'current_length_cm', 'lowest_temperature_celsius',
        'avg_heart_rate_bpm', 'lowest_spo2_percent',
        'mean_blood_pressure', 'po2_fio2_ratio', 'lowest_serum_ph', 'seizures', 'urine_output_ml_kg_hr'
    ]
    
    # Check that all features exist in the CSV
    missing_cols = [col for col in feature_cols if col not in df.columns]
    if missing_cols:
        print(f"Error: Missing columns in CSV: {missing_cols}")
        return
        
    if 'is_unstable' not in df.columns:
        print("Error: Target column 'is_unstable' not found in the CSV.")
        return
        
    X = df[feature_cols]
    y = df['is_unstable']
    
    print("\nClass Distribution (0 = Stable/Immunizable, 1 = Unstable/Sick):")
    print(y.value_counts())
    
    # Split: 80% train, 20% validation (stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # ------------------
    # 1. Train SVM Model
    # ------------------
    print("\nTraining RBF Support Vector Machine...")
    svm_model = SVC(kernel='rbf', C=1.0, gamma='scale', probability=True, random_state=42)
    svm_model.fit(X_train_scaled, y_train)
    
    svm_preds = svm_model.predict(X_test_scaled)
    svm_probs = svm_model.predict_proba(X_test_scaled)[:, 1]
    
    print("================ SVM Classifier Performance ================")
    print(f"Accuracy:  {accuracy_score(y_test, svm_preds)*100:.2f}%")
    print(f"F1-Score:  {f1_score(y_test, svm_preds):.4f}")
    print(f"ROC-AUC:   {roc_auc_score(y_test, svm_probs):.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, svm_preds, target_names=['Stable', 'Unstable']))
    
    # ------------------
    # 2. Train MLP Model
    # ------------------
    print("\nTraining Multi-Layer Perceptron (Neural Network)...")
    mlp_model = MLPClassifier(
        hidden_layer_sizes=(64, 32),
        activation='relu',
        solver='adam',
        max_iter=500,
        early_stopping=True,
        validation_fraction=0.1,
        random_state=42
    )
    mlp_model.fit(X_train_scaled, y_train)
    
    mlp_preds = mlp_model.predict(X_test_scaled)
    mlp_probs = mlp_model.predict_proba(X_test_scaled)[:, 1]
    
    print("================ MLP Classifier Performance ================")
    print(f"Accuracy:  {accuracy_score(y_test, mlp_preds)*100:.2f}%")
    print(f"F1-Score:  {f1_score(y_test, mlp_preds):.4f}")
    print(f"ROC-AUC:   {roc_auc_score(y_test, mlp_probs):.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, mlp_preds, target_names=['Stable', 'Unstable']))
    
    # ------------------
    # 3. Serialize Assets
    # ------------------
    print("\nSerializing trained assets...")
    models_dir = 'MachineLearning/models'
    os.makedirs(models_dir, exist_ok=True)
    
    joblib.dump(scaler, os.path.join(models_dir, 'input_scaler.joblib'))
    joblib.dump(svm_model, os.path.join(models_dir, 'svm_risk_model.joblib'))
    joblib.dump(mlp_model, os.path.join(models_dir, 'mlp_risk_model.joblib'))
    joblib.dump(feature_cols, os.path.join(models_dir, 'feature_columns.joblib'))
    
    print(f"All assets successfully exported to: {models_dir}/")

if __name__ == '__main__':
    train_pipeline()
