const express = require('express');
const cors = require('cors');  // Import CORS
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3076;

// Middleware to parse JSON request bodies
app.use(express.json());

// Enable CORS for all origins (allow requests from any origin)
app.use(cors());  // This will allow all origins by default

// Path to the JSON data file
const dataFilePath = path.join(__dirname, 'data.json');

// Helper function to read data from the JSON file
function readDataFromFile() {
  const rawData = fs.readFileSync(dataFilePath);
  return JSON.parse(rawData);
}

// Helper function to write data to the JSON file
function writeDataToFile(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

// GET route to fetch all users
// app.get('/api/users', (req, res) => {
//   const users = readDataFromFile();
//   res.json(users);
// });


// Modify the /api/users route to support pagination
app.get('/api/users', (req, res) => {
    const { page = 1, limit = 5 } = req.query;  // Default to page 1 and limit 5
    const users = readDataFromFile();
  
    // Paginate users array based on page and limit
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = users.slice(startIndex, endIndex);
  
    // Calculate total pages
    const totalPages = Math.ceil(users.length / limit);
  
    res.json({
      users: paginatedUsers,
      totalPages,
      currentPage: parseInt(page, 10),
    });
  });

// GET route to fetch a user by ID
app.get('/api/users/:id', (req, res) => {
  const users = readDataFromFile();
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// POST route to add a new user
app.post('/api/users', (req, res) => {
  const users = readDataFromFile();
  const newUser = req.body;
  newUser.id = users.length + 1; // Automatically assign an ID
  users.push(newUser);
  writeDataToFile(users);
  res.status(201).json(newUser);
});

// PUT route to update an existing user
app.put('/api/users/:id', (req, res) => {
  const users = readDataFromFile();
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex !== -1) {
    const updatedUser = { ...users[userIndex], ...req.body };
    users[userIndex] = updatedUser;
    writeDataToFile(users);
    res.json(updatedUser);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// DELETE route to remove a user
app.delete('/api/users/:id', (req, res) => {
  const users = readDataFromFile();
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex !== -1) {
    users.splice(userIndex, 1);
    writeDataToFile(users);
    res.status(204).end();
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
