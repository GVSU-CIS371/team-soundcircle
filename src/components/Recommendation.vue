<template>
  <v-card theme="dark" style="margin-bottom: 10px;">
    <v-card-title>{{ displayName }} recommends: {{ title }}</v-card-title>
    <v-card-text>{{ content }}</v-card-text>
  </v-card>
</template>

<script setup lang="ts">
export type RecommendationType = {
  recTitle: string,
  recText: string,
  user: string,
  userName: string,
  songId: string
}

const props = defineProps({
  title: String,
  content: String,
  displayName: String,
  songId: String
});
</script>

<style scoped>
</style>