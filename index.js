const TelegramBot = require('node-telegram-bot-api');
 
const token = '378976409:AAGnz9MmrNIJTATv6TFNYe_kg12liaLusMk';
 
const bot = new TelegramBot(token, {polling: true});
 
var mysql = require('mysql');

var status = 0;
global.status = status;

var con = mysql.createConnection({
  host: "localhost",
  user: "top4ek",
  password: "q2w3e4r5",
  database: "shop"
});

con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT * FROM products", function (err, result, fields) {
    if (err) throw err;
    global.status = result[1].count;
    console.log(result[0].barcode);
  });
});

var options = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: 'Кнопка 1', callback_data: '0_1' }],
      [{ text: 'Кнопка 2', callback_data: 'data 2' }],
      [{ text: 'Кнопка 3', callback_data: 'text 3' }]
    ]
  })
};

bot.onText(/\qwe/, (msg, match) => {

  const chatId = msg.chat.id;
  const resp = 'match[1]';
  console.log(global.status); 
  bot.sendMessage(chatId, global.status, options);
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Привет :)');
});

// Ответ от кнопок
bot.on('callback_query', function (msg) {
  var answer = msg.data.split('_'); // Делим ответ на две части, превратив в массив. Первый элемент номер вопроса, второй будет вариант ответа.
  var index = answer[0]; // Получаем номер вопроса
  var button = answer[1]; // И вариант ответа
  console.log(button);
  chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id; // Если сообщение отправлял пользователь, то свойство msg.chat.id, если же он кликал на кнопку, то msg.from.id
  bot.sendMessage(chat, 'text', options);
});

bot.onText(/\хуй/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'сам хуй :)');
});
/*
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
 
  bot.sendMessage(chatId, 'Received your message');
});
*/