const { Markup } = require('telegraf');

module.exports = (bot) => {
  bot.action('itScene', (ctx) => {
    ctx.scene.enter('itScene');
  });
  bot.action('sportsScene', (ctx) => {
    ctx.scene.enter('sportsScene');
  });
  bot.action('politicsScene', (ctx) => {
    ctx.scene.enter('politicsScene');
  });
  bot.action('NovosibirskScene', async (ctx) => {
    ctx.scene.enter('NovosibirskScene');
  });
};