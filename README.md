# InternTrack: UiTM Internship Tracker

InternTrack is a responsive web app prototype I built for **IMS566 (Advanced Web Design Development)** at Universiti Teknologi MARA (UiTM). Applying for industrial training gets messy fast, with applications, interview dates and recruiter contacts scattered everywhere. This app puts all of it on one dashboard so students can see where they stand.

---

## What It Does

**Login and registration (simulated).** The login form comes pre-filled with demo credentials. If you use the Register tab instead, the app picks up your name and Student ID and shows them in the navbar.

**Dashboard.** You get four summary cards (Total Applied, In Review/Interview, Offers Received, Rejected/Closed), your four most recent applications, and three charts.

**Application management.** You can add, view, edit and delete internship records. There's a live search by company or position, a status filter, and pagination at 5 items per page.

**Interviews and contacts.** A card-based view for upcoming interviews, recruiter details, the interview mode (Google Meet, MS Teams, on-site) and your own prep notes.

**Analytics.**
- On the dashboard: a pie chart of application status, a bar chart of stipend by company, and a line chart of submissions over time.
- On the Analytics page: a doughnut chart of status distribution, plus a dual-axis chart that combines monthly applications (bars) with cumulative growth (line).

**Light and dark mode.** The toggle saves your choice in `localStorage`, and the charts update their text and grid colors to match.

**Saved in your browser.** Everything you add is stored in `localStorage`. The first time you open the app, it loads 7 sample Malaysian tech and corporate internship records so it doesn't look empty.

---

## Trying It Out

1. Open `index.html` in any modern browser. There's no server or build step.
2. On the **Login** tab, use the demo account (already filled in):
   - **Email:** `student@uitm.edu.my`
   - **Password:** `password123`
3. Click **Sign In** to reach the dashboard.
4. If you want to test registration, go to the **Register** tab and enter any name, Student ID, email and password. You'll be logged in automatically.

---

## Built With

- **HTML5, CSS3 and vanilla JavaScript (ES6+)** for the structure, the CSS variables behind theming, DOM manipulation and `localStorage` state.
- **Bootstrap 5.3.2** for the grid, navbar, modals, tabs and tables (loaded from jsDelivr).
- **Chart.js** for the pie, doughnut, bar, line and mixed charts (loaded from jsDelivr).
- **Font Awesome 6.4.2** for icons (loaded from cdnjs).
- **Google Fonts (Inter)** for typography.
