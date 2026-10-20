const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function test() {
  // Test 1: Fetch movies page via proxy
  console.log('=== Testing fetch via allorigins.win ===');
  try {
    const html = await get(
      'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://sololatino.net/peliculas?page=1')
    );
    console.log('HTML length:', html.length);
    
    // Check if sololatino content is in the HTML
    const hasPelicula = html.includes('/pelicula/');
    const hasSerie = html.includes('/serie/');
    console.log('Has /pelicula/:', hasPelicula);
    console.log('Has /serie/:', hasSerie);
    
    // Check for Cloudflare challenge
    const hasCloudflare = html.includes('cf-browser-verification') || html.includes('cloudflare') && html.includes('challenge');
    console.log('Has CF challenge:', hasCloudflare);
    
  } catch (e) {
    console.error('Fetch error:', e.message);
  }

  // Test 2: Try direct fetch
  console.log('\n=== Testing direct fetch ===');
  try {
    const html = await get(
      'https://sololatino.net/peliculas?page=1'
    );
    console.log('Direct HTML length:', html.length);
    
    // Check for iframe or redirect
    if (html.includes('<iframe')) {
      console.log('Has iframe (CF challenge)');
      const srcMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
      if (srcMatch) console.log('Iframe src:', srcMatch[1]);
    }
    
  } catch (e) {
    console.error('Direct fetch error:', e.message);
  }

  // Test 3: Try corsproxy.io
  console.log('\n=== Testing corsproxy.io ===');
  try {
    const html = await get(
      'https://corsproxy.io/?' + encodeURIComponent('https://sololatino.net/peliculas?page=1')
    );
    console.log('Corsproxy HTML length:', html.length);
    const hasPelicula = html.includes('/pelicula/');
    console.log('Has /pelicula/:', hasPelicula);
  } catch (e) {
    console.error('Corsproxy error:', e.message);
  }

  // Test 4: Try codetabs.com
  console.log('\n=== Testing codetabs.com ===');
  try {
    const html = await get(
      'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent('https://sololatino.net/peliculas?page=1')
    );
    console.log('Codetabs HTML length:', html.length);
    const hasPelicula = html.includes('/pelicula/');
    console.log('Has /pelicula/:', hasPelicula);
  } catch (e) {
    console.error('Codetabs error:', e.message);
  }

  // Test 5: Try cloudscraper-like approach with custom headers
  console.log('\n=== Testing direct fetch with headers ===');
  function getWithHeaders(url, headers = {}) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'sololatino.net',
        path: '/peliculas?page=1',
        port: 443,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-419,es;q=0.9,en;q=0.8',
          ...headers
        }
      };
      https.get(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });
  }

  try {
    const html = await getWithHeaders();
    console.log('Direct with headers length:', html.length);
    
    // Check for CF challenge
    if (html.includes('cf-browser-verification')) {
      console.log('Has Cloudflare browser verification');
      // Try to extract the challenge URL
      const challengeMatch = html.match(/<form[^>]*action=["']([^"']*?)["'][^>]*>/i);
      if (challengeMatch) console.log('Challenge action:', challengeMatch[1]);
    } else {
      console.log('No CF challenge - content accessible!');
      const hasPelicula = html.includes('/pelicula/');
      console.log('Has /pelicula/:', hasPelicula);
      
      // Extract first few links
      if (hasPelicula) {
        const linkRegex = /href="\/pelicula\/([^"]+)"/g;
        let match;
        let count = 0;
        while ((match = linkRegex.exec(html)) && count < 5) {
          console.log('Link:', match[0]);
          count++;
        }
      }
    }
  } catch (e) {
    console.error('Direct headers error:', e.message);
  }
}

test();
