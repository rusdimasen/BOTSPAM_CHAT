const snekfetch = require("snekfetch");
const config = require("./config.json");
const mineflayer = require("mineflayer"); // Pastikan package ini terinstal

let botQueue = []; // Antrian bot
let activeBotIndex = 0; // Indeks bot yang sedang aktif

console.log("Memulai bot..."); // Log awal untuk memastikan file berjalan

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

    bot.on("spawn", () => {
        console.log(`Bot ${bot.username} telah masuk ke dunia.`);
    });

    bot.on("chat", (username, message) => {
        if (username === bot.username) return; // Abaikan pesan sendiri
        console.log(`[CHAT] ${username}: ${message}`);

        if (message.toLowerCase().includes("halo")) {
            const response = config.responsemessages[Math.floor(Math.random() * config.responsemessages.length)];
            setTimeout(() => bot.chat(response), randomize(2000, 5000));
        }
    });

    bot.on("error", (err) => {
        console.error(`Error pada Bot ${bot.username}:`, err.message);
        if (botQueue[activeBotIndex] === botNumber) {
            nextBot();
        }
    });

    bot.on("kicked", (reason) => {
        console.log(`Bot ${bot.username} ditendang:`, reason);
        if (botQueue[activeBotIndex] === botNumber) {
            nextBot();
        }
    });
}

function startSpam(bot) {
    let spamCount = 0;
    console.log(`Bot ${bot.username} memulai spam.`);

    const spamInterval = setInterval(() => {
        bot.chat(randomizeSpamMessage(config.spammessages));
        spamCount++;

        if (spamCount >= 10) {
            clearInterval(spamInterval);
            console.log(`Bot ${bot.username} selesai sesi spam.`);
            nextBot();
        }
    }, randomize(config.spamintervalms + 2000, config.spamintervalms + 5000));
}

function randomizeSpamMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)];
}

function nextBot() {
    activeBotIndex++;
    if (activeBotIndex >= botQueue.length) {
        activeBotIndex = 0;
    }

    console.log(`Mengalihkan aktivitas spam ke BOT${botQueue[activeBotIndex]}.`);
    const nextBotNumber = botQueue[activeBotIndex];
    createBot(nextBotNumber);
}

function randomize(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Inisialisasi antrian bot
for (let i = 0; i < config.botCount; i++) {
    const botNumber = 100 + i;
    botQueue.push(botNumber);
    createBot(botNumber);
}
