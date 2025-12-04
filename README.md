# HTTP Status Rabbits

HTTP status codes explained with adorable rabbits! Inspired by [HTTP Cats](https://http.cat) and [HTTP Status Dogs](https://httpstatusdogs.com).

Visit: **[httpstatusrabbits.com](https://httpstatusrabbits.com)**

## Features

- 📚 Comprehensive coverage of HTTP status codes (100+ codes)
- 🐰 Cute rabbit images for each status code
- 📱 Fully responsive design
- ⚡ Built with Astro for optimal performance
- 🎨 Clean, modern UI with category grouping
- 🏷️ Clear distinction between official and unofficial codes

## Development

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Local Development

```bash
npm run dev
```

Visit `http://localhost:4321` to see the site.

### Build

```bash
npm run build
```

The static site will be built to `./dist/`

### Preview Production Build

```bash
npm run preview
```

## Image Management

The site currently uses placeholder images from Lorem Picsum. To use real rabbit images:

1. Get a free API key from [Unsplash Developers](https://unsplash.com/developers)
2. Set the `UNSPLASH_ACCESS_KEY` environment variable
3. Run the image downloader:

```bash
npm run download-images
```

This will download rabbit images for each HTTP status code and save them to `public/rabbits/`.

## Deployment to Cloudflare Pages

This site is configured for deployment to Cloudflare Pages.

### Via Cloudflare Dashboard

1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Connect your GitHub repository
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version**: 18 or higher
4. Deploy!

### Via Wrangler CLI

First, authenticate with Cloudflare:

```bash
npx wrangler login
```

Then deploy:

```bash
npm run deploy
```

This will build the site and deploy it to Cloudflare Pages with the project name `httpstatusrabbits`.

## Project Structure

```
/
├── public/
│   └── rabbits/          # Rabbit images for each status code
├── scripts/
│   └── downloadImages.ts # Script to fetch rabbit images
├── src/
│   ├── data/
│   │   ├── statusCodes.ts         # HTTP status code definitions
│   │   └── imagePlaceholders.json # Placeholder image mappings
│   └── pages/
│       └── index.astro   # Main page
└── package.json
```

## HTTP Status Codes Included

- **1xx Informational**: 100, 101, 102, 103
- **2xx Success**: 200, 201, 202, 203, 204, 205, 206, 207, 208, 226
- **3xx Redirection**: 300, 301, 302, 303, 304, 305, 306, 307, 308
- **4xx Client Error**: 400-451 (official) + nginx, Cloudflare, and other unofficial codes
- **5xx Server Error**: 500-511 (official) + Cloudflare and other unofficial codes

## Contributing

Contributions are welcome! Feel free to:

- Add better rabbit images
- Improve the design
- Add more HTTP status codes
- Fix bugs or typos

## License

MIT

## Credits

- Inspired by [HTTP Cats](https://http.cat) and [HTTP Status Dogs](https://httpstatusdogs.com)
- Built with [Astro](https://astro.build)
- Deployed on [Cloudflare Pages](https://pages.cloudflare.com)
