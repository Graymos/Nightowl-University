// Course routes
const express = require('express');
const router = express.Router();
const { Course, User, Team } = require('../models');
const { authenticate, isInstructor } = require('../middleware/auth');

// Create a new course (instructor only)
router.post('/', authenticate, isInstructor, async (req, res) => {
  try {
    const { title, description, code } = req.body;
    const instructor_id = req.user.id;

    // Check if course code already exists
    const existingCourse = await Course.findByCode(code);
    if (existingCourse) {
      return res.status(400).json({ message: 'Course with this code already exists' });
    }

    // Create new course
    const newCourse = await Course.create({
      title,
      description,
      code,
      instructor_id
    });

    res.status(201).json({
      message: 'Course created successfully',
      course: newCourse
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Error creating course', error: error.message });
  }
});

// Get all courses for an instructor
router.get('/instructor', authenticate, isInstructor, async (req, res) => {
  try {
    const courses = await Course.findByInstructor(req.user.id);
    res.json({ courses });
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    res.status(500).json({ message: 'Error fetching instructor courses', error: error.message });
  }
});

// Get a specific course by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is instructor of this course or is enrolled
    const isInstructor = course.instructor_id === req.user.id;
    
    // If user is the instructor, include student list
    if (isInstructor) {
      const students = await Course.getEnrolledStudents(course.id);
      return res.json({ course, students });
    }

    res.json({ course });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Error fetching course', error: error.message });
  }
});

// Remove a student from a course (instructor only)
router.delete('/:id/students/:studentId', authenticate, isInstructor, async (req, res) => {
  try {
    const courseId = req.params.id;
    const studentId = req.params.studentId;

    // Check if course exists and instructor owns it
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.instructor_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this course' });
    }

    // Remove student from course
    await Course.removeStudent(courseId, studentId);
    
    res.json({ message: 'Student removed from course successfully' });
  } catch (error) {
    console.error('Error removing student from course:', error);
    res.status(500).json({ message: 'Error removing student from course', error: error.message });
  }
});

// Enroll a student in a course
router.post('/:id/enroll', authenticate, async (req, res) => {
  try {
    const courseId = req.params.id;
    const studentId = req.user.id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Enroll student
    await Course.enrollStudent(courseId, studentId);
    
    res.status(201).json({ message: 'Enrolled successfully in the course' });
  } catch (error) {
    // Handle duplicate enrollment
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Error enrolling in course', error: error.message });
  }
});

// Create a team for a course (instructor only)
router.post('/:id/teams', authenticate, isInstructor, async (req, res) => {
  try {
    const courseId = req.params.id;
    const { name, members } = req.body;

    // Check if course exists and instructor owns it
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.instructor_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to create teams for this course' });
    }

    // Create new team
    const newTeam = await Team.create({
      name,
      course_id: courseId
    });

    // Add team members if provided
    if (members && members.length > 0) {
      for (const studentId of members) {
        await Team.addMember(newTeam.id, studentId);
      }
    }

    res.status(201).json({
      message: 'Team created successfully',
      team: newTeam
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ message: 'Error creating team', error: error.message });
  }
});

// Get teams for a course
router.get('/:id/teams', authenticate, async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // Get all teams for this course
    const teams = await Team.getTeamsForCourse(courseId);
    
    res.json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Error fetching teams', error: error.message });
  }
});

// Delete a team (instructor only)
router.delete('/teams/:teamId', authenticate, isInstructor, async (req, res) => {
  try {
    const teamId = req.params.teamId;
    
    // Check if team exists and instructor owns the course
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const course = await Course.findById(team.course_id);
    if (course.instructor_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this team' });
    }

    // Delete team
    await Team.delete(teamId);
    
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Error deleting team', error: error.message });
  }
});

// Get team members
router.get('/teams/:teamId/members', authenticate, async (req, res) => {
  try {
    const teamId = req.params.teamId;
    
    // Get all members for this team
    const members = await Team.getTeamMembers(teamId);
    
    res.json({ members });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: 'Error fetching team members', error: error.message });
  }
});

// Get all students enrolled in a course
router.get('/:courseId/students', authenticate, async (req, res) => {
    try {
        const { courseId } = req.params;
        const students = await Course.getEnrolledStudents(courseId);
        res.json({ students });
    } catch (error) {
        console.error('Error getting enrolled students:', error);
        res.status(500).json({ error: 'Failed to get enrolled students' });
    }
});

// Add a student to a course
router.post('/:courseId/students', authenticate, async (req, res) => {
    try {
        const { courseId } = req.params;
        const { student_id } = req.body;

        if (!student_id) {
            return res.status(400).json({ error: 'Student ID is required' });
        }

        // Check if student is already enrolled
        const enrolledStudents = await Course.getEnrolledStudents(courseId);
        if (enrolledStudents.some(student => student.id === student_id)) {
            return res.status(400).json({ error: 'Student is already enrolled in this course' });
        }

        await Course.addStudent(courseId, student_id);
        res.json({ message: 'Student added to course successfully' });
    } catch (error) {
        console.error('Error adding student to course:', error);
        res.status(500).json({ error: 'Failed to add student to course' });
    }
});

// Remove a student from a course
router.delete('/:courseId/students/:studentId', authenticate, async (req, res) => {
    try {
        const { courseId, studentId } = req.params;
        await Course.removeStudent(courseId, studentId);
        res.json({ message: 'Student removed from course successfully' });
    } catch (error) {
        console.error('Error removing student from course:', error);
        res.status(500).json({ error: 'Failed to remove student from course' });
    }
});

// Add member to team (instructor only)
router.post('/:courseId/teams/:teamId/members', authenticate, isInstructor, async (req, res) => {
  try {
    const { courseId, teamId } = req.params;
    const { student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    // Check if course exists and instructor owns it
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.instructor_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify teams in this course' });
    }

    // Check if team exists and belongs to the course
    const team = await Team.findById(teamId);
    if (!team || team.course_id !== parseInt(courseId)) {
      return res.status(404).json({ message: 'Team not found in this course' });
    }

    // Check if student is enrolled in the course
    const enrolledStudents = await Course.getEnrolledStudents(courseId);
    if (!enrolledStudents.some(student => student.id === parseInt(student_id))) {
      return res.status(400).json({ message: 'Student is not enrolled in this course' });
    }

    // Check if student is already in the team
    const teamMembers = await Team.getTeamMembers(teamId);
    if (teamMembers.some(member => member.id === parseInt(student_id))) {
      return res.status(400).json({ message: 'Student is already a member of this team' });
    }

    // Add member to team
    await Team.addMember(teamId, student_id);
    
    res.status(201).json({ message: 'Team member added successfully' });
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ message: 'Error adding team member', error: error.message });
  }
});

// Remove member from team (instructor only)
router.delete('/:courseId/teams/:teamId/members/:studentId', authenticate, isInstructor, async (req, res) => {
  try {
    const { courseId, teamId, studentId } = req.params;

    // Check if course exists and instructor owns it
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.instructor_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify teams in this course' });
    }

    // Check if team exists and belongs to the course
    const team = await Team.findById(teamId);
    if (!team || team.course_id !== parseInt(courseId)) {
      return res.status(404).json({ message: 'Team not found in this course' });
    }

    // Remove member from team
    await Team.removeMember(teamId, studentId);
    
    res.json({ message: 'Team member removed successfully' });
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({ message: 'Error removing team member', error: error.message });
  }
});

module.exports = router;