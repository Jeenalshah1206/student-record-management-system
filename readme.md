# Student Record Management System

A web-based Student Record Management System built using **FastAPI, Python, MySQL, HTML, CSS, and JavaScript**. The application allows users to manage student records through a simple, responsive web interface and RESTful APIs.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Database Configuration](#database-configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)

## Overview

The Student Record Management System provides a centralized way to store, retrieve, search, update, and delete student information.

Each student record contains the following information:

- Student ID
- Name
- Age
- Course
- Marks

The backend is developed with FastAPI, MySQL is used for persistent storage, and the frontend uses HTML, CSS, and JavaScript.

## Features

- **Dashboard:** View student statistics, total students, course count, and average marks.
- **View Students:** Display student records in a table with search and filtering.
- **Add Student:** Create a new student record.
- **Search Student:** Find a student using their ID.
- **Update Student:** Modify existing student information.
- **Delete Student:** Remove a student record after confirmation.
- **REST API:** Perform CRUD operations through HTTP endpoints.
- **Data Validation:** Validate student details using Pydantic.
- **Interactive UI:** Navigate between the different pages using the sidebar.

## Technology Stack

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| FastAPI | REST API and web framework |
| Pydantic | Request data validation |
| MySQL | Relational database |
| HTML5 | Page structure |
| CSS3 | Styling and responsive layout |
| JavaScript | Frontend interactions |
| Uvicorn | ASGI server |

## Project Structure

```text
student_project/
│
├── main.py
├── requirements.txt
├── README.md
│
└── static/
    ├── index.html
    ├── view.html
    ├── add.html
    ├── search.html
    ├── update.html
    └── delete.html
```

## Prerequisites

Install the following software before running the project:

- Python 3.10 or newer
- MySQL Server
- pip
- A web browser

Check your Python installation:

```bash
python --version
```

Check pip:

```bash
python -m pip --version
```

## Installation and Setup

### 1. Clone the repository

If the project is hosted on GitHub:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

Replace the repository URL with your actual GitHub repository.

Alternatively, open your existing project folder in VS Code.

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

### 3. Install dependencies

Create a file named `requirements.txt` containing:

```text
fastapi
uvicorn[standard]
mysql-connector-python
```

Install the packages:

```bash
python -m pip install -r requirements.txt
```

## Database Configuration

### 1. Start MySQL Server

Ensure that your MySQL service is running.

### 2. Create the database

Open MySQL Workbench or your MySQL command-line client and execute:

```sql
CREATE DATABASE IF NOT EXISTS student_db;

USE student_db;

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    course VARCHAR(100) NOT NULL,
    marks DECIMAL(5,2) NOT NULL
);
```

This schema matches the student fields used by the application. If your existing table has a different schema, retain the schema that matches your `main.py`.

### 3. Configure the database connection

Ensure the MySQL connection settings in `main.py` match your local database:

- Host: `localhost` or `127.0.0.1`
- Port: `3306`
- Database: `student_db`
- Username: your MySQL username
- Password: your MySQL password

**Security note:** Never commit real database passwords to a public GitHub repository.

## Running the Application

Start the development server from the directory containing `main.py`:

```bash
uvicorn main:app --reload
```

Open the application in your browser:

| Resource | URL |
|---|---|
| Main dashboard | `http://127.0.0.1:8000/` |
| View students | `http://127.0.0.1:8000/view` |
| Add student | `http://127.0.0.1:8000/add` |
| Search student | `http://127.0.0.1:8000/search` |
| Update student | `http://127.0.0.1:8000/update` |
| Delete student | `http://127.0.0.1:8000/delete` |
| Interactive API docs | `http://127.0.0.1:8000/docs` |

The `--reload` option automatically restarts the development server when code changes. Do not use it as the production server configuration.

## API Documentation

The application exposes the following REST API endpoints.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/students` | Retrieve all students |
| `GET` | `/students/{student_id}` | Retrieve a student by ID |
| `POST` | `/students` | Create a student |
| `PUT` | `/students/{student_id}` | Update a student |
| `DELETE` | `/students/{student_id}` | Delete a student |
| `GET` | `/api` | API information, if implemented |

### Example: Create a student

**Request**

```http
POST /students
Content-Type: application/json
```

**JSON body**

```json
{
  "name": "Aarav Sharma",
  "age": 20,
  "course": "Computer Science",
  "marks": 88.5
}
```

### Example: Retrieve all students

```http
GET /students
```

### Example: Retrieve one student

```http
GET /students/1
```

### Example: Update a student

```http
PUT /students/1
Content-Type: application/json
```

```json
{
  "name": "Aarav Sharma",
  "age": 21,
  "course": "Artificial Intelligence",
  "marks": 91
}
```

### Example: Delete a student

```http
DELETE /students/1
```

You can test these endpoints using the interactive documentation at `/docs`. The request and response details depend on the implementation in `main.py`.

## Deployment

The application can be deployed to a cloud hosting platform such as Render, provided that a compatible hosted MySQL database is available.

### Step 1: Prepare the project

Before deployment, confirm that:

- All required files are present.
- `requirements.txt` is included.
- The app serves its HTML pages and static assets correctly.
- The database connection does not rely on your local computer.
- Database credentials are not hardcoded in publicly accessible source code.

### Step 2: Configure production database access

Create or obtain a hosted MySQL database from a provider that supports remote connections.

Update the application to read database configuration from environment variables, for example:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
```

The application must actually read these variables in its connection code. Merely adding them to the hosting dashboard will not change hardcoded connection settings.

### Step 3: Push the project to GitHub

From your project directory:

```bash
git init
git add .
git commit -m "Prepare student record system for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

If the repository already exists and is connected, you do not need to repeat the initialization commands.

### Step 4: Create a web service

1. Sign in to [Render](https://render.com/).
2. Create a new Web Service.
3. Connect your GitHub repository.
4. Select the appropriate Python runtime.
5. Configure the build and start commands.

**Build command:**

```bash
pip install -r requirements.txt
```

**Start command:**

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

The hosting platform supplies the production port through the `PORT` environment variable.

### Step 5: Add environment variables

In your hosting dashboard, configure the database variables using the values supplied by your hosted MySQL provider.

Do not publish the database password or place it in this README.

### Step 6: Deploy and test

Deploy the service and open the generated public URL.

Verify the following:

- The dashboard loads.
- Student records can be retrieved.
- New records can be added.
- Existing records can be updated.
- Records can be deleted.
- The application can connect to the hosted database.
- The `/docs` page loads.

**Important:** A successful deployment of the FastAPI server does not automatically deploy your local MySQL database. Your production database must be separately hosted and accessible from the web service.

## Troubleshooting

### MySQL connection error

- Check that MySQL is running.
- Verify the hostname, port, database name, username, and password.
- Confirm that the hosted database permits connections from your application.

### `ModuleNotFoundError`

Install the dependencies:

```bash
python -m pip install -r requirements.txt
```

### `uvicorn` is not recognized

Try:

```bash
python -m uvicorn main:app --reload
```

### Page returns `404 Not Found`

- Check that the requested route exists in `main.py`.
- Ensure the HTML file is in the `static/` directory.
- Confirm that the FastAPI application mounts the static directory correctly.

### API returns a database error

- Confirm that `student_db` exists.
- Check that the `students` table and its columns match the SQL queries in `main.py`.
- Verify the database credentials used by the running application.

### Deployment fails

- Review the hosting service's build and runtime logs.
- Check that `requirements.txt` is present.
- Ensure the start command uses the correct module name.
- Verify that production environment variables are configured.

## Future Improvements

Potential enhancements include:

- Student authentication and role-based access control.
- Pagination for large student lists.
- Export student records to CSV or Excel.
- Improved input validation and error handling.
- Automated database backups.
- Unit and integration testing.
- Logging and monitoring.
- Deployment using Docker.

## Author

**Jeenal Shah**

Student project demonstrating Python backend development, REST API design, relational database integration, and frontend development.

## License

This project is intended for educational and learning purposes. Add a license file if you plan to distribute or reuse the project publicly.
