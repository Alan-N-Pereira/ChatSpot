// Core Modules
const http = require('http');
const path = require('path');

// Required Modules
const express = require('express');
const socketio = require('socket.io');

// Initializing
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = 3000 || process.env.PORT;

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when client connects
io.on('connection', (socket) => {
	console.log('New web socket connection');

	// Welcomes current user
	socket.emit('message', 'Welcome To ChatSpot!');

	// Broadcast when a user connects
	socket.broadcast.emit('message', 'A user has joined the chat');

	// Runs when client Disconnects
	socket.on('disconnect', () => {
		io.emit('message', 'A user has left the chat');
	});

	// Listen for chatMessage
	socket.on('chatMessage', (msg) => {
		io.emit('message', msg);
	});
});

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
