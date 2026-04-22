<template>
  <v-app theme="light">
    <navbar v-if="showNavbar"></navbar>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';

const route = useRoute();

// Show navbar on all pages except login
const showNavbar = computed(() => {
  return route.path !== '/';
});
</script>

<style>
/* Global styles if needed */
</style>