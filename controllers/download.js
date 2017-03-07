var mongoose = require('mongoose');
var express = require('express');
var async = require('async');
var util = require('util');
var path = require('path');

var File = mongoose.model('File');
var router = express.Router();

router.get('/raw/:id/:filename?', function(req, res, next) {
  File
  .findOne({
    id: req.params.id
  })
  .exec(function(err, doc) {
    if(err) return next(err);
    if(!doc) return next();
    
    File.findByIdAndUpdate(
      doc._id,
      {
        $inc: {
          downloads: 1
        }
      },
      function(err) {
        if(err) return next(err);
        
        mongoose.gridfs.createReadStream(
          {
            filename: doc.id,
            root: 'data'
          }
        )
        .pipe(res);
      }
    );
  });
});

router.get('/:id/:filename?', function(req, res, next) {
  File
  .findOne({
    id: req.params.id
  })
  .exec(function(err, doc) {
    if(err) return next(err);
    if(!doc) return next();
    
    var url_raw = util.format(
      '%s://%s/raw/%s/%s',
      req.protocol,
      req.get('host'),
      doc.id,
      doc.name
    );
    
    res.render(
      'download',
      {
        url_raw: url_raw,
        doc: doc,
        extension: path.extname(doc.name).toLowerCase()
      }
    );
  });
});

module.exports = router;
