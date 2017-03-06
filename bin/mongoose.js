var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var fs = require('fs');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/file-sharing');

mongoose.connection.on('connected', function() {
  console.log('Connected to MongoDB');
  mongoose.gridfs = Grid(mongoose.connection.db, mongoose.mongo);
}); 

mongoose.connection.on('error', function(err) {  
  console.error(err);
}); 

mongoose.connection.on('disconnected', function() {  
  console.error('MongoDB Disconnected!');
});


fs.readdirSync('models/').forEach(function(file) {
  require('../models/' + file);
});