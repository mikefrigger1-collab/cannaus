// scripts/migrate-comments-csv.js - Updated with less aggressive spam filtering
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import Papa from 'papaparse'

const prisma = new PrismaClient()

// More targeted spam filters
const spamFilters = {
  spamEmailDomains: [
    'meta.ua', // Clearly fake domain from your data
  ],
  
  spamPatterns: [
    /looking to buy weed/i,
    /anyone looking to buy/i,
    /dealer.*charged.*30.*gram/i, // Specific drug dealing pattern
    /weed postman/i,
    /buy weed adelaide/i,
    /young?\s*n[i1]gga/i, // Offensive language
  ],
  
  spamAuthors: [
    /weedpostman/i,
    /daddywoolworths/i,
  ]
}

function isSpamComment(comment) {
  // Only flag obvious spam/inappropriate content
  
  // Check email domain (very specific)
  if (comment.comment_author_email && spamFilters.spamEmailDomains.some(domain => 
    comment.comment_author_email.toLowerCase().includes(domain))) {
    return true
  }
  
  // Check for explicit drug dealing/buying
  if (comment.comment_content && spamFilters.spamPatterns.some(pattern => 
    pattern.test(comment.comment_content))) {
    return true
  }
  
  // Check author name for obvious spam accounts
  if (comment.comment_author && spamFilters.spamAuthors.some(pattern => 
    pattern.test(comment.comment_author))) {
    return true
  }
  
  // Very short, meaningless comments
  if (comment.comment_content && comment.comment_content.trim().length < 3) {
    return true
  }
  
  return false
}

function cleanCommentContent(content) {
  if (!content) return ''
  
  return content
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/<[^>]*>/g, '') // Remove any HTML tags
    .trim()
}

// Create a cache of articles for faster lookup
let articlesCache = null

async function loadArticlesCache() {
  if (!articlesCache) {
    const articles = await prisma.article.findMany({
      where: { type: 'post', published: true },
      select: { id: true, slug: true, title: true }
    })
    
    articlesCache = new Map()
    articles.forEach(article => {
      // Store by slug
      articlesCache.set(article.slug, article)
      
      // Also store by normalized slug
      const normalizedSlug = normalizeSlug(article.slug)
      if (normalizedSlug !== article.slug) {
        articlesCache.set(normalizedSlug, article)
      }
    })
  }
  return articlesCache
}

function normalizeSlug(slug) {
  if (!slug) return ''
  
  return slug
    .replace(/&#8217;/g, '') 
    .replace(/&#8220;/g, '') 
    .replace(/&#8221;/g, '') 
    .replace(/&#038;/g, '') // Remove without replacement for 038
    .replace(/8217/g, '')
    .replace(/8220/g, '')
    .replace(/8221/g, '')
    .replace(/038/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

async function findArticleBySlug(wpSlug, wpTitle) {
  const cache = await loadArticlesCache()
  
  if (!wpSlug) return null
  
  // Try exact match first
  if (cache.has(wpSlug)) {
    return cache.get(wpSlug)
  }
  
  // Try normalized slug
  const normalized = normalizeSlug(wpSlug)
  if (cache.has(normalized)) {
    return cache.get(normalized)
  }
  
  // Try with wordpress encoding patterns
  const variants = [
    wpSlug.replace(/8217/g, ''),
    wpSlug.replace(/038/g, ''),
    wpSlug.replace(/8220/g, '').replace(/8221/g, ''),
    wpSlug.replace(/&#8217;/g, '').replace(/&#8220;/g, '').replace(/&#8221;/g, '').replace(/&#038;/g, ''),
  ]
  
  for (const variant of variants) {
    const cleanVariant = variant.replace(/--+/g, '-').replace(/^-|-$/g, '')
    if (cache.has(cleanVariant)) {
      console.log(`Matched variant: ${wpSlug} -> ${cleanVariant}`)
      return cache.get(cleanVariant)
    }
  }
  
  return null
}

async function migrateCommentsFromCSV() {
  try {
    // Load articles cache
    await loadArticlesCache()
    console.log(`Loaded ${articlesCache.size} articles into cache`)
    
    const csvContent = fs.readFileSync('comments-export.csv', 'utf8')
    const { data: comments } = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    })

    console.log(`Found ${comments.length} total comments`)
    
    let importedCount = 0
    let skippedSpam = 0
    let skippedNoArticle = 0

    for (const comment of comments) {
      // Skip spam comments (now less aggressive)
      if (isSpamComment(comment)) {
        console.log(`Skipping spam: ${comment.comment_author}: ${comment.comment_content?.substring(0, 50)}...`)
        skippedSpam++
        continue
      }

      // Skip unapproved comments
      if (comment.comment_approved !== '1' && comment.comment_approved !== 1) {
        skippedSpam++
        continue
      }

      // Find article with improved matching
      const article = await findArticleBySlug(
        comment.comment_post_name, 
        comment.comment_post_title
      )

      if (!article) {
        console.log(`No match: ${comment.comment_post_name}`)
        skippedNoArticle++
        continue
      }

      // Clean and validate comment content
      const cleanContent = cleanCommentContent(comment.comment_content)
      if (!cleanContent || cleanContent.length < 3 || cleanContent.length > 5000) {
        skippedSpam++
        continue
      }

      try {
        await prisma.comment.create({
          data: {
            content: cleanContent,
            author: comment.comment_author?.trim() || 'Anonymous',
            approved: true,
            articleId: article.id,
            wpCommentId: parseInt(comment.comment_ID),
            wpParentId: comment.comment_parent ? parseInt(comment.comment_parent) : null,
            createdAt: new Date(comment.comment_date)
          }
        })

        importedCount++
        console.log(`✓ Imported: ${comment.comment_author} -> ${article.title}`)

      } catch (error) {
        console.error(`Error importing comment ${comment.comment_ID}:`, error.message)
        skippedSpam++
      }
    }

    console.log(`\nMigration Summary:`)
    console.log(`- Total comments processed: ${comments.length}`)
    console.log(`- Successfully imported: ${importedCount}`)
    console.log(`- Skipped as spam/inappropriate: ${skippedSpam}`)
    console.log(`- Skipped (no matching article): ${skippedNoArticle}`)

    // Link parent-child relationships
    if (importedCount > 0) {
      await linkCommentReplies()
    }

  } catch (error) {
    console.error('Migration error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function linkCommentReplies() {
  try {
    const comments = await prisma.comment.findMany({
      where: { wpParentId: { not: null } }
    })

    let linkedCount = 0

    for (const comment of comments) {
      const parent = await prisma.comment.findFirst({
        where: { wpCommentId: comment.wpParentId }
      })

      if (parent) {
        await prisma.comment.update({
          where: { id: comment.id },
          data: { parentId: parent.id }
        })
        linkedCount++
      }
    }

    console.log(`Linked ${linkedCount} reply relationships`)
  } catch (error) {
    console.error('Error linking replies:', error)
  }
}

migrateCommentsFromCSV()