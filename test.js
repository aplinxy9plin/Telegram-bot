const TelegramBot = require('node-telegram-bot-api');
 
const token = '378976409:AAGnz9MmrNIJTATv6TFNYe_kg12liaLusMk';
 
const bot = new TelegramBot(token, {polling: true});

const products = [
    {
        name: 'Nuka-Cola Quantum',
        price: 27.99,
        description: 'Ice-cold, radioactive Nuka-Cola. Very rare!',
        photoUrl: 'http://vignette2.wikia.nocookie.net/fallout/images/e/e6/Fallout4_Nuka_Cola_Quantum.png'
    },
    {
        name: 'Iguana on a Stick',
        price: 3.99,
        description: 'The wasteland\'s most famous delicacy.',
        photoUrl: 'https://vignette2.wikia.nocookie.net/fallout/images/b/b9/Iguana_on_a_stick.png'
    }
];

function createInvoice(product) {
    return {
        provider_token: '401643678:TEST:346a812e-92be-4324-8410-7b77f92896ac',
        start_parameter: 'foo',
        title: product.name,
        description: product.description,
        currency: 'EUR',
        photo_url: product.photoUrl,
        is_flexible: false,
        need_shipping_address: false,
        prices: [{ label: product.name, amount: Math.trunc(product.price * 100) }],
        payload: {}
    };
}

bot.onText(/\qwe/, (msg, match) => {
  //console.log(msg);    
  const opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      keyboard: [
        ['Yes, you are the bot of my life ❤'],
        ['No, sorry there is another one...']
      ]
    })
  };
  bot.sendMessage(msg.chat.id, 'Do you love me?', opts);
  //bot.sendInvoice(msg.chat.id, "title", "description", "payload", "401643678:TEST:346a812e-92be-4324-8410-7b77f92896ac", "startParameter", "USD", "100")
});
// Matches /editable
bot.onText(/\asd/, function onEditableText(msg) {
  bot.sendMessage(msg.from.id, createInvoice(products[1]), opts);
});