const https = require('https');

function get(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'sololatino.net',
      path: path,
      port: 443,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-419,es;q=0.9,en;q=0.8'
      }
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function test() {
  const html = await get('/peliculas?page=1');
  
  // Find a /pelicula/ link and show its context
  const idx = html.indexOf('/pelicula/');
  if (idx > -1) {
    console.log('Context around first /pelicula/ link:');
    console.log(html.substring(Math.max(0, idx-200), idx+300));
  }

  // Find img tags with tmdb images and show context
  const tmdbIdx = html.indexOf('image.tmdb.org');
  if (tmdbIdx > -1) {
    console.log('\nContext around first TMDB image:');
    console.log(html.substring(Math.max(0, tmdbIdx-200), tmdbIdx+300));
  }

  // Find the card structure - look for common patterns
  const cardIdx = html.indexOf('card-title');
  if (cardIdx > -1) {
    console.log('\nContext around card-title:');
    console.log(html.substring(Math.max(0, cardIdx-300), cardIdx+400));
  }

  // Look for any div with class containing "item" or "card"
  const itemDivMatch = html.match(/<div[^>]*class="[^"]*(?:item|card)[^"]*"[^>]*>/i);
  if (itemDivMatch) {
    console.log('\nFound card/item div:');
    // Find the full structure
    let startIdx = itemDivMatch.index;
    let depth = 0;
    let endIdx = startIdx + itemDivMatch[0].length;
    
    // Get surrounding structure (parent container)
    const beforeStart = Math.max(0, startIdx - 200);
    console.log(html.substring(beforeStart, endIdx + 500));
  }

  // Search for the actual HTML pattern used by sololatino
  // Try to find any anchor with /pelicula/ and capture surrounding div structure
  const linkMatch = html.match(/<a[^>]*href="\/pelicula\/[^"]*"[^>]*>[\s\S]{0,500}/i);
  if (linkMatch) {
    console.log('\nFull anchor context:');
    console.log(linkMatch[0]);
  }
}

test();
