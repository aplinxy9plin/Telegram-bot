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

// Доставка откуда
const shippingOptions = [
  {
    id: 'first',
    title: 'Нахимова 30',
    prices: [{ label: 'Unicorn', amount: 0 }]
  },
  {
    id: 'second',
    title: 'Белинского 51',
    prices: [{ label: 'Slowpoke', amount: 0 }]
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
    if(result[0].status == '10'){
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
bot.on('pre_checkout_query', ({ answerPreCheckoutQuery }) => answerPreCheckoutQuery(true))
bot.on('successful_payment', (ctx) => {
    console.log('Payed successful')
    ctx.reply('Заказ успешно оплачен. Ожидайте подтверждение баристы.')
})
bot.on('message', (ctx) => {
    var chat_id = ctx.from.id;
    var query = con.query("SELECT chat_id, status, coffee FROM coffee WHERE chat_id = "+chat_id+"", function (err, result, fields) {
        if (err) throw err;
        var status = result[0].status;
        var answer = ctx.message.text
        var replace = result[0].coffee.split(' ').join('\n')
        //console.log(replace)
        if(answer == 'Сделать заказ'){
            var array = ['Черный кофе','Классический c молоком','Авторские','Альтернативный кофе','Горячий шоколад, какао и ягодные',''];
            hard_keyboard(ctx, 'Меню:', array);
            updateStatus(1, chat_id);
            console.log('Сделать заказ')
        }        
        if(status == 1){
            if(answer == 'Черный кофе'){
                easy_keyboard(ctx, 'Черный кофе', ['Американо','Двойной','Черный кофе с можевельником','Черный кофе с кардамоном'])
                updateStatus(2, chat_id)
            }
            if(answer == 'Классический c молоком'){
                easy_keyboard(ctx, 'Классический c молоком', ['Маленький латте','Большой латте','Маленький Капучино','Большой Капучино','Раф','Флэт вайт','Соевый латте малый','Соевый латте большой'])
                updateStatus(2, chat_id)
            }
            if(answer == 'Авторские'){
                easy_keyboard(ctx, 'Авторские', ['Лавандовый раф','Розовый мужской латте','Медово-имбирный капучино','Коколатте','Имбирно-жасминовый латте','Кедровый латте маленький','Кедровый латте большой','Цитрусовый раф маленький','Цитрусовый раф большой','Клауд ЧСМ маленький','Клауд ЧСМ большой','Крем брюле маленький','Крем брюле большой','Прованский латте','Грушевая самбука'])
                updateStatus(2, chat_id)
            }
            if(answer == 'Альтернативный кофе'){
                easy_keyboard(ctx, 'Авторские', ['Лавандовый раф','Розовый мужской латте','Медово-имбирный капучино','Коколатте','Имбирно-жасминовый латте','Кедровый латте маленький','Кедровый латте большой','Цитрусовый раф маленький','Цитрусовый раф большой','Клауд ЧСМ маленький','Клауд ЧСМ большой','Крем брюле маленький','Крем брюле большой','Прованский латте','Грушевая самбука'])
                updateStatus(2, chat_id)
            }
        }
        if(status == 2){
            if(answer == 'Выбрать еще'){
                var array = ['Черный кофе','Классический c молоком','Авторские','Альтернативный кофе','Горячий шоколад, какао и ягодные',''];
                hard_keyboard(ctx, 'Меню:', array);
                updateStatus(1, chat_id);
            }
            if(answer == 'Закончить'){
                ctx.reply('Через сколько минут вас ожидать?\nНапишите цифру')
                updateStatus(3, chat_id)
            }
            if(answer !== 'Выбрать еще' && answer !== 'Закончить'){
                easy_keyboard(ctx, 'Вы выбрали: '+answer+'', ['Выбрать еще', 'Закончить',''])
                var enter = result[0].coffee + ' ' + answer
                var sql = "UPDATE coffee SET coffee = '"+enter+"' WHERE chat_id = "+chat_id+"";
                con.query(sql, function (err, result) {
                  if (err) throw err;
                  console.log(result.affectedRows + " record(s) updated");
                });
            }
        }
        if(status == 3){
            if (!isNaN(answer)) {
                easy_keyboard(ctx,'Ожидать вас через '+answer+' минут?',['Да','Нет',''])
                updateStatus(4, chat_id)
            }else{
                ctx.reply('Введите число')
            }
        }
        if(status == 4){
            if(answer == 'Да'){
                hard_keyboard(ctx,'Выполнить заказ', ['Оплата','','Изменить время','','Удалить/изменить','Дозаказ'])
                updateStatus(5, chat_id)
            }else{
                ctx.reply('Через сколько минут вас ожидать?\nНапишите цифру')
                updateStatus(3, chat_id)
            }
        }
        if(status == 5){
            if(answer == 'Оплата'){
                //var order = (result[0].coffee).split(' ').join("\n");
                ctx.replyWithInvoice(invoice_func(replace,100000))
            }
            if(answer == 'Изменить время'){
                ctx.reply('Через сколько минут вас ожидать?\nНапишите цифру')
                updateStatus(3,chat_id)
            }
            if(answer == 'Удалить/изменить'){
                var order = result[0].coffee.split(' ')
                easy_keyboard(ctx,'Чтобы удалить какой-то товар просто нажмите на него на клавиатуре.',order)
                updateStatus(6, chat_id)
            }
            if(answer == 'Дозаказ'){
                var array = ['Кофе','Чай','Пиво','Пирожные','Десерты','Чизкейки'];
                hard_keyboard(ctx, 'Меню:', array);
                updateStatus(1,chat_id)
            }
        }
        // Удалить или изменить
        if(status == 6){
            var order = result[0].coffee.split(' ')
            order.splice(0, 1);
            for (var i = 0; i < order.length; i++) {
                if(answer == order[i]){
                    order.splice(i, 1)
                    console.log()
                    var sql = "UPDATE coffee SET coffee = '"+order.join(" ")+"', status = 5 WHERE chat_id = "+chat_id+"";
                        con.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log('Товар удален');
                    });
                    hard_keyboard(ctx,'Товар удален', ['Оплата','','Изменить время','','Удалить/изменить','Дозаказ'])
                    break
                }
            }
        }
    })
})
bot.command('/qwe', (ctx) => {
    console.log('menu view')
})
//bot.command('/buy', ({ replyWithInvoice }) => replyWithInvoice(invoice, replyOptions))
function updateStatus(status, chat_id){
    var sql = "UPDATE coffee SET status = "+status+" WHERE chat_id = "+chat_id+"";
        con.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result.affectedRows + " record(s) updated");
    });
}
function easy_keyboard(ctx,text,array){
    ctx.reply(text, Markup
        .keyboard(array)
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
// menu func

function menu(ctx){
    ctx.reply(text, Markup
        .keyboard([
            ('coke', 'test'),
            'prostakola'
            ])
        .oneTime()
        .resize()
        .extra()
    )
}

function invoice_func(order, price){
    const invoice = {
      provider_token: '361519591:TEST:aec637531815ea231dcf383d4ffce4f4',
      start_parameter: 'coffee',
      title: 'Заказ',
      description: order,
      currency: 'rub',
      photo_url: 'https://pbs.twimg.com/profile_images/520085024968671233/ul2Omvpm.jpeg',
      prices: [
        { label: 'Заказ', amount: price }
      ],
      payload: {
        coupon: 'test'
      }
    }
    return invoice
}

bot.startPolling()