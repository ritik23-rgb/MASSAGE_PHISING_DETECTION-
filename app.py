from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import re
from deep_translator import GoogleTranslator

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # ✅ Allow cross-origin requests (Frontend <-> Backend)

# Load model and vectorizer
model = joblib.load("phishing_model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

# Simulated blockchain logger
def log_to_blockchain_simulated(message):
    print(f"🔗 [BLOCKCHAIN LOGGED] {message}")

# Clean up message text
def clean_text(text):
    text = re.sub(r"http\S+|www\S+|https\S+", "", text)
    return text.lower()

# 🔍 Analyze endpoint
@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    message = data.get("message", "")

    if not message:
        return jsonify({"error": "Message text is required"}), 400

    # 🌐 Translate to English
    try:
        message = GoogleTranslator(source='auto', target='en').translate(message)
    except Exception as e:
        print("Translation failed:", str(e))

    # 🧹 Preprocess message
    processed_text = clean_text(message)
    vectorized = vectorizer.transform([processed_text])
    prediction = model.predict(vectorized)[0]

    # 🧠 Prediction mapping
    result_map = {0: "Safe", 1: "Suspicious", 2: "Malicious"}
    result = result_map.get(prediction, "Unknown")

    # 🧾 Blockchain logging simulation
    if result == "Malicious":
        log_to_blockchain_simulated(message)

    # 🚩 Keyword-based scam note
    job_keywords = ["job", "hiring", "interview", "salary", "apply now", "recruitment", "vacancy"]
    scam_alert = None
    if any(word in processed_text for word in job_keywords):
        scam_alert = "⚠️ This may be a fake job scam message."

    return jsonify({
        "status": result,
        "note": scam_alert if scam_alert else "",
        "keywords": [kw for kw in job_keywords if kw in processed_text]
    })

# ✅ Feedback endpoint
@app.route('/feedback', methods=['POST'])
def feedback():
    data = request.json
    message = data.get("message")
    predicted = data.get("predicted") or data.get("result")  # fallback for frontend compatibility
    correct = data.get("correct")

    if not message or predicted is None or correct is None:
        return jsonify({"error": "Invalid feedback data"}), 400

    try:
        with open("feedback_data.csv", "a", encoding="utf-8") as f: #unsafe
            f.write(f'"{message.replace(chr(10), " ").replace(chr(13), "")}","{predicted}",{correct}\n')
        return jsonify({"success": True})
    except Exception as e:
        print("Feedback save error:", e)
        return jsonify({"error": "Failed to save feedback"}), 500

# 🏃 Run app
if __name__ == '__main__':
    app.run(debug=True)
