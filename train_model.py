from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split

# Load the dataset (replace 'phishing_data.csv' with your actual dataset)
# The dataset should have two columns: 'text' and 'label' (0 = safe, 1 = suspicious, 2 = malicious)
df = pd.read_csv("phishing_data.csv")

# Display basic info about the dataset
print(f"Dataset shape: {df.shape}")
print(f"Dataset columns: {df.columns}")

# Preprocess data
texts = df['text'].tolist()
labels = df['label'].tolist()

# Split dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(texts, labels, test_size=0.2, random_state=42)

# Vectorization
vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
X_train_vect = vectorizer.fit_transform(X_train)
X_test_vect = vectorizer.transform(X_test)

# Train the model
model = MultinomialNB()
model.fit(X_train_vect, y_train)

# Evaluate the model
accuracy = model.score(X_test_vect, y_test)
print(f"Model accuracy: {accuracy * 100:.2f}%")

# Save the model and vectorizer
joblib.dump(model, "phishing_model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")
print("✅ Model and vectorizer saved.")
