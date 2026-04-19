<template>
    <v-container class="recForm">
        <v-card-title>New Recommendation</v-card-title>
        <v-text-field v-model="recTitle" label="Song Title"></v-text-field>
        <v-text-field v-model="recText" label="Recommendation Text"></v-text-field>
        <v-card-actions>
            <v-btn @click="onCreate()">Create</v-btn>
        </v-card-actions>
    </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { db } from '../firebase';
import { collection, addDoc, getDoc, doc, DocumentSnapshot } from 'firebase/firestore';
import { auth } from '../firebase';

const recTitle = ref('');
const recText = ref('');

async function onCreate() {
    if (recTitle.value != "" && recText.value != "" && auth.currentUser != null) {
        let userDisplayName = "";
        await getDoc(doc(db, "users/" + auth.currentUser.uid)).then((qd: DocumentSnapshot) => {
            if (qd.exists()) {
                userDisplayName = qd.data().displayName;
            }
        });

        addDoc(collection(db, "recommendations"),
        {
            recTitle: recTitle.value,
            recText: recText.value,
            user: auth.currentUser.uid,
            userName: userDisplayName
        });
    }
}
</script>

<style scoped>
.recForm {
    background-color: black;
}
</style>