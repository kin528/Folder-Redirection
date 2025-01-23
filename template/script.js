// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCBMFUOq6QssSxefbojyhVF_lEHfI6UMlQ",
    authDomain: "folderredirectionmacabenta.firebaseapp.com",
    projectId: "folderredirectionmacabenta",
    storageBucket: "folderredirectionmacabenta.appspot.com",
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
const createFolderButton = document.getElementById("createFolderButton");

// Track the current parent ID for folder navigation
let currentParentID = null;

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

// Function to load folders
async function loadFolders(parentID = null, isDeleted = false) {
    try {
        currentParentID = parentID; // Update the current parent ID
        const folderQuery = query(
            collection(db, "folders"),
            where("parentID", "==", parentID),
            where("isDeleted", "==", isDeleted)
        );

        const querySnapshot = await getDocs(folderQuery);
        const folders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        displayFolders(folders, parentID);
    } catch (error) {
        console.error("Error loading folders:", error);
        alert("Error loading folders. Please try again later.");
    }
}

// Display folders
function displayFolders(folders, parentID) {
    folderList.innerHTML = "";

    // Add a back button if not in the root folder
    if (parentID) {
        const backButton = document.createElement("button");
        backButton.textContent = "Back";
        backButton.style.marginBottom = "10px";
        backButton.addEventListener("click", () => {
            loadFolders(getParentID(parentID)); // Load the parent folder
        });
        folderList.appendChild(backButton);
    }

    // Create a container for folders
    const folderContainer = document.createElement("div");
    folderContainer.style.display = "grid";
    folderContainer.style.gridTemplateColumns = "repeat(auto-fill, minmax(150px, 1fr))";
    folderContainer.style.gap = "20px";
    folderContainer.style.marginTop = "10px";

    if (folders.length === 0) {
        folderList.innerHTML += "<p>No folders found.</p>";
        return;
    }

    folders.forEach((folder) => {
        const folderCard = document.createElement("div");
        folderCard.style.display = "flex";
        folderCard.style.flexDirection = "column";
        folderCard.style.alignItems = "center";
        folderCard.style.justifyContent = "center";
        folderCard.style.border = "1px solid #ccc";
        folderCard.style.borderRadius = "8px";
        folderCard.style.padding = "10px";
        folderCard.style.backgroundColor = "#f9f9f9";
        folderCard.style.cursor = "pointer";

        // Folder icon
        const folderIcon = document.createElement("span");
        folderIcon.innerHTML = "📁"; // Use an emoji or replace with a Font Awesome icon
        folderIcon.style.fontSize = "40px";
        folderIcon.style.marginBottom = "10px";

        // Folder name
        const folderName = document.createElement("span");
        folderName.textContent = folder.name;
        folderName.style.textAlign = "center";

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.style.marginTop = "10px";
        deleteButton.style.padding = "5px 10px";
        deleteButton.style.border = "none";
        deleteButton.style.borderRadius = "4px";
        deleteButton.style.backgroundColor = "#ff4d4d";
        deleteButton.style.color = "#fff";
        deleteButton.style.cursor = "pointer";

        deleteButton.addEventListener("click", async (e) => {
            e.stopPropagation(); // Prevent the click event from opening the folder
            const confirmDelete = confirm(`Are you sure you want to delete the folder "${folder.name}"?`);
            if (confirmDelete) {
                try {
                    await deleteDoc(doc(db, "folders", folder.id));
                    alert(`Folder "${folder.name}" deleted successfully.`);
                    loadFolders(currentParentID); // Reload current folder after deletion
                } catch (error) {
                    console.error("Error deleting folder:", error);
                    alert("Failed to delete folder. Please try again.");
                }
            }
        });

        folderCard.addEventListener("click", () => {
            loadFolders(folder.id); // Load subfolders if any
        });

        // Append elements to folder card
        folderCard.appendChild(folderIcon);
        folderCard.appendChild(folderName);
        folderCard.appendChild(deleteButton);

        // Add the folder card to the container
        folderContainer.appendChild(folderCard);
    });

    // Append the folder container to the list
    folderList.appendChild(folderContainer);
}

// Get parent ID of the current folder
async function getParentID(folderID) {
    const folderRef = doc(db, "folders", folderID);
    const folderSnapshot = await getDocs(folderRef);
    return folderSnapshot.data()?.parentID || null;
}

// Create a new folder
createFolderButton.addEventListener("click", async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    try {
        const newFolder = {
            name: folderName,
            parentID: currentParentID || null, // Set to current folder or root
            isDeleted: false, // Default to false (not deleted)
        };

        await addDoc(collection(db, "folders"), newFolder);
        alert("Folder created successfully.");
        loadFolders(currentParentID); // Reload the folder list
    } catch (error) {
        console.error("Error creating folder:", error);
        alert("Error creating folder. Please try again later.");
    }
});

// Initialize app and load root folders
loadFolders();
