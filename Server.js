const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const htmlPath = path.join(__dirname, 'public', 'index.html');

io.on('connection', (socket) => {
  const ip = socket.handshake.address;
  console.log(`New client from ${ip}`);

  socket.on('chat message', (msg) => {
    const formatted = `${ip}: ${msg}`;
    console.log(formatted);

    // Broadcast to all clients
    io.emit('chat message', { ip, msg });

    // Append message to index.html
    fs.readFile(htmlPath, 'utf8', (err, data) => {
      if (err) return console.error('Read error:', err);

      const insertBefore = '</ul>';
      const newMessage = `  <li>${formatted}</li>\n`;

      if (data.includes(newMessage)) return; // prevent duplicate writes

      const updated = data.replace(insertBefore, newMessage + insertBefore);

      fs.writeFile(htmlPath, updated, 'utf8', (err) => {
        if (err) console.error('Write error:', err);
      });
    });
  });

  socket.on('disconnect', () => {
    console.log(`Client from ${ip} disconnected`);
  });
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
