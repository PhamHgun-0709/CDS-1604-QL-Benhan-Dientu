const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json()); // Sử dụng express.json() thay vì body-parser
app.use(express.urlencoded({ extended: true }));

// Error handler để bắt lỗi uncaught
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Import route
const patientRoutes = require("./routes/patientRoutes");
const recordRoutes = require("./routes/recordRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const labRoutes = require("./routes/labRoutes");
const userRoutes = require("./routes/userRoutes");
const { authenticate } = require('./middleware/auth');

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Hospital App API đang hoạt động" });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Stats endpoint - Cần authentication
app.get("/api/stats", authenticate, async (req, res) => {
  try {
    const [patients] = await db.query('SELECT COUNT(*) as count FROM patients');
    const [records] = await db.query('SELECT COUNT(*) as count FROM medical_records');
    const [prescriptions] = await db.query('SELECT COUNT(*) as count FROM prescriptions');
    const [labs] = await db.query('SELECT COUNT(*) as count FROM lab_results');
    
    res.json({
      patients: patients[0].count,
      records: records[0].count,
      prescriptions: prescriptions[0].count,
      labs: labs[0].count
    });
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Sử dụng route
app.use("/api/patients", patientRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/labs", labRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Express Error:', err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    db.end();
  });
});
