import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugComments() {
  try {
    console.log('=== ALL COMMENTS IN DATABASE ===')
    const allComments = await prisma.comment.findMany({
      include: {
        article: {
          select: { id: true, title: true, slug: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`Total comments found: ${allComments.length}`)
    
    allComments.forEach((comment, index) => {
      console.log(`\n--- Comment ${index + 1} ---`)
      console.log(`ID: ${comment.id}`)
      console.log(`Author: ${comment.author}`)
      console.log(`Content: ${comment.content}`)
      console.log(`Approved: ${comment.approved}`)
      console.log(`Spam: ${comment.spam}`)
      console.log(`Article ID: ${comment.articleId}`)
      console.log(`Article Title: ${comment.article?.title || 'Not found'}`)
      console.log(`Created: ${comment.createdAt}`)
      console.log(`Parent ID: ${comment.parentId || 'None (top-level)'}`)
    })

    if (allComments.length === 0) {
      console.log('\n❌ No comments found in database!')
      console.log('This means comments are not being saved. Check the API route.')
    } else {
      console.log('\n=== APPROVED COMMENTS ===')
      const approvedComments = allComments.filter(c => c.approved)
      console.log(`Approved comments: ${approvedComments.length}`)
      
      if (approvedComments.length === 0) {
        console.log('❌ No approved comments! All comments need approval.')
        console.log('You can approve them manually or modify the API to auto-approve.')
      }
    }

    // Check a specific article's comments (replace with an actual article ID)
    console.log('\n=== TESTING SPECIFIC ARTICLE ===')
    const firstArticle = await prisma.article.findFirst({
      where: { published: true, type: 'post' }
    })
    
    if (firstArticle) {
      console.log(`Testing article: ${firstArticle.title} (ID: ${firstArticle.id})`)
      const articleComments = await prisma.comment.findMany({
        where: {
          articleId: firstArticle.id,
          approved: true,
          parentId: null
        },
        include: {
          replies: {
            where: { approved: true },
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      
      console.log(`Comments for this article: ${articleComments.length}`)
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugComments()