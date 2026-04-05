<template>
  <v-app>
    <Navbar v-if="isLoggedIn" />

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from './components/Navbar.vue';

const isLoggedIn = ref(false);

onMounted(() => {
  // This listener runs every time the auth state changes
  onAuthStateChanged(auth, (user) => {
    isLoggedIn.value = !!user; // true if user exists, false if null
  });
});
</script>