var mongoose = require('mongoose');
var express = require('express');
var async = require('async');
var shortid = require('shortid');
var util = require('util');
var Busboy = require('busboy');

var File = mongoose.model('File');
var router = express.Router();

router.use('/:filename?', function(req, res, next) {
  if(req.method != 'PUT' && req.method != 'POST') return next();
  var id = shortid.generate();
  var doc, filename;
  
  async.waterfall(
    [
      function downloadFilePUT(next) {
        if(req.method != 'PUT') return next();
        
        req
        .pipe(
          mongoose.gridfs.createWriteStream({
            filename: id,
            root: 'data'
          })
        )
        .on('close', function() {
          filename = req.params.filename;
          next();
        });
      },
      
      function downloadFilePOST(next) {
        if(req.method != 'POST') return next();
        
        var busboy = new Busboy({
          headers: req.headers
        });
        
        busboy.on('file', function(fieldname, file, name) {
          filename = name;
          
          file
          .pipe(
            mongoose.gridfs.createWriteStream({
              filename: id,
              root: 'data'
            })
          )
          .on('finish', function() {
            next();
          });
        });
        
        req.pipe(busboy);
      },
      
      function saveDoc(next) {
        doc = new File({
          id: id,
          name: filename
        });
        
        doc.save(function(err) {
          if(err) return next(err);
          next();
        });
      }
    ],
    function(err) {
      if(err) return next(err);
      
      var url = util.format(
        '%s://%s/%s/%s',
        req.protocol,
        req.get('host'),
        doc.id,
        doc.name
      );
      
      var url_raw = util.format(
        '%s://%s/raw/%s/%s',
        req.protocol,
        req.get('host'),
        doc.id,
        doc.name
      );
      
      var format = req.headers.format || req.query.format;
      
      switch(format) {
        case 'json':
          res.type('application/json');
          res.send({
            url: url,
            raw: url_raw
          });
          break;
        
        default:
          res.type('text/plain');
          res.send(util.format(
            'Link: %s\nRaw: %s\n',
            url,
            url_raw
          ));
          break;
      }
    }
  );
});

module.exports = router;