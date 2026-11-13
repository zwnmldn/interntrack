// app data
let currentUser = null;
let applications = [
    { id: 1, company: 'Petronas Digital', position: 'Frontend Developer Intern', location: 'Kuala Lumpur', date: '2026-01-15', stipend: 1200, status: 'Interview Scheduled' },
    { id: 2, company: 'Maybank Tech', position: 'Cybersecurity Analyst Intern', location: 'Bangsar', date: '2026-01-20', stipend: 1000, status: 'Offer Received' },
    { id: 3, company: 'Axiata Group', position: 'Data Science Intern', location: 'Subang Jaya', date: '2026-02-02', stipend: 900, status: 'Applied' },
    { id: 4, company: 'Grab Malaysia', position: 'UI/UX Designer Intern', location: 'Petaling Jaya', date: '2026-02-14', stipend: 1100, status: 'Rejected' },
    { id: 5, company: 'Sime Darby', position: 'IT Support Intern', location: 'Shah Alam', date: '2026-02-28', stipend: 800, status: 'Applied' },
    { id: 6, company: 'RHB Bank', position: 'Fullstack Intern', location: 'Kuala Lumpur', date: '2026-03-01', stipend: 1000, status: 'Interview Scheduled' },
    { id: 7, company: 'TNB Digital', position: 'Cloud Engineer Intern', location: 'Bangsar', date: '2026-03-05', stipend: 1300, status: 'Offer Received' }
];

let interviews = [
    { id: 1, company: 'Petronas Digital', contact: 'Mr. Imran (HR)', dateTime: '2026-03-25T10:00', mode: 'Online (MS Teams)', notes: 'Technical interview focusing on Bootstrap & JS framework' }
];

// pagination
let currentPage = 1;
const itemsPerPage = 5;

// keep chart objects so we can destroy them before redrawing
let dashPieChartInstance = null;
let dashStipendChartInstance = null;
let dashVelocityChartInstance = null;
let analyticsDoughnutInstance = null;
let analyticsMixedInstance = null;

// bootstrap modals
let appModalInstance, interviewModalInstance;

// theme (remembered from last visit)
let currentTheme = localStorage.getItem('interntrack_theme') || 'light';

window.onload = function() {
    appModalInstance = new bootstrap.Modal(document.getElementById('appModal'));
    interviewModalInstance = new bootstrap.Modal(document.getElementById('interviewModal'));

    if (localStorage.getItem('intern_apps')) {
        applications = JSON.parse(localStorage.getItem('intern_apps'));
    }
    if (localStorage.getItem('intern_interviews')) {
        interviews = JSON.parse(localStorage.getItem('intern_interviews'));
    }

    // set the saved theme
    applyTheme(currentTheme);
};

function saveData() {
    localStorage.setItem('intern_apps', JSON.stringify(applications));
    localStorage.setItem('intern_interviews', JSON.stringify(interviews));
}

function launchApp() {
    document.getElementById('authSection').classList.add('d-none');
    document.getElementById('appNavbar').classList.remove('d-none');

    // show name + student id in the navbar
    document.getElementById('navUserName').innerText = currentUser.name;
    document.getElementById('navStudentInfo').innerText = `UiTM Student (${currentUser.studentId})`;

    switchView(null, 'dashboard');
}

// light / dark mode
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('interntrack_theme', currentTheme);
    applyTheme(currentTheme);

    // redraw charts so the text colors match the new theme
    const activeSec = document.querySelector('.view-section:not(.d-none)');
    if (activeSec) {
        if (activeSec.id === 'dashboardSection') renderDashboard();
        if (activeSec.id === 'analyticsSection') renderAnalytics();
    }
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    const icon = document.getElementById('themeIcon');
    const label = document.getElementById('themeLabel');

    if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun text-warning';
        label.innerText = 'Light';
    } else {
        icon.className = 'fa-solid fa-moon';
        label.innerText = 'Dark';
    }
}

function getChartTextColor() {
    return currentTheme === 'dark' ? '#94a3b8' : '#64748b';
}

function getChartGridColor() {
    return currentTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
}

// login / register
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    const alertBox = document.getElementById('authAlert');

    if (email === 'student@uitm.edu.my' && pass === 'password123') {
        alertBox.classList.add('d-none');
        currentUser = { name: 'Ahmad Razak', email: email, studentId: '202640001' };
        launchApp();
    } else {
        alertBox.classList.remove('d-none');
        alertBox.innerText = 'Invalid email or password! Please check the pre-filled demo credentials.';
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const id = document.getElementById('regStudentId').value;

    currentUser = { name: name, email: email, studentId: id };
    alert('Registration Successful! Logging in automatically...');
    launchApp();
}

function handleLogout() {
    currentUser = null;
    document.getElementById('appNavbar').classList.add('d-none');
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('d-none'));
    document.getElementById('authSection').classList.remove('d-none');
}

// switching between pages
function switchView(event, viewName) {
    if (event) event.preventDefault();

    const links = document.querySelectorAll('#appNavbar .nav-link');
    links.forEach(link => link.classList.remove('active'));

    const activeMap = {
        'dashboard': 0,
        'applications': 1,
        'interviews': 2,
        'analytics': 3
    };
    if (links[activeMap[viewName]]) links[activeMap[viewName]].classList.add('active');

    document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('d-none'));

    if (viewName === 'dashboard') {
        document.getElementById('dashboardSection').classList.remove('d-none');
        renderDashboard();
    } else if (viewName === 'applications') {
        document.getElementById('applicationsSection').classList.remove('d-none');
        renderApplications();
    } else if (viewName === 'interviews') {
        document.getElementById('interviewsSection').classList.remove('d-none');
        renderInterviews();
    } else if (viewName === 'analytics') {
        document.getElementById('analyticsSection').classList.remove('d-none');
        renderAnalytics();
    }
}

function getBadgeClass(status) {
    switch (status) {
        case 'Applied': return 'badge-applied';
        case 'Interview Scheduled': return 'badge-interview';
        case 'Offer Received': return 'badge-offered';
        case 'Rejected': return 'badge-rejected';
        default: return 'bg-secondary';
    }
}

// dashboard
function renderDashboard() {
    const total = applications.length;
    const review = applications.filter(a => a.status === 'Applied' || a.status === 'Interview Scheduled').length;
    const offers = applications.filter(a => a.status === 'Offer Received').length;
    const rejected = applications.filter(a => a.status === 'Rejected').length;

    document.getElementById('statTotal').innerText = total;
    document.getElementById('statReview').innerText = review;
    document.getElementById('statOffers').innerText = offers;
    document.getElementById('statRejected').innerText = rejected;

    // recent applications (latest 4)
    const recentContainer = document.getElementById('recentAppList');
    if (applications.length === 0) {
        recentContainer.innerHTML = '<div class="text-muted small py-3">No applications submitted yet.</div>';
    } else {
        const sorted = [...applications].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
        recentContainer.innerHTML = sorted.map(app => `
            <div class="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-bottom">
                <div>
                    <div class="fw-bold small">${app.company}</div>
                    <div class="text-muted extra-small" style="font-size:0.8rem;">${app.position}</div>
                </div>
                <span class="badge ${getBadgeClass(app.status)} text-white">${app.status}</span>
            </div>
        `).join('');
    }

    const textColor = getChartTextColor();
    const gridColor = getChartGridColor();

    // pie chart
    const counts = { Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };
    applications.forEach(a => {
        if (a.status === 'Applied') counts.Applied++;
        else if (a.status === 'Interview Scheduled') counts.Interview++;
        else if (a.status === 'Offer Received') counts.Offer++;
        else if (a.status === 'Rejected') counts.Rejected++;
    });

    const ctxPie = document.getElementById('dashboardPieChart').getContext('2d');
    if (dashPieChartInstance) dashPieChartInstance.destroy();

    dashPieChartInstance = new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: ['Applied', 'Interview Scheduled', 'Offer Received', 'Rejected'],
            datasets: [{
                data: [counts.Applied, counts.Interview, counts.Offer, counts.Rejected],
                backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: textColor } } }
        }
    });

    // stipend bar chart (top 5)
    const sortedByStipend = [...applications].sort((a,b) => b.stipend - a.stipend).slice(0, 5);
    const stipendLabels = sortedByStipend.map(a => a.company);
    const stipendValues = sortedByStipend.map(a => a.stipend || 0);

    const ctxStipend = document.getElementById('dashboardStipendChart').getContext('2d');
    if (dashStipendChartInstance) dashStipendChartInstance.destroy();

    dashStipendChartInstance = new Chart(ctxStipend, {
        type: 'bar',
        data: {
            labels: stipendLabels.length ? stipendLabels : ['No Data'],
            datasets: [{
                label: 'Stipend (RM)',
                data: stipendValues.length ? stipendValues : [0],
                backgroundColor: '#10b981',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: textColor } } },
            scales: {
                x: { ticks: { color: textColor }, grid: { color: gridColor } },
                y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: true }
            }
        }
    });

    // submissions per date line chart
    const dateMap = {};
    [...applications].sort((a,b) => new Date(a.date) - new Date(b.date)).forEach(a => {
        dateMap[a.date] = (dateMap[a.date] || 0) + 1;
    });

    const dates = Object.keys(dateMap);
    const dateCounts = Object.values(dateMap);

    const ctxVel = document.getElementById('dashboardVelocityChart').getContext('2d');
    if (dashVelocityChartInstance) dashVelocityChartInstance.destroy();

    dashVelocityChartInstance = new Chart(ctxVel, {
        type: 'line',
        data: {
            labels: dates.length ? dates : ['No Data'],
            datasets: [{
                label: 'Submissions per Date',
                data: dateCounts.length ? dateCounts : [0],
                borderColor: '#0284c7',
                backgroundColor: 'rgba(2, 132, 199, 0.15)',
                fill: true,
                tension: 0.3,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: textColor } } },
            scales: {
                x: { ticks: { color: textColor }, grid: { color: gridColor } },
                y: { ticks: { color: textColor, stepSize: 1 }, grid: { color: gridColor }, beginAtZero: true }
            }
        }
    });
}

// applications table + pagination
function getFilteredApplications() {
    const search = document.getElementById('searchAppInput').value.toLowerCase();
    const filter = document.getElementById('filterStatusSelect').value;

    return applications.filter(app => {
        const matchesSearch = app.company.toLowerCase().includes(search) || app.position.toLowerCase().includes(search);
        const matchesFilter = filter === 'ALL' || app.status === filter;
        return matchesSearch && matchesFilter;
    });
}

function onSearchOrFilterChange() {
    currentPage = 1;
    renderApplications();
}

function renderApplications() {
    const filtered = getFilteredApplications();
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedItems = filtered.slice(startIndex, endIndex);

    const tbody = document.getElementById('appTableBody');

    if (paginatedItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No matching application records found.</td></tr>`;
    } else {
        tbody.innerHTML = paginatedItems.map(app => `
            <tr>
                <td class="fw-bold">${app.company}</td>
                <td>${app.position}</td>
                <td><i class="fa-solid fa-location-dot me-1 text-muted"></i>${app.location}</td>
                <td>${app.date}</td>
                <td>RM ${app.stipend ? app.stipend : 0}</td>
                <td><span class="badge ${getBadgeClass(app.status)} text-white">${app.status}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="openAppModal(${app.id})">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteApplication(${app.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // update the pagination text and buttons
    const displayStart = totalItems === 0 ? 0 : startIndex + 1;
    document.getElementById('paginationInfo').innerText = `Showing ${displayStart} to ${endIndex} of ${totalItems} applications`;
    document.getElementById('pageIndicator').innerText = `Page ${currentPage} of ${totalPages}`;

    document.getElementById('prevPageBtn').disabled = (currentPage === 1);
    document.getElementById('nextPageBtn').disabled = (currentPage === totalPages || totalItems === 0);
}

function changePage(direction) {
    currentPage += direction;
    renderApplications();
}

function openAppModal(id = null) {
    const form = document.getElementById('appForm');
    form.reset();

    if (id) {
        const app = applications.find(a => a.id === id);
        if (app) {
            document.getElementById('appModalTitle').innerText = 'Edit Application';
            document.getElementById('appId').value = app.id;
            document.getElementById('appCompany').value = app.company;
            document.getElementById('appPosition').value = app.position;
            document.getElementById('appLocation').value = app.location;
            document.getElementById('appDate').value = app.date;
            document.getElementById('appStipend').value = app.stipend;
            document.getElementById('appStatus').value = app.status;
        }
    } else {
        document.getElementById('appModalTitle').innerText = 'Add Application';
        document.getElementById('appId').value = '';
        document.getElementById('appDate').value = new Date().toISOString().split('T')[0];
    }
    appModalInstance.show();
}

function saveApplication(e) {
    e.preventDefault();
    const id = document.getElementById('appId').value;
    const appData = {
        id: id ? parseInt(id) : Date.now(),
        company: document.getElementById('appCompany').value,
        position: document.getElementById('appPosition').value,
        location: document.getElementById('appLocation').value,
        date: document.getElementById('appDate').value,
        stipend: parseFloat(document.getElementById('appStipend').value) || 0,
        status: document.getElementById('appStatus').value
    };

    if (id) {
        const index = applications.findIndex(a => a.id === parseInt(id));
        if (index !== -1) applications[index] = appData;
    } else {
        applications.push(appData);
    }

    saveData();
    appModalInstance.hide();
    renderApplications();
    renderDashboard();
}

function deleteApplication(id) {
    if (confirm('Are you sure you want to remove this application record?')) {
        applications = applications.filter(a => a.id !== id);
        saveData();
        renderApplications();
        renderDashboard();
    }
}

// interviews
function renderInterviews() {
    const grid = document.getElementById('interviewsGrid');
    if (interviews.length === 0) {
        grid.innerHTML = '<div class="col-12"><div class="alert alert-info">No interviews scheduled yet.</div></div>';
        return;
    }

    grid.innerHTML = interviews.map(item => `
        <div class="col-12 col-md-6 col-lg-4">
            <div class="card stat-card p-3 h-100 border-top border-4 border-info">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="fw-bold mb-0">${item.company}</h5>
                    <div>
                        <button class="btn btn-sm text-primary p-0 me-2" onclick="openInterviewModal(${item.id})"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-sm text-danger p-0" onclick="deleteInterview(${item.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <p class="text-muted small mb-2"><i class="fa-solid fa-user me-2 text-primary"></i>${item.contact}</p>
                <p class="text-muted small mb-2"><i class="fa-solid fa-clock me-2 text-warning"></i>${new Date(item.dateTime).toLocaleString()}</p>
                <p class="text-muted small mb-2"><i class="fa-solid fa-video me-2 text-info"></i>${item.mode}</p>
                <div class="p-2 rounded small text-secondary mt-2 border" style="background-color: var(--bg-light);">
                    <strong>Note:</strong> ${item.notes || 'No extra notes provided.'}
                </div>
            </div>
        </div>
    `).join('');
}

function openInterviewModal(id = null) {
    const form = document.getElementById('interviewForm');
    form.reset();

    if (id) {
        const item = interviews.find(i => i.id === id);
        if (item) {
            document.getElementById('interviewModalTitle').innerText = 'Edit Interview Record';
            document.getElementById('intId').value = item.id;
            document.getElementById('intCompany').value = item.company;
            document.getElementById('intContact').value = item.contact;
            document.getElementById('intDateTime').value = item.dateTime;
            document.getElementById('intMode').value = item.mode;
            document.getElementById('intNotes').value = item.notes;
        }
    } else {
        document.getElementById('interviewModalTitle').innerText = 'Schedule / Add Contact';
        document.getElementById('intId').value = '';
    }
    interviewModalInstance.show();
}

function saveInterview(e) {
    e.preventDefault();
    const id = document.getElementById('intId').value;
    const data = {
        id: id ? parseInt(id) : Date.now(),
        company: document.getElementById('intCompany').value,
        contact: document.getElementById('intContact').value,
        dateTime: document.getElementById('intDateTime').value,
        mode: document.getElementById('intMode').value,
        notes: document.getElementById('intNotes').value
    };

    if (id) {
        const idx = interviews.findIndex(i => i.id === parseInt(id));
        if (idx !== -1) interviews[idx] = data;
    } else {
        interviews.push(data);
    }

    saveData();
    interviewModalInstance.hide();
    renderInterviews();
}

function deleteInterview(id) {
    if (confirm('Delete this interview schedule?')) {
        interviews = interviews.filter(i => i.id !== id);
        saveData();
        renderInterviews();
    }
}

// analytics page
function renderAnalytics() {
    const textColor = getChartTextColor();
    const gridColor = getChartGridColor();

    // Doughnut chart
    const counts = { Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };
    applications.forEach(a => {
        if (a.status === 'Applied') counts.Applied++;
        else if (a.status === 'Interview Scheduled') counts.Interview++;
        else if (a.status === 'Offer Received') counts.Offer++;
        else if (a.status === 'Rejected') counts.Rejected++;
    });

    const ctxDoughnut = document.getElementById('analyticsDoughnutChart').getContext('2d');
    if (analyticsDoughnutInstance) analyticsDoughnutInstance.destroy();

    analyticsDoughnutInstance = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
            labels: ['Applied', 'Interview Scheduled', 'Offer Received', 'Rejected'],
            datasets: [{
                data: [counts.Applied, counts.Interview, counts.Offer, counts.Rejected],
                backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: textColor } } }
        }
    });

    // mixed chart: monthly bars + cumulative line
    const monthlyMap = {};
    [...applications].sort((a,b) => new Date(a.date) - new Date(b.date)).forEach(a => {
        const m = a.date ? a.date.substring(0, 7) : 'Unknown';
        monthlyMap[m] = (monthlyMap[m] || 0) + 1;
    });

    const months = Object.keys(monthlyMap);
    const monthlyCounts = Object.values(monthlyMap);

    let runningTotal = 0;
    const cumulativeCounts = monthlyCounts.map(c => {
        runningTotal += c;
        return runningTotal;
    });

    const ctxMixed = document.getElementById('analyticsMixedChart').getContext('2d');
    if (analyticsMixedInstance) analyticsMixedInstance.destroy();

    analyticsMixedInstance = new Chart(ctxMixed, {
        type: 'bar',
        data: {
            labels: months.length ? months : ['No Data'],
            datasets: [
                {
                    type: 'line',
                    label: 'Cumulative Growth (Total)',
                    data: cumulativeCounts.length ? cumulativeCounts : [0],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#f59e0b',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    order: 1, // draw line on top of the bars
                    yAxisID: 'y1'
                },
                {
                    type: 'bar',
                    label: 'Monthly Submissions (New)',
                    data: monthlyCounts.length ? monthlyCounts : [0],
                    backgroundColor: 'rgba(13, 148, 136, 0.65)',
                    borderColor: '#0d9488',
                    borderWidth: 1.5,
                    borderRadius: 6,
                    barPercentage: 0.5,
                    order: 2, // draw bars behind the line
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: textColor } },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                x: { ticks: { color: textColor }, grid: { color: gridColor } },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: { color: textColor, stepSize: 1 },
                    grid: { color: gridColor },
                    title: { display: true, text: 'Monthly New Apps', color: textColor },
                    beginAtZero: true
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: { color: textColor, stepSize: 1 },
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: 'Cumulative Apps', color: textColor },
                    beginAtZero: true
                }
            }
        }
    });
}