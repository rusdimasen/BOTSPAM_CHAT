const snekfetch = require("snekfetch");
const config = require("./config.json");
const mineflayer = require("mineflayer");

let currentNumber = 100; // Nomor bot pertama

function createBot(botNumber) {
    const username = config.altening ? getAlteningUsername(botNumber) : `${config.crackedusernameprefix}${botNumber}`;
    initializeBot(username, botNumber);
}

function getAlteningUsername(botNumber) {
    try {
        const res = snekfetch.get(`http://api.thealtening.com/v1/generate?token=${config.altening_token}&info=true`);
        return res.body.token;
    } catch (err) {
        console.error(`Gagal mendapatkan token Altening untuk BOT${botNumber}:`, err);
        return null; // Menghindari crash jika token gagal didapatkan
    }
}

function initializeBot(username, botNumber) {
    if (!username) {
        console.error(`Bot ${botNumber} tidak dapat dilanjutkan karena username null.`);
        restartNextBot(botNumber);
        return;
    }

    const bot = mineflayer.createBot({
        host: config.ip,
        port: config.port,
        username: username,
        version: config.version,
        plugins: { physics: config.physics, blocks: true },
    });

    handleBot(bot, botNumber);
}

function handleBot(bot, botNumber) {
    let antiAFKInterval, spamInterval;
    const maxSpamCount = 15; // Jumlah maksimal pesan spam

    bot.on("login", () => {
        console.log(`Bot ${bot.username} berhasil login.`);
        bot.chat("/login p@ssword123");
        bot.chat("/register p@ssword123 p@ssword123");

        // Mulai spam dan anti-AFK
        spamInterval = startSpam(bot, botNumber, maxSpamCount);
        antiAFKInterval = startAntiAFK(bot);
    });

    bot.on("error", (err) => {
        console.error(`Error pada BOT${botNumber}: ${err.message}`);
        cleanupAndRestart(bot, antiAFKInterval, spamInterval, botNumber);
    });

    bot.on("kicked", (reason) => {
        console.warn(`BOT${botNumber} ditendang: ${reason}`);
        cleanupAndRestart(bot, antiAFKInterval, spamInterval, botNumber);
    });

    bot.on("end", () => {
        console.log(`BOT${botNumber} keluar.`);
        cleanupAndRestart(bot, antiAFKInterval, spamInterval, botNumber);
    });
}

function startSpam(bot, botNumber, maxSpamCount) {
    let spamCount = 0;
    return setInterval(() => {
        if (spamCount >= maxSpamCount) {
            console.log(`BOT${botNumber} selesai spam.`);
            bot.quit(); // Bot keluar setelah selesai spam
            return;
        }

        bot.chat(config.spammessage);
        spamCount++;
    }, config.spamintervalms);
}

function startAntiAFK(bot) {
    return setInterval(() => {
        bot.setControlState("jump", true);
        setTimeout(() => bot.setControlState("jump", false), config.afkdurationms);
    }, config.afkintervalms);
}

function cleanupAndRestart(bot, antiAFKInterval, spamInterval, botNumber) {
    clearInterval(antiAFKInterval);
    clearInterval(spamInterval);

    setTimeout(() => {
        restartNextBot(botNumber);
    }, config.loginintervalms); // Tunggu sebelum membuat bot berikutnya
}

function restartNextBot(botNumber) {
    const nextBotNumber = botNumber + 1;
    console.log(`Memulai bot berikutnya: BOT${nextBotNumber}`);
    createBot(nextBotNumber);
}

// Validasi konfigurasi sebelum mulai
if (!config.ip || !config.port || !config.version) {
    throw new Error("Konfigurasi tidak lengkap di file config.json!");
}

// Mulai dari bot pertama
createBot(currentNumber);
