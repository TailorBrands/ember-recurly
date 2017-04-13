import config from '../config/environment';
import Ember from 'ember';
import {task, timeout} from 'ember-concurrency';

export default Ember.Service.extend({
  pricing: null,
  braintreePayPal: null,

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

  setupBraintreePayPal(options) {
    options = options || {};

    return new Ember.RSVP.Promise((resolve, reject) => {
      if (this.braintreePayPal) {
        return resolve(this.braintreePayPal);
      }

      if (!config.recurly.braintreeAuthKey) {
        reject('RecurlyService: Missing Braintree auth key, please set `ENV.recurly.braintreeAuthKey` in config.environment.js');
      } else {
        options.braintree = { clientAuthorization: config.recurly.braintreeAuthKey };
        this.setupFields().then((recurly) => {
          this.braintreePayPal = recurly.PayPal(options);
          this.get('waitForReady').perform(this.braintreePayPal).then((item) => resolve(item));
        });
      }
    });
  },

  waitForReady: task(function * (item) {
    while (item.readyState === 0) {
      yield timeout(50);
    }

    return item;
  }),

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

  getBraintreePayPal(opts) {
    if (Ember.isBlank(this.braintreePayPal) || this.braintreePayPal.readyState === 0) {
      throw new Error('braintree PayPal isn\'t initialized yet')
    }

    const resultingPromise = new Ember.RSVP.Promise((resolve, reject) => {
      this.braintreePayPal.on('error', function(err) {
        reject(err);
      });
      this.braintreePayPal.on('cancel', function()  {
        resolve(null);
      });
      this.braintreePayPal.on('token', function(token) {
        resolve(token);
      });
    });

    this.braintreePayPal.start(opts);

    return resultingPromise;
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
    const pricing = this.getPricing();
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let price = pricing.plan(planCode).currency(currency);

      if (couponCode) {
        price = price.coupon(couponCode);
      }

      price.catch(function(error) { reject(error); }).done(function(result) { resolve(result); });
    });
  }
});
