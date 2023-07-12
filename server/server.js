const express = require('express');
const cors = require('cors');
const app = express();
   
// Enable CORS for all routes
app.use(cors());

// Import jwt for API's endpoints authentication
const jwt = require('jsonwebtoken');
const http = require('http');
require('dotenv').config({path:__dirname+'/../client/.env'});
const httpServer = http.createServer(app);
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
	process.env.DB_DATABASE,
	process.env.DB_USERNAME,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		dialect: 'mysql',
		logging: false
	}
);

sequelize.authenticate().then(() => {
	console.log('Connection has been established successfully.');
}).catch((error) => {
	console.error('Unable to connect to the database: ', error);
});

const Message = require('./models/Message')(sequelize, Sequelize.DataTypes);
const User = require('./models/User')(sequelize, Sequelize.DataTypes);

const io = require("socket.io")(httpServer, {
	cors: {
		origin: process.env.CHAT_SERVER_ORIGIN,
		methods: ["GET", "POST"],
		allowedHeaders: ["my-custom-header"],
		credentials: true
	}
});
  
app.get('/', (req, res) => {
  	res.send('<h1>Hello world</h1>');
});

// Store connected users
const users = {};

io.on('connection', (socket) => {

	/* let token = socket.handshake.auth.token;
	console.log(token); */
	console.log('a user connected');

	// User login event
	socket.on('login', (username) => {
		// Store the username with the socket ID
		users[socket.id] = username;
		console.log(`User logged in: ${username}`);
	});


	// Join a room
	socket.on('join', (room) => {
		socket.join(room);
		console.log(`User joined room: ${room}`);
	});
	// Leave a room
	socket.on('leave', (room) => {
		socket.leave(room);
		console.log(`User left room: ${room}`);
	});
	socket.on('send-message', async (data) => {
		let message;
		if(data.lastMessageId > 0){
			await Message.update({
				message: data.message,
				edited: '1',
				updated_at: Sequelize.NOW,
			}, {
				where: {
					id: data.lastMessageId,
				}
			});
			message = { "id": data.lastMessageId, "message": data.message, "created_at": null, "edited": "1" };
		} else {
			message = await Message.create({
				'message': data.message,
				'edited': '0',
				'created_at': Sequelize.NOW,
			});
		}
		// Broadcast the message to all users in the room
		io.to(data.room).emit('send-message-response',message);
	});
	socket.on('jwt-token', (token) => {
		// Verify the token using jwt.verify method
        const decode = jwt.verify(token, process.env.JWT_SECRET);
		console.log(decode);
	});
	socket.on('typing', (data) => {
        io.to(data.room).emit('typing', data.username);
    });

    socket.on('stopTyping', (data) => {
        io.to(data.room).emit('stopTyping');
    });

	socket.on('disconnect', () => {
		const username = users[socket.id];
		console.log(`User disconnected: ${username}`);

		// Remove the user from the connected users list
		delete users[socket.id];
	})
});

app.get('/messages/list', async (req, res) => {
	let messages = await Message.findAll({
		/* include: {
			model: User,
			as: 'User'
		} */
	});
	return res.send({ 'status': true, 'messages': messages });
});
app.get('/users/list', async (req, res) => {
	let users = await User.findAll();
	return res.send({ 'status': true, 'users': users });
});

httpServer.listen(3000, () => {
  console.log('listening on '+process.env.CHAT_SERVER_URL);
});