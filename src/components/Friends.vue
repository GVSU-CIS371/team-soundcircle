<template>
  <v-container>
    <h1>Friends</h1>
    
    <v-card class="mb-6">
      <v-card-title>Add Friend</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="targetUsername"
          label="Enter Username"
          placeholder="username123"
          prepend-icon="mdi-account-search"
          @keyup.enter="sendFriendRequest"
        ></v-text-field>
        <p v-if="addFriendMessage" :class="addFriendMessageType === 'error' ? 'error-message' : 'success-message'">
          {{ addFriendMessage }}
        </p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="sendFriendRequest" :disabled="!targetUsername">
          Send Friend Request
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-card class="mb-6" v-if="friendRequests.length > 0">
      <v-card-title>Friend Requests ({{ friendRequests.length }})</v-card-title>
      <v-list>
        <v-list-item v-for="request in friendRequests" :key="request.id">
          <template v-slot:prepend>
            <v-icon>mdi-account-circle</v-icon>
          </template>
          <v-list-item-title>{{ request.senderUsername }}</v-list-item-title>
          <template v-slot:append>
            <v-btn color="success" size="small" @click="acceptFriendRequest(request.id, request.senderId)" class="mr-2">
              Accept
            </v-btn>
            <v-btn color="error" size="small" @click="rejectFriendRequest(request.id)">
              Decline
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <v-card>
      <v-card-title>My Friends ({{ friends.length }})</v-card-title>
      <v-list v-if="friends.length > 0">
        <v-list-item 
          v-for="friend in friends" 
          :key="friend.id"
          @click="router.push(`/profile/${friend.userId}`)"
          style="cursor: pointer;"
        >
          <template v-slot:prepend>
            <v-avatar color="primary">
              <span class="text-white">{{ friend.displayName.charAt(0).toUpperCase() }}</span>
            </v-avatar>
          </template>
          <v-list-item-title>{{ friend.displayName }}</v-list-item-title>
          <v-list-item-subtitle>{{ friend.username }}</v-list-item-subtitle>
          <template v-slot:append>
            <v-btn 
              color="error" 
              variant="text" 
              size="small" 
              @click.stop="removeFriend(friend.friendshipId, friend.userId)"
            >
              Remove
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
      <v-card-text v-else class="text-center text-grey">
        No friends yet. Add some friends to get started!
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { db, auth } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc,
  doc, 
  getDoc,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';

const router = useRouter();

// Types
interface FriendRequest {
  id: string;
  senderId: string;
  senderUsername: string; // Updated from senderEmail
  receiverId: string;
  status: string;
  createdAt: any;
}

interface Friend {
  id: string;
  userId: string;
  displayName: string;
  username: string; // Updated from email
  friendshipId: string;
}

// State
const targetUsername = ref('');
const addFriendMessage = ref('');
const addFriendMessageType = ref<'error' | 'success'>('success');
const friendRequests = ref<FriendRequest[]>([]);
const friends = ref<Friend[]>([]);

let unsubscribeRequests: (() => void) | null = null;
let unsubscribeFriends: (() => void) | null = null;

// Send Friend Request
const sendFriendRequest = async () => {
  if (!targetUsername.value || !auth.currentUser) return;

  try {
    // Find user by username
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', targetUsername.value));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      addFriendMessage.value = 'User not found with that username';
      addFriendMessageType.value = 'error';
      return;
    }

    const receiverDoc = querySnapshot.docs[0];
    const receiverId = receiverDoc.id;

    if (receiverId === auth.currentUser.uid) {
      addFriendMessage.value = "You can't add yourself as a friend";
      addFriendMessageType.value = 'error';
      return;
    }

    // Check if already friends
    const friendsRef = collection(db, 'friends');
    const q1 = query(friendsRef, where('user1', '==', auth.currentUser.uid), where('user2', '==', receiverId));
    const q2 = query(friendsRef, where('user1', '==', receiverId), where('user2', '==', auth.currentUser.uid));

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    if (!snap1.empty || !snap2.empty) {
      addFriendMessage.value = 'Already friends with this user';
      addFriendMessageType.value = 'error';
      return;
    }

    // Get current user info for senderUsername
    const currentUserDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    const currentUserData = currentUserDoc.data();

    // Create friend request
    await addDoc(collection(db, 'friendRequests'), {
      senderId: auth.currentUser.uid,
      senderUsername: currentUserData?.username || 'Unknown',
      receiverId: receiverId,
      status: 'pending',
      createdAt: Timestamp.now()
    });

    addFriendMessage.value = 'Friend request sent!';
    addFriendMessageType.value = 'success';
    targetUsername.value = '';

    setTimeout(() => { addFriendMessage.value = ''; }, 3000);
  } catch (error: any) {
    console.error('Error sending friend request:', error);
    addFriendMessage.value = 'Failed to send friend request';
    addFriendMessageType.value = 'error';
  }
};

// Accept Friend Request
const acceptFriendRequest = async (requestId: string, senderId: string) => {
  if (!auth.currentUser) return;
  try {
    await addDoc(collection(db, 'friends'), {
      user1: senderId,
      user2: auth.currentUser.uid,
      createdAt: Timestamp.now()
    });
    await deleteDoc(doc(db, 'friendRequests', requestId));
  } catch (error) { console.error(error); }
};

const rejectFriendRequest = async (requestId: string) => {
  try { await deleteDoc(doc(db, 'friendRequests', requestId)); } catch (error) { console.error(error); }
};

const removeFriend = async (friendshipId: string, _friendUserId: string) => {
  try { await deleteDoc(doc(db, 'friends', friendshipId)); } catch (error) { console.error(error); }
};

// Load Requests
const loadFriendRequests = () => {
  if (!auth.currentUser) return;
  const requestsRef = collection(db, 'friendRequests');
  const q = query(requestsRef, where('receiverId', '==', auth.currentUser.uid), where('status', '==', 'pending'));

  unsubscribeRequests = onSnapshot(q, (snapshot) => {
    friendRequests.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FriendRequest));
  });
};

// Load Friends
const loadFriends = async () => {
  if (!auth.currentUser) return;
  const friendsRef = collection(db, 'friends');
  
  unsubscribeFriends = onSnapshot(friendsRef, async () => {
    const q1 = query(friendsRef, where('user1', '==', auth.currentUser!.uid));
    const q2 = query(friendsRef, where('user2', '==', auth.currentUser!.uid));
    const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    const friendsList: Friend[] = [];
    for (const docSnap of snapshot1.docs) {
      const friendUserId = docSnap.data().user2;
      const friendDoc = await getDoc(doc(db, 'users', friendUserId));
      if (friendDoc.exists()) {
        friendsList.push({ id: docSnap.id, userId: friendUserId, displayName: friendDoc.data().displayName, username: friendDoc.data().username, friendshipId: docSnap.id });
      }
    }
    for (const docSnap of snapshot2.docs) {
      const friendUserId = docSnap.data().user1;
      const friendDoc = await getDoc(doc(db, 'users', friendUserId));
      if (friendDoc.exists()) {
        friendsList.push({ id: docSnap.id, userId: friendUserId, displayName: friendDoc.data().displayName, username: friendDoc.data().username, friendshipId: docSnap.id });
      }
    }
    friends.value = friendsList;
  });
};

onMounted(() => { loadFriendRequests(); loadFriends(); });
onUnmounted(() => { if (unsubscribeRequests) unsubscribeRequests(); if (unsubscribeFriends) unsubscribeFriends(); });
</script>

<style scoped>
.error-message { color: #ff5252; font-size: 0.875rem; margin-top: 10px; }
.success-message { color: #4caf50; font-size: 0.875rem; margin-top: 10px; }
.text-grey { color: #757575; }
</style>