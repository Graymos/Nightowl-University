const { db } = require('../config/database');

class Course {
    constructor(id, name, description, instructor_id) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.instructor_id = instructor_id;
    }

    // Get all students enrolled in a course
    static async getEnrolledStudents(courseId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT u.id, u.first_name, u.last_name, u.email
                FROM users u
                JOIN enrollments e ON u.id = e.student_id
                WHERE e.course_id = ?
                ORDER BY u.last_name, u.first_name
            `;
            db.all(query, [courseId], (err, students) => {
                if (err) {
                    console.error('Error getting enrolled students:', err);
                    reject(err);
                } else {
                    resolve(students);
                }
            });
        });
    }

    // Get student count for a course
    static async getStudentCount(courseId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT COUNT(*) as count
                FROM enrollments
                WHERE course_id = ?
            `;
            db.get(query, [courseId], (err, result) => {
                if (err) {
                    console.error('Error getting student count:', err);
                    reject(err);
                } else {
                    resolve(result ? result.count : 0);
                }
            });
        });
    }

    // Add a student to a course
    static async addStudent(courseId, studentId) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO enrollments (course_id, student_id)
                VALUES (?, ?)
            `;
            db.run(query, [courseId, studentId], function(err) {
                if (err) {
                    console.error('Error adding student to course:', err);
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    // Remove a student from a course
    static async removeStudent(courseId, studentId) {
        return new Promise((resolve, reject) => {
            const query = `
                DELETE FROM enrollments
                WHERE course_id = ? AND student_id = ?
            `;
            db.run(query, [courseId, studentId], function(err) {
                if (err) {
                    console.error('Error removing student from course:', err);
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    // Find course by ID
    static async findById(id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT c.*, 
                       (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as student_count,
                       (SELECT COUNT(*) FROM teams WHERE course_id = c.id) as team_count
                FROM courses c
                WHERE c.id = ?
            `;
            db.get(query, [id], (err, course) => {
                if (err) {
                    console.error('Error finding course:', err);
                    reject(err);
                } else {
                    resolve(course);
                }
            });
        });
    }

    // Find courses by instructor
    static async findByInstructor(instructorId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT c.*, 
                       (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as student_count,
                       (SELECT COUNT(*) FROM teams WHERE course_id = c.id) as team_count
                FROM courses c
                WHERE c.instructor_id = ?
                ORDER BY c.created_at DESC
            `;
            db.all(query, [instructorId], (err, courses) => {
                if (err) {
                    console.error('Error finding instructor courses:', err);
                    reject(err);
                } else {
                    resolve(courses);
                }
            });
        });
    }
}

module.exports = Course; 