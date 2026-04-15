import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router'; 
import Login from '../components/Login.vue';
import Feed from '../components/Feed.vue';
import Profile from '../components/Profile.vue';
import SpotifyCallback from '../components/SpotifyCallback.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Login', component: Login },
  { path: '/feed', name: 'Feed', component: Feed },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/callback', name: 'SpotifyCallback', component: SpotifyCallback }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;