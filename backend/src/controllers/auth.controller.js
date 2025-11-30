const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {
  createUser,
  getUserByEmail,
  getRoleById,
  getRoleByName,
  getUsersCount,
  createGovAuthority,
  updateUserProfile,
  updateUserPassword,
  getUserById
} = require('../models/queries');
const config = require('../config/env');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest;
};

const PUBLIC_ROLES = ['site_admin', 'field_worker', 'gov_authority'];

const register = async (req, res, next) => {
  try {
    const { roleId = null, name, email, phone, password, department = null } = req.body;

    const existingUser = await getUserByEmail(email);
    if (existingUser.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const userCountResult = await getUsersCount();
    const totalUsers = Number(userCountResult.rows[0]?.count || 0);
    let targetRole;

    if (totalUsers === 0) {
      const superRole = await getRoleByName('super_admin');
      targetRole = superRole.rows[0];
    } else if (roleId) {
      const role = await getRoleById(roleId);
      if (role.rowCount === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role selected'
        });
      }
      if (role.rows[0].name === 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Only Super Admin can create Super Admin accounts'
        });
      }
      if (!PUBLIC_ROLES.includes(role.rows[0].name)) {
        return res.status(403).json({
          success: false,
          message: 'Role not available for public registration'
        });
      }
      targetRole = role.rows[0];
    } else {
      const defaultRole = await getRoleByName('field_worker');
      targetRole = defaultRole.rows[0];
    }

    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: 'Unable to determine role for registration'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const createdUser = await createUser(targetRole.id, name, email, phone, passwordHash);
    const userRecord = createdUser.rows[0];

    if (targetRole.name === 'gov_authority') {
      await createGovAuthority(userRecord.id, department || 'General', null);
    }

    const user = sanitizeUser(userRecord);
    user.role_name = targetRole.name;

    return res.status(201).json({
      success: true,
      message: totalUsers === 0
        ? 'First Super Admin created successfully'
        : 'Registration successful',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userResult = await getUserByEmail(email);
    if (userResult.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = userResult.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      {
        sub: user.id,
        roleId: user.role_id,
        email: user.email
      },
      config.jwtSecret,
      { expiresIn: '1d' }
    );

    const roleResult = await getRoleById(user.role_id);
    const roleName = roleResult.rowCount > 0 ? roleResult.rows[0].name : null;
    const safeUser = sanitizeUser(user);
    safeUser.role_name = roleName;

    return res.json({
      success: true,
      token,
      data: safeUser
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name = null, phone = null, currentPassword = null, newPassword = null } = req.body;

    const userResult = await getUserById(req.user.id);
    if (userResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password required to set a new password'
        });
      }
      const isValid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await updateUserPassword(req.user.id, passwordHash);
    }

    const updatedProfile = await updateUserProfile(req.user.id, name, phone);
    const updatedUser = sanitizeUser(updatedProfile.rows[0]);

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  updateProfile
};


