const express = require('express');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

// console.log(__dirname + '/dist/')

app.use(express.static(__dirname + '/dist'));

app.get('/*', (req, res) => res.sendFile(path.join(__dirname, 'dist/index.html')));


app.listen(PORT, HOST, () => {
    console.log(`Server started: ${HOST}:${PORT}`);
});