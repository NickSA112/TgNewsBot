const pool = require('./database');

async function fetchAndDisplayNews(ctx, chatId, categoryId) {
  try {
    const query =
     `SELECT news_id, videolinks, imgsrc, posttext, source
      FROM News
      WHERE category_id = $1
        AND news_id NOT IN (SELECT news_id FROM DisplayedNews WHERE chat_id = $2)
      ORDER BY news_id DESC
      LIMIT 3`;
    const { rows } = await pool.query(query, [categoryId, chatId]);

    if (rows.length > 0) {
      rows.forEach(async (news) => {
        const { news_id, videolinks, imgsrc, posttext, source } = news;
        let message = '';

        if (imgsrc) {
          message += `<a href="${imgsrc}"> </a>`;
        }

        if (videolinks) {
          message += `<a href="${videolinks}"> </a>`;
        }

        message += `${posttext}\n\n`;
        message += `<a href="${source}">Источник</a>`;

        await ctx.replyWithHTML(message);

        const saveQuery = 'INSERT INTO DisplayedNews (chat_id, news_id) VALUES ($1, $2)';
        await pool.query(saveQuery, [chatId, news_id]);
      });
    } else {
      ctx.reply('Нет доступных новостей в данной категории.');
    }
  } catch (error) {
    console.error(error);
    ctx.reply('Произошла ошибка при получении новостей. Попробуйте еще раз позже.');
  }
}

module.exports = { fetchAndDisplayNews };
