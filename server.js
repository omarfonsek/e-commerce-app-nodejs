const express = require('express');
const app = express();

app.use('/db', require('./database/db'));

app.get('/', (req, res) => {
    res.send('Bienvenido a mi ecommerce usando Express!')
});

app.get('/about', (req, res) => {
    res.send('Estos son los cimientos de mi ecommerce.');
});

app.get('/api/products', (req, res) => {
    const products = [
        { id: 1, name: 'Mouse' },
        { id: 2, name: 'Teclado' },
        { id: 3, name: 'Diademas'}
    ];
    res.json(products);
});

module.exports = app;
