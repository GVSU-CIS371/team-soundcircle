<template>
  <div>Connecting Spotify...</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
    const codeVerifier = localStorage.getItem("spotify_code_verifier");

    if (!code || !codeVerifier) {
        console.error("Missing Spotify code or code verifier");
        router.push("/profile");
        return;
    }

    const body = new URLSearchParams({
        client_id: clientId,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
    });
    try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
        });

        console.log("response status:", response.status);

        const data = await response.json();
        console.log("Spotify token response:", data);

        if (data.access_token) {
            localStorage.setItem("spotify_access_token", data.access_token);
            localStorage.setItem("spotifyConnected", "true");

            if (data.refresh_token) {
                localStorage.setItem("spotify_refresh_token", data.refresh_token);
            }
            router.push("/stats");
            return;
        } else {
            router.push("/profile");
            return;
        }
    } catch (error) {
        console.error("Error exchanging Spotify code for token:", error);
        router.push("/profile");
        return;
    }
});
</script>