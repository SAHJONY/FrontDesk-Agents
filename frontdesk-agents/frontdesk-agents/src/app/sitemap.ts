import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.frontdeskagents.com'

  const routes = [
    { path: '', priority: 1.0, changeFreq: 'weekly' as const },
    { path: '/services', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/demo', priority: 0.8, changeFreq: 'monthly' as const },
    { path: '/pricing', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/contact', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/privacy-policy', priority: 0.3, changeFreq: 'yearly' as const },
    { path: '/terms-of-service', priority: 0.3, changeFreq: 'yearly' as const },
  ]

  return routes.map(route => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }))
}
