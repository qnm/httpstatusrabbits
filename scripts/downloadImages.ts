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

async function searchUnsplashRabbit(statusCode: number, message: string): Promise<string | null> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.log('⚠️  No UNSPLASH_ACCESS_KEY found. Skipping image downloads.');
    console.log('   Set UNSPLASH_ACCESS_KEY environment variable to download images.');
    return null;
  }

  try {
    // Create search query based on status code
    const searchQuery = `rabbit ${message.toLowerCase()}`;
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`;

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
      const photo = data.results[0];
      return photo.urls.regular;
    }

    // Fallback to generic rabbit search
    const fallbackUrl = `https://api.unsplash.com/search/photos?query=rabbit&per_page=1&orientation=landscape`;
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
