const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

// CORS — allow all origins for easy deployment
app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route so it doesn't say "Route not found" on the main page
app.get('/', (req, res) => res.json({ message: 'HireNet API is running! 🚀 Use /api endpoints.' }));

// MongoDB connection (cached for serverless warm reuse)
let isConnected = false;
async function connectDB() {
    if (isConnected) return;
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log('✅ MongoDB Connected');
}

// Middleware: ensure DB is connected before processing requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ message: 'Database connection failed' });
    }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/manager', require('./routes/manager'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'HireNet API is running on Vercel ⚡' }));

// Handle 404
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ message: 'CORS error: origin not allowed' });
    }
    res.status(500).json({ message: 'Internal server error' });
});

// Auto-seed predefined accounts on first request (serverless friendly)
async function seedAccounts() {
    const User = require('./models/User');
    const PREDEFINED = [
        { name: 'Admin HireNet', email: 'admin@hirenet.com', password: 'Admin@123', role: 'admin', company: 'HireNet', title: 'Platform Administrator' },
        { name: 'TechCorp Manager', email: 'manager@hirenet.com', password: 'Manager@123', role: 'manager', company: 'TechCorp', title: 'Hiring Manager' },
    ];
    for (const data of PREDEFINED) {
        const exists = await User.findOne({ email: data.email });
        if (!exists) {
            const user = new User(data);
            await user.save();
            console.log(`✅ Seeded ${data.role}: ${data.email}`);
        }
    }
}

// Run seed on first DB connection
mongoose.connection.once('open', () => {
    seedAccounts().catch(console.warn);
});

// For local development: start server normally
if (process.env.NODE_ENV !== 'production' || require.main === module) {
    const PORT = process.env.PORT || 5000;
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 HireNet Server running on port ${PORT}`);
            console.log(`📡 API: http://localhost:${PORT}/api`);
            console.log('─────────────────────────────────────');
            console.log('Admin   → admin@hirenet.com   / Admin@123');
            console.log('Manager → manager@hirenet.com / Manager@123');
            console.log('─────────────────────────────────────');
        });
    });
}

// Export for Vercel serverless
module.exports = app;
