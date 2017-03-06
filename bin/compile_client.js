var browserify = require('browserify');
var sass = require('node-sass');
var fs = require('fs');
var path = require('path');
var pleeease = require('pleeease');
var exorcist = require('exorcist');

// Browserify
var files = ['home', 'download'];

files.forEach(function(filename) {
  browserify(
    'client/js/' + filename + '.js',
    {
      debug: true
    }
  )
  .transform(
    {
      global: true,
      sourcemap: true
    },
    'uglifyify'
  )
  .transform('jadeify')
  .bundle()
  .pipe(
    exorcist('public/js/' + filename + '.min.js.map')
  )
  .pipe(
    fs.createWriteStream('public/js/' + filename + '.min.js')
  );
});


// SASS
sass.render(
  {
    file: 'client/scss/styles.scss',
    outFile: 'client/scss/styles.scss.map',
    sourceMap: true,
    sourceMapEmbed: true,
    sourceMapContents: true,
    outputStyle: 'compressed',
  },
  function(err, result) {
    if(err) {
      console.error(err);
      process.exit(1);
    }
    
    pleeease
    .process(
      result.css,
      {
        browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1'],
        cascade: true,
        mqpacker: true
      }
    )
    .then(function(css) {
      fs.writeFileSync('public/css/styles.min.css', css);
    });
  }
);