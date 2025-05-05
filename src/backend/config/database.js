// Database configuration
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Setup database schema function from your existing code
const setupDatabase = () => {
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

// Export both the database connection and setup function
module.exports = {
  db,
  setupDatabase
};