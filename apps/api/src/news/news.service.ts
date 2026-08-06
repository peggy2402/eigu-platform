import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { QueryNewsDto } from './dto/query-news.dto';
import { CreateCommentDto, CommentReactionDto, CommentReportDto } from './dto/create-comment.dto';
import { CreateCategoryDto, CreateTagDto } from './dto/category-tag.dto';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Helper: Generate URL-safe slug from Vietnamese text
  private slugify(text: string): string {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  // Helper: Generate unique slug
  private async generateUniqueSlug(title: string, currentId?: string): Promise<string> {
    const baseSlug = this.slugify(title) || 'baiviet-' + Date.now();
    let slug = baseSlug;
    let count = 1;

    while (true) {
      const existing = await this.prisma.news.findFirst({
        where: {
          slug,
          ...(currentId ? { NOT: { id: currentId } } : {}),
        },
      });
      if (!existing) break;
      slug = `${baseSlug}-${count++}`;
    }
    return slug;
  }

  // Helper: Calculate reading time in minutes based on word count
  private calculateReadingTime(content: string): number {
    const textOnly = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = textOnly ? textOnly.split(' ').length : 0;
    return Math.max(1, Math.ceil(wordCount / 200));
  }

  // Auto seed initial categories and tags if empty
  async seedDefaultsIfEmpty() {
    const categoryCount = await this.prisma.newsCategory.count();
    if (categoryCount === 0) {
      const defaultCategories = [
        { name: 'Cập Nhật Tính Năng', slug: 'cap-nhat-tinh-nang', description: 'Thông báo các bản nâng cấp, tính năng mới trên EIGU Platform', sortOrder: 1 },
        { name: 'Kỹ Thuật & Bypass MD5', slug: 'ky-thuat-bypass-md5', description: 'Hướng dẫn lách bản quyền, noise injection và thuật toán anti-detect', sortOrder: 2 },
        { name: 'Chiến Lược MMO TikTok', slug: 'chien-luoc-mmo-tiktok', description: 'Bí quyết xây kênh, tăng view TikTok Beta & Reels', sortOrder: 3 },
        { name: 'Thông Báo Hệ Thống', slug: 'thong-bao-he-thong', description: 'Thông tin bảo trì, sự kiện và ưu đãi gói cước', sortOrder: 4 },
      ];
      for (const cat of defaultCategories) {
        await this.prisma.newsCategory.create({ data: cat });
      }
      this.logger.log('Seeded default News Categories');
    }

    const tagCount = await this.prisma.newsTag.count();
    if (tagCount === 0) {
      const defaultTags = ['TikTok Beta', 'YouTube Shorts', 'Reels', 'Bypass MD5', 'FFmpeg', 'AI Video', 'MMO 2026'];
      for (const tag of defaultTags) {
        await this.prisma.newsTag.create({ data: { name: tag, slug: this.slugify(tag) } });
      }
      this.logger.log('Seeded default News Tags');
    }
  }

  // ================= ADMIN / STAFF CRUD API =================

  async findAll(query: QueryNewsDto) {
    await this.seedDefaultsIfEmpty();
    const { page = 1, limit = 10, search, categoryId, tagId, status, isFeatured, authorId, sortBy = 'newest', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (tagId) {
      where.tags = {
        some: { tagId },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: sortOrder };
    if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    if (sortBy === 'views') orderBy = { viewCount: sortOrder };
    if (sortBy === 'likes') orderBy = { likeCount: sortOrder };
    if (sortBy === 'comments') orderBy = { commentCount: sortOrder };

    const [items, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          tags: {
            include: { tag: true },
          },
          author: {
            select: { id: true, email: true, username: true, role: true },
          },
        },
      }),
      this.prisma.news.count({ where }),
    ]);

    const formattedItems = items.map(item => ({
      ...item,
      tags: item.tags.map(t => t.tag),
    }));

    return {
      items: formattedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.news.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        tags: {
          include: { tag: true },
        },
        author: {
          select: { id: true, email: true, username: true, role: true },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Bài viết không tồn tại hoặc đã bị xóa');
    }

    return {
      ...item,
      tags: item.tags.map(t => t.tag),
    };
  }

  async create(dto: CreateNewsDto, user: any) {
    await this.seedDefaultsIfEmpty();
    const slug = dto.slug ? this.slugify(dto.slug) : await this.generateUniqueSlug(dto.title);
    const readingTime = this.calculateReadingTime(dto.content);

    let categoryId = (dto.categoryId && dto.categoryId.trim()) ? dto.categoryId.trim() : null;
    if (!categoryId) {
      const defaultCat = await this.prisma.newsCategory.findFirst({ orderBy: { sortOrder: 'asc' } });
      if (defaultCat) categoryId = defaultCat.id;
    }

    const news = await this.prisma.news.create({
      data: {
        title: dto.title,
        slug,
        summary: dto.summary,
        content: dto.content,
        thumbnail: dto.thumbnail,
        gallery: dto.gallery || [],
        categoryId,
        status: dto.status || 'draft',
        isFeatured: dto.isFeatured ?? false,
        authorId: user.id,
        authorName: user.username || user.email.split('@')[0],
        publishedAt: dto.status === 'published' ? new Date() : null,
        readingTime,
        seoTitle: dto.seoTitle || dto.title,
        seoDescription: dto.seoDescription || dto.summary,
        seoKeywords: dto.seoKeywords,
      },
    });

    // Process tags
    if (dto.tags && dto.tags.length > 0) {
      for (const tagNameOrId of dto.tags) {
        let tag = await this.prisma.newsTag.findFirst({
          where: { OR: [{ id: tagNameOrId }, { name: tagNameOrId }] },
        });

        if (!tag && tagNameOrId.trim()) {
          const tagSlug = this.slugify(tagNameOrId);
          tag = await this.prisma.newsTag.create({
            data: { name: tagNameOrId.trim(), slug: tagSlug },
          });
        }

        if (tag) {
          await this.prisma.newsTagRelation.create({
            data: {
              newsId: news.id,
              tagId: tag.id,
            },
          });
        }
      }
    }

    return this.findOne(news.id);
  }

  async update(id: string, dto: UpdateNewsDto, user: any) {
    const news = await this.prisma.news.findFirst({ where: { id, deletedAt: null } });
    if (!news) {
      throw new NotFoundException('Bài viết không tồn tại');
    }

    // Role check: Staff can edit any post or own post
    let slug = news.slug;
    if (dto.title && dto.title !== news.title) {
      slug = await this.generateUniqueSlug(dto.title, news.id);
    } else if (dto.slug && dto.slug !== news.slug) {
      slug = await this.generateUniqueSlug(dto.slug, news.id);
    }

    const readingTime = dto.content ? this.calculateReadingTime(dto.content) : news.readingTime;

    const data: any = {
      ...(dto.title && { title: dto.title }),
      slug,
      ...(dto.summary !== undefined && { summary: dto.summary }),
      ...(dto.content && { content: dto.content, readingTime }),
      ...(dto.thumbnail !== undefined && { thumbnail: dto.thumbnail }),
      ...(dto.gallery && { gallery: dto.gallery }),
      ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
      ...(dto.status && {
        status: dto.status,
        publishedAt: dto.status === 'published' && !news.publishedAt ? new Date() : news.publishedAt,
      }),
      ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
      ...(dto.seoTitle !== undefined && { seoTitle: dto.seoTitle }),
      ...(dto.seoDescription !== undefined && { seoDescription: dto.seoDescription }),
      ...(dto.seoKeywords !== undefined && { seoKeywords: dto.seoKeywords }),
    };

    await this.prisma.news.update({
      where: { id },
      data,
    });

    // Update tags if provided
    if (dto.tags) {
      await this.prisma.newsTagRelation.deleteMany({ where: { newsId: id } });
      for (const tagNameOrId of dto.tags) {
        let tag = await this.prisma.newsTag.findFirst({
          where: { OR: [{ id: tagNameOrId }, { name: tagNameOrId }] },
        });

        if (!tag && tagNameOrId.trim()) {
          const tagSlug = this.slugify(tagNameOrId);
          tag = await this.prisma.newsTag.create({
            data: { name: tagNameOrId.trim(), slug: tagSlug },
          });
        }

        if (tag) {
          await this.prisma.newsTagRelation.create({
            data: { newsId: id, tagId: tag.id },
          });
        }
      }
    }

    return this.findOne(id);
  }

  async softDelete(id: string, user: any) {
    if (user.role?.toLowerCase() !== 'admin') {
      throw new ForbiddenException('Chỉ tài khoản Admin mới có quyền xóa bài viết');
    }

    const news = await this.prisma.news.findFirst({ where: { id, deletedAt: null } });
    if (!news) {
      throw new NotFoundException('Bài viết không tồn tại');
    }

    await this.prisma.news.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Đã xóa bài viết thành công (Soft Delete)' };
  }

  async publish(id: string) {
    const news = await this.prisma.news.findFirst({ where: { id, deletedAt: null } });
    if (!news) throw new NotFoundException('Bài viết không tồn tại');

    await this.prisma.news.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: news.publishedAt || new Date(),
      },
    });

    return this.findOne(id);
  }

  async archive(id: string, user: any) {
    if (user.role?.toLowerCase() !== 'admin') {
      throw new ForbiddenException('Chỉ Admin mới có quyền lưu trữ (Archive) bài viết');
    }

    const news = await this.prisma.news.findFirst({ where: { id, deletedAt: null } });
    if (!news) throw new NotFoundException('Bài viết không tồn tại');

    await this.prisma.news.update({
      where: { id },
      data: { status: 'archived' },
    });

    return this.findOne(id);
  }

  async duplicate(id: string, user: any) {
    const news = await this.findOne(id);
    const newTitle = `Copy of ${news.title}`;
    const newSlug = await this.generateUniqueSlug(newTitle);

    const dup = await this.prisma.news.create({
      data: {
        title: newTitle,
        slug: newSlug,
        summary: news.summary,
        content: news.content,
        thumbnail: news.thumbnail,
        gallery: news.gallery,
        categoryId: news.categoryId,
        status: 'draft',
        isFeatured: false,
        authorId: user.id,
        authorName: user.username || user.email.split('@')[0],
        readingTime: news.readingTime,
        seoTitle: news.seoTitle,
        seoDescription: news.seoDescription,
        seoKeywords: news.seoKeywords,
      },
    });

    // Copy tags
    if (news.tags && news.tags.length > 0) {
      for (const t of news.tags) {
        await this.prisma.newsTagRelation.create({
          data: { newsId: dup.id, tagId: t.id },
        });
      }
    }

    return this.findOne(dup.id);
  }

  async getStatistics() {
    const [total, published, draft, archived, aggregateViews, aggregateComments] = await Promise.all([
      this.prisma.news.count({ where: { deletedAt: null } }),
      this.prisma.news.count({ where: { status: 'published', deletedAt: null } }),
      this.prisma.news.count({ where: { status: 'draft', deletedAt: null } }),
      this.prisma.news.count({ where: { status: 'archived', deletedAt: null } }),
      this.prisma.news.aggregate({ _sum: { viewCount: true }, where: { deletedAt: null } }),
      this.prisma.newsComment.count({ where: { deletedAt: null } }),
    ]);

    return {
      total,
      published,
      draft,
      archived,
      totalViews: aggregateViews._sum.viewCount || 0,
      totalComments: aggregateComments,
    };
  }

  // ================= CATEGORY & TAG MANAGEMENT =================

  async getCategories() {
    await this.seedDefaultsIfEmpty();
    return this.prisma.newsCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { news: true } } },
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    const slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name);
    return this.prisma.newsCategory.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        sortOrder: dto.sortOrder || 0,
      },
    });
  }

  async getTags() {
    await this.seedDefaultsIfEmpty();
    return this.prisma.newsTag.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { news: true } } },
    });
  }

  async createTag(dto: CreateTagDto) {
    const slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name);
    return this.prisma.newsTag.create({
      data: {
        name: dto.name,
        slug,
      },
    });
  }

  // ================= PUBLIC REST API (FOR WEBSITE) =================

  async findPublicList(query: QueryNewsDto) {
    await this.seedDefaultsIfEmpty();
    const { page = 1, limit = 12, search, categoryId, tagId, isFeatured, sortBy = 'newest' } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'published',
      deletedAt: null,
    };

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (tagId) {
      where.tags = {
        some: { tagId },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { publishedAt: 'desc' };
    if (sortBy === 'oldest') orderBy = { publishedAt: 'asc' };
    if (sortBy === 'views') orderBy = { viewCount: 'desc' };
    if (sortBy === 'likes') orderBy = { likeCount: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          tags: {
            include: { tag: true },
          },
        },
      }),
      this.prisma.news.count({ where }),
    ]);

    const formattedItems = items.map(item => ({
      ...item,
      tags: item.tags.map(t => t.tag),
    }));

    return {
      items: formattedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPublicOneBySlug(slug: string) {
    const item = await this.prisma.news.findFirst({
      where: { slug, status: 'published', deletedAt: null },
      include: {
        category: true,
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    // Increment viewCount asynchronously
    await this.prisma.news.update({
      where: { id: item.id },
      data: { viewCount: { increment: 1 } },
    });

    return {
      ...item,
      viewCount: item.viewCount + 1,
      tags: item.tags.map(t => t.tag),
    };
  }

  async getLatestPublic(limit = 5) {
    const items = await this.prisma.news.findMany({
      where: { status: 'published', deletedAt: null },
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: { category: true },
    });
    return items;
  }

  async getRelatedPublic(slug: string, categoryId?: string, limit = 4) {
    const current = await this.prisma.news.findFirst({ where: { slug } });
    const targetCatId = categoryId || current?.categoryId;

    const items = await this.prisma.news.findMany({
      where: {
        status: 'published',
        deletedAt: null,
        ...(current ? { NOT: { id: current.id } } : {}),
        ...(targetCatId ? { categoryId: targetCatId } : {}),
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: { category: true },
    });

    return items;
  }

  // ================= THREADED COMMENT SYSTEM API =================

  async getComments(newsId: string, userId?: string) {
    const rawComments = await this.prisma.newsComment.findMany({
      where: { newsId, deletedAt: null, status: 'approved' },
      orderBy: { createdAt: 'asc' },
      include: {
        reactions: true,
      },
    });

    // Build comment tree recursively
    const commentMap = new Map<string, any>();
    const rootComments: any[] = [];

    for (const c of rawComments) {
      let userLiked = false;
      let userDisliked = false;
      if (userId) {
        const userReaction = c.reactions.find(r => r.userId === userId);
        if (userReaction) {
          if (userReaction.type === 'like') userLiked = true;
          if (userReaction.type === 'dislike') userDisliked = true;
        }
      }

      const formatted = {
        id: c.id,
        newsId: c.newsId,
        parentId: c.parentId,
        userId: c.userId,
        userName: c.userName,
        userAvatar: c.userAvatar,
        userRole: c.userRole || 'user',
        content: c.content,
        likeCount: c.likeCount,
        dislikeCount: c.dislikeCount,
        status: c.status,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        userLiked,
        userDisliked,
        replies: [],
      };

      commentMap.set(c.id, formatted);
    }

    for (const c of commentMap.values()) {
      if (c.parentId && commentMap.has(c.parentId)) {
        commentMap.get(c.parentId).replies.push(c);
      } else {
        rootComments.push(c);
      }
    }

    return rootComments;
  }

  async createComment(newsId: string, dto: CreateCommentDto, user?: any) {
    const news = await this.prisma.news.findFirst({ where: { id: newsId, deletedAt: null } });
    if (!news) throw new NotFoundException('Bài viết không tồn tại');

    const comment = await this.prisma.newsComment.create({
      data: {
        newsId,
        parentId: dto.parentId || null,
        userId: user ? user.id : null,
        userName: user ? (user.username || user.email.split('@')[0]) : (dto.userName || 'Ẩn danh'),
        userAvatar: dto.userAvatar || (user ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || user.email)}&background=6366f1&color=fff` : null),
        userRole: user ? user.role : 'user',
        content: dto.content,
        status: 'approved',
      },
    });

    // Increment news commentCount
    await this.prisma.news.update({
      where: { id: newsId },
      data: { commentCount: { increment: 1 } },
    });

    return comment;
  }

  async reactionComment(commentId: string, dto: CommentReactionDto, userId: string) {
    const comment = await this.prisma.newsComment.findFirst({ where: { id: commentId, deletedAt: null } });
    if (!comment) throw new NotFoundException('Bình luận không tồn tại');

    const existingReaction = await this.prisma.newsCommentReaction.findUnique({
      where: {
        commentId_userId: { commentId, userId },
      },
    });

    if (existingReaction) {
      if (existingReaction.type === dto.type) {
        // Toggle off reaction
        await this.prisma.newsCommentReaction.delete({ where: { id: existingReaction.id } });
        if (dto.type === 'like') {
          await this.prisma.newsComment.update({ where: { id: commentId }, data: { likeCount: { decrement: 1 } } });
        } else {
          await this.prisma.newsComment.update({ where: { id: commentId }, data: { dislikeCount: { decrement: 1 } } });
        }
      } else {
        // Switch reaction type
        await this.prisma.newsCommentReaction.update({
          where: { id: existingReaction.id },
          data: { type: dto.type },
        });
        if (dto.type === 'like') {
          await this.prisma.newsComment.update({
            where: { id: commentId },
            data: { likeCount: { increment: 1 }, dislikeCount: { decrement: 1 } },
          });
        } else {
          await this.prisma.newsComment.update({
            where: { id: commentId },
            data: { likeCount: { decrement: 1 }, dislikeCount: { increment: 1 } },
          });
        }
      }
    } else {
      // Add new reaction
      await this.prisma.newsCommentReaction.create({
        data: { commentId, userId, type: dto.type },
      });
      if (dto.type === 'like') {
        await this.prisma.newsComment.update({ where: { id: commentId }, data: { likeCount: { increment: 1 } } });
      } else {
        await this.prisma.newsComment.update({ where: { id: commentId }, data: { dislikeCount: { increment: 1 } } });
      }
    }

    return this.prisma.newsComment.findUnique({ where: { id: commentId } });
  }

  async reportComment(commentId: string, dto: CommentReportDto, userId?: string) {
    const comment = await this.prisma.newsComment.findFirst({ where: { id: commentId, deletedAt: null } });
    if (!comment) throw new NotFoundException('Bình luận không tồn tại');

    await this.prisma.newsCommentReport.create({
      data: { commentId, userId, reason: dto.reason },
    });

    return { message: 'Đã báo cáo bình luận thành công' };
  }

  async updateComment(commentId: string, content: string, user: any) {
    const comment = await this.prisma.newsComment.findFirst({ where: { id: commentId, deletedAt: null } });
    if (!comment) throw new NotFoundException('Bình luận không tồn tại');

    if (comment.userId !== user.id && !['admin', 'staff'].includes(user.role?.toLowerCase())) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa bình luận này');
    }

    return this.prisma.newsComment.update({
      where: { id: commentId },
      data: { content },
    });
  }

  async deleteComment(commentId: string, user: any) {
    const comment = await this.prisma.newsComment.findFirst({ where: { id: commentId, deletedAt: null } });
    if (!comment) throw new NotFoundException('Bình luận không tồn tại');

    if (comment.userId !== user.id && !['admin', 'staff'].includes(user.role?.toLowerCase())) {
      throw new ForbiddenException('Bạn không có quyền xóa bình luận này');
    }

    await this.prisma.newsComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    // Decrement news commentCount
    await this.prisma.news.update({
      where: { id: comment.newsId },
      data: { commentCount: { decrement: 1 } },
    });

    return { message: 'Đã xóa bình luận thành công' };
  }
}
