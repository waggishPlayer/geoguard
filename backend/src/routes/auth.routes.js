const express = require('express');
const { body } = require('express-validator');
const { requireAuth, requireRole, requireApproval } = require('../middleware/auth');

const {
  registerGov,
  registerSiteAdmin,
  registerWorker,
  inviteWorker,
  login,
  getProfile,
  updateProfile,
  listRoles,
  listPendingUsers,
  approveUserRequest,
  rejectUserRequest,
  listWorkers,
  getSlopes,
  deleteWorker
} = require('../controllers/auth.controller');
const { validateRequest } = require('../middleware/validate');

const router = express.Router();

/**
 * ===================================================================
 * PUBLIC ENDPOINTS
 * ===================================================================
 */

// Get available slopes
router.get('/slopes', getSlopes);

// Get available roles
router.get('/roles', listRoles);

// Login endpoint (all roles)
router.post('/login', [
  body('password').notEmpty().trim(),
  body('email').optional().isEmail(),
  body('phone').optional().isMobilePhone()
], validateRequest, login);

/**
 * ===================================================================
 * REGISTRATION ENDPOINTS
 * ===================================================================
 */

// Field Worker Registration (requires invite)
router.post('/register/worker', [
  body('phone').notEmpty().trim(),
  body('name').notEmpty().trim(),
  body('password').isLength({ min: 6 }),
  body('otp').notEmpty()
], validateRequest, registerWorker);

// Site Admin Registration
router.post('/register/site-admin', [
  body('name').notEmpty().trim(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('phone').notEmpty().trim(),
  body('mine_action').isIn(['create', 'join'])
], validateRequest, registerSiteAdmin);

// Government Authority Registration
router.post('/register/gov', [
  body('name').notEmpty().trim(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('phone').notEmpty().trim(),
  body('department').notEmpty().trim()
], validateRequest, registerGov);

/**
 * ===================================================================
 * AUTHENTICATED ENDPOINTS
 * ===================================================================
 */

// Get current user profile
router.get('/me', requireAuth, getProfile);

// Update profile
router.put('/me', requireAuth, [
  body('name').optional().trim(),
  body('phone').optional().trim(),
  body('newPassword').optional().isLength({ min: 6 })
], validateRequest, updateProfile);

/**
 * ===================================================================
 * SITE ADMIN ENDPOINTS
 * ===================================================================
 */

// Invite field worker (site admin only)
router.post(
  '/invite/worker',
  requireAuth,
  requireApproval,
  requireRole('site_admin', 'super_admin'),
  [body('phone').notEmpty().trim()],
  validateRequest,
  inviteWorker
);

// List workers at site (site admin only)
router.get(
  '/workers',
  requireAuth,
  requireApproval,
  requireRole('site_admin', 'super_admin'),
  listWorkers
);

// Delete worker
router.delete(
  '/admin/worker/:id',
  requireAuth,
  requireApproval,
  requireRole('site_admin', 'super_admin'),
  deleteWorker
);

/**
 * ===================================================================
 * SUPER ADMIN ENDPOINTS
 * ===================================================================
 */

// List pending users
router.get(
  '/admin/pending-users',
  requireAuth,
  requireApproval,
  requireRole('super_admin'),
  listPendingUsers
);

// Approve user
router.post(
  '/admin/approve-user',
  requireAuth,
  requireApproval,
  requireRole('super_admin'),
  [body('user_id').isInt()],
  validateRequest,
  approveUserRequest
);

// Reject user
router.post(
  '/admin/reject-user',
  requireAuth,
  requireApproval,
  requireRole('super_admin'),
  [body('user_id').isInt()],
  validateRequest,
  rejectUserRequest
);

module.exports = router;
