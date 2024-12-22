const snekfetch = require("snekfetch");
const config = require("./config.json");
const mineflayer = require("mineflayer");
let currentNumber = 100; // Mulai dari BOT100

function createBot(botNumber) {
    if (config.altening) {
        fetchAlteningToken()
            .then((token) => {
                initializeBot({
                    username: token,
                    password: "a",
                    botNumber,
                });
            })
            .catch((err) => {
                console.error(`Gagal mendapatkan token Altening:`, err);
                restartNextBot(botNumber);
            });
    } else {
        initializeBot({
            username: `${config.crackedusernameprefix}${botNumber}`,
            botNumber,
        });
    }
}

function fetchAlteningToken() {
    return new Promise((resolve, reject) => {
        snekfetch
            .get(`http://api.thealtening.com/v1/generate?token=${config.altening_token}&info=true`)
            .then((res) => resolve(res.body.token))
            .catch(reject);
    });
}

function initializeBot({ username, password = "", botNumber }) {
    const bot = mineflayer.createBot({
        host: config.ip,
        port: config.port,
        username,
        password,
        version: config.version,
        plugins: generatePluginConfig(),
    });

    handleBot(bot, botNumber);
}

function generatePluginConfig() {
    return {
        physics: config.physics,
        blocks: true,
    };
}

function handleBot(bot, botNumber) {
    let antiAFKInterval;
    let spamInterval;

    bot.on("login", () => {
        console.log(`Bot ${bot.username} berhasil login.`);
        bot.chat("/login p@ssword123");
        bot.chat("/register p@ssword123 p@ssword123");

        spamInterval = startSpam(bot, botNumber);
        antiAFKInterval = startAntiAFK(bot);
    });

    bot.on("spawn", () => console.log(`Bot ${bot.username} telah masuk ke dunia.`));

    bot.on("packet", (data, metadata) => {
        if (metadata?.name === "tab_complete") {
            console.warn(`Bot ${bot.username} mendeteksi paket tab_complete.`);
        }
    });

    bot.on("error", (err) => handleExit(bot, antiAFKInterval, spamInterval, botNumber, `Error: ${err}`));
    bot.on("kicked", (reason) => handleExit(bot, antiAFKInterval, spamInterval, botNumber, `Kicked: ${reason}`));
    bot.on("end", () => handleExit(bot, antiAFKInterval, spamInterval, botNumber));
}

function startSpam(bot, botNumber) {
    let spamCount = 0;
    const interval = setInterval(() => {
        if (spamCount < 15) {
            bot.chat(config.spammessage);
            spamCount++;
        } else {
            clearInterval(interval);
            console.log(`Bot ${bot.username} selesai spam.`);
            bot.quit();
            restartNextBot(botNumber);
        }
    }, config.spamintervalms);
    return interval;
}

function startAntiAFK(bot) {
    return setInterval(() => {
        bot.setControlState("jump", true);
        setTimeout(() => bot.setControlState("jump", false), config.afkdurationms);
    }, config.afkintervalms);
}

function handleExit(bot, antiAFKInterval, spamInterval, botNumber, reason = "") {
    if (reason) console.log(`Bot ${bot.username} keluar: ${reason}`);
    clearInterval(antiAFKInterval);
    clearInterval(spamInterval);
    restartNextBot(botNumber);
}

function restartNextBot(botNumber) {
    const nextBotNumber = botNumber + 1;
    setTimeout(() => {
        console.log(`Memulai bot berikutnya: BOT${nextBotNumber}`);
        createBot(nextBotNumber);
    }, config.loginintervalms);
}

// Validasi konfigurasi sebelum memulai
if (!config.ip || !config.port || !config.version || !config.crackedusernameprefix ||
    !config.spammessage || !config.spamintervalms || !config.loginintervalms) {
    throw new Error("Konfigurasi di config.json tidak lengkap!");
}

// Mulai dengan bot pertama
createBot(currentNumber);
