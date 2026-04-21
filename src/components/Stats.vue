<template>
  <v-container class="mt-10">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-5">
          <img
            v-if="profile?.images?.length" :src="profile.images[0].url"
            style="width:60px; border-radius:50%; margin-bottom:8px; margin-top:12px;">
          <v-card-title class="text-h4">{{ profile?.display_name || "Spotify" }}'s Listening Stats</v-card-title>

          <v-card-text>
            <div v-if="loading">Loading Spotify stats...</div>

            <div v-else-if="error">
              {{ error }}
            </div>

            <div v-else>
              <h2 class="text-h5 mb-3">Top 5 Artists</h2>
              <ul>
                <li
                  v-for="artist in topArtists" :key="artist.id"
                  style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">

                  <img
                    v-if="artist.images.length > 0"
                    :src="artist.images[0].url"
                    style="width:60px; height:60px; object-fit:cover; border-radius:50%;">

                  <div style="font-weight:600">
                    {{ artist.name }}
                  </div>

                </li>
              </ul>

              <h2 class="text-h5 mt-6 mb-3">Top 10 Tracks</h2>
              <ul>
                <li
                  v-for="track in topTracks" :key="track.id"
                  style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">

                  <img
                    :src="track.album.images[0].url"
                    style="width:60px; height:60px; object-fit:cover; border-radius:8px;">

                  <div
                    style="display:flex; flex-direction:column; align-items:flex-start; text-align:left;">

                    <div>
                      <div style="font-weight:600">
                        {{ track.name }}
                      </div>

                      <div style="color:gray; font-size:14px">
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