// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
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
    measurementId: "G-T1QBPYCCP5"
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
const deleteStatusButton = document.getElementById("deleteStatusButton");
const uploadButton = document.getElementById("uploadButton");
const createFolderButton = document.getElementById("createFolderButton");
const folderUploadInput = document.getElementById("folderUpload");

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

// Display folders and allow picture upload
function displayFolders(folders) {
    folderList.innerHTML = "";
    if (folders.length === 0) {
        folderList.innerHTML = "<li>Empty.</li>";
        return;
    }
    folders.forEach((folder) => {
        const li = document.createElement("li");
        li.textContent = folder.name;

        // Add click event to open folder details and show upload button
        li.addEventListener("click", () => {
            loadFolders(folder.id); // Load subfolders if any
            displayUploadButton(folder.id, folder.name); // Display upload button for the folder
        });

        folderList.appendChild(li);
    });
}

// Function to display an upload button for pictures inside the folder
function displayUploadButton(folderId, folderName) {
    const folderDetails = document.createElement("div");
    folderDetails.innerHTML = `
        <h3>Folder: ${folderName}</h3>
        <p>You can upload a picture to this folder:</p>
        <input type="file" id="imageUpload-${folderId}" accept="image/*">
        <button id="uploadImageButton-${folderId}">Upload Picture</button>
    `;

    // Clear the folder list and append folder details
    folderList.innerHTML = "";
    folderList.appendChild(folderDetails);

    // Add event listener for the upload button
    const uploadButton = document.getElementById(`uploadImageButton-${folderId}`);
    const imageUploadInput = document.getElementById(`imageUpload-${folderId}`);

    uploadButton.addEventListener("click", async () => {
        if (imageUploadInput.files.length === 0) {
            alert("Please select a picture to upload.");
            return;
        }

        const file = imageUploadInput.files[0];
        const fileName = file.name;

        try {
            const storageRef = ref(storage, `folders/${folderId}/${fileName}`);
            await uploadBytes(storageRef, file);

            alert(`Picture "${fileName}" uploaded successfully to folder "${folderName}".`);
        } catch (error) {
            console.error("Error uploading picture:", error);
            alert("Failed to upload the picture. Please try again.");
        }
    });

    // Add a back button to go back to the parent folder
    const backButton = document.createElement("button");
    backButton.textContent = "Back to Folders";
    backButton.addEventListener("click", () => loadFolders());
    folderList.appendChild(backButton);
}

// Delete Status button logic
deleteStatusButton.addEventListener("click", async () => {
    try {
        const folderName = prompt("Enter the name of the folder you want to delete:");
        if (!folderName) {
            alert("No folder name entered. Operation cancelled.");
            return;
        }

        const folderQuery = query(collection(db, "folders"), where("name", "==", folderName));
        const querySnapshot = await getDocs(folderQuery);

        if (querySnapshot.empty) {
            alert(`No folder found with the name "${folderName}".`);
            return;
        }

        querySnapshot.forEach(async (docSnapshot) => {
            await deleteDoc(doc(db, "folders", docSnapshot.id));
            console.log(`Deleted folder with ID: ${docSnapshot.id}`);
        });

        alert(`Folder "${folderName}" deleted successfully.`);
        loadFolders();
    } catch (error) {
        console.error("Delete status error:", error);
        alert("Failed to delete status. Please try again.");
    }
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

        await addDoc(collection(db, "folders"), newFolder);
        console.log("Folder created:", newFolder);
        loadFolders();
    } catch (error) {
        console.error("Error creating folder:", error);
        alert("Error creating folder. Please try again later.");
    }
});

// Listen for real-time updates from Firestore
onSnapshot(collection(db, "folders"), snapshot => {
    const folders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    displayFolders(folders);
});

// Initialize app and load root folders
loadFolders();
