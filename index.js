const startBot = (botNumber) => {
    if (isBotRunning) {
        console.log(`Bot ${botNumber} is waiting for the previous bot to finish.`);
        setTimeout(() => {
            startBot(botNumber);
        }, config.minloginintervalms);
        return;
    }

    isBotRunning = true;
    const randomSuffix = Math.floor(Math.random() * 10000); // Unique username
    const username = `${config.crackedusernameprefix}${botNumber}_${randomSuffix}`;

    const bot = mineflayer.createBot({
        host: config.ip,
        port: config.port,
        username: username,
        version: config.version,
    });

    bot.on('login', () => {
        console.log(`Bot ${bot.username} logged in successfully!`);
        setTimeout(() => {
            bot.chat(`/register ${config.password} ${config.password}`);
            bot.chat(`/login ${config.password}`);
        }, 2000);
    });

    bot.on('kicked', (reason) => {
        console.log(`Bot ${bot.username} was kicked: ${reason}`);
        isBotRunning = false;
        botNumber++;
        setTimeout(() => {
            startBot(botNumber);
        }, getRandomInterval(config.minloginintervalms, config.maxloginintervalms)); // Avoid spam join
    });

    bot.on('error', (err) => {
        console.log(`Error for bot ${bot.username}:`, err);
        isBotRunning = false;
        botNumber++;
        setTimeout(() => {
            startBot(botNumber);
        }, getRandomInterval(config.minloginintervalms, config.maxloginintervalms)); // Add delay
    });

    bot.on('end', () => {
        console.log(`Bot ${bot.username} disconnected.`);
        isBotRunning = false;
    });
};
