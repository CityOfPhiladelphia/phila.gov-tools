import Vue from 'vue';
import App from './App.vue';

new Vue({ // eslint-disable-line no-new
  el: '#vue-app',
  render (h) {
    return h(App, {});
  },
});
