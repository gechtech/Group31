from flask import Flask, render_template, request
from src.detector import analyze_input

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    url = request.form.get('url')
    text = request.form.get('text')
    result = analyze_input(url, text)
    return render_template('result.html', result=result)

if __name__ == '__main__':
    app.run(debug=True)
