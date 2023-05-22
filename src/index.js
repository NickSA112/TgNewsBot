require('dotenv').config();

const { BOT_TOKEN } = process.env;

const { Telegraf, session, Scenes: { Stage } } = require('telegraf');
const keyboards = require('./keyboards');
const itScene = require('./scenes/itScene');
const sportsScene = require('./scenes/sportsScene');
const politicsScene = require('./scenes/politicsScene');
const NovosibirskScene = require('./scenes/NovosibirskScene');
const startScene = require('./scenes/startScene');
const cron = require('node-cron');

const init = async (bot, config) => {
  const stage = new Stage([startScene, itScene, sportsScene, politicsScene, NovosibirskScene]);
  bot.use(session());
  bot.use(stage.middleware());

  keyboards(bot);
  bot.command('start', async (ctx) => {
    await ctx.scene.leave();
    await ctx.scene.enter('startScene');
  });
  
  return bot;
};

init(new Telegraf(BOT_TOKEN), process.env).then(async bot => {

  cron.schedule('*/1 * * * *', () => {
    const { spawn } = require('child_process');
    const parserProcess = spawn('node', ['src/parce/parceNews']);

    parserProcess.stdout.on('data', (data) => {
      console.log(`Parser output: ${data}`);
    });

    parserProcess.stderr.on('data', (data) => {
      console.error(`Parser error: ${data}`);
    });

    parserProcess.on('close', (code) => {
      console.log(`Parser process exited with code ${code}`);
    });
  });
  await bot.launch();
});

module.exports = init;