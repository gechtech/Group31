from flask import Flask, render_template, request, jsonify
from detector import analyze_input
from quid_pro_quo_detector import analyze_text as analyze_quid_pro_quo
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    url = request.form.get('url')
    text = request.form.get('text')
    result = analyze_input(url, text)
    quid_pro_quo_result = analyze_quid_pro_quo(text) if text else None
    return render_template('result.html', result=result, quid_pro_quo_result=quid_pro_quo_result)
@app.post("/api/detect/quid-pro-quo")
def detect_quid_pro_quo():
    try:
        payload = request.get_json(force=True) or {}
        text = (payload.get("text") or "").strip()
        if not text:
            return jsonify({"error": "text is required"}), 400
        result = analyze_quid_pro_quo(text)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
if __name__ == '__main__':
    app.run(debug=True)
