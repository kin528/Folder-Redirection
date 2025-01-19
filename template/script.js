const apiBaseUrl = "http://localhost:3000";

// DOM Elements
const folderList = document.getElementById("fileList");
const createFolderButton = document.getElementById("createFolderButton");
const uploadButton = document.getElementById("uploadButton");
const folderUploadInput = document.getElementById("folderUpload");

// Load folders from the database
async function loadFolders(parentID = null, isDeleted = false) {
    try {
        const response = await fetch(
            `${apiBaseUrl}/folders?parentID=${parentID}&isDeleted=${isDeleted}`
        );
        const folders = await response.json();
        displayFolders(folders);
    } catch (error) {
        console.error("Error loading folders:", error);
    }
}

// Display folders in the UI
function displayFolders(folders) {
    folderList.innerHTML = ""; // Clear existing list
    if (folders.length === 0) {
        folderList.innerHTML = "<li>No folders found.</li>";
        return;
    }
    folders.forEach((folder) => {
        const li = document.createElement("li");
        li.textContent = folder.name;
        li.dataset.id = folder.id;

        li.addEventListener("click", () => {
            loadFolders(folder.id); // Load child folders
        });

        folderList.appendChild(li);
    });
}

// Create a new folder
createFolderButton.addEventListener("click", async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    try {
        const response = await fetch(`${apiBaseUrl}/folders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: folderName }),
        });
        const newFolder = await response.json();
        console.log("Folder created:", newFolder);
        loadFolders(); // Reload folders
    } catch (error) {
        console.error("Error creating folder:", error);
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

// Initialize app
loadFolders();
