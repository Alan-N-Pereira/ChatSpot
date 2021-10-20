// Core Modules
const http = require('http');
const path = require('path');

// Required Modules
const express = require('express');
const socketio = require('socket.io');

// util Modules
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

// Initializing
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = 3000 || process.env.PORT;

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatSpot Bot';

// Run when client connects
io.on('connection', (socket) => {
	socket.on('joinRoom', ({ username, room }) => {
		const user = userJoin(socket.id, username, room);

		socket.join(user.room);

		// Welcomes current user
		socket.emit('message', formatMessage(botName, 'Welcome To ChatSpot!'));

		// Broadcast when a user connects
		socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));

		// Send Users and Room info
		io.to(user.room).emit('roomUsers', {
			room: user.room,
			users: getRoomUsers(user.room)
		});
	});

	// Listen for chatMessage
	socket.on('chatMessage', (msg) => {
		const user = getCurrentUser(socket.id);

		io.to(user.room).emit('message', formatMessage(user.username, msg));
	});

	// Runs when client Disconnects
	socket.on('disconnect', () => {
		const user = userLeave(socket.id);

		if (user) {
			io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));

			// Send Users and Room info
			io.to(user.room).emit('roomUsers', {
				room: user.room,
				users: getRoomUsers(user.room)
			});
		}
	});
});

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
