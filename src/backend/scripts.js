// Wait until the DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
  updateParallax();
  checkAuthState(); // Check authentication state on page load

  // Navigation: Hide all sections/forms and show the target section
  window.navigateToSection = function (section, event) {
      if (event) {
          event.preventDefault();
      }
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
      hero.style.backgroundPosition = "center " + (-scrolled * -0.45) + "px";
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

  document.getElementById('btnShowLoginFaculty').addEventListener('click', function () {
      document.getElementById('formLogin').style.display = 'block';
      document.getElementById('formStudent').style.display = 'none';
      document.getElementById('formFaculty').style.display = 'none';
  });

  // --- NEW: Navbar Login/Register buttons ---
  document.getElementById('nav-login').addEventListener('click', function (event) {
      event.preventDefault();
      // Hide all sections/forms
      document.querySelectorAll('section, form').forEach(el => {
          el.style.display = 'none';
      });
      // Show forms section and login form
      document.getElementById('forms-section').style.display = 'block';
      document.getElementById('formLogin').style.display = 'block';
      document.getElementById('formStudent').style.display = 'none';
      document.getElementById('formFaculty').style.display = 'none';
  });
  document.getElementById('nav-register').addEventListener('click', function (event) {
      event.preventDefault();
      // Hide all sections/forms
      document.querySelectorAll('section, form').forEach(el => {
          el.style.display = 'none';
      });
      // Show forms section and student registration form
      document.getElementById('forms-section').style.display = 'block';
      document.getElementById('formStudent').style.display = 'block';
      document.getElementById('formLogin').style.display = 'none';
      document.getElementById('formFaculty').style.display = 'none';
  });
  // Faculty Dashboard Navigation
  document.getElementById('nav-faculty').addEventListener('click', function (event) {
      event.preventDefault();
      // Decode JWT to check user role
      const token = getToken();
      let userRole = null;
      if (token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const payload = JSON.parse(jsonPayload);
          userRole = payload.role;
        } catch (err) {
          userRole = null;
        }
      }
      if (userRole === 'instructor') {
        document.querySelectorAll('section, form').forEach(el => {
            el.style.display = 'none';
        });
        document.getElementById('faculty-dashboard').style.display = 'block';
      } else {
        Swal.fire('Access Denied', 'You must be an instructor to access the faculty dashboard.', 'error');
      }
  });
  // Student Dashboard Navigation
  document.getElementById('nav-student').addEventListener('click', function (event) {
      event.preventDefault();
      // Decode JWT to check user role
      const token = getToken();
      let userRole = null;
      if (token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const payload = JSON.parse(jsonPayload);
          userRole = payload.role;
        } catch (err) {
          userRole = null;
        }
      }
      if (userRole === 'student' || userRole === 'instructor') {
        document.querySelectorAll('section, form').forEach(el => {
            el.style.display = 'none';
        });
        document.getElementById('student-dashboard').style.display = 'block';
      } else {
        Swal.fire('Access Denied', 'You must be logged in as a student or faculty to access the student dashboard.', 'error');
      }
  });
  // Faculty Manage Courses Navigation
  document.getElementById('btnManageCourses').addEventListener('click', function (event) {
      event.preventDefault();
      document.querySelectorAll('section, form').forEach(el => {
          el.style.display = 'none';
      });
      document.getElementById('manage-courses').style.display = 'block';
      document.getElementById('frmCourse').style.display = 'block';

  });
  // Faculty Manage Reviews Navigation
  document.getElementById('btnManageReviews').addEventListener('click', async function (event) {
      event.preventDefault();
      document.querySelectorAll('section, form').forEach(el => {
          el.style.display = 'none';
      });
      document.getElementById('manage-reviews').style.display = 'block';
      document.getElementById('frmCreateReview').style.display = 'block';
      // Populate courses dropdown
      const courseSelect = document.getElementById('selReviewCourse');
      courseSelect.innerHTML = '<option value="" selected disabled>Select Course</option>';
      try {
        const token = getToken();
        const res = await fetch('http://localhost:3001/api/courses/instructor', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data.courses)) {
          data.courses.forEach(course => {
            const opt = document.createElement('option');
            opt.value = course.id;
            opt.textContent = course.title + ' (' + course.code + ')';
            courseSelect.appendChild(opt);
          });
        }
      } catch (err) {
        // Optionally show error
      }
      // Clear reviews table
      document.getElementById('tblReviewsBodyFaculty').innerHTML = '';
  });

  // When a course is selected, fetch and display reviews for that course
  document.getElementById('selReviewCourse').addEventListener('change', async function() {
    const courseId = this.value;
    const tbody = document.getElementById('tblReviewsBodyFaculty');
    tbody.innerHTML = '';
    if (!courseId) return;
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:3001/api/reviews/instructor`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data.reviews)) {
        const filtered = data.reviews.filter(r => r.course_id == courseId);
        if (filtered.length === 0) {
          tbody.innerHTML = '<tr><td colspan="3" class="text-center">No reviews for this course</td></tr>';
        } else {
          filtered.forEach(review => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${review.template_title || review.title}</td><td>${review.instructions || ''}</td><td><!-- Actions here --></td>`;
            tbody.appendChild(tr);
          });
        }
      }
    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center">Error loading reviews</td></tr>';
    }
  });

  // Faculty Manage Reports Navigation
  document.getElementById('btnManageReports').addEventListener('click', function (event) {
      event.preventDefault();
      document.querySelectorAll('section, form').forEach(el => {
          el.style.display = 'none';
      });
      document.getElementById('manage-reports').style.display = 'block';
      document.getElementById('frmReport').style.display = 'block';

  });
  // Student Manage Reviews Navigation
  document.getElementById('btnManageReviewsStudent').addEventListener('click', function (event) {
      event.preventDefault();
      document.querySelectorAll('section, form').forEach(el => {
          el.style.display = 'none';
      });
      document.getElementById('manage-reviews-student').style.display = 'block';
      document.getElementById('frmReviewStudent').style.display = 'block';
      loadPendingReviews();
  });

  // Update loadPendingReviews to fetch reviews for the logged-in student
  async function loadPendingReviews() {
    const tbody = document.getElementById('tblReviewsBody');
    tbody.innerHTML = '';
    try {
      const token = getToken();
      // Fetch reviews assigned to the student
      const res = await fetch('http://localhost:3001/api/reviews/student', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!Array.isArray(data.reviews) || data.reviews.length === 0) {
        tbody.innerHTML = '<tr><td class="text-center" colspan="4">No pending reviews</td></tr>';
        return;
      }
      data.reviews.forEach(review => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${review.teammate_name || ''}</td><td>${review.course_title || ''}</td><td>${review.status || ''}</td><td><!-- Actions here --></td>`;
        tbody.appendChild(tr);
      });
    } catch (err) {
      tbody.innerHTML = '<tr><td class="text-center" colspan="4">Error loading reviews</td></tr>';
    }
  }

  // --- JWT Authentication Functions ---
  function saveToken(token) {
    localStorage.setItem('authToken', token);
  }

  function getToken() {
    return localStorage.getItem('authToken');
  }

  function removeToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  }

  function isAuthenticated() {
    const token = getToken();
    const user = localStorage.getItem('currentUser');
    return token !== null && user !== null;
  }

  function checkAuthState() {
    const navLoginButton = document.getElementById('nav-login');
    const navRegisterButton = document.getElementById('nav-register');
    const navLogoutButton = document.getElementById('nav-logout');
    
    if (isAuthenticated()) {
      // User is logged in
      navLoginButton.style.display = 'none';
      navRegisterButton.style.display = 'none';
      navLogoutButton.style.display = 'block';
    } else {
      // User is not logged in
      navLoginButton.style.display = 'block';
      navRegisterButton.style.display = 'block';
      navLogoutButton.style.display = 'none';
    }
  }

  // --- Logout function ---
  document.getElementById('nav-logout').addEventListener('click', function (event) {
    event.preventDefault();
    removeToken();
    checkAuthState();
    
    // Redirect to index.html without hash
    Swal.fire('Success', 'You have been logged out.', 'success').then(() => {
      window.location.href = 'index.html';
    });
  });

  document.getElementById('btnStudentLogout').addEventListener('click', function (event) {
    event.preventDefault();
    removeToken();
    checkAuthState();
    
    // Redirect to index.html without hash
    Swal.fire('Success', 'You have been logged out.', 'success').then(() => {
      window.location.href = 'index.html';
    });
  });

  document.getElementById('btnFacultyLogout').addEventListener('click', function (event) {
    event.preventDefault();
    removeToken();
    checkAuthState();
    
    // Redirect to index.html without hash
    Swal.fire('Success', 'You have been logged out.', 'success').then(() => {
      window.location.href = 'index.html';
    });
  });

  // --- Helper: Show or clear error messages below fields ---
  function showFieldError(inputId, message) {
    let input = document.getElementById(inputId);
    let errorElem = input.nextElementSibling;
    if (!errorElem || !errorElem.classList.contains('field-error')) {
      errorElem = document.createElement('div');
      errorElem.className = 'field-error';
      errorElem.style.color = 'red';
      errorElem.style.fontSize = '0.95em';
      errorElem.style.marginTop = '2px';
      input.parentNode.insertBefore(errorElem, input.nextSibling);
    }
    errorElem.textContent = message;
  }
  function clearFieldError(inputId) {
    let input = document.getElementById(inputId);
    let errorElem = input.nextElementSibling;
    if (errorElem && errorElem.classList.contains('field-error')) {
      errorElem.textContent = '';
    }
  }

  // --- Registration Form Submission ---
  document.getElementById('btnStudentRegisterSubmit').addEventListener('click', async function () {
    // Clear all previous errors
    ['txtStudentFirstname', 'txtStudentMiddlename', 'txtStudentLastname', 'txtStudentEmail', 'txtStudentPassword', 'txtStudentPasswordConfirm', 'txtStudentPhoneNumber'].forEach(clearFieldError);

    const first_name = document.getElementById('txtStudentFirstname').value.trim();
    const middle_name = document.getElementById('txtStudentMiddlename').value.trim();
    const last_name = document.getElementById('txtStudentLastname').value.trim();
    const email = document.getElementById('txtStudentEmail').value.trim();
    const password = document.getElementById('txtStudentPassword').value;
    const passwordConfirm = document.getElementById('txtStudentPasswordConfirm').value;
    const phone_number = document.getElementById('txtStudentPhoneNumber').value.trim();
    const userType = document.getElementById('selUserType').value;

    let hasError = false;

    // Helper to highlight fields
    function highlightField(id) {
      const el = document.getElementById(id);
      if (el) el.classList.add('is-invalid');
    }
    function clearHighlight(id) {
      const el = document.getElementById(id);
      if (el) el.classList.remove('is-invalid');
    }
    ['txtStudentFirstname', 'txtStudentMiddlename', 'txtStudentLastname', 'txtStudentEmail', 'txtStudentPassword', 'txtStudentPasswordConfirm', 'txtStudentPhoneNumber'].forEach(clearHighlight);

    if (!first_name) {
      showFieldError('txtStudentFirstname', 'First name is required.');
      highlightField('txtStudentFirstname');
      hasError = true;
    }
    if (!last_name) {
      showFieldError('txtStudentLastname', 'Last name is required.');
      highlightField('txtStudentLastname');
      hasError = true;
    }
    if (!email) {
      showFieldError('txtStudentEmail', 'Email is required.');
      highlightField('txtStudentEmail');
      hasError = true;
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      showFieldError('txtStudentEmail', 'Please enter a valid email address.');
      highlightField('txtStudentEmail');
      hasError = true;
    }
    if (!password) {
      showFieldError('txtStudentPassword', 'Password is required.');
      highlightField('txtStudentPassword');
      hasError = true;
    } else if (password.length < 8) {
      showFieldError('txtStudentPassword', 'Password must be at least 8 characters.');
      highlightField('txtStudentPassword');
      hasError = true;
    }
    if (!passwordConfirm) {
      showFieldError('txtStudentPasswordConfirm', 'Please confirm your password.');
      highlightField('txtStudentPasswordConfirm');
      hasError = true;
    } else if (password !== passwordConfirm) {
      showFieldError('txtStudentPasswordConfirm', 'Passwords do not match.');
      highlightField('txtStudentPasswordConfirm');
      hasError = true;
    }
    if (!userType) {
      showFieldError('selUserType', 'Please select a role.');
      highlightField('selUserType');
      hasError = true;
    }

    if (hasError) return;

    // Disable button and show loading
    const btn = document.getElementById('btnStudentRegisterSubmit');
    btn.disabled = true;
    const swalLoading = Swal.fire({
      title: 'Registering...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      // Choose endpoint based on user type
      const endpoint = userType === 'instructor' 
        ? 'http://localhost:3001/api/users/register/faculty' 
        : 'http://localhost:3001/api/users/register/student';
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name,
          middle_name,
          last_name,
          email,
          password,
          phone_number
        })
      });
      const data = await res.json();
      Swal.close();
      btn.disabled = false;
      if (res.ok) {
        await Swal.fire('Success', 'Registration successful! You can now log in.', 'success');
        // Fade out register, fade in login
        const regForm = document.getElementById('formStudent');
        const loginForm = document.getElementById('formLogin');
        regForm.classList.add('animate__animated', 'animate__fadeOut');
        setTimeout(() => {
          regForm.style.display = 'none';
          regForm.classList.remove('animate__animated', 'animate__fadeOut');
          loginForm.style.display = 'block';
          loginForm.classList.add('animate__animated', 'animate__fadeIn');
          setTimeout(() => {
            loginForm.classList.remove('animate__animated', 'animate__fadeIn');
          }, 800);
        }, 800);
      } else {
        // Show error and highlight field if possible
        let errorField = null;
        if (data.message && data.message.toLowerCase().includes('email')) errorField = 'txtStudentEmail';
        if (errorField) {
          highlightField(errorField);
          showFieldError(errorField, data.message || 'Email error.');
        } else {
          await Swal.fire('Error', data.message || 'Registration failed.', 'error');
        }
      }
    } catch (err) {
      Swal.close();
      btn.disabled = false;
      await Swal.fire('Error', 'Registration failed. Please try again later.', 'error');
    }
  });

  // --- Add JWT token to all API requests ---
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const token = getToken();
    
    // If it's an options object (args[1]), add Authorization header
    if (token && args[1] && typeof args[1] === 'object') {
      args[1].headers = args[1].headers || {};
      args[1].headers['Authorization'] = `Bearer ${token}`;
    }
    // If no options object, create one with Authorization header
    else if (token && !args[1]) {
      args[1] = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
    }
    
    return originalFetch.apply(this, args);
  };

  // --- Handle token expiration ---
  function setupTokenExpirationCheck() {
    setInterval(() => {
      const token = getToken();
      if (token) {
        // You can add token expiration check here
        // For example, decode JWT and check exp claim
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const payload = JSON.parse(jsonPayload);
          
          // Check if token is expired
          if (payload.exp && Date.now() >= payload.exp * 1000) {
            removeToken();
            checkAuthState();
            Swal.fire('Session Expired', 'Your session has expired. Please log in again.', 'warning');
          }
        } catch (err) {
          console.error('Token parsing error:', err);
        }
      }
    }, 60000); // Check every minute
  }

  setupTokenExpirationCheck();

  // --- Faculty Create Review Form Submission ---
  document.getElementById('frmCreateReview').addEventListener('submit', async function(event) {
    event.preventDefault();
    const courseId = document.getElementById('selReviewCourse').value;
    const title = document.getElementById('txtReviewTitle').value.trim();
    const instructions = document.getElementById('txtReviewInstructions').value.trim();
    if (!courseId || !title) {
      Swal.fire('Error', 'Please select a course and enter a review title.', 'error');
      return;
    }
    try {
      const token = getToken();
      // 1. Create the review template (with correct question keys for backend)
      const templateRes = await fetch('http://localhost:3001/api/reviews/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description: instructions,
          courseId,
          questions: [{ text: 'Peer Review', type: 'likert', required: true }]
        })
      });
      if (!templateRes.ok) {
        const data = await templateRes.json();
        throw new Error(data.message || 'Failed to create review template');
      }
      const templateData = await templateRes.json();
      const templateId = templateData.template.id;
      // 2. Fetch all teams for the course
      const teamsRes = await fetch(`http://localhost:3001/api/courses/${courseId}/teams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!teamsRes.ok) throw new Error('Failed to fetch teams');
      const teams = await teamsRes.json();
      // 3. For each team, fetch members and build assignments
      let assignments = [];
      for (const team of teams) {
        const membersRes = await fetch(`http://localhost:3001/api/teams/${team.id}/members`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!membersRes.ok) continue;
        const members = await membersRes.json();
        // Each student reviews every other student in their team
        for (const reviewer of members) {
          for (const reviewee of members) {
            if (reviewer.id !== reviewee.id) {
              assignments.push({ reviewerId: reviewer.id, revieweeId: reviewee.id });
            }
          }
        }
      }
      if (assignments.length === 0) throw new Error('No team assignments found');
      // 4. Create the review and assignments
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const reviewRes = await fetch('http://localhost:3001/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          templateId,
          courseId,
          dueDate,
          assignments
        })
      });
      if (!reviewRes.ok) {
        const data = await reviewRes.json();
        throw new Error(data.message || 'Failed to create review assignments');
      }
      // Refresh the reviews table
      document.getElementById('selReviewCourse').dispatchEvent(new Event('change'));
      Swal.fire('Success', 'Review created and assigned to students in teams.', 'success');
      document.getElementById('txtReviewTitle').value = '';
      document.getElementById('txtReviewInstructions').value = '';
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to create review', 'error');
    }
  });

  // --- Manage Evaluations Navigation ---
  document.getElementById('btnOpenEvalBuilder').addEventListener('click', async function (event) {
    event.preventDefault();
    document.querySelectorAll('section, form').forEach(el => {
      el.style.display = 'none';
    });
    document.getElementById('manage-evaluations').style.display = 'block';
    document.getElementById('frmEvaluationBuilder').reset();
    document.getElementById('questionsContainer').innerHTML = '';
    addQuestion(); // Start with one question
    // Fetch and display existing evaluations
    await loadEvaluations();
  });

  async function loadEvaluations() {
    const tbody = document.getElementById('tblEvaluationsBody');
    tbody.innerHTML = '';
    try {
      const token = getToken();
      const res = await fetch('http://localhost:3001/api/reviews/templates/instructor', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!Array.isArray(data.templates) || data.templates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No evaluations found. Create one above!</td></tr>';
        return;
      }
      data.templates.forEach(tmpl => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${tmpl.title}</td><td>${tmpl.course_title || ''}</td><td>${tmpl.questions ? tmpl.questions.length : 0}</td><td><button class='btn btn-sm btn-primary btnEditEval' data-id='${tmpl.id}'>Edit</button> <button class='btn btn-sm btn-danger btnDeleteEval' data-id='${tmpl.id}'>Delete</button></td>`;
        tbody.appendChild(tr);
      });
      // Attach event listeners for actions
      tbody.querySelectorAll('.btnDeleteEval').forEach(btn => {
        btn.onclick = async function() {
          const evalId = this.getAttribute('data-id');
          const confirmed = await Swal.fire({
            title: 'Delete Evaluation',
            text: 'Are you sure you want to delete this evaluation?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
          });
          if (confirmed.isConfirmed) {
            try {
              const token = getToken();
              const res = await fetch(`http://localhost:3001/api/reviews/templates/${evalId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (!res.ok) throw new Error('Failed to delete evaluation');
              await loadEvaluations();
              Swal.fire('Deleted!', 'Evaluation has been deleted.', 'success');
            } catch (err) {
              Swal.fire('Error', err.message || 'Failed to delete evaluation', 'error');
            }
          }
        };
      });
      tbody.querySelectorAll('.btnEditEval').forEach(btn => {
        btn.onclick = function() {
          Swal.fire('Edit Evaluation', 'Edit functionality coming soon!', 'info');
        };
      });
    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center">Error loading evaluations</td></tr>';
    }
  }

  document.getElementById('btnAddQuestion').addEventListener('click', function() {
    addQuestion();
  });

  function addQuestion() {
    const idx = document.querySelectorAll('.question-block').length;
    const qDiv = document.createElement('div');
    qDiv.className = 'question-block card p-3 mb-3';
    qDiv.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Question ${idx + 1}</strong>
        <button type="button" class="btn btn-danger btn-sm btnRemoveQuestion">Remove</button>
      </div>
      <div class="mb-2">
        <label>Question Text</label>
        <input type="text" class="form-control question-text" required>
      </div>
      <div class="mb-2">
        <label>Type</label>
        <select class="form-select question-type">
          <option value="likert">Likert (1-5)</option>
          <option value="multiple_choice">Multiple Choice</option>
          <option value="short_answer">Short Answer</option>
        </select>
      </div>
      <div class="mb-2 options-container" style="display:none;"></div>
      <div class="form-check">
        <input class="form-check-input question-required" type="checkbox" checked>
        <label class="form-check-label">Required</label>
      </div>
    `;
    document.getElementById('questionsContainer').appendChild(qDiv);
    // Remove question
    qDiv.querySelector('.btnRemoveQuestion').onclick = function() {
      qDiv.remove();
      updateQuestionNumbers();
    };
    // Handle type change
    qDiv.querySelector('.question-type').onchange = function(e) {
      const optionsDiv = qDiv.querySelector('.options-container');
      if (e.target.value === 'multiple_choice') {
        optionsDiv.style.display = '';
        renderOptionsUI(optionsDiv);
      } else {
        optionsDiv.style.display = 'none';
        optionsDiv.innerHTML = '';
      }
    };
  }
  function updateQuestionNumbers() {
    document.querySelectorAll('.question-block').forEach((q, i) => {
      q.querySelector('strong').textContent = `Question ${i + 1}`;
    });
  }
  function renderOptionsUI(container) {
    container.innerHTML = '';
    const list = document.createElement('div');
    list.className = 'option-list';
    container.appendChild(list);
    addOption(list);
    const btnAdd = document.createElement('button');
    btnAdd.type = 'button';
    btnAdd.className = 'btn btn-sm btn-secondary mt-2';
    btnAdd.textContent = 'Add Option';
    btnAdd.onclick = () => addOption(list);
    container.appendChild(btnAdd);
  }
  function addOption(list) {
    const idx = list.children.length;
    const optDiv = document.createElement('div');
    optDiv.className = 'input-group mb-1';
    optDiv.innerHTML = `
      <input type="text" class="form-control option-text" placeholder="Option ${idx + 1}" required>
      <button type="button" class="btn btn-danger btnRemoveOption">Remove</button>
    `;
    list.appendChild(optDiv);
    optDiv.querySelector('.btnRemoveOption').onclick = function() {
      optDiv.remove();
    };
  }
  // Handle evaluation save
  document.getElementById('frmEvaluationBuilder').addEventListener('submit', async function(e) {
    e.preventDefault();
    const title = document.getElementById('txtEvalTitle').value.trim();
    const description = document.getElementById('txtEvalDescription').value.trim();
    const questions = [];
    let valid = true;
    document.querySelectorAll('.question-block').forEach(q => {
      const text = q.querySelector('.question-text').value.trim();
      const type = q.querySelector('.question-type').value;
      const required = q.querySelector('.question-required').checked;
      let options = undefined;
      if (type === 'multiple_choice') {
        options = [];
        q.querySelectorAll('.option-text').forEach(opt => {
          if (opt.value.trim()) options.push(opt.value.trim());
        });
        if (!options || options.length < 2) valid = false;
      }
      if (!text) valid = false;
      questions.push({ text, type, required, options });
    });
    if (!title || questions.length === 0 || !valid) {
      Swal.fire('Error', 'Please fill out all fields and ensure each multiple choice question has at least 2 options.', 'error');
      return;
    }
    try {
      const token = getToken();
      // Use the selected course from the manage reviews dropdown
      const courseId = document.getElementById('selReviewCourse').value;
      const res = await fetch('http://localhost:3001/api/reviews/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          courseId,
          questions
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save evaluation');
      }
      Swal.fire('Success', 'Evaluation saved!', 'success');
      // Optionally refresh evaluations list
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to save evaluation', 'error');
    }
  });

});