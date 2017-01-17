import config from '../config/environment';
import Ember from 'ember';

export default Ember.Service.extend({
  pricing: null,

  setupFields(options) {
    options = options || {};
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (!config.recurly.publicKey) {
        reject('RecurlyService: Missing Recurly key, please set `ENV.recurly.publicKey` in config.environment.js');
      } else {
        options.publicKey = config.recurly.publicKey;
        recurly.configure(options);
        resolve(recurly);
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
  },

  calculatePricing(planCode, couponCode = null, currency = 'USD') {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let price = pricing.plan(planCode).currency(currency);

      if (couponCode) {
        price = price.coupon(couponCode);
      }

      price.catch(function(error) { reject(error); }).done(function(result) { resolve(result); });
    });
  }
});
