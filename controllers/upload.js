var mongoose = require('mongoose');
var express = require('express');
var async = require('async');
var shortid = require('shortid');
var util = require('util');
var Busboy = require('busboy');
var bytes = require('bytes');

var File = mongoose.model('File');
var router = express.Router();

router.use('/:filename?', function(req, res, next) {
  if(req.method != 'PUT' && req.method != 'POST') return next();
  var id = shortid.generate();
  var doc, filename;
  
  async.waterfall(
    [
      function downloadFile(next) {
        var busboy = new Busboy({
          headers: req.headers,
          limits: {
            fileSize: bytes('1mb')
          }
        });
        
        busboy.on('file', function(fieldname, file, name, a, b,c,d) {
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
          
          file.on('limit', function() {
            console.log('Limit')
          })
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