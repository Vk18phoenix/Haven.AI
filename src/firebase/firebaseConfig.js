import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

// --- This is the key section ---

// 1. Initialize Firebase ONCE and store it in the 'app' constant.
const app = initializeApp(firebaseConfig);

// 2. Initialize the Auth service using the 'app' constant.
const auth = getAuth(app);

// 3. Export both 'auth' and 'app' so other files can use them.
export { auth, app };