const { randomUUID } = require('crypto');
const bcrypt = require('bcryptjs');

// In-memory storage for lightweight, LAN-only auth + SOS events
const state = {
  users: [],
  sessions: [],
  sosEvents: []
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
};

async function registerUser({ username, password, role = 'user' }) {
  if (!username || !password) {
    throw new Error('username and password are required');
  }
  const existing = state.users.find((u) => u.username === username);
  if (existing) {
    throw new Error('user already exists');
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: randomUUID(),
    username,
    role,
    passwordHash,
    createdAt: new Date().toISOString()
  };
  state.users.push(user);
  return sanitizeUser(user);
}

async function loginUser({ username, password }) {
  const user = state.users.find((u) => u.username === username);
  if (!user) throw new Error('invalid credentials');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error('invalid credentials');
  const token = randomUUID();
  state.sessions.push({ token, userId: user.id, createdAt: Date.now() });
  return { token, user: sanitizeUser(user) };
}

function getUserByToken(token) {
  if (!token) return null;
  const session = state.sessions.find((s) => s.token === token);
  if (!session) return null;
  const user = state.users.find((u) => u.id === session.userId);
  return sanitizeUser(user);
}

function listUsers() {
  return state.users.map(sanitizeUser);
}

function recordSosEvent(payload) {
  const event = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    ...payload
  };
  state.sosEvents.unshift(event);
  state.sosEvents = state.sosEvents.slice(0, 50);
  return event;
}

function recentSosEvents() {
  return state.sosEvents;
}

module.exports = {
  registerUser,
  loginUser,
  getUserByToken,
  listUsers,
  recordSosEvent,
  recentSosEvents
};
