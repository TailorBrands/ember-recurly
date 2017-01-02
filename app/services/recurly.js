import config from '../config/environment';
import Ember from 'ember';

export default Ember.Service.extend({
  pricing: null,

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
