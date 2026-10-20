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

function parseHTML(html) {
  // Simple parser - extract links from HTML string without DOMParser
  const results = [];
  
  // Find all /pelicula/ links with surrounding context
  const regex = /href="\/pelicula\/([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  
  while ((match = regex.exec(html)) && results.length < 10) {
    const slug = match[1];
    const context = match[2];
    
    // Try to extract title from alt text or surrounding span
    let title = '';
    const imgMatch = context.match(/alt="([^"]+)"/);
    if (imgMatch) title = imgMatch[1];
    
    if (!title) {
      // Get all text content between tags
      const textOnly = context.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (textOnly.length > 2 && textOnly.length < 80) title = textOnly;
    }

    // Extract poster image URL
    let poster = '';
    const srcMatch = context.match(/src="([^"]+image\.tmdb\.org[^"]+)"/);
    if (srcMatch) poster = srcMatch[1].replace(/\/w\d+\/?/, '/w500');

    // Extract year
    let year = '';
    const yearMatch = context.match(/\b(20\d{2}|19\d{2})\b/);
    if (yearMatch) year = yearMatch[1];

    results.push({ slug, title: title || 'Unknown', year, poster });
  }
  
  return results;
}

async function test() {
  console.log('=== Testing movies page ===');
  try {
    const html = await get('/peliculas?page=1');
    console.log('HTML length:', html.length);
    
    // Check for Cloudflare
    if (html.includes('cf-browser-verification')) {
      console.log('Has CF challenge!');
      return;
    }
    
    const items = parseHTML(html);
    console.log(`Found ${items.length} movies`);
    
    // Show first 5
    for (const item of items.slice(0, 5)) {
      console.log(` - "${item.title}" (${item.year}) [${item.slug}]`);
      if (item.poster) console.log(`   Poster: ${item.poster.substring(0, 80)}...`);
    }

  } catch (e) {
    console.error('Error:', e.message);
  }

  console.log('\n=== Testing series page ===');
  try {
    const html = await get('/series?page=1');
    console.log('HTML length:', html.length);
    
    if (html.includes('cf-browser-verification')) {
      console.log('Has CF challenge!');
      return;
    }

    // Parse series links 
    const results = [];
    const regex = /href="\/serie\/([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    
    while ((match = regex.exec(html)) && results.length < 10) {
      const slug = match[1];
      const context = match[2];
      
      let title = '';
      const imgMatch = context.match(/alt="([^"]+)"/);
      if (imgMatch) title = imgMatch[1];
      else {
        const textOnly = context.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (textOnly.length > 2 && textOnly.length < 80) title = textOnly;
      }

      let poster = '';
      const srcMatch = context.match(/src="([^"]+image\.tmdb\.org[^"]+)"/);
      if (srcMatch) poster = srcMatch[1].replace(/\/w\d+\/?/, '/w500');

      results.push({ slug, title: title || 'Unknown', poster });
    }

    console.log(`Found ${results.length} series`);
    for (const item of results.slice(0, 3)) {
      console.log(` - "${item.title}" [${item.slug}]`);
    }

  } catch (e) {
    console.error('Error:', e.message);
  }

  console.log('\n=== Testing search ===');
  try {
    const html = await get('/buscar?q=cyberpunk');
    console.log('HTML length:', html.length);
    
    if (html.includes('cf-browser-verification')) {
      console.log('Has CF challenge!');
      return;
    }

    // Parse search results - same pattern as movies
    const items = parseHTML(html);
    console.log(`Found ${items.length} results for "cyberpunk"`);
    
  } catch (e) {
    console.error('Error:', e.message);
  }

  console.log('\n=== Testing detail page ===');
  try {
    const html = await get('/serie/cyberpunk-edgerunners');
    console.log('HTML length:', html.length);
    
    // Look for iframe src in the detail page
    const iframes = [];
    const iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/gi;
    let m;
    while ((m = iframeRegex.exec(html))) {
      if (iframes.length < 5) iframes.push(m[1]);
    }
    
    console.log(`Found ${iframes.length} iframes`);
    for (const src of iframes) {
      console.log('  Iframe:', src.substring(0, 100));
    }

    // Look for server links  
    const hostPatterns = ['embed69', 'xupalace'];
    const linkRegex = /href="([^"]*(?:embed69|xupalace)[^"]*)"[^>]*>([^<]*)<\/a>/gi;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(html))) {
      console.log(`  Server: ${linkMatch[2] || 'Unknown'} -> ${linkMatch[1].substring(0, 80)}`);
    }

  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
