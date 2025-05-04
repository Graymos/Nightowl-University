// Wait until the DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
    updateParallax();

    // Navigation: Hide all sections/forms and show the target section
    window.navigateToSection = function (section) {
        event.preventDefault();
        document.querySelectorAll('section, form').forEach(el => {
            el.style.display = 'none';
        });
        document.getElementById(section).style.display = 'block';
        history.pushState({ section: section }, '', '#' + section);
    };

    // Handle browser navigation (back/forward)
    window.addEventListener('popstate', function (event) {
        if (event.state && event.state.section) {
            document.querySelectorAll('section, form').forEach(el => {
                el.style.display = 'none';
            });
            document.getElementById(event.state.section).style.display = 'block';
        } else {
            // Default to features section if no state
            document.querySelectorAll('section, form').forEach(el => {
                el.style.display = 'none';
            });
            document.getElementById('features-section').style.display = 'block';
        }
    });

    // Update parallax: Adjust the hero background position on scroll.
    function updateParallax() {
        const hero = document.querySelector('.hero');
        const scrolled = window.pageYOffset;
        // Background moves at 25% of scroll speed
        hero.style.backgroundPosition = "center " + (-scrolled * -0.35) + "px";
    }
    window.addEventListener('scroll', updateParallax);

    // Dummy toggles for forms
    document.getElementById('btnShowLogin').addEventListener('click', function () {
        document.getElementById('formStudent').style.display = 'none';
        document.getElementById('formLogin').style.display = 'block';
    });
    document.getElementById('btnShowRegister').addEventListener('click', function () {
        document.getElementById('formLogin').style.display = 'none';
        document.getElementById('formStudent').style.display = 'block';
    });
    document.getElementById('btnShowRegisterFaculty').addEventListener('click', function () {
        document.getElementById('formLogin').style.display = 'none';
        document.getElementById('formStudent').style.display = 'none';
        document.getElementById('formFaculty').style.display = 'block';
    });
});

// API Endpoints
const API = {
    BASE_URL: '/api',
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      USER: '/auth/user'
    },
    COURSES: {
      BASE: '/courses',
      STUDENT: '/courses/student',
      ENROLL: (code) => `/courses/enroll/${code}`,
      TEAMS: (id) => `/courses/${id}/teams`,
      ADD_STUDENTS: (id) => `/courses/${id}/enroll`
    },
    REVIEWS: {
      BASE: '/reviews',
      TEMPLATES: '/reviews/templates',
      PENDING: '/reviews/pending',
      INSTRUCTOR: '/reviews/instructor',
      RESULTS_STUDENT: '/reviews/results/student',
      RESULTS: (id) => `/reviews/${id}/results`,
      ASSIGNMENT: (id) => `/reviews/assignments/${id}`,
      SUBMIT: (id) => `/reviews/assignments/${id}/submit`
    }
  };
  
  // Global state
  let currentUser = null;
  let token = localStorage.getItem('token');
  
  // DOM Elements
  document.addEventListener('DOMContentLoaded', function () {
    // Update any existing event listeners from the original file
    // Keep the original script functionality
    updateParallax();
  
    // Navigation: Hide all sections/forms and show the target section
    window.navigateToSection = function (section) {
      event.preventDefault();
      document.querySelectorAll('section, form').forEach(el => {
        el.style.display = 'none';
      });
      document.getElementById(section).style.display = 'block';
      history.pushState({ section: section }, '', '#' + section);
    };
  
    // Handle browser navigation (back/forward)
    window.addEventListener('popstate', function (event) {
      if (event.state && event.state.section) {
        document.querySelectorAll('section, form').forEach(el => {
          el.style.display = 'none';
        });
        document.getElementById(event.state.section).style.display = 'block';
      } else {
        // Default to features section if no state
        document.querySelectorAll('section, form').forEach(el => {
          el.style.display = 'none';
        });
        document.getElementById('features-section').style.display = 'block';
      }
    });
  
    // Update parallax: Adjust the hero background position on scroll.
    function updateParallax() {
      const hero = document.querySelector('.hero');
      const scrolled = window.pageYOffset;
      // Background moves at 25% of scroll speed
      hero.style.backgroundPosition = "center " + (-scrolled * -0.35) + "px";
    }
    window.addEventListener('scroll', updateParallax);
  
    // Setup form handlers
    setupForms();
    
    // Check if user is logged in
    checkAuth();
  });
  
  // Authentication Functions
  async function checkAuth() {
    if (token) {
      try {
        const response = await fetch(`${API.BASE_URL}${API.AUTH.USER}`, {
          headers: {
            'x-auth-token': token
          }
        });
        
        if (response.ok) {
          currentUser = await response.json();
          updateUIForLoggedInUser();
        } else {
          // Token invalid
          logout();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        logout();
      }
    }
  }
  
  function logout() {
    localStorage.removeItem('token');
    token = null;
    currentUser = null;
    updateUIForLoggedOutUser();
  }
  
  function updateUIForLoggedInUser() {
    // Hide login/register forms
    document.getElementById('formLogin').style.display = 'none';
    document.getElementById('formStudent').style.display = 'none';
    document.getElementById('formFaculty').style.display = 'none';
    document.getElementById('landing-view').style.display = 'block';
    
    // Show dashboard based on user role
    if (currentUser.role === 'student') {
      loadStudentDashboard();
    } else if (currentUser.role === 'instructor') {
      loadInstructorDashboard();
    }
    
    // Update navbar
    updateNavbar();
  }
  
  function updateUIForLoggedOutUser() {
    // Default display for logged out users
    document.getElementById('formLogin').style.display = 'block';
    
    // Hide dashboards
    // You'll need to create these dashboard elements
    const dashboardElements = document.querySelectorAll('.dashboard');
    dashboardElements.forEach(el => {
      el.style.display = 'none';
    });
    
    // Update navbar
    updateNavbar();
  }
  
  function updateNavbar() {
    // Update navigation items based on authentication state
    const navItems = document.querySelectorAll('.nav-item');
    
    if (currentUser) {
      // Show logout button and user info
      // You'll need to add these elements to your HTML
      const userNavItem = document.createElement('li');
      userNavItem.className = 'nav-item mx-2';
      userNavItem.innerHTML = `
        <a class="nav-link" href="#">
          <span id="userDisplayName">${currentUser.first_name} ${currentUser.last_name}</span>
        </a>
      `;
      
      const logoutNavItem = document.createElement('li');
      logoutNavItem.className = 'nav-item mx-2';
      logoutNavItem.innerHTML = `
        <a class="nav-link" href="#" id="logoutBtn">Logout</a>
      `;
      
      // Add to navbar
      const navbarNav = document.querySelector('.navbar-nav.me-auto');
      navbarNav.appendChild(userNavItem);
      navbarNav.appendChild(logoutNavItem);
      
      // Add logout event listener
      document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
      });
    } else {
      // Remove user-specific nav items
      const userNavItem = document.getElementById('userDisplayName')?.parentElement?.parentElement;
      const logoutNavItem = document.getElementById('logoutBtn')?.parentElement;
      
      if (userNavItem) userNavItem.remove();
      if (logoutNavItem) logoutNavItem.remove();
    }
  }
  
  // Setup form event listeners
  function setupForms() {
    // Student Registration Form
    document.getElementById('btnStudentRegisterSubmit').addEventListener('click', async function() {
      const firstName = document.getElementById('txtStudentFirstname').value;
      const middleName = document.getElementById('txtStudentMiddlename').value;
      const lastName = document.getElementById('txtStudentLastname').value;
      const email = document.getElementById('txtStudentEmail').value;
      const password = document.getElementById('txtStudentPassword').value;
      const confirmPassword = document.getElementById('txtStudentPasswordConfirm').value;
      const phoneNumber = document.getElementById('txtStudentPhoneNumber').value;
      
      // Validate form
      if (!firstName || !lastName || !email || !password) {
        alert('Please fill in all required fields');
        return;
      }
      
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      
      try {
        const response = await fetch(`${API.BASE_URL}${API.AUTH.REGISTER}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            email: email,
            password: password,
            phone_number: phoneNumber,
            role: 'student'
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Registration successful
          token = data.token;
          localStorage.setItem('token', token);
          currentUser = data.user;
          
          alert('Registration successful! Welcome to Night Owl University.');
          updateUIForLoggedInUser();
        } else {
          // Registration failed
          alert(`Registration failed: ${data.message || 'Please try again'}`);
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again later.');
      }
    });
    
    // Student Login Form
    document.getElementById('btnStudentLoginSubmit').addEventListener('click', async function() {
      const email = document.getElementById('txtStudentLoginEmail').value;
      const password = document.getElementById('txtStudentLoginPassword').value;
      
      // Validate form
      if (!email || !password) {
        alert('Please enter both email and password');
        return;
      }
      
      try {
        const response = await fetch(`${API.BASE_URL}${API.AUTH.LOGIN}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            password: password
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Login successful
          token = data.token;
          localStorage.setItem('token', token);
          currentUser = data.user;
          
          alert('Login successful!');
          updateUIForLoggedInUser();
        } else {
          // Login failed
          alert(`Login failed: ${data.message || 'Invalid credentials'}`);
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again later.');
      }
    });
    
    // Faculty Registration Form
    document.getElementById('btnRegisterFacultySubmit').addEventListener('click', async function() {
      const firstName = document.getElementById('txtFacultyFirstname').value;
      const lastName = document.getElementById('txtFacultyLastname').value;
      const email = document.getElementById('txtFacultyUsername').value;
      const password = document.getElementById('txtFacultyPassword').value;
      const confirmPassword = document.getElementById('txtFacultyPasswordConfirm').value;
      
      // Validate form
      if (!firstName || !lastName || !email || !password) {
        alert('Please fill in all required fields');
        return;
      }
      
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      
      try {
        const response = await fetch(`${API.BASE_URL}${API.AUTH.REGISTER}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password,
            role: 'instructor'
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Registration successful
          token = data.token;
          localStorage.setItem('token', token);
          currentUser = data.user;
          
          alert('Faculty registration successful! Welcome to Night Owl University.');
          updateUIForLoggedInUser();
        } else {
          // Registration failed
          alert(`Registration failed: ${data.message || 'Please try again'}`);
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again later.');
      }
    });
    
    // Form toggle buttons
    document.getElementById('btnShowLogin').addEventListener('click', function() {
      document.getElementById('formStudent').style.display = 'none';
      document.getElementById('formLogin').style.display = 'block';
    });
    
    document.getElementById('btnShowRegister').addEventListener('click', function() {
      document.getElementById('formLogin').style.display = 'none';
      document.getElementById('formStudent').style.display = 'block';
    });
    
    document.getElementById('btnShowRegisterFaculty').addEventListener('click', function() {
      document.getElementById('formLogin').style.display = 'none';
      document.getElementById('formFaculty').style.display = 'block';
    });
  }
  
  // Dashboard Functions
  async function loadStudentDashboard() {
    // Create student dashboard if it doesn't exist
    if (!document.getElementById('studentDashboard')) {
      const dashboard = document.createElement('div');
      dashboard.id = 'studentDashboard';
      dashboard.className = 'dashboard container my-5';
      dashboard.style.marginTop = '100px';
      dashboard.innerHTML = `
        <h2>Student Dashboard</h2>
        <div class="row">
          <div class="col-md-4">
            <div class="card">
              <div class="card-header">
                <h3>My Courses</h3>
              </div>
              <div class="card-body">
                <ul id="studentCoursesList" class="list-group">
                  <li class="list-group-item">Loading courses...</li>
                </ul>
              </div>
              <div class="card-footer">
                <form id="enrollCourseForm">
                  <div class="input-group">
                    <input type="text" id="courseCode" class="form-control" placeholder="Enter Course Code">
                    <button class="btn btn-primary" type="submit">Enroll</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div class="col-md-8">
            <div class="card mb-4">
              <div class="card-header">
                <h3>Pending Reviews</h3>
              </div>
              <div class="card-body">
                <ul id="pendingReviewsList" class="list-group">
                  <li class="list-group-item">Loading reviews...</li>
                </ul>
              </div>
            </div>
            <div class="card">
              <div class="card-header">
                <h3>My Results</h3>
              </div>
              <div class="card-body">
                <div id="studentResultsContainer">Loading results...</div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(dashboard);
      
      // Setup event listeners for student dashboard
      document.getElementById('enrollCourseForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const courseCode = document.getElementById('courseCode').value;
        
        if (!courseCode) {
          alert('Please enter a course code');
          return;
        }
        
        try {
          const response = await fetch(`${API.BASE_URL}${API.COURSES.ENROLL(courseCode)}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            }
          });
          
          const data = await response.json();
          
          if (response.ok) {
            alert('Successfully enrolled in course!');
            loadStudentCourses();
          } else {
            alert(`Enrollment failed: ${data.message}`);
          }
        } catch (error) {
          console.error('Enrollment error:', error);
          alert('Enrollment failed. Please try again later.');
        }
      });
    }
    
    // Show student dashboard
    document.querySelectorAll('section, form, .dashboard').forEach(el => {
      el.style.display = 'none';
    });
    document.getElementById('studentDashboard').style.display = 'block';
    
    // Load student data
    loadStudentCourses();
    loadPendingReviews();
    loadStudentResults();
  }
  
  async function loadInstructorDashboard() {
    // Create instructor dashboard if it doesn't exist
    if (!document.getElementById('instructorDashboard')) {
      const dashboard = document.createElement('div');
      dashboard.id = 'instructorDashboard';
      dashboard.className = 'dashboard container my-5';
      dashboard.style.marginTop = '100px';
      dashboard.innerHTML = `
        <h2>Instructor Dashboard</h2>
        <div class="row">
          <div class="col-md-4">
            <div class="card">
              <div class="card-header">
                <h3>My Courses</h3>
              </div>
              <div class="card-body">
                <ul id="instructorCoursesList" class="list-group">
                  <li class="list-group-item">Loading courses...</li>
                </ul>
              </div>
              <div class="card-footer">
                <button id="createCourseBtn" class="btn btn-primary">Create Course</button>
              </div>
            </div>
          </div>
          <div class="col-md-8">
            <div class="card mb-4">
              <div class="card-header">
                <h3>Review Templates</h3>
              </div>
              <div class="card-body">
                <ul id="reviewTemplatesList" class="list-group">
                  <li class="list-group-item">Loading templates...</li>
                </ul>
              </div>
              <div class="card-footer">
                <button id="createTemplateBtn" class="btn btn-primary">Create Template</button>
              </div>
            </div>
            <div class="card">
              <div class="card-header">
                <h3>Active Reviews</h3>
              </div>
              <div class="card-body">
                <ul id="activeReviewsList" class="list-group">
                  <li class="list-group-item">Loading reviews...</li>
                </ul>
              </div>
              <div class="card-footer">
                <button id="createReviewBtn" class="btn btn-primary">Create Review</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Modal for creating a course -->
        <div class="modal fade" id="createCourseModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Create Course</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <form id="createCourseForm">
                  <div class="mb-3">
                    <label for="courseTitle" class="form-label">Course Title</label>
                    <input type="text" class="form-control" id="courseTitle" required>
                  </div>
                  <div class="mb-3">
                    <label for="courseDescription" class="form-label">Description</label>
                    <textarea class="form-control" id="courseDescription" rows="3"></textarea>
                  </div>
                  <div class="mb-3">
                    <label for="courseCode" class="form-label">Course Code</label>
                    <input type="text" class="form-control" id="courseCode" required>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="submitCourseBtn">Create</button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(dashboard);
      
      // Add Bootstrap modal script if not already included
      if (!document.querySelector('script[src*="bootstrap.bundle.min.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';
        script.integrity = 'sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz';
        script.crossOrigin = 'anonymous';
        document.body.appendChild(script);
      }
      
      // Setup event listeners for instructor dashboard
      document.getElementById('createCourseBtn').addEventListener('click', function() {
        const modal = new bootstrap.Modal(document.getElementById('createCourseModal'));
        modal.show();
      });
      
      document.getElementById('submitCourseBtn').addEventListener('click', async function() {
        const title = document.getElementById('courseTitle').value;
        const description = document.getElementById('courseDescription').value;
        const code = document.getElementById('courseCode').value;
        
        if (!title || !code) {
          alert('Please fill in all required fields');
          return;
        }
        
        try {
          const response = await fetch(`${API.BASE_URL}${API.COURSES.BASE}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            },
            body: JSON.stringify({
              title,
              description,
              code
            })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            alert('Course created successfully!');
            const modal = bootstrap.Modal.getInstance(document.getElementById('createCourseModal'));
            modal.hide();
            loadInstructorCourses();
          } else {
            alert(`Course creation failed: ${data.message}`);
          }
        } catch (error) {
          console.error('Course creation error:', error);
          alert('Course creation failed. Please try again later.');
        }
      });
    }
    
    // Show instructor dashboard
    document.querySelectorAll('section, form, .dashboard').forEach(el => {
      el.style.display = 'none';
    });
    document.getElementById('instructorDashboard').style.display = 'block';
    
    // Load instructor data
    loadInstructorCourses();
    loadReviewTemplates();
    loadActiveReviews();
  }
  
  // Student Dashboard Functions
  async function loadStudentCourses() {
    try {
      const response = await fetch(`${API.BASE_URL}${API.COURSES.STUDENT}`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (response.ok) {
        const courses = await response.json();
        const coursesList = document.getElementById('studentCoursesList');
        
        if (courses.length === 0) {
          coursesList.innerHTML = '<li class="list-group-item">No courses found. Enroll in a course below.</li>';
        } else {
          coursesList.innerHTML = courses.map(course => `
            <li class="list-group-item">
              <h5>${course.title}</h5>
              <p><small>Instructor: ${course.instructor_name}</small></p>
              <p>${course.description || 'No description available.'}</p>
            </li>
          `).join('');
        }
      } else {
        document.getElementById('studentCoursesList').innerHTML = 
          '<li class="list-group-item">Error loading courses. Please try again later.</li>';
      }
    } catch (error) {
      console.error('Load courses error:', error);
      document.getElementById('studentCoursesList').innerHTML = 
        '<li class="list-group-item">Error loading courses. Please try again later.</li>';
    }
  }
  
  async function loadPendingReviews() {
    try {
      const response = await fetch(`${API.BASE_URL}${API.REVIEWS.PENDING}`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (response.ok) {
        const reviews = await response.json();
        const reviewsList = document.getElementById('pendingReviewsList');
        
        if (reviews.length === 0) {
          reviewsList.innerHTML = '<li class="list-group-item">No pending reviews.</li>';
        } else {
          reviewsList.innerHTML = reviews.map(review => `
            <li class="list-group-item">
              <h5>${review.title}</h5>
              <p>${review.description || 'No description available.'}</p>
              <p>
                <small>Course: ${review.course_title}</small><br>
                <small>Reviewing: ${review.reviewee_name}</small><br>
                <small>Due: ${new Date(review.due_date).toLocaleDateString()}</small>
              </p>
              <button class="btn btn-primary btn-sm" onclick="completeReview(${review.assignment_id})">Complete Review</button>
            </li>
          `).join('');
        }
      } else {
        document.getElementById('pendingReviewsList').innerHTML = 
          '<li class="list-group-item">Error loading reviews. Please try again later.</li>';
      }
    } catch (error) {
      console.error('Load pending reviews error:', error);
      document.getElementById('pendingReviewsList').innerHTML = 
        '<li class="list-group-item">Error loading reviews. Please try again later.</li>';
    }
  }
  
  async function loadStudentResults() {
    try {
      const response = await fetch(`${API.BASE_URL}${API.REVIEWS.RESULTS_STUDENT}`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const resultsContainer = document.getElementById('studentResultsContainer');
        
        if (data.results.length === 0) {
          resultsContainer.innerHTML = '<p>No results available yet.</p>';
        } else {
          let resultsHTML = '<div class="table-responsive"><table class="table table-striped">';
          resultsHTML += `
            <thead>
              <tr>
                <th>Review</th>
                <th>Course</th>
                <th>Reviews Received</th>
                <th>Score (100-point scale)</th>
              </tr>
            </thead>
            <tbody>
          `;
          
          data.results.forEach(result => {
            resultsHTML += `
              <tr>
                <td>${result.review_title}</td>
                <td>${result.course_title}</td>
                <td>${result.total_reviews}</td>
                <td>${result.score !== null ? result.score : 'N/A'}</td>
              </tr>
            `;
          });
          
          resultsHTML += '</tbody></table></div>';
          
          // Add feedback section
          if (data.feedback && data.feedback.length > 0) {
            resultsHTML += '<h4 class="mt-4">Public Feedback</h4>';
            
            data.feedback.forEach(item => {
              resultsHTML += `
                <div class="card mb-2">
                  <div class="card-header">
                    <strong>${item.review_title}</strong> - ${item.question_text}
                  </div>
                  <div class="card-body">
                    <p>${item.response_value}</p>
                  </div>
                </div>
              `;
            });
          }
          
          resultsContainer.innerHTML = resultsHTML;
        }
      } else {
        document.getElementById('studentResultsContainer').innerHTML = 
          '<p>Error loading results. Please try again later.</p>';
      }
    } catch (error) {
      console.error('Load student results error:', error);
      document.getElementById('studentResultsContainer').innerHTML = 
        '<p>Error loading results. Please try again later.</p>';
    }
  }
  
  // Function to handle completing a review
  window.completeReview = async function(assignmentId) {
    try {
      // Create review form modal dynamically
      const modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.id = 'reviewFormModal';
      modal.tabIndex = '-1';
      modal.innerHTML = `
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Complete Review</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div id="reviewFormContent">
                <p>Loading review questions...</p>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" id="submitReviewBtn">Submit Review</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Fetch assignment details
      const response = await fetch(`${API.BASE_URL}${API.REVIEWS.ASSIGNMENT(assignmentId)}`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const formContent = document.getElementById('reviewFormContent');
        
        let formHTML = `
          <h4>${data.assignment.review_title}</h4>
          <p>${data.assignment.review_description || ''}</p>
          <p><strong>Reviewing:</strong> ${data.assignment.reviewee_name}</p>
          <form id="reviewResponseForm">
        `;
        
        data.questions.forEach(question => {
          formHTML += `
            <div class="mb-3">
              <label class="form-label">${question.question_text}${question.required ? ' *' : ''}</label>
            `;
          
          if (question.question_type === 'likert') {
            formHTML += `
              <div class="likert-scale">
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" name="q_${question.id}" id="q_${question.id}_1" value="1" ${question.required ? 'required' : ''}>
                  <label class="form-check-label" for="q_${question.id}_1">1 (Poor)</label>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" name="q_${question.id}" id="q_${question.id}_2" value="2">
                  <label class="form-check-label" for="q_${question.id}_2">2</label>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" name="q_${question.id}" id="q_${question.id}_3" value="3">
                  <label class="form-check-label" for="q_${question.id}_3">3</label>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" name="q_${question.id}" id="q_${question.id}_4" value="4">
                  <label class="form-check-label" for="q_${question.id}_4">4</label>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" name="q_${question.id}" id="q_${question.id}_5" value="5">
                  <label class="form-check-label" for="q_${question.id}_5">5 (Excellent)</label>
                </div>
              </div>
            `;
          } else if (question.question_type === 'multiple_choice') {
            formHTML += `<div class="multiple-choice">`;
            
            question.options.forEach((option, index) => {
              formHTML += `
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="q_${question.id}" id="q_${question.id}_${index}" value="${option}" ${question.required ? 'required' : ''}>
                  <label class="form-check-label" for="q_${question.id}_${index}">${option}</label>
                </div>
              `;
            });
            
            formHTML += `</div>`;
          } else if (question.question_type === 'short_answer') {
            formHTML += `
              <textarea class="form-control" name="q_${question.id}" rows="3" ${question.required ? 'required' : ''}></textarea>
              <div class="form-check mt-2">
                <input class="form-check-input" type="checkbox" name="private_q_${question.id}" id="private_q_${question.id}">
                <label class="form-check-label" for="private_q_${question.id}">
                  Mark as private (only instructors can see)
                </label>
              </div>
            `;
          }
          
          formHTML += `</div>`;
        });
        
        formHTML += `</form>`;
        formContent.innerHTML = formHTML;
        
        // Show modal
        const bsModal = new bootstrap.Modal(document.getElementById('reviewFormModal'));
        bsModal.show();
        
        // Handle form submission
        document.getElementById('submitReviewBtn').addEventListener('click', async function() {
          // Validate required fields
          const form = document.getElementById('reviewResponseForm');
          const requiredInputs = form.querySelectorAll('[required]');
          let valid = true;
          
          requiredInputs.forEach(input => {
            if (!input.value) {
              valid = false;
              input.classList.add('is-invalid');
            } else {
              input.classList.remove('is-invalid');
            }
          });
          
          if (!valid) {
            alert('Please fill in all required fields');
            return;
          }
          
          // Gather responses
          const responses = [];
          
          data.questions.forEach(question => {
            const inputName = `q_${question.id}`;
            let value = '';
            
            if (question.question_type === 'likert' || question.question_type === 'multiple_choice') {
              const selectedInput = form.querySelector(`input[name="${inputName}"]:checked`);
              if (selectedInput) {
                value = selectedInput.value;
              }
            } else if (question.question_type === 'short_answer') {
              const textarea = form.querySelector(`textarea[name="${inputName}"]`);
              if (textarea) {
                value = textarea.value;
              }
            }
            
            if (value) {
              const isPrivate = question.question_type === 'short_answer' && form.querySelector(`input[name="private_${inputName}"]`)?.checked;
              
              responses.push({
                questionId: question.id,
                value: value,
                isPrivate: isPrivate
              });
            }
          });
          
          try {
            const submitResponse = await fetch(`${API.BASE_URL}${API.REVIEWS.SUBMIT(assignmentId)}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
              },
              body: JSON.stringify({
                responses: responses
              })
            });
            
            const submitData = await submitResponse.json();
            
            if (submitResponse.ok) {
              alert('Review submitted successfully!');
              bsModal.hide();
              loadPendingReviews();
            } else {
              alert(`Review submission failed: ${submitData.message}`);
            }
          } catch (error) {
            console.error('Submit review error:', error);
            alert('Review submission failed. Please try again later.');
          }
        });
      } else {
        alert('Error loading review. Please try again later.');
      }
    } catch (error) {
      console.error('Complete review error:', error);
      alert('Error loading review. Please try again later.');
    }
  };
  
  // Instructor Dashboard Functions
  async function loadInstructorCourses() {
    try {
      const response = await fetch(`${API.BASE_URL}${API.COURSES.BASE}`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (response.ok) {
        const courses = await response.json();
        const coursesList = document.getElementById('instructorCoursesList');
        
        if (courses.length === 0) {
          coursesList.innerHTML = '<li class="list-group-item">No courses found. Create a course below.</li>';
        } else {
          coursesList.innerHTML = courses.map(course => `
            <li class="list-group-item">
              <h5>${course.title}</h5>
              <p>${course.description || 'No description available.'}</p>
              <p><small>Course Code: ${course.code}</small></p>
              <button class="btn btn-sm btn-info" onclick="viewCourseDetails(${course.id})">View Details</button>
            </li>
          `).join('');
        }
      } else {
        document.getElementById('instructorCoursesList').innerHTML = 
          '<li class="list-group-item">Error loading courses. Please try again later.</li>';
      }
    } catch (error) {
      console.error('Load instructor courses error:', error);
      document.getElementById('instructorCoursesList').innerHTML = 
        '<li class="list-group-item">Error loading courses. Please try again later.</li>';
    }
  }
  
  async function loadReviewTemplates() {
    try {
      const response = await fetch(`${API.BASE_URL}${API.REVIEWS.INSTRUCTOR}`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const templatesList = document.getElementById('reviewTemplatesList');
        
        if (data.templates.length === 0) {
          templatesList.innerHTML = '<li class="list-group-item">No templates found. Create a template below.</li>';
        } else {
          templatesList.innerHTML = data.templates.map(template => `
            <li class="list-group-item">
              <h5>${template.title}</h5>
              <p>${template.description || 'No description available.'}</p>
              <p><small>Course: ${template.course_title}</small></p>
              <button class="btn btn-sm btn-secondary" onclick="useTemplateForReview(${template.id})">Use Template</button>
            </li>
          `).join('');
        }
      } else {
        document.getElementById('reviewTemplatesList').innerHTML = 
          '<li class="list-group-item">Error loading templates. Please try again later.</li>';
      }
    } catch (error) {
      console.error('Load review templates error:', error);
      document.getElementById('reviewTemplatesList').innerHTML = 
        '<li class="list-group-item">Error loading templates. Please try again later.</li>';
    }
  }
  
  async function loadActiveReviews() {
    try {
      const response = await fetch(`${API.BASE_URL}${API.REVIEWS.INSTRUCTOR}`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const reviewsList = document.getElementById('activeReviewsList');
        
        if (data.reviews.length === 0) {
          reviewsList.innerHTML = '<li class="list-group-item">No active reviews found. Create a review below.</li>';
        } else {
          reviewsList.innerHTML = data.reviews.map(review => `
            <li class="list-group-item">
              <h5>${review.title}</h5>
              <p><small>Course: ${review.course_title}</small></p>
              <p><small>Template: ${review.template_title}</small></p>
              <p><small>Due: ${new Date(review.due_date).toLocaleDateString()}</small></p>
              <div class="progress mb-2">
                <div class="progress-bar" role="progressbar" style="width: ${review.completed_count / review.assignment_count * 100}%;" 
                  aria-valuenow="${review.completed_count}" aria-valuemin="0" aria-valuemax="${review.assignment_count}">
                  ${review.completed_count}/${review.assignment_count}
                </div>
              </div>
              <button class="btn btn-sm btn-info" onclick="viewReviewResults(${review.id})">View Results</button>
            </li>
          `).join('');
        }
      } else {
        document.getElementById('activeReviewsList').innerHTML = 
          '<li class="list-group-item">Error loading reviews. Please try again later.</li>';
      }
    } catch (error) {
      console.error('Load active reviews error:', error);
      document.getElementById('activeReviewsList').innerHTML = 
        '<li class="list-group-item">Error loading reviews. Please try again later.</li>';
    }
  }
  
  // Helper function to add instructor modal functionality
  window.viewCourseDetails = function(courseId) {
    // Implementation for viewing course details
    alert('Course details functionality to be implemented');
  };
  
  window.useTemplateForReview = function(templateId) {
    // Implementation for using a template to create a review
    alert('Create review from template functionality to be implemented');
  };
  
  window.viewReviewResults = function(reviewId) {
    // Implementation for viewing review results
    alert('View results functionality to be implemented');
  };


(() => {
  const TARGET_IDS_TO_HIDE = [
    "forms-section",
    "formLogin",
    "formFaculty",
    "faculty-dashboard",
    "student-dashboard"
  ];

  /**
   * Show the landing view and hide the others.
   */
  function showLandingAndHideOthers() {
    // Smooth‐scroll to the top
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Display the landing view with !important
    const landing = document.getElementById("landing-view");
    if (landing) {
      landing.style.setProperty("display", "block", "important");
    }

    // Hide all other sections with !important
    TARGET_IDS_TO_HIDE.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.style.setProperty("display", "none", "important");
      }
    });
  }

  // Attach the click handler to every <a> element inside the <nav>
  document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll("nav a");

    navLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        // If your nav links are real routes, remove the next line.
        // If they are anchors (#) or you handle routing via JS, keep it to prevent reloads.
        event.preventDefault();

        showLandingAndHideOthers();
      });
    });
  });
})();
