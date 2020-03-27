const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(__dirname + '/dist'));
app.listen(process.env.PORT || 8080);

app.get('/.well-known/acme-challenge/2L1xibuiEBynBga4aKlZfUm66tJVG61vpCsEZHgtfGA', function(req, res) {
    res.sendFile(path.join(__dirname + 'letsencrypt'));
});

app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});