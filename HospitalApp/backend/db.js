const mysql = require("mysql2/promise");

// Tạo connection pool với promise
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Luck2004!", // ← thay bằng mật khẩu thật
  database: "hospital_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test kết nối
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Đã kết nối MySQL");
    connection.release();
  } catch (err) {
    console.error("❌ Lỗi kết nối MySQL:", err);
  }
})();

// Xuất pool ra ngoài
module.exports = pool;
