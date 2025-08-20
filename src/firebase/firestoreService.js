// src/firebase/firestoreService.js

// Firebase imports
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app, db } from "./firebaseConfig";

// The custom app ID provided by the canvas environment.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Reference to the main Firestore database instance.
const firestoreDb = getFirestore(app);
const auth = getAuth(app);

// Function to save the user's entire chat history.
// This handles the "savechat" functionality.
export const saveUserChatHistory = async (userId, chatHistory) => {
    try {
        const userDocRef = doc(firestoreDb, `artifacts/${appId}/users/${userId}/chatData/history`);
        // Firestore can handle complex objects, but for safety and to ensure
        // future compatibility, we'll store the chat history as a JSON string.
        // This is necessary to store nested arrays within a document field.
        await setDoc(userDocRef, { history: JSON.stringify(chatHistory) });
        console.log("Chat history saved successfully.");
    } catch (error) {
        console.error("Error saving chat history:", error);
    }
};

// Function to retrieve the user's entire chat history.
// This handles the "getUserChatHistory" functionality.
export const getUserChatHistory = async (userId) => {
    try {
        const userDocRef = doc(firestoreDb, `artifacts/${appId}/users/${userId}/chatData/history`);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists() && docSnap.data().history) {
            // Parse the JSON string back into a JavaScript object
            return JSON.parse(docSnap.data().history);
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error getting chat history:", error);
        return [];
    }
};

// Function to save temporary chat history for a guest user.
// This handles the "saveTempChat" functionality.
export const saveTempChat = async (messages) => {
    try {
        // We will store temporary chats in a public collection.
        // This assumes a separate logic will handle guest sessions.
        const auth = getAuth(app);
        const userId = auth.currentUser ? auth.currentUser.uid : 'temp-user-session'; // Use a consistent session ID for guests
        const tempChatRef = doc(firestoreDb, `artifacts/${appId}/public/data/tempChats/${userId}`);
        
        // Store the temporary chat messages.
        await setDoc(tempChatRef, { 
            messages: JSON.stringify(messages),
            createdAt: new Date()
        });
        console.log("Temporary chat saved successfully.");
    } catch (error) {
        console.error("Error saving temporary chat:", error);
    }
};

// Function to report a message.
export const reportMessage = async (userId, messageContent) => {
    try {
        const reportRef = collection(firestoreDb, `artifacts/${appId}/public/data/reportedMessages`);
        await addDoc(reportRef, {
            reporterUserId: userId,
            messageContent,
            reportedAt: new Date(),
            status: "pending"
        });
        console.log("Message reported successfully.");
    } catch (error) {
        console.error("Error reporting message:", error);
        throw error;
    }
};
