const express = require('express');
const app = express();

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('new  backend  MediCare works correctly!');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server works at port ${PORT}`);
});