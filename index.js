const snekfetch = require("snekfetch");
const config = require("./config.json");
let number = 100;

setInterval(() => {
    number += 1;

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

            bot.on('login', () => {
                setInterval(() => {
                    bot.chat(config.spammessage);
                }, config.spamintervalms);
                console.log("Logged in " + bot.username);
            });

            // Fitur Anti-AFK
            bot.on('spawn', () => {
                setInterval(() => {
                    const movements = ['forward', 'back', 'left', 'right'];
                    const randomMove = movements[Math.floor(Math.random() * movements.length)];
                    bot.setControlState(randomMove, true);
                    setTimeout(() => bot.setControlState(randomMove, false), config.afkdurationms);
                }, config.afkintervalms);
            });

            bot.on('error', err => console.log(err));
            bot.on('kicked', function (reason) {
                console.log("I got kicked for", reason, "lol");
            });
        });
    } else {
        var mineflayer = require('mineflayer');
        var bot = mineflayer.createBot({
            host: config.ip,
            port: config.port,
            username: config.crackedusernameprefix + number.toString(),
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

        bot.on('login', () => {
            bot.chat("/login p@ssword123");
            bot.chat("/register p@ssword123 p@ssword123");
            setInterval(() => {
                bot.chat(config.spammessage);
            }, config.spamintervalms);
            console.log("Logged in " + bot.username);
        });

        // Fitur Anti-AFK
        bot.on('spawn', () => {
            setInterval(() => {
                const movements = ['forward', 'back', 'left', 'right'];
                const randomMove = movements[Math.floor(Math.random() * movements.length)];
                bot.setControlState(randomMove, true);
                setTimeout(() => bot.setControlState(randomMove, false), config.afkdurationms);
            }, config.afkintervalms);
        });

        bot.on('error', err => console.log(err));
        bot.on('kicked', function (reason) {
            console.log("I got kicked for", reason, "lol");
        });
    }
}, config.loginintervalms);
