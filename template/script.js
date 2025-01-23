// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
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
const fileList = document.getElementById("fileList");
const deleteStatusButton = document.getElementById("deleteStatusButton");
const createFolderButton = document.getElementById("createFolderButton");
const folderContent = document.getElementById("folderContent");
const currentFolderName = document.getElementById("currentFolderName");
const imageUploadInput = document.getElementById("imageUpload");
const uploadImageButton = document.getElementById("uploadImageButton");
const imageList = document.getElementById("imageList");

// State variables
let selectedFolderId = null;
let selectedFolderName = null;

// Login
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

// Signup
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

// Logout
logoutButton.addEventListener("click", async () => {
    try {
        await signOut(auth);
        alert("Logged out successfully!");
    } catch (error) {
        console.error("Logout error:", error);
        alert("Logout failed. Please try again.");
    }
});

// Auth state listener
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

// Load folders
async function loadFolders() {
    const querySnapshot = await getDocs(collection(db, "folders"));
    const folders = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    displayFolders(folders);
}

function displayFolders(folders) {
    fileList.innerHTML = "";
    folders.forEach((folder) => {
        const li = document.createElement("li");
        li.textContent = folder.name;

        li.addEventListener("click", () => {
            selectedFolderId = folder.id;
            selectedFolderName = folder.name;
            currentFolderName.textContent = `Current Folder: ${folder.name}`;
            folderContent.classList.remove("hidden");
            loadImages(folder.id);
        });

        fileList.appendChild(li);
    });
}

// Delete folder
deleteStatusButton.addEventListener("click", async () => {
    const folderName = prompt("Enter the folder name to delete:");
    if (!folderName) return;

    const folderQuery = query(collection(db, "folders"), where("name", "==", folderName));
    const querySnapshot = await getDocs(folderQuery);

    querySnapshot.forEach(async (docSnapshot) => {
        await deleteDoc(doc(db, "folders", docSnapshot.id));
    });

    alert(`Folder "${folderName}" deleted successfully.`);
    loadFolders();
});

// Create folder
createFolderButton.addEventListener("click", async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    await addDoc(collection(db, "folders"), { name: folderName });
    alert(`Folder "${folderName}" created successfully.`);
    loadFolders();
});

// Load images
async function loadImages(folderId) {
    const querySnapshot = await getDocs(query(collection(db, "images"), where("folderId", "==", folderId)));
    const images = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    displayImages(images);
}

function displayImages(images) {
    imageList.innerHTML = "";
    images.forEach((image) => {
        const li = document.createElement("li");
        li.textContent = image.name;
        imageList.appendChild(li);
    });
}

// Upload image
uploadImageButton.addEventListener("click", async () => {
    const file = imageUploadInput.files[0];
    if (!file) return alert("No file selected.");

    const storageRef = ref(storage, `images/${selectedFolderId}/${file.name}`);
    await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(storageRef);
    await addDoc(collection(db, "images"), { name: file.name, folderId: selectedFolderId, url: downloadURL });

    alert("Image uploaded successfully!");
    loadImages(selectedFolderId);
});
