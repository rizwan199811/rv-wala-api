const mongoose = require('mongoose');
function initialize() {
  mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function () {
    console.log('Database is connected!');
  });
}

module.exports = {
  initialize
};