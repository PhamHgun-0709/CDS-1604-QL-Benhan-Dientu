const API_BASE = 'http://localhost:3000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: 'Bearer ' + token } : {};
}

export async function getPatients() {
  const res = await fetch(`${API_BASE}/patients/`, { headers: { ...getAuthHeaders() } });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || 'Không thể tải danh sách bệnh nhân');
  }
  return res.json();
}

export async function getRecords() {
  const res = await fetch(`${API_BASE}/records/`, { headers: { ...getAuthHeaders() } });
  return res.json();
}

export async function getPrescriptions() {
  const res = await fetch(`${API_BASE}/prescriptions/`, { headers: { ...getAuthHeaders() } });
  return res.json();
}

export async function getLabs() {
  const res = await fetch(`${API_BASE}/labs/`, { headers: { ...getAuthHeaders() } });
  return res.json();
}

export async function createPatient(payload) {
  const res = await fetch(`${API_BASE}/patients/`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify(payload) });
  return res.json();
}

// Medical Records CRUD
export async function createRecord(payload) {
  const res = await fetch(`${API_BASE}/records/`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify(payload) });
  return res.json();
}

export async function updateRecord(id, payload) {
  const res = await fetch(`${API_BASE}/records/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify(payload) });
  return res.json();
}

export async function deleteRecord(id) {
  const res = await fetch(`${API_BASE}/records/${id}`, { method: 'DELETE', headers: { ...getAuthHeaders() } });
  return res.json();
}

// Prescriptions CRUD
export async function createPrescription(payload) {
  const res = await fetch(`${API_BASE}/prescriptions/`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify(payload) });
  return res.json();
}

export async function updatePrescription(id, payload) {
  const res = await fetch(`${API_BASE}/prescriptions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify(payload) });
  return res.json();
}

export async function deletePrescription(id) {
  const res = await fetch(`${API_BASE}/prescriptions/${id}`, { method: 'DELETE', headers: { ...getAuthHeaders() } });
  return res.json();
}

// Lab Results CRUD
export async function createLab(payload) {
  const res = await fetch(`${API_BASE}/labs/`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify(payload) });
  return res.json();
}

export async function updateLab(id, payload) {
  const res = await fetch(`${API_BASE}/labs/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify(payload) });
  return res.json();
}

export async function deleteLab(id) {
  const res = await fetch(`${API_BASE}/labs/${id}`, { method: 'DELETE', headers: { ...getAuthHeaders() } });
  return res.json();
}

export async function registerUser(username, password) {
  const res = await fetch(`${API_BASE}/users/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
  return res.json();
}

export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/users/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
  return res.json();
}

export async function getUsers() {
  const res = await fetch(`${API_BASE}/users/`, { headers: { ...getAuthHeaders() } });
  return res.json();
}
