from flask import Flask, request
from analysis import analyze

app = Flask(__name__)

analyze.setup('./analysis')

MODEL = analyze.load_model('./analysis/models/rf_with_emotes')


@app.route('/predict', methods=['POST'])
def predict():
    sentiments = analyze.predict_messages([message['content']
        for message in request.json['messages']], MODEL)

    return { 'sentiments': sentiments }


@app.route('/report', methods=['GET'])
def report():
    return analyze.get_classification_report(MODEL, './analysis')
