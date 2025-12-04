import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { httpStatusCodes } from '../src/data/statusCodes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public', 'rabbits');

// Ensure the rabbits directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

// Contextual search queries for each status code to find situationally relevant rabbit images
const contextualQueries: Record<number, string> = {
  // 1xx Informational
  100: 'rabbit waiting listening',
  101: 'rabbit changing switching',
  102: 'rabbit working busy processing',
  103: 'rabbit preparing getting ready',

  // 2xx Success
  200: 'rabbit happy successful',
  201: 'rabbit building creating',
  202: 'rabbit nodding accepting',
  203: 'rabbit messenger delivering',
  204: 'rabbit empty blank',
  205: 'rabbit cleaning refreshing',
  206: 'rabbit eating partial',
  207: 'rabbit multiple group',
  208: 'rabbit already done',
  226: 'rabbit transformed different',

  // 3xx Redirection
  300: 'rabbit choosing options paths',
  301: 'rabbit moving permanently',
  302: 'rabbit hopping temporary',
  303: 'rabbit pointing directing',
  304: 'rabbit same unchanged',
  305: 'rabbit behind fence proxy',
  306: 'rabbit confused old',
  307: 'rabbit detour temporary',
  308: 'rabbit moved new home',

  // 4xx Client Errors
  400: 'rabbit confused question',
  401: 'rabbit guard blocking',
  402: 'rabbit money payment',
  403: 'rabbit forbidden no entry',
  404: 'rabbit lost hiding missing',
  405: 'rabbit stop rejected',
  406: 'rabbit picky refusing',
  407: 'rabbit gatekeeper',
  408: 'rabbit sleeping timeout',
  409: 'rabbit fighting conflict',
  410: 'rabbit gone empty',
  411: 'rabbit measuring length',
  412: 'rabbit requirements failed',
  413: 'rabbit too big large',
  414: 'rabbit long stretched',
  415: 'rabbit wrong format',
  416: 'rabbit reaching unreachable',
  417: 'rabbit disappointed expectation',
  418: 'rabbit teapot tea',
  421: 'rabbit wrong place misdirected',
  422: 'rabbit rules validation',
  423: 'rabbit locked cage',
  424: 'rabbit chain dependent',
  425: 'rabbit early too soon',
  426: 'rabbit upgrade level up',
  428: 'rabbit requirement needed',
  429: 'rabbit tired exhausted rate limit',
  430: 'rabbit header',
  431: 'rabbit overwhelmed too much',
  440: 'rabbit session expired',
  444: 'rabbit silent no response',
  449: 'rabbit retry again',
  450: 'rabbit parental blocked',
  451: 'rabbit legal forbidden law',
  460: 'rabbit closed connection',
  463: 'rabbit many addresses',
  494: 'rabbit header large',
  495: 'rabbit certificate ssl',
  496: 'rabbit certificate required',
  497: 'rabbit secure https',
  498: 'rabbit token invalid',
  499: 'rabbit quit left',

  // 5xx Server Errors
  500: 'rabbit broken error crash',
  501: 'rabbit shrug not implemented',
  502: 'rabbit bad gateway middleman',
  503: 'rabbit maintenance down',
  504: 'rabbit timeout waiting clock',
  505: 'rabbit old version outdated',
  506: 'rabbit circular loop',
  507: 'rabbit full storage',
  508: 'rabbit infinite loop dizzy',
  510: 'rabbit extension required',
  511: 'rabbit network authentication',
  520: 'rabbit unknown mystery',
  521: 'rabbit down offline',
  522: 'rabbit timeout connection',
  523: 'rabbit unreachable far',
  524: 'rabbit timeout slow',
  525: 'rabbit handshake ssl',
  526: 'rabbit certificate invalid',
  527: 'rabbit railgun error',
  529: 'rabbit overloaded stress',
  530: 'rabbit frozen ice',
  561: 'rabbit unauthorized',
  598: 'rabbit network timeout',
  599: 'rabbit network timeout',
};

async function searchUnsplashRabbit(statusCode: number, message: string): Promise<string | null> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.log('⚠️  No UNSPLASH_ACCESS_KEY found. Skipping image downloads.');
    console.log('   Set UNSPLASH_ACCESS_KEY environment variable to download images.');
    return null;
  }

  try {
    // Use contextual query if available, otherwise use status message
    const contextQuery = contextualQueries[statusCode];
    const searchQuery = contextQuery || `rabbit ${message.toLowerCase()}`;
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=3&orientation=landscape`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!response.ok) {
      console.error(`Failed to search for ${statusCode}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      // Return the first result (you can manually review and pick different ones later)
      const photo = data.results[0];
      console.log(`   📸 Query: "${searchQuery}"`);
      console.log(`   📊 Found ${data.results.length} results`);
      return photo.urls.regular;
    }

    // Fallback to generic rabbit search
    console.log(`   🔄 No results for "${searchQuery}", trying generic rabbit...`);
    const fallbackUrl = `https://api.unsplash.com/search/photos?query=rabbit&per_page=3&orientation=landscape`;
    const fallbackResponse = await fetch(fallbackUrl, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      if (fallbackData.results && fallbackData.results.length > 0) {
        return fallbackData.results[0].urls.regular;
      }
    }
  } catch (error) {
    console.error(`Error searching for ${statusCode}:`, error);
  }

  return null;
}

async function downloadImage(url: string, filename: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to download ${filename}: ${response.statusText}`);
      return false;
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(path.join(publicDir, filename), Buffer.from(buffer));
    return true;
  } catch (error) {
    console.error(`Error downloading ${filename}:`, error);
    return false;
  }
}

async function main() {
  console.log('🐰 HTTP Status Rabbits Image Downloader\n');

  if (!UNSPLASH_ACCESS_KEY) {
    console.log('ℹ️  No Unsplash API key provided.');
    console.log('   Creating placeholder images instead...\n');

    // Create a simple placeholder image mapping file
    const placeholders: Record<number, string> = {};
    for (const status of httpStatusCodes) {
      placeholders[status.code] = `https://picsum.photos/seed/${status.code}/800/600`;
    }

    fs.writeFileSync(
      path.join(__dirname, '..', 'src', 'data', 'imagePlaceholders.json'),
      JSON.stringify(placeholders, null, 2)
    );

    console.log('✅ Created placeholder image mappings');
    console.log('\n💡 To use real rabbit images:');
    console.log('   1. Get a free API key from https://unsplash.com/developers');
    console.log('   2. Set UNSPLASH_ACCESS_KEY environment variable');
    console.log('   3. Run this script again\n');
    return;
  }

  console.log(`Processing ${httpStatusCodes.length} status codes...\n`);

  let successCount = 0;
  let failCount = 0;

  for (const status of httpStatusCodes) {
    const filename = `${status.code}.jpg`;
    const filepath = path.join(publicDir, filename);

    // Skip if already exists
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  ${status.code} - Already exists`);
      successCount++;
      continue;
    }

    console.log(`🔍 ${status.code} - ${status.message}`);

    // Search for rabbit image
    const imageUrl = await searchUnsplashRabbit(status.code, status.message);

    if (imageUrl) {
      const success = await downloadImage(imageUrl, filename);
      if (success) {
        console.log(`✅ ${status.code} - Downloaded`);
        successCount++;
      } else {
        console.log(`❌ ${status.code} - Failed to download`);
        failCount++;
      }
    } else {
      console.log(`⚠️  ${status.code} - No image found`);
      failCount++;
    }

    // Rate limiting - be nice to the API
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`\n📊 Results:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📁 Images saved to: ${publicDir}\n`);
}

main().catch(console.error);
