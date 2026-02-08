const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const fs = require('fs');

const MSG_FILE = './messages.json';

// Загружаем старые сообщения при старте
let messageHistory = [];
if (fs.existsSync(MSG_FILE)) {
    messageHistory = JSON.parse(fs.readFileSync(MSG_FILE));
}

io.on('connection', (socket) => {
    // Сразу отправляем новому пользователю историю сообщений
    socket.emit('history', messageHistory);

    socket.on('msg', (data) => {
        data.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageHistory.push(data);
        // Храним только последние 100 сообщений, чтобы не перегружать память
        if (messageHistory.length > 100) messageHistory.shift();

        // Сохраняем в файл
        fs.writeFileSync(MSG_FILE, JSON.stringify(messageHistory));

        io.emit('msg', data);
    });
});

http.listen(process.env.PORT || 3000, '0.0.0.0', () => {
    console.log('Keole Global Server Started');
});