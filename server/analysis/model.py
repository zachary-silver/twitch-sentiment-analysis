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


def save_model(model, name):
    joblib.dump(model, './models/{}.joblib'.format(name), compress=3)


def load_model(name):
    return joblib.load('./models/{}.joblib'.format(name))


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


def get_tfidf_vectors(messages):
    vectorizer = TfidfVectorizer(
            max_features=MAX_WORDS,
            min_df=MIN_DOC_FREQUENCY,
            max_df=MAX_DOC_FREQUENCY,
            stop_words=stopwords.words('english')
            )

    return vectorizer.fit_transform(messages).toarray()


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


def normalize_sentiment(sentiment):
    return 1 if sentiment == '5' else (0 if sentiment == '3' else -1)


def get_twitter_data():
    data = pandas.read_csv('./data/twitter_labeled_dataset.csv')

    return data[data.sentiment != 'not_relevant']


def get_twitch_data():
    return pandas.read_csv('./data/labeled_dataset.csv')


def main():
    data = get_twitch_data()
    twitch_messages = [preprocess(message) for message in data['message']]
    twitch_sentiments = [s for s in data['sentiment']]

    data = get_twitter_data()
    twitter_messages = [preprocess(message) for message in data['text']]
    twitter_sentiments = [normalize_sentiment(s) for s in data['sentiment']]

    messages = get_tfidf_vectors(twitch_messages + twitter_messages)
    sentiments = twitch_sentiments + twitter_sentiments

    x_train, x_test, y_train, y_test = train_test_split(
            messages,
            sentiments,
            test_size=TEST_SIZE,
            random_state=RANDOM_STATE
            )

    # model = get_rf_model(x_train, y_train)
    # model = get_mlp_model(x_train, y_train)
    # model = load_model('mlp_50_iterations')
    model = load_model('random_forest')
    # save_model(model, 'mlp_50_iterations')
    predictions = model.predict(x_test)

    print(classification_report(y_test, predictions))
    print('Accuracy:', accuracy_score(y_test, predictions))


if __name__ == '__main__':
    main()
