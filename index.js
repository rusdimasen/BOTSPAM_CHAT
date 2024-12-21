const snekfetch = require("snekfetch");
const config = require("./config.json");
let currentNumber = 100; // Mulai dari BOT100

function createBot(botNumber) {
    try {
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
    } catch (err) {
        console.error(`Gagal membuat bot ${botNumber}:`, err);
        setTimeout(() => createBot(botNumber + 1), config.loginintervalms); // Coba lagi dengan bot berikutnya
    }
}

function handleBot(bot, botNumber) {
    bot.on("login", () => {
        console.log(`Bot ${bot.username} berhasil login.`);
        try {
            bot.chat("/login p@ssword123");
            bot.chat("/register p@ssword123 p@ssword123");

            let spamCount = 0;
            const spamInterval = setInterval(() => {
                if (spamCount < 15) {
                    bot.chat(config.spammessage);
                    spamCount++;
                } else {
                    clearInterval(spamInterval);
                    console.log(`Bot ${bot.username} selesai spam.`);
                    bot.quit(); // Bot keluar setelah spam selesai
                    setTimeout(() => createBot(botNumber + 1), config.loginintervalms); // Lanjut ke bot berikutnya
                }
            }, randomize(config.spamintervalms));
        } catch (err) {
            console.error(`Error saat bot ${bot.username} melakukan spam:`, err);
        }
    });

    bot.on("spawn", () => {
        console.log(`Bot ${bot.username} telah masuk ke dunia.`);

        // Gerakan acak untuk menghindari deteksi
        setInterval(() => {
            try {
                const movements = ["forward", "back", "left", "right"];
                const randomMove = movements[Math.floor(Math.random() * movements.length)];
                bot.setControlState(randomMove, true);
                setTimeout(() => bot.setControlState(randomMove, false), randomize(...config.movementdurationms));
            } catch (err) {
                console.error(`Error saat bot ${bot.username} melakukan gerakan acak:`, err);
            }
        }, randomize(...config.movementintervalms));
    });

    bot.on("chat", (username, message) => {
        try {
            if (username === bot.username) return; // Abaikan pesan sendiri
            console.log(`[CHAT] ${username}: ${message}`);

            // Menjawab pesan tertentu untuk mensimulasikan manusia
            if (message.toLowerCase().includes("halo")) {
                const response = config.responsemessages[Math.floor(Math.random() * config.responsemessages.length)];
                setTimeout(() => bot.chat(response), randomize(1000, 3000)); // Jawab dengan jeda acak
            }
        } catch (err) {
            console.error(`Error saat bot ${bot.username} merespons chat:`, err);
        }
    });

    bot.on("error", (err) => {
        console.error(`Error pada Bot ${bot.username}:`, err);
        setTimeout(() => createBot(botNumber + 1), config.loginintervalms); // Lanjut ke bot berikutnya jika error
    });

    bot.on("kicked", (reason) => {
        console.log(`Bot ${bot.username} ditendang:`, reason);
        setTimeout(() => createBot(botNumber + 1), config.loginintervalms); // Lanjut ke bot berikutnya jika ditendang
    });
}

// Fungsi untuk membuat angka acak dalam rentang tertentu
function randomize(min, max) {
    if (!max) {
        max = min;
        min = 0;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Mulai dengan bot pertama
createBot(currentNumber);
