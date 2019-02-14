import Vue from 'vue';

import App from './App';
import router from './router';
import store from './store';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.config.productionTip = false;

// https://stackoverflow.com/questions/36170425/detect-click-outside-element
Vue.directive('click-outside', {
    bind: function(el, binding, vnode) {
        el.clickOutsideEvent = function(event) {
            if (!(el == event.target || el.contains(event.target))) {
                vnode.context[binding.expression](event);
            }
        };
        document.body.addEventListener('click', el.clickOutsideEvent);
    },
    unbind: function(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent);
    }
});

/* eslint-disable no-new */
new Vue({
    components: {
        App
    },
    router,
    store,
    template: '<App/>'
}).$mount('#app');
