<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center" no-gutters>
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12" rounded="lg">
          <v-toolbar color="primary" flat>
            <v-toolbar-title class="text-center w-100">
              {{ isLogin ? 'Login' : 'Register' }} to SoundCircle
            </v-toolbar-title>
          </v-toolbar>
          
          <v-card-text>
            <v-form @submit.prevent="handleSubmit">
              <v-text-field
                v-model="email"
                label="Email"
                name="email"
                prepend-icon="mdi-email"
                type="email"
                required
              ></v-text-field>
              
              <v-text-field
                v-model="password"
                label="Password"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                required
              ></v-text-field>
              
              <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
              
              <v-btn type="submit" color="primary" block class="mt-4">
                {{ isLogin ? 'Sign In' : 'Sign Up' }}
              </v-btn>
            </v-form>
          </v-card-text>
          
          <v-card-actions class="justify-center">
            <v-btn variant="text" @click="toggleMode">
              {{ isLogin ? 'Need an account? Register' : 'Already have an account? Login' }}
            </v-btn>
          </v-card-actions>
          
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

// State variables
const isLogin = ref(true);
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter();

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  errorMessage.value = '';
};

const handleSubmit = async () => {
  try {
    if (isLogin.value) {
      await signInWithEmailAndPassword(auth, email.value, password.value);
      router.push('/feed');
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: email.value.split('@')[0],
        bio: "",
        favoriteGenre: "",
        photoURL: "",  
        createdAt: new Date()
      });

      router.push('/feed');
    }
  } catch (error: any) {
    errorMessage.value = error.message;
  }
};
</script>

<style scoped>
.error-message {
  color: #ff5252;
  font-size: 0.875rem;
  margin-top: 10px;
  text-align: center;
}
.v-container {
    min-height: 100vh;
}
</style>