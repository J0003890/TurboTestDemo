// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAnj6BG32ydY0vaLznj6zwCmWte1mCLF_I",
    authDomain: "progressive-quiz-system.firebaseapp.com",
    databaseURL: "https://progressive-quiz-system-default-rtdb.firebaseio.com",
    projectId: "progressive-quiz-system",
    storageBucket: "progressive-quiz-system.firebasestorage.app",
    messagingSenderId: "176731470216",
    appId: "1:176731470216:web:04d0c4686a64aff27d223d"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const database = firebase.database();

// Log initialization
console.log("Firebase initialized");