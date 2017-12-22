const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')

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
    console.log('Connect to database is successful');
  });
});

const invoice = {
  provider_token: '401643678:TEST:346a812e-92be-4324-8410-7b77f92896ac',
  start_parameter: 'time-machine-sku',
  title: 'Working Time Machine',
  description: 'Want to visit your great-great-great-grandparents? Make a fortune at the races? Shake hands with Hammurabi and take a stroll in the Hanging Gardens? Order our Working Time Machine today!',
  currency: 'rub',
  photo_url: 'https://img.clipartfest.com/5a7f4b14461d1ab2caaa656bcee42aeb_future-me-fredo-and-pidjin-the-webcomic-time-travel-cartoon_390-240.png',
  is_flexible: true,
  prices: [
    { label: 'Working Time Machine', amount: 1000 }
  ],
  payload: {
    coupon: 'BLACK FRIDAY'
  }
}

// Доставка откуда
const shippingOptions = [
  {
    id: 'unicorn',
    title: 'Unicorn express',
    prices: [{ label: 'Unicorn', amount: 0 }]
  },
  {
    id: 'slowpoke',
    title: 'Slowpoke mail',
    prices: [{ label: 'Slowpoke', amount: 100 }]
  }
]

const replyOptions = Markup.inlineKeyboard([
  Markup.payButton('💸 Buy'),
  Markup.urlButton('❤️', 'http://telegraf.js.org')
]).extra()

const bot = new Telegraf('378976409:AAGnz9MmrNIJTATv6TFNYe_kg12liaLusMk')
/*bot.start(({ replyWithInvoice }) =>{
 replyWithInvoice(invoice)
 //console.log(getChat())
})*/
bot.start((ctx) => {
  var query = con.query("SELECT chat_id, status FROM coffee WHERE chat_id = "+ctx.from.id+"", function (err, result, fields) {
    if (err) throw err;
    //global.status = result[1].count;
    console.log(result[0]);
    if(result[0] == undefined){
      var sql = "INSERT INTO coffee (chat_id, user_name) VALUES ("+ctx.from.id+", '"+ctx.from.username+"')";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("User recorded to database");
      });
    }else{
      console.log('Not empty');
    }
    if(result[0].status == '6'){
        ctx.reply('Custom buttons keyboard', Markup
            .keyboard([
              ['Оплата'], // Row1 with 2 buttons
              ['Время'], // Row2 with 2 buttons
              ['Удалить/изменить','Дозаказ'] // Row3 with 3 buttons
            ])
            .oneTime()
            .resize()
            .extra()
        )
    }else{
       ctx.reply('Custom buttons keyboard', Markup
            .keyboard([
              ['Сделать заказ']
            ])
            .oneTime()
            .resize()
            .extra()
        ) 
    }
    })
})
bot.command('/buy', ({ replyWithInvoice }) => replyWithInvoice(invoice, replyOptions))
bot.on('shipping_query', ({ answerShippingQuery }) => answerShippingQuery(true, shippingOptions))
bot.on('pre_checkout_query', ({ answerPreCheckoutQuery }) => answerPreCheckoutQuery(true))
bot.on('successful_payment', () => console.log('Woohoo'))
bot.command('custom', ({ reply }) => {
  return reply('Custom buttons keyboard', Markup
    .keyboard([
      ['🔍 Search', '😎 Popular'], // Row1 with 2 buttons
      ['☸ Setting', '📞 Feedback'], // Row2 with 2 buttons
      ['📢 Ads', '⭐️ Rate us', '👥 Share'] // Row3 with 3 buttons
    ])
    .oneTime()
    .resize()
    .extra()
  )
})
bot.on('message', (ctx) => {
    //ctx.reply('qwe')
    //console.log(ctx.message.text)
    var chat_id = ctx.from.id;
    var query = con.query("SELECT chat_id, status FROM coffee WHERE chat_id = "+chat_id+"", function (err, result, fields) {
        if (err) throw err;
        var status = result[0].status;
        if(status == 1){
            if(ctx.message.text == 'Кофе'){
                easy_keyboard(ctx, 'Кофе:', ['Латте','Эспрессо','Капучино']);
                updateStatus(2, chat_id);
            }
        }
        if(status == 2){
            
        }
    })
    if(ctx.message.text == 'Сделать заказ'){
        var array = ['Кофе','Чай','Пиво','Пирожные','Десерты','Чизкейки'];
        hard_keyboard(ctx, 'Меню:', array);
        updateStatus(1, chat_id);
        console.log('Сделать заказ');
    }
})

function updateStatus(status, chat_id){
    var sql = "UPDATE coffee SET status = "+status+" WHERE chat_id = "+chat_id+"";
        con.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result.affectedRows + " record(s) updated");
    });
}

function easy_keyboard(ctx,text,array){
    ctx.reply(text, Markup
        .keyboard([
          [array[0]],
          [array[1]],
          [array[2]]
        ])
        .oneTime()
        .resize()
        .extra()
    )
}
function hard_keyboard(ctx,text,array){
    ctx.reply(text, Markup
        .keyboard([
          [array[0],array[1]],
          [array[2],array[3]],
          [array[4],array[5]]
        ])
        .oneTime()
        .resize()
        .extra()
    )
}



bot.startPolling()