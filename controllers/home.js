var mongoose = require('mongoose');
var express = require('express');
var async = require('async');

var File = mongoose.model('File');
var router = express.Router();

router.get('/', function(req, res, next) {
  async.parallel(
    {
      downloads: function(cb) {
        File.aggregate({
          $group: {
            _id: null,
            total: {
              $sum: {
                $add: '$downloads'
              }
            }
          }
        }, cb);
      },
      uploads: function(cb) {
        File.count(cb);
      }
    },
    function(err, stats) {
      if(err) return next(err);
      
      res.render('home', {
        downloads: stats.downloads[0].total,
        uploads: stats.uploads
      });
    } 
  );
});

module.exports = router;
