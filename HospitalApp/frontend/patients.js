import { getPatients, getRecords, getPrescriptions, getLabs, createPatient } from './api.js';

export async function loadAndRenderPatients(renderFn) {
  try {
    const patients = await getPatients();
    renderFn(patients);
  } catch (error) {
    console.error('❌ Lỗi khi tải danh sách bệnh nhân:', error);
    renderFn({ error: error.message });
  }
}

export async function showPatientDetails(patientId, renderDetailFn) {
  const [records, prescriptions, labs] = await Promise.all([getRecords(), getPrescriptions(), getLabs()]);
  const patientRecords = records.filter(r => r.patient_id === patientId);
  const recordIds = new Set(patientRecords.map(r => r.id));
  const patientPrescriptions = prescriptions.filter(p => recordIds.has(p.record_id));
  const patientLabs = labs.filter(l => recordIds.has(l.record_id));
  renderDetailFn({ records: patientRecords, prescriptions: patientPrescriptions, labs: patientLabs });
}

export async function addPatient(payload) {
  return createPatient(payload);
}
