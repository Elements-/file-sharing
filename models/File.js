var mongoose = require('mongoose');

var schema = mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  self_destruct: {
    type: Boolean,
    default: false
  },
  downloads: {
    type: Number,
    default: 0
  },
  created_date: {
    type: Date,
    default: Date.now
  },
  updated_date: {
    type: Date, 
    default: Date.now
  }
});

schema.pre('save', function(next) {
  this.updated_date = new Date();
  next();
});

schema.pre('remove', function(next) {
  mongoose.gridfs.remove(
    {
      filename: this.id,
      root: 'data'
    },
    function(err) {
      if(err) return next(err);
      next();
    }
  );
});

mongoose.model('File', schema);