// Wait until the DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
  updateParallax();
  checkAuthState(); // Check authentication state on page load

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
  document.getElementById('btnShowRegisterFaculty').addEventListener('click', function () {
      document.getElementById('formLogin').style.display = 'none';
      document.getElementById('formStudent').style.display = 'none';
      document.getElementById('formFaculty').style.display = 'block';
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
  document.getElementById('nav-faculty').addEventListener('click', function (event) {
      event.preventDefault();
      document.querySelectorAll('section, form').forEach(el => {
          el.style.display = 'none';
      });
      document.getElementById('faculty-dashboard').style.display = 'block';
  });
  document.getElementById('nav-student').addEventListener('click', function (event) {
      event.preventDefault();
      document.querySelectorAll('section, form').forEach(el => {
          el.style.display = 'none';
      });
      document.getElementById('student-dashboard').style.display = 'block';
  });
  document.getElementById('btnManageCourses').addEventListener('click', function (event) {
      event.preventDefault();
      document.querySelectorAll('section, form').forEach(el => {
          el.style.display = 'none';
      });
      document.getElementById('manage-courses').style.display = 'block';
      document.getElementById('frmCourse').style.display = 'block';

  });
  document.getElementById('btnManageReviews').addEventListener('click', function (event) {
      event.preventDefault();
      document.querySelectorAll('section, form').forEach(el => {
          el.style.display = 'none';
      });
      document.getElementById('manage-reviews').style.display = 'block';
      document.getElementById('frmCreateReview').style.display = 'block';
      document.getElementById('frmScheduleReview').style.display = 'block';

  });

  // --- JWT Authentication Functions ---
  function saveToken(token) {
    localStorage.setItem('jwt_token', token);
  }

  function getToken() {
    return localStorage.getItem('jwt_token');
  }

  function removeToken() {
    localStorage.removeItem('jwt_token');
  }

  function isAuthenticated() {
    const token = getToken();
    return token !== null;
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
    // Redirect to home page
    document.querySelectorAll('section, form').forEach(el => {
      el.style.display = 'none';
    });
    document.getElementById('features-section').style.display = 'block';
    Swal.fire('Success', 'You have been logged out.', 'success');
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
      const res = await fetch('http://localhost:3001/api/users/register/student', {
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

  // --- Login Form Submission ---
  document.getElementById('btnStudentLoginSubmit').addEventListener('click', async function () {
    // Clear previous errors
    clearFieldError('txtStudentLoginEmail');
    clearFieldError('txtStudentLoginPassword');

    const email = document.getElementById('txtStudentLoginEmail').value.trim();
    const password = document.getElementById('txtStudentLoginPassword').value;

    let hasError = false;
    if (!email) {
      showFieldError('txtStudentLoginEmail', 'Email is required.');
      hasError = true;
    }
    if (!password) {
      showFieldError('txtStudentLoginPassword', 'Password is required.');
      hasError = true;
    }
    if (hasError) return;

    try {
      const res = await fetch('http://localhost:3001/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        // Save the JWT token
        if (data.token) {
          saveToken(data.token);
        }
        Swal.fire('Success', `Login successful! Welcome, ${data.user.first_name}.`, 'success');
        checkAuthState(); // Update navigation bar
        // Redirect to appropriate dashboard based on user role
        setTimeout(() => {
          document.querySelectorAll('section, form').forEach(el => {
            el.style.display = 'none';
          });
          if (data.user.role === 'student') {
            document.getElementById('student-dashboard').style.display = 'block';
          } else if (data.user.role === 'faculty') {
            document.getElementById('faculty-dashboard').style.display = 'block';
          }
        }, 1000);
      } else {
        Swal.fire('Error', data.message || 'Login failed.', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Login failed. Please try again later.', 'error');
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

});