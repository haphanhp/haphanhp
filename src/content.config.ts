import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// One project = one Markdown file in src/content/projects.
// Only real data: leave `metric` out when there is no number to show.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z
    .object({
      name: z.string(),
      status: z.enum(['growing', 'playable', 'sleeping']),
      visibility: z.enum(['public', 'private']),
      tagline: z.string(), // ONE sentence: what it does
      metric: z.string().optional(), // e.g. "42 stars" (only if real)
      metricDate: z.string().optional(), // when the metric was measured, e.g. "2026-09-30"
      url: z.string().url().optional(), // live link
      repo: z.string().url().optional(), // hidden automatically when visibility is private
      note: z.string().optional(), // short status note, e.g. "Currently building"
      icon: z.string(),
      order: z.number().default(99),
    })
    .refine((d) => !d.metric || d.metricDate, { message: 'metric needs metricDate' }),
});

export const collections = { projects };
