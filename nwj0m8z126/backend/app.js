// require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { logger } = require('./logger');
const handlers = require('./handlers');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const CORS = { origin: process.env.APP_DOMAIN || 'http://localhost:3001' };

const app = express();

app.use(cors(CORS));
app.use(logger);

app.get('/status', (req, res) => {
    res.status(200).json({
        'status': 'OK'
    });
});

app.get('/suggest', (req, res) => res.status(200).json([]));
app.get('/suggest/:ticker', handlers.autocomplete);
app.get('/profile/:ticker', handlers.profile);
app.get('/quote/:ticker', handlers.quote);
app.get('/history/:ticker', handlers.history);
app.get('/news/:ticker', handlers.news);
app.get('/recommendations/:ticker', handlers.recommendations);
app.get('/sentiment/:ticker', handlers.sentiment);
app.get('/peers/:ticker', handlers.peers);
app.get('/earnings/:ticker', handlers.earnings);

app.use(handlers.errorCatcher);


app.listen(PORT, HOST, () => {
    console.log(`Server started: ${HOST}:${PORT}`);
});