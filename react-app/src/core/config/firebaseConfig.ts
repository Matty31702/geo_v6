import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import {
  getDatabase,
  onDisconnect,
  onValue,
  ref,
  set,
} from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_DATABASE_URL,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const database = getFirestore(app);
export const realTimeDatabase = getDatabase(app); // Realtime database for presence system

// Track user presence when they authenticate
export const setupPresence = (userId: string) => {
  // Firestore reference for user status
  const userStatusFirestoreRef = doc(database, "userStatus", userId);

  // Realtime Database reference for online/offline status
  const userStatusDatabaseRef = ref(realTimeDatabase, `/status/${userId}`);

  // Create a reference to the special '.info/connected' path in Realtime Database
  const connectedRef = ref(realTimeDatabase, ".info/connected");

  // Listen for connection state changes
  onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === false) {
      // User is offline
      return;
    }

    // User is online
    onDisconnect(userStatusDatabaseRef)
      .set({
        state: "offline",
        lastChanged: serverTimestamp(),
      })
      .then(() => {
        // Set to online state
        set(userStatusDatabaseRef, {
          state: "online",
          lastChanged: serverTimestamp(),
        });

        // Update in Firestore as well for your app to use
        setDoc(
          userStatusFirestoreRef,
          {
            isOnline: true,
            lastSeen: new Date(),
          },
          { merge: true }
        );
      });
  });

  // Also listen for real-time database changes to reflect in Firestore
  onValue(userStatusDatabaseRef, (snapshot) => {
    if (snapshot.exists()) {
      const status = snapshot.val();
      if (status.state === "offline") {
        setDoc(
          userStatusFirestoreRef,
          {
            isOnline: false,
            lastSeen: new Date(),
          },
          { merge: true }
        );
      }
    }
  });
};

// Set up presence tracking when a user logs in
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    setupPresence(user.uid);
  }
});

export default app;
