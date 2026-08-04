import { mkdir, writeFile } from 'node:fs/promises';

const feeds = [
  { category: '制度', query: '介護保険 OR 福祉 制度 OR 補助金' },
  { category: '人材', query: '介護 人材 OR 処遇改善 OR 外国人介護' },
  { category: 'テック', query: '介護DX OR 介護 テクノロジー OR 見守り' },
  { category: '地域', query: '在宅介護 OR 訪問介護 OR 地域包括ケア' }
];

const decode = (value = '') => value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
const tag = (xml, name) => decode((xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i')) || [,''])[1]);
const itemBlocks = xml => xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
const dateText = date => new Intl.DateTimeFormat('ja-JP', { month: '2-digit', day: '2-digit', timeZone: 'Asia/Tokyo' }).format(new Date(date));

const results = await Promise.all(feeds.map(async ({ category, query }) => {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ja&gl=JP&ceid=JP:ja`;
  const response = await fetch(url, { headers: { 'user-agent': 'KaigoWatch/1.0' } });
  if (!response.ok) throw new Error(`RSS取得失敗: ${response.status}`);
  return itemBlocks(await response.text()).slice(0, 5).map(item => ({
    d: dateText(tag(item, 'pubDate')), c: category, t: tag(item, 'title'),
    x: 'Google ニュースから取得した、福祉・介護に関する最新記事です。', u: tag(item, 'link'),
    publishedAt: tag(item, 'pubDate')
  }));
}));

const unique = new Map();
results.flat().forEach(article => { if (article.t && article.u && !unique.has(article.u)) unique.set(article.u, article); });
const articles = [...unique.values()].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)).slice(0, 30)
  .map(({ publishedAt, ...article }) => article);
await mkdir('data', { recursive: true });
await writeFile('data/news.json', JSON.stringify({ updatedAt: new Date().toISOString(), articles }, null, 2) + '\n');
console.log(`${articles.length}件の記事を更新しました。`);
