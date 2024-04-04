const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

// Define the path to clicks.json file
const clicksFilePath = path.join(__dirname, 'clicks.json');

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve index.html file for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for updating the click count
app.post('/update-click-count', (req, res) => {
  const { articleName, clickCount } = req.body;
  // Update the click count for the specified article
  // For simplicity, let's assume articleName is unique
  const articleClicks = JSON.parse(fs.readFileSync(clicksFilePath));
  articleClicks[articleName] = clickCount;
  fs.writeFileSync(clicksFilePath, JSON.stringify(articleClicks, null, 2));
  res.send('Click count updated successfully');
});

// Route for retrieving click count data
app.get('/click-count-data', (req, res) => {
  // Retrieve and send the click count data as JSON
  const articleClicks = JSON.parse(fs.readFileSync(clicksFilePath));
  res.json(articleClicks);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
