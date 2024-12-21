const snekfetch = require("snekfetch");
const config = require("./config.json");
let currentNumber = 100; // Mulai dari BOT100

function createBot(botNumber) {
    if (config.altening) {
        snekfetch.get(`http://api.thealtening.com/v1/generate?token=${config.altening_token}&info=true`).then(n => {
            var mineflayer = require('mineflayer');
            var bot = mineflayer.createBot({
                host: config.ip,
                port: config.port,
                username: n.body.token,
                password: "a",
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

            handleBot(bot, botNumber);
        });
    } else {
        var mineflayer = require('mineflayer');
        var bot = mineflayer.createBot({
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
                blocks: true
            }
        });

        handleBot(bot, botNumber);
    }
}

function handleBot(bot, botNumber) {
    bot.on('login', () => {
        bot.chat("/login p@ssword123");
        bot.chat("/register p@ssword123 p@ssword123");

        let spamCount = 0;
        console.log(`Bot ${bot.username} mulai spam.`);
        const spamInterval = setInterval(() => {
            if (spamCount < 10) {
                bot.chat(config.spammessage);
                spamCount++;
            } else {
                clearInterval(spamInterval);
                console.log(`Bot ${bot.username} selesai spam.`);
                bot.quit(); // Bot keluar setelah spam selesai
                setTimeout(() => createBot(botNumber + 1), config.loginintervalms); // Lanjut ke bot berikutnya
            }
        }, config.spamintervalms);
    });

    bot.on('spawn', () => {
        console.log(`Bot ${bot.username} telah masuk ke dunia.`);
    });

    bot.on('error', err => {
        console.log(`Error pada Bot ${bot.username}:`, err);
    });

    bot.on('kicked', reason => {
        console.log(`Bot ${bot.username} ditendang:`, reason);
        setTimeout(() => createBot(botNumber + 1), config.loginintervalms); // Lanjut ke bot berikutnya
    });
}

// Mulai dengan bot pertama
createBot(currentNumber);
           
