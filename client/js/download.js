$ = require('jquery');
var hljs = require('highlight.js');

$(document).ready(function() {
  console.log('Ready');
  
  hljs.configure({
    useBR: true
  });
  
  $('[load_remote]').each(function(i, e) {
    var $this = $(this);
    var url = $this.attr('load_remote');
    
    $.get(url, function(data) {
      $this.text(data);
      hljs.highlightBlock(e);
      console.log(hljs.highlightAuto(data))
    });
  });
});