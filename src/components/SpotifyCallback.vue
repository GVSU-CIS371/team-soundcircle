<template>
  <div></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
        localStorage.setItem("spotifyConnected", "true");
    }

    setTimeout(() => {
        router.push('/profile');
    }, 1000);
});
</script>