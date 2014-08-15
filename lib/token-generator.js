var crypto = require('crypto'),
    rand = require('rand-token').generator({
      chars: '2345679ACDEFGHJKMNPQRSTUVWXYZ',
      source: crypto.randomBytes
    });

module.exports = {
  generate: function () {
    return rand.generate(12);
  }
}
