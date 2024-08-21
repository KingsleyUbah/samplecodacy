// app.js

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

// Simulated user database
let users = {};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: true
}));

// Serve static files (for simplicity)
app.use(express.static('public'));

// Register route
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Poor practice: Storing plain text passwords
    users[username] = password;

    res.send('Registration successful!');
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (users[username] && users[username] === password) {
        req.session.username = username;
        res.redirect('/profile');
    } else {
        res.send('Invalid username or password!');
    }
});

// Profile route
app.get('/profile', (req, res) => {
    if (req.session.username) {
        res.send(`<h1>Welcome, ${req.session.username}!</h1><a href="/logout">Logout</a>`);
    } else {
        res.redirect('/');
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Serve a simple form for registration and login
app.get('/', (req, res) => {
    res.send(`
        <h1>Simple App</h1>
        <form action="/register" method="post">
            <h2>Register</h2>
            <label for="register-username">Username:</label>
            <input type="text" id="register-username" name="username" required><br>
            <label for="register-password">Password:</label>
            <input type="password" id="register-password" name="password" required><br>
            <button type="submit">Register</button>
        </form>
        <form action="/login" method="post">
            <h2>Login</h2>
            <label for="login-username">Username:</label>
            <input type="text" id="login-username" name="username" required><br>
            <label for="login-password">Password:</label>
            <input type="password" id="login-password" name="password" required><br>
            <button type="submit">Login</button>
        </form>
    `);
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
