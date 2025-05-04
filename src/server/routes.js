const { check, validationResult } = require('express-validator');
const { User, Course, Review, Team } = require('./models');
const { authenticateJWT, instructorAuth, registerUser, loginUser } = require('./auth');

/**
 * Setup all routes for the application
 * @param {Express} app - Express application
 */
const setupRoutes = (app) => {
  const db = app.locals.db;
  
  /**
   * @route   POST api/auth/register
   * @desc    Register user
   * @access  Public
   */
  app.post(
    '/api/auth/register',
    [
      check('first_name', 'First name is required').not().isEmpty(),
      check('last_name', 'Last name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
      check('role', 'Role must be either student or instructor').isIn(['student', 'instructor'])
    ],
    async (req, res) => {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      try {
        const { first_name, middle_name, last_name, email, password, phone_number, discord_id, teams_id, role } = req.body;
        
        const userData = {
          first_name,
          middle_name: middle_name || null,
          last_name,
          email,
          password,
          phone_number: phone_number || null,
          discord_id: discord_id || null,
          teams_id: teams_id || null,
          role
        };
        
        const result = await registerUser(db, userData);
        res.json(result);
      } catch (error) {
        console.error('Registration error:', error.message);
        res.status(400).json({ message: error.message });
      }
    }
  );
  
  /**
   * @route   POST api/auth/login
   * @desc    Authenticate user & get token
   * @access  Public
   */
  app.post(
    '/api/auth/login',
    [
      check('email', 'Please include a valid email').isEmail(),
      check('password', 'Password is required').exists()
    ],
    async (req, res) => {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      try {
        const { email, password } = req.body;
        const result = await loginUser(db, email, password);
        res.json(result);
      } catch (error) {
        console.error('Login error:', error.message);
        res.status(400).json({ message: error.message });
      }
    }
  );
  
  /**
   * @route   GET api/auth/user
   * @desc    Get user data
   * @access  Private
   */
  app.get('/api/auth/user', authenticateJWT, async (req, res) => {
    try {
      const user = await User.findById(db, req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Don't return password
      delete user.password;
      
      res.json(user);
    } catch (error) {
      console.error('Get user error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  /**
   * INSTRUCTOR ROUTES
   */
  
  /**
   * @route   POST api/courses
   * @desc    Create a new course
   * @access  Private (Instructor only)
   */
  app.post(
    '/api/courses',
    [
      authenticateJWT,
      instructorAuth,
      [
        check('title', 'Title is required').not().isEmpty(),
        check('code', 'Course code is required').not().isEmpty()
      ]
    ],
    async (req, res) => {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      try {
        const { title, description, code } = req.body;
        
        // Check if course code already exists
        const existingCourse = await Course.findByCode(db, code);
        if (existingCourse) {
          return res.status(400).json({ message: 'Course code already exists' });
        }
        
        const courseData = {
          title,
          description: description || '',
          code,
          instructor_id: req.user.id
        };
        
        const course = await Course.create(db, courseData);
        res.json(course);
      } catch (error) {
        console.error('Create course error:', error.message);
        res.status(500).json({ message: 'Server error' });
      }
    }
  );
  
  /**
   * @route   GET api/courses
   * @desc    Get all courses for instructor
   * @access  Private (Instructor only)
   */
  app.get('/api/courses', authenticateJWT, instructorAuth, async (req, res) => {
    try {
      const courses = await Course.findByInstructor(db, req.user.id);
      res.json(courses);
    } catch (error) {
      console.error('Get courses error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  /**
   * @route   POST api/courses/:id/enroll
   * @desc    Enroll students in a course (by email or code)
   * @access  Private (Instructor only)
   */
  app.post(
    '/api/courses/:id/enroll',
    [
      authenticateJWT,
      instructorAuth,
      [
        check('emails', 'Emails are required').isArray().optional(),
        check('code', 'Code is required').optional()
      ]
    ],
    async (req, res) => {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      try {
        const courseId = req.params.id;
        
        // Check if course exists and belongs to instructor
        const course = await Course.findById(db, courseId);
        if (!course) {
          return res.status(404).json({ message: 'Course not found' });
        }
        
        if (course.instructor_id !== req.user.id) {
          return res.status(403).json({ message: 'Not authorized' });
        }
        
        const results = { success: [], failed: [] };
        
        // Enroll by email
        if (req.body.emails && req.body.emails.length > 0) {
          for (const email of req.body.emails) {
            try {
              const student = await User.findByEmail(db, email);
              
              if (!student) {
                results.failed.push({ email, reason: 'User not found' });
                continue;
              }
              
              if (student.role !== 'student') {
                results.failed.push({ email, reason: 'User is not a student' });
                continue;
              }
              
              await Course.enrollStudent(db, courseId, student.id);
              results.success.push(email);
            } catch (error) {
              results.failed.push({ email, reason: error.message });
            }
          }
        }
        
        res.json(results);
      } catch (error) {
        console.error('Enroll students error:', error.message);
        res.status(500).json({ message: 'Server error' });
      }
    }
  );
  
  /**
   * @route   POST api/courses/:id/teams
   * @desc    Create a team for a course
   * @access  Private (Instructor only)
   */
  app.post(
    '/api/courses/:id/teams',
    [
      authenticateJWT,
      instructorAuth,
      [
        check('name', 'Team name is required').not().isEmpty(),
        check('studentIds', 'Student IDs are required').isArray()
      ]
    ],
    async (req, res) => {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      try {
        const courseId = req.params.id;
        
        // Check if course exists and belongs to instructor
        const course = await Course.findById(db, courseId);
        if (!course) {
          return res.status(404).json({ message: 'Course not found' });
        }
        
        if (course.instructor_id !== req.user.id) {
          return res.status(403).json({ message: 'Not authorized' });
        }
        
        const { name, studentIds } = req.body;
        
        // Create team
        const team = await Team.create(db, { name, course_id: courseId });
        
        // Add members to team
        const results = { success: [], failed: [] };
        
        for (const studentId of studentIds) {
          try {
            // Check if student is enrolled in course
            const students = await Course.getStudents(db, courseId);
            const studentExists = students.some(s => s.id === studentId);
            
            if (!studentExists) {
              results.failed.push({ studentId, reason: 'Student not enrolled in course' });
              continue;
            }
            
            await Team.addMember(db, team.id, studentId);
            results.success.push(studentId);
          } catch (error) {
            results.failed.push({ studentId, reason: error.message });
          }
        }
        
        res.json({
          team,
          members: results
        });
      } catch (error) {
        console.error('Create team error:', error.message);
        res.status(500).json({ message: 'Server error' });
      }
    }
  );
  
  /**
   * @route   POST api/reviews/templates
   * @desc    Create a review template
   * @access  Private (Instructor only)
   */
  app.post(
    '/api/reviews/templates',
    [
      authenticateJWT,
      instructorAuth,
      [
        check('title', 'Title is required').not().isEmpty(),
        check('courseId', 'Course ID is required').not().isEmpty(),
        check('questions', 'Questions are required').isArray({ min: 1 })
      ]
    ],
    async (req, res) => {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      try {
        const { title, description, courseId, questions } = req.body;
        
        // Check if course exists and belongs to instructor
        const course = await Course.findById(db, courseId);
        if (!course) {
          return res.status(404).json({ message: 'Course not found' });
        }
        
        if (course.instructor_id !== req.user.id) {
          return res.status(403).json({ message: 'Not authorized' });
        }
        
        // Create template
        const template = await Review.createTemplate(db, {
          title,
          description: description || '',
          instructor_id: req.user.id,
          course_id: courseId
        });
        
        // Add questions
        const questionResults = [];
        
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          
          // Validate question type
          if (!['likert', 'multiple_choice', 'short_answer'].includes(q.type)) {
            return res.status(400).json({ message: `Invalid question type for question ${i+1}` });
          }
          
          // Validate options for multiple choice
          if (q.type === 'multiple_choice' && (!q.options || !Array.isArray(q.options) || q.options.length < 2)) {
            return res.status(400).json({ message: `Multiple choice question ${i+1} must have at least 2 options` });
          }
          
          const question = await Review.addQuestion(db, {
            template_id: template.id,
            question_text: q.text,
            question_type: q.type,
            options: q.options,
            required: q.required !== false, // Default to true
            order_num: i + 1
          });
          
          questionResults.push(question);
        }
        
        res.json({
          template,
          questions: questionResults
        });
      } catch (error) {
        console.error('Create review template error:', error.message);
        res.status(500).json({ message: 'Server error' });
      }
    }
  );
  
  /**
   * @route   POST api/reviews
   * @desc    Create and schedule a review
   * @access  Private (Instructor only)
   */
  app.post(
    '/api/reviews',
    [
      authenticateJWT,
      instructorAuth,
      [
        check('title', 'Title is required').not().isEmpty(),
        check('templateId', 'Template ID is required').not().isEmpty(),
        check('courseId', 'Course ID is required').not().isEmpty(),
        check('dueDate', 'Due date is required').not().isEmpty(),
        check('assignments', 'Assignments are required').isArray({ min: 1 })
      ]
    ],
    async (req, res) => {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      try {
        const { title, description, templateId, courseId, dueDate, assignments } = req.body;
        
        // Check if course exists and belongs to instructor
        const course = await Course.findById(db, courseId);
        if (!course) {
          return res.status(404).json({ message: 'Course not found' });
        }
        
        if (course.instructor_id !== req.user.id) {
          return res.status(403).json({ message: 'Not authorized' });
        }
        
        // Create review
        const review = await Review.createReview(db, {
          title,
          description: description || '',
          template_id: templateId,
          course_id: courseId,
          due_date: dueDate
        });
        
        // Create assignments
        const assignmentResults = [];
        
        for (const assignment of assignments) {
          try {
            const result = await Review.assignReview(db, {
              review_id: review.id,
              reviewer_id: assignment.reviewerId,
              reviewee_id: assignment.revieweeId
            });
            
            assignmentResults.push(result);
          } catch (error) {
            console.error('Assignment error:', error.message);
            // Continue with other assignments even if one fails
          }
        }
        
        res.json({
          review,
          assignments: assignmentResults
        });
      } catch (error) {
        console.error('Create review error:', error.message);
        res.status(500).json({ message: 'Server error' });
      }
    }
  );
  
  /**
   * @route   GET api/reviews/instructor
   * @desc    Get all reviews created by instructor
   * @access  Private (Instructor only)
   */
  app.get('/api/reviews/instructor', authenticateJWT, instructorAuth, async (req, res) => {
    try {
      // Get all templates created by instructor
      const templates = await new Promise((resolve, reject) => {
        db.all(
          `SELECT rt.*, c.title as course_title
           FROM review_templates rt
           JOIN courses c ON rt.course_id = c.id
           WHERE rt.instructor_id = ?`,
          [req.user.id],
          (err, rows) => {
            if (err) reject(err);
            resolve(rows);
          }
        );
      });
      
      // Get all reviews using these templates
      const reviews = await new Promise((resolve, reject) => {
        db.all(
          `SELECT r.*, c.title as course_title, rt.title as template_title,
                  COUNT(ra.id) as assignment_count, 
                  SUM(CASE WHEN ra.status = 'completed' THEN 1 ELSE 0 END) as completed_count
           FROM reviews r
           JOIN review_templates rt ON r.template_id = rt.id
           JOIN courses c ON r.course_id = c.id
           LEFT JOIN review_assignments ra ON r.id = ra.review_id
           WHERE rt.instructor_id = ?
           GROUP BY r.id`,
          [req.user.id],
          (err, rows) => {
            if (err) reject(err);
            resolve(rows);
          }
        );
      });
      
      res.json({
        templates,
        reviews
      });
    } catch (error) {
      console.error('Get instructor reviews error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  /**
   * @route   GET api/reviews/:id/results
   * @desc    Get results for a specific review
   * @access  Private (Instructor only)
   */
  app.get('/api/reviews/:id/results', authenticateJWT, instructorAuth, async (req, res) => {
    try {
      const reviewId = req.params.id;
      
      // Check if review exists and belongs to instructor
      const review = await new Promise((resolve, reject) => {
        db.get(
          `SELECT r.*, c.title as course_title, rt.title as template_title, rt.instructor_id
           FROM reviews r
           JOIN review_templates rt ON r.template_id = rt.id
           JOIN courses c ON r.course_id = c.id
           WHERE r.id = ?`,
          [reviewId],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });
      
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      
      if (review.instructor_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      // Get review results
      const results = await new Promise((resolve, reject) => {
        db.all(
          `SELECT u.first_name || ' ' || u.last_name as reviewee_name, u.id as reviewee_id,
                  COUNT(ra.id) as total_reviews,
                  SUM(CASE WHEN ra.status = 'completed' THEN 1 ELSE 0 END) as completed_reviews,
                  AVG(CASE WHEN q.question_type = 'likert' THEN CAST(res.response_value AS REAL) ELSE NULL END) as avg_score
           FROM review_assignments ra
           JOIN users u ON ra.reviewee_id = u.id
           LEFT JOIN responses res ON ra.id = res.assignment_id
           LEFT JOIN questions q ON res.question_id = q.id
           WHERE ra.review_id = ?
           GROUP BY ra.reviewee_id`,
          [reviewId],
          (err, rows) => {
            if (err) reject(err);
            resolve(rows);
          }
        );
      });
      
      // Convert scores to 100-point scale
      const processedResults = results.map(result => ({
        ...result,
        score: result.avg_score ? Math.round(result.avg_score * 20) : null // Convert 5-point scale to 100-point
      }));
      
      res.json({
        review,
        results: processedResults
      });
    } catch (error) {
      console.error('Get review results error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  /**
   * STUDENT ROUTES
   */
  
  /**
   * @route   GET api/courses/student
   * @desc    Get all courses for student
   * @access  Private
   */
  app.get('/api/courses/student', authenticateJWT, async (req, res) => {
    try {
      // Check if user is a student
      if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      // Get all courses student is enrolled in
      const courses = await new Promise((resolve, reject) => {
        db.all(
          `SELECT c.*, u.first_name || ' ' || u.last_name as instructor_name
           FROM courses c
           JOIN enrollments e ON c.id = e.course_id
           JOIN users u ON c.instructor_id = u.id
           WHERE e.student_id = ?`,
          [req.user.id],
          (err, rows) => {
            if (err) reject(err);
            resolve(rows);
          }
        );
      });
      
      res.json(courses);
    } catch (error) {
      console.error('Get student courses error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  /**
   * @route   GET api/reviews/pending
   * @desc    Get all pending reviews for student
   * @access  Private
   */
  app.get('/api/reviews/pending', authenticateJWT, async (req, res) => {
    try {
      // Check if user is a student
      if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const pendingReviews = await Review.getPendingReviews(db, req.user.id);
      res.json(pendingReviews);
    } catch (error) {
      console.error('Get pending reviews error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  /**
   * @route   GET api/reviews/assignments/:id
   * @desc    Get review assignment details
   * @access  Private
   */
  app.get('/api/reviews/assignments/:id', authenticateJWT, async (req, res) => {
    try {
      const assignmentId = req.params.id;
      
      // Get assignment
      const assignment = await new Promise((resolve, reject) => {
        db.get(
          `SELECT ra.*, r.title as review_title, r.description as review_description, 
                  u.first_name || ' ' || u.last_name as reviewee_name
           FROM review_assignments ra
           JOIN reviews r ON ra.review_id = r.id
           JOIN users u ON ra.reviewee_id = u.id
           WHERE ra.id = ?`,
          [assignmentId],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });
      
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
      
      // Check if user is the reviewer
      if (assignment.reviewer_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      // Get questions for this assignment
      const questions = await new Promise((resolve, reject) => {
        db.all(
          `SELECT q.*
           FROM questions q
           JOIN review_templates rt ON q.template_id = rt.id
           JOIN reviews r ON rt.id = r.template_id
           JOIN review_assignments ra ON r.id = ra.review_id
           WHERE ra.id = ?
           ORDER BY q.order_num`,
          [assignmentId],
          (err, rows) => {
            if (err) reject(err);
            
            // Parse options for multiple choice questions
            const processedRows = rows.map(row => {
              if (row.options && row.question_type === 'multiple_choice') {
                try {
                  row.options = JSON.parse(row.options);
                } catch (e) {
                  // Keep as is if parsing fails
                }
              }
              return row;
            });
            
            resolve(processedRows);
          }
        );
      });
      
      res.json({
        assignment,
        questions
      });
    } catch (error) {
      console.error('Get assignment error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  /**
   * @route   POST api/reviews/assignments/:id/submit
   * @desc    Submit responses for a review assignment
   * @access  Private
   */
  app.post(
    '/api/reviews/assignments/:id/submit',
    [
      authenticateJWT,
      [
        check('responses', 'Responses are required').isArray({ min: 1 })
      ]
    ],
    async (req, res) => {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      try {
        const assignmentId = req.params.id;
        
        // Get assignment
        const assignment = await new Promise((resolve, reject) => {
          db.get(
            'SELECT * FROM review_assignments WHERE id = ?',
            [assignmentId],
            (err, row) => {
              if (err) reject(err);
              resolve(row);
            }
          );
        });
        
        if (!assignment) {
          return res.status(404).json({ message: 'Assignment not found' });
        }
        
        // Check if user is the reviewer
        if (assignment.reviewer_id !== req.user.id) {
          return res.status(403).json({ message: 'Not authorized' });
        }
        
        // Check if assignment is already completed
        if (assignment.status === 'completed') {
          return res.status(400).json({ message: 'Assignment already completed' });
        }
        
        const { responses } = req.body;
        
        // Validate required questions
        const questions = await new Promise((resolve, reject) => {
          db.all(
            `SELECT q.*
             FROM questions q
             JOIN review_templates rt ON q.template_id = rt.id
             JOIN reviews r ON rt.id = r.template_id
             JOIN review_assignments ra ON r.id = ra.review_id
             WHERE ra.id = ?`,
            [assignmentId],
            (err, rows) => {
              if (err) reject(err);
              resolve(rows);
            }
          );
        });
        
        // Check required questions
        const requiredQuestionIds = questions
          .filter(q => q.required)
          .map(q => q.id);
        
        const responseQuestionIds = responses.map(r => r.questionId);
        
        const missingRequired = requiredQuestionIds.filter(id => !responseQuestionIds.includes(id));
        
        if (missingRequired.length > 0) {
          return res.status(400).json({ 
            message: 'Missing responses for required questions',
            missingQuestions: missingRequired
          });
        }
        
        // Save responses
        const responseResults = [];
        
        for (const response of responses) {
          try {
            const result = await Review.submitResponse(db, {
              assignment_id: assignmentId,
              question_id: response.questionId,
              response_value: response.value,
              is_private: response.isPrivate || false
            });
            
            responseResults.push(result);
          } catch (error) {
            console.error('Response error:', error.message);
            // Continue with other responses even if one fails
          }
        }
        
        // Mark assignment as completed
        await Review.completeAssignment(db, assignmentId);
        
        res.json({
          message: 'Review submitted successfully',
          responses: responseResults
        });
      } catch (error) {
        console.error('Submit review error:', error.message);
        res.status(500).json({ message: 'Server error' });
      }
    }
  );
  
  /**
   * @route   GET api/reviews/results/student
   * @desc    Get review results for student
   * @access  Private
   */
  app.get('/api/reviews/results/student', authenticateJWT, async (req, res) => {
    try {
      // Check if user is a student
      if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const reviewResults = await Review.getReviewResults(db, req.user.id);
      
      // Convert scores to 100-point scale
      const processedResults = reviewResults.map(result => ({
        ...result,
        score: result.avg_score ? Math.round(result.avg_score * 20) : null // Convert 5-point scale to 100-point
      }));
      
      // Get public feedback
      const feedback = await new Promise((resolve, reject) => {
        db.all(
          `SELECT r.title as review_title, q.question_text, res.response_value
           FROM responses res
           JOIN review_assignments ra ON res.assignment_id = ra.id
           JOIN reviews r ON ra.review_id = r.id
           JOIN questions q ON res.question_id = q.id
           WHERE ra.reviewee_id = ? AND res.is_private = 0 AND q.question_type = 'short_answer'`,
          [req.user.id],
          (err, rows) => {
            if (err) reject(err);
            resolve(rows);
          }
        );
      });
      
      res.json({
        results: processedResults,
        feedback
      });
    } catch (error) {
      console.error('Get student results error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  /**
   * @route   POST api/courses/enroll/:code
   * @desc    Enroll in a course by code
   * @access  Private
   */
  app.post('/api/courses/enroll/:code', authenticateJWT, async (req, res) => {
    try {
      // Check if user is a student
      if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Only students can enroll in courses' });
      }
      
      const courseCode = req.params.code;
      
      // Find course by code
      const course = await Course.findByCode(db, courseCode);
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      // Check if already enrolled
      const isEnrolled = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM enrollments WHERE course_id = ? AND student_id = ?',
          [course.id, req.user.id],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });
      
      if (isEnrolled) {
        return res.status(400).json({ message: 'Already enrolled in this course' });
      }
      
      // Enroll student
      await Course.enrollStudent(db, course.id, req.user.id);
      
      res.json({
        message: 'Successfully enrolled in course',
        course
      });
    } catch (error) {
      console.error('Enroll in course error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

module.exports = { setupRoutes };