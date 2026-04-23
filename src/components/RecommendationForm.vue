<template>
    <v-container class="recForm">
        <v-card-title>New Recommendation</v-card-title>
        <v-text-field v-model="songId" label="Song URL"></v-text-field>
        <v-text-field v-model="recText" label="Recommendation Text"></v-text-field>
        <v-card-actions>
            <v-btn @click="onCreate()">Create</v-btn>
        </v-card-actions>
    </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { auth } from '../firebase';
import { useRecommendationStore } from '../stores/recommendationStore';

const songId = ref('');
const recText = ref('');
const recommendationStore = useRecommendationStore();

async function onCreate() {
    if (songId.value != "" && recText.value != "" && auth.currentUser != null) {
        recommendationStore.makeRecommendation(songId.value, recText.value);
    }

    const token = localStorage.getItem("spotify_access_token");

    if (!token) {
        return;
    }

    //const song = await fetch("https://open.spotify.com/track/6FBPOJLxUZEair6x4kLDhf")

    const song = fetch("https://open.spotify.com/track/6FBPOJLxUZEair6x4kLDhf", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log(song)
    console.log("this is song: ")
}
</script>

<style scoped>
.recForm {
    background-color: black;
}
</style>