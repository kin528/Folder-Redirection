const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the 'template' folder
app.use(express.static(path.join(__dirname, 'template')));

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'template', 'index.html'));
});

// Example folder routes
app.get('/folders', (req, res) => {
  // Simulate returning folders data
  res.json([{ id: 1, name: 'Folder 1' }, { id: 2, name: 'Folder 2' }]);
});

app.post('/folders', (req, res) => {
  const newFolder = req.body;
  // Simulate creating a new folder
  res.status(201).json(newFolder);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
