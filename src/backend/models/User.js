const { db } = require('../config/database');

class User {
  static async create(userData) {
    return new Promise((resolve, reject) => {
      const { first_name, middle_name, last_name, email, password, phone_number, role } = userData;
      const sql = `
        INSERT INTO users (first_name, middle_name, last_name, email, password, phone_number, role)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(sql, [first_name, middle_name, last_name, email, password, phone_number, role], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        // Get the created user using the lastID
        User.findById(this.lastID)
          .then(user => resolve(user))
          .catch(err => reject(err));
      });
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE email = ?';
      db.get(sql, [email], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      });
    });
  }

  static async update(id, userData) {
    return new Promise((resolve, reject) => {
      const { first_name, middle_name, last_name, email, phone_number, discord_id, teams_id } = userData;
      const sql = `
        UPDATE users 
        SET first_name = ?, middle_name = ?, last_name = ?, email = ?, 
            phone_number = ?, discord_id = ?, teams_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(sql, [first_name, middle_name, last_name, email, phone_number, discord_id, teams_id, id], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        // Get the updated user
        User.findById(id)
          .then(user => resolve(user))
          .catch(err => reject(err));
      });
    });
  }

  static async updatePassword(id, hashedPassword) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE users 
        SET password = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(sql, [hashedPassword, id], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }
}

module.exports = User; 