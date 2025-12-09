require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

// Socket.io setup for real-time alerts
const io = new Server(server, {
  cors: {
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected to Socket.io');

  socket.on('disconnect', () => {
    console.log('Client disconnected from Socket.io');
  });

  socket.on('sos', (data) => {
    console.log('SOS event received:', data);
    io.emit('sos', data);
  });
});

app.set('io', io);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
});
