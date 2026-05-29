require('dotenv').config(); // must be first — loads .env before anything else reads process.env

// Run database migrations on startup
// This creates tables if they don't exist yet
const { runMigrations } = require('./config/migrate');
runMigrations().catch(console.error);

const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const morgan       = require('morgan');

// Route modules
const authRoutes    = require('./modules/auth/auth.routes');
const studentRoutes = require('./modules/students/students.routes');
const courseRoutes  = require('./modules/courses/courses.routes');
const gradeRoutes   = require('./modules/grades/grades.routes');
const reportRoutes  = require('./modules/reports/reports.routes');
const lecturerRoutes  = require('./modules/lecturers/lecturers.routes');

// Global error handler (must be imported AFTER routes)
const errorHandler  = require('./middleware/errorHandler');

const app = express();

// --- Security Middleware ---
// helmet() sets ~14 secure HTTP headers automatically (e.g. X-Frame-Options, CSP)
app.use(helmet());

// cors() allows requests from your frontend URL only
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean); // removes any undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));


// --- Request Parsing ---
app.use(express.json()); // parses JSON request bodies into req.body

// --- Logging ---
// 'dev' format: "GET /api/students 200 4ms"
app.use(morgan('dev'));

// --- Routes ---
// All routes are prefixed with /api/
app.use('/api/auth',     authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses',  courseRoutes);
app.use('/api/grades',   gradeRoutes);
app.use('/api/reports',  reportRoutes);
app.use('/api/lecturers', lecturerRoutes);

// Health check endpoint — useful for Docker and load balancers
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

// --- Global Error Handler ---
// Must be registered LAST, after all routes.
// Express recognises it as an error handler because it has 4 parameters (err, req, res, next).
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;