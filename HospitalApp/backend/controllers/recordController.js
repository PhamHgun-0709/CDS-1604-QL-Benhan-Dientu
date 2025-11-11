const db = require("../db");

exports.getAllRecords = async (req, res) => {
  try {
    const { patient_id } = req.query;
    
    let query = `
      SELECT 
        mr.*,
        d.full_name as doctor_name,
        d.email as doctor_email,
        d.specialization as doctor_specialization
      FROM medical_records mr
      LEFT JOIN doctors d ON mr.doctor_id = d.id
    `;
    let params = [];
    
    if (patient_id) {
      query += " WHERE mr.patient_id = ?";
      params = [patient_id];
    }
    
    query += " ORDER BY mr.created_at DESC";
    
    const [results] = await db.query(query, params);
    res.json(results);
  } catch (err) {
    console.error('❌ Error getting records:', err);
    res.status(500).json({ error: "Lỗi truy vấn dữ liệu" });
  }
};

exports.addRecord = async (req, res) => {
  try {
    const { patient_id, diagnosis, treatment, date } = req.body;
    const user_id = req.user?.id; // Lấy user_id từ JWT token
    
    // Validation
    if (!patient_id || !diagnosis) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc: patient_id, diagnosis" });
    }
    
    // Lấy doctor_id từ bảng doctors dựa vào user_id
    const [doctors] = await db.query('SELECT id FROM doctors WHERE user_id = ?', [user_id]);
    const doctor_id = doctors.length > 0 ? doctors[0].id : null;
    
    const sql = "INSERT INTO medical_records (patient_id, doctor_id, diagnosis, treatment, created_at) VALUES (?, ?, ?, ?, ?)";
    await db.query(sql, [patient_id, doctor_id, diagnosis, treatment, date || new Date()]);
    res.json({ message: "✅ Thêm hồ sơ thành công" });
  } catch (err) {
    console.error('❌ Error adding record:', err);
    res.status(500).json({ error: "Lỗi thêm hồ sơ" });
  }
};

exports.updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, treatment } = req.body;
    const sql = "UPDATE medical_records SET diagnosis=?, treatment=? WHERE id=?";
    await db.query(sql, [diagnosis, treatment, id]);
    res.json({ message: "✅ Cập nhật hồ sơ thành công" });
  } catch (err) {
    console.error('❌ Error updating record:', err);
    res.status(500).json({ error: "Lỗi cập nhật hồ sơ" });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "DELETE FROM medical_records WHERE id=?";
    await db.query(sql, [id]);
    res.json({ message: "🗑️ Xóa hồ sơ thành công" });
  } catch (err) {
    console.error('❌ Error deleting record:', err);
    res.status(500).json({ error: "Lỗi xóa hồ sơ" });
  }
};
