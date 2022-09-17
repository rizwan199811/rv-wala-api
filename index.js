const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 3000;
const routes = require('./route');
const cors = require('cors');
const path = require('path');
const config = require('./config/config')

app.use(cors());
app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

config.initialize()

app.use(cors({
    origin: ['http://localhost:3000','https://rv-wala.herokuapp.com']
}));
app.use('/api', routes);

app.get('/', (req, res) => {
    res.send('Working!!!')
})





app.use(function (err, req, res, next) {
    console.error(err.stack)
    console.log(err.message)
    console.log(err)
    // res.status(500).send('Something broke!')
})

app.listen(port, () => console.log(`RV-wala listening at ${port}`))