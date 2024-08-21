// app.js

const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/simpleapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// User model
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String
});
const User = mongoose.model('User', UserSchema);

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/simpleapp' })
}));

// Register route
app.post('/register', [
    body('username').isLength({ min: 3 }).trim().escape(),
    body('password').isLength({ min: 6 }).trim()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.send('Registration successful!');
    } catch (error) {
        res.status(500).send('Error registering user');
    }
});

// Login route
app.post('/login', [
    body('username').isLength({ min: 3 }).trim().escape(),
    body('password').isLength({ min: 6 }).trim()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.username = username;
            res.redirect('/profile');
        } else {
            res.status(401).send('Invalid username or password!');
        }
    } catch (error) {
        res.status(500).send('Error logging in');
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
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
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
