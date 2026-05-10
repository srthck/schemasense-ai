import os
import pandas as pd
import numpy as np
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score
from feature_extractor import extract_features

def main():
    # --- Phase 4 / Step 5: Implement Training Pipeline ---
    dataset_path = os.path.join("data", "dataset.csv")
    if not os.path.exists(dataset_path):
        print(f"Error: {dataset_path} not found.")
        return

    print("Loading dataset...")
    df = pd.read_csv(dataset_path)

    print("Generating feature vectors...")
    # Apply feature extraction to each row
    X = np.array([extract_features(row['key_name'], row['sample_value']) for _, row in df.iterrows()])
    
    print("Encoding labels...")
    le = LabelEncoder()
    y = le.fit_transform(df['label'])

    print("Splitting dataset (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Scaling features using StandardScaler...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # --- Phase 4 / Step 6: Train Baseline Model ---
    print("Training LogisticRegression model...")
    model = LogisticRegression(max_iter=1000, multi_class='multinomial', random_state=42)
    model.fit(X_train_scaled, y_train)

    # --- Phase 4 / Step 7: Evaluate Model ---
    print("\nEvaluating Model Performance:")
    y_pred = model.predict(X_test_scaled)
    
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average='weighted')
    
    print(f"Accuracy: {acc:.4f}")
    print(f"Weighted F1-Score: {f1:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    # --- Phase 4 / Step 8: Generate Confusion Matrix Image ---
    print("Generating confusion matrix...")
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=le.classes_, yticklabels=le.classes_)
    plt.title('Semantic Prediction Confusion Matrix')
    plt.ylabel('Actual Label')
    plt.xlabel('Predicted Label')
    
    os.makedirs('outputs', exist_ok=True)
    plt.tight_layout()
    plt.savefig(os.path.join('outputs', 'confusion_matrix.png'))
    print("Saved: outputs/confusion_matrix.png")

    # --- Phase 4 / Step 9: Save Model Artifacts ---
    print("Saving model artifacts...")
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, os.path.join('models', 'semantic_v1.pkl'))
    joblib.dump(le, os.path.join('models', 'label_encoder.pkl'))
    joblib.dump(scaler, os.path.join('models', 'scaler.pkl'))
    print("Saved: models/ semantic_v1.pkl, label_encoder.pkl, scaler.pkl")

    print("\nValidation Complete: Model trained and artifacts saved successfully.")

if __name__ == "__main__":
    main()
