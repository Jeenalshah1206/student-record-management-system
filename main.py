from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import mysql.connector

app = FastAPI(title="Student Record System")

# -------------------- STATIC FILES --------------------

app.mount("/static", StaticFiles(directory="static"), name="static")


# -------------------- DIFFERENT WEB PAGES --------------------

@app.get("/", include_in_schema=False)
def home_page():
    return FileResponse("static/index.html")


@app.get("/ui", include_in_schema=False)
def dashboard_page():
    return FileResponse("static/index.html")


@app.get("/view", include_in_schema=False)
def view_page():
    return FileResponse("static/view.html")


@app.get("/add", include_in_schema=False)
def add_page():
    return FileResponse("static/add.html")


@app.get("/search", include_in_schema=False)
def search_page():
    return FileResponse("static/search.html")


@app.get("/update", include_in_schema=False)
def update_page():
    return FileResponse("static/update.html")


@app.get("/delete", include_in_schema=False)
def delete_page():
    return FileResponse("static/delete.html")


# -------------------- MYSQL DATABASE CONNECTION --------------------

def get_connection():
    try:
        return mysql.connector.connect(
            host="localhost",
            user="root",
            password="root",
            database="student_db"
        )
    except mysql.connector.Error as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {str(e)}"
        )


# -------------------- STUDENT DATA VALIDATION --------------------

class Student(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    age: int = Field(gt=0, le=120)
    course: str = Field(min_length=1, max_length=100)
    marks: float = Field(ge=0, le=100)


# -------------------- API HOME --------------------

@app.get("/api")
def api_home():
    return {"message": "Welcome to Student Record System API"}


# -------------------- READ: GET ALL STUDENTS --------------------

@app.get("/students")
def get_students():
    con = get_connection()
    cur = None

    try:
        cur = con.cursor(dictionary=True)
        cur.execute("SELECT * FROM students ORDER BY id DESC")
        return cur.fetchall()

    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if cur:
            cur.close()
        con.close()


# -------------------- READ: GET STUDENT BY ID --------------------

@app.get("/students/{student_id}")
def get_student(student_id: int):
    con = get_connection()
    cur = None

    try:
        cur = con.cursor(dictionary=True)
        cur.execute(
            "SELECT * FROM students WHERE id = %s",
            (student_id,)
        )
        student = cur.fetchone()

        if student is None:
            raise HTTPException(
                status_code=404,
                detail="Student not found"
            )

        return student

    except HTTPException:
        raise

    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if cur:
            cur.close()
        con.close()


# -------------------- CREATE: ADD A STUDENT --------------------

@app.post("/students", status_code=201)
def add_student(student: Student):
    con = get_connection()
    cur = None

    try:
        cur = con.cursor()

        query = """
            INSERT INTO students (name, age, course, marks)
            VALUES (%s, %s, %s, %s)
        """

        values = (
            student.name.strip(),
            student.age,
            student.course.strip(),
            student.marks
        )

        cur.execute(query, values)
        con.commit()

        student_id = cur.lastrowid

        return {
            "message": "Student added successfully",
            "id": student_id,
            **student.model_dump()
        }

    except mysql.connector.Error as e:
        con.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if cur:
            cur.close()
        con.close()


# -------------------- UPDATE: UPDATE A STUDENT --------------------

@app.put("/students/{student_id}")
def update_student(student_id: int, student: Student):
    con = get_connection()
    cur = None

    try:
        cur = con.cursor()

        cur.execute(
            """
            UPDATE students
            SET name = %s, age = %s, course = %s, marks = %s
            WHERE id = %s
            """,
            (
                student.name.strip(),
                student.age,
                student.course.strip(),
                student.marks,
                student_id
            )
        )

        if cur.rowcount == 0:
            cur.execute(
                "SELECT id FROM students WHERE id = %s",
                (student_id,)
            )

            if cur.fetchone() is None:
                raise HTTPException(
                    status_code=404,
                    detail="Student not found"
                )

        con.commit()

        return {
            "message": "Student updated successfully",
            "id": student_id,
            **student.model_dump()
        }

    except HTTPException:
        con.rollback()
        raise

    except mysql.connector.Error as e:
        con.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if cur:
            cur.close()
        con.close()


# -------------------- DELETE: DELETE A STUDENT --------------------

@app.delete("/students/{student_id}")
def delete_student(student_id: int):
    con = get_connection()
    cur = None

    try:
        cur = con.cursor()

        cur.execute(
            "DELETE FROM students WHERE id = %s",
            (student_id,)
        )

        if cur.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Student not found"
            )

        con.commit()

        return {
            "message": "Student deleted successfully",
            "id": student_id
        }

    except HTTPException:
        con.rollback()
        raise

    except mysql.connector.Error as e:
        con.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if cur:
            cur.close()
        con.close()