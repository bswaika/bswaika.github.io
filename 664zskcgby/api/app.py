from flask import Flask
from flask_cors import CORS
import requests
from datetime import datetime 
from dateutil.relativedelta import relativedelta as delta

HOST = '127.0.0.1'
PORT = '3000'
DEBUG = True

# c7q7ffiad3i9it661va0 | sandbox_c7q7ffiad3i9it661vag

API_KEY = 'c7q7ffiad3i9it661va0'
BASE_URL = 'https://finnhub.io/api/v1'

app = Flask(__name__)
CORS(app, origins=['http://localhost:5500'])

def profile(ticker):
    payload = {'symbol': ticker, 'token': API_KEY}
    url = BASE_URL + '/stock/profile2'
    r = requests.get(url, params=payload)
    result = r.json()
    if result:
        result = {
            'symbol': result['ticker'],
            'code': result['exchange'],
            'logo': result['logo'],
            'name': result['name'],
            'ipo': result['ipo'],
            'category': result['finnhubIndustry'],
        }
        return result
    return None

def summary(ticker):
    payload = {'symbol': ticker, 'token': API_KEY}
    url = BASE_URL + '/quote'
    r = requests.get(url, params=payload)
    result = r.json()
    return result

def chart(ticker):
    today = datetime.now()
    past_half_year = today - delta(months=6, days=1)
    payload = {'symbol': ticker, 'resolution': 'D', 'from': int(datetime.timestamp(past_half_year)), 'to': int(datetime.timestamp(today)), 'token': API_KEY}
    url = BASE_URL + '/stock/candle'
    r = requests.get(url, params=payload)
    result = r.json()
    return result

def news(ticker):
    today = datetime.now().date()
    past_half_year = today - delta(months=6, days=1)
    payload = {'symbol': ticker, 'from': past_half_year, 'to': today, 'token': API_KEY}
    url = BASE_URL + '/company-news'
    r = requests.get(url, params=payload)
    result = r.json()
    return result

def recommendation(ticker):
    payload = {'symbol': ticker, 'token': API_KEY}
    url = BASE_URL + '/stock/recommendation'
    r = requests.get(url, params=payload)
    result = r.json()
    return result[0]

@app.route('/<ticker>')
def index(ticker):
    result = {}
    result['profile'] = profile(ticker)
    if not result['profile']:
        return {}, 404
    result['summary'] = summary(ticker)
    result['recommendation'] = recommendation(ticker)
    result['chart'] = chart(ticker)
    result['news'] = news(ticker)

    return result, 200

if __name__ == '__main__':
    app.run(HOST, PORT, DEBUG)