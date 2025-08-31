import { LRUCache } from "lru-cache";

// Social media platform configuration
interface SocialPlatform {
  id: string;
  name: string;
  color: string;
  icon: string;
  shareUrl: (url: string, text: string) => string;
  enabled: boolean;
}

// Social media sharing service
export class SocialSharingService {
  private cache: LRUCache<string, any>;
  private platforms: SocialPlatform[];

  constructor() {
    // Initialize cache with a maximum of 50 entries and 10-minute TTL
    this.cache = new LRUCache({
      max: 50,
      ttl: 1000 * 60 * 10, // 10 minutes
    });

    // Initialize social media platforms
    this.platforms = [
      {
        id: 'twitter',
        name: 'Twitter',
        color: '#1DA1F2',
        icon: '🐦',
        shareUrl: (url, text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        enabled: true,
      },
      {
        id: 'facebook',
        name: 'Facebook',
        color: '#1877F2',
        icon: '📘',
        shareUrl: (url, text) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
        enabled: true,
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        color: '#0A66C2',
        icon: '💼',
        shareUrl: (url, text) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
        enabled: true,
      },
      {
        id: 'whatsapp',
        name: 'WhatsApp',
        color: '#25D366',
        icon: '💬',
        shareUrl: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
        enabled: true,
      },
      {
        id: 'telegram',
        name: 'Telegram',
        color: '#0088CC',
        icon: '✈️',
        shareUrl: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
        enabled: true,
      },
      {
        id: 'reddit',
        name: 'Reddit',
        color: '#FF4500',
        icon: '🔗',
        shareUrl: (url, text) => `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
        enabled: true,
      },
      {
        id: 'pinterest',
        name: 'Pinterest',
        color: '#E60023',
        icon: '📌',
        shareUrl: (url, text) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`,
        enabled: true,
      },
      {
        id: 'email',
        name: 'Email',
        color: '#EA4335',
        icon: '✉️',
        shareUrl: (url, text) => `mailto:?subject=${encodeURIComponent('Check this out!')}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
        enabled: true,
      },
    ];
  }

  /**
   * Get all enabled social platforms
   */
  public getEnabledPlatforms(): SocialPlatform[] {
    return this.platforms.filter(platform => platform.enabled);
  }

  /**
   * Get a specific platform by ID
   */
  public getPlatform(id: string): SocialPlatform | undefined {
    return this.platforms.find(platform => platform.id === id);
  }

  /**
   * Generate share URL for a specific platform
   */
  public generateShareUrl(platformId: string, url: string, text: string): string | null {
    const platform = this.getPlatform(platformId);
    if (!platform || !platform.enabled) {
      return null;
    }

    return platform.shareUrl(url, text);
  }

  /**
   * Open share dialog for a specific platform
   */
  public shareToPlatform(platformId: string, url: string, text: string, title?: string): boolean {
    const shareUrl = this.generateShareUrl(platformId, url, text);
    if (!shareUrl) {
      return false;
    }

    // Open in a new window
    const newWindow = window.open(shareUrl, '_blank', 'width=600,height=400');
    if (newWindow) {
      newWindow.focus();
      
      // Track share event
      this.trackShareEvent(platformId, url, title);
    }

    return true;
  }

  /**
   * Generate share URLs for all platforms
   */
  public generateShareUrls(url: string, text: string, title?: string): Record<string, string> {
    const shareUrls: Record<string, string> = {};
    
    this.getEnabledPlatforms().forEach(platform => {
      const shareUrl = this.generateShareUrl(platform.id, url, text);
      if (shareUrl) {
        shareUrls[platform.id] = shareUrl;
      }
    });

    return shareUrls;
  }

  /**
   * Copy share text to clipboard
   */
  public async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      
      // Track copy event
      this.trackShareEvent('clipboard', '', 'Copy to clipboard');
      
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Generate share text with environmental impact
   */
  public generateEnvironmentalShareText(
    content: string,
    impact?: {
      co2Reduced: number;
      treesPlanted: number;
      energySaved: number;
    }
  ): string {
    let shareText = content;

    if (impact) {
      shareText += `\n\nTogether, we've made an impact:\n`;
      shareText += `• ${impact.co2Reduced} tons of CO₂ reduced\n`;
      shareText += `• ${impact.treesPlanted} trees planted\n`;
      shareText += `• ${impact.energySaved} kWh energy saved\n`;
      shareText += `\nJoin us at EcoAlert! #EnvironmentalImpact #CleanAir`;
    }

    return shareText;
  }

  /**
   * Generate share text with educational content
   */
  public generateEducationalShareText(
    title: string,
    description: string,
    category: string,
    difficulty: string
  ): string {
    return `🌱 Learning about ${category}!\n\n${title}\n\n${description}\n\nDifficulty: ${difficulty}\n\nLearn more with EcoAlert! #EnvironmentalEducation #Sustainability`;
  }

  /**
   * Generate share text with community post
   */
  public generateCommunityPostShareText(
    author: string,
    content: string,
    location?: string
  ): string {
    let shareText = `🌍 Community post from ${author}:\n\n${content}`;
    
    if (location) {
      shareText += `\n\n📍 ${location}`;
    }
    
    shareText += `\n\nJoin the conversation on EcoAlert! #Community #EnvironmentalAction`;
    
    return shareText;
  }

  /**
   * Track share events (in a real app, this would send analytics)
   */
  private trackShareEvent(platform: string, url: string, title?: string): void {
    // In a real application, this would send data to your analytics service
    const event = {
      platform,
      url,
      title,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    // Cache the event for batch processing
    const cacheKey = `share_event_${Date.now()}_${Math.random()}`;
    this.cache.set(cacheKey, event);
  }

  /**
   * Get share analytics (mock data for now)
   */
  public async getShareAnalytics(contentId: string): Promise<{
    totalShares: number;
    platformBreakdown: Record<string, number>;
    recentShares: Array<{
      platform: string;
      timestamp: Date;
    }>;
  }> {
    // In a real application, this would fetch from your analytics database
    return {
      totalShares: 156,
      platformBreakdown: {
        twitter: 45,
        facebook: 32,
        linkedin: 28,
        whatsapp: 25,
        telegram: 15,
        reddit: 8,
        pinterest: 3,
      },
      recentShares: [
        { platform: 'twitter', timestamp: new Date(Date.now() - 5 * 60 * 1000) },
        { platform: 'facebook', timestamp: new Date(Date.now() - 12 * 60 * 1000) },
        { platform: 'linkedin', timestamp: new Date(Date.now() - 25 * 60 * 1000) },
      ],
    };
  }

  /**
   * Generate share preview card
   */
  public generateSharePreview(
    title: string,
    description: string,
    imageUrl?: string,
    url?: string
  ): {
    title: string;
    description: string;
    imageUrl: string;
    url: string;
  } {
    return {
      title: title.substring(0, 60) + (title.length > 60 ? '...' : ''),
      description: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
      imageUrl: imageUrl || '/images/default-share-image.jpg',
      url: url || window.location.href,
    };
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const socialSharingService = new SocialSharingService();