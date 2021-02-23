//------------------------------------------------------------------------------------------------
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Dashboard from '../components/dashboard/Dashboard.vue';
//------------------------------------------------------------------------------------------------

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  }
];

//------------------------------------------------------------------------------------------------

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

//------------------------------------------------------------------------------------------------

export default router;

//------------------------------------------------------------------------------------------------
