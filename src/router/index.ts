import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router'; 
import Login from '../components/Login.vue';
import Feed from '../components/Feed.vue';
import Profile from '../components/Profile.vue';
import Friends from '../components/Friends.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Login', component: Login },
  { path: '/feed', name: 'Feed', component: Feed },
  { path: '/profile/:id?', name: 'Profile', component: Profile },
  { path: '/friends', name: 'Friends', component: Friends }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;