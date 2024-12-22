const mineflayer = require('mineflayer');
const config = require('./config.json');
let currentNumber = 100; // Mulai dari BOT100

function createBot(botNumber) {
    const bot = mineflayer.createBot({
        host: config.ip,
        port: config.port,
        username: `${config.crackedusernameprefix}${botNumber}`,
        version: config.version,
        plugins: {
            physics: config.physics,
            blocks: true,
        }
    });

    setupBotEvents(bot, botNumber);
}

function setupBotEvents(bot, botNumber) {
    bot.on('login', () => {
        console.log(`Bot ${bot.username} berhasil login.`);
        bot.chat("/login password123");
        bot.chat("/register password123 password123");

        startSpam(bot);
        startAntiAFK(bot);
    });

    bot.on('spawn', () => {
        console.log(`Bot ${bot.username} telah masuk ke dunia.`);
    });

    bot.on('error', (err) => {
        console.log(`Error pada Bot ${bot.username}:`, err.message);
        restartBot(botNumber);
    });

    bot.on('kicked', (reason) => {
        console.log(`Bot ${bot.username} ditendang:`, reason);
        restartBot(botNumber);
    });
}

function startSpam(bot) {
    if (!config.spammessage || config.spamintervalms <= 0) return;

    console.log(`Bot ${bot.username} mulai spam.`);
    setInterval(() => {
        bot.chat(config.spammessage);
    }, config.spamintervalms);
}

function startAntiAFK(bot) {
    if (config.afkintervalms <= 0 || config.afkdurationms <= 0) return;

    console.log(`Bot ${bot.username} anti-AFK aktif.`);
    setInterval(() => {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), config.afkdurationms);
    }, config.afkintervalms);
}

function restartBot(botNumber) {
    setTimeout(() => createBot(botNumber + 1), config.loginintervalms);
}

// Mulai dengan bot pertama
createBot(currentNumber);
