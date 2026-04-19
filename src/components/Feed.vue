<template>
  <v-container>
    <h1>Welcome to SoundCircle!</h1>
    <p>You are successfully logged in.</p>
    <v-btn color="secondary" @click="handleLogout">Logout</v-btn>
    <div>
      <v-btn color="secondary" @click="asfhuew">New Recommendation
        <v-overlay activator="parent" location-strategy="connected" scroll-strategy="block">
          <recommendation-form></recommendation-form>
        </v-overlay>
      </v-btn>
    </div>
  </v-container>
  <v-container>
    <template v-for="rec in recommendations" :key="rec.title">
      <recommendation 
        :title="rec.title"
        :content="rec.content"
        :display-name="rec.displayName">
      </recommendation>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { collection, getDocs, QueryDocumentSnapshot, QuerySnapshot, onSnapshot } from 'firebase/firestore';
import Recommendation from './Recommendation.vue';
import type { RecommendationType } from './Recommendation.vue';
import RecommendationForm from './RecommendationForm.vue';

const router = useRouter();
let recommendations: RecommendationType[] = [];

let unsubscribe;

const handleLogout = async () => {
  await signOut(auth);
  router.push('/'); 
};

function asfhuew() {
  getDocs(collection(db, "recommendations")).then((qs: QuerySnapshot) => {
      qs.forEach((qd: QueryDocumentSnapshot) => {
        const data = qd.data()
        //console.log(data)
        recommendations.push({ title: data.recTitle, content: data.recText, displayName: data.userName })
      });
    });
}

onMounted(() => {
  unsubscribe = onSnapshot(collection(db, "recommendations"), (qs: QuerySnapshot) => {
    getDocs(collection(db, "recommendations")).then((qs: QuerySnapshot) => {
      qs.forEach((qd: QueryDocumentSnapshot) => {
        const data = qd.data()
        //console.log(data)
        recommendations.push({ title: data.recTitle, content: data.recText, displayName: data.userName })
      });
      console.log(recommendations);
    });
  }); 
  // TOD: UNMOUNT CLEARS LIST?????
});

// getDocs(collection(db, "recommendations")).then((qs: QuerySnapshot) => {
//   qs.forEach((qd: QueryDocumentSnapshot) => {
//     const data = qd.data()
//     recommendations.value?.push({ title: data.recTitle, content: data.recText, displayName: data.userName })
//   })
// });
</script>