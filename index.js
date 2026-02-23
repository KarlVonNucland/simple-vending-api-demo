const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'supersecretkey'; // In real life, use env var
const DB_FILE = './db.json';

// Enable CORS with credentials for cookie support
app.use(cors({
    origin: true, // Reflect the request origin
    credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

// --- Helper Functions ---

const readDb = () => {
    if (!fs.existsSync(DB_FILE)) return { machines: {} };
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
};

const writeDb = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- Middleware ---

const authenticateToken = (req, res, next) => {
    // 1. Check Authorization header (Bearer token)
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    // 2. If no header, check cookies
    if (!token && req.cookies) {
        token = req.cookies['token'];
    }

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- Routes ---

// 1. Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Static check as requested
    if (username === 'admin' && password === 'passwd123') {
        const token = jwt.sign({ username: 'admin' }, SECRET_KEY, { expiresIn: '2h' });
        
        // Support Paradigm 1: HttpOnly Cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            sameSite: 'lax',
            maxAge: 7200000 // 2 hours
        });

        // Support Paradigm 2: JSON Response (for localStorage)
        return res.json({ token, message: "Login successful" });
    }
    res.status(401).json({ message: 'Invalid credentials' });
});

// 2. Logout (Clears cookie)
app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

// 3. List all machines
app.get('/machines', authenticateToken, (req, res) => {
    const db = readDb();
    // Return as array
    const machinesArray = Object.values(db.machines);
    res.json(machinesArray);
});

// 3. Get single machine
app.get('/machines/:id', authenticateToken, (req, res) => {
    const db = readDb();
    const machine = db.machines[req.params.id];
    if (!machine) return res.status(404).json({ message: 'Machine not found' });
    res.json(machine);
});

// 4. Update items in a machine (PUT replaces the items array)
app.put('/machines/:id/items', authenticateToken, (req, res) => {
    const db = readDb();
    const machineId = req.params.id;
    const newItems = req.body.items; // Expecting array of {id, name, price}

    if (!db.machines[machineId]) {
        return res.status(404).json({ message: 'Machine not found' });
    }
    
    if (!Array.isArray(newItems)) {
         return res.status(400).json({ message: 'Items must be an array' });
    }

    // Update items
    db.machines[machineId].items = newItems;
    writeDb(db);
    
    res.json(db.machines[machineId]);
});

// 5. Add a new machine (Optional helper)
app.post('/machines', authenticateToken, (req, res) => {
    const db = readDb();
    const { id, name } = req.body;
    
    if (!id || db.machines[id]) {
        return res.status(400).json({ message: 'ID missing or already exists' });
    }

    const newMachine = { id, name: name || `Machine ${id}`, items: [] };
    db.machines[id] = newMachine;
    writeDb(db);
    
    res.status(201).json(newMachine);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
