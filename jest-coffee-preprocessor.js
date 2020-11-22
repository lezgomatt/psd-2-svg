const coffee = require('coffee-script');

module.exports = {
  process: (src, path) => {
    return coffee.compile(src, { bare: true });
  }
};
