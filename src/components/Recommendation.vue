<template>
  <v-card>
    <v-card-title>{{ displayName }} recommends: {{ title }}</v-card-title>
    <v-card-text>{{ content }}</v-card-text>
  </v-card>
</template>

<script setup lang="ts">
export type RecommendationType = {
  title: string,
  content: string,
  displayName: string
}

const props = defineProps({
  title: String,
  content: String,
  displayName: String
});
</script>

<style scoped>
</style>