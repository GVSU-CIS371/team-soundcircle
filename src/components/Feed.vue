<template>
  <v-container>
    <h1>Welcome to SoundCircle!</h1>
    <p>You are successfully logged in.</p>
    <v-btn color="secondary" @click="handleLogout">Logout</v-btn>
    <div>
      <v-btn color="secondary">New Recommendation
        <v-overlay activator="parent" location-strategy="connected" scroll-strategy="block">
          <recommendation-form></recommendation-form>
        </v-overlay>
      </v-btn>
    </div>
  </v-container>
  <v-container>
    <template v-for="rec in recommendationStore.recommendations" :key="rec.user + rec.recTitle + rec.recText">
      <recommendation
        :title="rec.recTitle"
        :content="rec.recText"
        :display-name="rec.userName">
      </recommendation>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';
import Recommendation from './Recommendation.vue';
import RecommendationForm from './RecommendationForm.vue';
import { useRecommendationStore } from '../stores/recommendationStore';

const router = useRouter();
const recommendationStore = useRecommendationStore();
recommendationStore.init();

const handleLogout = async () => {
  await signOut(auth);
  router.push('/'); 
};
</script>