<template>
  <v-app-bar color="primary" flat>
    <v-app-bar-title class="font-weight-bold">
      SoundCircle
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <v-btn variant="text" to="/feed">Feed</v-btn>
    <v-btn variant="text" to="/profile">Profile</v-btn>

    <v-btn variant="outlined" class="ml-2" @click="handleLogout">
      Logout
    </v-btn>
  </v-app-bar>
</template>

<script setup lang="ts">
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.push('/');
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
</script>