<template>
  <v-app-bar color="primary" prominent>
    <v-app-bar-title class="d-flex align-center">
      <v-icon size="large" class="mr-2">mdi-music-circle</v-icon>
      SoundCircle
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <v-btn 
      :variant="isActive('/feed') ? 'flat' : 'text'" 
      @click="navigateTo('/feed')"
      class="mr-2"
    >
      <v-icon start>mdi-home</v-icon>
      Feed
    </v-btn>

    <v-btn 
      :variant="isActive('/friends') ? 'flat' : 'text'" 
      @click="navigateTo('/friends')"
      class="mr-2"
    >
      <v-icon start>mdi-account-group</v-icon>
      Friends
      <v-badge 
        v-if="friendRequestCount > 0" 
        :content="friendRequestCount" 
        color="error"
        inline
      ></v-badge>
    </v-btn>

    <v-btn 
      :variant="isActive('/profile') ? 'flat' : 'text'" 
      @click="navigateTo('/profile')"
      class="mr-2"
    >
      <v-icon start>mdi-account</v-icon>
      Profile
    </v-btn>

    <v-btn 
      variant="text" 
      @click="handleLogout"
    >
      <v-icon start>mdi-logout</v-icon>
      Logout
    </v-btn>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const router = useRouter();
const route = useRoute();
const friendRequestCount = ref(0);

let unsubscribe: (() => void) | null = null;

const navigateTo = (path: string) => {
  router.push(path);
};

const isActive = (path: string) => {
  return route.path === path;
};

const handleLogout = async () => {
  await signOut(auth);
  router.push('/');
};

// Monitor friend requests
onMounted(() => {
  if (auth.currentUser) {
    const requestsRef = collection(db, 'friendRequests');
    const q = query(
      requestsRef,
      where('receiverId', '==', auth.currentUser.uid),
      where('status', '==', 'pending')
    );

    unsubscribe = onSnapshot(q, (snapshot) => {
      friendRequestCount.value = snapshot.size;
    });
  }
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<style scoped>
.v-app-bar-title {
  font-weight: 600;
  font-size: 1.5rem;
}
</style>