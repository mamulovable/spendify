# Design Document

## Overview

The DealMirror landing page will be a near-identical copy of the existing AppSumo landing page with DealMirror-specific branding and messaging. This approach maximizes code reuse while providing a tailored experience for DealMirror customers. The page will leverage all existing components, services, and authentication flows.

## Architecture

### Component Reuse Strategy
- **Primary Page Component**: Create `DealMirrorRedeem.tsx` based on `AppSumoRedeem.tsx`
- **Authentication Components**: Reuse `RegistrationForm`, `SignInForm`, `LTDPlanSelection`, and `EnhancedCodeRedemptionForm`
- **Feature Demos**: Reuse all existing feature demonstration components
- **UI Components**: Leverage existing shadcn/ui components and styling

### Route Integration
- Add `/dealmirror` route to the main router
- Follow the same pattern as the existing `/redeem` route
- Maintain the same lazy loading and context provider structure

## Components and Interfaces

### DealMirrorRedeem Component
```typescript
interface DealMirrorRedeemProps {
  // No props needed - self-contained page component
}

// State management (identical to AppSumo)
interface PageState {
  showBackToTop: boolean;
  activeButton: 'register' | 'signin' | null;
  currentStep: 'auth' | 'plan-selection' | 'code-redemption';
  selectedPlan: LTDPlanType | null;
}
```

### Branding Configuration
```typescript
interface BrandingConfig {
  platformName: string;
  bannerText: string;
  heroTitle: string;
  heroDescription: string;
  exclusiveText: string;
  supportReference: string;
}

const DEALMIRROR_BRANDING: BrandingConfig = {
  platformName: 'DealMirror',
  bannerText: 'Exclusive DealMirror Lifetime Deal - Limited Time Offer',
  heroTitle: 'Transform Your Finances with SpendlyAI Lifetime Access',
  heroDescription: 'Unlock the power of AI-driven financial insights forever through DealMirror...',
  exclusiveText: 'DealMirror Exclusive Lifetime Deal',
  supportReference: 'DealMirror support'
};
```

### Component Structure
```
DealMirrorRedeem/
├── Hero Section (DealMirror branding)
├── Navigation Tabs (identical functionality)
├── Feature Showcase (reused components)
│   ├── ExpenseTrackingDemo
│   ├── AIAdvisorDemo
│   ├── BudgetManagementDemo
│   ├── AnalyticsDashboardDemo
│   └── DocumentProcessingDemo
├── LTD Benefits Section (DealMirror messaging)
├── Registration Section (reused RegistrationForm)
├── Sign In Section (reused SignInForm)
├── Code Redemption Section
│   ├── LTDPlanSelection (reused)
│   └── EnhancedCodeRedemptionForm (reused)
└── FAQ Section (DealMirror-specific content)
```

## Data Models

### Branding Data Structure
The page will use a configuration object to customize branding elements:

```typescript
interface PlatformBranding {
  name: string;
  colors: {
    primary: string;
    accent: string;
  };
  messaging: {
    banner: string;
    hero: {
      title: string;
      subtitle: string;
      description: string;
    };
    benefits: {
      title: string;
      description: string;
    };
    cta: {
      primary: string;
      secondary: string;
    };
  };
  support: {
    reference: string;
    helpText: string[];
  };
}
```

### Code Redemption Integration
The existing AppSumo service and database schema will handle DealMirror codes:
- Codes will be stored in the same `appsumo_codes` table
- The `source` field will distinguish between 'appsumo' and 'dealmirror'
- Plan validation will work identically
- User subscription activation follows the same flow

## Error Handling

### Code Validation
- Reuse existing validation logic from `EnhancedCodeRedemptionForm`
- Error messages will reference DealMirror instead of AppSumo
- Same error types: INVALID_CODE, CODE_ALREADY_REDEEMED, PLAN_MISMATCH, EXPIRED_CODE

### Authentication Errors
- Leverage existing error handling from auth components
- No changes needed to error handling logic

### Network Errors
- Use existing error boundary and toast notification system
- Maintain consistent error user experience

## Testing Strategy

### Component Testing
- Create test file: `DealMirrorRedeem.test.tsx`
- Test branding customization
- Test navigation and scroll behavior
- Test authentication flow integration

### Integration Testing
- Test complete user journey from landing to dashboard
- Test code redemption with DealMirror codes
- Test responsive behavior across devices

### Visual Testing
- Verify DealMirror branding appears correctly
- Test color scheme and styling consistency
- Validate responsive layout behavior

## Performance Considerations

### Code Reuse Benefits
- Minimal bundle size increase (only branding differences)
- Shared component caching
- Consistent performance characteristics with AppSumo page

### Lazy Loading
- Follow same lazy loading pattern as existing routes
- Reuse existing loading components and states

### SEO Optimization
- Add DealMirror-specific meta tags
- Implement structured data for DealMirror landing page
- Optimize for DealMirror-related search terms

## Security Considerations

### Code Validation
- Reuse existing server-side validation
- Maintain same security checks for code redemption
- No additional security concerns beyond existing implementation

### Authentication
- Leverage existing Supabase Auth integration
- No changes to authentication security model

## Accessibility

### WCAG Compliance
- Inherit accessibility features from reused components
- Ensure DealMirror-specific content meets WCAG AA standards
- Test with screen readers and keyboard navigation

### Responsive Design
- Maintain mobile-first approach
- Ensure touch targets meet minimum size requirements
- Test across various device sizes and orientations

## Implementation Notes

### File Structure
```
src/
├── pages/
│   └── DealMirrorRedeem.tsx (new)
├── components/
│   └── (reuse existing auth and feature components)
├── services/
│   └── (reuse existing appSumoService)
└── routes/
    └── index.tsx (add new route)
```

### Configuration Approach
- Use a branding configuration object to customize text and styling
- Minimize code duplication by parameterizing differences
- Maintain consistency with existing design system

### Database Considerations
- No schema changes required
- Use existing `appsumo_codes` table with `source` field differentiation
- Existing admin interface will handle both AppSumo and DealMirror codes

This design ensures maximum code reuse while providing a tailored experience for DealMirror customers, maintaining consistency with the existing codebase and design patterns.