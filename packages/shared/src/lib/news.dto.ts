export type NewsStatus = 'draft' | 'published' | 'archived';

export interface NewsCategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: {
    news?: number;
  };
}

export interface NewsTagDto {
  id: string;
  name: string;
  slug: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: {
    news?: number;
  };
}

export interface NewsCommentDto {
  id: string;
  newsId: string;
  parentId?: string | null;
  userId?: string | null;
  userName: string;
  userAvatar?: string | null;
  userRole?: string | null;
  content: string;
  likeCount: number;
  dislikeCount: number;
  status: 'approved' | 'pending' | 'hidden';
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
  userLiked?: boolean;
  userDisliked?: boolean;
  replies?: NewsCommentDto[];
}

export interface NewsDto {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  content: string;
  thumbnail?: string | null;
  gallery: string[];
  categoryId?: string | null;
  category?: NewsCategoryDto | null;
  tags?: NewsTagDto[];
  status: NewsStatus;
  isFeatured: boolean;
  authorId?: string | null;
  authorName?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  publishedAt?: Date | string | null;
  deletedAt?: Date | string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  readingTime: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
}

export interface CreateNewsDto {
  title: string;
  slug?: string;
  summary?: string;
  content: string;
  thumbnail?: string;
  gallery?: string[];
  categoryId?: string;
  tags?: string[]; // Array of tag names or IDs
  status?: NewsStatus;
  isFeatured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface UpdateNewsDto extends Partial<CreateNewsDto> {}

export interface CreateNewsCommentDto {
  content: string;
  parentId?: string;
  userName?: string;
  userAvatar?: string;
}

export interface NewsQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  tagId?: string;
  status?: NewsStatus | string;
  isFeatured?: boolean;
  authorId?: string;
  sortBy?: 'newest' | 'oldest' | 'views' | 'likes' | 'comments';
  sortOrder?: 'asc' | 'desc';
}

export interface NewsStatsDto {
  total: number;
  published: number;
  draft: number;
  archived: number;
  totalViews: number;
  totalComments: number;
}
