// Import Firebase modules (already provided in your code)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Firebase configuration (from your provided code)
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

// DOM Elements
const folderList = document.getElementById("fileList");
const createFolderButton = document.getElementById("createFolderButton");
const uploadButton = document.getElementById("uploadButton");
const folderUploadInput = document.getElementById("folderUpload");

// Load folders from Firestore
async function loadFolders(parentID = null, isDeleted = false) {
  try {
    // Firestore query to get folders based on parentID and isDeleted
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

// Display folders in the UI
function displayFolders(folders) {
  folderList.innerHTML = ""; // Clear existing list
  if (folders.length === 0) {
    folderList.innerHTML = "<li>Empty.</li>";
    return;
  }
  folders.forEach((folder) => {
    const li = document.createElement("li");
    li.textContent = folder.name;
    li.dataset.id = folder.id;

    // Add event listener to load child folders when clicked
    li.addEventListener("click", () => {
      loadFolders(folder.id); // Load child folders
    });

    folderList.appendChild(li);
  });
}

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

// Initialize app and load root folders
loadFolders(); // Load root folders (parentID = null)