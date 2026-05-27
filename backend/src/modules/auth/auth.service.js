const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { query, withTransaction } = require('../../config/db');

/**
 * LOGIN
 * 1. Find the user by email (with their profile joined in)
 * 2. Compare the submitted password against the stored hash
 * 3. If valid, create and return a JWT
 */
const login = async (email, password) => {
  const { rows } = await query(
    `SELECT
       u.id, u.email, u.password_hash, u.role, u.is_active,
       s.id           AS student_id,
       s.first_name   AS s_first_name,
       s.last_name    AS s_last_name,
       s.student_number,
       l.id           AS lecturer_id,
       l.first_name   AS l_first_name,
       l.last_name    AS l_last_name,
       l.staff_number
     FROM users u
     LEFT JOIN students  s ON s.user_id = u.id
     LEFT JOIN lecturers l ON l.user_id = u.id
     WHERE u.email = $1`,
    [email]
  );

  const user = rows[0];

  if (!user || !user.is_active) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 });
  }

  // Determine profile id and name based on role
  let profileId  = null;
  let firstName  = null;
  let lastName   = null;
  let identifier = null;

  if (user.role === 'student') {
    profileId  = user.student_id;
    firstName  = user.s_first_name;
    lastName   = user.s_last_name;
    identifier = user.student_number;
  } else if (user.role === 'lecturer') {
    profileId  = user.lecturer_id;
    firstName  = user.l_first_name;
    lastName   = user.l_last_name;
    identifier = user.staff_number;
  }

  if (!profileId && user.role !== 'admin') {
    throw Object.assign(
      new Error('User profile not found. Please contact an administrator.'),
      { status: 500 }
    );
  }

  const token = jwt.sign(
    {
      id:        user.id,       // users table id
      role:      user.role,
      profileId: profileId,     // students or lecturers table id
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return {
    token,
    user: {
      id:         user.id,
      email:      user.email,
      role:       user.role,
      profileId:  profileId,
      firstName:  firstName,
      lastName:   lastName,
      identifier: identifier,
    }
  };
};

/**
 * REGISTER
 * Creates a user account + the matching profile (student or lecturer)
 * inside a transaction so both inserts succeed or both fail together.
 */
const register = async (data) => {
  const { email, password, role, firstName, lastName, department,
          studentNumber, yearOfStudy, staffNumber } = data;

  // Salt rounds = 12 means bcrypt runs 2^12 = 4096 iterations.
  // Higher = slower = harder to brute-force.
  const passwordHash = await bcrypt.hash(password, 12);

  return withTransaction(async (client) => {
    // 1. Create the auth record
    const { rows: [user] } = await client.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [email, passwordHash, role]
    );

    // 2. Create the role-specific profile
    if (role === 'student') {
      await client.query(
        `INSERT INTO students
           (user_id, student_number, first_name, last_name, department, year_of_study)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.id, studentNumber, firstName, lastName, department, yearOfStudy]
      );
    } else if (role === 'lecturer') {
      await client.query(
        `INSERT INTO lecturers
           (user_id, staff_number, first_name, last_name, department)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, staffNumber, firstName, lastName, department]
      );
    }
    // admin role gets no profile table — just the users row

    return { message: 'Account created successfully' };
  });
};

/**
 * CHANGE PASSWORD
 * Verifies the old password before setting the new one.
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const { rows } = await query(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  );

  const isMatch = await bcrypt.compare(oldPassword, rows[0].password_hash);
  if (!isMatch) {
    throw Object.assign(new Error('Current password is incorrect'), { status: 400 });
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [newHash, userId]
  );

  return { message: 'Password changed successfully' };
};

module.exports = { login, register, changePassword };