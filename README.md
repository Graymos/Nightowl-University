# Night Owl University

A full-stack web application for university management, built as a final project for a web development class.

## Features
- **Student and Faculty Registration/Login**: Secure registration and login for both students and instructors, with JWT authentication.
- **Role-Based Dashboards**: Students and instructors see different dashboards and features based on their role.
- **Course Management**: Instructors can create and manage courses.
- **Review System**: Instructors can create and schedule reviews; students can complete peer reviews.
- **Responsive UI**: Modern, mobile-friendly design using Bootstrap 5 and custom CSS.
- **Security**: Passwords are hashed, and sensitive routes are protected by JWT.

## Tech Stack
- **Frontend**: HTML, CSS (Bootstrap 5, Animate.css), JavaScript
- **Backend**: Node.js, Express, SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Other Libraries**: bcryptjs, cors, sweetalert2

## Project Structure
```
Nightowl-University/
├── src/
│   ├── frontend/      # HTML, CSS, and client-side JS
│   ├── backend/       # Express server, routes, models, DB
│   └── server/        # (Additional backend logic)
├── images/            # Project images and assets
├── .cursor/           # Cursor AI rules
├── package.json       # Project dependencies and scripts
└── README.md          # This file
```

## Getting Started
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the backend server:**
   ```bash
   npm run dev
   # or
   npm start
   ```
   The backend runs on [http://localhost:3001](http://localhost:3001)
3. **Open the frontend:**
   - Open `src/frontend/index.html` in your browser (or serve with a static server).

## Usage
- Register as a student or faculty member.
- Log in to access your dashboard.
- Instructors can manage courses, create reviews, and view reports.
- Students can view/manage reviews and feedback.
- Only instructors can access the faculty dashboard (role-based access enforced).

## Development Notes
- All sensitive actions are protected by JWT.
- Passwords are securely hashed with bcryptjs.

## License
See the license header in each source file.
