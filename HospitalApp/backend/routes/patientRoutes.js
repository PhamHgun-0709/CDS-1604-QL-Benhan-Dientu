const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const { authenticate, authorize } = require('../middleware/auth');

// Lấy danh sách bệnh nhân (tất cả role có thể xem)
router.get("/", authenticate, patientController.getAllPatients);

// Thêm bệnh nhân mới (chỉ admin và doctor)
router.post("/", authenticate, authorize(['admin', 'doctor']), patientController.addPatient);

// Cập nhật bệnh nhân (chỉ admin và doctor)
router.put("/:id", authenticate, authorize(['admin', 'doctor']), patientController.updatePatient);

// Xóa bệnh nhân (chỉ admin)
router.delete("/:id", authenticate, authorize(['admin']), patientController.deletePatient);

module.exports = router;
