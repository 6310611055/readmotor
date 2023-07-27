const sqlite3 = require('sqlite3').verbose();

// Specify the path to your SQLite database file
const dbPath = './data/mydatabase.db'; // Update the path and database name accordingly

// Create a new SQLite database object and connect to the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database successfully');
  }
});

module.exports = db;


// import pg from "pg";
// import dotenv from "dotenv";
// dotenv.config();
// const database_url = process.env.DATABASE_URL;
// export const connection = new pg.Client({
//   database: "develop",
//   connectionString: database_url,
// });
