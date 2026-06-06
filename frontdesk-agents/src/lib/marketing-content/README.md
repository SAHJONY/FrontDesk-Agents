# FrontDesk Agents — Marketing Content Pipeline

Generates branded social media images automatically using [muapi-cli](https://muapi.ai) (200+ AI models: Flux, Midjourney, Kling, Veo, etc.).

## Setup

### 1. Install muapi-cli

```bash
# via npm (recommended)
npm install -g muapi-cli

# or via pip
pip install muapi-cli
```

### 2. Configure API key

```bash
muapi auth configure
# Enter your key from https://muapi.ai/dashboard
```

Or pass the key directly:

```bash
export MUAPI_API_KEY=your_key_here
```

### 3. Install brand assets (optional)

Place your logo and product screenshots in `./assets/brand/` (or set `CONTENT_ASSETS_DIR`):

```
assets/brand/
  logo-light.png    # Logo on light background
  logo-dark.png     # Logo on dark background
  product-dashboard.png  # Dashboard screenshot
```

## Usage

### List all templates

```bash
npx ts-node --esm src/lib/marketing-content/generator.ts list-templates
```

### Generate images

```bash
# Single template → LinkedIn
npx ts-node --esm src/lib/marketing-content/generator.ts generate -t product-ai-receptionist -p linkedin

# All feature templates → all platforms
npx ts-node --esm src/lib/marketing-content/generator.ts generate -c feature --platform all

# One template → all its platforms
npx ts-node --esm src/lib/marketing-content/generator.ts generate -t stat-missed-calls

# All industry templates → Twitter + LinkedIn
npx ts-node --esm src/lib/marketing-content/generator.ts generate -c industry -p linkedin -p twitter

# Override the model
npx ts-node --esm src/lib/marketing-content/generator.ts generate -c feature --model hidream-fast
```

### Preview a caption (no generation)

```bash
npx ts-node --esm src/lib/marketing-content/generator.ts caption stat-missed-calls linkedin
```

## Output

Generated images go to `./content-output/` by default:

```
content-output/
  product-ai-receptionist-linkedin-1700000000000.png
  stat-missed-calls-twitter-1700000001000.png
  ...
```

Each successful run prints:
- Output file path
- Generation prompt used
- Social caption (ready to copy-paste)

## Available Templates

| Template ID | Category | Description | Platforms |
|------------|----------|-------------|-----------|
| `product-ai-receptionist` | Product | AI receptionist answering a call | LinkedIn, Twitter, Instagram |
| `feature-multilingual` | Feature | 200+ languages announcement | LinkedIn, YouTube, Blog |
| `feature-analytics` | Feature | Owner analytics dashboard | LinkedIn, Twitter |
| `industry-healthcare` | Industry | HIPAA patient intake | LinkedIn, Facebook |
| `industry-legal` | Industry | Legal intake & case status | LinkedIn, Twitter |
| `industry-realestate` | Industry | Property inquiry handling | LinkedIn |
| `industry-dental` | Industry | Dental appointment booking | Facebook |
| `stat-missed-calls` | Stat | Cost of missed calls | LinkedIn, Twitter |
| `stat-revenue` | Stat | Revenue recovery | LinkedIn |
| `comparison-vs-receptionist` | Comparison | AI vs human receptionist | LinkedIn |
| `testimonial-generic` | Testimonial | Social proof graphic | LinkedIn, Twitter |
| `howto-ai-intake` | How-to | AI intake guide | Blog |

## Adding New Templates

Edit `src/lib/marketing-content/content-templates.ts`. Each template has:

```typescript
const MY_TEMPLATE: ContentTemplate = {
  id: 'my-template-id',
  name: 'My Template',
  description: 'What it shows',
  category: 'product', // or: feature|stat|industry|comparison|testimonial|howto
  contexts: [
    {
      platform: 'linkedin',  // or: twitter|instagram|facebook|youtube|blog
      headline: 'Main headline text',
      subheadline: 'Supporting text below',
      ctaText: 'Button text',
      includeLogo: true,
    },
  ],
}
```

## Architecture

```
generator.ts          # CLI entry, batch orchestration, polling
brand-config.ts       # Brand colors, fonts, platform specs, prompt builder
content-templates.ts  # All template definitions (12 templates, 40+ contexts)
```

The pipeline:
1. Resolves templates by ID or category
2. Builds a brand-aware image prompt for each (platform dims, colors, copy)
3. Calls `muapi image generate` with the model best suited for that content type
4. Polls for async results, downloads outputs
5. Prints a social-ready caption alongside the image path