const mineflayer = require('mineflayer');
const config = require('./config.json');
let botNumber = 100; // Nomor awal bot
const maxSpamPerBot = 10; // Jumlah spam per bot
const password = config.password; // Password dari config.json
let isBotRunning = false; // Status bot aktif untuk mencegah bot spam join

// Fungsi untuk mendapatkan waktu login acak
const getRandomInterval = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Fungsi untuk memulai bot
const startBot = (botNumber) => {
    if (isBotRunning) {
        console.log(`Bot ${botNumber} is waiting for the previous bot to finish.`);
        setTimeout(() => {
            startBot(botNumber);
        }, config.minloginintervalms);
        return;
    }

    isBotRunning = true; // Tandai bot sedang aktif
    const randomSuffix = Math.floor(Math.random() * 10000); // Tambahkan angka acak ke username
    const username = `${config.crackedusernameprefix}${botNumber}_${randomSuffix}`;

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

                    // Pindah ke bot berikutnya setelah delay
                    botNumber++;
                    isBotRunning = false; // Tandai bot selesai
                    setTimeout(() => {
                        startBot(botNumber);
                    }, getRandomInterval(config.minloginintervalms, config.maxloginintervalms)); // Jeda login acak
                }, 2000); // Delay 2 detik sebelum keluar
            }
        }, config.spamintervalms); // Interval antar spam
    });

    bot.on('error', (err) => {
        console.log(`Bot ${bot.username} encountered an error:`, err);
        isBotRunning = false; // Tandai bot selesai
    });

    bot.on('kicked', (reason) => {
        console.log(`Bot ${bot.username} was kicked for: ${reason}`);
        isBotRunning = false; // Tandai bot selesai

        // Pindah ke bot berikutnya jika ditendang
        botNumber++;
        setTimeout(() => {
            startBot(botNumber);
        }, getRandomInterval(config.minloginintervalms, config.maxloginintervalms));
    });
};

// Mulai bot pertama
startBot(botNumber);
