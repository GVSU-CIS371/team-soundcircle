<template>
  <v-container class="mt-10">
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card class="pa-5">
          <v-card-title class="text-h4">My Profile</v-card-title>
          
            <v-card-text v-if="userData">
            <div class="text-center mb-6">
                <v-avatar size="100" color="grey-lighten-2">
                <v-img v-if="userData.photoURL" :src="userData.photoURL" cover></v-img>
                <v-icon v-else size="50">mdi-account</v-icon>
                </v-avatar>
                <v-text-field
                v-model="userData.photoURL"
                label="Profile Picture URL"
                placeholder="https://example.com/image.jpg"
                variant="underlined"
                prepend-icon="mdi-camera"
                class="mt-2"
                ></v-text-field>
            </div>

            <v-text-field 
                v-model="userData.displayName" 
                label="Display Name" 
                variant="outlined" 
                prepend-icon="mdi-account-circle"
            ></v-text-field>

            <v-select
                v-model="userData.favoriteGenre"
                :items="['Rock', 'Pop', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'Country', 'R&B']"
                label="Favorite Genre"
                variant="outlined"
                prepend-icon="mdi-music"
            ></v-select>

            <v-textarea
                v-model="userData.bio"
                label="Bio"
                placeholder="Tell your friends about your music taste..."
                variant="outlined"
                prepend-icon="mdi-information"
                counter="150"
            ></v-textarea>
            
            <v-text-field v-model="userData.email" label="Email" disabled variant="outlined" prepend-icon="mdi-email"></v-text-field>
            </v-card-text>
            
          <v-card-actions>
            <v-btn color="primary" variant="elevated" @click="updateProfile">Update Name</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="error" variant="text" @click="handleLogout">Logout</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const userData = ref<any>(null);

// Fetch data when page loads
onMounted(async () => {
  const user = auth.currentUser;
  if (user) {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      userData.value = docSnap.data();
    }
  } else {
    router.push('/'); // Boot to login if not authenticated
  }
});

// Update logic
const updateProfile = async () => {
  if (auth.currentUser) {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      
      // Update the document
      await updateDoc(userRef, {
        displayName: userData.value.displayName,
        bio: userData.value.bio || "",
        favoriteGenre: userData.value.favoriteGenre || "",
        photoURL: userData.value.photoURL || ""
      });
      
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  }
};

const handleLogout = async () => {
  await signOut(auth);
  router.push('/');
};
</script>