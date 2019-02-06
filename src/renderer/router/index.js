import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [{
        path: '/',
        name: 'access-page',
        component: require('@/components/AccessPage').default
    }, {
        path: '/dashboard',
        name: 'dashboard-page',
        component: require('@/components/DashboardPage').default
    }, {
        path: '/bridge',
        name: 'bridge-page',
        component: require('@/components/BridgePage').default
    }, {
        path: '*',
        redirect: '/'
    }]
});
