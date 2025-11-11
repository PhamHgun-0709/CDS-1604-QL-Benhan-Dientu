import { getPatients } from './api.js';
import { saveAuth, clearAuth, getRole, getToken } from './auth.js';
import { loadAndRenderPatients, showPatientDetails, addPatient } from './patients.js';
import { toast, loading, confirm } from './ui-helpers.js';

// Global variables
let allPatients = []; // Store all patients for filtering
let currentFilters = {
  search: '',
  gender: '',
  bloodType: ''
};

// Render danh sách bệnh nhân
function renderPatients(patients) {
  const ul = document.getElementById('patientList');
  if (!ul) return;
  
  ul.innerHTML = '';
  
  // Handle error case
  if (patients && patients.error) {
    ul.innerHTML = `<li style="text-align:center; color: #ef4444;">❌ ${patients.error}</li>`;
    return;
  }
  
  if (!patients || patients.length === 0) {
    ul.innerHTML = '<li style="text-align:center; color: #9ca3af;">Không có bệnh nhân</li>';
    return;
  }
  
  patients.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span style="font-weight: 600;">${p.name}</span>
      <small style="color: #6b7280;">ID: ${p.id} | ${p.gender} | ${p.phone || 'N/A'}</small>
    `;
    li.dataset.id = p.id;
    li.style.cursor = 'pointer';
    li.addEventListener('click', async () => {
      // Use the new loadPatientDetail function
      if (window.loadPatientDetail) {
        await window.loadPatientDetail(p.id);
      } else {
        await showPatientDetails(p.id, renderDetail);
      }
    });
    ul.appendChild(li);
  });
  
  // Cập nhật số lượng bệnh nhân
  const totalPatientsEl = document.getElementById('totalPatients');
  if (totalPatientsEl) {
    totalPatientsEl.textContent = patients.length;
  }
}

// Render chi tiết bệnh nhân
function renderDetail(data) {
  const container = document.getElementById('detailContent');
  if (!container) return;
  
  const role = getRole();
  const isDoctorOrAdmin = (role === 'doctor' || role === 'admin');
  
  container.innerHTML = `
    <div class="detail-info">
      <div class="detail-section">
        <div class="section-title-row">
          <h3>📋 Hồ sơ bệnh án (${data.records?.length || 0})</h3>
          ${isDoctorOrAdmin ? '<button class="btn-add-mini" onclick="openModalRecord()">➕ Thêm</button>' : ''}
        </div>
        ${data.records && data.records.length > 0 ? 
          data.records.map(r => `
            <div class="detail-item" style="position: relative; padding: 1rem; background: #f9fafb; border-radius: 8px; margin-bottom: 0.75rem;">
              ${isDoctorOrAdmin ? `
                <div style="position: absolute; top: 0.5rem; right: 0.5rem; display: flex; gap: 0.5rem;">
                  <button class="btn-icon-sm edit" onclick="editRecord(${r.id}, '${r.diagnosis.replace(/'/g, "\\'")}', '${(r.treatment || '').replace(/'/g, "\\'")}')">✏️</button>
                  <button class="btn-icon-sm delete" onclick="deleteRecordItem(${r.id})">🗑️</button>
                </div>
              ` : ''}
              <div style="padding-right: ${isDoctorOrAdmin ? '80px' : '0'};">
                <div style="margin-bottom: 0.5rem;">
                  <strong style="color: #374151; font-size: 0.95rem;">Chẩn đoán:</strong>
                  <div style="color: #1f2937; margin-top: 0.25rem; line-height: 1.5;">${r.diagnosis}</div>
                </div>
                <div style="margin-bottom: 0.5rem;">
                  <strong style="color: #374151; font-size: 0.95rem;">Điều trị:</strong>
                  <div style="color: #1f2937; margin-top: 0.25rem; line-height: 1.5;">${r.treatment || 'Chưa có thông tin'}</div>
                </div>
                ${r.doctor_name ? `
                  <div style="margin-bottom: 0.5rem;">
                    <strong style="color: #374151; font-size: 0.95rem;">Bác sĩ:</strong>
                    <span style="color: #667eea; margin-left: 0.5rem;">${r.doctor_name}</span>
                  </div>
                ` : ''}
                <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid #e5e7eb;">
                  <small style="color: #6b7280;">📅 ${new Date(r.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}</small>
                </div>
              </div>
            </div>
          `).join('') : '<p class="text-muted">Chưa có hồ sơ</p>'}
      </div>
      
      <div class="detail-section">
        <div class="section-title-row">
          <h3>💊 Đơn thuốc (${data.prescriptions?.length || 0})</h3>
          ${isDoctorOrAdmin ? '<button class="btn-add-mini" onclick="openModalPrescription()">➕ Thêm</button>' : ''}
        </div>
        ${data.prescriptions && data.prescriptions.length > 0 ? 
          data.prescriptions.map(p => `
            <div class="detail-item" style="position: relative; padding: 1rem; background: #f0fdf4; border-radius: 8px; margin-bottom: 0.75rem; border-left: 3px solid #10b981;">
              ${isDoctorOrAdmin ? `
                <div style="position: absolute; top: 0.5rem; right: 0.5rem; display: flex; gap: 0.5rem;">
                  <button class="btn-icon-sm edit" onclick="editPrescription(${p.id}, '${p.medicine_name.replace(/'/g, "\\'")}', '${p.dosage.replace(/'/g, "\\'")}', '${(p.frequency || '').replace(/'/g, "\\'")}', '${(p.duration || '').replace(/'/g, "\\'")}', '${(p.instructions || '').replace(/'/g, "\\'")}')">✏️</button>
                  <button class="btn-icon-sm delete" onclick="deletePrescriptionItem(${p.id})">🗑️</button>
                </div>
              ` : ''}
              <div style="padding-right: ${isDoctorOrAdmin ? '80px' : '0'};">
                <div style="font-size: 1.05rem; font-weight: 600; color: #065f46; margin-bottom: 0.5rem;">
                  ${p.medicine_name}
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem; margin-top: 0.5rem;">
                  <div><strong style="color: #374151;">Liều lượng:</strong> <span style="color: #1f2937;">${p.dosage}</span></div>
                  <div><strong style="color: #374151;">Tần suất:</strong> <span style="color: #1f2937;">${p.frequency || 'Không xác định'}</span></div>
                  <div><strong style="color: #374151;">Thời gian:</strong> <span style="color: #1f2937;">${p.duration || 'Không xác định'}</span></div>
                </div>
                ${p.instructions ? `<div style="margin-top: 0.75rem; padding: 0.5rem; background: white; border-radius: 4px; font-size: 0.9rem; color: #6b7280;"><strong>Ghi chú:</strong> ${p.instructions}</div>` : ''}
              </div>
            </div>
          `).join('') : '<p class="text-muted">Chưa có đơn thuốc</p>'}
      </div>
      
      <div class="detail-section">
        <div class="section-title-row">
          <h3>🔬 Xét nghiệm (${data.labs?.length || 0})</h3>
          ${isDoctorOrAdmin ? '<button class="btn-add-mini" onclick="openModalLab()">➕ Thêm</button>' : ''}
        </div>
        ${data.labs && data.labs.length > 0 ? 
          data.labs.map(l => `
            <div class="detail-item" style="position: relative; padding: 1rem; background: #eff6ff; border-radius: 8px; margin-bottom: 0.75rem; border-left: 3px solid #3b82f6;">
              ${isDoctorOrAdmin ? `
                <div style="position: absolute; top: 0.5rem; right: 0.5rem; display: flex; gap: 0.5rem;">
                  <button class="btn-icon-sm edit" onclick="editLab(${l.id}, '${l.test_name.replace(/'/g, "\\'")}', '${(l.result || '').replace(/'/g, "\\'")}', '${(l.notes || '').replace(/'/g, "\\'")}', '${l.test_date || ''}')">✏️</button>
                  <button class="btn-icon-sm delete" onclick="deleteLabItem(${l.id})">🗑️</button>
                </div>
              ` : ''}
              <div style="padding-right: ${isDoctorOrAdmin ? '80px' : '0'};">
                <div style="font-size: 1.05rem; font-weight: 600; color: #1e40af; margin-bottom: 0.5rem;">
                  ${l.test_name}
                </div>
                <div style="margin-top: 0.5rem;">
                  <strong style="color: #374151;">Kết quả:</strong>
                  <div style="color: #1f2937; margin-top: 0.25rem; padding: 0.5rem; background: white; border-radius: 4px;">
                    ${l.result || 'Chưa có kết quả'}
                  </div>
                </div>
                ${l.notes ? `<div style="margin-top: 0.5rem; padding: 0.5rem; background: white; border-radius: 4px; font-size: 0.9rem; color: #6b7280;"><strong>Ghi chú:</strong> ${l.notes}</div>` : ''}
                <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid #dbeafe;">
                  <small style="color: #6b7280;">📅 ${l.test_date ? new Date(l.test_date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Chưa xác định'}</small>
                </div>
              </div>
            </div>
          `).join('') : '<p class="text-muted">Chưa có xét nghiệm</p>'}
      </div>
    </div>
  `;
}

// Helper functions to open modals
window.openModalRecord = function() {
  const modal = document.getElementById('modalAddRecord');
  document.getElementById('recordPatientId').value = currentPatientId;
  document.getElementById('recordDate').value = new Date().toISOString().split('T')[0];
  showModal(modal);
};

window.openModalPrescription = function() {
  const modal = document.getElementById('modalAddPrescription');
  document.getElementById('prescriptionPatientId').value = currentPatientId;
  showModal(modal);
};

window.openModalLab = function() {
  const modal = document.getElementById('modalAddLab');
  document.getElementById('labPatientId').value = currentPatientId;
  document.getElementById('labTestDate').value = new Date().toISOString().split('T')[0];
  showModal(modal);
};

// Update UI theo role
function updateRoleUI() {
  const role = getRole();
  const token = getToken();
  const logoutBtn = document.getElementById('logoutBtn');
  const currentUser = document.getElementById('currentUser');
  const profileLink = document.getElementById('profileLink');
  const heroActions = document.querySelector('.hero-actions');
  
  // Hero welcome messages
  const heroWelcomeGuest = document.getElementById('heroWelcomeGuest');
  const heroWelcomeUser = document.getElementById('heroWelcomeUser');
  const heroUserName = document.getElementById('heroUserName');
  const heroUserMessage = document.getElementById('heroUserMessage');
  
  // Navbar links
  const navAddPatient = document.getElementById('nav-add-patient');
  const navAdmin = document.getElementById('nav-admin');
  const navDashboard = document.getElementById('nav-dashboard');
  const navPatients = document.getElementById('nav-patients');
  
  // Phân quyền theo role
  if (token && role) {
    // Hiển thị hero message cho user đã login
    if (heroWelcomeGuest) heroWelcomeGuest.style.display = 'none';
    if (heroWelcomeUser) heroWelcomeUser.style.display = 'block';
    
    const username = localStorage.getItem('username') || 'Người dùng';
    if (heroUserName) {
      const roleEmoji = {
        'admin': '🔑',
        'doctor': '👨‍⚕️',
        'user': '👤'
      };
      heroUserName.textContent = `${roleEmoji[role] || ''} ${username}`;
    }
    
    if (heroUserMessage) {
      const roleMessages = {
        'admin': 'Bạn có toàn quyền quản trị hệ thống và quản lý người dùng',
        'doctor': 'Bạn có thể quản lý bệnh nhân và thực hiện các chức năng điều trị',
        'user': 'Bạn có thể xem thông tin bệnh nhân và chi tiết hồ sơ'
      };
      heroUserMessage.textContent = roleMessages[role] || 'Chào mừng bạn đến với hệ thống';
    }
    
    // Show profile link for all logged-in users
    if (profileLink) profileLink.style.display = 'inline-block';
    
    // Admin và Doctor: Hiển thị nút thêm bệnh nhân trong navbar
    if (role === 'admin' || role === 'doctor') {
      if (navAddPatient) navAddPatient.style.display = 'inline-block';
      if (navPatients) navPatients.style.display = 'inline-block';
      
      if (role === 'admin') {
        if (navAdmin) navAdmin.style.display = 'inline-block';
        if (navDashboard) navDashboard.style.display = 'inline-block';
      } else {
        if (navAdmin) navAdmin.style.display = 'none';
      }
    }
    // User/Patient: CHỈ xem
    else {
      if (navAddPatient) navAddPatient.style.display = 'none';
      if (navAdmin) navAdmin.style.display = 'none';
      if (navPatients) navPatients.style.display = 'inline-block';
    }
  } else {
    // Chưa đăng nhập: Ẩn tất cả
    if (heroWelcomeGuest) heroWelcomeGuest.style.display = 'block';
    if (heroWelcomeUser) heroWelcomeUser.style.display = 'none';
    
    if (navAddPatient) navAddPatient.style.display = 'none';
    if (navAdmin) navAdmin.style.display = 'none';
    if (navPatients) navPatients.style.display = 'inline-block';
  }
  
  // Hiển thị/ẩn nút Logout
  if (logoutBtn) {
    logoutBtn.style.display = token ? 'inline-block' : 'none';
  }
  
  // Hiển thị role trong navbar
  if (currentUser) {
    if (token && role) {
      const roleText = {
        'admin': '🔑 Quản trị viên',
        'doctor': '👨‍⚕️ Bác sĩ',
        'user': '👤 Bệnh nhân'
      };
      currentUser.textContent = roleText[role] || 'Người dùng';
    } else {
      currentUser.textContent = 'Chưa đăng nhập';
    }
  }
}

// Load dữ liệu ban đầu
async function loadInitialData() {
  // Check if user is logged in
  const token = getToken();
  if (!token) {
    console.log('⚠️ Chưa đăng nhập, redirect to login');
    window.location.href = 'login.html';
    return;
  }
  
  try {
    const patients = await getPatients();
    allPatients = patients; // Store for filtering
    renderPatients(patients);
    await loadStats();
    setupSearchAndFilters(); // Setup event listeners
  } catch (error) {
    console.error('Lỗi tải dữ liệu:', error);
    const ul = document.getElementById('patientList');
    if (ul) {
      ul.innerHTML = '<li style="color: red; text-align: center;">❌ Không thể kết nối đến server</li>';
    }
  }
}

// Setup search and filter event listeners
function setupSearchAndFilters() {
  const searchInput = document.getElementById('searchInput');
  const filterGender = document.getElementById('filterGender');
  const filterBloodType = document.getElementById('filterBloodType');
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilters.search = e.target.value.toLowerCase();
      applyFilters();
    });
  }
  
  if (filterGender) {
    filterGender.addEventListener('change', (e) => {
      currentFilters.gender = e.target.value;
      applyFilters();
    });
  }
  
  if (filterBloodType) {
    filterBloodType.addEventListener('change', (e) => {
      currentFilters.bloodType = e.target.value;
      applyFilters();
    });
  }
}

// Apply filters to patient list
function applyFilters() {
  let filtered = allPatients;
  
  // Search filter
  if (currentFilters.search) {
    filtered = filtered.filter(p => {
      const searchStr = currentFilters.search;
      return (
        (p.name && p.name.toLowerCase().includes(searchStr)) ||
        (p.phone && p.phone.includes(searchStr)) ||
        (p.email && p.email.toLowerCase().includes(searchStr)) ||
        (p.id_card && p.id_card.includes(searchStr))
      );
    });
  }
  
  // Gender filter
  if (currentFilters.gender) {
    filtered = filtered.filter(p => p.gender === currentFilters.gender);
  }
  
  // Blood type filter
  if (currentFilters.bloodType) {
    filtered = filtered.filter(p => p.blood_type === currentFilters.bloodType);
  }
  
  renderPatients(filtered);
}

// Load thống kê
async function loadStats() {
  try {
    const token = getToken();
    const response = await fetch('http://localhost:3000/api/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to load stats');
    
    const stats = await response.json();
    
    const totalPatients = document.getElementById('totalPatients');
    const totalRecords = document.getElementById('totalRecords');
    const totalPrescriptions = document.getElementById('totalPrescriptions');
    const totalLabs = document.getElementById('totalLabs');
    
    if (totalPatients) totalPatients.textContent = stats.patients || 0;
    if (totalRecords) totalRecords.textContent = stats.records || 0;
    if (totalPrescriptions) totalPrescriptions.textContent = stats.prescriptions || 0;
    if (totalLabs) totalLabs.textContent = stats.labs || 0;
  } catch (error) {
    console.error('❌ Error loading stats:', error);
  }
}

// Event Listeners
const refreshBtn = document.getElementById('refresh');
if (refreshBtn) {
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.textContent = '⏳ Đang tải...';
    refreshBtn.disabled = true;
    try {
      const patients = await getPatients(getToken());
      allPatients = patients;
      
      // Reset filters
      currentFilters = { search: '', gender: '', bloodType: '' };
      const searchInput = document.getElementById('searchInput');
      const filterGender = document.getElementById('filterGender');
      const filterBloodType = document.getElementById('filterBloodType');
      if (searchInput) searchInput.value = '';
      if (filterGender) filterGender.value = '';
      if (filterBloodType) filterBloodType.value = '';
      
      renderPatients(allPatients);
    } finally {
      refreshBtn.textContent = '🔄 Tải Lại';
      refreshBtn.disabled = false;
    }
  });
}

const createForm = document.getElementById('createForm');
if (createForm) {
  createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const resultDiv = document.getElementById('createResult');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Đang thêm bệnh nhân...';
      
      const payload = {
        name: document.getElementById('name').value,
        dob: document.getElementById('dob').value || null,
        gender: document.getElementById('gender').value,
        address: document.getElementById('address').value || null,
        phone: document.getElementById('phone').value || null,
        // Thông tin bổ sung
        idCard: document.getElementById('idCard')?.value || null,
        email: document.getElementById('email')?.value || null,
        emergencyContact: document.getElementById('emergencyContact')?.value || null,
        emergencyPhone: document.getElementById('emergencyPhone')?.value || null,
        bloodType: document.getElementById('bloodType')?.value || null,
        insuranceNumber: document.getElementById('insuranceNumber')?.value || null,
        allergies: document.getElementById('allergies')?.value || null,
        medicalHistory: document.getElementById('medicalHistory')?.value || null,
        currentMedications: document.getElementById('currentMedications')?.value || null,
        occupation: document.getElementById('occupation')?.value || null,
        maritalStatus: document.getElementById('maritalStatus')?.value || null,
        notes: document.getElementById('notes')?.value || null
      };
      
      // Loại bỏ các trường null/undefined
      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === undefined || payload[key] === '') {
          delete payload[key];
        }
      });
      
      const result = await addPatient(payload);
      
      if (result.error) {
        resultDiv.innerHTML = `<div class="error-message">❌ ${result.error}</div>`;
      } else {
        resultDiv.innerHTML = '<div class="success-message">✅ Đã thêm bệnh nhân thành công vào hệ thống!</div>';
        createForm.reset();
        await loadAndRenderPatients(renderPatients);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setTimeout(() => {
          resultDiv.innerHTML = '';
        }, 5000);
      }
    } catch (error) {
      resultDiv.innerHTML = `<div class="error-message">❌ Lỗi: ${error.message}</div>`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '✅ Thêm Bệnh Nhân Vào Hệ Thống';
    }
  });
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    clearAuth();
    updateRoleUI();
    loadAndRenderPatients(renderPatients);
    toast.success('Đã đăng xuất thành công!');
  });
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', () => {
  updateRoleUI();
  loadInitialData();
});

// Load ngay lập tức nếu DOM đã ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    updateRoleUI();
    loadInitialData();
    initModals();
  });
} else {
  updateRoleUI();
  loadInitialData();
  initModals();
}

// ===== MODAL MANAGEMENT =====
let currentPatientId = null;

function initModals() {
  // Lấy các modal elements
  const modalAddRecord = document.getElementById('modalAddRecord');
  const modalAddPrescription = document.getElementById('modalAddPrescription');
  const modalAddLab = document.getElementById('modalAddLab');
  
  // Buttons to open modals
  const btnAddRecord = document.getElementById('btnAddRecord');
  
  // Close buttons
  const closeButtons = document.querySelectorAll('.modal-close, .modal-cancel');
  
  // Show modal khi click button
  if (btnAddRecord) {
    btnAddRecord.addEventListener('click', () => {
      if (currentPatientId) {
        document.getElementById('recordPatientId').value = currentPatientId;
        showModal(modalAddRecord);
      } else {
        alert('⚠️ Vui lòng chọn bệnh nhân trước!');
      }
    });
  }
  
  // Close modal handlers
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      hideAllModals();
    });
  });
  
  // Close modal khi click outside
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      hideAllModals();
    }
  });
  
  // Form submissions
  const formAddRecord = document.getElementById('formAddRecord');
  if (formAddRecord) {
    formAddRecord.addEventListener('submit', handleAddRecord);
  }
  
  const formAddPrescription = document.getElementById('formAddPrescription');
  if (formAddPrescription) {
    formAddPrescription.addEventListener('submit', handleAddPrescription);
  }
  
  const formAddLab = document.getElementById('formAddLab');
  if (formAddLab) {
    formAddLab.addEventListener('submit', handleAddLab);
  }
}

window.showModal = function(modal) {
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
};

function hideAllModals() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.classList.remove('show');
  });
  document.body.style.overflow = '';
}

// Handle form submissions
async function handleAddRecord(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    patient_id: formData.get('patient_id'),
    diagnosis: formData.get('diagnosis'),
    treatment: formData.get('treatment'),
    date: formData.get('date') || new Date().toISOString().split('T')[0]
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    if (response.ok) {
      toast.success(result.message);
      hideAllModals();
      e.target.reset();
      // Reload patient detail
      if (currentPatientId) {
        loadPatientDetail(currentPatientId);
      }
    } else {
      toast.error(result.error || 'Có lỗi xảy ra');
    }
  } catch (error) {
    console.error('Error adding record:', error);
    toast.error('Không thể kết nối đến server');
  }
}

async function handleAddPrescription(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    patient_id: formData.get('patient_id'),
    medicine_name: formData.get('medicine_name'),
    dosage: formData.get('dosage'),
    frequency: formData.get('frequency'),
    duration: formData.get('duration'),
    instructions: formData.get('instructions')
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/prescriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    if (response.ok) {
      toast.success(result.message);
      hideAllModals();
      e.target.reset();
      if (currentPatientId) {
        loadPatientDetail(currentPatientId);
      }
    } else {
      toast.error(result.error || 'Có lỗi xảy ra');
    }
  } catch (error) {
    console.error('Error adding prescription:', error);
    toast.error('Không thể kết nối đến server');
  }
}

async function handleAddLab(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    patient_id: formData.get('patient_id'),
    test_name: formData.get('test_name'),
    result: formData.get('result'),
    test_date: formData.get('test_date') || new Date().toISOString().split('T')[0]
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/labs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    if (response.ok) {
      toast.success(result.message);
      hideAllModals();
      e.target.reset();
      if (currentPatientId) {
        loadPatientDetail(currentPatientId);
      }
    } else {
      toast.error(result.error || 'Có lỗi xảy ra');
    }
  } catch (error) {
    console.error('Error adding lab:', error);
    toast.error('Không thể kết nối đến server');
  }
}

// Load patient detail with API call
window.loadPatientDetail = async function(patientId) {
  currentPatientId = patientId;
  
  try {
    // Get patient records
    const recordsRes = await fetch(`http://localhost:3000/api/records?patient_id=${patientId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const records = await recordsRes.json();
    
    // Get prescriptions
    const prescriptionsRes = await fetch(`http://localhost:3000/api/prescriptions?patient_id=${patientId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const prescriptions = await prescriptionsRes.json();
    
    // Get lab results
    const labsRes = await fetch(`http://localhost:3000/api/labs?patient_id=${patientId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const labs = await labsRes.json();
    
    renderDetail({ records, prescriptions, labs });
    
    // Show "Add Record" button for doctors
    const role = getRole();
    const btnAddRecord = document.getElementById('btnAddRecord');
    if (btnAddRecord && (role === 'doctor' || role === 'admin')) {
      btnAddRecord.style.display = 'block';
    }
    
  } catch (error) {
    console.error('Error loading patient detail:', error);
  }
}

// ===== EDIT & DELETE FUNCTIONS =====
import { updateRecord, deleteRecord, updatePrescription, deletePrescription, updateLab, deleteLab } from './api.js';

// Medical Records Edit/Delete
window.editRecord = async function(id, diagnosis, treatment) {
  const newDiagnosis = prompt('Chẩn đoán:', diagnosis);
  if (newDiagnosis === null) return;
  
  const newTreatment = prompt('Điều trị:', treatment);
  if (newTreatment === null) return;
  
  try {
    loading.show('Đang cập nhật...');
    const result = await updateRecord(id, { diagnosis: newDiagnosis, treatment: newTreatment });
    loading.hide();
    
    if (result.message) {
      toast.success(result.message);
      await loadPatientDetail(currentPatientId);
    } else {
      toast.error(result.error || 'Có lỗi xảy ra');
    }
  } catch (error) {
    loading.hide();
    toast.error('Lỗi cập nhật hồ sơ');
    console.error(error);
  }
};

window.deleteRecordItem = async function(id) {
  const confirmed = await confirm('Bạn có chắc chắn muốn xóa hồ sơ này?');
  if (!confirmed) return;
  
  try {
    loading.show('Đang xóa...');
    const result = await deleteRecord(id);
    loading.hide();
    
    if (result.message) {
      toast.success(result.message);
      await loadPatientDetail(currentPatientId);
    } else {
      toast.error(result.error || 'Có lỗi xảy ra');
    }
  } catch (error) {
    loading.hide();
    toast.error('Lỗi xóa hồ sơ');
    console.error(error);
  }
};

// Prescriptions Edit/Delete
window.editPrescription = async function(id, medicineName, dosage, frequency, duration, instructions) {
  const newMedicine = prompt('Tên thuốc:', medicineName);
  if (newMedicine === null) return;
  
  const newDosage = prompt('Liều lượng:', dosage);
  if (newDosage === null) return;
  
  const newFrequency = prompt('Tần suất:', frequency);
  const newDuration = prompt('Thời gian:', duration);
  const newInstructions = prompt('Ghi chú:', instructions);
  
  try {
    loading.show('Đang cập nhật...');
    const result = await updatePrescription(id, { 
      medicine_name: newMedicine, 
      dosage: newDosage,
      frequency: newFrequency,
      duration: newDuration,
      note: newInstructions
    });
    loading.hide();
    
    if (result.message) {
      toast.success(result.message);
      await loadPatientDetail(currentPatientId);
    } else {
      toast.error(result.error || 'Có lỗi xảy ra');
    }
  } catch (error) {
    loading.hide();
    toast.error('Lỗi cập nhật đơn thuốc');
    console.error(error);
  }
};

window.deletePrescriptionItem = async function(id) {
  const confirmed = await confirm('Bạn có chắc chắn muốn xóa đơn thuốc này?');
  if (!confirmed) return;
  
  try {
    loading.show('Đang xóa...');
    const result = await deletePrescription(id);
    loading.hide();
    
    if (result.message) {
      toast.success(result.message);
      await loadPatientDetail(currentPatientId);
    } else {
      toast.error(result.error || 'Có lỗi xảy ra');
    }
  } catch (error) {
    loading.hide();
    toast.error('Lỗi xóa đơn thuốc');
    console.error(error);
  }
};

// Lab Results Edit/Delete
window.editLab = async function(id, testName, result, notes, testDate) {
  const newTestName = prompt('Tên xét nghiệm:', testName);
  if (newTestName === null) return;
  
  const newResult = prompt('Kết quả:', result);
  const newNotes = prompt('Ghi chú:', notes);
  
  try {
    loading.show('Đang cập nhật...');
    const updateResult = await updateLab(id, { 
      test_name: newTestName, 
      result: newResult,
      file_url: newNotes // Using file_url field for notes as per backend
    });
    loading.hide();
    
    if (updateResult.message) {
      toast.success(updateResult.message);
      await loadPatientDetail(currentPatientId);
    } else {
      toast.error(updateResult.error || 'Có lỗi xảy ra');
    }
  } catch (error) {
    loading.hide();
    toast.error('Lỗi cập nhật xét nghiệm');
    console.error(error);
  }
};

window.deleteLabItem = async function(id) {
  const confirmed = await confirm('Bạn có chắc chắn muốn xóa kết quả xét nghiệm này?');
  if (!confirmed) return;
  
  try {
    loading.show('Đang xóa...');
    const result = await deleteLab(id);
    loading.hide();
    
    if (result.message) {
      toast.success(result.message);
      await loadPatientDetail(currentPatientId);
    } else {
      toast.error(result.error || 'Có lỗi xảy ra');
    }
  } catch (error) {
    loading.hide();
    toast.error('Lỗi xóa xét nghiệm');
    console.error(error);
  }
};
