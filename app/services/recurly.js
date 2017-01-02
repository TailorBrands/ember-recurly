import config from '../config/environment';
import Ember from 'ember';

export default Ember.Service.extend({
  pricing: null,

  setupFields() {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (!config.recurly.publicKey) {
        reject('RecurlyService: Missing Recurly key, please set `ENV.recurly.publicKey` in config.environment.js');
      } else {
        recurly.configure(config.recurly.publicKey);
        resolve();
      }
    });
  },

  getToken(billingInfo) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      recurly.token(billingInfo, function(err, token) {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      });
    });
  },

  getPayPalToken(opts) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      recurly.paypal(opts, function(err, token) {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      });
    });
  },

  getPricing() {
    this.pricing = this.pricing || recurly.Pricing();
    return this.pricing;
  }
});
