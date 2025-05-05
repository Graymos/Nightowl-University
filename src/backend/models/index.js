// Models for database operations
const { db } = require('../config/database');

// User model functions
const User = {
  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  },

  create: (userData) => {
    return new Promise((resolve, reject) => {
      const { first_name, middle_name, last_name, email, password, phone_number, discord_id, teams_id, role } = userData;
      db.run(
        `INSERT INTO users (first_name, middle_name, last_name, email, password, phone_number, discord_id, teams_id, role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [first_name, middle_name || null, last_name, email, password, phone_number || null, discord_id || null, teams_id || null, role],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, ...userData });
        }
      );
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, first_name, middle_name, last_name, email, phone_number, discord_id, teams_id, role, created_at FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }
};

// Course model functions
const Course = {
  create: (courseData) => {
    return new Promise((resolve, reject) => {
      const { title, description, code, instructor_id } = courseData;
      db.run(
        'INSERT INTO courses (title, description, code, instructor_id) VALUES (?, ?, ?, ?)',
        [title, description || null, code, instructor_id],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, ...courseData });
        }
      );
    });
  },

  findByInstructor: (instructorId) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT c.*, 
          (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as student_count,
          (SELECT COUNT(*) FROM teams WHERE course_id = c.id) as team_count
        FROM courses c 
        WHERE c.instructor_id = ?`,
        [instructorId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM courses WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  },

  findByCode: (code) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM courses WHERE code = ?', [code], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  },

  getEnrolledStudents: (courseId) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT u.id, u.first_name, u.last_name, u.email
         FROM users u
         JOIN enrollments e ON u.id = e.student_id
         WHERE e.course_id = ?
         ORDER BY u.last_name, u.first_name`,
        [courseId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  },

  addStudent: (courseId, studentId) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO enrollments (course_id, student_id) VALUES (?, ?)',
        [courseId, studentId],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, course_id: courseId, student_id: studentId });
        }
      );
    });
  },

  removeStudent: (courseId, studentId) => {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM enrollments WHERE course_id = ? AND student_id = ?',
        [courseId, studentId],
        function(err) {
          if (err) reject(err);
          resolve({ course_id: courseId, student_id: studentId });
        }
      );
    });
  }
};

// Review model functions
const Review = {
  createTemplate: (templateData) => {
    return new Promise((resolve, reject) => {
      const { title, description, instructor_id, course_id } = templateData;
      db.run(
        'INSERT INTO review_templates (title, description, instructor_id, course_id) VALUES (?, ?, ?, ?)',
        [title, description || null, instructor_id, course_id],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, ...templateData });
        }
      );
    });
  },

  addQuestion: (questionData) => {
    return new Promise((resolve, reject) => {
      const { template_id, question_text, question_type, options, required, order_num } = questionData;
      const optionsJson = options ? JSON.stringify(options) : null;

      db.run(
        'INSERT INTO questions (template_id, question_text, question_type, options, required, order_num) VALUES (?, ?, ?, ?, ?, ?)',
        [template_id, question_text, question_type, optionsJson, required ? 1 : 0, order_num],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, ...questionData, options: options });
        }
      );
    });
  },

  createReview: (reviewData) => {
    return new Promise((resolve, reject) => {
      const { template_id, title, description, due_date, course_id } = reviewData;
      db.run(
        'INSERT INTO reviews (template_id, title, description, due_date, course_id) VALUES (?, ?, ?, ?, ?)',
        [template_id, title, description || null, due_date, course_id],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, ...reviewData });
        }
      );
    });
  },

  assignReview: (assignmentData) => {
    return new Promise((resolve, reject) => {
      const { review_id, reviewer_id, reviewee_id } = assignmentData;
      db.run(
        'INSERT INTO review_assignments (review_id, reviewer_id, reviewee_id) VALUES (?, ?, ?)',
        [review_id, reviewer_id, reviewee_id],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, ...assignmentData, status: 'pending' });
        }
      );
    });
  },

  submitResponse: (responseData) => {
    return new Promise((resolve, reject) => {
      const { assignment_id, question_id, response_value, is_private } = responseData;
      db.run(
        'INSERT INTO responses (assignment_id, question_id, response_value, is_private) VALUES (?, ?, ?, ?)',
        [assignment_id, question_id, response_value, is_private ? 1 : 0],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, ...responseData });
        }
      );
    });
  },

  completeAssignment: (assignmentId) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE review_assignments SET status = "completed", completed_at = CURRENT_TIMESTAMP WHERE id = ?',
        [assignmentId],
        function(err) {
          if (err) reject(err);
          resolve({ id: assignmentId, status: 'completed' });
        }
      );
    });
  },

  getPendingReviews: (studentId) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT ra.id as assignment_id, r.id as review_id, r.title, r.description, r.due_date,
        c.title as course_title, u.first_name || ' ' || u.last_name as reviewee_name
        FROM review_assignments ra
        JOIN reviews r ON ra.review_id = r.id
        JOIN courses c ON r.course_id = c.id
        JOIN users u ON ra.reviewee_id = u.id
        WHERE ra.reviewer_id = ? AND ra.status = 'pending' AND r.due_date > CURRENT_TIMESTAMP`,
        [studentId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  },

  getReviewResults: (studentId) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT r.title as review_title, c.title as course_title,
        COUNT(ra.id) as total_reviews,
        AVG(CASE WHEN q.question_type = 'likert' THEN CAST(res.response_value AS REAL) ELSE NULL END) as avg_score
        FROM reviews r
        JOIN review_assignments ra ON r.id = ra.review_id
        JOIN responses res ON ra.id = res.assignment_id
        JOIN questions q ON res.question_id = q.id
        JOIN courses c ON r.course_id = c.id
        WHERE ra.reviewee_id = ? AND ra.status = 'completed'
        GROUP BY r.id`,
        [studentId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }
};

// Team model functions
const Team = {
  create: (teamData) => {
    return new Promise((resolve, reject) => {
      const { name, course_id } = teamData;
      db.run(
        'INSERT INTO teams (name, course_id) VALUES (?, ?)',
        [name, course_id],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, ...teamData });
        }
      );
    });
  },

  addMember: (teamId, studentId) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO team_members (team_id, student_id) VALUES (?, ?)',
        [teamId, studentId],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, team_id: teamId, student_id: studentId });
        }
      );
    });
  },

  getTeamMembers: (teamId) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT u.id, u.first_name, u.middle_name, u.last_name, u.email
        FROM users u
        JOIN team_members tm ON u.id = tm.student_id
        WHERE tm.team_id = ?`,
        [teamId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  },

  getTeamsForCourse: (courseId) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM teams WHERE course_id = ?',
        [courseId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }
};

module.exports = {
  User,
  Course,
  Review,
  Team
};