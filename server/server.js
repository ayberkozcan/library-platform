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
        favourite_books TEXT DEFAULT '[]',
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
        like_count INTEGER,
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

app.get("/get-books/:order", (req, res) => {
    const { order } = req.params;

    db.all("SELECT * FROM books ORDER BY ? DESC", [order], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.get("/get-favourite-books", (req, res) => {
    const userId = req.query.id; // change this

    db.get("SELECT favourite_books FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "User not found." });
        }

        let favouriteBookIds;
        try {
            favouriteBookIds = JSON.parse(row.favourite_books);
        } catch (e) {
            return res.status(500).json({ error: "Invalid favourite_books format." });
        }

        if (!Array.isArray(favouriteBookIds) || favouriteBookIds.length === 0) {
            return res.json([]);
        }

        const placeholders = favouriteBookIds.map(() => '?').join(',');
        const query = `SELECT * FROM books WHERE id IN (${placeholders})`;

        db.all(query, favouriteBookIds, (err, books) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(books);
        });
    });
});

app.post("/add-book", (req, res) => {
    const { title, author, genre, description, published_year, cover_image } = req.body;
    const date = new Date().toLocaleString();

    db.run(
        "INSERT INTO books (title, author, genre, description, published_year, like_count, cover_image, created_date) VALUES (?, ?, ?, ?, ?, ? ,?)",
        [title, author, genre, description, published_year, 0, cover_image, date],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Signed up successfully", id: this.lastID });
        }
    );
});

app.delete("/delete-book/:id", (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM books WHERE id = ?", [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Book deleted successfully. "});
    });
});

app.post("/update-book-status", (req, res) => {
    const { bookId, action } = req.body;
    // const userId = req.session.userId;
    const userId = id;

    if (!userId || !bookId || !["read", "to_read"].includes(action)) {
        return res.json({ success: false });
    }

    db.get("SELECT read_books, to_read_books FROM users WHERE id = ?", [userId], (err, row) => {
        if (err || !row) return res.json({ success: false });

        let readBooks = JSON.parse(row.read_books || "[]");
        let toReadBooks = JSON.parse(row.to_read_books || "[]");

        if (action === "read") {
            if (readBooks.includes(bookId)) return res.json({ success: false });
            readBooks.push(bookId);
        } else {
            if (toReadBooks.includes(bookId)) return res.json({ success: false });
            toReadBooks.push(bookId);
        }

        const column = action === "read" ? "read_books" : "to_read_books";
        const updatedList = JSON.stringify(action === "read" ? readBooks : toReadBooks);

        db.run(`UPDATE users SET ${column} = ? WHERE id = ?`, [updatedList, userId], function (err) {
            if (err) return res.json({ success: false });
            return res.json({ success: true });
        });
    });
});

app.get('/user-books', async (req, res) => {
    // const userId = req.params.id;
    const userId = id;

    try {
        const result = await db.query(
            'SELECT read_books, to_read_books FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            read_books: result.rows[0].read_books,
            to_read_books: result.rows[0].to_read_books
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
