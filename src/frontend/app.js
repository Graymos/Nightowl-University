// Frontend JavaScript for interacting with the API
document.addEventListener('DOMContentLoaded', function() {
    // API URL
    const API_URL = 'http://localhost:3001/api';
    
    // Token storage
    let authToken = localStorage.getItem('authToken');
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let currentCourseId = null;
  
    // Utility functions for showing notifications
    function showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: message,
            timer: 2000,
            showConfirmButton: false
        });
    }

    function showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message
        });
    }
  
    // Check if user is logged in
    function checkAuth() {
        authToken = localStorage.getItem('authToken');
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        const navLoginButton = document.getElementById('nav-login');
        const navRegisterButton = document.getElementById('nav-register');
        const navLogoutButton = document.getElementById('nav-logout');
        
        if (authToken && currentUser) {
        // Update UI for logged in user
        document.querySelectorAll('.logged-out-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.logged-in-only').forEach(el => el.style.display = 'block');
            
            // Update navbar buttons
            if (navLoginButton) navLoginButton.style.display = 'none';
            if (navRegisterButton) navRegisterButton.style.display = 'none';
            if (navLogoutButton) navLogoutButton.style.display = 'block';
        
        // Update user info display
          document.querySelectorAll('.user-name').forEach(el => {
            el.textContent = `${currentUser.first_name} ${currentUser.last_name}`;
          });
          
          // Show different nav based on role
          if (currentUser.role === 'instructor') {
            document.querySelectorAll('.instructor-only').forEach(el => el.style.display = 'block');
            document.querySelectorAll('.student-only').forEach(el => el.style.display = 'none');
          } else {
            document.querySelectorAll('.instructor-only').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.student-only').forEach(el => el.style.display = 'block');
          }
            return true;
      } else {
        // Update UI for logged out user
        document.querySelectorAll('.logged-out-only').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.logged-in-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.instructor-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.student-only').forEach(el => el.style.display = 'none');
            
            // Update navbar buttons
            if (navLoginButton) navLoginButton.style.display = 'block';
            if (navRegisterButton) navRegisterButton.style.display = 'block';
            if (navLogoutButton) navLogoutButton.style.display = 'none';
            
            return false;
        }
    }
  
    // Navigation function
    window.navigateToSection = function(sectionId) {
        // Check authentication before showing protected sections
        if (sectionId === 'manage-courses' || sectionId === 'manage-reviews' || sectionId === 'manage-reports') {
            if (!checkAuth()) {
                showError('Please log in to access this section');
                navigateToSection('forms-section');
                return;
            }
        }

        // Hide all sections
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById('landing-view').style.display = 'none';
        document.getElementById('forms-section').style.display = 'none';

        // Show the requested section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // If navigating to manage-courses, load the courses
        if (sectionId === 'manage-courses') {
            courseManagement.loadCourses();
        }
    };
  
    // Handle login form submission
    if (document.getElementById('btnStudentLoginSubmit')) {
        document.getElementById('btnStudentLoginSubmit').addEventListener('click', async function(e) {
            if (e) {
                e.preventDefault();
            }
            
        const email = document.getElementById('txtStudentLoginEmail').value;
        const password = document.getElementById('txtStudentLoginPassword').value;
        
        if (!email || !password) {
                showError('Please enter both email and password');
          return;
        }
        
        try {
          const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Login failed');
          }
          
          // Store token and user data
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          authToken = data.token;
          currentUser = data.user;
          
          // Update UI
          checkAuth();
                
                // Show success message
                showSuccess(`Welcome back, ${data.user.first_name}!`);
          
          // Redirect based on role
          if (data.user.role === 'instructor') {
                    navigateToSection('faculty-dashboard');
          } else {
            navigateToSection('student-dashboard');
          }
          
        } catch (error) {
                showError(error.message || 'Login failed. Please try again.');
        }
      });
    }
  
    // Handle student registration form submission
    if (document.getElementById('btnStudentRegisterSubmit')) {
      document.getElementById('btnStudentRegisterSubmit').addEventListener('click', async function() {
        const first_name = document.getElementById('txtStudentFirstname').value;
        const middle_name = document.getElementById('txtStudentMiddlename').value;
        const last_name = document.getElementById('txtStudentLastname').value;
        const email = document.getElementById('txtStudentEmail').value;
        const password = document.getElementById('txtStudentPassword').value;
        const confirmPassword = document.getElementById('txtStudentPasswordConfirm').value;
        const phone_number = document.getElementById('txtStudentPhoneNumber').value;
        
        // Basic validation
        if (!first_name || !last_name || !email || !password) {
          alert('Please fill in all required fields');
          return;
        }
        
        if (password !== confirmPassword) {
          alert('Passwords do not match');
          return;
        }
        
        try {
          const response = await fetch(`${API_URL}/users/register/student`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              first_name,
              middle_name,
              last_name,
              email,
              password,
              phone_number
            })
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
          }
          
          // Store token and user data
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          authToken = data.token;
          currentUser = data.user;
          
          // Update UI
          checkAuth();
          
          // Redirect to student dashboard
          navigateToSection('student-dashboard');
          
        } catch (error) {
          alert(`Error: ${error.message}`);
        }
      });
    }
  
    // Handle faculty registration form submission
    if (document.getElementById('btnRegisterFacultySubmit')) {
      document.getElementById('btnRegisterFacultySubmit').addEventListener('click', async function() {
        const first_name = document.getElementById('txtFacultyFirstname').value;
        const last_name = document.getElementById('txtFacultyLastname').value;
        const email = document.getElementById('txtFacultyUsername').value;
        const password = document.getElementById('txtFacultyPassword').value;
        const confirmPassword = document.getElementById('txtFacultyPasswordConfirm').value;
        
        // Basic validation
        if (!first_name || !last_name || !email || !password) {
          alert('Please fill in all required fields');
          return;
        }
        
        if (password !== confirmPassword) {
          alert('Passwords do not match');
          return;
        }
        
        try {
          const response = await fetch(`${API_URL}/users/register/faculty`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              first_name,
              last_name,
              email,
              password
            })
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
          }
          
          // Store token and user data
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          authToken = data.token;
          currentUser = data.user;
          
          // Update UI
          checkAuth();
          
          // Redirect to instructor dashboard
          navigateToSection('instructor-dashboard');
          
        } catch (error) {
          alert(`Error: ${error.message}`);
        }
      });
    }
  
    // Handle logout
    const logoutButtons = document.querySelectorAll('.btn-logout');
    if (logoutButtons) {
      logoutButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          // Clear auth data
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          authToken = null;
          currentUser = null;
          
          // Update UI
          checkAuth();
          
          // Redirect to home
          navigateToSection('features-section');
        });
      });
    }
  
    // Check auth status on page load
    checkAuth();

    // Course Management Functions
    const courseManagement = {
      // Create a new course
      createCourse: async (courseData) => {
        try {
          if (!checkAuth()) {
            showError('Please log in to create courses');
            return;
          }

          const response = await fetch(`${API_URL}/courses`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(courseData)
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to create course');
          }

          const data = await response.json();
          showSuccess('Course created successfully');
          await courseManagement.loadCourses();
          return data;
        } catch (error) {
          showError('Error creating course: ' + error.message);
          throw error;
        }
      },

      // Load all courses for the instructor
      loadCourses: async () => {
        try {
          if (!checkAuth()) {
            showError('Please log in to view courses');
            return;
          }

          const response = await fetch(`${API_URL}/courses/instructor`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Accept': 'application/json'
            }
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to load courses');
          }

          const data = await response.json();
          
          if (!data || !Array.isArray(data.courses)) {
            throw new Error('Invalid response format from server');
          }

          if (data.courses.length === 0) {
            document.getElementById('courseChart').innerHTML = `
              <div class="alert alert-info text-center">
                No courses found. Create your first course using the form above.
              </div>
            `;
            return;
          }

          // Create the course list table
          const courseList = document.createElement('div');
          courseList.className = 'table-responsive mt-4';
          courseList.innerHTML = `
            <table class="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Course Code</th>
                  <th>Students</th>
                  <th>Teams</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${data.courses.map(course => `
                  <tr>
                    <td>${course.title}</td>
                    <td>${course.code}</td>
                    <td>${course.student_count || 0}</td>
                    <td>${course.team_count || 0}</td>
                    <td>
                      <button class="btn btn-sm btn-primary view-course" data-course-id="${course.id}">View Details</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;

          // Add event listeners to view buttons
          courseList.querySelectorAll('.view-course').forEach(button => {
            button.addEventListener('click', () => courseManagement.showCourseDetails(button.dataset.courseId));
          });

          // Clear the container and add the table
          const container = document.getElementById('courseChart');
          container.innerHTML = '';
          container.appendChild(courseList);

        } catch (error) {
          console.error('Error loading courses:', error);
          showError('Error loading courses: ' + error.message);
          
          document.getElementById('courseChart').innerHTML = `
            <div class="alert alert-warning text-center">
              Unable to load courses. Please try again later.
            </div>
          `;
        }
      },

      // Show course details in modal
      showCourseDetails: async (courseId) => {
        try {
            if (!checkAuth()) {
                showError('Please log in to view course details');
                return;
            }

            // Set the current course ID
            currentCourseId = courseId;

            const response = await fetch(`${API_URL}/courses/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to load course details');
            }

            const data = await response.json();
            const course = data.course;
            const students = data.students || [];

            // Update modal title and add description
            document.getElementById('courseDetailsModalLabel').textContent = course.title;
            
            // Clear existing description if any
            const existingDescription = document.querySelector('#courseDetailsModal .course-description');
            if (existingDescription) {
                existingDescription.remove();
            }
            
            // Add course description section
            const modalBody = document.querySelector('#courseDetailsModal .modal-body');
            const descriptionSection = document.createElement('div');
            descriptionSection.className = 'mb-4 course-description';
            descriptionSection.innerHTML = `
                <h6 class="mb-2">Course Description</h6>
                <p class="text-muted">${course.description || 'No description provided.'}</p>
                <hr>
            `;
            
            // Insert description before the tabs
            modalBody.insertBefore(descriptionSection, modalBody.firstChild);

            // Populate student list
            const studentList = document.getElementById('studentList');
            studentList.innerHTML = '';

            if (students.length === 0) {
                studentList.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center">
                            <div class="alert alert-info">
                                No students enrolled in this course yet.
                            </div>
                        </td>
                    </tr>
                `;
            } else {
                students.forEach(student => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${student.first_name} ${student.last_name}</td>
                        <td>${student.email}</td>
                        <td>${student.team_name || 'Not Assigned'}</td>
                        <td>
                            <button class="btn btn-sm btn-danger remove-student" data-student-id="${student.id}">Remove</button>
                        </td>
                    `;
                    studentList.appendChild(row);
                });

                // Add event listeners to remove buttons
                document.querySelectorAll('.remove-student').forEach(button => {
                    button.addEventListener('click', () => courseManagement.removeStudentFromCourse(button.dataset.studentId));
                });
            }

            // Load teams
            await courseManagement.loadTeams(courseId);

            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('courseDetailsModal'));
            modal.show();
        } catch (error) {
            console.error('Error loading course details:', error);
            showError('Error loading course details: ' + error.message);
        }
    },

    // Load teams for a course
    loadTeams: async (courseId) => {
        try {
            if (!checkAuth()) {
                showError('Please log in to view teams');
                return;
            }

            const response = await fetch(`${API_URL}/courses/${courseId}/teams`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to load teams');
            }

            const data = await response.json();
            const teamList = document.getElementById('teamList');
            teamList.innerHTML = '';

            if (!data.teams || data.teams.length === 0) {
                teamList.innerHTML = `
                    <tr>
                        <td colspan="3" class="text-center">
                            <div class="alert alert-info">
                                No teams created for this course yet.
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }

            data.teams.forEach(team => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${team.name}</td>
                    <td>${team.member_count || 0} members</td>
                    <td>
                        <button class="btn btn-sm btn-primary view-team" data-team-id="${team.id}">View Members</button>
                        <button class="btn btn-sm btn-success add-member" data-team-id="${team.id}">Add Member</button>
                        <button class="btn btn-sm btn-danger delete-team" data-team-id="${team.id}">Delete</button>
                    </td>
                `;
                teamList.appendChild(row);
            });

            // Add event listeners to team buttons
            document.querySelectorAll('.view-team').forEach(button => {
                button.addEventListener('click', () => courseManagement.showTeamMembers(button.dataset.teamId));
            });

            document.querySelectorAll('.add-member').forEach(button => {
                button.addEventListener('click', () => courseManagement.showAddMemberModal(button.dataset.teamId));
            });

            document.querySelectorAll('.delete-team').forEach(button => {
                button.addEventListener('click', () => courseManagement.deleteTeam(button.dataset.teamId));
            });
        } catch (error) {
            console.error('Error loading teams:', error);
            showError('Error loading teams: ' + error.message);
        }
    },

    // Show team members
    showTeamMembers: async (teamId) => {
        try {
            if (!checkAuth()) {
                showError('Please log in to view team members');
                return;
            }

            const response = await fetch(`${API_URL}/courses/teams/${teamId}/members`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to load team members');
            }

            const data = await response.json();
            const members = data.members || [];

            // Create modal content
            const modalContent = document.createElement('div');
            modalContent.innerHTML = `
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${members.map(member => `
                                <tr>
                                    <td>${member.first_name} ${member.last_name}</td>
                                    <td>${member.email}</td>
                                    <td>
                                        <button class="btn btn-sm btn-danger remove-member" data-student-id="${member.id}">
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            // Show modal with team members
            Swal.fire({
                title: 'Team Members',
                html: modalContent,
                width: '600px',
                showCloseButton: true,
                showConfirmButton: false
            });

            // Add event listeners to remove buttons
            document.querySelectorAll('.remove-member').forEach(button => {
                button.addEventListener('click', () => {
                    courseManagement.removeMemberFromTeam(teamId, button.dataset.studentId);
                    Swal.close();
                });
            });
        } catch (error) {
            console.error('Error loading team members:', error);
            showError('Error loading team members: ' + error.message);
        }
    },

    // Show add member modal
    showAddMemberModal: async (teamId) => {
        try {
            if (!checkAuth()) {
                showError('Please log in to add team members');
                return;
            }

            // Get available students (not in any team)
            const response = await fetch(`${API_URL}/courses/${currentCourseId}/students`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to load available students');
            }

            const data = await response.json();
            const students = data.students || [];

            if (students.length === 0) {
                showError('No available students to add to the team');
                return;
            }

            // Create modal content
            const modalContent = document.createElement('div');
            modalContent.innerHTML = `
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${students.map(student => `
                                <tr>
                                    <td>${student.first_name} ${student.last_name}</td>
                                    <td>${student.email}</td>
                                    <td>
                                        <button class="btn btn-sm btn-success add-to-team" data-student-id="${student.id}">
                                            Add to Team
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            // Show modal with available students
            Swal.fire({
                title: 'Add Team Member',
                html: modalContent,
                width: '600px',
                showCloseButton: true,
                showConfirmButton: false,
                customClass: {
                    container: 'add-member-modal'
                }
            });

            // Add event listeners to add buttons
            document.querySelectorAll('.add-to-team').forEach(button => {
                button.addEventListener('click', async () => {
                    try {
                        await courseManagement.addMemberToTeam(teamId, button.dataset.studentId);
                        Swal.close();
                    } catch (error) {
                        console.error('Error adding team member:', error);
                        showError(error.message || 'Failed to add team member');
                    }
                });
            });
        } catch (error) {
            console.error('Error showing add member modal:', error);
            showError('Error showing add member modal: ' + error.message);
        }
    },

    // Delete a team
    deleteTeam: async (teamId) => {
        try {
            if (!checkAuth()) {
                showError('Please log in to delete teams');
                return;
            }

            const result = await Swal.fire({
                title: 'Delete Team',
                text: 'Are you sure you want to delete this team?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it',
                cancelButtonText: 'No, keep it'
            });

            if (!result.isConfirmed) {
                return;
            }

            const response = await fetch(`${API_URL}/courses/teams/${teamId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete team');
            }

            showSuccess('Team deleted successfully');
            await courseManagement.loadTeams(currentCourseId);
        } catch (error) {
            console.error('Error deleting team:', error);
            showError('Error deleting team: ' + error.message);
        }
    },

    // Show enrollment modal
    showEnrollmentModal: async (courseId) => {
        try {
            if (!checkAuth()) {
                showError('Please log in to manage enrollment');
                return;
            }

            // Set the current course ID
            currentCourseId = courseId;

            // Load available and enrolled students
            await courseManagement.loadAvailableStudents();
            await courseManagement.loadEnrolledStudents(courseId);

            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('enrollmentModal'));
            modal.show();
        } catch (error) {
            console.error('Error showing enrollment modal:', error);
            showError('Error showing enrollment modal: ' + error.message);
        }
    },

    // Load available students (not enrolled in the course)
    loadAvailableStudents: async () => {
        try {
            const response = await fetch(`${API_URL}/users/students`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load available students');
            }

            const data = await response.json();
            const students = data.students;
            const availableStudentsList = document.getElementById('availableStudentsList');
            availableStudentsList.innerHTML = '';

            if (!students || students.length === 0) {
                availableStudentsList.innerHTML = `
                    <tr>
                        <td colspan="3" class="text-center">
                            <div class="alert alert-info">
                                No available students found.
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }

            students.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.first_name} ${student.last_name}</td>
                    <td>${student.email}</td>
                    <td>
                        <button class="btn btn-sm btn-success add-student" data-student-id="${student.id}">
                            Add to Course
                        </button>
                    </td>
                `;
                availableStudentsList.appendChild(row);
            });

            // Add event listeners to add buttons
            document.querySelectorAll('.add-student').forEach(button => {
                button.addEventListener('click', () => courseManagement.addStudentToCourse(button.dataset.studentId));
            });
        } catch (error) {
            console.error('Error loading available students:', error);
            showError('Error loading available students: ' + error.message);
        }
    },

    // Load enrolled students
    loadEnrolledStudents: async (courseId) => {
        try {
            const response = await fetch(`${API_URL}/courses/${courseId}/students`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load enrolled students');
            }

            const data = await response.json();
            const enrolledStudentsList = document.getElementById('enrolledStudentsList');
            enrolledStudentsList.innerHTML = '';

            if (!data.students || data.students.length === 0) {
                enrolledStudentsList.innerHTML = `
                    <tr>
                        <td colspan="3" class="text-center">
                            <div class="alert alert-info">
                                No students enrolled in this course.
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }

            data.students.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.first_name} ${student.last_name}</td>
                    <td>${student.email}</td>
                    <td>
                        <button class="btn btn-sm btn-danger remove-student" data-student-id="${student.id}">
                            Remove
                        </button>
                    </td>
                `;
                enrolledStudentsList.appendChild(row);
            });

            // Add event listeners to remove buttons
            document.querySelectorAll('.remove-student').forEach(button => {
                button.addEventListener('click', () => courseManagement.removeStudentFromCourse(button.dataset.studentId));
            });
        } catch (error) {
            console.error('Error loading enrolled students:', error);
            showError('Error loading enrolled students: ' + error.message);
        }
    },

    // Add student to course
    addStudentToCourse: async (studentId) => {
        try {
            const response = await fetch(`${API_URL}/courses/${currentCourseId}/students`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ student_id: studentId })
            });

            if (!response.ok) {
                throw new Error('Failed to add student to course');
            }

            showSuccess('Student added to course successfully');
            await courseManagement.loadAvailableStudents();
            await courseManagement.loadEnrolledStudents(currentCourseId);
            await courseManagement.loadCourses(); // Refresh course list
        } catch (error) {
            console.error('Error adding student to course:', error);
            showError('Error adding student to course: ' + error.message);
        }
    },

    // Remove student from course
    removeStudentFromCourse: async (studentId) => {
        try {
            if (!currentCourseId) {
                throw new Error('No course selected');
            }

            const response = await fetch(`${API_URL}/courses/${currentCourseId}/students/${studentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to remove student from course');
            }

            showSuccess('Student removed from course successfully');
            await courseManagement.loadAvailableStudents();
            await courseManagement.loadEnrolledStudents(currentCourseId);
            await courseManagement.loadCourses(); // Refresh course list
        } catch (error) {
            console.error('Error removing student from course:', error);
            showError('Error removing student from course: ' + error.message);
        }
    },

    // Create team
    createTeam: async (courseId, teamData) => {
        try {
            if (!checkAuth()) {
                showError('Please log in to create teams');
                return;
            }

            const response = await fetch(`${API_URL}/courses/${courseId}/teams`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(teamData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create team');
            }

            showSuccess('Team created successfully');
            await courseManagement.loadTeams(courseId);
            return await response.json();
        } catch (error) {
            console.error('Error creating team:', error);
            showError('Error creating team: ' + error.message);
            throw error;
        }
    },

    // Add member to team
    addMemberToTeam: async (teamId, studentId) => {
        try {
            if (!currentCourseId) {
                throw new Error('No course selected');
            }

            console.log('Adding member to team:', {
                courseId: currentCourseId,
                teamId,
                studentId
            });

            const response = await fetch(`${API_URL}/courses/${currentCourseId}/teams/${teamId}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ student_id: parseInt(studentId) })
            });

            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Response text:', responseText);

            if (!response.ok) {
                let errorMessage = 'Failed to add team member';
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    console.error('Error parsing error response:', e);
                }
                throw new Error(errorMessage);
            }

            // Close the modal
            const modal = document.getElementById('addMemberModal');
            if (modal) {
                modal.remove();
            }

            // Refresh the team list
            await courseManagement.loadTeams(currentCourseId);
            
            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Team member added successfully',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Error adding team member:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to add team member'
            });
        }
    },

    // Remove member from team
    removeMemberFromTeam: async (teamId, studentId) => {
        try {
            if (!currentCourseId) {
                throw new Error('No course selected');
            }

            console.log('Removing member from team:', {
                courseId: currentCourseId,
                teamId,
                studentId
            });

            const response = await fetch(`${API_URL}/courses/${currentCourseId}/teams/${teamId}/members/${studentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Response text:', responseText);

            if (!response.ok) {
                let errorMessage = 'Failed to remove team member';
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    console.error('Error parsing error response:', e);
                }
                throw new Error(errorMessage);
            }

            // Refresh the team list
            await courseManagement.loadTeams(currentCourseId);

            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Team member removed successfully',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Error removing team member:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to remove team member'
            });
        }
    }
};

    // Event Listeners for Course Management
    const courseForm = document.getElementById('frmCourse');
    if (courseForm) {
        courseForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const courseData = {
                title: document.getElementById('txtCourseName').value,
                code: document.getElementById('txtCourseCode').value,
                description: document.getElementById('txtCourseDescription').value
            };

            // Basic validation
            if (!courseData.title || !courseData.code) {
                showError('Please fill in all required fields');
                return;
            }

            try {
                await courseManagement.createCourse(courseData);
                courseForm.reset();
            } catch (error) {
                console.error('Error creating course:', error);
            }
        });
    }

    // Create team button
    const createTeamBtn = document.getElementById('btnCreateTeam');
    if (createTeamBtn) {
        createTeamBtn.addEventListener('click', () => {
            console.log('Create team button clicked');
            
            if (!currentCourseId) {
                showError('No course selected');
                return;
            }

            // Create modal HTML
            const modalHTML = `
                <div class="modal fade" id="createTeamModal" tabindex="-1" aria-labelledby="createTeamModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="createTeamModalLabel">Create New Team</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <form id="frmCreateTeam" class="needs-validation" novalidate>
                                    <div class="mb-3">
                                        <label for="txtTeamName" class="form-label">Team Name</label>
                                        <input type="text" class="form-control" id="txtTeamName" required>
                                        <div class="invalid-feedback">
                                            Please enter a team name.
                                        </div>
                                    </div>
                                    <div class="d-flex justify-content-end gap-2">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                        <button type="submit" class="btn btn-primary">Create Team</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Remove existing modal if any
            const existingModal = document.getElementById('createTeamModal');
            if (existingModal) {
                existingModal.remove();
            }

            // Add new modal to body
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Get the new modal element
            const modalElement = document.getElementById('createTeamModal');

            // Create and show modal
            const modal = new bootstrap.Modal(modalElement);
            modal.show();

            // Add form submit handler
            const form = document.getElementById('frmCreateTeam');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!form.checkValidity()) {
                        form.classList.add('was-validated');
                        return;
                    }

                    const teamName = document.getElementById('txtTeamName').value.trim();
                    if (!teamName) {
                        showError('Please enter a team name');
                        return;
                    }

                    try {
                        const submitBtn = form.querySelector('button[type="submit"]');
                        submitBtn.disabled = true;
                        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating...';

                        await courseManagement.createTeam(currentCourseId, { name: teamName });
                        
                        form.reset();
                        form.classList.remove('was-validated');
                        modal.hide();
                        
                        showSuccess('Team created successfully');
                        await courseManagement.loadTeams(currentCourseId);
                    } catch (error) {
                        console.error('Error creating team:', error);
                        showError(error.message || 'Failed to create team');
                    } finally {
                        const submitBtn = form.querySelector('button[type="submit"]');
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'Create Team';
                    }
                });
            }
        });
    }

    // Load courses when manage courses section is shown
    const manageCoursesBtn = document.getElementById('btnManageCourses');
    if (manageCoursesBtn) {
        manageCoursesBtn.addEventListener('click', () => {
            navigateToSection('manage-courses');
            courseManagement.loadCourses();
        });
    }

    // Add event listener for enrollment management button
    document.getElementById('btnManageEnrollment').addEventListener('click', () => {
        courseManagement.showEnrollmentModal(currentCourseId);
    });

    // Add search functionality
    document.getElementById('btnSearchStudent').addEventListener('click', () => {
        const searchTerm = document.getElementById('searchStudent').value.toLowerCase();
        const rows = document.querySelectorAll('#availableStudentsList tr');
        
        rows.forEach(row => {
            const name = row.querySelector('td:first-child')?.textContent.toLowerCase() || '';
            const email = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
            
            if (name.includes(searchTerm) || email.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Add event listeners for faculty dashboard buttons
    if (document.getElementById('btnManageCourses')) {
        document.getElementById('btnManageCourses').addEventListener('click', function() {
            navigateToSection('manage-courses');
        });
    }

    if (document.getElementById('btnManageReviews')) {
        document.getElementById('btnManageReviews').addEventListener('click', function() {
            navigateToSection('manage-reviews');
        });
    }

    if (document.getElementById('btnManageReports')) {
        document.getElementById('btnManageReports').addEventListener('click', function() {
            navigateToSection('manage-reports');
        });
    }

    if (document.getElementById('btnFacultyLogout')) {
        document.getElementById('btnFacultyLogout').addEventListener('click', function() {
            // Clear auth data
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            authToken = null;
            currentUser = null;
            
            // Update UI
            checkAuth();
            
            // Redirect to home
            navigateToSection('landing-view');
        });
    }
  });