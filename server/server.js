import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import session from 'express-session';
import bcrypt from 'bcrypt';

const app = express();
const port = 3000;
let id = "1";

const db = new sqlite3.Database("notes.db", (err) => {
    if (err) {
        console.error("Database connection error: ", err.message);
    } else {
        console.log("Connected database");
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        liked_books TEXT DEFAULT '[]',
        read_books TEXT DEFAULT '[]',
        to_read_books TEXT DEFAULT '[]',
        created_date TEXT DEFAULT (datetime('now'))
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT,
        genre TEXT,
        description TEXT,
        published_year INTEGER,
        cover_image TEXT,
        created_date TEXT DEFAULT (datetime('now'))
    )
`);

app.use(express.json());
app.use(cors());

app.post("/signup", (req, res) => {
    const { email, username, password } = req.body;
    const date = new Date().toLocaleString();

    db.get(
        "SELECT * FROM users WHERE email = ? OR username = ?",
        [email, username],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: "Database error: " + err.message });
            }
            if (row) {
                return res.status(400).json({ error: "Email or username already exists!" });
            }

            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    return res.status(500).json({ error: "Error hashing password" });
                }

                db.run(
                    "INSERT INTO users (email, username, password, created_date) VALUES (?, ?, ?, ?)",
                    [email, username, password, date],
                    function (err) {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        res.json({ message: "Signed up successfully", id: this.lastID });
                    }
                );
            });
        }
    );
});

app.post("/login", (req, res) => {
    const { email, username, password } = req.body;
    db.get(
        "SELECT * FROM users WHERE email = ? AND username = ?",
        [email, username],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: "Database error: " + err.message });
            }
            if (!user) {
                return res.status(401).json({ success: false, message: "Invalid credentials" });
            }

            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    return res.status(500).json({ error: "Error comparing passwords" });
                }
                if (result) {
                    res.json({
                        success: true,
                        user: { id: user.id, email: user.email, username: user.username }
                    });
                } else {
                    res.status(401).json({ success: false, message: "Invalid credentials" });
                }
            });
        }
    );
});