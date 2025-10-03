const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create/connect to database
const dbPath = path.resolve(__dirname, 'vehicle_app.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Create users table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      userType TEXT NOT NULL,
      dateOfBirth TEXT,
      doorNo TEXT,
      street TEXT,
      city TEXT,
      state TEXT,
      drivingLicense TEXT,
      photoPath TEXT,
      shopName TEXT,
      repairBikes INTEGER DEFAULT 0,
      repairCars INTEGER DEFAULT 0,
      repairEVs INTEGER DEFAULT 0,
      repairTrucks INTEGER DEFAULT 0,
      repairJCBs INTEGER DEFAULT 0
    )`);
  });
}

// Add a new user
function addUser(userData, callback) {
  const {
    firstName, lastName, email, password, userType, dateOfBirth, 
    doorNo, street, city, state, drivingLicense, photoPath, shopName,
    repairBikes, repairCars, repairEVs, repairTrucks, repairJCBs
  } = userData;

  db.run(
    `INSERT INTO users (
      firstName, lastName, email, password, userType, dateOfBirth, 
      doorNo, street, city, state, drivingLicense, photoPath, shopName,
      repairBikes, repairCars, repairEVs, repairTrucks, repairJCBs
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      firstName, lastName, email, password, userType, dateOfBirth, 
      doorNo, street, city, state, drivingLicense, photoPath, shopName,
      repairBikes, repairCars, repairEVs, repairTrucks, repairJCBs
    ],
    function(err) {
      callback(err, this.lastID);
    }
  );
}

// Get user by email
function getUserByEmail(email, callback) {
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    callback(err, row);
  });
}

// Get user by ID
function getUserById(id, callback) {
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    callback(err, row);
  });
}

// Update user profile
function updateUser(userId, userData, callback) {
  const updateFields = [];
  const values = [];

  // Build dynamic update query
  Object.keys(userData).forEach(key => {
    updateFields.push(`${key} = ?`);
    values.push(userData[key]);
  });

  values.push(userId); // Add userId for WHERE clause

  const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
  
  db.run(query, values, function(err) {
    callback(err, this.changes);
  });
}

// Delete user
function deleteUser(userId, callback) {
  db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
    callback(err, this.changes);
  });
}

// Export database functions
module.exports = {
  db,
  addUser,
  getUserByEmail,
  getUserById,
  updateUser,
  deleteUser
};