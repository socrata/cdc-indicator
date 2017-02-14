const ghpages = require('gh-pages');
const path = require('path');

ghpages.publish(path.join(__dirname, 'build'), function(err) {
  console.log(err);
});
