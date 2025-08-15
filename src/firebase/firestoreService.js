import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { app } from './firebaseConfig.js'; // We need the main app export now

const db = getFirestore(app);

// This Function helps to get all chat history for a user
export const getUserChatHistory = async (userId) => {
  const userDocRef = doc(db, 'userChats', userId);
  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      // Return the array of conversations
      return docSnap.data().conversations || [];
    } else {
      // No document found, return empty array
      return [];
    }
  } catch (error) {
    console.error("Error fetching user chat history:", error);
    return []; // Return empty on error
  }
};

// This Function helps to save the entire chat history for a user
export const saveUserChatHistory = async (userId, conversations) => {
  const userDocRef = doc(db, 'userChats', userId);
  try {
    // This will create the document if it doesn't exist, or overwrite it if it does.
    await setDoc(userDocRef, { conversations });
  } catch (error) {
    console.error("Error saving user chat history:", error);
  }
};
