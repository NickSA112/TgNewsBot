const { Markup } = require('telegraf');
const { BaseScene } = require('telegraf/scenes');

const startScene = new BaseScene('startScene');

startScene.enter(async (ctx) => {
  await ctx.replyWithHTML(
    '<b>Выберите категорию новостей</b>',
    Markup.inlineKeyboard([
      [
        Markup.button.callback('IT', 'itScene'),
        Markup.button.callback('Спорт', 'sportsScene'),
      ],
      [
        Markup.button.callback('Политика', 'politicsScene'),
        Markup.button.callback('Новосибирские', 'NovosibirskScene'),
      ],
    ])
  )
});

module.exports = startScene;
