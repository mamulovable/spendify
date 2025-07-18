# UI/UX Design System & Guidelines

## Design System
- **Component Library**: shadcn/ui with Radix UI primitives
- **Design Tokens**: CSS custom properties defined in `src/index.css`
- **Typography**: Inter font family with font feature settings
- **Color Palette**: HSL-based color system with light/dark mode support
- **Spacing**: Tailwind's spacing scale (4px base unit)
- **Border Radius**: Custom radius system using CSS variables

## Component Usage Standards
- **shadcn/ui Components**: Always use the pre-built UI components from `@/components/ui/`
- **Consistent Styling**: Use the `cn()` utility for conditional classes
- **Accessibility**: Ensure all interactive elements have proper ARIA labels
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Loading States**: Implement loading spinners and skeleton screens

## Color System
```css
/* Primary colors for branding and CTAs */
--primary: 221 83% 53%;
--primary-foreground: 210 40% 98%;

/* Secondary colors for subtle elements */
--secondary: 210 40% 96.1%;
--secondary-foreground: 222.2 47.4% 11.2%;

/* Accent colors for highlights */
--accent: 221 83% 53%;
--accent-foreground: 222.2 47.4% 11.2%;
```

## Layout Patterns
- **Dashboard Layout**: Sidebar navigation with main content area
- **Card-based Design**: Use Card components for content sections
- **Grid Systems**: CSS Grid and Flexbox for responsive layouts
- **Spacing Consistency**: Use Tailwind spacing classes consistently

## Animation & Transitions
- **Page Transitions**: Custom CSS transitions for route changes
- **Micro-interactions**: Subtle hover and focus states
- **Loading Animations**: Consistent spinner and skeleton patterns
- **Chart Animations**: Smooth transitions for data visualization

## Responsive Breakpoints
- **Mobile**: < 768px (primary focus)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Large Desktop**: > 1400px

## Accessibility Requirements
- **Keyboard Navigation**: All interactive elements must be keyboard accessible
- **Screen Readers**: Proper semantic HTML and ARIA attributes
- **Color Contrast**: WCAG AA compliance for text contrast
- **Focus Indicators**: Visible focus states for all interactive elements