// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
"https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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
const folderList = document.getElementById("fileList");

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

// Listen for real-time updates from Firestore
onSnapshot(collection(db, "folders"), snapshot => {
  const folders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  displayFolders(folders);
});

// Create a new folder
createFolderButton.addEventListener("click", async () => {
  const folderName = prompt("Enter folder name:");
  if (!folderName) return;

  try {
    const newFolder = {
      name: folderName,
      parentID: null, // Default to null if creating a root folder
      isDeleted: false, // Default to false (not deleted)
    };

    // Add new folder to Firestore
    await addDoc(collection(db, "folders"), newFolder);
    console.log("Folder created:", newFolder);

    // Reload folders after creating a new one
    loadFolders();
  } catch (error) {
    console.error("Error creating folder:", error);
    alert("Error creating folder. Please try again later.");
  }
});

// Upload folder (dummy implementation for now)
uploadButton.addEventListener("click", () => {
  if (folderUploadInput.files.length === 0) {
    alert("Please select a folder to upload.");
    return;
  }
  alert("Folder upload is not implemented yet.");
});

deleteStatusButton.addEventListener("click", async () => {
    const statusId = ""; // Replace with the ID of the status you want to delete

    try {
        await deleteDoc(doc(db, "statuses", statusId));
        alert("Status deleted successfully.");
    } catch (error) {
        console.error("Delete status error:", error);
        alert("Failed to delete status. Please try again.");
    }
});


// Initialize app and load root folders
loadFolders(); // Load root folders (parentID = null)
