// Frontend JavaScript for interacting with the API
document.addEventListener('DOMContentLoaded', function() {
    // API URL
    const API_URL = 'http://localhost:3000/api';
    
    // Token storage
    let authToken = localStorage.getItem('authToken');
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
    // Check if user is logged in
    function checkAuth() {
      if (authToken) {
        // Update UI for logged in user
        document.querySelectorAll('.logged-out-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.logged-in-only').forEach(el => el.style.display = 'block');
        
        // Update user info display
        if (currentUser) {
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
        }
      } else {
        // Update UI for logged out user
        document.querySelectorAll('.logged-out-only').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.logged-in-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.instructor-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.student-only').forEach(el => el.style.display = 'none');
      }
    }
  
    // Handle login form submission
    if (document.getElementById('btnStudentLoginSubmit')) {
      document.getElementById('btnStudentLoginSubmit').addEventListener('click', async function() {
        const email = document.getElementById('txtStudentLoginEmail').value;
        const password = document.getElementById('txtStudentLoginPassword').value;
        
        if (!email || !password) {
          alert('Please enter both email and password');
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
          
          // Redirect based on role
          if (data.user.role === 'instructor') {
            navigateToSection('instructor-dashboard');
          } else {
            navigateToSection('student-dashboard');
          }
          
        } catch (error) {
          alert(`Error: ${error.message}`);
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
  });