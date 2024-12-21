const snekfetch = require("snekfetch");
const config = require("./config.json");
const mineflayer = require("mineflayer"); 

let botQueue = []; // Antrian bot
let activeBotIndex = 0; // Indeks bot yang aktif

function createBot(botNumber) {
    const bot = mineflayer.createBot({
        host: config.ip,
        port: config.port,
        username: `${config.crackedusernameprefix}${botNumber}`,
        version: config.version,
    });

    handleBot(bot, botNumber);
}

function handleBot(bot, botNumber) {
    bot.on("login", () => {
        console.log(`Bot ${bot.username} berhasil login.`);
        bot.chat("/login p@ssword123");
        bot.chat("/register p@ssword123 p@ssword123");

        if (botQueue[activeBotIndex] === botNumber) {
            setTimeout(() => startSpam(bot), randomize(3000, 6000));
        }
    });

    bot.on("error", (err) => {
        console.error(`Error pada Bot ${bot.username}:`, err.message);
        retryBot(botNumber);
    });

    bot.on("kicked", (reason) => {
        console.log(`Bot ${bot.username} ditendang:`, reason);
        retryBot(botNumber);
    });

    bot.on("end", () => {
        console.log(`Bot ${bot.username} disconnected.`);
        retryBot(botNumber);
    });
}

function startSpam(bot) {
    let spamCount = 0;

    const spamInterval = setInterval(() => {
        bot.chat(randomizeSpamMessage(config.spammessages));
        spamCount++;

        if (spamCount >= 10) {
            clearInterval(spamInterval);
            console.log(`Bot ${bot.username} selesai sesi spam.`);
            nextBot();
        }
    }, randomize(config.spamintervalms, config.spamintervalms + 5000));
}

function randomizeSpamMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)];
}

function nextBot() {
    activeBotIndex = (activeBotIndex + 1) % botQueue.length;
    console.log(`Mengalihkan aktivitas ke BOT${botQueue[activeBotIndex]}`);
}

function retryBot(botNumber) {
    setTimeout(() => {
        console.log(`Mencoba ulang BOT${botNumber}`);
        createBot(botNumber);
    }, config.retryintervalms || 5000);
}

function randomize(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Inisialisasi bot
for (let i = 0; i < config.botCount; i++) {
    const botNumber = 100 + i;
    botQueue.push(botNumber);
    createBot(botNumber);
}
