// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCBMFUOq6QssSxefbojyhVF_lEHfI6UMlQ",
    authDomain: "folderredirectionmacabenta.firebaseapp.com",
    projectId: "folderredirectionmacabenta",
    storageBucket: "folderredirectionmacabenta.firebasestorage.app",
    messagingSenderId: "580280550730",
    appId: "1:580280550730:web:4ca111596bfb05676aadb3",
    measurementId: "G-T1QBPYCCP5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const authSection = document.getElementById("authSection");
const folderSection = document.getElementById("folderSection");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const signupButton = document.getElementById("signupButton");
const logoutButton = document.getElementById("logoutButton");

// Login event
loginButton.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful!");
    } catch (error) {
        console.error("Login error:", error);
        alert("Login failed. Please try again.");
    }
});

// Signup event
signupButton.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created successfully!");
    } catch (error) {
        console.error("Signup error:", error);
        alert("Signup failed. Please try again.");
    }
});

// Logout event
logoutButton.addEventListener("click", async () => {
    try {
        await signOut(auth);
        alert("Logged out successfully!");
    } catch (error) {
        console.error("Logout error:", error);
        alert("Logout failed. Please try again.");
    }
});

// Auth state change listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        authSection.classList.add("hidden");
        folderSection.classList.remove("hidden");
        loadFolders(); // Load folders after login
    } else {
        authSection.classList.remove("hidden");
        folderSection.classList.add("hidden");
    }
});

// Folder management logic remains unchanged
async function loadFolders(parentID = null, isDeleted = false) {
    try {
        const folderQuery = query(
            collection(db, "folders"),
            where("parentID", "==", parentID),
            where("isDeleted", "==", isDeleted)
        );

        const querySnapshot = await getDocs(folderQuery);
        const folders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        displayFolders(folders);
    } catch (error) {
        console.error("Error loading folders:", error);
        alert("Error loading folders. Please try again later.");
    }
}

function displayFolders(folders) {
    const folderList = document.getElementById("fileList");
    folderList.innerHTML = "";
    if (folders.length === 0) {
        folderList.innerHTML = "<li>Empty.</li>";
        return;
    }
    folders.forEach((folder) => {
        const li = document.createElement("li");
        li.textContent = folder.name;
        li.dataset.id = folder.id;

        li.addEventListener("click", () => {
            loadFolders(folder.id);
        });

        folderList.appendChild(li);
    });
}

uploadButton.addEventListener("click", () => {
    if (folderUploadInput.files.length === 0) {
        alert("Please select a folder to upload.");
        return;
    }
    alert("Folder upload is not implemented yet.");
});
