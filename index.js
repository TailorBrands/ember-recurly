/* eslint-env node */
'use strict';

module.exports = {
  name: 'ember-recurly',
  contentFor(type) {
    // we use body since Recurly must be available before
    if (type === 'body') {
      return '<script src="https://js.recurly.com/v4/recurly.js"></script>';
    }
  }
};
