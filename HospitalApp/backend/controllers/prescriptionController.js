const db = require("../db");

exports.getAllPrescriptions = async (req, res) => {
  try {
    const { patient_id } = req.query;
    
    let query = "SELECT * FROM prescriptions";
    let params = [];
    
    if (patient_id) {
      query += " WHERE patient_id = ?";
      params = [patient_id];
    }
    
    query += " ORDER BY created_at DESC";
    
    const [results] = await db.query(query, params);
    res.json(results);
  } catch (err) {
    console.error('❌ Error getting prescriptions:', err);
    res.status(500).json({ error: "Lỗi truy vấn dữ liệu" });
  }
};

exports.addPrescription = async (req, res) => {
  try {
    const { patient_id, medicine_name, dosage, frequency, duration, instructions } = req.body;
    
    // Validation
    if (!patient_id || !medicine_name || !dosage) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc: patient_id, medicine_name, dosage" });
    }
    
    const sql = "INSERT INTO prescriptions (patient_id, medicine_name, dosage, frequency, duration, instructions) VALUES (?, ?, ?, ?, ?, ?)";
    await db.query(sql, [patient_id, medicine_name, dosage, frequency || null, duration || null, instructions || null]);
    res.json({ message: "✅ Kê đơn thuốc thành công" });
  } catch (err) {
    console.error('❌ Error adding prescription:', err);
    res.status(500).json({ error: "Lỗi kê đơn thuốc" });
  }
};

exports.updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { medicine_name, dosage, note } = req.body;
    const sql = "UPDATE prescriptions SET medicine_name=?, dosage=?, note=? WHERE id=?";
    await db.query(sql, [medicine_name, dosage, note, id]);
    res.json({ message: "✅ Cập nhật đơn thuốc thành công" });
  } catch (err) {
    console.error('❌ Error updating prescription:', err);
    res.status(500).json({ error: "Lỗi cập nhật đơn thuốc" });
  }
};

exports.deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "DELETE FROM prescriptions WHERE id=?";
    await db.query(sql, [id]);
    res.json({ message: "🗑️ Xóa đơn thuốc thành công" });
  } catch (err) {
    console.error('❌ Error deleting prescription:', err);
    res.status(500).json({ error: "Lỗi xóa đơn thuốc" });
  }
};
