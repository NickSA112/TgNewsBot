const { Markup } = require('telegraf');
const { BaseScene } = require('telegraf/scenes');
const { fetchAndDisplayNews } = require('../fetchAndDisplay');
const pool = require('../database');

const novosibirskScene = new BaseScene('NovosibirskScene');

novosibirskScene.enter(async (ctx) => {
  const chatId = ctx.chat.id;

  try {
    const checkQuery = 'SELECT news_id FROM DisplayedNews WHERE chat_id = $1';
    const { rows } = await pool.query(checkQuery, [chatId]);

    if (rows.length > 0) {
      fetchAndDisplayNews(ctx, chatId, 3);
      setTimeout(() => {
        showButtons(ctx);
      }, 1000);
    } else {
      ctx.reply('Вы выбрали категорию новостей Новосибирска.');
      setTimeout(() => {
        showButtons(ctx);
      }, 1000);
    }
  } catch (error) {
    console.error(error);
    ctx.reply('Произошла ошибка. Попробуйте еще раз позже.');
  }
});

novosibirskScene.action('back', (ctx) => {
  ctx.scene.leave();
  ctx.scene.enter('startScene');
});

novosibirskScene.action('forward', async (ctx) => {
  const chatId = ctx.chat.id;

  try {
    fetchAndDisplayNews(ctx, chatId, 3);
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

module.exports = novosibirskScene;
