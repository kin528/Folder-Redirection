import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCBMFUOq6QssSxefbojyhVF_lEHfI6UMlQ",
    authDomain: "folderredirectionmacabenta.firebaseapp.com",
    projectId: "folderredirectionmacabenta",
    storageBucket: "folderredirectionmacabenta.appspot.com",
    messagingSenderId: "580280550730",
    appId: "1:580280550730:web:4ca111596bfb05676aadb3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// DOM Elements
const authSection = document.getElementById("authSection");
const folderSection = document.getElementById("folderSection");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const signupButton = document.getElementById("signupButton");
const logoutButton = document.getElementById("logoutButton");
const folderList = document.getElementById("fileList");
const createFolderButton = document.getElementById("createFolderButton");

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        authSection.classList.add("hidden");
        folderSection.classList.remove("hidden");
        loadFolders();
    } else {
        authSection.classList.remove("hidden");
        folderSection.classList.add("hidden");
    }
});

// Login
loginButton.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful!");
    } catch (error) {
        console.error(error);
        alert("Login failed!");
    }
});

// Sign Up
signupButton.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created!");
    } catch (error) {
        console.error(error);
        alert("Sign up failed!");
    }
});

// Logout
logoutButton.addEventListener("click", async () => {
    try {
        await signOut(auth);
        alert("Logged out!");
    } catch (error) {
        console.error(error);
    }
});

// Load Folders
async function loadFolders() {
    const foldersQuery = query(collection(db, "folders"));
    const snapshot = await getDocs(foldersQuery);

    const folders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));

    displayFolders(folders);
}

// Display Folders
function displayFolders(folders) {
    folderList.innerHTML = "";

    folders.forEach((folder) => {
        const li = document.createElement("li");
        li.textContent = folder.name;

        li.addEventListener("click", () => {
            displayUploadButton(folder.id, folder.name);
        });

        folderList.appendChild(li);
    });
}

// Display Upload Button
function displayUploadButton(folderId, folderName) {
    folderList.innerHTML = `
        <h3>Folder: ${folderName}</h3>
        <p>Upload a picture:</p>
        <input type="file" id="imageUpload" accept="image/*">
        <button id="uploadButton">Upload</button>
        <button id="backButton">Back</button>
    `;

    const uploadButton = document.getElementById("uploadButton");
    const backButton = document.getElementById("backButton");
    const imageUpload = document.getElementById("imageUpload");

    uploadButton.addEventListener("click", async () => {
        if (!imageUpload.files.length) {
            alert("Please select a picture.");
            return;
        }

        const file = imageUpload.files[0];
        const fileName = file.name;

        try {
            const storageRef = ref(storage, `folders/${folderId}/${fileName}`);
            await uploadBytes(storageRef, file);
            alert("Picture uploaded successfully!");
        } catch (error) {
            console.error(error);
            alert("Upload failed!");
        }
    });

    backButton.addEventListener("click", loadFolders);
}

// Create Folder
createFolderButton.addEventListener("click", async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    try {
        await addDoc(collection(db, "folders"), { name: folderName });
        alert("Folder created!");
        loadFolders();
    } catch (error) {
        console.error(error);
    }
});

// Real-Time Updates
onSnapshot(collection(db, "folders"), (snapshot) => {
    const folders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
    displayFolders(folders);
});
