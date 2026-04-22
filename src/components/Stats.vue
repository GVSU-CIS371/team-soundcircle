<template>
  <v-container class="mt-10">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-5" theme="light">
          <img
            v-if="profile?.images?.length" :src="profile.images[0].url"
            style="width:100px; border-radius:50%; margin-bottom:8px; margin-top:12px;">
          <v-card-title class="text-h4">{{ profile?.display_name || "Spotify" }}'s Listening Stats</v-card-title>

          <v-card-text>
            <div v-if="loading">Loading Spotify stats...</div>

            <div v-else-if="error">
              {{ error }}
            </div>

            <div v-if="recentTrack" class="mb-6">
              <h2 class="text-h4 mb-3" style="color: black;">Most Recently Played Track</h2>

              <ul>
                <li
                  style="display:flex; align-items:center; gap:12px; margin-bottom:12px;"
                >
                  <img
                    :src="recentTrack.track.album.images[0].url"
                    style="width:80px; height:80px; object-fit:cover; border-radius:8px;"
                  />

                  <div style="display:flex; flex-direction:column; align-items:flex-start;">
                    <div style="font-size: 20px; font-weight:600;">
                      {{ recentTrack.track.name }}
                    </div>

                    <div style="color: gray; font-size:16px;">
                      {{ recentTrack.track.artists.map(a => a.name).join(", ") }}
                    </div>
                    <div style="color: gray; font-size:14px;">
                      Played at: {{ new Date(recentTrack.played_at).toLocaleString() }}
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <h2 class="text-h4 mb-3" style="color: black;">Top 5 Artists</h2>
              <ul>
                <li
                  v-for="artist in topArtists" :key="artist.id"
                  style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">

                  <img
                    v-if="artist.images.length > 0"
                    :src="artist.images[0].url"
                    style="width:80px; height:80px; object-fit:cover; border-radius:50%;">

                  <div style="font-size: 20px; font-weight:600;">
                    {{ artist.name }}
                  </div>

                </li>
              </ul>

              <h2 class="text-h4 mt-6 mb-3" style="color: black;">Top 10 Tracks</h2>
              <ul>
                <li
                  v-for="track in topTracks" :key="track.id"
                  style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">

                  <img
                    :src="track.album.images[0].url"
                    style="width:80px; height:80px; object-fit:cover; border-radius:8px;">

                  <div
                    style="display:flex; flex-direction:column; align-items:flex-start; text-align:left;">

                    <div>
                      <div style="font-size: 20px; font-weight:600">
                        {{ track.name }}
                      </div>

                      <div style="color:gray; font-size:16px">
                        {{ track.artists.map(a => a.name).join(", ") }}
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const loading = ref(true);
const error = ref("");
const topArtists = ref<any[]>([]);
const topTracks = ref<any[]>([]);
const recentTrack = ref<any>(null);

const profile = ref<any>(null);

onMounted(async () => {
  const token = localStorage.getItem("spotify_access_token");

  if (!token) {
    error.value = "No Spotify access token found. Please reconnect Spotify.";
    loading.value = false;
    return;
  }

  const profileResponse = await fetch(
    "https://api.spotify.com/v1/me",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const profileData = await profileResponse.json();

  console.log("profile:", profileData);

  profile.value = profileData;

  try {
    const artistsResponse = await fetch(
      "https://api.spotify.com/v1/me/top/artists?limit=5",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const tracksResponse = await fetch(
      "https://api.spotify.com/v1/me/top/tracks?limit=10",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const recentResponse = await fetch(
      "https://api.spotify.com/v1/me//player/recently-played?limit=1",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const recentData = await recentResponse.json();
    console.log("Recently Played:", recentData);

    recentTrack.value = recentData.items?.[0]  || null;

    const artistsData = await artistsResponse.json();
    const tracksData = await tracksResponse.json();

    console.log("Top artists:", artistsData);
    console.log("Top tracks:", tracksData);

    topArtists.value = artistsData.items || [];
    topTracks.value = tracksData.items || [];
  } catch (err) {
    console.error("Error fetching Spotify stats:", err);
    error.value = "Failed to load Spotify stats.";
  } finally {
    loading.value = false;
  }
});
</script>