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
        return null;
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
    const maxSpamCount = 15;

    bot.on("login", () => {
        console.log(`BOT${botNumber} berhasil login.`);
        bot.chat("/login p@ssword123");
        bot.chat("/register p@ssword123 p@ssword123");

        // Mulai spam dan anti-AFK
        spamInterval = startSpam(bot, botNumber, maxSpamCount);
        antiAFKInterval = startAntiAFK(bot);
    });

    bot.on("spawn", () => {
        console.log(`BOT${botNumber} telah masuk ke dunia.`);
    });

    bot.on("error", (err) => {
        console.error(`Error pada BOT${botNumber}: ${err.message}`);
        restartNextBot(botNumber, "error");
    });

    bot.on("kicked", (reason) => {
        console.warn(`BOT${botNumber} ditendang: ${reason}`);
        restartNextBot(botNumber, "kicked");
    });

    bot.on("end", () => {
        console.log(`BOT${botNumber} keluar.`);
        cleanupAndRestart(bot, antiAFKInterval, spamInterval, botNumber);
    });

    // Jika server mendeteksi bot menggunakan packet mencurigakan (tab_complete)
    bot.on("packet", (data, metadata) => {
        if (metadata && metadata.name === "tab_complete") {
            console.warn(`BOT${botNumber} mendeteksi paket mencurigakan: tab_complete.`);
        }
    });
}

function startSpam(bot, botNumber, maxSpamCount) {
    let spamCount = 0;
    return setInterval(() => {
        if (spamCount >= maxSpamCount) {
            console.log(`BOT${botNumber} selesai spam.`);
            bot.quit(); // Bot keluar setelah spam selesai
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

    // Jangan memulai bot baru jika ada error atau kicked terus-menerus
    setTimeout(() => {
        restartNextBot(botNumber);
    }, config.loginintervalms); // Tunggu sebelum membuat bot berikutnya
}

function restartNextBot(botNumber, reason = "unknown") {
    console.log(`BOT${botNumber} dihentikan karena: ${reason}`);
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
            
