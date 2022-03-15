const axios = require('axios');
const { URLSearchParams } = require('url');
const AppError = require('./error');

const { getTimestamps, getDateStrings } = require('./util');

const API_KEY = 'c7q7ffiad3i9it661va0';
const BASE_URL = 'https://finnhub.io/api/v1';

const autocomplete = async (req, res, next) => {
    try{
        const {ticker} = req.params;
        const params = new URLSearchParams({
            token: API_KEY,
            q: ticker
        }).toString();
        const { data, status } = await axios.get(`${BASE_URL}/search?${params}`);
        data.result = data.result.filter((item) => item.type == 'Common Stock' && !item.symbol.includes('.'));
        return res.status(status).json(data.result);
    }catch(err){
        next(err);
    }
}

const profile = async(req, res, next) => {
    try{
        const {ticker} = req.params;
        const params = new URLSearchParams({
            token: API_KEY,
            symbol: ticker
        }).toString();
        const { data, status } = await axios.get(`${BASE_URL}/stock/profile2?${params}`);
        return res.status(status).json(data);
    }catch(err){
        next(err);
    }
}

const quote = async(req, res, next) => {
    try{
        const {ticker} = req.params;
        const params = new URLSearchParams({
            token: API_KEY,
            symbol: ticker
        }).toString();
        const { data, status } = await axios.get(`${BASE_URL}/quote?${params}`);
        data.marketOpen = true;
        if(Date.now() - data.t >= 60) data.marketOpen = false;
        return res.status(status).json(data);
    }catch(err){
        next(err);
    }
}

const history = async(req, res, next) => {
    try{
        const {ticker} = req.params;
        const {resolution = '5', duration = '6H', now = Math.floor(Date.now() / 1000)} = req.query;
        const {to, from} = getTimestamps(duration, now);
        const params = new URLSearchParams({
            token: API_KEY,
            symbol: ticker,
            resolution,
            from,
            to
        }).toString();
        const { data, status } = await axios.get(`${BASE_URL}/stock/candle?${params}`);
        return res.status(status).json(data);
    }catch(err){
        next(err);
    }
}

const news = async(req, res, next) => {
    try{
        const {ticker} = req.params;
        const {to, from} = getDateStrings();
        const params = new URLSearchParams({
            token: API_KEY,
            symbol: ticker,
            from,
            to
        }).toString();
        const { data, status } = await axios.get(`${BASE_URL}/company-news?${params}`);
        return res.status(status).json(data);
    }catch(err){
        next(err);
    }
}

const recommendations = async(req, res, next) => {
    try{
        const {ticker} = req.params;
        const params = new URLSearchParams({
            token: API_KEY,
            symbol: ticker
        }).toString();
        const { data, status } = await axios.get(`${BASE_URL}/stock/recommendation?${params}`);
        return res.status(status).json(data);
    }catch(err){
        next(err);
    }
}

const sentiment = async(req, res, next) => {
    try{
        const {ticker} = req.params;
        const params = new URLSearchParams({
            token: API_KEY,
            symbol: ticker,
            from: '2022-01-01'
        }).toString();
        const { data, status } = await axios.get(`${BASE_URL}/stock/social-sentiment?${params}`);
        return res.status(status).json(data);
    }catch(err){
        next(err);
    }
}

const peers = async(req, res, next) => {
    try{
        const {ticker} = req.params;
        const params = new URLSearchParams({
            token: API_KEY,
            symbol: ticker
        }).toString();
        const { data, status } = await axios.get(`${BASE_URL}/stock/peers?${params}`);
        return res.status(status).json(data);
    }catch(err){
        next(err);
    }
}

const earnings = async(req, res, next) => {
    try{
        const {ticker} = req.params;
        const params = new URLSearchParams({
            token: API_KEY,
            symbol: ticker
        }).toString();
        const { data, status } = await axios.get(`${BASE_URL}/stock/earnings?${params}`);
        data.forEach((item) => {
            for(let key in item){
                if(!item[key]){
                    item[key] = 0
                }
            }
        });
        return res.status(status).json(data);
    }catch(err){
        next(err);
    }
}

const errorCatcher = (err, req, res, next) => {
    console.log('ERROR --', err.message);
    if('isAxiosError' in err){
        err = new AppError(err.response.status, err.response.statusText);
    }
    if(err instanceof AppError){
        return res.status(err.status).json({ 
            message: err.message
        });
    }
    return res.status(500).json({ message: 'Internal Server Error' });
}

module.exports = {
    autocomplete,
    profile,
    quote,
    history,
    news,
    recommendations,
    sentiment,
    peers,
    earnings,
    errorCatcher
}