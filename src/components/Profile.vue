<template>
  <v-container class="mt-8">
    <v-row justify="center">
      <v-col cols="12" md="5">
        <div v-if="!userData" class="text-center mt-10">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        <div v-else>
          <v-card theme ="light" class="pa-6 text-center" elevation="0" border rounded="lg">
            <v-avatar size="140" class="mb-4" color="primary">
              <v-img v-if="userData.photoURL" :src="userData.photoURL" cover></v-img>
              <v-icon v-else size="70" color="white">mdi-account</v-icon>
            </v-avatar>
            <h1 class="text-h4 font-weight-bold text-black">{{ userData.displayName }}</h1>
            <p v-if="isOwnProfile" class="text-subtitle-1 text-grey">{{ userData.email }}</p>
          </v-card>
          <v-card class="pa-6 mt-4" elevation="0" border rounded="lg" theme="light">
            <div v-if="isOwnProfile">
              <h2 class="text-h6 mb-4 text-black">Edit Profile</h2>
              <v-text-field v-model="userData.photoURL" label="Profile Picture URL" variant="outlined" density="comfortable"></v-text-field>
              <v-text-field v-model="userData.displayName" label="Display Name" variant="outlined" density="comfortable"></v-text-field>
              <v-select v-model="userData.favoriteGenre" :items="genres" label="Favorite Genre" variant="outlined" density="comfortable"></v-select>
              <v-textarea v-model="userData.bio" label="Bio" variant="outlined" density="comfortable"></v-textarea>
              <div class="mt-6 mb-8 text-center">
                <v-btn variant="flat" style="background-color:#1DB954; color:black;" 
                  class="my-4 d-flex align-center justify-center" 
                  @click="connectSpotify"
                  :disabled="spotifyConnected">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
                    alt="Spotify" style="width:20px; height:20px; margin-right:8px;"/>
                  {{ spotifyConnected ? "Spotify Connected" : "Connect Spotify" }}
                </v-btn>
                <v-btn
                  v-if="spotifyConnected" variant="text" color="error" class="mt-2"
                  @click="disconnectSpotify">
                  Disconnect Spotify
                </v-btn>
              </div>
              <v-btn color="primary" class="text-white" @click="updateProfile" block size="large" rounded="pill">Save Changes</v-btn>
            </div>
            <div v-else>
              <h2 class="text-h6 mb-2 text-black">About</h2>
              <p class="mb-4 text-grey-darken-2">{{ userData.bio || 'No bio available.' }}</p>
              <v-chip color="primary" variant="outlined">{{ userData.favoriteGenre || 'No genre selected' }}</v-chip>
            </div>
          </v-card>
        </div>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4" elevation="0" border rounded="lg">
          <v-card-title class="pb-2 text-black">Friends</v-card-title>
          <v-list lines="one" bg-color="transparent">
            <v-list-item 
              v-for="friend in userFriends" 
              :key="friend.userId" 
              class="cursor-pointer">
              <template v-slot:prepend>
                <v-avatar size="36" color="primary" class="mr-3">
                  <span class="text-white">{{ friend.displayName?.charAt(0).toUpperCase() }}</span>
                </v-avatar>
              </template>
              <v-list-item-title @click="router.push(`/profile/${friend.userId}`)">{{ friend.displayName }}</v-list-item-title>
              <template v-slot:append v-if="isOwnProfile">
                <v-btn icon="mdi-delete" variant="plain" color="error" size="small" @click="removeFriend(friend.friendshipId)"></v-btn>
              </template>
            </v-list-item>
            <v-list-item v-if="userFriends.length === 0" class="text-grey">
              No friends to display.
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const userData = ref<any>(null);
const spotifyConnected = ref(false);
const userFriends = ref<any[]>([]);
const isOwnProfile = ref(true);


const genres = ['Rock', 'Pop', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Indie', 'Alternative'];

const fetchProfile = async (uid: string) => {
  userData.value = null; 
  isOwnProfile.value = uid === auth.currentUser?.uid;
  
  const docSnap = await getDoc(doc(db, "users", uid));
  if (docSnap.exists()) userData.value = docSnap.data();

  const friendsList: any[] = [];
  const friendsRef = collection(db, 'friends');
  const q1 = query(friendsRef, where('user1', '==', uid));
  const q2 = query(friendsRef, where('user2', '==', uid));
  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

  for (const docSnap of [...snap1.docs, ...snap2.docs]) {
    const friendId = docSnap.data().user1 === uid ? docSnap.data().user2 : docSnap.data().user1;
    const friendDoc = await getDoc(doc(db, 'users', friendId));
    if (friendDoc.exists()) {
      friendsList.push({ 
        userId: friendId, 
        friendshipId: docSnap.id,
        ...friendDoc.data() 
      });
    }
  }
  userFriends.value = friendsList;
};

const removeFriend = async (friendshipId: string) => {
  if (confirm("Are you sure you want to remove this friend?")) {
    await deleteDoc(doc(db, "friends", friendshipId));
    fetchProfile(route.params.id as string || auth.currentUser!.uid);
  }
};

onMounted(() => {
  spotifyConnected.value = !!localStorage.getItem("spotify_access_token");
  
  const uid = (route.params.id as string) || auth.currentUser?.uid;
  if (uid) fetchProfile(uid);
});

watch(() => route.params.id, (newId) => {
  fetchProfile((newId as string) || auth.currentUser!.uid);
});

const updateProfile = async () => {
  if (!auth.currentUser) return;
  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    displayName: userData.value.displayName,
    bio: userData.value.bio,
    favoriteGenre: userData.value.favoriteGenre,
    photoURL: userData.value.photoURL
  });
  alert("Profile updated!");
};

function generateRandomString(length: number) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function sha256(plain: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

function base64encode(input: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}


// Spotify Connection
async function connectSpotify() {

  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

  const scope = "user-read-email user-read-private user-top-read user-read-recently-played";

  const codeVerifier = generateRandomString(64);
  localStorage.setItem("spotify_code_verifier", codeVerifier);

  const hashedVerifier = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashedVerifier);


  const authURL = 
    "https://accounts.spotify.com/authorize" +
    "?response_type=code" +
    "&client_id=" + encodeURIComponent(clientId) +
    "&scope=" + encodeURIComponent(scope) +
    "&redirect_uri=" + encodeURIComponent(redirectUri) +
    "&code_challenge_method=S256" +
    "&code_challenge=" + encodeURIComponent(codeChallenge);

  window.location.href = authURL;
}

function disconnectSpotify() {
  localStorage.removeItem("spotifyConnected");
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_refresh_token");
  localStorage.removeItem("spotify_code_verifier");

  spotifyConnected.value = false;
}

</script>