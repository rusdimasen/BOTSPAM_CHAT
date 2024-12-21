const mineflayer = require('mineflayer');
const config = require('./config.json');

let botNumber = 1; // Nomor awal bot
let isBotRunning = false; // Status bot untuk mencegah overlap
let activeBots = 0; // Jumlah bot yang sedang aktif

const getRandomInterval = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const startBot = (botNumber) => {
    if (isBotRunning) {
        console.log(`Bot ${botNumber} menunggu bot sebelumnya selesai.`);
        setTimeout(() => {
            startBot(botNumber);
        }, getRandomInterval(config.minloginintervalms, config.maxloginintervalms));
        return;
    }

    if (activeBots >= config.maxbots) {
        console.log('Batas maksimum bot aktif tercapai. Menunggu giliran...');
        return;
    }

    isBotRunning = true;
    const randomSuffix = Math.floor(Math.random() * 10000);
    const username = `${config.crackedusernameprefix}${botNumber}_${randomSuffix}`;

    const bot = mineflayer.createBot({
        host: config.ip,
        port: config.port,
        username: username,
        version: config.version,
    });

    activeBots++; // Tambahkan bot aktif
    let spamCount = 0;

    bot.on('login', () => {
        console.log(`Bot ${bot.username} berhasil login.`);

        setTimeout(() => {
            bot.chat(`/register ${config.password} ${config.password}`);
            bot.chat(`/login ${config.password}`);
        }, 2000);

        const spamInterval = setInterval(() => {
            if (spamCount < config.maxspamperbot) {
                bot.chat(config.spammessage);
                spamCount++;
                console.log(`Bot ${bot.username} mengirim pesan ke-${spamCount}`);
            } else {
                clearInterval(spamInterval);
                setTimeout(() => {
                    bot.end();
                    console.log(`Bot ${bot.username} selesai spam dan keluar.`);
                    activeBots--;
                    isBotRunning = false;
                    botNumber++;
                    if (botNumber <= config.maxbots) {
                        setTimeout(() => {
                            startBot(botNumber);
                        }, getRandomInterval(config.minloginintervalms, config.maxloginintervalms));
                    } else {
                        console.log('Semua bot telah selesai.');
                    }
                }, 2000);
            }
        }, config.spamintervalms);
    });

    bot.on('kicked', (reason) => {
        console.log(`Bot ${bot.username} dikeluarkan: ${reason}`);
        activeBots--;
        isBotRunning = false;
        botNumber++;
        if (botNumber <= config.maxbots) {
            setTimeout(() => {
                startBot(botNumber);
            }, getRandomInterval(config.minloginintervalms, config.maxloginintervalms));
        }
    });

    bot.on('error', (err) => {
        console.log(`Bot ${bot.username} mengalami error:`, err);
        activeBots--;
        isBotRunning = false;
        botNumber++;
        if (botNumber <= config.maxbots) {
            setTimeout(() => {
                startBot(botNumber);
            }, getRandomInterval(config.minloginintervalms, config.maxloginintervalms));
        }
    });

    bot.on('end', () => {
        console.log(`Bot ${bot.username} disconnected.`);
        activeBots--;
        isBotRunning = false;
    });
};

// Mulai bot pertama
startBot(botNumber);
            
