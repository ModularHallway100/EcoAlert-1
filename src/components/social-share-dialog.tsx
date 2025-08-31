"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink,
  Twitter,
  Facebook,
  Linkedin,
  MessageCircle,
  Send,
  Link,
  Bookmark,
  Heart,
  Eye,
  TrendingUp
} from 'lucide-react';
import { socialSharingService } from '@/services/social-sharing-service';

interface SocialShareDialogProps {
  trigger?: React.ReactNode;
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  shareText?: string;
  showAnalytics?: boolean;
  className?: string;
}

interface SharePlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  shareCount?: number;
  enabled: boolean;
}

export function SocialShareDialog({
  trigger,
  title,
  description,
  url,
  imageUrl,
  shareText,
  showAnalytics = false,
  className
}: SocialShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customText, setCustomText] = useState(shareText || '');
  const [platforms, setPlatforms] = useState<SharePlatform[]>([]);
  const [shareAnalytics, setShareAnalytics] = useState<any>(null);

  useEffect(() => {
    // Load available platforms
    const enabledPlatforms = socialSharingService.getEnabledPlatforms();
    const platformComponents = enabledPlatforms.map(platform => ({
      id: platform.id,
      name: platform.name,
      icon: getPlatformIcon(platform.id),
      color: platform.color,
      enabled: platform.enabled,
    }));
    
    setPlatforms(platformComponents);
    
    // Load analytics if enabled
    if (showAnalytics) {
      loadShareAnalytics();
    }
  }, [showAnalytics]);

  const getPlatformIcon = (platformId: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      twitter: <Twitter className="h-5 w-5" />,
      facebook: <Facebook className="h-5 w-5" />,
      linkedin: <Linkedin className="h-5 w-5" />,
      whatsapp: <MessageCircle className="h-5 w-5" />,
      telegram: <Send className="h-5 w-5" />,
      reddit: <TrendingUp className="h-5 w-5" />,
      pinterest: <Bookmark className="h-5 w-5" />,
      email: <ExternalLink className="h-5 w-5" />,
    };
    
    return iconMap[platformId] || <Share2 className="h-5 w-5" />;
  };

  const loadShareAnalytics = async () => {
    // In a real app, this would fetch analytics for the specific content
    const analytics = {
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
    
    setShareAnalytics(analytics);
  };

  const handleShare = (platformId: string) => {
    const shareUrl = socialSharingService.generateShareUrl(
      platformId,
      url || window.location.href,
      customText || title
    );
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = url || window.location.href;
    const success = await socialSharingService.copyToClipboard(shareUrl);
    
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyText = async () => {
    if (!customText) return;
    
    const success = await socialSharingService.copyToClipboard(customText);
    
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className={className}>
      <Share2 className="h-4 w-4 mr-2" />
      Share
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share This Content
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Preview Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            {imageUrl && (
              <div className="px-6 pb-4">
                <img 
                  src={imageUrl} 
                  alt={title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>1.2K views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>89 likes</span>
                  </div>
                </div>
                <Badge variant="outline">Environmental</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Share Text Customization */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Share Message</label>
            <Textarea
              placeholder="Add your personal message..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                {customText.length}/280 characters
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCopyText}
                disabled={!customText}
              >
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </Button>
            </div>
          </div>

          {/* Social Platforms */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Share to</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {platforms.map((platform) => (
                <Button
                  key={platform.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
                  onClick={() => handleShare(platform.id)}
                >
                  <div 
                    className="p-2 rounded-full"
                    style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
                  >
                    {platform.icon}
                  </div>
                  <span className="text-xs font-medium">{platform.name}</span>
                  {shareAnalytics?.platformBreakdown[platform.id] && (
                    <span className="text-xs text-gray-500">
                      {shareAnalytics.platformBreakdown[platform.id]}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Direct Share Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Direct Share</label>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCopyLink}
              >
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Link className="h-4 w-4 mr-2" />}
                {copied ? 'Link Copied!' : 'Copy Link'}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const text = customText || `${title}\n\n${description}`;
                  socialSharingService.copyToClipboard(text);
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Text
              </Button>
            </div>
          </div>

          {/* Share Analytics */}
          {showAnalytics && shareAnalytics && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Share Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Shares</span>
                  <Badge variant="secondary">{shareAnalytics.totalShares}</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Platform Distribution</div>
                  <div className="space-y-2">
                    {Object.entries(shareAnalytics.platformBreakdown).map(([platform, count]) => (
                      <div key={platform} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(platform)}
                          <span className="text-sm capitalize">{platform}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ 
                                width: `${(count as number / shareAnalytics.totalShares) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8 text-right">
                            {count as number}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Recent Activity</div>
                  <div className="space-y-1">
                    {shareAnalytics.recentShares.map((share: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-gray-500">
                        {getPlatformIcon(share.platform)}
                        <span className="capitalize">{share.platform}</span>
                        <span>•</span>
                        <span>{new Date(share.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Environmental Impact Note */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Leaf className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-800 mb-1">Your Share Makes a Difference</h4>
                <p className="text-sm text-green-700">
                  Every share helps raise awareness about environmental issues and promotes sustainable practices. 
                  Together, we're building a community for positive change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Add Leaf icon import
import { Leaf } from 'lucide-react';