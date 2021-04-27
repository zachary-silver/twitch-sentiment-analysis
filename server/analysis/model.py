import re
import pandas
import joblib

from nltk.corpus import stopwords

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
from sklearn.neural_network import MLPClassifier


MAX_WORDS = 1000
MIN_DOC_FREQUENCY = 1
MAX_DOC_FREQUENCY = 0.80
TEST_SIZE = 0.20
RANDOM_STATE = 0
ITERATIONS = 50

VECTORIZER = TfidfVectorizer(
        max_features=MAX_WORDS,
        min_df=MIN_DOC_FREQUENCY,
        max_df=MAX_DOC_FREQUENCY,
        stop_words=stopwords.words('english')
        )


def save_model(model, name):
    joblib.dump(model, './models/{}.joblib'.format(name), compress=3)


def load_model(name):
    return joblib.load('./models/{}.joblib'.format(name))


def predict(message, model):
    return model.predict(get_vector(message).reshape(1, -1))


def get_mlp_model(messages, sentiments):
    mlp_classifier = MLPClassifier(
            solver='adam',
            hidden_layer_sizes=(150, 100, 50),
            max_iter=ITERATIONS,
            random_state=1
            )
    mlp_classifier.fit(messages, sentiments)

    return mlp_classifier


def get_rf_model(messages, sentiments):
    rf_classifier = RandomForestClassifier(
            n_estimators=200,
            random_state=RANDOM_STATE
            )
    rf_classifier.fit(messages, sentiments)

    return rf_classifier


def get_vectors(messages):
    return VECTORIZER.fit_transform(messages).toarray()


def get_vector(message):
    return VECTORIZER.transform([message]).toarray()[0]


def preprocess(message):
    # Remove @'s
    message = re.sub(r'@\S+', '', message)

    # Remove single quotes
    message = re.sub(r'\'', '', message)

    # Remove all the special characters
    message = re.sub(r'\W', ' ', message)

    # Substituting multiple spaces with single space
    message = re.sub(r'\s+', ' ', message, flags=re.I)

    return message.strip().lower()


def normalize_twitter_sentiment(sentiment):
    return 1 if sentiment == '5' else (0 if sentiment == '3' else -1)


def normalize_emote_sentiment(sentiment):
    sentiment = float(sentiment)

    if (sentiment > 0.33):
        return 1
    if (sentiment < -0.33):
        return -1

    return 0


def get_twitter_data():
    data = pandas.read_csv('./data/twitter_labeled_dataset.csv')
    data = data[data.sentiment != 'not_relevant']
    messages = [preprocess(message) for message in data['text']]
    sentiments = [normalize_twitter_sentiment(s) for s in data['sentiment']]

    return (messages, sentiments)


def get_twitch_data():
    data = pandas.read_csv('./data/labeled_dataset.csv')
    messages = [preprocess(message) for message in data['message']]
    sentiments = [s for s in data['sentiment']]

    return (messages, sentiments)


def get_twitch_lexicon_data():
    data = pandas.read_csv('./lexica/emote_average.tsv', sep='\t')
    emotes = [preprocess(emote) for emote in data['word']]
    sentiments = [normalize_emote_sentiment(s) for s in data['sentiment']]

    return (emotes, sentiments)


def main():
    twitch_messages, twitch_sentiments = get_twitch_data()
    emotes, emotes_sentiments = get_twitch_lexicon_data()
    # twitter_messages, twitter_sentiments = get_twitter_data()
    # twitter_messages = twitter_messages[:len(twitch_messages)]
    # twitter_sentiments = twitter_sentiments[:len(twitch_sentiments)]

    messages = get_vectors(twitch_messages + emotes)
    sentiments = twitch_sentiments + emotes_sentiments

    x_train, x_test, y_train, y_test = train_test_split(
            messages,
            sentiments,
            test_size=TEST_SIZE,
            random_state=RANDOM_STATE
            )

    model = get_rf_model(x_train, y_train)
    # model = get_mlp_model(x_train, y_train)
    # model = load_model('rf_with_emotes')
    # save_model(model, 'rf_with_emotes')
    predictions = model.predict(x_test)

    print(classification_report(y_test, predictions))
    print('Accuracy:', accuracy_score(y_test, predictions))


if __name__ == '__main__':
    main()
