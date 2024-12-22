const snekfetch = require("snekfetch");
const config = require("./config.json");
let currentNumber = 100; // Mulai dari BOT100

function createBot(botNumber) {
    const mineflayer = require("mineflayer");
    let bot;

    if (config.altening) {
        snekfetch
            .get(`http://api.thealtening.com/v1/generate?token=${config.altening_token}&info=true`)
            .then((n) => {
                bot = mineflayer.createBot({
                    host: config.ip,
                    port: config.port,
                    username: n.body.token,
                    password: "a",
                    version: config.version,
                    plugins: generatePluginConfig(),
                });
                handleBot(bot, botNumber);
            });
    } else {
        bot = mineflayer.createBot({
            host: config.ip,
            port: config.port,
            username: `${config.crackedusernameprefix}${botNumber}`,
            version: config.version,
            plugins: generatePluginConfig(),
        });
        handleBot(bot, botNumber);
    }
}

function generatePluginConfig() {
    return {
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
        blocks: true,
    };
}

function handleBot(bot, botNumber) {
    bot.on("login", () => {
        bot.chat("/login p@ssword123");
        bot.chat("/register p@ssword123 p@ssword123");

        console.log(`Bot ${bot.username} berhasil login.`);
        spamMessages(bot, botNumber);
    });

    bot.on("spawn", () => {
        console.log(`Bot ${bot.username} telah masuk ke dunia.`);
    });

    // Proteksi Deteksi Plugin - Tab Complete
    bot.on("packet", (data, metadata) => {
        if (metadata && metadata.name === "tab_complete") {
            console.log(`Bot ${bot.username} mendeteksi paket mencurigakan: tab_complete.`);
            return; // Blokir paket tab_complete
        }
    });

    bot.on("error", (err) => {
        console.error(`Error pada Bot ${bot.username}:`, err);
        restartNextBot(botNumber); // Jika error, lanjutkan ke bot berikutnya
    });

    bot.on("kicked", (reason) => {
        console.warn(`Bot ${bot.username} ditendang:`, reason);
        restartNextBot(botNumber); // Jika ditendang, lanjutkan ke bot berikutnya
    });
}

function spamMessages(bot, botNumber) {
    let spamCount = 0;
    const spamInterval = setInterval(() => {
        if (spamCount < 15) { // Ganti 15 untuk jumlah pesan spam
            bot.chat(config.spammessage);
            spamCount++;
        } else {
            clearInterval(spamInterval);
            console.log(`Bot ${bot.username} selesai spam.`);
            bot.quit(); // Bot keluar setelah spam selesai
            restartNextBot(botNumber);
        }
    }, config.spamintervalms);
}

function restartNextBot(botNumber) {
    const nextBotNumber = botNumber + 1;
    setTimeout(() => {
        console.log(`Memulai bot berikutnya: BOT${nextBotNumber}`);
        createBot(nextBotNumber);
    }, config.loginintervalms); // Tunggu sebelum membuat bot berikutnya
}

// Mulai dengan bot pertama
createBot(currentNumber);
