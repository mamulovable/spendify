/**
 * Platform Branding Configuration
 * 
 * This file contains branding configurations for different LTD platforms
 * to customize the landing page experience while reusing components.
 */

export interface PlatformBranding {
  name: string;
  slug: string;
  colors: {
    primary: string;
    accent: string;
  };
  messaging: {
    banner: string;
    hero: {
      badge: string;
      title: string;
      subtitle: string;
      description: string;
    };
    benefits: {
      title: string;
      description: string;
      cta: {
        title: string;
        description: string;
        button: string;
      };
    };
    exclusiveBadges: {
      hero: string;
      feature: string;
      lifetime: string;
    };
  };
  support: {
    reference: string;
    helpText: string[];
    contactInfo: string;
  };
  breadcrumb: string;
  metaTags: {
    title: string;
    description: string;
    keywords: string;
  };
}

// AppSumo branding configuration
export const APPSUMO_BRANDING: PlatformBranding = {
  name: 'AppSumo',
  slug: 'appsumo',
  colors: {
    primary: 'hsl(221, 83%, 53%)',
    accent: 'hsl(221, 83%, 53%)'
  },
  messaging: {
    banner: 'Exclusive AppSumo Lifetime Deal - Limited Time Offer',
    hero: {
      badge: 'AppSumo Exclusive Lifetime Deal',
      title: 'Transform Your Finances with SpendlyAI Lifetime Access',
      subtitle: 'SpendlyAI',
      description: 'Unlock the power of AI-driven financial insights forever. One payment, lifetime access to the smartest expense tracking and financial management platform.'
    },
    benefits: {
      title: 'Your AppSumo Lifetime Deal Benefits',
      description: 'Exclusive lifetime access to premium features at a one-time price.',
      cta: {
        title: "Don't Miss This Limited-Time Offer",
        description: 'AppSumo deals are available for a limited time only. Lock in your lifetime access to SpendlyAI today and never worry about subscription fees again.',
        button: 'Claim Your Lifetime Deal Now'
      }
    },
    exclusiveBadges: {
      hero: 'AppSumo Exclusive',
      feature: 'AppSumo Exclusive',
      lifetime: 'Lifetime Access'
    }
  },
  support: {
    reference: 'AppSumo support',
    helpText: [
      'Make sure your code matches the plan you selected',
      'Check that the code hasn\'t been used before',
      'Ensure you\'re entering the correct 15-character code',
      'Contact AppSumo support if you continue having issues'
    ],
    contactInfo: 'Contact AppSumo support for assistance with your code redemption.'
  },
  breadcrumb: 'AppSumo Lifetime Deal',
  metaTags: {
    title: 'SpendlyAI - Exclusive AppSumo Lifetime Deal',
    description: 'Get lifetime access to SpendlyAI through AppSumo. AI-powered expense tracking, financial insights, and budget management - one payment, forever.',
    keywords: 'AppSumo, SpendlyAI, lifetime deal, expense tracking, financial management, AI advisor'
  }
};

// DealMirror branding configuration
export const DEALMIRROR_BRANDING: PlatformBranding = {
  name: 'DealMirror',
  slug: 'dealmirror',
  colors: {
    primary: 'hsl(221, 83%, 53%)',
    accent: 'hsl(221, 83%, 53%)'
  },
  messaging: {
    banner: 'Exclusive DealMirror Lifetime Deal - Limited Time Offer',
    hero: {
      badge: 'DealMirror Exclusive Lifetime Deal',
      title: 'Transform Your Finances with SpendlyAI Lifetime Access',
      subtitle: 'SpendlyAI',
      description: 'Unlock the power of AI-driven financial insights forever through DealMirror. One payment, lifetime access to the smartest expense tracking and financial management platform.'
    },
    benefits: {
      title: 'Your DealMirror Lifetime Deal Benefits',
      description: 'Exclusive lifetime access to premium features at a one-time price through DealMirror.',
      cta: {
        title: "Don't Miss This Limited-Time Offer",
        description: 'DealMirror deals are available for a limited time only. Lock in your lifetime access to SpendlyAI today and never worry about subscription fees again.',
        button: 'Claim Your Lifetime Deal Now'
      }
    },
    exclusiveBadges: {
      hero: 'DealMirror Exclusive',
      feature: 'DealMirror Exclusive',
      lifetime: 'Lifetime Access'
    }
  },
  support: {
    reference: 'DealMirror support',
    helpText: [
      'Make sure your code matches the plan you selected',
      'Check that the code hasn\'t been used before',
      'Ensure you\'re entering the correct DealMirror code',
      'Contact DealMirror support if you continue having issues'
    ],
    contactInfo: 'Contact DealMirror support for assistance with your code redemption.'
  },
  breadcrumb: 'DealMirror Lifetime Deal',
  metaTags: {
    title: 'SpendlyAI - Exclusive DealMirror Lifetime Deal',
    description: 'Get lifetime access to SpendlyAI through DealMirror. AI-powered expense tracking, financial insights, and budget management - one payment, forever.',
    keywords: 'DealMirror, SpendlyAI, lifetime deal, expense tracking, financial management, AI advisor'
  }
};

// Dealify branding configuration
export const DEALIFY_BRANDING: PlatformBranding = {
  name: 'Dealify',
  slug: 'dealify',
  colors: {
    primary: 'hsl(221, 83%, 53%)',
    accent: 'hsl(221, 83%, 53%)'
  },
  messaging: {
    banner: 'Exclusive Dealify Lifetime Deal - Limited Time Offer',
    hero: {
      badge: 'Dealify Exclusive Lifetime Deal',
      title: 'Transform Your Finances with SpendlyAI Lifetime Access',
      subtitle: 'SpendlyAI',
      description: 'Unlock the power of AI-driven financial insights forever through Dealify. One payment, lifetime access to the smartest expense tracking and financial management platform.'
    },
    benefits: {
      title: 'Your Dealify Lifetime Deal Benefits',
      description: 'Exclusive lifetime access to premium features at a one-time price through Dealify.',
      cta: {
        title: "Don't Miss This Limited-Time Offer",
        description: 'Dealify deals are available for a limited time only. Lock in your lifetime access to SpendlyAI today and never worry about subscription fees again.',
        button: 'Claim Your Lifetime Deal Now'
      }
    },
    exclusiveBadges: {
      hero: 'Dealify Exclusive',
      feature: 'Dealify Exclusive',
      lifetime: 'Lifetime Access'
    }
  },
  support: {
    reference: 'Dealify support',
    helpText: [
      'Make sure your code matches the plan you selected',
      'Check that the code hasn\'t been used before',
      'Ensure you\'re entering the correct Dealify code',
      'Contact Dealify support if you continue having issues'
    ],
    contactInfo: 'Contact Dealify support for assistance with your code redemption.'
  },
  breadcrumb: 'Dealify Lifetime Deal',
  metaTags: {
    title: 'SpendlyAI - Exclusive Dealify Lifetime Deal',
    description: 'Get lifetime access to SpendlyAI through Dealify. AI-powered expense tracking, financial insights, and budget management - one payment, forever.',
    keywords: 'Dealify, SpendlyAI, lifetime deal, expense tracking, financial management, AI advisor'
  }
};

// Platform branding registry
export const PLATFORM_BRANDING: Record<string, PlatformBranding> = {
  appsumo: APPSUMO_BRANDING,
  dealmirror: DEALMIRROR_BRANDING,
  dealify: DEALIFY_BRANDING
};

// Helper function to get branding by platform slug
export const getPlatformBranding = (platform: string): PlatformBranding => {
  return PLATFORM_BRANDING[platform.toLowerCase()] || APPSUMO_BRANDING;
};

// Type exports for component usage
export type { PlatformBranding };