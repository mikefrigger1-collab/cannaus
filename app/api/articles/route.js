import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const excludeIds = searchParams.get('excludeIds')?.split(',').filter(Boolean).map(id => parseInt(id)) || []
    const category = searchParams.get('category')
    
    // Build the where clause
    let whereClause = {
      published: true,
      type: 'post'
    }
    
    // Add category filter if provided
    if (category) {
      whereClause.category = category
    }
    
    // Add exclude IDs if provided
    if (excludeIds.length > 0) {
      whereClause.NOT = { id: { in: excludeIds } }
    }
    
    const articles = await prisma.article.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * 10,
      take: 10,
      select: {
        id: true,
        title: true,
        content: true,
        slug: true,
        category: true,
        createdAt: true,
        featuredImage: true,
        featuredImageUrl: true,
        featuredImageAlt: true
      }
    })

    return NextResponse.json(articles)
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}