from flask import Flask, request
from analysis import analyze

app = Flask(__name__)

analyze.setup('./analysis')

MODEL = analyze.load_model('./analysis/models/rf_with_emotes')


def get_sentiment_label(s):
    return 'positive' if s == 1 else 'negative' if s == -1 else 'neutral'


@app.route('/predict', methods=['POST'])
def predict():
    sentiments = analyze.predict_messages([message['content']
        for message in request.json['messages']], MODEL).tolist()

    return { 'sentiments': sentiments }


@app.route('/report', methods=['GET'])
def report():
    return analyze.get_classification_report(MODEL, './analysis')


if __name__ == '__main__':
    app.run(host='localhost', port=8080, debug=True)
