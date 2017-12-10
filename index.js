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

bot.onText(/\qwe/, (msg, match) => {

  const chatId = msg.chat.id;
  const resp = 'match[1]';
  console.log(global.status); 
  bot.sendMessage(chatId, global.status);
});

bot.onText(/\/start/, (msg) => {

  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hello');
});
/*
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
 
  bot.sendMessage(chatId, 'Received your message');
});
*/