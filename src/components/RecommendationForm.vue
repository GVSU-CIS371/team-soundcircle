<template>
    <v-container class="recForm">
        <v-card-title>New Recommendation</v-card-title>
        <v-text-field v-model="recTitle" label="Song Title"></v-text-field>
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

const recTitle = ref('');
const recText = ref('');
const recommendationStore = useRecommendationStore();

function onCreate() {
    if (recTitle.value != "" && recText.value != "" && auth.currentUser != null) {
        recommendationStore.makeRecommendation(recTitle.value, recText.value);
    }
}
</script>

<style scoped>
.recForm {
    background-color: black;
}
</style>