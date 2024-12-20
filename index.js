const mineflayer = require('mineflayer');
const config = require('./config.json');
let botNumber = 100; // Nomor awal bot
const maxSpamPerBot = 10; // Jumlah spam per bot
const password = config.password; // Password dari config.json

// Fungsi untuk memulai bot
const startBot = (botNumber) => {
    const username = `${config.crackedusernameprefix}${botNumber}`;

    const bot = mineflayer.createBot({
        host: config.ip,
        port: config.port,
        username: username,
        version: config.version,
    });

    let spamCount = 0; // Counter jumlah spam

    bot.on('login', () => {
        console.log(`Bot ${bot.username} logged in at ${new Date().toISOString()}`);

        // Register dan login
        setTimeout(() => {
            bot.chat(`/register ${password} ${password}`);
            bot.chat(`/login ${password}`);
        }, 2000);

        // Mulai spam
        const spamInterval = setInterval(() => {
            if (spamCount < maxSpamPerBot) {
                bot.chat(config.spammessage); // Kirim pesan spam
                spamCount++;
                console.log(`Bot ${bot.username} sent message ${spamCount}`);
            } else {
                clearInterval(spamInterval); // Hentikan spam setelah 10 pesan

                // Tunggu sebentar sebelum keluar
                setTimeout(() => {
                    bot.end();
                    console.log(`Bot ${bot.username} finished spamming and logged out.`);

                    // Mulai bot berikutnya setelah delay
                    botNumber++;
                    setTimeout(() => {
                        startBot(botNumber);
                    }, config.loginintervalms); // Delay diambil dari config.json
                }, 2000); // Delay 2 detik sebelum keluar
            }
        }, config.spamintervalms); // Interval antar spam
    });

    bot.on('error', (err) => {
        console.log(`Bot ${bot.username} encountered an error:`, err);
    });

    bot.on('kicked', (reason) => {
        console.log(`Bot ${bot.username} was kicked for: ${reason}`);
        // Pindah ke bot berikutnya jika ditendang
        botNumber++;
        setTimeout(() => {
            startBot(botNumber);
        }, config.loginintervalms);
    });
};

// Mulai bot pertama
startBot(botNumber);
