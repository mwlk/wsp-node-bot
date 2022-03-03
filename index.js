const {Client } = require('whatsapp-web.js');
const client = new Client();

client.on('qr', (qr) => {
    console.log('qr recibido', qr)
});

client.on('ready', () => {
    console.log('ready')
});