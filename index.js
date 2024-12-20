const mineflayer = require('mineflayer');
const config = require('./config.json');
let botNumber = 100; // Nomor awal bot
const maxSpamPerBot = 10; // Maksimal spam per bot
const password = config.password; // Ambil password dari config.json

// Fungsi untuk memulai bot
const startBot = (botNumber) => {
    const username = `${config.crackedusernameprefix}${botNumber}`;

    const bot = mineflayer.createBot({
        host: config.ip,
        port: config.port,
        username: username,
        version: config.version,
    });

    let spamCount = 0;

    bot.on('login', () => {
        console.log(`Bot ${bot.username} logged in at ${new Date().toISOString()}`);

        // Kirim perintah register atau login
        setTimeout(() => {
            bot.chat(`/register ${password} ${password}`);
            bot.chat(`/login ${password}`);
        }, 2000);

        // Spam hingga maxSpamPerBot
        const spamInterval = setInterval(() => {
            if (spamCount < maxSpamPerBot) {
                bot.chat(config.spammessage);
                spamCount++;
            } else {
                clearInterval(spamInterval);
                bot.end(); // Bot keluar setelah selesai spam
                console.log(`Bot ${bot.username} finished spamming at ${new Date().toISOString()}`);

                // Jeda sebelum memulai bot berikutnya
                botNumber++;
                setTimeout(() => {
                    startBot(botNumber);
                }, config.loginintervalms); // Jeda diambil dari config.json
            }
        }, config.spamintervalms);
    });

    bot.on('error', (err) => {
        console.log(`Bot ${bot.username} encountered an error:`, err);
    });

    bot.on('kicked', (reason) => {
        console.log(`Bot ${bot.username} was kicked for: ${reason}`);
        // Pindah ke bot berikutnya setelah ditendang
        botNumber++;
        setTimeout(() => {
            startBot(botNumber);
        }, config.loginintervalms);
    });
};

// Mulai bot pertama
startBot(botNumber);
