import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.cannaus.com.au'
  
  // Get all published articles
  const articles = await prisma.article.findMany({
    where: { published: true, type: 'post' },
    select: { slug: true, category: true, updatedAt: true }
  })
  
  // Get all companies
  const companies = await prisma.article.findMany({
    where: { published: true, type: 'company' },
    select: { slug: true, updatedAt: true }
  })
  
  const articleUrls = articles.map(article => ({
    url: `${baseUrl}/${article.category}/${article.slug}/`,
    lastModified: article.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))
  
  const companyUrls = companies.map(company => ({
    url: `${baseUrl}/companies/${company.slug}/`,
    lastModified: company.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))
  
  const staticUrls = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/companies/`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    // Add category pages
    ...['nsw', 'vic', 'qld', 'wa', 'sa', 'tas', 'act', 'nt', 'national', 'international'].map(category => ({
      url: `${baseUrl}/${category}/`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))
  ]
  
  return [...staticUrls, ...articleUrls, ...companyUrls]
}