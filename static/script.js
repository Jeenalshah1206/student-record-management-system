// static/app.js

const API = "/students";

let allStudents = [];
let editingId = null;

const pageTitles = {
    dashboard: "Dashboard",
    students: "All Students",
    add: "Add Student",
    search: "Find Student"
};

function showPage(page) {
    document.querySelectorAll(".page").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(page).classList.remove("hidden");
    document.getElementById("page-title").textContent = pageTitles[page];

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle("active", link.dataset.page === page);
    });

    if (page === "dashboard" || page === "students") {
        loadStudents();
    }

    if (page === "add" && editingId === null) {
        resetForm();
    }
}

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        showPage(link.dataset.page);
    });
});

function notify(message, type = "success") {
    const notice = document.getElementById("notice");
    notice.textContent = message;
    notice.className = `notice ${type}`;

    window.setTimeout(() => {
        notice.className = "notice";
    }, 4000);
}

async function request(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.detail || data.message || "Something went wrong");
    }

    return data;
}

async function loadStudents() {
    try {
        allStudents = await request(API);
        renderDashboard();
        renderStudents();
    } catch (error) {
        notify(`Could not load students: ${error.message}`, "error");
    }
}

function renderDashboard() {
    document.getElementById("total-count").textContent = allStudents.length;

    const average = allStudents.length
        ? allStudents.reduce((sum, student) => sum + Number(student.marks), 0) / allStudents.length
        : 0;

    document.getElementById("average-marks").textContent =
        allStudents.length ? average.toFixed(1) : "0";

    const courses = new Set(allStudents.map(student => student.course));
    document.getElementById("course-count").textContent = courses.size;

    const recent = [...allStudents].slice(-5).reverse();
    const tbody = document.getElementById("recent-table");

    if (!recent.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty">No students found. Add your first student.</td></tr>`;
        return;
    }

    tbody.innerHTML = recent.map(student => `
        <tr>
            <td>#${student.id}</td>
            <td>${escapeHTML(student.name)}</td>
            <td>${escapeHTML(student.course)}</td>
            <td>${Number(student.marks).toFixed(1)}%</td>
            <td><button class="secondary-btn small-btn" onclick="editStudent(${student.id})">Edit</button></td>
        </tr>
    `).join("");
}

function renderStudents() {
    const tbody = document.getElementById("students-table");
    if (!tbody) return;

    const search = (document.getElementById("table-search")?.value || "").toLowerCase();

    const filtered = allStudents.filter(student =>
        String(student.id).includes(search) ||
        student.name.toLowerCase().includes(search) ||
        student.course.toLowerCase().includes(search)
    );

    if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty">No matching students found.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(student => `
        <tr>
            <td>#${student.id}</td>
            <td>${escapeHTML(student.name)}</td>
            <td>${student.age}</td>
            <td>${escapeHTML(student.course)}</td>
            <td>${Number(student.marks).toFixed(1)}%</td>
            <td>
                <div class="actions">
                    <button class="small-btn edit-btn" onclick="editStudent(${student.id})">Edit</button>
                    <button class="small-btn delete-btn" onclick="deleteStudent(${student.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join("");
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

document.getElementById("student-form").addEventListener("submit", async event => {
    event.preventDefault();

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    data.name = data.name.trim();
    data.course = data.course.trim();
    data.age = Number(data.age);
    data.marks = Number(data.marks);

    if (!data.name || !data.course || data.age < 1 || data.age > 120 ||
        data.marks < 0 || data.marks > 100) {
        notify("Please enter valid student details.", "error");
        return;
    }

    try {
        if (editingId !== null) {
            await request(`${API}/${editingId}`, {
                method: "PUT",
                body: JSON.stringify(data)
            });
            notify("Student updated successfully.");
        } else {
            await request(API, {
                method: "POST",
                body: JSON.stringify(data)
            });
            notify("Student added successfully.");
        }

        resetForm();
        await loadStudents();
        showPage("students");
    } catch (error) {
        notify(error.message, "error");
    }
});

async function editStudent(id) {
    try {
        const student = await request(`${API}/${id}`);

        editingId = id;
        const form = document.getElementById("student-form");

        form.elements.name.value = student.name;
        form.elements.age.value = student.age;
        form.elements.course.value = student.course;
        form.elements.marks.value = student.marks;

        document.getElementById("form-heading").textContent = `Edit Student #${id}`;
        document.getElementById("save-btn").textContent = "Update Student";

        showPage("add");
    } catch (error) {
        notify(error.message, "error");
    }
}

async function deleteStudent(id) {
    if (!confirm(`Are you sure you want to delete student #${id}?`)) return;

    try {
        await request(`${API}/${id}`, { method: "DELETE" });
        notify("Student deleted successfully.");
        await loadStudents();
    } catch (error) {
        notify(error.message, "error");
    }
}

function resetForm() {
    editingId = null;
    document.getElementById("student-form").reset();
    document.getElementById("form-heading").textContent = "Add New Student";
    document.getElementById("save-btn").textContent = "Save Student";
}

document.getElementById("search-form").addEventListener("submit", async event => {
    event.preventDefault();

    const id = document.getElementById("search-id").value;
    const result = document.getElementById("search-result");
    result.innerHTML = "";

    try {
        const student = await request(`${API}/${id}`);

        result.innerHTML = `
            <div class="result-card">
                <h3>${escapeHTML(student.name)}</h3>
                <p><strong>Student ID:</strong> ${student.id}</p>
                <p><strong>Age:</strong> ${student.age}</p>
                <p><strong>Course:</strong> ${escapeHTML(student.course)}</p>
                <p><strong>Marks:</strong> ${Number(student.marks).toFixed(1)}%</p>
                <button class="secondary-btn" onclick="editStudent(${student.id})">Edit Record</button>
            </div>
        `;
    } catch (error) {
        result.innerHTML = `<div class="result-card">${escapeHTML(error.message)}</div>`;
    }
});

loadStudents();