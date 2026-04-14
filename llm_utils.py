import requests
import json

# Define the 22 Scheduled Languages of India + English
LANGUAGES = {
    "English": "English",
    "Assamese": "অসমীয়া",
    "Bengali": "বাংলা",
    "Bodo": "बर'",
    "Dogri": "डोगरी",
    "Gujarati": "ગુજારાતી",
    "Hindi": "हिन्दी",
    "Kannada": "ಕನ್ನಡ",
    "Kashmiri": "کٲشُر",
    "Konkani": "कोंकणी",
    "Maithili": "मैथिली",
    "Malayalam": "മലയാളം",
    "Manipuri": "মৈতেইললোন",
    "Marathi": "मराठी",
    "Nepali": "नेपाली",
    "Odia": "ଓଡ଼ିଆ",
    "Punjabi": "ਪੰਜਾਬੀ",
    "Sanskrit": "संस्कृतम्",
    "Santali": "संताली",
    "Sindhi": "سنڌي",
    "Tamil": "தமிழ்",
    "Telugu": "తెలుగు",
    "Urdu": "اردو"
}

def generate_responsibility_explanation(metrics, decision, thresholds=None, target_language="Hindi"):
    """
    Generates a localized, layman-friendly explanation of the Responsibility Score calculation.
    """
    
    # Extract metrics for the prompt
    similarity = metrics.get("Top-1 Similarity (S)", 0)
    margin = metrics.get("Margin (M)", 0)
    certainty = metrics.get("Certainty (U)", 0)
    score_r = metrics.get("Responsibility Score (R)", 0)
    
    # Pre-calculated components for the AI to reference
    w_sim = 0.7 * similarity
    w_mar = 0.15 * margin
    w_cer = 0.15 * certainty
    
    t_acc = thresholds.get("Accept Threshold", "N/A") if thresholds else "N/A"
    t_rev = thresholds.get("Review Threshold", "N/A") if thresholds else "N/A"
    
    prompt = f"""
    You are an AI expert explaining a "Responsibility Score" (R) in a Face Recognition System.
    The goal is to explain the calculation step-by-step to a layman in {target_language}.
    
    CRITICAL INSTRUCTION:
    The ENTIRE response MUST be in {target_language}. Do not keep any English sentences, explanations, or conclusions. Only the metric names (S, M, U, R) can remain in English letters if necessary.
    
    Mathematical Context:
    Formula: R = (0.7 * Similarity) + (0.15 * Margin) + (0.15 * Certainty)
    
    Values:
    - Similarity (S): {similarity:.4f} -> Weighted Contribution (0.7 * S): {w_sim:.4f}
    - Margin (M): {margin:.4f} -> Weighted Contribution (0.15 * M): {w_mar:.4f}
    - Certainty (U): {certainty:.4f} -> Weighted Contribution (0.15 * U): {w_cer:.4f}
    - Final Computed Score (R): {score_r:.4f}
    
    Decision Context:
    - Accept Threshold: {t_acc}
    - Review Threshold: {t_rev}
    - Final Decision: {decision}
    
    Task:
    1. Start with a friendly greeting in {target_language}.
    2. Explain the Responsibility Score (R) as a total of 1.0 (or 100%).
    3. Show the breakdown: Explain exactly how {w_sim:.2f}, {w_mar:.2f}, and {w_cer:.2f} were added to reach {score_r:.2f}.
    4. Explain why this score led to the decision "{decision}" by comparing it to the thresholds ({t_acc} and {t_rev}).
    5. Ensure the tone is simple, avoiding technical jargon, and EVERYTHING is translated into {target_language}.
    """
    
    payload = {
        "model": "gemma2:2b",
        "prompt": prompt,
        "stream": False
    }
    
    try:
        response = requests.post("http://localhost:11434/api/generate", json=payload, timeout=120)
        if response.status_code == 200:
            result = response.json()
            return result.get("response", "Could not generate explanation.")
        else:
            return f"Error: Model server returned status {response.status_code}"
    except Exception as e:
        # Fallback explanation if model is unreachable
        return f"Model server unreachable. (Error: {str(e)})\n\n[Fallback Explanation in English]: The Responsibility Score is {score_r:.2f}. A score of {decision} was given because the similarity was {similarity:.2f} and the system was {certainty:.2f} certain."

def get_native_languages():
    return LANGUAGES
