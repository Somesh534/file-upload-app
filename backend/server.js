const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

const dbPath = 'db.json';
// console.log(dbPath)
// Load users from the local JSON file
const loadUsers = () => {
  const data = fs.readFileSync(dbPath);
  return JSON.parse(data);
};

// Save users to the local JSON file
const saveUsers = (users) => {
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
};

// Register route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Load existing users
  const users = loadUsers();

  // Check if the username already exists
  if (users.find((user) => user.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Add the new user
  users.push({ username, password: hashedPassword });

  // Save the updated users list
  saveUsers(users);

  res.json({ message: 'Registration successful' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Load existing users
  const users = loadUsers();

  // Find the user by username
  const user = users.find((user) => user.username === username);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if the provided password matches the hashed password
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  // Generate a JWT token
  const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });

  res.json({ token });
});





app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
