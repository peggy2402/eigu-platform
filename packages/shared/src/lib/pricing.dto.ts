export interface PricingTierFeatureDto {
  id?: string;
  text: string;
  sortOrder?: number;
}

export interface PricingBadgeDto {
  id: string;
  code: string;
  name: string;
  colorConfig?: string;
  isActive?: boolean;
}

export interface PricingTierDto {
  id: string;
  code: string; // "trial", "basic", "pro", "team", "enterprise"
  label: string;
  tagline: string;
  price: number;
  originalPrice: number;
  discount: number;
  formattedPrice: string;
  formattedOriginalPrice?: string | null;
  billingPeriod: string; // "trial", "monthly", "yearly"
  trialDays: number;
  machines: number;
  threads: number;
  resolution: string;
  badge?: string | null;
  badgeId?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  features: string[];
}

export interface PricingModuleDto {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  isActive?: boolean;
  sortOrder?: number;
  tiers: PricingTierDto[];
}

export interface PricingResponseDto {
  success: boolean;
  data: PricingModuleDto[];
}
