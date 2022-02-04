from flask import Flask, jsonify
import requests
from datetime import datetime 
from dateutil.relativedelta import relativedelta as delta

HOST = '127.0.0.1'
PORT = '3000'
DEBUG = True

# c7q7ffiad3i9it661va0 | sandbox_c7q7ffiad3i9it661vag

API_KEY = 'c7q7ffiad3i9it661va0'
BASE_URL = 'https://finnhub.io/api/v1'
API_BASE = '/api/v1'

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route(API_BASE + '/<ticker>')
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
        return result, 200
    return {}, 404

def recommendation(ticker):
    payload = {'symbol': ticker, 'token': API_KEY}
    url = BASE_URL + '/stock/recommendation'
    r = requests.get(url, params=payload)
    result = r.json()
    return result[0] if result else None

@app.route(API_BASE + '/<ticker>/summary')
def summary(ticker):
    payload = {'symbol': ticker, 'token': API_KEY}
    url = BASE_URL + '/quote'
    r = requests.get(url, params=payload)
    summ = r.json()
    reco = recommendation(ticker)
    result = {
        'summary': summ,
        'recommendations': reco
    }
    return result, 200

@app.route(API_BASE + '/<ticker>/chart')
def chart(ticker):
    today = datetime.now()
    past_half_year = today - delta(months=6, days=1)
    payload = {'symbol': ticker, 'resolution': 'D', 'from': int(datetime.timestamp(past_half_year)), 'to': int(datetime.timestamp(today)), 'token': API_KEY}
    url = BASE_URL + '/stock/candle'
    r = requests.get(url, params=payload)
    result = r.json()
    return result, 200

@app.route(API_BASE + '/<ticker>/news')
def news(ticker):
    today = datetime.now().date()
    past_half_year = today - delta(days=30)
    payload = {'symbol': ticker, 'from': past_half_year, 'to': today, 'token': API_KEY}
    url = BASE_URL + '/company-news'
    r = requests.get(url, params=payload)
    result = r.json()
    return jsonify(result), 200

if __name__ == '__main__':
    app.run(HOST, PORT, DEBUG)