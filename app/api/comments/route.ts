// app/api/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Advanced Multi-Layer Spam Detection System
class SpamDetector {
  private static readonly WEIGHTS = {
    CRITICAL: 10,
    HIGH: 5,
    MEDIUM: 3,
    LOW: 1
  };

  private static readonly SPAM_THRESHOLD = 8;

  // Comprehensive spam indicators database
  private static readonly INDICATORS = {
    // Critical spam indicators - instant red flags
    critical: {
      keywords: [
        // Pharmaceutical
        'viagra', 'cialis', 'levitra', 'buy pills', 'prescription drugs', 'no prescription',
        'pharmacy online', 'cheap meds', 'discount pharmacy', 'rx online',
        
        // Financial scams
        'get rich quick', 'make money fast', 'earn $', 'guaranteed income', 'financial freedom',
        'work from home', 'passive income', 'investment opportunity', 'double your money',
        'no risk investment', 'guaranteed profit', 'bitcoin investment', 'crypto mining',
        
        // Illegal activities
        'buy drugs', 'sell drugs', 'drug dealer', 'weed dealer', 'cocaine', 'heroin',
        'fake id', 'fake passport', 'stolen credit', 'hacked account', 'counterfeit',
        
        // Adult/inappropriate
        'escort service', 'adult dating', 'cam girls', 'xxx videos', 'porn site',
        
        // Obvious scams
        'nigerian prince', 'inheritance money', 'lottery winner', 'claim prize',
        'congratulations winner', 'selected recipient', 'tax refund'
      ],
      
      patterns: [
        /\b(?:viagra|cialis)\b.*(?:cheap|buy|order)/i,
        /(?:make|earn).*\$\d+.*(?:fast|quick|easy|guaranteed)/i,
        /(?:buy|sell).*(?:drugs|weed|cocaine|pills).*(?:online|cheap|quality)/i,
        /(?:click|visit).*(?:link|website).*(?:now|today|immediately)/i,
        /\b(?:guaranteed|100%).*(?:profit|income|return)/i
      ]
    },

    // High-risk indicators
    high: {
      keywords: [
        'casino', 'gambling', 'poker online', 'slots', 'jackpot', 'lottery ticket',
        'weight loss', 'lose weight', 'diet pills', 'miracle cure', 'anti aging',
        'credit repair', 'debt relief', 'loan approval', 'bad credit ok',
        'insurance claim', 'accident lawyer', 'compensation claim',
        'mlm', 'pyramid scheme', 'network marketing', 'be your own boss',
        'unlimited earning', 'residual income', 'join our team',
        'replica watches', 'designer replica', 'knockoff', 'bootleg'
      ],
      
      patterns: [
        /(?:win|won).*(?:\$|money|prize|cash)/i,
        /(?:limited|special).*(?:offer|deal|price).*(?:today|now)/i,
        /(?:call|text).*(?:now|today).*\d{3}[-.]?\d{3}[-.]?\d{4}/i,
        /(?:visit|check).*(?:website|link|site)/i
      ]
    },

    // Medium-risk indicators
    medium: {
      keywords: [
        'free trial', 'no cost', 'risk free', 'money back', 'satisfaction guaranteed',
        'as seen on tv', 'celebrity endorsed', 'doctor recommended', 'clinically proven',
        'secret formula', 'breakthrough', 'revolutionary', 'amazing results',
        'limited time', 'act now', 'dont wait', 'hurry up', 'expires soon',
        'check this out', 'you wont believe', 'shocking truth', 'they dont want you'
      ],
      
      patterns: [
        /\b(?:free|no cost).*(?:shipping|trial|consultation)/i,
        /(?:order|buy|purchase).*(?:now|today)/i,
        /(?:lowest|best|cheapest).*price/i
      ]
    },

    // Low-risk indicators - might be legitimate but suspicious
    low: {
      keywords: [
        'special offer', 'discount', 'sale', 'promotion', 'deal',
        'website', 'link', 'visit', 'check out', 'learn more'
      ]
    }
  };

  // Analyze content structure and patterns
  private static analyzeContent(content: string): number {
    let score = 0;
    
    // Length analysis
    if (content.length < 5) score += this.WEIGHTS.HIGH;
    if (content.length > 10000) score += this.WEIGHTS.MEDIUM;
    
    // Character analysis
    const uppercaseRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (uppercaseRatio > 0.8) score += this.WEIGHTS.HIGH;
    if (uppercaseRatio > 0.5) score += this.WEIGHTS.MEDIUM;
    
    // Special character abuse
    const specialCharRatio = (content.match(/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]/g) || []).length / content.length;
    if (specialCharRatio > 0.3) score += this.WEIGHTS.MEDIUM;
    
    // Repeated characters/patterns
    if (/(.)\1{5,}/g.test(content)) score += this.WEIGHTS.MEDIUM;
    if (/[!]{3,}|[?]{3,}|[.]{4,}/g.test(content)) score += this.WEIGHTS.LOW;
    
    // Number density (excluding normal dates/times)
    const numberRatio = (content.match(/\d/g) || []).length / content.length;
    if (numberRatio > 0.4) score += this.WEIGHTS.MEDIUM;
    
    return score;
  }

  // Analyze URLs in content
  private static analyzeUrls(content: string): number {
    let score = 0;
    const urls = content.match(/https?:\/\/[^\s]+/gi) || [];
    
    // Multiple URLs are suspicious
    if (urls.length > 1) score += this.WEIGHTS.HIGH;
    if (urls.length === 1) score += this.WEIGHTS.LOW;
    
    // Suspicious domains and URL shorteners
    const suspiciousDomains = [
      'bit.ly', 'tinyurl', 't.co', 'goo.gl', 'ow.ly', 'short.link', 'tiny.cc',
      '.tk', '.ml', '.ga', '.cf', // Free suspicious TLDs
      'blogspot', 'wordpress.com', 'wix.com' // Free hosting (when used for spam)
    ];
    
    urls.forEach(url => {
      if (suspiciousDomains.some(domain => url.toLowerCase().includes(domain))) {
        score += this.WEIGHTS.MEDIUM;
      }
    });
    
    return score;
  }

  // Analyze author name patterns
  private static analyzeAuthor(author: string): number {
    let score = 0;
    
    // Length checks
    if (author.length < 2) score += this.WEIGHTS.HIGH;
    if (author.length > 50) score += this.WEIGHTS.MEDIUM;
    
    // Pattern checks
    if (/^[a-z]+\d+$/i.test(author)) score += this.WEIGHTS.MEDIUM; // user123
    if (/^\d+$/.test(author)) score += this.WEIGHTS.HIGH; // Only numbers
    if (/^[^a-zA-Z]*$/.test(author)) score += this.WEIGHTS.HIGH; // No letters
    if ((author.match(/\d/g) || []).length > author.length * 0.5) score += this.WEIGHTS.MEDIUM; // Too many numbers
    
    // Suspicious name patterns
    const suspiciousNames = [
      /^(admin|administrator|moderator|webmaster|root|test|guest)$/i,
      /^(bot|spam|fake|temp|anonymous)$/i,
      /(dealer|seller|buyer|casino|porn|xxx|sex)/i
    ];
    
    if (suspiciousNames.some(pattern => pattern.test(author))) {
      score += this.WEIGHTS.HIGH;
    }
    
    return score;
  }

  // Advanced linguistic analysis
  private static analyzeLinguistics(content: string): number {
    let score = 0;
    const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    
    if (words.length === 0) return this.WEIGHTS.HIGH;
    
    // Word repetition analysis
    const uniqueWords = new Set(words);
    const repetitionRatio = (words.length - uniqueWords.size) / words.length;
    if (repetitionRatio > 0.5) score += this.WEIGHTS.MEDIUM;
    
    // Coherence check - very basic
    const averageWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    if (averageWordLength < 2 || averageWordLength > 15) score += this.WEIGHTS.LOW;
    
    // Check for excessive capitalization in words
    const capsWords = content.split(/\s+/).filter(word => 
      word.length > 2 && word === word.toUpperCase() && /[A-Z]/.test(word)
    );
    if (capsWords.length > words.length * 0.3) score += this.WEIGHTS.MEDIUM;
    
    return score;
  }

  // Main spam detection method
  public static detect(content: string, author: string): { isSpam: boolean; score: number; reasons: string[] } {
    let totalScore = 0;
    const reasons: string[] = [];
    const lowerContent = content.toLowerCase();
    const lowerAuthor = author.toLowerCase();
    
    // Check critical indicators first
    for (const keyword of this.INDICATORS.critical.keywords) {
      if (lowerContent.includes(keyword) || lowerAuthor.includes(keyword)) {
        totalScore += this.WEIGHTS.CRITICAL;
        reasons.push(`Critical spam keyword: "${keyword}"`);
      }
    }
    
    for (const pattern of this.INDICATORS.critical.patterns) {
      if (pattern.test(content) || pattern.test(author)) {
        totalScore += this.WEIGHTS.CRITICAL;
        reasons.push('Critical spam pattern detected');
      }
    }
    
    // Check high-risk indicators
    for (const keyword of this.INDICATORS.high.keywords) {
      if (lowerContent.includes(keyword) || lowerAuthor.includes(keyword)) {
        totalScore += this.WEIGHTS.HIGH;
        reasons.push(`High-risk keyword: "${keyword}"`);
      }
    }
    
    for (const pattern of this.INDICATORS.high.patterns) {
      if (pattern.test(content)) {
        totalScore += this.WEIGHTS.HIGH;
        reasons.push('High-risk pattern detected');
      }
    }
    
    // Check medium-risk indicators
    for (const keyword of this.INDICATORS.medium.keywords) {
      if (lowerContent.includes(keyword)) {
        totalScore += this.WEIGHTS.MEDIUM;
        reasons.push(`Medium-risk keyword: "${keyword}"`);
      }
    }
    
    for (const pattern of this.INDICATORS.medium.patterns) {
      if (pattern.test(content)) {
        totalScore += this.WEIGHTS.MEDIUM;
        reasons.push('Medium-risk pattern detected');
      }
    }
    
    // Check low-risk indicators
    for (const keyword of this.INDICATORS.low.keywords) {
      if (lowerContent.includes(keyword)) {
        totalScore += this.WEIGHTS.LOW;
        reasons.push(`Low-risk keyword: "${keyword}"`);
      }
    }
    
    // Structural analysis
    const contentScore = this.analyzeContent(content);
    if (contentScore > 0) {
      totalScore += contentScore;
      reasons.push(`Content structure issues (score: ${contentScore})`);
    }
    
    const urlScore = this.analyzeUrls(content);
    if (urlScore > 0) {
      totalScore += urlScore;
      reasons.push(`URL analysis issues (score: ${urlScore})`);
    }
    
    const authorScore = this.analyzeAuthor(author);
    if (authorScore > 0) {
      totalScore += authorScore;
      reasons.push(`Author name issues (score: ${authorScore})`);
    }
    
    const linguisticScore = this.analyzeLinguistics(content);
    if (linguisticScore > 0) {
      totalScore += linguisticScore;
      reasons.push(`Linguistic analysis issues (score: ${linguisticScore})`);
    }
    
    const isSpam = totalScore >= this.SPAM_THRESHOLD;
    
    return { isSpam, score: totalScore, reasons };
  }
}

// API Route Handlers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    if (!articleId || isNaN(Number(articleId))) {
      return NextResponse.json({ error: 'Valid article ID is required' }, { status: 400 });
    }

    // Fetch approved comments with nested structure
    const comments = await prisma.comment.findMany({
      where: {
        articleId: Number(articleId),
        parentId: null,
        approved: true,
        spam: false
      },
      include: {
        replies: {
          where: {
            approved: true,
            spam: false
          },
          orderBy: { createdAt: 'asc' },
          include: {
            replies: {
              where: {
                approved: true,
                spam: false
              },
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(comments);
    
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, parentId, author, content } = body;

    // Comprehensive input validation
    if (!articleId || !author || !content) {
      return NextResponse.json({ 
        error: 'Article ID, author name, and comment content are required' 
      }, { status: 400 });
    }

    if (typeof articleId !== 'number' || articleId <= 0) {
      return NextResponse.json({ 
        error: 'Valid article ID is required' 
      }, { status: 400 });
    }

    if (typeof author !== 'string' || author.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Author name cannot be empty' 
      }, { status: 400 });
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Comment content cannot be empty' 
      }, { status: 400 });
    }

    // Additional validation
    if (author.trim().length > 100) {
      return NextResponse.json({ 
        error: 'Author name is too long (max 100 characters)' 
      }, { status: 400 });
    }

    if (content.trim().length > 10000) {
      return NextResponse.json({ 
        error: 'Comment is too long (max 10,000 characters)' 
      }, { status: 400 });
    }

    // Verify article exists
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    });

    if (!article) {
      return NextResponse.json({ 
        error: 'Article not found' 
      }, { status: 404 });
    }

    // Verify parent comment if this is a reply
    if (parentId) {
      if (typeof parentId !== 'number' || parentId <= 0) {
        return NextResponse.json({ 
          error: 'Invalid parent comment ID' 
        }, { status: 400 });
      }

      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId }
      });

      if (!parentComment) {
        return NextResponse.json({ 
          error: 'Parent comment not found' 
        }, { status: 404 });
      }

      if (parentComment.articleId !== articleId) {
        return NextResponse.json({ 
          error: 'Parent comment belongs to a different article' 
        }, { status: 400 });
      }
    }

    // Advanced spam detection
    const spamAnalysis = SpamDetector.detect(content.trim(), author.trim());
    
    // Log spam detection for monitoring (remove in production or use proper logging)
    if (spamAnalysis.isSpam) {
      console.log('🚨 SPAM DETECTED:', {
        author: author.trim(),
        content: content.trim().substring(0, 100),
        score: spamAnalysis.score,
        reasons: spamAnalysis.reasons
      });
    }

    // Create comment with spam analysis results
    const comment = await prisma.comment.create({
      data: {
        articleId,
        parentId: parentId || null,
        author: author.trim(),
        content: content.trim(),
        approved: !spamAnalysis.isSpam, // Auto-approve legitimate comments
        spam: spamAnalysis.isSpam,
        // Store spam analysis metadata (optional - requires schema update)
        // spamScore: spamAnalysis.score,
        // spamReasons: JSON.stringify(spamAnalysis.reasons)
      }
    });

    // Return appropriate response
    if (spamAnalysis.isSpam) {
      return NextResponse.json({
        message: 'Comment submitted but flagged for moderation due to spam detection.',
        status: 'pending_moderation',
        comment: {
          id: comment.id,
          approved: false,
          spam: true
        }
      }, { status: 201 });
    } else {
      return NextResponse.json({
        message: 'Comment submitted and approved successfully!',
        status: 'approved',
        comment: {
          id: comment.id,
          approved: true,
          spam: false
        }
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ 
      error: 'Failed to submit comment. Please try again.' 
    }, { status: 500 });
  }
}