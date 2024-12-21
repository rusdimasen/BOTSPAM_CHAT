const snekfetch = require("snekfetch");
const config = require("./config.json");
let botQueue = []; // Antrian bot
let activeBotIndex = 0; // Indeks bot yang sedang aktif

function createBot(botNumber) {
    const mineflayer = require("mineflayer");

    const bot = mineflayer.createBot({
        host: config.ip,
        port: config.port,
        username: `${config.crackedusernameprefix}${botNumber}`,
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
            blocks: true,
        },
    });

    handleBot(bot, botNumber);
}

function handleBot(bot, botNumber) {
    bot.on("login", () => {
        console.log(`Bot ${bot.username} berhasil login.`);
        bot.chat("/login p@ssword123");
        bot.chat("/register p@ssword123 p@ssword123");

        // Hanya bot pertama yang langsung mulai spam
        if (botQueue[activeBotIndex] === botNumber) {
            setTimeout(() => startSpam(bot), randomize(3000, 6000)); // Delay sebelum aktivitas
        }
    });

    bot.on("spawn", () => {
        console.log(`Bot ${bot.username} telah masuk ke dunia.`);
    });

    bot.on("chat", (username, message) => {
        if (username === bot.username) return; // Abaikan pesan sendiri
        console.log(`[CHAT] ${username}: ${message}`);

        // Jawab pesan tertentu untuk mensimulasikan manusia
        if (message.toLowerCase().includes("halo")) {
            const response = config.responsemessages[Math.floor(Math.random() * config.responsemessages.length)];
            setTimeout(() => bot.chat(response), randomize(2000, 5000)); // Jawab dengan jeda acak
        }
    });

    bot.on("error", (err) => {
        console.error(`Error pada Bot ${bot.username}:`, err);
        if (botQueue[activeBotIndex] === botNumber) {
            nextBot(); // Pindah ke bot berikutnya jika error
        }
    });

    bot.on("kicked", (reason) => {
        console.log(`Bot ${bot.username} ditendang:`, reason);
        if (botQueue[activeBotIndex] === botNumber) {
            nextBot(); // Pindah ke bot berikutnya jika ditendang
        }
    });
}

function startSpam(bot) {
    let spamCount = 0;

    // Interval untuk spam chat
    const spamInterval = setInterval(() => {
        bot.chat(randomizeSpamMessage(config.spammessages));
        spamCount++;

        // Optimalkan agar tidak terlalu sering spam
        if (spamCount >= 10) {
            clearInterval(spamInterval);
            console.log(`Bot ${bot.username} selesai sesi spam.`);
            nextBot(); // Pindah ke bot berikutnya
        }
    }, randomize(config.spamintervalms + 2000, config.spamintervalms + 5000)); // Interval lebih luas untuk menghindari deteksi
}

function randomizeSpamMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)]; // Pilih pesan acak dari daftar
}

function nextBot() {
    // Pindah ke bot berikutnya
    activeBotIndex++;

    if (activeBotIndex >= botQueue.length) {
        activeBotIndex = 0; // Kembali ke bot pertama jika semua bot sudah aktif
    }

    console.log(`Mengalihkan aktivitas spam ke BOT${botQueue[activeBotIndex]}.`);
    const nextBotNumber = botQueue[activeBotIndex];
    const bot = mineflayer.createBot({ host: config.ip, port: config.port, username: `${config.crackedusernameprefix}${nextBotNumber}` });
    setTimeout(() => startSpam(bot), config.loginintervalms);
}

// Fungsi untuk membuat angka acak dalam rentang tertentu
function randomize(min, max) {
    if (!max) {
        max = min;
        min = 0;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Inisialisasi antrian bot
for (let i = 0; i < 10; i++) { // Misalnya ada 10 bot
    botQueue.push(100 + i); // BOT100, BOT101, BOT102, dst.
    createBot(100 + i); // Semua bot langsung login
}
