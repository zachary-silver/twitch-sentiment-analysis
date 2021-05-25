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


def save_model(model, file):
    joblib.dump(model, '{}.joblib'.format(file), compress=3)


def load_model(file):
    return joblib.load('{}.joblib'.format(file))


def predict_message(message, model):
    return int(model.predict(get_vector(preprocess(message)).reshape(1, -1))[0])


def predict_messages(messages, model):
    if len(messages) < MAX_WORDS:
        return [predict_message(message, model) for message in messages]

    messages = [preprocess(message) for message in messages]

    return model.predict(get_vectors(messages)).tolist()


def get_classification_report(model, analysis_dir):
    twitch_file = '{}/data/labeled_dataset.csv'.format(analysis_dir)
    emotes_file = '{}/lexica/emote_average.tsv'.format(analysis_dir)

    twitch_messages, twitch_sentiments = get_twitch_data(twitch_file)
    emotes, emotes_sentiments = get_twitch_lexicon_data(emotes_file)

    messages = fit_and_get_vectors(twitch_messages + emotes)
    sentiments = twitch_sentiments + emotes_sentiments

    _, x_test, _, y_test = train_test_split(
            messages,
            sentiments,
            test_size=TEST_SIZE,
            random_state=RANDOM_STATE
            )

    predictions = model.predict(x_test)

    report = classification_report(y_test, predictions, output_dict=True)

    return report


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


def fit_and_get_vectors(messages):
    return VECTORIZER.fit_transform(messages).toarray()


def get_vectors(messages):
    return VECTORIZER.transform(messages).toarray()


def get_vector(message):
    return get_vectors([message])[0]


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

    return 1 if sentiment > 0.33 else (-1 if sentiment < -0.33 else 0)


def get_twitter_data():
    data = pandas.read_csv('./data/twitter_labeled_dataset.csv')
    data = data[data.sentiment != 'not_relevant']
    messages = [preprocess(message) for message in data['text']]
    sentiments = [normalize_twitter_sentiment(s) for s in data['sentiment']]

    return (messages, sentiments)


def get_twitch_data(file):
    data = pandas.read_csv(file)
    messages = [preprocess(message) for message in data['message']]
    sentiments = [s for s in data['sentiment']]

    return (messages, sentiments)


def get_twitch_lexicon_data(file):
    data = pandas.read_csv(file, sep='\t')
    emotes = [preprocess(emote) for emote in data['word']]
    sentiments = [normalize_emote_sentiment(s) for s in data['sentiment']]

    return (emotes, sentiments)


def setup(analysis_dir):
    twitch_file = '{}/data/labeled_dataset.csv'.format(analysis_dir)
    emotes_file = '{}/lexica/emote_average.tsv'.format(analysis_dir)

    twitch_messages, _ = get_twitch_data(twitch_file)
    emotes, _ = get_twitch_lexicon_data(emotes_file)

    fit_and_get_vectors(twitch_messages + emotes)


def main():
    twitch_file = './data/labeled_dataset.csv'
    emotes_file = './lexica/emote_average.tsv'

    twitch_messages, twitch_sentiments = get_twitch_data(twitch_file)
    emotes, emotes_sentiments = get_twitch_lexicon_data(emotes_file)

    messages = fit_and_get_vectors(twitch_messages + emotes)
    sentiments = twitch_sentiments + emotes_sentiments

    x_train, x_test, y_train, y_test = train_test_split(
            messages,
            sentiments,
            test_size=TEST_SIZE,
            random_state=RANDOM_STATE
            )

    model = get_rf_model(x_train, y_train)
    # model = load_model('./models/rf_with_emotes')
    # save_model(model, './models/rf_with_emotes')
    predictions = model.predict(x_test)

    print(classification_report(y_test, predictions))
    print('Accuracy:', accuracy_score(y_test, predictions))


if __name__ == '__main__':
    main()
