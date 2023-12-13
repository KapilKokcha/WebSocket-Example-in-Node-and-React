const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws'); // Import the ws library

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server }); // Create a WebSocket server

app.use(cors());
app.use(bodyParser.json());

let todos = [
  { id: 1, text: 'Learn Node.js', done: false },
  { id: 2, text: 'Build an API', done: true },
];

app.get('/api/todos', (req, res) => {
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const newTodo = req.body;
  todos.push(newTodo);
  broadcastTodos(); // Broadcast todos to all connected clients
  res.status(201).json(newTodo);
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send the current todos to the newly connected client
  ws.send(JSON.stringify({ type: 'todos', data: todos }));

  // Listen for messages from the client
  ws.on('message', (message) => {
    console.log('Received:', JSON.parse(message));
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Function to broadcast todos to all connected clients
function broadcastTodos() {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'todos', data: todos }));
    }
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
