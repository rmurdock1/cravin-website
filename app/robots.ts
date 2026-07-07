import type { MetadataRoute } from 'next';
import { brand } from '@/lib/site-data';

// AI answer-engine crawlers we explicitly welcome, so Cravin can be cited in
// ChatGPT, Claude, Perplexity, Google AI Overviews, Apple Intelligence, etc.
const aiCrawlers = [
  'GPTBot', // OpenAI (training + ChatGPT browsing)
  'OAI-SearchBot', // OpenAI SearchGPT
  'ChatGPT-User', // ChatGPT on-demand fetch
  'ClaudeBot', // Anthropic (training)
  'Claude-Web', // Anthropic on-demand fetch
  'anthropic-ai', // Anthropic (legacy)
  'PerplexityBot', // Perplexity
  'Perplexity-User', // Perplexity on-demand fetch
  'Google-Extended', // Google Gemini / AI Overviews grounding
  'Applebot-Extended', // Apple Intelligence
  'Amazonbot', // Amazon / Alexa
  'CCBot', // Common Crawl (feeds many LLMs)
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/success'],
      },
      // Explicitly allow AI crawlers full access (documents intent; default
      // would already allow them, but this makes inclusion deliberate).
      {
        userAgent: aiCrawlers,
        allow: '/',
        disallow: ['/success'],
      },
    ],
    sitemap: `${brand.domain}/sitemap.xml`,
    host: brand.domain,
  };
}
