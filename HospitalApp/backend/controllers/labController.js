const db = require("../db");

exports.getAllLabResults = async (req, res) => {
  try {
    const { patient_id } = req.query;
    
    let query = "SELECT * FROM lab_results";
    let params = [];
    
    if (patient_id) {
      query += " WHERE patient_id = ?";
      params = [patient_id];
    }
    
    query += " ORDER BY test_date DESC";
    
    const [results] = await db.query(query, params);
    res.json(results);
  } catch (err) {
    console.error('❌ Error getting lab results:', err);
    res.status(500).json({ error: "Lỗi truy vấn dữ liệu" });
  }
};

exports.addLabResult = async (req, res) => {
  try {
    const { patient_id, test_name, result, test_date, notes } = req.body;
    
    // Validation
    if (!patient_id || !test_name) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc: patient_id, test_name" });
    }
    
    const sql = "INSERT INTO lab_results (patient_id, test_name, result, notes, test_date) VALUES (?, ?, ?, ?, ?)";
    await db.query(sql, [patient_id, test_name, result || null, notes || null, test_date || new Date()]);
    res.json({ message: "✅ Thêm kết quả xét nghiệm thành công" });
  } catch (err) {
    console.error('❌ Error adding lab result:', err);
    res.status(500).json({ error: "Lỗi thêm kết quả xét nghiệm" });
  }
};

exports.updateLabResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { test_name, result, file_url } = req.body;
    const sql = "UPDATE lab_results SET test_name=?, result=?, file_url=? WHERE id=?";
    await db.query(sql, [test_name, result, file_url, id]);
    res.json({ message: "✅ Cập nhật xét nghiệm thành công" });
  } catch (err) {
    console.error('❌ Error updating lab result:', err);
    res.status(500).json({ error: "Lỗi cập nhật xét nghiệm" });
  }
};

exports.deleteLabResult = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "DELETE FROM lab_results WHERE id=?";
    await db.query(sql, [id]);
    res.json({ message: "🗑️ Xóa xét nghiệm thành công" });
  } catch (err) {
    console.error('❌ Error deleting lab result:', err);
    res.status(500).json({ error: "Lỗi xóa xét nghiệm" });
  }
};
