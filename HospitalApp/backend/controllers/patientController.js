const db = require("../db");

// Lấy tất cả bệnh nhân (với phân quyền)
exports.getAllPatients = async (req, res) => {
  try {
    const userRole = req.user?.role; // Lấy role từ JWT token
    const userId = req.user?.id; // Lấy user ID từ JWT token
    
    let query = "SELECT * FROM patients";
    let params = [];
    
    // TODO: Uncomment sau khi thêm user_id column vào patients table
    // Nếu là user/patient, chỉ lấy bệnh nhân của chính mình
    // if (userRole === 'user') {
    //   query = "SELECT * FROM patients WHERE user_id = ?";
    //   params = [userId];
    // }
    // Admin và Doctor xem tất cả bệnh nhân
    
    query += " ORDER BY created_at DESC";
    
    const [results] = await db.query(query, params);
    res.json(results);
  } catch (err) {
    console.error('❌ Error getting patients:', err);
    res.status(500).json({ error: "Lỗi truy vấn dữ liệu" });
  }
};

// Thêm bệnh nhân
exports.addPatient = async (req, res) => {
  try {
    const patientData = req.body;
    const userId = req.user?.id; // Lấy user ID từ JWT token
    const userRole = req.user?.role;
    
    // Validation
    if (!patientData.name) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc: name" });
    }
    
    // Chuẩn bị dữ liệu với tất cả các trường mới
    const {
      name, dob, gender, address, phone, email, idCard,
      bloodType, allergies, medicalHistory, currentMedications,
      emergencyContactName, emergencyContactPhone, emergencyContactRelation,
      insuranceProvider, insurancePolicyNumber, insuranceExpiryDate,
      occupation, maritalStatus, notes
    } = patientData;
    
    // TODO: Uncomment sau khi thêm user_id column
    // Nếu là user (bệnh nhân tự đăng ký), tự động link với user_id
    // const linkedUserId = (userRole === 'user') ? userId : (patientData.user_id || null);
    
    const sql = `INSERT INTO patients (
      name, dob, gender, address, phone, email, id_card,
      blood_type, allergies, medical_history, current_medications,
      emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
      insurance_provider, insurance_policy_number, insurance_expiry_date,
      occupation, marital_status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    await db.query(sql, [
      name,
      dob || null,
      gender || 'Nam',
      address || null,
      phone || null,
      email || null,
      idCard || null,
      bloodType || null,
      allergies || null,
      medicalHistory || null,
      currentMedications || null,
      emergencyContactName || null,
      emergencyContactPhone || null,
      emergencyContactRelation || null,
      insuranceProvider || null,
      insurancePolicyNumber || null,
      insuranceExpiryDate || null,
      occupation || null,
      maritalStatus || null,
      notes || null
    ]);
    
    res.json({ message: "✅ Thêm bệnh nhân thành công" });
  } catch (err) {
    console.error('❌ Error adding patient:', err);
    res.status(500).json({ error: "Lỗi thêm bệnh nhân" });
  }
};

// Cập nhật bệnh nhân
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Build dynamic update query
    const allowedFields = ['name', 'dob', 'gender', 'address', 'phone', 'email', 'blood_type', 'allergies', 'medical_history', 'notes'];
    const fields = [];
    const values = [];
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        fields.push(`${field}=?`);
        values.push(updateData[field]);
      }
    });
    
    if (fields.length === 0) {
      return res.status(400).json({ error: "Không có dữ liệu để cập nhật" });
    }
    
    values.push(id);
    const sql = `UPDATE patients SET ${fields.join(', ')} WHERE id=?`;
    
    const [result] = await db.query(sql, values);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy bệnh nhân" });
    }
    
    res.json({ message: "✅ Cập nhật thành công" });
  } catch (err) {
    console.error('❌ Error updating patient:', err);
    res.status(500).json({ error: "Lỗi cập nhật bệnh nhân" });
  }
};

// Xóa bệnh nhân
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if patient exists
    const [existing] = await db.query("SELECT id FROM patients WHERE id=?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy bệnh nhân" });
    }
    
    const sql = "DELETE FROM patients WHERE id=?";
    await db.query(sql, [id]);
    res.json({ message: "🗑️ Xóa thành công" });
  } catch (err) {
    console.error('❌ Error deleting patient:', err);
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(400).json({ error: "Không thể xóa bệnh nhân vì còn dữ liệu liên quan (hồ sơ, đơn thuốc, xét nghiệm)" });
    } else {
      res.status(500).json({ error: "Lỗi xóa bệnh nhân" });
    }
  }
};
