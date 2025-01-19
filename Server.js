const express = require('express');
const path = require('path');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, doc } = require('firebase/firestore');

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCBMFUOq6QssSxefbojyhVF_lEHfI6UMlQ",
  authDomain: "folderredirectionmacabenta.firebaseapp.com",
  projectId: "folderredirectionmacabenta",
  storageBucket: "folderredirectionmacabenta.firebasestorage.app",
  messagingSenderId: "580280550730",
  appId: "1:580280550730:web:4ca111596bfb05676aadb3",
  measurementId: "G-T1QBPYCCP5"
};

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'template')));

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'template', 'index.html'));
});

// Get folders based on parentID and isDeleted
app.get('/folders', async (req, res) => {
  const { parentID = null, isDeleted = false } = req.query;
  
  try {
    const folderQuery = query(
      collection(db, "folders"),
      where("parentID", "==", parentID),
      where("isDeleted", "==", JSON.parse(isDeleted))
    );

    const querySnapshot = await getDocs(folderQuery);
    const folders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    res.json(folders);
  } catch (error) {
    console.error("Error getting folders:", error);
    res.status(500).send("Error retrieving folders.");
  }
});

// Create a new folder
app.post('/folders', async (req, res) => {
  const { name, parentID = null, isDeleted = false } = req.body;

  try {
    const newFolder = {
      name,
      parentID,
      isDeleted,
    };

    const docRef = await addDoc(collection(db, "folders"), newFolder);
    res.status(201).json({ id: docRef.id, ...newFolder });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).send("Error creating folder.");
  }
});

// Delete a folder (soft delete by setting isDeleted = true)
app.patch('/folders/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const folderRef = doc(db, "folders", id);
    await updateDoc(folderRef, { isDeleted: true });
    res.send({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).send("Error deleting folder.");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
