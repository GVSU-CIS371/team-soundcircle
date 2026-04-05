<template>
  <v-container>
    <h1>Welcome to SoundCircle!</h1>
    <p>You are successfully logged in.</p>
    <v-btn color="secondary" @click="handleLogout">Logout</v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogout = async () => {
  await signOut(auth);
  router.push('/'); 
};
</script>