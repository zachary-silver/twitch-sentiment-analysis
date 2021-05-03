from flask import Flask, request
from analysis import analyze

app = Flask(__name__)

analyze.setup('./analysis')

MODEL = analyze.load_model('./analysis/models/rf_with_emotes')


def get_sentiment_label(s):
    return 'positive' if s == 1 else 'negative' if s == -1 else 'neutral'


@app.route('/predict', methods=['POST'])
def predict():
    sentiments = [get_sentiment_label(sentiment)
            for sentiment in analyze.predict_messages([message['content']
                for message in request.json['messages']], MODEL)]

    return { 'sentiments': sentiments }


if __name__ == '__main__':
    app.run(host='localhost', port=8080, debug=True)
