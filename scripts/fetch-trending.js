// ═══════════════════════════════════════════════════
//  Fetches trending RSS feeds and writes trending.json
//  Run daily by .github/workflows/update-trending.yml
//  Requires Node 18+ (built-in fetch)
// ═══════════════════════════════════════════════════
const fs = require('fs');

const FEEDS = {
  yt:   'https://news.google.com/rss/search?q=youtube+creators+trending&hl=en-IN&gl=IN&ceid=IN:en',
  gn:   'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en',
  tech: 'https://techcrunch.com/feed/',
  ent:  'https://variety.com/feed/'
};

// Headlines containing these words are skipped (keeps the site advertiser/AdSense friendly)
const BLOCKED = /\b(rape[sd]?|rapist|gang-?rape|molest\w*|sexual assault|sexually assault\w*|murder\w*|suicide|self-harm|lynch\w*|massacre|beheaded|porn\w*|drugged|terror attack|bomb blast|shot dead|stabbed|killed|kills)\b/i;

function stripCdata(s) {
  return (s || '').replace('<![CDATA[', '').replace(']]>', '').trim();
}

function parseRss(xml) {
  var items = [];
  var blocks = xml.split('<item>').slice(1);
  blocks.forEach(function (block) {
    var titleMatch = block.match(/<title>([\s\S]*?)<\/title>/);
    var linkMatch = block.match(/<link>([\s\S]*?)<\/link>/);
    var pubMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    if (titleMatch) {
      items.push({
        title: stripCdata(titleMatch[1]),
        link: linkMatch ? stripCdata(linkMatch[1]) : '',
        pubDate: pubMatch ? stripCdata(pubMatch[1]) : ''
      });
    }
  });
  items = items.filter(function (it) { return !BLOCKED.test(it.title); });
  items.sort(function (a, b) { return new Date(b.pubDate) - new Date(a.pubDate); });
  return items.slice(0, 8);
}

async function fetchFeed(url) {
  try {
    var res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ViraloraBot/1.0)' }
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var xml = await res.text();
    return parseRss(xml);
  } catch (e) {
    console.error('Failed to fetch', url, e.message);
    return [];
  }
}

function escapeHtml(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Real "most popular" YouTube videos in India (needs YOUTUBE_API_KEY secret; returns null if missing/failed)
async function fetchYouTubeTrending() {
  var key = process.env.YOUTUBE_API_KEY;
  if (!key) { console.log('No YOUTUBE_API_KEY set, using news feed for yt'); return null; }
  try {
    var url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=IN&maxResults=30&key=' + key;
    var res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var data = await res.json();
    var items = (data.items || []).map(function (v) {
      return {
        title: escapeHtml(v.snippet.title) + ' - ' + escapeHtml(v.snippet.channelTitle),
        link: 'https://www.youtube.com/watch?v=' + v.id,
        pubDate: v.snippet.publishedAt
      };
    }).filter(function (it) { return !BLOCKED.test(it.title); });
    return items.slice(0, 8);
  } catch (e) {
    console.error('YouTube API failed:', e.message);
    return null;
  }
}

async function main() {
  var result = {};
  for (var key in FEEDS) {
    result[key] = await fetchFeed(FEEDS[key]);
    console.log(key + ':', result[key].length, 'items');
  }
  var ytVideos = await fetchYouTubeTrending();
  if (ytVideos && ytVideos.length) { result.yt = ytVideos; console.log('yt: using YouTube API,', ytVideos.length, 'videos'); }
  result.updatedAt = new Date().toISOString();
  fs.writeFileSync('trending.json', JSON.stringify(result, null, 2));
  console.log('trending.json written.');
}

main();
