require('dotenv').config();
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { supabaseAdmin } = require('./db');
const aiHandler = require('./ai');

const app = express();
const rootDir = path.join(__dirname, '..'); // Корень проекта (dnd-ai-game/)

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, 'frontend')));
app.use('/socket.io', express.static(path.join(__dirname, 'node_modules/socket.io/client-dist')));

// Список страниц (БЕЗ пустого элемента '' - index.html больше нет)
const pages = [
  'gamemenu',
  'game',          // Переименованный index.html
  'create-session',
  'sessions-list',
  'create-character',
  'character-select'
];

// Редирект с корня на /gamemenu
app.get('/', (req, res) => {
  res.redirect('/gamemenu'); 
});

// Динамическая маршрутизация для всех страниц
pages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(rootDir, 'frontend', `${page}.html`));
  });
});

// Обработка 404 (если файла нет)
app.use((req, res) => {
  res.status(404).send('Страница не найдена');
});

// Socket.IO логика (оставьте вашу текущую реализацию без изменений)
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:10000",
    methods: ["GET", "POST"]
  }
});

// ... (Ваша текущая реализация Socket.IO и игровой логики)

// Запуск сервера
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log('📌 Доступные страницы:');
  pages.forEach(page => {
    console.log(`http://localhost:${PORT}/${page}`);
  });
});