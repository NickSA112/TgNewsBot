const axios = require('axios');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const pool = require('../database');

async function parsePage() {
  try {
    const sources = [
      { url: 'https://tgstat.ru/channel/@breakingmash', source: 'https://t.me/breakingmash' },
      { url: 'https://tgstat.ru/channel/@rian_ru', source: 'https://t.me/rian_ru' },
      { url: 'https://tgstat.ru/channel/@Match_TV', source: 'https://t.me/Match_TV' },
      { url: 'https://tgstat.ru/channel/@ru2ch', source: 'https://t.me/ru2ch' },
      { url: 'https://tgstat.ru/channel/@dimsmirnov175', source: 'https://t.me/dimsmirnov175' },
      { url: 'https://tgstat.ru/channel/@inc54', source: 'https://t.me/inc54' },
      { url: 'https://tgstat.ru/channel/@mash_siberia', source: 'https://t.me/mash_siberia' },
      { url: 'https://tgstat.ru/channel/H0Y2jY3xUpk5NmUy', source: 'https://t.me/joinchat/H0Y2jY3xUpk5NmUy' }
    ];

    for (let i = 0; i < sources.length; i++) {
      const { url, source } = sources[i];
      const { data } = await axios.get(url);
      const dom = new JSDOM(data);
      const posts = Array.from(dom.window.document.querySelectorAll('.indent-for-blocks'));

      const maxPosts = Math.min(10, posts.length);

      for (let j = 0; j < maxPosts; j++) {
        const post = posts[j];
        const { imgSrc, postText, videoLinks } = parsePostContent(post);

        const categoryId = await getCategoryByKeyword(postText);
        if (categoryId) {
          const existingNews = await getNewsByPostText(postText);
          if (!existingNews) {
            await insertNews(categoryId, source, imgSrc, postText.trim(), videoLinks);
          }
        }
      }
    }

    console.log('Parsing and inserting data into the database completed.');

  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

async function getNewsByPostText(postText) {
  try {
    const query = 'SELECT * FROM News WHERE postText = $1 LIMIT 1';
    const values = [postText];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function insertNews(categoryId, source, imgSrc, postText, videoLinks) {
  try {
    const query = `INSERT INTO News (category_id, source, imgSrc, postText, videoLinks) VALUES ($1, $2, $3, $4, $5)`;
    const values = [categoryId, source, imgSrc, postText, videoLinks];

    await pool.query(query, values);

  } catch (error) {
    console.error('Error inserting news:', error);
  }
}

async function getCategoryByKeyword(text) {
  try {
    const keywords = JSON.parse(fs.readFileSync('src/parce/keywords.json'));

    const lowercaseText = text.toLowerCase();

    for (let i = 0; i < keywords.length; i++) {
      const { keyword, categoryId } = keywords[i];
      const lowercaseKeyword = keyword.toLowerCase();

      const regex = new RegExp(`(^|[^\\p{L}\\p{N}_])${lowercaseKeyword}([^\\p{L}\\p{N}_]|$)`, 'iu');
      if (regex.test(lowercaseText)) {
        return categoryId;
      }
    }

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function parsePostContent(post) {
  const imgSrc = post.querySelector('.post-img-img')?.src || '';
  const postText = post.querySelector('.post-text')?.innerHTML.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?a[^>]*>/g, '') || '';
  let videoLinks = '';

  const videoElements = post.querySelectorAll('.wrapper-video-video source');
  videoElements.forEach((element) => {
    const src = element.src;
    videoLinks += src + ' ';
  });

  return { imgSrc, postText, videoLinks };
}

parsePage();
