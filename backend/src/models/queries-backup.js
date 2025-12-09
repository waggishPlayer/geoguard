// Minimal stub for queries.js (database disabled for LAN SOS server)
module.exports = {
  getQueuedNotifications: () => Promise.resolve({ rows: [] }),
  markNotificationQueued: () => Promise.resolve(),
  getStaleNotifications: () => Promise.resolve({ rows: [] }),
  touchNotificationQueue: () => Promise.resolve()
};
