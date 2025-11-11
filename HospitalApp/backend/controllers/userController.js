const db = require("../db");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

exports.getAllUsers = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        id, 
        username, 
        email, 
        phone, 
        full_name,
        address,
        date_of_birth,
        gender,
        role,
        created_at,
        updated_at
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json(results);
  } catch (err) {
    console.error('❌ Error getting users:', err);
    res.status(500).json({ error: "Lỗi truy vấn dữ liệu" });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { username, password, role, email, phone, full_name, address, date_of_birth, gender } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    const hashed = bcrypt.hashSync(password, 10);
    const sql = "INSERT INTO users (username, password, role, email, phone, full_name, address, date_of_birth, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    await db.query(sql, [username, hashed, role || 'user', email || null, phone || null, full_name || null, address || null, date_of_birth || null, gender || null]);
    res.json({ message: "✅ Thêm người dùng thành công" });
  } catch (err) {
    console.error('❌ Error adding user:', err);
    res.status(500).json({ error: "Lỗi thêm người dùng" });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    const hashed = bcrypt.hashSync(password, 10);
    const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, 'user')";
    await db.query(sql, [username, hashed]);
    res.json({ message: 'Registered' });
  } catch (err) {
    console.error('❌ Error registering user:', err);
    res.status(500).json({ error: 'Cannot register user' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    const sql = 'SELECT * FROM users WHERE username = ? LIMIT 1';
    const [results] = await db.query(sql, [username]);
    if (!results.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = results[0];
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error('❌ Error during login:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role, email, phone, full_name, address, date_of_birth, gender } = req.body;
    const hashed = password ? bcrypt.hashSync(password, 10) : null;
    const sql = `UPDATE users SET 
      username=COALESCE(?, username), 
      password=COALESCE(?, password), 
      role=COALESCE(?, role),
      email=COALESCE(?, email),
      phone=COALESCE(?, phone),
      full_name=COALESCE(?, full_name),
      address=COALESCE(?, address),
      date_of_birth=COALESCE(?, date_of_birth),
      gender=COALESCE(?, gender)
      WHERE id=?`;
    await db.query(sql, [username, hashed, role, email, phone, full_name, address, date_of_birth, gender, id]);
    res.json({ message: "✅ Cập nhật người dùng thành công" });
  } catch (err) {
    console.error('❌ Error updating user:', err);
    res.status(500).json({ error: "Lỗi cập nhật người dùng" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "DELETE FROM users WHERE id=?";
    await db.query(sql, [id]);
    res.json({ message: "🗑️ Xóa người dùng thành công" });
  } catch (err) {
    console.error('❌ Error deleting user:', err);
    res.status(500).json({ error: "Lỗi xóa người dùng" });
  }
};

// Forgot Password - Generate reset token
exports.forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body; // email or username
    
    if (!identifier) {
      return res.status(400).json({ error: 'Email hoặc username là bắt buộc' });
    }
    
    // Find user by username or email
    const sql = 'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1';
    const [results] = await db.query(sql, [identifier, identifier]);
    
    if (!results.length) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'Nếu tài khoản tồn tại, link khôi phục đã được gửi đến email của bạn.' });
    }
    
    const user = results[0];
    
    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { id: user.id, username: user.username, purpose: 'reset-password' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // In a real app, you would send this via email
    // For now, we'll just return it in the response for development
    console.log(`🔗 Password reset link for ${user.username}: http://localhost:8000/reset-password.html?token=${resetToken}`);
    
    res.json({
      message: 'Link khôi phục mật khẩu đã được tạo. Vui lòng kiểm tra console server để lấy link (trong môi trường dev).',
      resetLink: `http://localhost:8000/reset-password.html?token=${resetToken}` // Remove in production
    });
    
  } catch (err) {
    console.error('❌ Error in forgotPassword:', err);
    res.status(500).json({ error: 'Có lỗi xảy ra khi xử lý yêu cầu' });
  }
};

// Reset Password - Change password with valid token
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ error: 'Token và mật khẩu mới là bắt buộc' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }
    
    // Check if token purpose is correct
    if (decoded.purpose !== 'reset-password') {
      return res.status(401).json({ error: 'Token không hợp lệ' });
    }
    
    // Hash new password
    const hashed = bcrypt.hashSync(password, 10);
    
    // Update password in database
    const sql = 'UPDATE users SET password = ? WHERE id = ?';
    await db.query(sql, [hashed, decoded.id]);
    
    console.log(`✅ Password reset successful for user ID: ${decoded.id}`);
    
    res.json({ message: 'Đặt lại mật khẩu thành công!' });
    
  } catch (err) {
    console.error('❌ Error in resetPassword:', err);
    res.status(500).json({ error: 'Có lỗi xảy ra khi đặt lại mật khẩu' });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const [results] = await db.query('SELECT id, username, email, phone, full_name, address, date_of_birth, gender, role, created_at FROM users WHERE id = ?', [userId]);
    
    if (!results.length) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }
    
    res.json(results[0]);
  } catch (err) {
    console.error('❌ Error in getMe:', err);
    res.status(500).json({ error: 'Có lỗi xảy ra' });
  }
};

// Update current user profile
exports.updateMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, email, phone, address, date_of_birth, gender } = req.body;
    
    const sql = 'UPDATE users SET full_name=?, email=?, phone=?, address=?, date_of_birth=?, gender=? WHERE id=?';
    await db.query(sql, [full_name || null, email || null, phone || null, address || null, date_of_birth || null, gender || null, userId]);
    
    res.json({ message: '✅ Cập nhật thông tin thành công!' });
  } catch (err) {
    console.error('❌ Error in updateMe:', err);
    res.status(500).json({ error: 'Có lỗi xảy ra khi cập nhật thông tin' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }
    
    // Get current password from database
    const [results] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (!results.length) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }
    
    // Verify current password
    const isMatch = bcrypt.compareSync(currentPassword, results[0].password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Mật khẩu hiện tại không đúng' });
    }
    
    // Hash new password
    const hashed = bcrypt.hashSync(newPassword, 10);
    
    // Update password
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
    
    console.log(`✅ Password changed for user ID: ${userId}`);
    res.json({ message: '✅ Đổi mật khẩu thành công!' });
    
  } catch (err) {
    console.error('❌ Error in changePassword:', err);
    res.status(500).json({ error: 'Có lỗi xảy ra khi đổi mật khẩu' });
  }
};
