import { defineStore } from "pinia";
import type { RecommendationType } from "../components/Recommendation.vue";
import { db } from "../firebase";
import { getDocs, getDoc, addDoc, doc, collection, DocumentSnapshot, QuerySnapshot, QueryDocumentSnapshot, } from "firebase/firestore";
import { auth } from '../firebase';

export const useRecommendationStore = defineStore("RecommendationStore", {
    state: () => ({
        recommendations: [] as RecommendationType[]
    }),
    actions: {
        init() {
            if (this.recommendations.length > 0) this.$reset();
            if (auth.currentUser == null) return;
            const currentUID = auth.currentUser.uid;
            
            let currentFriends: string[] = [];
            currentFriends.push(currentUID);

            getDocs(collection(db, "friends")).then((qs: QuerySnapshot) => {
                qs.forEach((qd: QueryDocumentSnapshot) => {
                    const friendData = qd.data();

                    if (friendData.user1 == currentUID) currentFriends.push(friendData.user2);
                    else if (friendData.user2 == currentUID) currentFriends.push(friendData.user1);
                });
            });

            getDocs(collection(db, "recommendations")).then((qs: QuerySnapshot) => {
                qs.forEach((qd: QueryDocumentSnapshot) => {
                    const data = qd.data();
                    
                    let recommendation: RecommendationType = {
                        recTitle: data.recTitle,
                        recText: data.recText,
                        userName: data.userName,
                        user: data.user,
                        songId: "none right now"
                    }                   
                    
                    if (currentFriends.includes(recommendation.user)) this.recommendations.push(recommendation);
                });
            });

            const token = localStorage.getItem("spotify_access_token");

            console.log("a")
            if (!token) {
                console.log("aaa")
                return;
            }

            //const song = await fetch("https://open.spotify.com/track/6FBPOJLxUZEair6x4kLDhf")
            console.log("b")
            const song = fetch("https://open.spotify.com/track/6FBPOJLxUZEair6x4kLDhf", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            })
            console.log("c")
            console.log(song)
            console.log("this is song: ")
        },
        async makeRecommendation(recTitle: string, recText: string) {
            if (auth.currentUser == null) return;
            const currentUID = auth.currentUser.uid;

            let userDisplayName = "";
            await getDoc(doc(db, "users/" + currentUID)).then((qd: DocumentSnapshot) => {
                if (qd.exists()) {
                    userDisplayName = qd.data().displayName;
                }
            });

            let newRec: RecommendationType = {
                recTitle: recTitle,
                recText: recText,
                user: currentUID,
                userName: userDisplayName,
                songId: "none right now"
            }

            addDoc(collection(db, "recommendations"), newRec);
            this.recommendations.push(newRec);
        }
    }
});