$ = require('jquery');
require('blueimp-file-upload');
var ZeroClipboard = require('zeroclipboard');
var bytes = require('bytes');

var formats = require('../../formats');
var _file = require('./templates/file.jade');

ZeroClipboard.config({
  swfPath: '/ZeroClipboard.swf'
});

$(document).ready(function() {
  console.log('Ready');
  
  $('input#browse').fileupload(
    {
      type: 'PUT',
      dataType: 'json',
      sequentialUploads: false,
      
      add: function(e, data) {
        var file = data.files[0];
        
        data.url = '/' + file.name + '?format=json';
        data.submit();
        
        var file_html = _file({
          name: file.name,
          icon: getIcon(file.name)
        });
        
        $('.container .upper .files').append(file_html);
        
        return false;
      },
      
      progressall: function(e, data) {
        var proportion = data.loaded / data.total;
        var percentage = parseInt(proportion * 100, 10);
        
        $('.file.uploading .progress_bar .fill').css('width', percentage + '%');
      },
      
      done: function(e, data) {
        console.log(e)
        var result = data.result;
        var file = data.files[0];
        var size_str = bytes(file.size, {
          decimalPlaces: 1
        });
        
        var file_html = _file({
          name: file.name,
          icon: getIcon(file.name),
          size: size_str,
          url: result.url
        });
        
        $('.file.uploading').html(file_html);
        
        var copyButton = new ZeroClipboard($('.file.uploading a.copy').get());
        
        copyButton.on('aftercopy', function(e) {
          var icon = $(e.target).find('i');
          
          icon.removeClass('bt-cut');
          icon.addClass('bt-check');
          
          setTimeout(
            function() {
              icon.removeClass('bt-check');
              icon.addClass('bt-cut');
            },
            2000
          );
        });
      }
    }
  );
});

function getIcon(filename) {
  var dotIDX = filename.indexOf('.');
  if(dotIDX == -1) return;
  var ext = filename.substring(dotIDX + 1);
  if(!formats.includes(ext)) return;
  return '/img/icons/' + ext + '.png';
}