const TelegramBot = require('node-telegram-bot-api');
 
const token = '378976409:AAGnz9MmrNIJTATv6TFNYe_kg12liaLusMk';
 
const bot = new TelegramBot(token, {polling: true});
 
var mysql = require('mysql');

var empty = require('is-empty');

var con = mysql.createConnection({
  host: "localhost",
  user: "top4ek",
  password: "q2w3e4r5",
  database: "telegram"
});

con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT * FROM coffee", function (err, result, fields) {
    if (err) throw err;
    //global.status = result[1].count;
    console.log(result);
  });
});

var options = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: 'Капучино', callback_data: 'Капучино_120' }],
      [{ text: 'Эспрессо', callback_data: 'Эспрессо_150' }],
      [{ text: 'Латте', callback_data: 'Латте_70' }]
    ]
  })
};
var yesNo = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: 'Да', callback_data: 'Да' }],
      [{ text: 'Нет', callback_data: 'Нет' }]
    ]
  })
};
var places = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: 'Нахимова 30', callback_data: 'Нахимова 30' }],
      [{ text: 'Белинского 51', callback_data: 'Белинского 51' }]
    ]
  })
};

bot.onText(/\qwe/, (msg, match) => {
console.log(msg);    
var fromId = msg.from.id;
bot.sendMessage(fromId, msg.from.first_name + ' ' + msg.from.last_name );
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.from.id;
  console.log(chatId);
  bot.sendMessage(chatId, 'Привет :)\nВыбери кофе, который хочешь закать!', options);
  var check = con.query("SELECT chat_id FROM coffee WHERE chat_id = "+chatId+"", function (err, result, fields) {
    if (err) throw err;
    //global.status = result[1].count;
    console.log(result[0]);
    if(result[0] == undefined){
      var sql = "INSERT INTO coffee (chat_id, user_name) VALUES ("+msg.from.id+", '"+msg.from.username+"')";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
      });
    }else{
      console.log('not empty');
    }
  });
});

// Ответ от кнопок
bot.on('callback_query', function (msg) {
  chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id; // Если сообщение отправлял пользователь, то свойство msg.chat.id, если же он кликал на кнопку, то msg.from.id
  var product = msg.data.split('_');
  var answer = product[0]; // Делим ответ на две части, превратив в массив. Первый элемент номер вопроса, второй будет вариант ответа.
  var price = product[1];
  var status = con.query("SELECT status FROM coffee WHERE chat_id = "+chat+"", function (err, result, fields) {
    if (err) throw err;
    var status_check = result[0].status;
    if(status_check == 0){
      console.log('Its a 0');
      var selected = con.query("SELECT coffee, price FROM coffee WHERE chat_id = "+chat+"", function (err, result, fields) {
        if (err) throw err;
        var enter = result[0].coffee + ' ' + answer;
        var full_price = result[0].price + parseFloat(price);
        console.log(full_price);
        var sql = "UPDATE coffee SET coffee = '"+enter+"', price = "+full_price+", status = 1 WHERE chat_id = "+chat+"";
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log(result.affectedRows + " record(s) updated");
        });
        bot.sendMessage(chat, "Ваш заказ: "+answer+". Желаете что-нибудь еще?", yesNo);
      });
    }
    if(status_check == 1){
      if(answer == 'Да'){
        var sql = "UPDATE coffee SET status = 0 WHERE chat_id = "+chat+"";
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log(result.affectedRows + " record(s) updated");
        });
        bot.sendMessage(chat, "Выбери что-нибудь еще. Мы добавим это в ваш заказ!", options);
      }else{
        bot.sendMessage(chat, "Напишите, пожалуйста ваш телефон.");
        var sql = "UPDATE coffee SET status = 2 WHERE chat_id = "+chat+"";
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log(result.affectedRows + " record(s) updated");
        });
      }
    }
    if(status_check == 3){
      if(answer == 'Да'){
        bot.sendMessage(chat, "Где будете забирать?", places);
        var sql = "UPDATE coffee SET status = 4 WHERE chat_id = "+chat+"";
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log(result.affectedRows + " record(s) updated");
        });
      }else{
        var sql = "UPDATE coffee SET status = 2 WHERE chat_id = "+chat+"";
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log(result.affectedRows + " record(s) updated");
        });
        bot.sendMessage(chat, "Напишите, пожалуйста ваш телефон.");
      }
    }
    if(status_check == 4){
      var sql = "UPDATE coffee SET place = '"+answer+"', status = 5 WHERE chat_id = "+chat+"";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result.affectedRows + " record(s) updated");
      });
      bot.sendMessage(chat, "Во сколько Вас ожидать?");
    }
    if(status_check == 6){
      bot.sendMessage(chat, "Спасибо за заказ. Будем вас ждать!:)");
    }
  });
  console.log(answer);
});


bot.on('message', (msg) => {
  chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id; // Если сообщение отправлял пользователь, то свойство msg.chat.id, если же он кликал на кнопку, то msg.from.id
  var status = con.query("SELECT status, price, place, coffee, time, id FROM coffee WHERE chat_id = "+chat+"", function (err, result, fields) {
    if(result[0] !== undefined){
      if(result[0].status == 2){
        bot.sendMessage(chat, "Ваш номер: "+msg.text+"?", yesNo);
        var sql = "UPDATE coffee SET phone = '"+msg.text+"', status = 3 WHERE chat_id = "+chat+"";
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log(result.affectedRows + " record(s) updated");
        });
      }
      if(result[0].status == 5){
        console.log(result);
        var sql = "UPDATE coffee SET time = '"+msg.text+"', status = 6 WHERE chat_id = "+chat+"";
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log(result.affectedRows + " record(s) updated");
        });
        bot.sendMessage(chat, "Ваш заказ: "+result[0].coffee+" На общую сумму: "+result[0].price+"\nЗабирать по адресу: "+result[0].place+"\nВ "+msg.text+".\nВсе верно?", yesNo);
        //bot.sendMessage('269874948', "Заказ #"+result[0].id+": "+result[0].coffee+" На общую сумму: "+result[0].price+"\nАдрес: "+result[0].place+"\nВ "+msg.text+".");
        //Admin id = 269874948
      }
      /*if(result[0].status == 6){
        bot.sendMessage(chat, "Ваш заказ поступил в обработку. У вас есть какие-то вопросы? Позвоните по телефону 12-34-56");
      }*/
    }
  });
  bot.onText(/\/test/, (msg) => {
    const chatId = msg.from.id;
    console.log(chatId);
    bot.sendMessage(chatId, 'Привет :)\nВыбери кофе, который хочешь закать!', options);
  });
});