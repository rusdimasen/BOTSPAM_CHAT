const snekfetch = require("snekfetch");
const config = require("./config.json");

let number = 100;
let activeBotIndex = 0; // Indeks bot yang aktif mengirim pesan
const bots = []; // Daftar bot aktif
const botSpamCounts = {}; // Melacak jumlah pesan tiap bot
const maxSpamCount = config.maxSpamCount || 15; // Default jumlah pesan sebelum bot di-kick

setInterval(() => {
    number += 1;

    if (config.altening === true) {
        snekfetch
            .get(`http://api.thealtening.com/v1/generate?token=${config.altening_token}&info=true`)
            .then(n => {
                createBot(n.body.token);
            });
    } else {
        createBot(config.crackedusernameprefix + number.toString());
    }
}, config.loginintervalms);

function createBot(username) {
    const mineflayer = require("mineflayer");
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

    bot.on("login", () => {
        bot.chat(`/login ${config.loginpassword}`); // Login otomatis
        bot.chat(`/register ${config.registerpassword} ${config.registerpassword}`); // Register otomatis
        bots.push(bot); // Tambahkan bot ke daftar
        botSpamCounts[bot.username] = 0; // Inisialisasi jumlah pesan bot
        console.log("Logged in " + bot.username);
    });

    bot.on("error", err => console.log(err));
    bot.on("kicked", reason => {
        console.log(`Bot ${username} kicked for reason: ${reason}`);
        removeBot(bot); // Hapus bot dari daftar jika di-kick
    });
}

// Interval untuk mengirim pesan bergantian antar bot
setInterval(() => {
    if (bots.length > 0) {
        const activeBot = bots[activeBotIndex];
        if (activeBot && activeBot.player) {
            activeBot.chat(config.spammessages[botSpamCounts[activeBot.username] % config.spammessages.length]); // Kirim pesan
            botSpamCounts[activeBot.username] += 1; // Tambah jumlah pesan bot
            console.log(`Bot ${activeBot.username} mengirimkan pesan ke-${botSpamCounts[activeBot.username]}.`);

            // Kick bot jika jumlah pesan mencapai batas
            if (botSpamCounts[activeBot.username] >= maxSpamCount) {
                console.log(`Bot ${activeBot.username} mencapai batas pesan (${maxSpamCount}) dan akan di-kick.`);
                activeBot.end(); // Keluar dari server
                removeBot(activeBot); // Hapus bot dari daftar
            }
        }
        activeBotIndex = (activeBotIndex + 1) % bots.length; // Beralih ke bot berikutnya
    }
}, config.spamintervalms);

// Fungsi untuk menghapus bot dari daftar
function removeBot(bot) {
    const index = bots.indexOf(bot);
    if (index > -1) {
        bots.splice(index, 1);
        delete botSpamCounts[bot.username];
    }
}
