/* ===== ORIGINAL INLINE JAVASCRIPT BLOCK 1 ===== */
/* ==========================================================================

LOCALSTORAGE DATABASE ENGINE

========================================================================== */

const DB_KEYS = {

PATIENTS: 'erecpass_db_patients',

STAFF: 'erecpass_db_staff',
ADMIN_ACCOUNTS: 'erecpass_db_admin_accounts',

AGREEMENT: 'erecpass_db_agreement',

EMERGENCY_NUMS: 'erecpass_db_emergencynums',

ANNOUNCEMENTS: 'erecpass_db_announcements',

APPOINTMENTS: 'erecpass_db_appointments',

CHATS: 'erecpass_db_chats',

LOGS: 'erecpass_db_logs',

SESSION: 'erecpass_db_session'

};

function initDatabase() {
if (!localStorage.getItem(DB_KEYS.ADMIN_ACCOUNTS)) {
const initialAdmins = [
{ username: "admin", email: "admin@hospital.com", password: "admin123", name: "System Admin" },
{ username: "admin2", email: "admin2@hospital.com", password: "admin456", name: "Assistant Admin" }
];
localStorage.setItem(DB_KEYS.ADMIN_ACCOUNTS, JSON.stringify(initialAdmins));
} else {
const adminAccounts = JSON.parse(localStorage.getItem(DB_KEYS.ADMIN_ACCOUNTS)) || [];
if (!adminAccounts.some(a => a.username === "admin2")) {
adminAccounts.push({ username: "admin2", email: "admin2@hospital.com", password: "admin456", name: "Assistant Admin" });
localStorage.setItem(DB_KEYS.ADMIN_ACCOUNTS, JSON.stringify(adminAccounts));
}
}

if (!localStorage.getItem(DB_KEYS.AGREEMENT)) {

localStorage.setItem(DB_KEYS.AGREEMENT, JSON.stringify({

text: "Welcome to ERecPass (Electronic Health Record Pass). By continuing, you agree to allow Angono General Hospital to securely process your basic personal and health identification records. Data is stored with encryption and accessible only by authorized medical staff.",

photo: ""

}));

}

if (!localStorage.getItem(DB_KEYS.EMERGENCY_NUMS)) {

localStorage.setItem(DB_KEYS.EMERGENCY_NUMS, JSON.stringify({

barangay: "0917-123-4567",

national: "911"

}));

}

if (!localStorage.getItem(DB_KEYS.PATIENTS)) {

const initialPatients = [

{

id: "ER-2026-0001",

fullName: "Juan Dela Cruz",

email: "juan@example.com",

password: "Password123!",

sim: "09123456789",

photo: "https://via.placeholder.com/100",

ageCategory: "Adult",

guardianNum: "09189876543",

status: "Green", // Green, Yellow, Red

labResults: [

{ date: "2026-09-10", type: "CBC Blood Test", result: "Normal range. RBC: 4.8, WBC: 6.5.", photo: "" }

],

prescriptions: [

{ medicine: "Paracetamol 500mg", dosage: "1 tablet every 8 hrs", days: "5 Days", active: true }

],

doctorNotes: "Continue hydration. Next review in 2 weeks.",

online: false

}

];

localStorage.setItem(DB_KEYS.PATIENTS, JSON.stringify(initialPatients));

}

if (!localStorage.getItem(DB_KEYS.STAFF)) {

const initialStaff = [

{ id: "STF-01", name: "Dr. Maria Santos", password: "staff123", role: "General Practitioner", task: "Outpatient Duty", available: true, schedule: "Mon-Fri 8AM-5PM" },

{ id: "STF-02", name: "Nurse Ana Cruz", password: "staff123", role: "Registered Nurse", task: "Triage & QR Scanning", available: true, schedule: "Mon-Sat 7AM-3PM" },

{ id: "STF-03", name: "Nurse Carlo Reyes", password: "staff456", role: "Registered Nurse", task: "Patient Records & Triage", available: true, schedule: "Mon-Sat 8AM-4PM" }
];

localStorage.setItem(DB_KEYS.STAFF, JSON.stringify(initialStaff));

}
// Add the new staff account to existing installations without duplicating it.
const existingStaff = JSON.parse(localStorage.getItem(DB_KEYS.STAFF)) || [];
if (!existingStaff.some(s => s.id === "STF-03")) {
existingStaff.push({ id: "STF-03", name: "Nurse Carlo Reyes", password: "staff456", role: "Registered Nurse", task: "Patient Records & Triage", available: true, schedule: "Mon-Sat 8AM-4PM" });
localStorage.setItem(DB_KEYS.STAFF, JSON.stringify(existingStaff));
}

if (!localStorage.getItem(DB_KEYS.ANNOUNCEMENTS)) {

localStorage.setItem(DB_KEYS.ANNOUNCEMENTS, JSON.stringify([

{ id: 1, text: "Free Dengue Vaccination Program available at Angono General Hospital Outpatient Dept.", photo: "", date: "2026-09-20" }

]));

}

if (!localStorage.getItem(DB_KEYS.APPOINTMENTS)) {

localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify([

{ id: 101, patientId: "ER-2026-0001", patientName: "Juan Dela Cruz", doctor: "Dr. Maria Santos", date: "2026-09-25", reason: "Routine Checkup", status: "Approved" }

]));

}

if (!localStorage.getItem(DB_KEYS.CHATS)) {

localStorage.setItem(DB_KEYS.CHATS, JSON.stringify([]));

}

if (!localStorage.getItem(DB_KEYS.LOGS)) {

localStorage.setItem(DB_KEYS.LOGS, JSON.stringify([

{ timestamp: new Date().toLocaleString(), text: "System initialized with database support." }

]));

}

}

function addLog(text) {

const logs = JSON.parse(localStorage.getItem(DB_KEYS.LOGS)) || [];

logs.unshift({ timestamp: new Date().toLocaleString(), text });

localStorage.setItem(DB_KEYS.LOGS, JSON.stringify(logs));

}

/* ==========================================================================

APP LOGIC & VIEW MANAGEMENT

========================================================================== */

let currentSession = null; // { role: 'patient'|'staff'|'admin', data: ... }

// Top-level `let` bindings are not properties of `window`; expose it so the
// add-on modules below (which read window.currentSession) see the live value.
Object.defineProperty(window, 'currentSession', {
get: function() { return currentSession; },
set: function(v) { currentSession = v; },
configurable: true
});

let staffHtml5QrCode = null;

let selectedChatPatientId = null;

window.onload = function() {

initDatabase();

loadAgreementData();

loadEmergencyNums();

// Check session

const savedSession = localStorage.getItem(DB_KEYS.SESSION);

if (savedSession) {

currentSession = JSON.parse(savedSession);

document.getElementById('splashScreen').classList.add('hidden');

launchPortalByRole(currentSession.role);

} else {

document.getElementById('splashScreen').classList.remove('hidden');

}

setupHoldEmergencyButtons();

};

function proceedFromSplash() {

const checkbox = document.getElementById('splashAgreeCheckbox');

if (!checkbox.checked) {

alert("Please check the agreement box to proceed.");

return;

}

document.getElementById('splashScreen').classList.add('hidden');

document.getElementById('loginPage').classList.remove('hidden');

}

function loadAgreementData() {

const agree = JSON.parse(localStorage.getItem(DB_KEYS.AGREEMENT));

document.getElementById('splashAgreementPreview').innerText = agree.text;

document.getElementById('fullAgreementTextDisplay').innerText = agree.text;

if (agree.photo) {

document.getElementById('agreementPhotoPreviewContainer').classList.remove('hidden');

document.getElementById('agreementPhotoDisplayImg').src = agree.photo;

}

}

function viewAgreementModal() {

document.getElementById('agreementModal').classList.remove('hidden');

}

function closeAgreementModal() {

document.getElementById('agreementModal').classList.add('hidden');

}

function loadEmergencyNums() {

const nums = JSON.parse(localStorage.getItem(DB_KEYS.EMERGENCY_NUMS));

document.getElementById('displayBarangayNum').innerText = nums.barangay;

document.getElementById('callBarangayBtn').href = "tel:" + nums.barangay;

document.getElementById('display911Num').innerText = nums.national;

}

function openEmergencyModal() {

document.getElementById('emergencyModal').classList.remove('hidden');

}

function closeEmergencyModal() {

document.getElementById('emergencyModal').classList.add('hidden');

}

function openHospitalMapModal() {

if (currentSession && currentSession.role === 'patient') {

showPage('hospital-map');

} else {

openGoogleMaps();

}

}

function openGoogleMaps() {

window.open('https://www.google.com/maps?q=Angono+General+Hospital', '_blank');

}

/* Auth View Switches */

function showRegister() {

hideAuthPages();

document.getElementById('registerPage').classList.remove('hidden');

}

function showLogin() {

hideAuthPages();

document.getElementById('loginPage').classList.remove('hidden');

}

function showStaffLogin() {

hideAuthPages();

document.getElementById('staffLoginPage').classList.remove('hidden');

}

function showAdminLogin() {

hideAuthPages();

document.getElementById('adminLoginPage').classList.remove('hidden');

}

function hideAuthPages() {

document.querySelectorAll('.auth-page').forEach(p => p.classList.add('hidden'));

}

/* Patient Registration */

let tempSimCode = "";

function sendSimCode() {

const sim = document.getElementById('regSim').value;

if (!sim) { alert("Please enter SIM mobile number."); return; }

tempSimCode = Math.floor(100000 + Math.random() * 900000).toString();

alert("Verification Code sent to " + sim + ": " + tempSimCode);

}

function handleRegister(e) {

e.preventDefault();

const fullName = document.getElementById('regFullName').value;

const email = document.getElementById('regEmail').value;

const sim = document.getElementById('regSim').value;

const code = document.getElementById('regVerifyCode').value;

const pass = document.getElementById('regPassword').value;

const confirmPass = document.getElementById('regConfirmPassword').value;

if (code !== tempSimCode && code !== "123456") {

alert("Invalid SMS verification code!");

return;

}

if (pass !== confirmPass) {

alert("Passwords do not match!");

return;

}

if (!/[#!?]/.test(pass)) {

alert("Password must contain at least one symbol: # ! ?");

return;

}

const patients = JSON.parse(localStorage.getItem(DB_KEYS.PATIENTS));

if (patients.find(p => p.email === email)) {

alert("Email already registered.");

return;

}

const newId = "ER-2026-0" + (patients.length + 100);

const newPatient = {

id: newId,

fullName: fullName,

email: email,

password: pass,

sim: sim,

photo: "https://via.placeholder.com/100",

ageCategory: "Adult",

guardianNum: sim,

status: "Green",

labResults: [],

prescriptions: [],

doctorNotes: "Account created successfully.",

online: true

};

patients.push(newPatient);

localStorage.setItem(DB_KEYS.PATIENTS, JSON.stringify(patients));

addLog("New Patient Registered: " + fullName + " (" + newId + ")");

alert("Account created successfully! Please login.");

showLogin();

}

/* Logins */

function handleLogin(e) {

e.preventDefault();

const email = document.getElementById('loginEmail').value;

const pass = document.getElementById('loginPassword').value;

const patients = JSON.parse(localStorage.getItem(DB_KEYS.PATIENTS));

const patient = patients.find(p => p.email === email && p.password === pass);

if (patient) {

patient.online = true;

localStorage.setItem(DB_KEYS.PATIENTS, JSON.stringify(patients));

currentSession = { role: 'patient', data: patient };

localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(currentSession));

addLog("Patient logged in: " + patient.fullName);

hideAuthPages();

launchPortalByRole('patient');

} else {

alert("Invalid email or password!");

}

}

function handleStaffLogin(e) {

e.preventDefault();

const name = document.getElementById('staffLoginName').value;

const pass = document.getElementById('staffLoginPassword').value;

const staffList = JSON.parse(localStorage.getItem(DB_KEYS.STAFF));

const staff = staffList.find(s => s.name.toLowerCase() === name.toLowerCase() && s.password === pass);

if (staff) {

currentSession = { role: 'staff', data: staff };

localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(currentSession));

addLog("Staff logged in: " + staff.name);

hideAuthPages();

launchPortalByRole('staff');

} else {

alert("Invalid staff name or password!");

}

}

function handleAdminLogin(e) {

e.preventDefault();

const user = document.getElementById('adminLoginUser').value;

const pass = document.getElementById('adminLoginPassword').value;

const adminAccounts = JSON.parse(localStorage.getItem(DB_KEYS.ADMIN_ACCOUNTS)) || [];
const admin = adminAccounts.find(a =>
(a.username.toLowerCase() === user.toLowerCase() || a.email.toLowerCase() === user.toLowerCase()) &&
a.password === pass
);


if (admin) {
currentSession = { role: 'admin', data: { name: admin.name, username: admin.username } };

localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(currentSession));

addLog("Admin logged in.");

hideAuthPages();

launchPortalByRole('admin');

} else {

alert("Invalid Admin Credentials!");

}

}

function logout() {

if (currentSession && currentSession.role === 'patient') {

const patients = JSON.parse(localStorage.getItem(DB_KEYS.PATIENTS));

const p = patients.find(i => i.id === currentSession.data.id);

if (p) p.online = false;

localStorage.setItem(DB_KEYS.PATIENTS, JSON.stringify(patients));

}

currentSession = null;

localStorage.removeItem(DB_KEYS.SESSION);

if (window.erecpassSupabase && window.erecpassSupabase.auth) {
window.erecpassSupabase.auth.signOut().catch(function(e) { console.warn('Supabase sign-out:', e); });
}

document.getElementById('patientApp').classList.add('hidden');

document.getElementById('staffApp').classList.add('hidden');

document.getElementById('adminApp').classList.add('hidden');

showLogin();

}

function launchPortalByRole(role) {

if (role === 'patient') {

document.getElementById('patientApp').classList.remove('hidden');

refreshPatientPortal();

showPage('dashboard');

} else if (role === 'staff') {

document.getElementById('staffApp').classList.remove('hidden');

refreshStaffPortal();

} else if (role === 'admin') {

document.getElementById('adminApp').classList.remove('hidden');

refreshAdminPortal();

}

}

/* ==========================================================================

PATIENT PORTAL FEATURES

========================================================================== */

function refreshPatientPortal() {

const patients = JSON.parse(localStorage.getItem(DB_KEYS.PATIENTS));

const p = patients.find(item => item.id === currentSession.data.id) || currentSession.data;

currentSession.data = p;

document.getElementById('patientDashboardName').innerText = p.fullName;

document.getElementById('profileNameDisplay').innerText = p.fullName;

document.getElementById('profileEmailDisplay').innerText = p.email;

document.getElementById('editProfileNameInput').value = p.fullName;

document.getElementById('editGuardianContactInput').value = p.guardianNum || "";

document.getElementById('profilePhotoDisplay').src = p.photo || "https://via.placeholder.com/100";

document.getElementById('patientQrIdDisplay').innerText = "ID: " + p.id;

// Status Badge

const statusBadge = document.getElementById('patientDashboardStatusBadge');

const statusProf = document.getElementById('profileHealthStatusDisplay');

if (p.status === 'Green') {

statusBadge.className = "health-status px-3 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 flex items-center gap-1";

statusBadge.innerHTML = `<i class="fa-solid fa-circle text-[8px]"></i> Healthy`;

statusProf.innerText = "Green (Healthy)";

statusProf.className = "text-xs font-bold text-emerald-400";

} else if (p.status === 'Yellow') {

statusBadge.className = "health-status px-3 py-1 rounded-full text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 flex items-center gap-1";

statusBadge.innerHTML = `<i class="fa-solid fa-circle text-[8px]"></i> Pending Results`;

statusProf.innerText = "Yellow (Pending Results)";

statusProf.className = "text-xs font-bold text-amber-400";

} else {

statusBadge.className = "health-status px-3 py-1 rounded-full text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-500/40 flex items-center gap-1";

statusBadge.innerHTML = `<i class="fa-solid fa-circle text-[8px]"></i> High Risk`;

statusProf.innerText = "Red (High Risk)";

statusProf.className = "text-xs font-bold text-rose-400";

}

renderPatientAnnouncements();

renderPatientAppointments();

renderPatientLabResults();

renderPatientPrescriptions();

renderPatientDoctors();

generatePatientQR();

renderPatientChatMessages();

}

function showPage(pageId) {

document.querySelectorAll('#patientApp .page').forEach(page => page.classList.remove('active'));

document.querySelectorAll('.bottom-nav button').forEach(btn => btn.classList.remove('active'));

const targetPage = document.getElementById(pageId);

if (targetPage) targetPage.classList.add('active');

const navBtn = document.getElementById('nav-' + pageId);

if (navBtn) navBtn.classList.add('active');

}

function renderPatientAnnouncements() {

const list = JSON.parse(localStorage.getItem(DB_KEYS.ANNOUNCEMENTS)) || [];

const container = document.getElementById('patientAnnouncementsArea');

container.innerHTML = "";

list.forEach(a => {

container.innerHTML += `

<div class="glass-card p-3 rounded-xl border-cyan-500/30 text-xs flex gap-3 items-center">

<i class="fa-solid fa-bullhorn text-cyan-400 text-base"></i>

<div>

<strong class="text-white block font-tech">Announcement (${a.date})</strong>

<p class="text-slate-300 text-[11px]">${a.text}</p>

</div>

</div>

`;

});

}

function renderPatientAppointments() {

const allAppts = JSON.parse(localStorage.getItem(DB_KEYS.APPOINTMENTS)) || [];

const myAppts = allAppts.filter(a => a.patientId === currentSession.data.id);

const container = document.getElementById('patientAppointmentList');

container.innerHTML = "";

if (myAppts.length === 0) {

container.innerHTML = `<p class="text-xs text-slate-400 p-2">No scheduled appointments.</p>`;

return;

}

myAppts.forEach(a => {

container.innerHTML += `

<div class="list-card p-3.5 rounded-xl flex items-center justify-between">

<div>

<strong class="text-white text-xs block">${a.reason}</strong>

<p class="text-[11px] text-slate-400"><i class="fa-solid fa-user-doctor mr-1"></i>${a.doctor}</p>

<p class="text-[11px] text-cyan-400 mt-0.5"><i class="fa-regular fa-clock mr-1"></i>${a.date}</p>

</div>

<span class="px-2.5 py-1 bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 rounded-full text-[10px] font-tech font-bold">${a.status}</span>

</div>

`;

});

}

function renderPatientLabResults() {

const container = document.getElementById('patientLabResultsList');

const labs = currentSession.data.labResults || [];

container.innerHTML = "";

if (labs.length === 0) {

container.innerHTML = `<p class="text-xs text-slate-400">No lab results on file.</p>`;

return;

}

labs.forEach(l => {

container.innerHTML += `

<div class="record-card p-3.5 rounded-xl space-y-1">

<div class="flex justify-between items-center">

<strong class="text-white text-xs font-tech">${l.type}</strong>

<span class="text-[10px] text-slate-400">${l.date}</span>

</div>

<p class="text-xs text-slate-300">${l.result}</p>

${l.photo ? `<img src="${l.photo}" class="w-full max-h-32 object-cover rounded-lg border border-cyan-500/30 mt-2">` : ''}

</div>

`;

});

}

function renderPatientPrescriptions() {

const container = document.getElementById('patientPrescriptionsList');

const rxList = currentSession.data.prescriptions || [];

container.innerHTML = "";

if (rxList.length === 0) {

container.innerHTML = `<p class="text-xs text-slate-400">No active prescriptions.</p>`;

return;

}

rxList.forEach(rx => {

container.innerHTML += `

<div class="medicine-card p-3.5 rounded-xl flex items-center justify-between">

<div>

<strong class="text-white text-xs block">${rx.medicine}</strong>

<p class="text-[11px] text-slate-400">${rx.dosage} · ${rx.days}</p>

</div>

<span class="px-2 py-1 bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-tech">Active</span>

</div>

`;

});

}

function renderPatientDoctors() {

const staffList = JSON.parse(localStorage.getItem(DB_KEYS.STAFF)) || [];

const container = document.getElementById('patientDoctorsList');

container.innerHTML = "";

staffList.forEach(s => {

const avail = s.available ? '<span class="text-[10px] text-emerald-400 font-bold">● Green (Available)</span>' : '<span class="text-[10px] text-rose-400 font-bold">● Red (Not Available)</span>';

container.innerHTML += `

<div class="doctor-card p-3.5 rounded-xl flex items-center justify-between">

<div>

<strong class="text-white text-xs block">${s.name}</strong>

<p class="text-[11px] text-slate-400">${s.role} · ${s.schedule || 'Mon-Fri'}</p>

${avail}

</div>

</div>

`;

});

}

function generatePatientQR() {

const qrData = encodeURIComponent("ERECPASS:" + currentSession.data.id);

const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}`;

document.getElementById('patientQrDisplay').innerHTML = `<img src="${qrUrl}" alt="QR" class="w-full h-full rounded-lg">`;

}

function downloadPatientQR() {

alert("QR Image downloaded to your device storage.");

}

function saveProfileName() {

const name = document.getElementById('editProfileNameInput').value;

if (!name) return;

const patients = JSON.parse(localStorage.getItem(DB_KEYS.PATIENTS));

const p = patients.find(i => i.id === currentSession.data.id);

p.fullName = name;

localStorage.setItem(DB_KEYS.PATIENTS, JSON.stringify(patients));

currentSession.data.fullName = name;

localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(currentSession));

refreshPatientPortal();

alert("Name updated successfully.");

}

function saveGuardianContact() {

const num = document.getElementById('editGuardianContactInput').value;

const patients = JSON.parse(localStorage.getItem(DB_KEYS.PATIENTS));

const p = patients.find(i => i.id === currentSession.data.id);

p.guardianNum = num;

localStorage.setItem(DB_KEYS.PATIENTS, JSON.stringify(patients));

currentSession.data.guardianNum = num;

localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(currentSession));

refreshPatientPortal();

alert("Guardian contact updated.");

}

function handleProfilePhotoUpload(e) {

const file = e.target.files[0];

if (!file) return;

const reader = new FileReader();

reader.onload = function(evt) {

const patients = JSON.parse(localStorage.getItem(DB_KEYS.PATIENTS));

const p = patients.find(i => i.id === currentSession.data.id);

p.photo = evt.target.result;

localStorage.setItem(DB_KEYS.PATIENTS, JSON.stringify(patients));

currentSession.data.photo = evt.target.result;

localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(currentSession));

refreshPatientPortal();

};

reader.readAsDataURL(file);

}

/* Patient Appointment Booking Modal */

function openBookAppointmentModal() {

const staffList = JSON.parse(localStorage.getItem(DB_KEYS.STAFF)) || [];

const docSelect = document.getElementById('bookApptDoctor');

docSelect.innerHTML = "";

staffList.forEach(s => {

docSelect.innerHTML += `<option value="${s.name}">${s.name} (${s.role})</option>`;

});

document.getElementById('bookAppointmentModal').classList.remove('hidden');

}

function closeBookAppointmentModal() {

document.getElementById('bookAppointmentModal').classList.add('hidden');

}

function submitBookAppointment() {

const date = document.getElementById('bookApptDate').value;

const doc = document.getElementById('bookApptDoctor').value;

const reason = document.getElementById('bookApptReason').value;

if (!date || !reason) { alert("Please complete form fields."); return; }

const appts = JSON.parse(localStorage.getItem(DB_KEYS.APPOINTMENTS)) || [];

appts.push({

id: Date.now(),

patientId: currentSession.data.id,

patientName: currentSession.data.fullName,

doctor: doc,

date: date,

reason: reason,

status: "Pending Approval"

});

localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify(appts));

closeBookAppointmentModal();

refreshPatientPortal();

alert("Appointment submitted to admin for approval.");

}

/* Patient Chat */

function renderPatientChatMessages() {

const chats = JSON.parse(localStorage.getItem(DB_KEYS.CHATS)) || [];

const myChats = chats.filter(c => c.patientId === currentSession.data.id);

const box = document.getElementById('patientChatBox');

box.innerHTML = "";

myChats.forEach(m => {

const isMe = m.sender === 'patient';

box.innerHTML += `

<div class="flex flex-col ${isMe ? 'items-end' : 'items-start'}">

<div class="${isMe ? 'bg-cyan-500 text-slate-950 font-semibold' : 'bot-message text-slate-200'} p-2 rounded-xl max-w-[80%]">

<p>${m.text}</p>

${m.file ? `<img src="${m.file}" class="w-full max-h-32 object-cover rounded mt-1">` : ''}

</div>

<span class="text-[9px] text-slate-500 mt-0.5">${m.timestamp}</span>

</div>

`;

});

}

function sendPatientMessage() {

const txt = document.getElementById('patientChatInput').value;

if (!txt) return;

const chats = JSON.parse(localStorage.getItem(DB_KEYS.CHATS)) || [];

chats.push({

patientId: currentSession.data.id,

sender: 'patient',

text: txt,

file: "",

timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

});

localStorage.setItem(DB_KEYS.CHATS, JSON.stringify(chats));

document.getElementById('patientChatInput').value = "";

renderPatientChatMessages();

}

function sendPatientChatFile(e) {

const file = e.target.files[0];

if (!file) return;

const reader = new FileReader();

reader.onload = function(evt) {

const chats = JSON.parse(localStorage.getItem(DB_KEYS.CHATS)) || [];

chats.push({

patientId: currentSession.data.id,

sender: 'patient',

text: "[File / Photo Attached]",

file: evt.target.result,

timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

});

localStorage.setItem(DB_KEYS.CHATS, JSON.stringify(chats));

renderPatientChatMessages();

};

reader.readAsDataURL(file);

}

/* Emergency Hold Button 3s behavior */

function setupHoldEmergencyButtons() {

const btn = document.getElementById('patientHoldEmergencyBtn');

const ring = document.getElementById('patientProgressRing');

let holdTimer = null;

let progress = 100;

btn.addEventListener('mousedown', startHold);

btn.addEventListener('touchstart', startHold);

btn.addEventListener('mouseup', endHold);

btn.addEventListener('mouseleave', endHold);

btn.addEventListener('touchend', endHold);

function startHold() {

progress = 100;

holdTimer = setInterval(() => {

progress -= 3.33;

if (progress <= 0) {

progress = 0;

clearInterval(holdTimer);

ring.style.strokeDashoffset = "0";

openEmergencyModal();

} else {

ring.style.strokeDashoffset = progress.toString();

}

}, 100);

}

function endHold() {

clearInterval(holdTimer);

progress = 100;

ring.style.strokeDashoffset = "100";

}

}

/* ==========================================================================

STAFF PORTAL FEATURES

========================================================================== */

function refreshStaffPortal() {

document.getElementById('staffPortalNameDisplay').innerText = currentSession.data.name;

document.getElementById('staffAssignedTaskDisplay').innerText = currentSession.data.task || "General Triage";

}

function startStaffQrScanner() {

document.getElementById('scannedPatientCard').classList.add('hidden');

staffHtml5QrCode = new Html5Qrcode("staffQrReader");

staffHtml5QrCode.start(

{ facingMode: "environment" },

{ fps: 10, qrbox: 250 },

(decodedText) => {

handleScannedQrText(decodedText);

stopStaffQrScanner();

},

(errorMessage) => {}

).catch(err => alert("Camera permission error: " + err));

}

function stopStaffQrScanner() {

if (staffHtml5QrCode) {

staffHtml5QrCode.stop().then(() => {

staffHtml5QrCode.clear();

}).catch(err => console.log(err));

}

}

function handleScannedQrText(text) {

let patientId = text.replace("ERECPASS:", "").trim();

const patients = JSON.parse(localStorage.getItem(DB_KEYS.PATIENTS)) || [];

const p = patients.find(item => item.id === patientId || item.id === text);

if (p) {

document.getElementById('scannedPatientCard').classList.remove('hidden');

document.getElementById('scannedName').innerText = p.fullName;

document.getElementById('scannedId').innerText = p.id;

document.getElementById('scannedAge').innerText = p.ageCategory || "Adult";

document.getElementById('scannedGuardian').innerText = p.guardianNum || "None";

document.getElementById('scannedStatusBadge').innerText = p.status;

document.getElementById('scannedStatusBadge').className = p.status === 'Green' ? "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500" : (p.status === 'Yellow' ? "px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500" : "px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500");

const labs = p.labResults || [];

document.getElementById('scannedLabResults').innerText = labs.length ? labs[labs.length-1].result : "No lab results on record.";

document.getElementById('scannedDoctorNote').innerText = p.doctorNotes || "No active doctor notes.";

} else {

alert("Patient QR Code not found in database.");

}

}

/* ==========================================================================

ADMIN PORTAL FEATURES

========================================================================== */

function refreshAdminPortal() {

const patients = JSON.parse(localStorage.getItem(DB_KEYS.PATIENTS)) || [];

document.getElementById('adminTotalPatients').innerText = patients.length;

document.getElementById('adminPendingCount').innerText = patients.filter(p => p.status === 'Yellow').length;

document.getElementById('adminHighRiskCount').innerText = patients.filter(p => p.status === 'Red').length;

renderAdminPatients();

renderAdminStaffList();

renderAdminAppointmentsList();

renderAdminPatientChatList();

renderAdminLogs();

}

function switchAdminTab(tabName) {

document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.add('hidden'));

if (tabName === 'patients') document.getElementById('adminTabPatients').classList.remove('hidden');

if (tabName === 'staff') document.getElementById('adminTabStaff').classList.remove('hidden');

if (tabName === 'announcements') document.getElementById('adminTabAnnouncements').classList.remove('hidden');

if (tabName === 'agreement') document.getElementById('adminTabAgreement').classList.remove('hidden');

if (tabName === 'appointments') document.getElementById('adminTabAppointments').classList.remove('hidden');

if (tabName === 'chat') document.getElementById('adminTabChat').classList.remove('hidden');

if (tabName === 'logs') document.getElementById('adminTabLogs').classList.remove('hidden');

}

function renderAdminPatients() {

const search = document.getElementById('adminSearchPatient').value.toLowerCase();

const patients = JSON.parse(localStorage.getItem(DB_KEYS.PATIENTS)) || [];

const container = document.getElementById('adminPatientsTableList');

container.innerHTML = "";

patients.filter(p => p.fullName.toLowerCase().includes(search) || p.id.toLowerCase().includes(search) || p.status.toLowerCase().includes(search)).forEach(p => {

container.innerHTML += `

<div class="glass-card p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-cyan-500/20">

<div>

<div class="flex items-center gap-2">

<strong class="text-white text-sm font-tech">${p.fullName}</strong>

<span class="text-[10px] px-2 py-0.5 rounded font-bold ${p.status === 'Green' ? 'bg-emerald-950 text-emerald-300' : (p.status === 'Yellow' ? 'bg-amber-950 text-amber-300' : 'bg-rose-950 text-rose-300')}">${p.status}</span>

</div>

<p class="text-xs text-slate-400 mt-0.5">ID: ${p.id} · Email: ${p.email} · Password: <span class="font-mono text-cyan-300">${p.password}</span></p>

<p class="text-[11px] text-slate-400">Guardian Contact: ${p.guardianNum || 'None'}</p>

</div>

<button onclick="openAdminEditPatientModal('${p.id}')" class="px-3 py-1.5 bg-cyan-950 border border-cyan-400/40 text-cyan-300 text-xs font-tech font-bold rounded-xl hover:bg-cyan-900 self-start sm:self-auto">Edit Patient File</button>

</div>

`;

});

}

function openAdminEditPatientModal(patientId) {

const patients = JSON.parse(localStorage.getItem(DB_KEYS.PATIENTS));

const p = patients.find(i => i.id === patientId);

if (!p) return;

document.getElementById('editPatientId').value = p.id;

document.getElementById('editPatientStatus').value = p.status;

document.getElementById('editPatientPrescription').value = p.prescriptions.length ? p.prescriptions[0].medicine : "";

document.getElementById('editPatientDoctorNote').value = p.doctorNotes || "";

document.getElementById('editPatientGuardianNum').value = p.guardianNum || "";

document.getElementById('adminEditPatientModal').classList.remove('hidden');

}

function closeAdminEditPatientModal() {

document.getElementById('adminEditPatientModal').classList.add('hidden');

}

function saveAdminPatientEdit() {

const pid = document.getElementById('editPatientId').value;

const status = document.getElementById('editPatientStatus').value;

const labText = document.getElementById('editPatientLabText').value;

const labPhotoInput = document.getElementById('editPatientLabPhoto');

const rxText = document.getElementById('editPatientPrescription').value;

const docNote = document.getElementById('editPatientDoctorNote').value;

const guardianNum = document.getElementById('editPatientGuardianNum').value;

const patients = JSON.parse(localStorage.getItem(DB_KEYS.PATIENTS));

const p = patients.find(i => i.id === pid);

p.status = status;

p.doctorNotes = docNote;

p.guardianNum = guardianNum;

if (rxText) {

p.prescriptions = [{ medicine: rxText, dosage: "As prescribed", days: "Active", active: true }];

}

const saveFileAndFinish = (photoData) => {

if (labText || photoData) {

p.labResults.push({

date: new Date().toISOString().split('T')[0],

type: "Laboratory Result",

result: labText || "Result Attachment",

photo: photoData || ""

});

}

localStorage.setItem(DB_KEYS.PATIENTS, JSON.stringify(patients));

addLog("Updated Patient Record: " + p.fullName);

closeAdminEditPatientModal();

refreshAdminPortal();

alert("Patient record updated successfully.");

};

if (labPhotoInput.files && labPhotoInput.files[0]) {

const reader = new FileReader();

reader.onload = function(evt) { saveFileAndFinish(evt.target.result); };

reader.readAsDataURL(labPhotoInput.files[0]);

} else {

saveFileAndFinish("");

}

}

function adminCreateStaffAccount() {

const name = document.getElementById('adminCreateStaffName').value;

const pass = document.getElementById('adminCreateStaffPass').value;

const role = document.getElementById('adminCreateStaffRole').value;

const task = document.getElementById('adminCreateStaffTask').value;

if (!name || !pass) { alert("Please complete name and password."); return; }

const staffList = JSON.parse(localStorage.getItem(DB_KEYS.STAFF)) || [];

staffList.push({

id: "STF-0" + (staffList.length + 1),

name: name,

password: pass,

role: role || "Staff",

task: task || "General Duty",

available: true,

schedule: "Mon-Sat"

});

localStorage.setItem(DB_KEYS.STAFF, JSON.stringify(staffList));

addLog("Created Staff Account: " + name);

renderAdminStaffList();

alert("Staff account created!");

}

function renderAdminStaffList() {

const staffList = JSON.parse(localStorage.getItem(DB_KEYS.STAFF)) || [];

const container = document.getElementById('adminStaffList');

container.innerHTML = "";

staffList.forEach(s => {

container.innerHTML += `

<div class="glass-card p-3 rounded-xl flex justify-between items-center text-xs">

<div>

<strong class="text-white block">${s.name} (${s.role})</strong>

<p class="text-slate-400">Password: <span class="font-mono text-cyan-300">${s.password}</span> · Task: ${s.task}</p>

</div>

<button onclick="toggleStaffAvailability('${s.id}')" class="px-2.5 py-1 rounded text-[10px] font-tech font-bold ${s.available ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' : 'bg-rose-950 text-rose-300 border border-rose-500'}">${s.available ? 'Available (Green)' : 'Unavailable (Red)'}</button>

</div>

`;

});

}

function toggleStaffAvailability(staffId) {

const staffList = JSON.parse(localStorage.getItem(DB_KEYS.STAFF)) || [];

const s = staffList.find(i => i.id === staffId);

s.available = !s.available;

localStorage.setItem(DB_KEYS.STAFF, JSON.stringify(staffList));

renderAdminStaffList();

}

function adminPostAnnouncement() {

const text = document.getElementById('adminAnnouncementText').value;

if (!text) return;

const announcements = JSON.parse(localStorage.getItem(DB_KEYS.ANNOUNCEMENTS)) || [];

announcements.unshift({

id: Date.now(),

text: text,

photo: "",

date: new Date().toISOString().split('T')[0]

});

localStorage.setItem(DB_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));

addLog("Posted Announcement: " + text);

alert("Announcement posted.");

}

let tempAgreementPhoto = "";

function handleAdminAgreementPhotoUpload(e) {

const file = e.target.files[0];

if (!file) return;

const reader = new FileReader();

reader.onload = function(evt) { tempAgreementPhoto = evt.target.result; };

reader.readAsDataURL(file);

}

function adminSaveAgreement() {

const text = document.getElementById('adminAgreementText').value;

const agree = { text: text, photo: tempAgreementPhoto };

localStorage.setItem(DB_KEYS.AGREEMENT, JSON.stringify(agree));

addLog("Updated system agreement document.");

loadAgreementData();

alert("Agreement updated.");

}

function renderAdminAppointmentsList() {

const appts = JSON.parse(localStorage.getItem(DB_KEYS.APPOINTMENTS)) || [];

const container = document.getElementById('adminAppointmentsList');

container.innerHTML = "";

appts.forEach(a => {

container.innerHTML += `

<div class="glass-card p-3 rounded-xl flex justify-between items-center text-xs">

<div>

<strong class="text-white block">${a.patientName} - ${a.reason}</strong>

<p class="text-slate-400">Doctor: ${a.doctor} · Date: ${a.date}</p>

</div>

<div class="flex gap-1">

<button onclick="updateApptStatus(${a.id}, 'Approved')" class="px-2 py-1 bg-emerald-950 text-emerald-300 rounded font-tech text-[10px]">Approve</button>

<button onclick="updateApptStatus(${a.id}, 'Cancelled')" class="px-2 py-1 bg-rose-950 text-rose-300 rounded font-tech text-[10px]">Cancel</button>

</div>

</div>

`;

});

}

function updateApptStatus(id, status) {

const appts = JSON.parse(localStorage.getItem(DB_KEYS.APPOINTMENTS)) || [];

const a = appts.find(i => i.id === id);

a.status = status;

localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify(appts));

renderAdminAppointmentsList();

}

function renderAdminPatientChatList() {

const patients = JSON.parse(localStorage.getItem(DB_KEYS.PATIENTS)) || [];

const container = document.getElementById('adminPatientChatList');

container.innerHTML = "";

patients.forEach(p => {

container.innerHTML += `

<div onclick="selectAdminChatPatient('${p.id}')" class="p-2 bg-slate-900 rounded-xl hover:bg-cyan-950 cursor-pointer text-xs flex justify-between items-center">

<span class="text-white font-tech">${p.fullName}</span>

<span class="w-2 h-2 rounded-full ${p.online ? 'bg-emerald-400' : 'bg-slate-600'}"></span>

</div>

`;

});

}

function selectAdminChatPatient(pid) {

selectedChatPatientId = pid;

const patients = JSON.parse(localStorage.getItem(DB_KEYS.PATIENTS));

const p = patients.find(i => i.id === pid);

document.getElementById('adminSelectedChatHeader').innerText = "Chatting with: " + p.fullName;

renderAdminChatMessages();

}

function renderAdminChatMessages() {

if (!selectedChatPatientId) return;

const chats = JSON.parse(localStorage.getItem(DB_KEYS.CHATS)) || [];

const filtered = chats.filter(c => c.patientId === selectedChatPatientId);

const box = document.getElementById('adminChatMessagesBox');

box.innerHTML = "";

filtered.forEach(m => {

const isAdmin = m.sender === 'admin';

box.innerHTML += `

<div class="flex flex-col ${isAdmin ? 'items-end' : 'items-start'}">

<div class="${isAdmin ? 'bg-rose-500 text-slate-950 font-semibold' : 'bot-message text-slate-200'} p-2 rounded-xl max-w-[80%]">

<p>${m.text}</p>

${m.file ? `<img src="${m.file}" class="w-full max-h-32 object-cover rounded mt-1">` : ''}

</div>

<span class="text-[9px] text-slate-500 mt-0.5">${m.timestamp}</span>

</div>

`;

});

}

function sendAdminChatMessage() {

if (!selectedChatPatientId) { alert("Please select a patient first."); return; }

const txt = document.getElementById('adminChatInput').value;

if (!txt) return;

const chats = JSON.parse(localStorage.getItem(DB_KEYS.CHATS)) || [];

chats.push({

patientId: selectedChatPatientId,

sender: 'admin',

text: txt,

file: "",

timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

});

localStorage.setItem(DB_KEYS.CHATS, JSON.stringify(chats));

document.getElementById('adminChatInput').value = "";

renderAdminChatMessages();

}

function renderAdminLogs() {

const logs = JSON.parse(localStorage.getItem(DB_KEYS.LOGS)) || [];

const container = document.getElementById('adminLogsContainer');

container.innerHTML = "";

logs.forEach(l => {

container.innerHTML += `<div class="text-slate-400"><span class="text-cyan-400">[${l.timestamp}]</span> ${l.text}</div>`;

});

}

/* ===== ORIGINAL INLINE JAVASCRIPT BLOCK 2 ===== */
(function addUipaquibsSettingsLauncher() {
const run = () => {
const adminTabs = document.querySelector('.flex.flex-wrap.gap-2.border-b');
if (!adminTabs || document.getElementById('uipaquibsSettingsBtn')) return;
const btn = document.createElement('button');
btn.id = 'uipaquibsSettingsBtn';
btn.type = 'button';
btn.className = 'px-3 py-2 bg-slate-900 text-slate-300 rounded-xl border border-cyan-500/20 hover:text-cyan-300 font-tech text-xs';
btn.textContent = 'Settings';
btn.onclick = uipaquibsOpenSettings;
adminTabs.appendChild(btn);
};
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', run);
} else {
run();
}
})();

function uipaquibsOpenSettings() {
if (!currentSession || currentSession.role !== 'admin') {
alert('Admin access only.');
return;
}
const nums = JSON.parse(localStorage.getItem(DB_KEYS.EMERGENCY_NUMS) || '{}');
const input = document.getElementById('uipaquibsBarangayNumber');
if (input) input.value = nums.barangay || '';
document.getElementById('uipaquibsAdminSettingsModal').classList.remove('hidden');
}

function uipaquibsCloseSettings() {
document.getElementById('uipaquibsAdminSettingsModal').classList.add('hidden');
}

function uipaquibsSaveEmergencyNumber() {
if (!currentSession || currentSession.role !== 'admin') {
alert('Admin access only.');
return;
}
const number = document.getElementById('uipaquibsBarangayNumber').value.trim();
if (!number) {
alert('Enter an emergency number.');
return;
}

const nums = JSON.parse(localStorage.getItem(DB_KEYS.EMERGENCY_NUMS) || '{}');
nums.barangay = number;
nums.national = nums.national || '911';
localStorage.setItem(DB_KEYS.EMERGENCY_NUMS, JSON.stringify(nums));

if (typeof addLog === 'function') addLog('Admin updated Barangay emergency number.');
if (typeof loadEmergencyNumbers === 'function') loadEmergencyNumbers();
alert('Emergency number updated.');
}

function uipaquibsSaveLogo() {
if (!currentSession || currentSession.role !== 'admin') {
alert('Admin access only.');
return;
}

const input = document.getElementById('uipaquibsLogoInput');
const file = input && input.files ? input.files[0] : null;
if (!file) {
alert('Select a logo image first.');
return;
}

const reader = new FileReader();
reader.onload = function(evt) {
const dataUrl = evt.target.result;
localStorage.setItem('erecpass_app_logo', dataUrl);

// Apply the logo to the existing visible brand/logo areas
document.querySelectorAll('.logo-icon, .brand > div:first-child').forEach(el => {
el.innerHTML = '<img src="' + dataUrl + '" alt="ERecPass Logo" class="w-full h-full object-contain rounded-xl">';
});

if (typeof addLog === 'function') addLog('Admin updated the ERecPass app logo.');
alert('App logo updated.');
};
reader.readAsDataURL(file);
}

function uipaquibsLoadSavedLogo() {
const dataUrl = localStorage.getItem('erecpass_app_logo');
if (!dataUrl) return;
document.querySelectorAll('.logo-icon, .brand > div:first-child').forEach(el => {
el.innerHTML = '<img src="' + dataUrl + '" alt="ERecPass Logo" class="w-full h-full object-contain rounded-xl">';
});
}

if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', uipaquibsLoadSavedLogo);
} else {
uipaquibsLoadSavedLogo();
}

/* ===== ORIGINAL INLINE JAVASCRIPT BLOCK 3 ===== */
(function ensureUipaquibsPatientAccount2() {
function seed() {
try {
// Ensure the base database (incl. default patients) is seeded first; otherwise
// this block creates the patients key and initDatabase() skips its own seed.
if (typeof initDatabase === 'function') initDatabase();
const key = DB_KEYS.PATIENTS;
const patients = JSON.parse(localStorage.getItem(key) || '[]');

if (!patients.some(p => p.id === 'ER-2026-0002')) {
patients.push({
id: 'ER-2026-0002',
fullName: 'Maria Clara Santos',
email: 'maria2@example.com',
password: 'Patient456!',
sim: '09129876543',
photo: 'https://via.placeholder.com/100',
ageCategory: 'Adult',
guardianNum: '',
status: 'Green',
labResults: [],
prescriptions: [],
doctorNotes: '',
online: false
});
localStorage.setItem(key, JSON.stringify(patients));
}
} catch (err) {
console.error('UIPAQUIBS Patient Account 2 seed error:', err);
}
}

if (typeof DB_KEYS !== 'undefined') {
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', seed);
} else {
seed();
}
}
})();

/* ===== ORIGINAL INLINE JAVASCRIPT BLOCK 4 ===== */
const SUPABASE_URL = window.ERECPASS_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.ERECPASS_SUPABASE_ANON_KEY || '';
let erecpassSupabase = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase && typeof window.supabase.createClient === 'function') {
try {
erecpassSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('ERecPass Supabase client initialized.');
} catch (e) {
erecpassSupabase = null;
console.warn('ERecPass Supabase init failed; using localStorage.', e);
}
// Consumers below check window.erecpassSupabase; a top-level `let` is not on window.
window.erecpassSupabase = erecpassSupabase;
} else {
console.log('ERecPass is using the existing localStorage database. Add Supabase URL/key to enable the backend connection.');
}

/* ===== ORIGINAL INLINE JAVASCRIPT BLOCK 5 ===== */
(function enableThreeSecondHoldForAllEmergencyCalls() {

function setup() {

const buttons = [document.getElementById('callBarangayBtn'), ...Array.from(document.querySelectorAll('a')).filter(a => (a.textContent || '').trim().toLowerCase() === 'call 911')];

buttons.filter(Boolean).forEach(function(btn) {

if (btn.dataset.hold3sEmergencyReady === "1") return;

btn.dataset.hold3sEmergencyReady = "1";

const originalHref = btn.getAttribute("href") || "";

let timer = null;

let activated = false;

let holding = false;

function reset() {

if (timer) { clearTimeout(timer); timer = null; }

holding = false;

if (!activated) btn.innerText = originalLabel(btn);

}

function originalLabel(el) {

return el.id === 'callBarangayBtn' ? 'Hold 3s to Call' : 'Hold 3s to Call 911';

}

btn.innerText = originalLabel(btn);

btn.setAttribute("aria-label", "Press and hold for 3 seconds to activate emergency call");

btn.addEventListener("pointerdown", function(e) {

e.preventDefault();

holding = true;

activated = false;

btn.innerText = "Hold... 3";

let remaining = 3;

const countdown = setInterval(function() {

if (!holding) { clearInterval(countdown); return; }

remaining -= 1;

if (remaining > 0) btn.innerText = "Hold... " + remaining;

}, 1000);

timer = setTimeout(function() {

if (!holding) return;

activated = true;

clearInterval(countdown);

btn.innerText = "Calling...";

const href = originalHref || btn.getAttribute("href");

if (href) window.location.href = href;

}, 3000);

});

btn.addEventListener("pointerup", function(e) {

e.preventDefault();

if (!activated) reset();

holding = false;

});

btn.addEventListener("pointerleave", function() {

if (!activated) reset();

});

btn.addEventListener("pointercancel", function() {

if (!activated) reset();

});

btn.addEventListener("click", function(e) {

if (!activated) e.preventDefault();

activated = false;

});

});

}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup);

else setup();

})();

/* ===== ORIGINAL INLINE JAVASCRIPT BLOCK 6 ===== */
(function enableLoginEmergencyHold3s() {
function setupLoginEmergencyHold() {
const buttons = Array.from(document.querySelectorAll('button[onclick="openEmergencyModal()"]'))
.filter(btn => btn.id !== 'patientHoldEmergencyBtn');

buttons.forEach(function(btn) {
if (btn.dataset.loginHold3sReady === '1') return;
btn.dataset.loginHold3sReady = '1';

// Keep the original emergency action; only require a 3-second hold before it runs.
btn.removeAttribute('onclick');
let timer = null;
let countdown = null;
let holding = false;
let activated = false;
const originalText = btn.innerHTML;

function reset() {
if (timer) { clearTimeout(timer); timer = null; }
if (countdown) { clearInterval(countdown); countdown = null; }
holding = false;
if (!activated) btn.innerHTML = originalText;
}

btn.setAttribute('aria-label', 'Press and hold for 3 seconds to open emergency call');

btn.addEventListener('pointerdown', function(e) {
e.preventDefault();
holding = true;
activated = false;
let remaining = 3;
btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> HOLD... 3';

countdown = setInterval(function() {
if (!holding) { clearInterval(countdown); countdown = null; return; }
remaining -= 1;
if (remaining > 0) {
btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> HOLD... ' + remaining;
}
}, 1000);

timer = setTimeout(function() {
if (!holding) return;
activated = true;
if (countdown) { clearInterval(countdown); countdown = null; }
btn.innerHTML = '<i class="fa-solid fa-phone"></i> OPENING...';
openEmergencyModal();
setTimeout(function() {
if (activated) btn.innerHTML = originalText;
}, 500);
}, 3000);
});

btn.addEventListener('pointerup', function(e) {
e.preventDefault();
if (!activated) reset();
holding = false;
});
btn.addEventListener('pointerleave', function() {
if (!activated) reset();
});
btn.addEventListener('pointercancel', function() {
if (!activated) reset();
});
btn.addEventListener('click', function(e) {
if (!activated) e.preventDefault();
activated = false;
});
});
}

if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', setupLoginEmergencyHold);
} else {
setupLoginEmergencyHold();
}
})();

/* ===== ORIGINAL INLINE JAVASCRIPT BLOCK 7 ===== */
(function setupErecpassMultiPhoneSync(){
// This addition keeps the existing localStorage behavior as a fallback.
// When SUPABASE_URL + SUPABASE_ANON_KEY are configured, appointments
// are shared between phones through the Supabase "appointments" table.
const CLOUD_TABLE = 'appointments';
let cloudTimer = null;
let originalSubmitBookAppointment = null;

function cloudReady(){
return !!(window.erecpassSupabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY);
}

function localAppointments(){
try { return JSON.parse(localStorage.getItem(DB_KEYS.APPOINTMENTS) || '[]'); }
catch(e){ return []; }
}

function saveLocalAppointments(list){
localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify(list));
}

function normalizeCloud(row){
return {
id: Number(row.id),
patientId: row.patient_id,
patientName: row.patient_name,
doctor: row.doctor,
date: row.appointment_date,
reason: row.reason,
status: row.status || 'Pending Approval'
};
}

async function pushAppointmentToCloud(a){
if (!cloudReady()) return false;
const uid = await cloudUserId();
if (!uid) return false; // RLS requires an authenticated Supabase user
const payload = {
id: Number(a.id),
patient_id: a.patientId || '',
patient_name: a.patientName || '',
doctor: a.doctor || '',
appointment_date: a.date || null,
reason: a.reason || '',
status: a.status || 'Pending Approval',
updated_at: new Date().toISOString(),
user_id: uid
};
const { error } = await window.erecpassSupabase.from(CLOUD_TABLE).upsert(payload, { onConflict: 'id' });
if (error) { console.error('ERecPass cloud appointment upload:', error); return false; }
return true;
}

async function cloudUserId(){
try {
const { data } = await window.erecpassSupabase.auth.getSession();
return (data && data.session && data.session.user) ? data.session.user.id : null;
} catch (e) { return null; }
}

async function pullAppointmentsFromCloud(){
if (!cloudReady()) return;
if (!(await cloudUserId())) return;
const { data, error } = await window.erecpassSupabase
.from(CLOUD_TABLE)
.select('id,patient_id,patient_name,doctor,appointment_date,reason,status,updated_at')
.order('appointment_date', { ascending: true });
if (error) { console.error('ERecPass cloud appointment download:', error); return; }

const cloudList = (data || []).map(normalizeCloud);
const localList = localAppointments();
const byId = {};
localList.forEach(a => { byId[String(a.id)] = a; });
cloudList.forEach(a => { byId[String(a.id)] = a; });
const merged = Object.values(byId);
saveLocalAppointments(merged);

if (typeof renderPatientAppointments === 'function' && window.currentSession && window.currentSession.role === 'patient') renderPatientAppointments();
if (typeof window.renderAdminAppointmentsList === 'function' && document.getElementById('adminAppointmentsList')) window.renderAdminAppointmentsList();
}

async function syncAllLocalAppointments(){
if (!cloudReady()) return;
const list = localAppointments();
for (const a of list) await pushAppointmentToCloud(a);
await pullAppointmentsFromCloud();
}

// Wrap the existing patient booking function without deleting/replacing its code.
function attachBookingSync(){
if (originalSubmitBookAppointment || typeof window.submitBookAppointment !== 'function') return;
originalSubmitBookAppointment = window.submitBookAppointment;
window.submitBookAppointment = async function(){
originalSubmitBookAppointment();
if (!cloudReady()) return;
const list = localAppointments();
const session = window.currentSession;
if (!session || !session.data) return;
const latest = list.filter(a => a.patientId === session.data.id).sort((x,y)=>Number(y.id)-Number(x.id))[0];
if (latest) await pushAppointmentToCloud(latest);
};
}

// Add cloud sync to the existing Admin approve/cancel action.
function attachStatusSync(){
if (typeof window.updateApptStatus !== 'function') return;
const original = window.updateApptStatus;
if (original.__cloudWrapped) return;
const wrapped = async function(id, status){
original(id, status);
if (!cloudReady()) return;
const a = localAppointments().find(x => Number(x.id) === Number(id));
if (a) await pushAppointmentToCloud(a);
};
wrapped.__cloudWrapped = true;
window.updateApptStatus = wrapped;
}

function showCloudStatus(){
const host = document.getElementById('adminAppointmentsList');
if (!host || document.getElementById('erecpassCloudSyncStatus')) return;
const div = document.createElement('div');
div.id = 'erecpassCloudSyncStatus';
div.className = 'mb-3 p-2 rounded-xl text-[10px] font-tech border';
div.innerHTML = cloudReady()
? '<span class="text-emerald-300">● CLOUD SYNC ACTIVE — appointments can be shared across phones.</span>'
: '<span class="text-amber-300">● LOCAL MODE — configure Supabase URL and anon key to share appointments across phones.</span>';
host.parentNode.insertBefore(div, host);
}

async function start(){
attachBookingSync();
attachStatusSync();
showCloudStatus();
if (cloudReady()) {
await syncAllLocalAppointments();
if (cloudTimer) clearInterval(cloudTimer);
cloudTimer = setInterval(pullAppointmentsFromCloud, 10000);
}
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
})();

/* ===== ORIGINAL INLINE JAVASCRIPT BLOCK 8 ===== */
// Add-only enhancement. Existing appointment code remains untouched.
// Admin can approve or cancel each appointment from Manage Appointments.
window.renderAdminAppointmentsList = function() {
const appts = JSON.parse(localStorage.getItem(DB_KEYS.APPOINTMENTS)) || [];
const container = document.getElementById('adminAppointmentsList');
if (!container) return;
container.innerHTML = '';

if (!appts.length) {
container.innerHTML = '<p class="text-xs text-slate-400 p-3">No appointments found.</p>';
return;
}

appts.forEach(function(a) {
const status = a.status || 'Pending';
const isFinal = status === 'Approved' || status === 'Cancelled';
const statusClass = status === 'Approved'
? 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
: status === 'Cancelled'
? 'bg-rose-950 text-rose-300 border-rose-500/30'
: 'bg-amber-950 text-amber-300 border-amber-500/30';

container.innerHTML += `
<div class="glass-card p-3 rounded-xl flex flex-col md:flex-row md:justify-between md:items-center gap-3 text-xs">
<div>
<strong class="text-white block">${a.patientName || 'Unknown Patient'} - ${a.reason || 'Consultation'}</strong>
<p class="text-slate-400">Doctor: ${a.doctor || 'N/A'} · Date: ${a.date || 'N/A'}</p>
<span class="inline-block mt-2 px-2 py-1 rounded-lg border ${statusClass}">${status}</span>
</div>
<div class="flex gap-1">
<button onclick="updateApptStatus(${a.id}, 'Approved')" ${isFinal ? 'disabled' : ''} class="px-2 py-1 bg-emerald-950 text-emerald-300 rounded font-tech text-[10px] ${isFinal ? 'opacity-40 cursor-not-allowed' : ''}">Approve</button>
<button onclick="updateApptStatus(${a.id}, 'Cancelled')" ${isFinal ? 'disabled' : ''} class="px-2 py-1 bg-rose-950 text-rose-300 rounded font-tech text-[10px] ${isFinal ? 'opacity-40 cursor-not-allowed' : ''}">Cancel</button>
</div>
</div>
`;
});
};

// Keep the existing update function behavior, while adding safe status handling.
window.updateApptStatus = function(id, status) {
const appts = JSON.parse(localStorage.getItem(DB_KEYS.APPOINTMENTS)) || [];
const a = appts.find(function(item) { return item.id === id; });
if (!a) return;
if (a.status === 'Approved' || a.status === 'Cancelled') return;
a.status = status;
localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify(appts));
if (typeof addLog === 'function') {
addLog('Admin ' + status.toLowerCase() + ' appointment for ' + (a.patientName || 'patient') + '.');
}
window.renderAdminAppointmentsList();
};

// Refresh the admin appointment list when the page is ready.
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', function() {
if (document.getElementById('adminAppointmentsList')) window.renderAdminAppointmentsList();
});
} else if (document.getElementById('adminAppointmentsList')) {
window.renderAdminAppointmentsList();
}

/* ===== ORIGINAL INLINE JAVASCRIPT BLOCK 9 ===== */
(function initGuestHelpCenterAddition(){
  const DB = {
    conversations: 'erecpass_help_conversations',
    guestSession: 'erecpass_help_guest_session'
  };

  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));

  const now = () => new Date().toLocaleString([], {
    year:'numeric', month:'short', day:'2-digit',
    hour:'2-digit', minute:'2-digit'
  });

  function getConversations(){
    try { return JSON.parse(localStorage.getItem(DB.conversations)) || []; }
    catch(e){ return []; }
  }
  function saveConversations(list){ localStorage.setItem(DB.conversations, JSON.stringify(list)); }

  function createId(){
    return 'HC-' + Date.now().toString(36).toUpperCase() + '-' +
      Math.random().toString(36).slice(2,7).toUpperCase();
  }

  function ensureGuestSession(){
    try { return JSON.parse(localStorage.getItem(DB.guestSession) || 'null'); }
    catch(e){ return null; }
  }

  function setGuestSession(v){ localStorage.setItem(DB.guestSession, JSON.stringify(v)); }

  function guestHelpMarkup(){
    if(document.getElementById('guestHelpCenterModal')) return;
    const wrap=document.createElement('div');
    wrap.id='guestHelpCenterModal';
    wrap.className='fixed inset-0 z-[70] bg-black/80 hidden items-center justify-center p-4';
    wrap.innerHTML=`
      <div class="glass-card w-full max-w-lg rounded-3xl p-5 max-h-[92vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-tech font-bold text-cyan-300">Help Center</h2>
            <p class="text-xs text-slate-400">Need help? Send us a message and our support team will assist you.</p>
          </div>
          <button type="button" onclick="closeGuestHelpCenter()" class="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        <div id="guestHelpStartView">
          <form id="guestHelpForm" class="space-y-3">
            <div>
              <label class="block text-xs font-tech font-bold text-cyan-300 uppercase mb-1">Full Name</label>
              <div class="input-box flex items-center gap-3 px-3.5 py-2.5 rounded-xl">
                <i class="fa-solid fa-user text-cyan-400 text-xs"></i>
                <input id="guestHelpName" type="text" required placeholder="Your full name" class="w-full bg-transparent outline-none text-xs">
              </div>
            </div>
            <div>
              <label class="block text-xs font-tech font-bold text-cyan-300 uppercase mb-1">Email Address</label>
              <div class="input-box flex items-center gap-3 px-3.5 py-2.5 rounded-xl">
                <i class="fa-solid fa-envelope text-cyan-400 text-xs"></i>
                <input id="guestHelpEmail" type="email" required placeholder="you@example.com" class="w-full bg-transparent outline-none text-xs">
              </div>
            </div>
            <div>
              <label class="block text-xs font-tech font-bold text-cyan-300 uppercase mb-1">Message</label>
              <textarea id="guestHelpMessage" required placeholder="How can we help you?" class="input-box w-full p-3 rounded-xl text-xs h-28"></textarea>
            </div>
            <button type="submit" class="primary-btn w-full py-3 rounded-xl font-tech font-bold text-xs tracking-wider">SEND MESSAGE</button>
          </form>
        </div>

        <div id="guestHelpConversationView" class="hidden">
          <div class="flex items-center justify-between gap-2 mb-3">
            <div>
              <div class="text-xs text-slate-400">Conversation ID</div>
              <strong id="guestHelpConversationId" class="text-xs font-tech text-cyan-300">---</strong>
            </div>
            <span id="guestHelpConversationStatus" class="help-status text-cyan-300">New</span>
          </div>
          <div id="guestHelpMessages" class="space-y-2 max-h-72 overflow-y-auto mb-3"></div>
          <div class="chat-input p-2 rounded-xl flex items-center gap-2">
            <input id="guestHelpReplyInput" type="text" placeholder="Continue the conversation..." class="w-full text-xs outline-none bg-transparent">
            <button type="button" onclick="sendGuestHelpReply()" class="px-3 py-1.5 bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs font-tech">
              <i class="fa-solid fa-paper-plane"></i>
            </button>
          </div>
          <div id="guestHelpSuccess" class="hidden mt-3 p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 text-emerald-300 text-xs">
            Your message has been sent. Our support team will reply as soon as possible.
          </div>
          <button type="button" onclick="backToGuestHelpStart()" class="w-full mt-3 py-2 text-xs text-slate-400 hover:text-white font-tech">← Back to Help Center</button>
        </div>

        <button type="button" onclick="closeGuestHelpCenter()" class="w-full mt-3 py-2 text-xs text-slate-400 hover:text-white font-tech">Back to Login</button>
      </div>`;
    document.body.appendChild(wrap);
    document.getElementById('guestHelpForm').addEventListener('submit', submitGuestHelp);
  }

  function addLoginButton(){
    const loginPage=document.getElementById('loginPage');
    if(!loginPage || document.getElementById('guestHelpLoginBtn')) return;
    const card=loginPage.querySelector('.auth-card');
    if(!card) return;
    const btn=document.createElement('button');
    btn.id='guestHelpLoginBtn';
    btn.type='button';
    btn.onclick=openGuestHelpCenter;
    btn.className='w-full mt-3 py-2.5 rounded-xl bg-slate-900 border border-cyan-400/40 text-cyan-300 font-tech text-xs font-bold hover:bg-cyan-950 transition-all';
    btn.innerHTML='<i class="fa-solid fa-circle-question mr-1"></i> Help Center';
    const createText=card.querySelector('p.text-center');
    if(createText) createText.insertAdjacentElement('afterend',btn);
    else card.appendChild(btn);
  }

  function openGuestHelpCenter(){
    guestHelpMarkup();
    const modal=document.getElementById('guestHelpCenterModal');
    modal.classList.remove('hidden'); modal.classList.add('flex');
    const session=ensureGuestSession();
    if(session) openExistingGuestConversation(session.id);
  }

  window.openGuestHelpCenter=openGuestHelpCenter;
  window.closeGuestHelpCenter=function(){
    const m=document.getElementById('guestHelpCenterModal');
    if(m){m.classList.add('hidden');m.classList.remove('flex');}
  };

  function submitGuestHelp(e){
    e.preventDefault();
    const name=document.getElementById('guestHelpName').value.trim();
    const email=document.getElementById('guestHelpEmail').value.trim();
    const message=document.getElementById('guestHelpMessage').value.trim();
    if(!name || !email || !message) return;

    const conversation={
      id:createId(), name, email,
      status:'New', createdAt:now(), updatedAt:now(),
      messages:[{sender:'guest',text:message,timestamp:now(),status:'Sent'}]
    };
    const list=getConversations(); list.push(conversation); saveConversations(list);
    setGuestSession({id:conversation.id,email:conversation.email});
    document.getElementById('guestHelpForm').reset();
    openExistingGuestConversation(conversation.id);
    renderAdminHelpConversations();
  }

  function openExistingGuestConversation(id){
    const c=getConversations().find(x=>x.id===id);
    if(!c) return;
    document.getElementById('guestHelpStartView').classList.add('hidden');
    document.getElementById('guestHelpConversationView').classList.remove('hidden');
    document.getElementById('guestHelpConversationId').innerText=c.id;
    document.getElementById('guestHelpConversationStatus').innerText=c.status;
    renderGuestMessages(c);
  }

  function renderGuestMessages(c){
    const box=document.getElementById('guestHelpMessages'); if(!box) return;
    box.innerHTML='';
    (c.messages||[]).forEach(m=>{
      const mine=m.sender==='guest';
      box.innerHTML+=`<div class="flex flex-col ${mine?'items-end':'items-start'}">
        <div class="help-msg ${mine?'help-user':'help-admin'}">${esc(m.text)}</div>
        <div class="help-meta">${esc(m.timestamp)} · ${esc(m.status||'Sent')}</div>
      </div>`;
    });
    box.scrollTop=box.scrollHeight;
  }

  window.sendGuestHelpReply=function(){
    const input=document.getElementById('guestHelpReplyInput');
    const txt=input.value.trim(); if(!txt) return;
    const session=ensureGuestSession(); if(!session) return;
    const list=getConversations(), c=list.find(x=>x.id===session.id); if(!c) return;
    c.messages.push({sender:'guest',text:txt,timestamp:now(),status:'Sent'});
    if(c.status==='Closed') c.status='Open';
    c.updatedAt=now(); saveConversations(list);
    input.value=''; renderGuestMessages(c);
    const success=document.getElementById('guestHelpSuccess');
    if(success){success.classList.remove('hidden'); setTimeout(()=>success.classList.add('hidden'),3500);}
    renderAdminHelpConversations();
  };

  window.backToGuestHelpStart=function(){
    const session=ensureGuestSession();
    if(session && getConversations().some(x=>x.id===session.id)){
      document.getElementById('guestHelpStartView').classList.remove('hidden');
      document.getElementById('guestHelpConversationView').classList.add('hidden');
    } else closeGuestHelpCenter();
  };

  /* ADMIN HELP CENTER */
  function injectAdminHelpTab(){
    const adminApp=document.getElementById('adminApp'); if(!adminApp) return;
    const tabBar=adminApp.querySelector('.flex.flex-wrap.gap-2.border-b');
    if(tabBar && !document.getElementById('adminHelpCenterTabBtn')){
      const b=document.createElement('button');
      b.id='adminHelpCenterTabBtn';
      b.type='button';
      b.className='px-3 py-2 bg-slate-900 text-slate-300 rounded-xl border border-cyan-500/20 hover:text-cyan-300';
      b.textContent='Help Center';
      b.onclick=()=>switchAdminTab('helpcenter');
      tabBar.appendChild(b);
    }
    const anchor=document.getElementById('adminTabLogs');
    if(anchor && !document.getElementById('adminTabHelpCenter')){
      const sec=document.createElement('div');
      sec.id='adminTabHelpCenter';
      sec.className='admin-tab-content hidden space-y-4';
      sec.innerHTML=`
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-tech text-white font-bold">Help Center</h2>
            <p class="text-xs text-slate-400">Guest and patient support conversations</p>
          </div>
          <button onclick="renderAdminHelpConversations()" class="px-3 py-2 bg-slate-900 text-cyan-300 rounded-xl border border-cyan-500/20 text-xs font-tech">Refresh</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="glass-card p-3 rounded-2xl">
            <div class="grid grid-cols-2 gap-2 mb-3 text-center text-[10px] font-tech">
              <div class="p-2 rounded-xl bg-slate-900"><b id="hcNewCount">0</b><br>New</div>
              <div class="p-2 rounded-xl bg-slate-900"><b id="hcOpenCount">0</b><br>Open</div>
              <div class="p-2 rounded-xl bg-slate-900"><b id="hcRepliedCount">0</b><br>Replied</div>
              <div class="p-2 rounded-xl bg-slate-900"><b id="hcClosedCount">0</b><br>Closed</div>
            </div>
            <div id="adminHelpConversationList" class="space-y-2 max-h-[520px] overflow-y-auto"></div>
          </div>
          <div class="glass-card p-4 rounded-2xl md:col-span-2 min-h-[520px] flex flex-col">
            <div id="adminHelpSelectedHeader" class="pb-3 border-b border-cyan-500/20 text-xs text-slate-400">Select a conversation</div>
            <div id="adminHelpMessages" class="flex-1 overflow-y-auto my-3 space-y-2"></div>
            <div id="adminHelpReplyArea" class="hidden">
              <div class="chat-input p-2 rounded-xl flex items-center gap-2">
                <input id="adminHelpReplyInput" type="text" placeholder="Reply to guest..." class="w-full text-xs outline-none bg-transparent">
                <button onclick="sendAdminHelpReply()" class="px-3 py-1.5 bg-rose-500 text-slate-950 font-bold rounded-lg text-xs font-tech"><i class="fa-solid fa-paper-plane"></i></button>
              </div>
              <div class="flex gap-2 mt-2">
                <select id="adminHelpStatus" class="input-box flex-1 p-2 rounded-xl text-xs">
                  <option>New</option><option>Open</option><option>Replied</option><option>Closed</option>
                </select>
                <button onclick="updateAdminHelpStatus()" class="px-3 py-2 bg-slate-900 border border-cyan-400/30 text-cyan-300 rounded-xl text-xs font-tech">Update Status</button>
              </div>
            </div>
          </div>
        </div>`;
      anchor.parentNode.insertBefore(sec,anchor);
    }
  }

  let selectedAdminHelpId=null;

  window.renderAdminHelpConversations=function(){
    injectAdminHelpTab();
    const list=getConversations();
    const counts={New:0,Open:0,Replied:0,Closed:0};
    list.forEach(c=>counts[c.status]=(counts[c.status]||0)+1);
    ['New','Open','Replied','Closed'].forEach(s=>{
      const el=document.getElementById('hc'+s+'Count'); if(el) el.innerText=counts[s]||0;
    });
    const box=document.getElementById('adminHelpConversationList'); if(!box) return;
    box.innerHTML='';
    list.slice().sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).forEach(c=>{
      const latest=c.messages?.[c.messages.length-1];
      box.innerHTML+=`
        <button type="button" class="help-conversation-item w-full text-left p-3 rounded-xl bg-slate-900 border border-cyan-500/10 hover:border-cyan-400/30"
          onclick="openAdminHelpConversation('${c.id}')">
          <div class="flex justify-between gap-2"><strong class="text-xs text-white">${esc(c.name)}</strong><span class="help-status text-cyan-300">${esc(c.status)}</span></div>
          <div class="text-[10px] text-slate-400">${esc(c.email)}</div>
          <div class="text-[10px] text-slate-300 mt-1 truncate">${esc(latest?.text||'')}</div>
          <div class="text-[9px] text-slate-500 mt-1">${esc(c.updatedAt)} · ${esc(c.id)}</div>
        </button>`;
    });
    if(selectedAdminHelpId) openAdminHelpConversation(selectedAdminHelpId);
  };

  window.openAdminHelpConversation=function(id){
    selectedAdminHelpId=id;
    const c=getConversations().find(x=>x.id===id); if(!c) return;
    const h=document.getElementById('adminHelpSelectedHeader');
    if(h) h.innerHTML=`<div class="flex items-center justify-between gap-2">
      <div><strong class="text-white">${esc(c.name)}</strong><div class="text-[10px]">${esc(c.email)} · ${esc(c.id)}</div></div>
      <span class="help-status text-cyan-300">${esc(c.status)}</span></div>`;
    const box=document.getElementById('adminHelpMessages'); if(box){
      box.innerHTML='';
      c.messages.forEach(m=>{
        const admin=m.sender==='admin';
        box.innerHTML+=`<div class="flex flex-col ${admin?'items-end':'items-start'}">
          <div class="help-msg ${admin?'help-user':'help-admin'}">${esc(m.text)}</div>
          <div class="help-meta">${esc(m.timestamp)} · ${admin?'Admin reply':'User message'} · ${esc(m.status||'Sent')}</div>
        </div>`;
      });
      box.scrollTop=box.scrollHeight;
    }
    const reply=document.getElementById('adminHelpReplyArea'); if(reply) reply.classList.remove('hidden');
    const st=document.getElementById('adminHelpStatus'); if(st) st.value=c.status;
  };

  window.sendAdminHelpReply=function(){
    if(!currentSession || currentSession.role!=='admin'){alert('Admin access only.');return;}
    const input=document.getElementById('adminHelpReplyInput');
    const txt=input.value.trim(); if(!txt || !selectedAdminHelpId) return;
    const list=getConversations(), c=list.find(x=>x.id===selectedAdminHelpId); if(!c) return;
    c.messages.push({sender:'admin',text:txt,timestamp:now(),status:'Replied'});
    c.status='Replied'; c.updatedAt=now(); saveConversations(list);
    input.value=''; renderAdminHelpConversations();
  };

  window.updateAdminHelpStatus=function(){
    if(!currentSession || currentSession.role!=='admin'){alert('Admin access only.');return;}
    if(!selectedAdminHelpId) return;
    const status=document.getElementById('adminHelpStatus').value;
    const list=getConversations(), c=list.find(x=>x.id===selectedAdminHelpId); if(!c) return;
    c.status=status; c.updatedAt=now(); saveConversations(list);
    renderAdminHelpConversations();
  };

  const oldSwitch=window.switchAdminTab;
  window.switchAdminTab=function(tabName){
    if(typeof oldSwitch==='function') oldSwitch(tabName);
    if(tabName==='helpcenter'){
      document.querySelectorAll('#adminApp .admin-tab-content').forEach(el=>el.classList.add('hidden'));
      const sec=document.getElementById('adminTabHelpCenter');
      if(sec){sec.classList.remove('hidden');renderAdminHelpConversations();}
    }
  };

  function boot(){
    guestHelpMarkup();
    addLoginButton();
    injectAdminHelpTab();
    renderAdminHelpConversations();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
  setInterval(()=>{ if(document.getElementById('adminTabHelpCenter') && !document.getElementById('adminTabHelpCenter').classList.contains('hidden')) renderAdminHelpConversations(); },5000);
})();

/* ===== ORIGINAL INLINE JAVASCRIPT BLOCK 10 ===== */
/* ============================================================
   ADD-ONLY FEATURE: SCANNED PATIENT LABORATORY PHOTO VIEWER
   Existing UI, HTML structure, scanner, and functions are preserved.
   This only adds a photo-viewing action after a QR scan.
   ============================================================ */
(function () {
  function epLabPhotoEsc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function closeScannedLabPhotoViewer() {
    var modal = document.getElementById("scannedLabPhotoViewer");
    if (modal) modal.remove();
  }

  window.viewScannedPatientLabPhotos = function () {
    var patientId = window.__erecpassScannedPatientId;
    if (!patientId) {
      alert("No scanned patient selected.");
      return;
    }

    var patients = JSON.parse(localStorage.getItem(DB_KEYS.PATIENTS)) || [];
    var patient = patients.find(function (item) {
      return String(item.id) === String(patientId);
    });

    if (!patient) {
      alert("Patient record not found.");
      return;
    }

    var labs = Array.isArray(patient.labResults) ? patient.labResults : [];
    var photoLabs = labs.filter(function (lab) {
      return lab && lab.photo;
    });

    closeScannedLabPhotoViewer();

    var modal = document.createElement("div");
    modal.id = "scannedLabPhotoViewer";
    modal.style.cssText =
      "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.82);" +
      "display:flex;align-items:center;justify-content:center;padding:16px;";

    var card = document.createElement("div");
    card.style.cssText =
      "width:min(760px,100%);max-height:92vh;overflow:auto;background:#fff;" +
      "border:1px solid #38bdf8;border-radius:18px;padding:16px;" +
      "box-shadow:0 20px 60px rgba(0,0,0,.35);color:#0f172a;";

    var header = document.createElement("div");
    header.style.cssText =
      "display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;";

    var title = document.createElement("div");
    title.innerHTML =
      '<div style="font-weight:800;font-size:18px;color:#0369a1;">Laboratory Results</div>' +
      '<div style="font-size:12px;color:#64748b;margin-top:3px;">' +
      epLabPhotoEsc(patient.fullName || "Patient") +
      "</div>";

    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.textContent = "Close";
    closeBtn.style.cssText =
      "border:1px solid #93c5fd;background:#eff6ff;color:#0369a1;" +
      "border-radius:10px;padding:8px 12px;font-weight:700;cursor:pointer;";
    closeBtn.onclick = closeScannedLabPhotoViewer;

    header.appendChild(title);
    header.appendChild(closeBtn);
    card.appendChild(header);

    if (!photoLabs.length) {
      var empty = document.createElement("div");
      empty.style.cssText =
        "padding:24px;text-align:center;border:1px dashed #bfdbfe;" +
        "border-radius:14px;color:#64748b;";
      empty.textContent = "No laboratory result photos are available for this patient.";
      card.appendChild(empty);
    } else {
      photoLabs.forEach(function (lab, index) {
        var item = document.createElement("div");
        item.style.cssText =
          "margin-bottom:14px;padding:12px;border:1px solid #dbeafe;" +
          "border-radius:14px;background:#f8fbff;";

        var meta = document.createElement("div");
        meta.style.cssText =
          "font-size:12px;font-weight:700;color:#0369a1;margin-bottom:8px;";
        meta.textContent =
          (lab.type || "Laboratory Result") +
          (lab.date ? " • " + lab.date : "");

        var img = document.createElement("img");
        img.src = lab.photo;
        img.alt = "Laboratory result " + (index + 1);
        img.style.cssText =
          "display:block;width:100%;max-height:520px;object-fit:contain;" +
          "border-radius:10px;background:#eef6ff;cursor:zoom-in;";
        img.onclick = function () {
          var full = document.createElement("div");
          full.style.cssText =
            "position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.94);" +
            "display:flex;align-items:center;justify-content:center;padding:12px;cursor:zoom-out;";
          var fullImg = document.createElement("img");
          fullImg.src = lab.photo;
          fullImg.alt = "Laboratory result";
          fullImg.style.cssText =
            "max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;";
          full.onclick = function () { full.remove(); };
          full.appendChild(fullImg);
          document.body.appendChild(full);
        };

        item.appendChild(meta);
        item.appendChild(img);
        card.appendChild(item);
      });
    }

    modal.appendChild(card);
    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeScannedLabPhotoViewer();
    });

    document.body.appendChild(modal);
  };

  function addLabPhotoButtonToScannedCard() {
    var card = document.getElementById("scannedPatientCard");
    if (!card) return;

    var existing = document.getElementById("scannedLabPhotoButton");
    if (existing) existing.remove();

    var button = document.createElement("button");
    button.id = "scannedLabPhotoButton";
    button.type = "button";
    button.textContent = "View Laboratory Photos";
    button.className =
      "px-4 py-2 rounded-xl text-xs font-tech font-bold " +
      "bg-sky-600 text-white border border-sky-400/50 mt-2";
    button.onclick = window.viewScannedPatientLabPhotos;

    var labSection = document.getElementById("scannedLabResults");
    var parent = labSection ? labSection.parentElement : card;
    if (parent) parent.appendChild(button);
  }

  /* Wrap the existing scan handler without replacing its behavior. */
  var originalHandleScannedQrText = window.handleScannedQrText;

  if (typeof originalHandleScannedQrText === "function") {
    window.handleScannedQrText = function (text) {
      originalHandleScannedQrText.apply(this, arguments);

      var patientId = String(text || "").replace("ERECPASS:", "").trim();
      var patients = JSON.parse(localStorage.getItem(DB_KEYS.PATIENTS)) || [];
      var patient = patients.find(function (item) {
        return item.id === patientId || item.id === text;
      });

      if (patient) {
        window.__erecpassScannedPatientId = patient.id;
        addLabPhotoButtonToScannedCard();
      }
    };
  }

  /* Also expose a safe refresh hook for any existing code that updates the card. */
  window.refreshScannedLabPhotoButton = addLabPhotoButtonToScannedCard;
})();

/* ===== ORIGINAL INLINE JAVASCRIPT BLOCK 11 ===== */
/* ============================================================
   ADD-ONLY CAMERA PERMISSION FIX
   Keeps the existing scanner UI/buttons unchanged.
   Requests camera permission before starting the existing QR scanner.
   ============================================================ */
(function () {
  function requestErecPassCameraPermission() {
    return new Promise(function (resolve, reject) {
      if (!window.isSecureContext) {
        reject(new Error(
          "Camera access requires HTTPS (or a secure localhost/Capacitor app)."
        ));
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        reject(new Error("Camera access is not supported by this browser."));
        return;
      }

      navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" }
        },
        audio: false
      }).then(function (stream) {
        // Permission has been granted. Release the temporary stream;
        // Html5Qrcode will open the camera for the actual scan.
        stream.getTracks().forEach(function (track) {
          try { track.stop(); } catch (e) {}
        });
        resolve();
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  var originalStartStaffQrScanner = window.startStaffQrScanner;

  if (typeof originalStartStaffQrScanner === "function") {
    window.startStaffQrScanner = function () {
      var button = document.querySelector('[onclick="startStaffQrScanner()"]');
      if (button) {
        button.disabled = true;
        button.setAttribute("aria-busy", "true");
      }

      requestErecPassCameraPermission()
        .then(function () {
          originalStartStaffQrScanner.apply(this, arguments);
        })
        .catch(function (err) {
          var message = "Camera access was not allowed.";

          if (err && err.name === "NotAllowedError") {
            message =
              "Camera permission was denied. Please allow Camera permission " +
              "for this site/app in your browser or phone Settings, then tap Start Camera again.";
          } else if (err && err.name === "NotFoundError") {
            message = "No camera was found on this device.";
          } else if (err && err.name === "NotReadableError") {
            message =
              "The camera is currently being used by another app. Close it and try again.";
          } else if (err && err.message) {
            message = err.message;
          }

          alert(message);
        })
        .finally(function () {
          if (button) {
            button.disabled = false;
            button.removeAttribute("aria-busy");
          }
        });
    };
  }

  // Expose a helper for environments that need the permission prompt
  // before the scanner is used.
  window.requestErecPassCameraPermission = requestErecPassCameraPermission;
})();

/* ===== ORIGINAL INLINE JAVASCRIPT BLOCK 12 ===== */
/* ADDITION: Image viewer / pinch zoom / larger login controls */
(function() {
  let viewer, viewerImage, scale = 1, startScale = 1, startDistance = 0;

  function applyScale() {
    if (viewerImage) viewerImage.style.transform = 'scale(' + scale + ')';
  }

  window.openErecpassImageViewer = function(src, alt) {
    viewer = document.getElementById('erecpassImageViewer');
    viewerImage = document.getElementById('erecpassViewerImage');
    if (!viewer || !viewerImage || !src) return;
    viewerImage.src = src;
    viewerImage.alt = alt || 'Enlarged image';
    scale = 1;
    applyScale();
    viewer.classList.add('active');
    viewer.setAttribute('aria-hidden', 'false');
  };

  window.closeErecpassImageViewer = function() {
    if (!viewer) viewer = document.getElementById('erecpassImageViewer');
    if (viewer) {
      viewer.classList.remove('active');
      viewer.setAttribute('aria-hidden', 'true');
    }
    if (viewerImage) {
      viewerImage.src = '';
      viewerImage.style.transform = 'scale(1)';
    }
    scale = 1;
  };

  window.erecpassZoomIn = function() {
    scale = Math.min(5, scale + 0.25);
    applyScale();
  };
  window.erecpassZoomOut = function() {
    scale = Math.max(1, scale - 0.25);
    applyScale();
  };
  window.erecpassZoomReset = function() {
    scale = 1;
    applyScale();
  };

  function distance(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  document.addEventListener('click', function(e) {
    const img = e.target.closest('.photo-viewable, .logo-icon img, .brand > div:first-child img');
    if (!img) return;
    if (e.target.closest('#erecpassImageViewer')) return;
    openErecpassImageViewer(img.currentSrc || img.src, img.alt || 'Enlarged image');
  });

  document.addEventListener('wheel', function(e) {
    if (!viewer || !viewer.classList.contains('active')) return;
    e.preventDefault();
    scale += e.deltaY < 0 ? 0.15 : -0.15;
    scale = Math.max(1, Math.min(5, scale));
    applyScale();
  }, { passive: false });

  document.addEventListener('touchstart', function(e) {
    if (!viewerImage || e.target !== viewerImage || e.touches.length !== 2) return;
    startDistance = distance(e.touches[0], e.touches[1]);
    startScale = scale;
  }, { passive: true });

  document.addEventListener('touchmove', function(e) {
    if (!viewerImage || e.target !== viewerImage || e.touches.length !== 2 || !startDistance) return;
    e.preventDefault();
    const newDistance = distance(e.touches[0], e.touches[1]);
    scale = Math.max(1, Math.min(5, startScale * (newDistance / startDistance)));
    applyScale();
  }, { passive: false });

  document.addEventListener('touchend', function(e) {
    if (e.touches.length < 2) startDistance = 0;
  }, { passive: true });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeErecpassImageViewer();
  });

  // Make the existing Agreement photo tappable.
  function markAgreementPhoto() {
    const img = document.getElementById('agreementPhotoDisplayImg');
    if (img) {
      img.classList.add('photo-viewable');
      img.setAttribute('title', 'Tap to view and pinch to zoom');
    }
  }

  // Make dynamically-rendered Lab photos tappable.
  const oldRenderPatientLabResults = window.renderPatientLabResults;
  if (typeof oldRenderPatientLabResults === 'function') {
    window.renderPatientLabResults = function() {
      oldRenderPatientLabResults.apply(this, arguments);
      document.querySelectorAll('#patientLabResultsList img').forEach(function(img) {
        img.classList.add('photo-viewable');
        img.setAttribute('title', 'Tap to view and pinch to zoom');
      });
    };
  }

  // Catch lab images even when another function replaces the list.
  const observer = new MutationObserver(function() {
    markAgreementPhoto();
    document.querySelectorAll('#patientLabResultsList img').forEach(function(img) {
      img.classList.add('photo-viewable');
      img.setAttribute('title', 'Tap to view and pinch to zoom');
    });
  });
  document.addEventListener('DOMContentLoaded', function() {
    markAgreementPhoto();
    observer.observe(document.body, { childList: true, subtree: true });

    // Larger Login Area: only adds a class; existing layout/design remains intact.
    ['loginPage','staffLoginPage','adminLoginPage'].forEach(function(id) {
      const page = document.getElementById(id);
      if (page) page.classList.add('login-area-large');
    });
  });
})();

/* ===== ORIGINAL INLINE JAVASCRIPT BLOCK 13 ===== */
(function () {
  let erecpassPendingLabDelete = null;

  function getPatientForLabActions(patientId) {
    const patients = JSON.parse(localStorage.getItem(DB_KEYS.PATIENTS)) || [];
    return patients.find(p => p.id === patientId);
  }

  function renderErecpassLabActions() {
    const modal = document.getElementById('adminEditPatientModal');
    if (!modal) return;

    let panel = document.getElementById('erecpassLabActionsPanel');

    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'erecpassLabActionsPanel';
      panel.className = 'erecpass-lab-actions space-y-2';

      const card = modal.querySelector('.glass-card');
      const footer = modal.querySelector('.flex.gap-2');

      if (card) {
        if (footer) card.insertBefore(panel, footer);
        else card.appendChild(panel);
      } else {
        modal.appendChild(panel);
      }
    }

    const patientId = document.getElementById('editPatientId')?.value;
    const patient = patientId ? getPatientForLabActions(patientId) : null;
    const labs = patient?.labResults || [];

    panel.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <div>
          <label class="block text-xs text-cyan-300 font-tech font-bold uppercase">Actions</label>
          <p class="text-[10px] text-slate-500 mt-0.5">Manage this patient's lab results.</p>
        </div>
        <button type="button"
          onclick="addErecpassLabResult()"
          class="erecpass-lab-action-btn bg-cyan-950 border border-cyan-400/40 text-cyan-300">
          + Add Lab Result
        </button>
      </div>

      <div class="space-y-2 mt-2">
        ${labs.length ? labs.map((lab, index) => `
          <div class="glass-card p-2.5 rounded-xl border border-slate-700/70 flex items-center justify-between gap-2">
            <div class="min-w-0">
              <strong class="text-white text-xs block truncate">
                ${lab.type || 'Laboratory Result'}
              </strong>
              <p class="text-[10px] text-slate-400 truncate">
                ${lab.date || ''} · ${lab.result || 'Result Attachment'}
              </p>
            </div>
            <button type="button"
              onclick="deleteErecpassLabResult(${index})"
              class="erecpass-lab-action-btn bg-rose-950 text-rose-300 border border-rose-500/40 shrink-0">
              Delete Result
            </button>
          </div>
        `).join('') : `
          <p class="text-[10px] text-slate-500">No lab results to delete.</p>
        `}
      </div>
    `;
  }

  window.addErecpassLabResult = function () {
    const textField = document.getElementById('editPatientLabText');

    if (textField) {
      textField.focus();
      textField.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }

    const saveButton = document.querySelector(
      '#adminEditPatientModal button[onclick="saveAdminPatientEdit()"]'
    );

    if (saveButton) {
      saveButton.innerText = 'Add Result';
      setTimeout(function () {
        if (saveButton) saveButton.innerText = 'Save Changes';
      }, 1800);
    }
  };

  window.deleteErecpassLabResult = function (index) {
    const patientId = document.getElementById('editPatientId')?.value;
    if (!patientId) return;

    erecpassPendingLabDelete = {
      patientId: patientId,
      index: index
    };

    const modal = document.getElementById('erecpassLabConfirmModal');

    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }
  };

  window.closeErecpassLabDeleteConfirm = function () {
    erecpassPendingLabDelete = null;

    const modal = document.getElementById('erecpassLabConfirmModal');

    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  };

  window.confirmErecpassLabDelete = function () {
    if (!erecpassPendingLabDelete) return;

    const patientId = erecpassPendingLabDelete.patientId;
    const index = erecpassPendingLabDelete.index;

    const patients = JSON.parse(localStorage.getItem(DB_KEYS.PATIENTS)) || [];
    const patient = patients.find(p => p.id === patientId);

    if (!patient || !Array.isArray(patient.labResults) || !patient.labResults[index]) {
      window.closeErecpassLabDeleteConfirm();
      return;
    }

    patient.labResults.splice(index, 1);

    localStorage.setItem(
      DB_KEYS.PATIENTS,
      JSON.stringify(patients)
    );

    if (typeof addLog === 'function') {
      addLog('Deleted Lab Result: ' + patient.fullName);
    }

    window.closeErecpassLabDeleteConfirm();
    renderErecpassLabActions();

    if (typeof refreshAdminPortal === 'function') {
      refreshAdminPortal();
    }

    if (
      typeof currentSession !== 'undefined' &&
      currentSession?.data?.id === patientId
    ) {
      currentSession.data = patient;

      if (typeof renderPatientLabResults === 'function') {
        renderPatientLabResults();
      }
    }
  };

  function attachLabActions() {
    const originalOpenAdminEditPatientModal =
      window.openAdminEditPatientModal;

    if (
      typeof originalOpenAdminEditPatientModal === 'function' &&
      !originalOpenAdminEditPatientModal.__erecpassLabActionsWrapped
    ) {
      const wrappedOpen = function (patientId) {
        originalOpenAdminEditPatientModal(patientId);
        setTimeout(renderErecpassLabActions, 0);
      };

      wrappedOpen.__erecpassLabActionsWrapped = true;
      window.openAdminEditPatientModal = wrappedOpen;
    }

    const modal = document.getElementById('adminEditPatientModal');

    if (modal && !modal.dataset.erecpassLabActionsObserver) {
      modal.dataset.erecpassLabActionsObserver = '1';

      const observer = new MutationObserver(function () {
        if (!modal.classList.contains('hidden')) {
          renderErecpassLabActions();
        }
      });

      observer.observe(modal, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(attachLabActions, 100);
    });
  } else {
    setTimeout(attachLabActions, 100);
  }
})();

/* ===== ORIGINAL INLINE JAVASCRIPT BLOCK 14 ===== */
(function addPatientCancelBookingOnly() {
  let selectedAppointmentId = null;
  function ensureCancelModal() {
    if (document.getElementById('erecpassCancelAppointmentModal')) return;
    const modal = document.createElement('div');
    modal.id = 'erecpassCancelAppointmentModal';
    modal.innerHTML = `
      <div class="erecpass-cancel-modal-card">
        <h2>Cancel this appointment?</h2>
        <p>You can’t undo this action.</p>
        <div class="erecpass-cancel-modal-actions">
          <button type="button" class="erecpass-keep-booking" id="erecpassKeepBookingBtn">Keep Booking</button>
          <button type="button" class="erecpass-confirm-cancel" id="erecpassConfirmCancelBtn">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('erecpassKeepBookingBtn').onclick = function() {
      selectedAppointmentId = null;
      modal.classList.remove('active');
    };
    document.getElementById('erecpassConfirmCancelBtn').onclick = function() {
      cancelSelectedAppointment();
    };
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        selectedAppointmentId = null;
        modal.classList.remove('active');
      }
    });
  }
  function openCancelConfirmation(appointmentId) {
    ensureCancelModal();
    selectedAppointmentId = appointmentId;
    document.getElementById('erecpassCancelAppointmentModal').classList.add('active');
  }
  function cancelSelectedAppointment() {
    if (selectedAppointmentId === null || typeof DB_KEYS === 'undefined') return;
    const appts = JSON.parse(localStorage.getItem(DB_KEYS.APPOINTMENTS)) || [];
    const index = appts.findIndex(a => String(a.id) === String(selectedAppointmentId));
    if (index === -1) {
      selectedAppointmentId = null;
      document.getElementById('erecpassCancelAppointmentModal').classList.remove('active');
      return;
    }
    appts[index].status = 'Cancelled by Patient';
    appts[index].cancelledAt = new Date().toISOString();
    appts[index].cancelledBy = 'Patient';
    localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify(appts));
    selectedAppointmentId = null;
    document.getElementById('erecpassCancelAppointmentModal').classList.remove('active');
    if (typeof syncAllLocalAppointments === 'function') {
      try { syncAllLocalAppointments(); } catch (e) { console.warn(e); }
    }
    if (typeof refreshPatientPortal === 'function') {
      refreshPatientPortal();
    } else if (typeof renderPatientAppointments === 'function') {
      renderPatientAppointments();
    }
  }
  function addCancelButtons() {
    const container = document.getElementById('patientAppointmentList');
    if (!container || typeof DB_KEYS === 'undefined') return;
    const appts = JSON.parse(localStorage.getItem(DB_KEYS.APPOINTMENTS)) || [];
    const myIds = new Set(
      appts
        .filter(a => typeof currentSession !== 'undefined' &&
                     currentSession &&
                     currentSession.data &&
                     a.patientId === currentSession.data.id)
        .map(a => String(a.id))
    );
    const cards = container.querySelectorAll('.list-card');
    cards.forEach((card, index) => {
      if (card.querySelector('.erecpass-cancel-booking-btn')) return;
      const appointment = appts.filter(a => myIds.has(String(a.id)))[index];
      if (!appointment) return;
      const status = String(appointment.status || '').toLowerCase();
      if (status === 'cancelled by patient' || status === 'cancelled') return;
      const action = document.createElement('button');
      action.type = 'button';
      action.className = 'erecpass-cancel-booking-btn';
      action.innerHTML = '<i class="fa-solid fa-xmark"></i> Cancel Booking';
      action.onclick = function() {
        openCancelConfirmation(appointment.id);
      };
      const rightSide = card.lastElementChild;
      if (rightSide) {
        rightSide.style.display = 'flex';
        rightSide.style.flexDirection = 'column';
        rightSide.style.alignItems = 'flex-end';
        rightSide.appendChild(action);
      } else {
        card.appendChild(action);
      }
    });
  }
  function install() {
    ensureCancelModal();
    if (typeof window.renderPatientAppointments === 'function' &&
        !window.renderPatientAppointments.__erecpassCancelWrapped) {
      const originalRender = window.renderPatientAppointments;
      function wrappedRenderPatientAppointments() {
        originalRender.apply(this, arguments);
        setTimeout(addCancelButtons, 0);
      }
      wrappedRenderPatientAppointments.__erecpassCancelWrapped = true;
      window.renderPatientAppointments = wrappedRenderPatientAppointments;
    }
    setTimeout(addCancelButtons, 0);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
  setTimeout(install, 1000);
  setTimeout(install, 2500);
})();

/* ===== ORIGINAL INLINE JAVASCRIPT BLOCK 15 ===== */
(function addAdminDeleteAppointmentOnly() {
  let selectedDeleteAppointmentId = null;

  function ensureDeleteModal() {
    if (document.getElementById('erecpassDeleteAppointmentModal')) return;

    const modal = document.createElement('div');
    modal.id = 'erecpassDeleteAppointmentModal';
    modal.innerHTML = `
      <div class="erecpass-delete-modal-card">
        <h2>Delete Appointment?</h2>
        <p>This will permanently remove the patient’s booking.</p>
        <div class="erecpass-delete-modal-actions">
          <button type="button" class="erecpass-delete-keep" id="erecpassDeleteCancelBtn">Cancel</button>
          <button type="button" class="erecpass-delete-confirm" id="erecpassDeleteConfirmBtn">Delete</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('erecpassDeleteCancelBtn').onclick = function() {
      selectedDeleteAppointmentId = null;
      modal.classList.remove('active');
    };

    document.getElementById('erecpassDeleteConfirmBtn').onclick = function() {
      deleteSelectedAppointment();
    };

    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        selectedDeleteAppointmentId = null;
        modal.classList.remove('active');
      }
    });
  }

  function openDeleteConfirmation(appointmentId) {
    ensureDeleteModal();
    selectedDeleteAppointmentId = appointmentId;
    document.getElementById('erecpassDeleteAppointmentModal').classList.add('active');
  }

  function deleteSelectedAppointment() {
    if (selectedDeleteAppointmentId === null || typeof DB_KEYS === 'undefined') return;

    const appts = JSON.parse(localStorage.getItem(DB_KEYS.APPOINTMENTS)) || [];
    const index = appts.findIndex(function(a) {
      return String(a.id) === String(selectedDeleteAppointmentId);
    });

    if (index === -1) {
      selectedDeleteAppointmentId = null;
      document.getElementById('erecpassDeleteAppointmentModal').classList.remove('active');
      if (typeof window.renderAdminAppointmentsList === 'function') {
        window.renderAdminAppointmentsList();
      }
      return;
    }

    const deletedAppointment = appts[index];

    // Permanently remove the appointment from the local appointment database.
    appts.splice(index, 1);
    localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify(appts));

    if (typeof addLog === 'function') {
      addLog('Admin deleted appointment for ' + (deletedAppointment.patientName || 'patient') + '.');
    }

    selectedDeleteAppointmentId = null;
    document.getElementById('erecpassDeleteAppointmentModal').classList.remove('active');

    if (typeof syncAllLocalAppointments === 'function') {
      try { syncAllLocalAppointments(); } catch (e) { console.warn(e); }
    }

    if (typeof window.renderAdminAppointmentsList === 'function') {
      window.renderAdminAppointmentsList();
    }
  }

  function addDeleteButtonsToAdminAppointments() {
    const container = document.getElementById('adminAppointmentsList');
    if (!container || typeof DB_KEYS === 'undefined') return;

    container.querySelectorAll('.erecpass-delete-appointment-btn').forEach(function(btn) {
      btn.remove();
    });

    const appts = JSON.parse(localStorage.getItem(DB_KEYS.APPOINTMENTS)) || [];

    container.querySelectorAll('.glass-card').forEach(function(card) {
      const buttons = card.querySelectorAll('button[onclick*="updateApptStatus"]');
      if (!buttons.length) return;

      const match = card.textContent.match(/Doctor:\s*[^·]+·\s*Date:\s*([^\n]+)/);
      let appointment = null;

      // Match the rendered card to the appointment by its visible patient/date/doctor/reason data.
      for (let i = 0; i < appts.length; i++) {
        const a = appts[i];
        const visible = card.textContent || '';
        if ((visible.indexOf(a.patientName || 'Unknown Patient') !== -1) &&
            (visible.indexOf(a.doctor || 'N/A') !== -1) &&
            (visible.indexOf(a.date || 'N/A') !== -1) &&
            (visible.indexOf(a.reason || 'Consultation') !== -1)) {
          appointment = a;
          break;
        }
      }

      if (!appointment) return;

      const actionArea = buttons[0].parentElement;
      if (!actionArea) return;

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'erecpass-delete-appointment-btn';
      deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Delete';
      deleteBtn.onclick = function() {
        openDeleteConfirmation(appointment.id);
      };

      actionArea.appendChild(deleteBtn);
    });
  }

  function installDeleteAction() {
    ensureDeleteModal();

    if (typeof window.renderAdminAppointmentsList === 'function' &&
        !window.renderAdminAppointmentsList.__erecpassDeleteWrapped) {

      const originalRender = window.renderAdminAppointmentsList;

      function wrappedRenderAdminAppointmentsList() {
        originalRender.apply(this, arguments);
        setTimeout(addDeleteButtonsToAdminAppointments, 0);
      }

      wrappedRenderAdminAppointmentsList.__erecpassDeleteWrapped = true;
      window.renderAdminAppointmentsList = wrappedRenderAdminAppointmentsList;
    }

    setTimeout(addDeleteButtonsToAdminAppointments, 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installDeleteAction);
  } else {
    installDeleteAction();
  }

  setTimeout(installDeleteAction, 1000);
  setTimeout(installDeleteAction, 2500);
})();

/* ===== ORIGINAL INLINE JAVASCRIPT BLOCK 16 ===== */
(function ERecPassAddOnlyFunctions(){
'use strict';

/* ---------- Safe helpers ---------- */
function epGet(key, fallback){
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch(e){ return fallback; }
}
function epSet(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
function epEscape(v){
  return String(v ?? '').replace(/[&<>"']/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
  });
}
function epPatients(){ return (typeof DB_KEYS!=='undefined') ? epGet(DB_KEYS.PATIENTS,[]) : []; }
function epStaff(){ return (typeof DB_KEYS!=='undefined') ? epGet(DB_KEYS.STAFF,[]) : []; }
function epAdmin(){ return (typeof DB_KEYS!=='undefined' && DB_KEYS.ADMIN_ACCOUNTS) ? epGet(DB_KEYS.ADMIN_ACCOUNTS,[]) : []; }
function epModal(id,title,body){
  let m=document.getElementById(id);
  if(!m){
    m=document.createElement('div'); m.id=id; m.className='erecpass-added-modal';
    document.body.appendChild(m);
  }
  m.innerHTML='<div class="erecpass-added-card"><h2>'+title+'</h2>'+body+
    '<div class="erecpass-added-actions"><button type="button" onclick="document.getElementById(\''+id+'\').classList.remove(\'active\')">Close</button></div></div>';
  m.classList.add('active');
  return m;
}

/* ---------- 1. Password Show / Hide ---------- */
function addPasswordEye(inputId){
  const input=document.getElementById(inputId);
  if(!input || input.dataset.erecpassEye==='1') return;
  input.dataset.erecpassEye='1';
  const parent=input.parentElement;
  if(!parent) return;
  const b=document.createElement('button');
  b.type='button'; b.className='erecpass-eye-btn'; b.title='Show password';
  b.innerHTML='<i class="fa-solid fa-eye"></i>';
  b.onclick=function(){
    const show=input.type==='password';
    input.type=show?'text':'password';
    b.title=show?'Hide password':'Show password';
    b.innerHTML=show?'<i class="fa-solid fa-eye-slash"></i>':'<i class="fa-solid fa-eye"></i>';
  };
  parent.appendChild(b);
}
function installPasswordEyes(){
  ['loginPassword','regPassword','regConfirmPassword','staffLoginPassword','adminLoginPassword'].forEach(addPasswordEye);
}

/* ---------- 2. Forgot Password: Send Email -> OTP -> Verify -> Update ---------- */
window.openErecpassForgotPassword=function(){
  epModal('erecpassForgotModal','Forgot Password',
    '<p style="color:#8fb9b5;font-size:11px">Enter the email registered to the patient account.</p>'+
    '<label>Email</label><input id="epResetEmail" type="email" placeholder="patient@example.com">'+
    '<div class="erecpass-added-actions"><button type="button" onclick="sendErecpassPasswordReset()">Send to Email</button></div>'+
    '<div id="epResetStep" style="margin-top:12px"></div>');
};

window.sendErecpassPasswordReset=async function(){
  const email=(document.getElementById('epResetEmail')||{}).value?.trim().toLowerCase();
  if(!email){ alert('Enter your email.'); return; }

  /* Prefer Supabase Auth when configured. */
  let cloudRequested=false;
  try{
    if(window.erecpassSupabase && erecpassSupabase.auth){
      const r=await erecpassSupabase.auth.resetPasswordForEmail(email,{redirectTo:location.href.split('#')[0]});
      if(!r.error) cloudRequested=true;
    }
  }catch(e){ console.warn('Supabase reset request:',e); }

  const p=epPatients().find(x=>(x.email||'').toLowerCase()===email);
  if(!p && !cloudRequested){ alert('No patient account was found for that email.'); return; }

  const otp=String(Math.floor(100000+Math.random()*900000));
  epSet('ERECPASS_PASSWORD_RESET',{
    email:email,otp:otp,verified:false,expires:Date.now()+10*60*1000
  });

  const step=document.getElementById('epResetStep');
  if(step) step.innerHTML=
    '<p style="color:#8fb9b5;font-size:11px">'+
    (cloudRequested?'Supabase password-reset email requested.':'Reset request created.')+
    ' For the OTP step, enter the 6-digit code delivered by your configured email/OTP service.</p>'+
    '<label>OTP</label><input id="epResetOtp" maxlength="6" inputmode="numeric" placeholder="6-digit OTP">'+
    '<label>New Password</label><input id="epResetNewPass" type="password" placeholder="New password">'+
    '<label>Confirm Password</label><input id="epResetNewPass2" type="password" placeholder="Confirm password">'+
    '<div class="erecpass-added-actions"><button type="button" onclick="verifyErecpassPasswordReset()">Verify</button></div>';
};

window.verifyErecpassPasswordReset=function(){
  const r=epGet('ERECPASS_PASSWORD_RESET',null);
  if(!r || Date.now()>Number(r.expires)){ alert('OTP expired. Please send a new reset request.'); return; }
  const otp=document.getElementById('epResetOtp')?.value.trim();
  const p1=document.getElementById('epResetNewPass')?.value||'';
  const p2=document.getElementById('epResetNewPass2')?.value||'';
  if(otp!==r.otp){ alert('Invalid OTP.'); return; }
  if(!p1 || p1!==p2){ alert('Passwords do not match.'); return; }

  const patients=epPatients();
  const p=patients.find(x=>(x.email||'').toLowerCase()===r.email);
  if(!p){ alert('Patient account not found in the local profile database.'); return; }
  p.password=p1; p.active=(p.active===false)?false:true;
  if(typeof DB_KEYS!=='undefined') epSet(DB_KEYS.PATIENTS,patients);
  localStorage.removeItem('ERECPASS_PASSWORD_RESET');
  alert('Password updated successfully. You can now log in.');
};

/* ---------- 3. Login: Supabase first, existing local login remains fallback ---------- */
const originalHandleLogin=window.handleLogin;
window.handleLogin=async function(event){
  if(event) event.preventDefault();
  const email=(document.getElementById('loginEmail')||{}).value?.trim().toLowerCase();
  const password=(document.getElementById('loginPassword')||{}).value||'';
  if(!email || !password){ alert('Please enter email and password.'); return; }

  let supaWorked=false;
  try{
    if(window.erecpassSupabase && erecpassSupabase.auth){
      const r=await erecpassSupabase.auth.signInWithPassword({email,password});
      if(!r.error){
        const user=r.data.user;
        let profile=null;
        try{
          const q=await erecpassSupabase.from('patients').select('*').eq('auth_user_id',user.id).maybeSingle();
          if(!q.error) profile=q.data;
        }catch(e){}
        if(profile){
          supaWorked=true;
          const local=epPatients().find(x=>String(x.id)===String(profile.id))||{};
          currentSession={role:'patient',data:Object.assign({labResults:[],prescriptions:[]},local,{
            id:profile.id||user.id,
            fullName:profile.full_name||local.fullName||user.email,
            email:user.email,
            sim:profile.sim||local.sim||'',
            photo:profile.photo||local.photo||'',
            ageCategory:profile.age_category||local.ageCategory||'Adult',
            guardianNum:profile.guardian_num||local.guardianNum||'',
            status:profile.status||local.status||'Green',
            auth_user_id:user.id
          })};
          if(typeof DB_KEYS!=='undefined') epSet(DB_KEYS.SESSION,currentSession);
          if(typeof hideAuthPages==='function') hideAuthPages();
          if(typeof launchPortalByRole==='function') launchPortalByRole('patient');
          return;
        }
        /* Signed in to Supabase but no linked patient row: use the local account. */
      }
    }
  }catch(e){ console.warn('Supabase login:',e); }

  /* Preserve the original login implementation when Supabase is unavailable
     or the account has not yet been migrated to Supabase Auth. */
  if(typeof originalHandleLogin==='function'){
    try { return originalHandleLogin.call(this,event); } catch(e){ console.error(e); }
  }else{
    alert(supaWorked?'Logged in.':'Login failed. Check your credentials.');
  }
};

/* ---------- 4. QR scan -> patient profile actions ---------- */
window.openErecpassPatientProfile=function(patientId){
  const p=epPatients().find(x=>String(x.id)===String(patientId));
  if(!p){ alert('Patient profile not found.'); return; }

  epModal('erecpassPatientProfileModal','Patient Profile',
    '<p><b>Name:</b> '+epEscape(p.fullName||p.name||'')+'</p>'+
    '<p><b>ID:</b> '+epEscape(p.id)+'</p>'+
    '<p><b>Status:</b> '+epEscape(p.status||'Green')+'</p>'+
    '<p><b>Email:</b> '+epEscape(p.email||'')+'</p>'+
    '<p><b>Guardian:</b> '+epEscape(p.guardianNum||'')+'</p>'+
    '<div class="erecpass-qr-actions">'+
    '<button onclick="openErecpassRecords(\''+epEscape(p.id)+'\')">View Medical Records</button>'+
    '<button onclick="openErecpassLabs(\''+epEscape(p.id)+'\')">View Lab Results</button>'+
    '<button onclick="openErecpassMeds(\''+epEscape(p.id)+'\')">View Medications</button>'+
    '<button onclick="openErecpassAppointments(\''+epEscape(p.id)+'\')">View Appointments</button>'+
    '</div>');
};

function epPatientById(id){ return epPatients().find(x=>String(x.id)===String(id)); }
window.openErecpassRecords=function(id){
  const p=epPatientById(id); if(!p)return;
  epModal('erecpassRecordsModal','Medical Records',
    '<p style="color:#8fb9b5;font-size:11px">History, diagnoses, notes</p>'+
    '<div>'+epEscape(p.doctorNotes||'No doctor notes recorded.')+'</div>');
};
window.openErecpassLabs=function(id){
  const p=epPatientById(id); if(!p)return;
  const labs=p.labResults||[];
  epModal('erecpassLabsModal','Lab Results',
    labs.length?labs.map(x=>'<div class="erecpass-account-row"><div class="name">'+epEscape(x.type||'Laboratory Result')+'</div><div class="meta">'+epEscape(x.date||'')+' · '+epEscape(x.result||'')+'</div>'+
    (x.photo?'<img src="'+x.photo+'" style="max-width:100%;margin-top:8px;border-radius:10px">':'')+'</div>').join(''):
    '<p style="color:#8fb9b5;font-size:11px">No lab results available.</p>');
};
window.openErecpassMeds=function(id){
  const p=epPatientById(id); if(!p)return;
  const meds=p.prescriptions||[];
  epModal('erecpassMedsModal','Medications',
    meds.length?meds.map(x=>'<div class="erecpass-account-row"><div class="name">'+epEscape(x.medicine||'Medication')+'</div><div class="meta">Dosage: '+epEscape(x.dosage||'As prescribed')+' · '+epEscape(x.days||'')+'</div></div>').join(''):
    '<p style="color:#8fb9b5;font-size:11px">No current medications.</p>');
};
window.openErecpassAppointments=function(id){
  const appts=(typeof DB_KEYS!=='undefined')?epGet(DB_KEYS.APPOINTMENTS,[]):[];
  const rows=appts.filter(a=>String(a.patientId)===String(id));
  epModal('erecpassAppointmentsModal','Appointments',
    rows.length?rows.map(a=>'<div class="erecpass-account-row"><div class="name">'+epEscape(a.date||'')+'</div><div class="meta">'+epEscape(a.doctor||'')+' · '+epEscape(a.status||'Pending')+'</div></div>').join(''):
    '<p style="color:#8fb9b5;font-size:11px">No appointments found.</p>');
};

/* ---------- 5. Admin Patients | Staff management ---------- */
let epAdminType='patient';
window.openErecpassAdminAccounts=function(){
  const body=
    '<div class="erecpass-admin-tabs">'+
    '<button id="epTabPatients" class="active" onclick="switchErecpassAdminTab(\'patient\')">Patients</button>'+
    '<button id="epTabStaff" onclick="switchErecpassAdminTab(\'staff\')">Staff</button></div>'+
    '<div id="epAdminAccountsList"></div>';
  epModal('erecpassAdminAccountsModal','Account Management',body);
  renderErecpassAdminAccounts();
};
window.switchErecpassAdminTab=function(type){
  epAdminType=type;
  document.getElementById('epTabPatients')?.classList.toggle('active',type==='patient');
  document.getElementById('epTabStaff')?.classList.toggle('active',type==='staff');
  renderErecpassAdminAccounts();
};
window.renderErecpassAdminAccounts=function(){
  const c=document.getElementById('epAdminAccountsList'); if(!c)return;
  const arr=epAdminType==='patient'?epPatients():epStaff();
  c.innerHTML=arr.map(a=>{
    const id=a.id;
    const name=a.fullName||a.name||'Unnamed';
    const active=a.active!==false;
    return '<div class="erecpass-account-row">'+
      '<div class="name">'+epEscape(name)+'</div>'+
      '<div class="meta">'+epEscape(a.email||a.role||'')+' · <span class="'+(active?'erecpass-status-on':'erecpass-status-off')+'">'+(active?'Active':'Deactivated')+'</span></div>'+
      '<div class="erecpass-added-actions">'+
      '<button onclick="viewErecpassAdminAccount(\''+epEscape(epAdminType)+'\',\''+epEscape(id)+'\')">View</button>'+
      '<button onclick="editErecpassAdminAccount(\''+epEscape(epAdminType)+'\',\''+epEscape(id)+'\')">Edit</button>'+
      '<button onclick="toggleErecpassAdminAccount(\''+epEscape(epAdminType)+'\',\''+epEscape(id)+'\')">'+(active?'Deactivate':'Activate')+'</button>'+
      '<button class="danger" onclick="deleteErecpassAdminAccount(\''+epEscape(epAdminType)+'\',\''+epEscape(id)+'\')">Delete</button>'+
      '</div></div>';
  }).join('') || '<p style="color:#8fb9b5;font-size:11px">No accounts found.</p>';
};
window.viewErecpassAdminAccount=function(type,id){
  const a=(type==='patient'?epPatients():epStaff()).find(x=>String(x.id)===String(id));
  if(!a)return;
  epModal('erecpassViewAccountModal','View Full Profile',
    '<p><b>Name:</b> '+epEscape(a.fullName||a.name)+'</p>'+
    '<p><b>ID:</b> '+epEscape(a.id)+'</p>'+
    '<p><b>Email:</b> '+epEscape(a.email||'')+'</p>'+
    '<p><b>Role:</b> '+epEscape(a.role||'Patient')+'</p>'+
    '<p><b>Permissions:</b> '+epEscape(a.permissions||'Standard')+'</p>'+
    '<p><b>Status:</b> '+(a.active===false?'Deactivated':'Active')+'</p>');
};
window.editErecpassAdminAccount=function(type,id){
  const a=(type==='patient'?epPatients():epStaff()).find(x=>String(x.id)===String(id));
  if(!a)return;
  const key=type==='patient'?DB_KEYS.PATIENTS:DB_KEYS.STAFF;
  epModal('erecpassEditAccountModal','Edit Account',
    '<label>Name</label><input id="epEditName" value="'+epEscape(a.fullName||a.name||'')+'">'+
    '<label>Email</label><input id="epEditEmail" value="'+epEscape(a.email||'')+'">'+
    '<label>Role</label><input id="epEditRole" value="'+epEscape(a.role||'Patient')+'">'+
    '<label>Permissions</label><input id="epEditPermissions" value="'+epEscape(a.permissions||'Standard')+'">'+
    '<label>New Password (optional)</label><input id="epEditPassword" type="password">'+
    '<div class="erecpass-added-actions"><button onclick="saveErecpassAdminAccount(\''+epEscape(type)+'\',\''+epEscape(id)+'\')">Save</button></div>');
};
window.saveErecpassAdminAccount=function(type,id){
  const key=type==='patient'?DB_KEYS.PATIENTS:DB_KEYS.STAFF;
  const arr=epGet(key,[]);
  const a=arr.find(x=>String(x.id)===String(id)); if(!a)return;
  const name=document.getElementById('epEditName')?.value.trim();
  const email=document.getElementById('epEditEmail')?.value.trim();
  const role=document.getElementById('epEditRole')?.value.trim();
  const permissions=document.getElementById('epEditPermissions')?.value.trim();
  const password=document.getElementById('epEditPassword')?.value;
  if(type==='patient') a.fullName=name; else a.name=name;
  a.email=email; a.role=role; a.permissions=permissions;
  if(password) a.password=password;
  epSet(key,arr);
  document.getElementById('erecpassEditAccountModal')?.classList.remove('active');
  renderErecpassAdminAccounts();
  if(typeof addLog==='function') addLog('Admin edited '+type+' account: '+name);
};
window.toggleErecpassAdminAccount=function(type,id){
  const key=type==='patient'?DB_KEYS.PATIENTS:DB_KEYS.STAFF;
  const arr=epGet(key,[]);
  const a=arr.find(x=>String(x.id)===String(id)); if(!a)return;
  a.active=a.active===false;
  epSet(key,arr);
  if(typeof addLog==='function') addLog('Admin '+(a.active?'activated ':'deactivated ')+type+' account: '+(a.fullName||a.name||id));
  renderErecpassAdminAccounts();
  alert(a.active?'Account activated.':'Account deactivated. Login is blocked while deactivated.');
};
window.deleteErecpassAdminAccount=function(type,id){
  if(!confirm('Delete Account?\nThis will permanently remove the '+type+' account.')) return;
  const key=type==='patient'?DB_KEYS.PATIENTS:DB_KEYS.STAFF;
  const arr=epGet(key,[]);
  const target=arr.find(x=>String(x.id)===String(id));
  if(!target)return;
  epSet(key,arr.filter(x=>String(x.id)!==String(id)));
  if(typeof addLog==='function') addLog('Admin permanently deleted '+type+' account: '+(target.fullName||target.name||id));
  renderErecpassAdminAccounts();
  alert('Account permanently deleted.');
};

/* ---------- 6. Deactivated accounts cannot log in ---------- */
function epBlockDeactivatedPatient(){
  const email=(document.getElementById('loginEmail')||{}).value?.trim().toLowerCase();
  const p=epPatients().find(x=>(x.email||'').toLowerCase()===email);
  return p && p.active===false;
}
const priorLoginAfterAdd=window.handleLogin;
window.handleLogin=async function(event){
  if(epBlockDeactivatedPatient()){ if(event)event.preventDefault(); alert('This account is deactivated. Login is disabled.'); return; }
  return priorLoginAfterAdd.call(this,event);
};

/* ---------- 7. Supabase database helpers ---------- */
window.erecpassSupabaseSyncPatient=async function(patient){
  if(!window.erecpassSupabase)return {error:new Error('Supabase is not configured')};
  return await erecpassSupabase.from('patients').upsert({
    id:patient.id,
    auth_user_id:patient.auth_user_id||null,
    full_name:patient.fullName||patient.name||null,
    email:patient.email||null,
    sim:patient.sim||null,
    photo:patient.photo||null,
    age_category:patient.ageCategory||null,
    guardian_num:patient.guardianNum||null,
    status:patient.status||'Green',
    active:patient.active!==false
  },{onConflict:'id'});
};
window.erecpassSupabaseLoadPatient=async function(patientId){
  if(!window.erecpassSupabase)return null;
  const r=await erecpassSupabase.from('patients').select('*').eq('id',patientId).maybeSingle();
  if(r.error) throw r.error;
  return r.data;
};

/* ---------- 8. Add Forgot Password button and admin management entry ---------- */
function installAddedUI(){
  installPasswordEyes();

  const form=document.getElementById('loginForm');
  if(form && !document.getElementById('erecpassForgotBtnAdded')){
    const b=document.createElement('button');
    b.id='erecpassForgotBtnAdded'; b.type='button';
    b.textContent='Forgot Password?'; b.onclick=window.openErecpassForgotPassword;
    b.className='w-full py-2 text-xs text-rose-400 font-tech font-bold hover:underline';
    form.parentNode.insertBefore(b,form.nextSibling);
  }

  /* Add Account Management button to an existing admin area without replacing it. */
  if(!document.getElementById('erecpassAdminAccountManagementBtn')){
    const candidates=[
      document.getElementById('adminPortal'),
      document.getElementById('adminApp'),
      document.getElementById('adminPage'),
      document.querySelector('[id*="admin"][id*="Portal"]')
    ].filter(Boolean);
    const host=candidates[0];
    if(host){
      const b=document.createElement('button');
      b.id='erecpassAdminAccountManagementBtn';
      b.className='primary-btn w-full py-3 rounded-xl font-tech text-xs font-bold mt-3';
      b.innerHTML='<i class="fa-solid fa-users-gear"></i> Account Management · Patients / Staff';
      b.onclick=window.openErecpassAdminAccounts;
      host.appendChild(b);
    }
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installAddedUI);
else installAddedUI();
setTimeout(installAddedUI,1000);
setTimeout(installAddedUI,2500);
})();

