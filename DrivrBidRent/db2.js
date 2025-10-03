const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create/connect to database
const dbPath = path.resolve(__dirname, 'rental_bookings.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the rental bookings SQLite database.');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Create rental_bookings table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS rental_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      vehicleId TEXT NOT NULL,
      vehicleName TEXT NOT NULL,
      pickupDate TEXT NOT NULL,
      returnDate TEXT NOT NULL,
      driverRequired TEXT NOT NULL,
      costPerKm REAL NOT NULL,
      estimatedDistance INTEGER,
      totalCost REAL,
      status TEXT DEFAULT 'pending',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);
  });
}

// Add a new booking
function addBooking(bookingData, callback) {
  const {
    userId, vehicleId, vehicleName, pickupDate, returnDate,
    driverRequired, costPerKm, estimatedDistance, totalCost
  } = bookingData;

  db.run(
    `INSERT INTO rental_bookings (
      userId, vehicleId, vehicleName, pickupDate, returnDate,
      driverRequired, costPerKm, estimatedDistance, totalCost, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId, vehicleId, vehicleName, pickupDate, returnDate,
      driverRequired, costPerKm, estimatedDistance, totalCost, 'pending'
    ],
    function(err) {
      callback(err, this.lastID);
    }
  );
}

// Get all bookings
function getAllBookings(callback) {
  db.all('SELECT * FROM rental_bookings ORDER BY createdAt DESC', (err, rows) => {
    callback(err, rows);
  });
}

// Get bookings by user ID
function getBookingsByUserId(userId, callback) {
  db.all('SELECT * FROM rental_bookings WHERE userId = ? ORDER BY createdAt DESC', [userId], (err, rows) => {
    callback(err, rows);
  });
}

// Get pending driver requests
function getPendingDriverRequests(callback) {
  db.all('SELECT rb.*, u.firstName, u.lastName, u.email, u.doorNo, u.street, u.city, u.state FROM rental_bookings rb JOIN users u ON rb.userId = u.id WHERE rb.driverRequired = "yes" AND rb.status = "pending" ORDER BY rb.createdAt DESC', (err, rows) => {
    callback(err, rows);
  });
}

// Update booking status
function updateBookingStatus(bookingId, status, callback) {
  db.run('UPDATE rental_bookings SET status = ? WHERE id = ?', [status, bookingId], function(err) {
    callback(err, this.changes);
  });
}

// Get booking by ID
function getBookingById(id, callback) {
  db.get('SELECT * FROM rental_bookings WHERE id = ?', [id], (err, row) => {
    callback(err, row);
  });
}

// Export database functions
module.exports = {
  db,
  addBooking,
  getAllBookings,
  getBookingsByUserId,
  getPendingDriverRequests,
  updateBookingStatus,
  getBookingById
};