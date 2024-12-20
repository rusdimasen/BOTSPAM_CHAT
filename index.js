const snekfetch = require("snekfetch");
const config = require("./config.json");
let botNumber = 100; // Nomor awal bot
const maxSpamPerBot = 10; // Maksimal jumlah spam per bot
const password = config.password; // Ambil password dari config.json

// Fungsi untuk memulai bot
const startBot = (botNumber) => {
    const mineflayer = require('mineflayer');
    const username = `${config.crackedusernameprefix}${botNumber}`;

    const bot = mineflayer.createBot({
        host: config.ip,
        port: config.port,
        username: username,
        version: config.version,
        plugins: {
            conversions: false,
            furnace: false,
            math: false,
            painting: false,
            scoreboard: false,
            villager: false,
            bed: false,
            book: false,
            boss_bar: false,
            chest: false,
            command_block: false,
            craft: false,
            digging: false,
            dispenser: false,
            enchantment_table: false,
            experience: false,
            rain: false,
            ray_trace: false,
            sound: false,
            tablist: false,
            time: false,
            title: false,
            physics: config.physics,
            blocks: true
        }
    });

    let spamCount = 0;

    bot.on('login', () => {
        console.log(`Bot ${bot.username} logged in`);

        // Kirim perintah register atau login
        setTimeout(() => {
            bot.chat(`/register ${password} ${password}`); // Register
            bot.chat(`/login ${password}`); // Login
        }, 2000);

        // Spam hingga 10 kali
        const spamInterval = setInterval(() => {
            if (spamCount < maxSpamPerBot) {
                bot.chat(config.spammessage);
                spamCount++;
            } else {
                clearInterval(spamInterval);
                bot.end(); // Bot keluar setelah selesai spam
                console.log(`Bot ${bot.username} finished spamming`);

                // Pindah ke bot berikutnya
                botNumber++;
                startBot(botNumber); // Memulai bot berikutnya
            }
        }, config.spamintervalms);

        // Fitur Jump setiap 5 detik
        setInterval(() => {
            bot.setControlState('jump', true);
            setTimeout(() => {
                bot.setControlState('jump', false);
            }, 500);
        }, 5000);

        // Fitur Move maju setiap 3 detik
        setInterval(() => {
            bot.setControlState('forward', true);
            setTimeout(() => {
                bot.setControlState('forward', false);
            }, 2000);
        }, 3000);
    });

    bot.on('error', (err) => {
        console.log(`Bot ${bot.username} encountered an error:`, err);
    });

    bot.on('kicked', (reason) => {
        console.log(`Bot ${bot.username} was kicked for:`, reason);
        // Tetap coba bot berikutnya jika bot ini dikeluarkan
        botNumber++;
        startBot(botNumber);
    });
};

// Mulai bot pertama
startBot(botNumber);
