const { Markup } = require('telegraf');
const { BaseScene } = require('telegraf/scenes');
const { fetchAndDisplayNews } = require('../fetchAndDisplay');
const pool = require('../database');

const itScene = new BaseScene('itScene');

itScene.enter(async (ctx) => {
  const chatId = ctx.chat.id;

  try {
    const checkQuery = 'SELECT news_id FROM DisplayedNews WHERE chat_id = $1';
    const { rows } = await pool.query(checkQuery, [chatId]);

    if (rows.length > 0) {
      fetchAndDisplayNews(ctx, chatId, 1);
      setTimeout(() => {
        showButtons(ctx);
      }, 1000);
    } else {
      ctx.reply('Вы выбрали категорию IT-новостей.');
      setTimeout(() => {
        showButtons(ctx);
      }, 1000);
    }
  } catch (error) {
    console.error(error);
    ctx.reply('Произошла ошибка. Попробуйте еще раз позже.');
  }
});

itScene.action('back', (ctx) => {
  ctx.scene.leave();
  ctx.scene.enter('startScene');
});

itScene.action('forward', async (ctx) => {
  const chatId = ctx.chat.id;

  try {
    fetchAndDisplayNews(ctx, chatId, 1);
    setTimeout(() => {
      showButtons(ctx);
    }, 1000);
  } catch (error) {
    console.error(error);
    ctx.reply('Произошла ошибка при получении новостей. Попробуйте еще раз позже.');
  }
});

function showButtons(ctx) {
  ctx.reply('Получить еще новости?', Markup.inlineKeyboard([
    [Markup.button.callback('Назад', 'back')],
    [Markup.button.callback('Получить новость', 'forward')],
  ]));
}

module.exports = itScene;
