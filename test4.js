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

function extractJsonLd(html) {
  const results = [];
  
  // Find all script[type="application/ld+json"] blocks
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  
  while ((match = regex.exec(html))) {
    try {
      const data = JSON.parse(match[1]);
      
      // Look for ItemList with itemListElement containing movies/series
      if (data['@graph']) {
        for (const item of data['@graph']) {
          if (item.potentialAction && item.potentialAction.target) {
            const target = Array.isArray(item.potentialAction.target) 
              ? item.potentialAction.target[0] : item.potentialAction.target;
            
            // This is likely a movie/series page with WatchAction
            results.push({ type: 'detail', data: item });
          }
          
          if (item.itemListElement && Array.isArray(item.itemListElement)) {
            // This is the ItemList of movies/series!
            for (const listEl of item.itemListElement) {
              const url = listEl.url || '';
              if (url.includes('/pelicula/') || url.includes('/serie/')) {
                results.push({
                  slug: url.split('/').pop(),
                  name: listEl.name,
                  image: listEl.image,
                  type: url.includes('/pelicula/') ? 'movie' : 'series'
                });
              }
            }
          }
        }
      }
      
      // Top-level ItemList
      if (data['@type'] === 'ItemList') {
        for (const listEl of data.itemListElement || []) {
          const url = listEl.url || '';
          if (url.includes('/pelicula/') || url.includes('/serie/')) {
            results.push({
              slug: url.split('/').pop(),
              name: listEl.name,
              image: listEl.image,
              type: url.includes('/pelicula/') ? 'movie' : 'series'
            });
          }
        }
      }
    } catch (e) {
      // Skip invalid JSON
    }
  }
  
  return results;
}

async function test() {
  console.log('=== Testing movies page via JSON-LD ===');
  try {
    const html = await get('/peliculas?page=1');
    
    const items = extractJsonLd(html);
    console.log(`Found ${items.length} items`);
    
    // Show first 5
    for (const item of items.slice(0, 5)) {
      console.log(` - "${item.name}" [${item.slug}]`);
      if (item.image) console.log(`   Image: ${item.image.substring(0, 80)}...`);
    }

  } catch (e) {
    console.error('Error:', e.message);
  }

  console.log('\n=== Testing search via JSON-LD ===');
  try {
    const html = await get('/buscar?q=cyberpunk');
    
    const items = extractJsonLd(html);
    console.log(`Found ${items.length} results for "cyberpunk"`);
    
    // Show first 5
    for (const item of items.slice(0, 5)) {
      console.log(` - "${item.name}" [${item.slug}]`);
      if (item.image) console.log(`   Image: ${item.image.substring(0, 80)}...`);
    }

  } catch (e) {
    console.error('Error:', e.message);
  }

  console.log('\n=== Testing series page via JSON-LD ===');
  try {
    const html = await get('/series?page=1');
    
    const items = extractJsonLd(html);
    console.log(`Found ${items.length} items`);
    
    for (const item of items.slice(0, 3)) {
      console.log(` - "${item.name}" [${item.slug}]`);
    }

  } catch (e) {
    console.error('Error:', e.message);
  }

  console.log('\n=== Testing detail page ===');
  try {
    const html = await get('/pelicula/kraken');
    
    const items = extractJsonLd(html);
    console.log(`Found ${items.length} structured data blocks`);
    
    for (const item of items) {
      if (item.type === 'detail') {
        console.log('Detail type:', item.data['@type']);
        console.log('Name:', item.data.name);
        console.log('WatchAction target:', item.data.potentialAction?.target);
      }
    }

  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
