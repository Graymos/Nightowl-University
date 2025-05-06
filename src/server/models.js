/**
 * Database models and schema setup
 */

const setupDatabase = (db) => {
    // Create Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      middle_name TEXT,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone_number TEXT,
      discord_id TEXT,
      teams_id TEXT,
      role TEXT NOT NULL CHECK(role IN ('student', 'instructor')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table ready');
      }
    });
  
    // Create Courses table
    db.run(`CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      code TEXT UNIQUE NOT NULL,
      instructor_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (instructor_id) REFERENCES users (id)
    )`, (err) => {
      if (err) {
        console.error('Error creating courses table:', err.message);
      } else {
        console.log('Courses table ready');
      }
    });
  
    // Create Enrollments table (for students in courses)
    db.run(`CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses (id),
      FOREIGN KEY (student_id) REFERENCES users (id),
      UNIQUE(course_id, student_id)
    )`, (err) => {
      if (err) {
        console.error('Error creating enrollments table:', err.message);
      } else {
        console.log('Enrollments table ready');
      }
    });
  
    // Create Teams table
    db.run(`CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      course_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses (id)
    )`, (err) => {
      if (err) {
        console.error('Error creating teams table:', err.message);
      } else {
        console.log('Teams table ready');
      }
    });
  
    // Create Team Members table
    db.run(`CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams (id),
      FOREIGN KEY (student_id) REFERENCES users (id),
      UNIQUE(team_id, student_id)
    )`, (err) => {
      if (err) {
        console.error('Error creating team_members table:', err.message);
      } else {
        console.log('Team Members table ready');
      }
    });
  
    // Create Review Templates table
    db.run(`CREATE TABLE IF NOT EXISTS review_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      instructor_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (instructor_id) REFERENCES users (id),
      FOREIGN KEY (course_id) REFERENCES courses (id)
    )`, (err) => {
      if (err) {
        console.error('Error creating review_templates table:', err.message);
      } else {
        console.log('Review Templates table ready');
      }
    });
  
    // Create Questions table
    db.run(`CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL CHECK(question_type IN ('likert', 'multiple_choice', 'short_answer')),
      options TEXT, -- JSON string for multiple_choice options
      required BOOLEAN DEFAULT 1,
      order_num INTEGER NOT NULL,
      FOREIGN KEY (template_id) REFERENCES review_templates (id)
    )`, (err) => {
      if (err) {
        console.error('Error creating questions table:', err.message);
      } else {
        console.log('Questions table ready');
      }
    });
  
    // Create Reviews table
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      due_date TIMESTAMP NOT NULL,
      course_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (template_id) REFERENCES review_templates (id),
      FOREIGN KEY (course_id) REFERENCES courses (id)
    )`, (err) => {
      if (err) {
        console.error('Error creating reviews table:', err.message);
      } else {
        console.log('Reviews table ready');
      }
    });
  
    // Create Review Assignments table
    db.run(`CREATE TABLE IF NOT EXISTS review_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      review_id INTEGER NOT NULL,
      reviewer_id INTEGER NOT NULL,
      reviewee_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed')),
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP,
      FOREIGN KEY (review_id) REFERENCES reviews (id),
      FOREIGN KEY (reviewer_id) REFERENCES users (id),
      FOREIGN KEY (reviewee_id) REFERENCES users (id)
    )`, (err) => {
      if (err) {
        console.error('Error creating review_assignments table:', err.message);
      } else {
        console.log('Review Assignments table ready');
      }
    });
  
    // Create Responses table
    db.run(`CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assignment_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      response_value TEXT NOT NULL,
      is_private BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignment_id) REFERENCES review_assignments (id),
      FOREIGN KEY (question_id) REFERENCES questions (id)
    )`, (err) => {
      if (err) {
        console.error('Error creating responses table:', err.message);
      } else {
        console.log('Responses table ready');
      }
    });
  };
  
  // Model functions for common database operations
  
  // User model functions
  const User = {
    findByEmail: (db, email) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });
    },
    
    create: (db, userData) => {
      return new Promise((resolve, reject) => {
        const { first_name, middle_name, last_name, email, password, phone_number, discord_id, teams_id, role } = userData;
        db.run(
          `INSERT INTO users (first_name, middle_name, last_name, email, password, phone_number, discord_id, teams_id, role) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [first_name, middle_name, last_name, email, password, phone_number, discord_id, teams_id, role],
          function(err) {
            if (err) reject(err);
            resolve({ id: this.lastID, ...userData });
          }
        );
      });
    },
    
    findById: (db, id) => {
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
    create: (db, courseData) => {
      return new Promise((resolve, reject) => {
        const { title, description, code, instructor_id } = courseData;
        db.run(
          'INSERT INTO courses (title, description, code, instructor_id) VALUES (?, ?, ?, ?)',
          [title, description, code, instructor_id],
          function(err) {
            if (err) reject(err);
            resolve({ id: this.lastID, ...courseData });
          }
        );
      });
    },
    
    findByInstructor: (db, instructorId) => {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM courses WHERE instructor_id = ?', [instructorId], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
    },
    
    findById: (db, id) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM courses WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });
    },
    
    findByCode: (db, code) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM courses WHERE code = ?', [code], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });
    },
    
    enrollStudent: (db, courseId, studentId) => {
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
    
    getStudents: (db, courseId) => {
      return new Promise((resolve, reject) => {
        db.all(
          `SELECT u.id, u.first_name, u.middle_name, u.last_name, u.email, u.phone_number, u.discord_id, u.teams_id
           FROM users u
           JOIN enrollments e ON u.id = e.student_id
           WHERE e.course_id = ? AND u.role = 'student'`,
          [courseId],
          (err, rows) => {
            if (err) reject(err);
            resolve(rows);
          }
        );
      });
    }
  };
  
  // Review model functions
  const Review = {
    createTemplate: (db, templateData) => {
      return new Promise((resolve, reject) => {
        const { title, description, instructor_id, course_id } = templateData;
        db.run(
          'INSERT INTO review_templates (title, description, instructor_id, course_id) VALUES (?, ?, ?, ?)',
          [title, description, instructor_id, course_id],
          function(err) {
            if (err) reject(err);
            resolve({ id: this.lastID, ...templateData });
          }
        );
      });
    },
    
    addQuestion: (db, questionData) => {
      return new Promise((resolve, reject) => {
        const { template_id, question_text, question_type, options, required, order_num } = questionData;
        const optionsJson = options ? JSON.stringify(options) : null;
        
        db.run(
          'INSERT INTO questions (template_id, question_text, question_type, options, required, order_num) VALUES (?, ?, ?, ?, ?, ?)',
          [template_id, question_text, question_type, optionsJson, required, order_num],
          function(err) {
            if (err) reject(err);
            resolve({ id: this.lastID, ...questionData, options: optionsJson });
          }
        );
      });
    },
    
    createReview: (db, reviewData) => {
      return new Promise((resolve, reject) => {
        const { template_id, title, description, due_date, course_id } = reviewData;
        db.run(
          'INSERT INTO reviews (template_id, title, description, due_date, course_id) VALUES (?, ?, ?, ?, ?)',
          [template_id, title, description, due_date, course_id],
          function(err) {
            if (err) reject(err);
            resolve({ id: this.lastID, ...reviewData });
          }
        );
      });
    },
    
    assignReview: (db, assignmentData) => {
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
    
    submitResponse: (db, responseData) => {
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
    
    completeAssignment: (db, assignmentId) => {
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
    
    getPendingReviews: (db, studentId) => {
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
    
    getReviewResults: (db, studentId) => {
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
    create: (db, teamData) => {
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
    
    addMember: (db, teamId, studentId) => {
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
    
    getTeamMembers: (db, teamId) => {
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
    
    getTeamsForCourse: (db, courseId) => {
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
    setupDatabase,
    User,
    Course,
    Review,
    Team
  };