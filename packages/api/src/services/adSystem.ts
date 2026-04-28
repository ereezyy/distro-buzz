import logger from "../utils/logger";
import { nanoid } from "nanoid";

/**
 * Ad Placement System for Distro Buzz
 * Manages non-intrusive ad placements across the platform
 */

export interface AdPlacement {
  id: string;
  type: "banner" | "featured_artist" | "sponsored_recommendation";
  position: string;
  title: string;
  description: string;
  imageUrl?: string;
  targetUrl: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  status: "active" | "paused" | "expired" | "pending";
  createdAt: Date;
  updatedAt: Date;
}

export interface AdMetrics {
  placementId: string;
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate
  cpc: number; // Cost per click
  spent: number;
  roi: number;
}

/**
 * Ad placement positions (non-intrusive, premium feel)
 */
export const AD_POSITIONS = {
  // Homepage banner (top, subtle)
  HOMEPAGE_BANNER: "homepage_banner",

  // Featured artist spotlight (sidebar, curated)
  FEATURED_ARTIST_SIDEBAR: "featured_artist_sidebar",

  // Sponsored recommendations (in track library)
  TRACK_LIBRARY_RECOMMENDATION: "track_library_recommendation",

  // Dashboard promo (bottom, non-blocking)
  DASHBOARD_FOOTER_PROMO: "dashboard_footer_promo",

  // Pricing page highlight (subtle accent)
  PRICING_PAGE_HIGHLIGHT: "pricing_page_highlight",
};

/**
 * Ad types with descriptions
 */
export const AD_TYPES = {
  banner: {
    name: "Banner Ad",
    description: "Full-width banner placement",
    maxWidth: "100%",
    height: "120px",
    format: "image + text",
  },
  featured_artist: {
    name: "Featured Artist",
    description: "Artist spotlight in sidebar",
    maxWidth: "300px",
    height: "400px",
    format: "image + bio + link",
  },
  sponsored_recommendation: {
    name: "Sponsored Recommendation",
    description: "Recommended track/artist in library",
    maxWidth: "100%",
    height: "auto",
    format: "track card + badge",
  },
};

/**
 * Create a new ad placement
 */
export async function createAdPlacement(
  data: Omit<AdPlacement, "id" | "createdAt" | "updatedAt" | "spent" | "impressions" | "clicks">
): Promise<AdPlacement> {
  const now = new Date();

  const placement: AdPlacement = {
    id: `ad_${nanoid()}`,
    ...data,
    spent: 0,
    impressions: 0,
    clicks: 0,
    createdAt: now,
    updatedAt: now,
  };

  logger.info("[AdSystem] Ad placement created", {
    id: placement.id,
    type: placement.type,
    budget: placement.budget,
  });

  return placement;
}

/**
 * Record ad impression
 */
export async function recordImpression(placementId: string): Promise<void> {
  logger.debug("[AdSystem] Ad impression recorded", { placementId });
  // In production, update database
}

/**
 * Record ad click
 */
export async function recordClick(placementId: string): Promise<void> {
  logger.debug("[AdSystem] Ad click recorded", { placementId });
  // In production, update database and redirect to target URL
}

/**
 * Calculate ad metrics
 */
export function calculateMetrics(placement: AdPlacement): AdMetrics {
  const ctr = placement.impressions > 0 ? (placement.clicks / placement.impressions) * 100 : 0;
  const cpc = placement.clicks > 0 ? placement.spent / placement.clicks : 0;
  const roi = placement.spent > 0 ? ((placement.clicks * 10 - placement.spent) / placement.spent) * 100 : 0; // Assume $10 per click value

  return {
    placementId: placement.id,
    impressions: placement.impressions,
    clicks: placement.clicks,
    ctr,
    cpc,
    spent: placement.spent,
    roi,
  };
}

/**
 * Get available ad slots
 */
export function getAvailableSlots(): typeof AD_POSITIONS {
  return AD_POSITIONS;
}

/**
 * Validate ad placement data
 */
export function validateAdPlacement(data: any): boolean {
  if (!data.type || !Object.keys(AD_TYPES).includes(data.type)) {
    return false;
  }

  if (!data.position || !Object.values(AD_POSITIONS).includes(data.position)) {
    return false;
  }

  if (!data.title || data.title.length < 5) {
    return false;
  }

  if (!data.budget || data.budget < 10) {
    return false;
  }

  if (!data.targetUrl || !data.targetUrl.startsWith("http")) {
    return false;
  }

  return true;
}

/**
 * Seed initial ad placements for demo
 */
export function seedAdPlacements(): AdPlacement[] {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return [
    {
      id: `ad_${nanoid()}`,
      type: "banner",
      position: AD_POSITIONS.HOMEPAGE_BANNER,
      title: "Distro Buzz Pro - Unlimited Distribution",
      description: "Get unlimited distribution to 50+ platforms",
      targetUrl: "https://distrobuzz.com/pricing",
      startDate: now,
      endDate: nextMonth,
      budget: 500,
      spent: 125,
      impressions: 5000,
      clicks: 150,
      status: "active",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `ad_${nanoid()}`,
      type: "featured_artist",
      position: AD_POSITIONS.FEATURED_ARTIST_SIDEBAR,
      title: "Rising Star: Luna Echo",
      description: "Discover emerging electronic music producer",
      targetUrl: "https://distrobuzz.com/artists/luna-echo",
      startDate: now,
      endDate: nextMonth,
      budget: 300,
      spent: 75,
      impressions: 3000,
      clicks: 90,
      status: "active",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `ad_${nanoid()}`,
      type: "sponsored_recommendation",
      position: AD_POSITIONS.TRACK_LIBRARY_RECOMMENDATION,
      title: "Synthwave Vibes - New Release",
      description: "Check out the latest synthwave collection",
      targetUrl: "https://distrobuzz.com/tracks/synthwave-vibes",
      startDate: now,
      endDate: nextMonth,
      budget: 200,
      spent: 50,
      impressions: 2000,
      clicks: 60,
      status: "active",
      createdAt: now,
      updatedAt: now,
    },
  ];
}

/**
 * Generate ad dashboard stats
 */
export function generateAdStats(placements: AdPlacement[]) {
  const totalBudget = placements.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = placements.reduce((sum, p) => sum + p.spent, 0);
  const totalImpressions = placements.reduce((sum, p) => sum + p.impressions, 0);
  const totalClicks = placements.reduce((sum, p) => sum + p.clicks, 0);

  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCPC = totalClicks > 0 ? totalSpent / totalClicks : 0;

  return {
    totalBudget,
    totalSpent,
    remaining: totalBudget - totalSpent,
    totalImpressions,
    totalClicks,
    avgCTR: avgCTR.toFixed(2),
    avgCPC: avgCPC.toFixed(2),
    activeCount: placements.filter((p) => p.status === "active").length,
  };
}
