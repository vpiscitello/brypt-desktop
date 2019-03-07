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
    template: '<App/>',
    data: function() {
        return {
            code: [38, 38, 40, 40, 37, 39, 37, 39, 66, 65],
            chain: []
        };
    },
    created: function() {
        window.addEventListener('keyup', this.trackKeyChain);
    },
    methods: {
        trackKeyChain: function(event) {
            const key = event.keyCode;

            this.chain.push(key);

            let codeSlice = this.code.slice(0, this.chain.length);
            let idx = -1;
            let matching = this.chain.every(function(key) {
                idx++;
                return key === codeSlice[idx];
            });

            if (matching) {
                if (this.chain.length === this.code.length) {
                    this.$store.dispatch('flipEgg');
                    this.chain.length = 0;
                }
            } else {
                this.chain.length = 0;
            }

        }
    }
}).$mount('#app');
