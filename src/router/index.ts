// index.ts
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from '../components/Login.vue';
import Feed from '../components/Feed.vue';
import Profile from '../components/Profile.vue';
import SpotifyCallback from '../components/SpotifyCallback.vue';
import Stats from '../components/Stats.vue';
import Friends from '../components/Friends.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Login', component: Login, meta: { public: true } },
  { path: '/feed', name: 'Feed', component: Feed },
  { path: '/profile/:id?', name: 'Profile', component: Profile },
  { path: '/friends', name: 'Friends', component: Friends },
  { path: '/stats', name: 'Stats', component: Stats },
  { path: '/callback', name: 'SpotifyCallback', component: SpotifyCallback, meta: { public: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Wait for Firebase to resolve auth state
const getCurrentUser = () =>
  new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });

router.beforeEach(async (to) => {
  const user = await getCurrentUser();

  if (!to.meta.public && !user) {
    // Not logged in, trying to access a protected route → send to login
    return { name: 'Login' };
  }

  if (to.name === 'Login' && user) {
    // Already logged in, trying to visit login page → send to feed
    return { name: 'Feed' };
  }
});

export default router;