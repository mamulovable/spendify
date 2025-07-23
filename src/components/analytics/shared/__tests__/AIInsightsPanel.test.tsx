import { render, screen, fireEvent } from '@testing-library/react';
import { AIInsightsPanel } from '@/components/analytics/shared/AIInsightsPanel';

describe('AIInsightsPanel', () => {
  const mockInsights = [
    {
      title: 'Insight 1',
      description: 'This is the first insight',
      actionItems: ['Action 1', 'Action 2'],
      severity: 'info' as const
    },
    {
      title: 'Insight 2',
      description: 'This is the second insight',
      actionItems: ['Action 3', 'Action 4'],
      severity: 'warning' as const
    },
    {
      title: 'Insight 3',
      description: 'This is the third insight',
      actionItems: ['Action 5', 'Action 6'],
      severity: 'critical' as const
    }
  ];

  it('renders the panel with the correct title', () => {
    const customTitle = 'Custom Insights Title';
    render(<AIInsightsPanel insights={mockInsights} title={customTitle} />);
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
  });

  it('renders all insights with their titles', () => {
    render(<AIInsightsPanel insights={mockInsights} />);
    
    expect(screen.getByText('Insight 1')).toBeInTheDocument();
    expect(screen.getByText('Insight 2')).toBeInTheDocument();
    expect(screen.getByText('Insight 3')).toBeInTheDocument();
  });

  it('expands an insight when clicked', () => {
    render(<AIInsightsPanel insights={mockInsights} />);
    
    // Initially, action items should not be visible
    expect(screen.queryByText('Action 1')).not.toBeInTheDocument();
    
    // Click on the first insight to expand it
    fireEvent.click(screen.getByText('Insight 1'));
    
    // Now action items should be visible
    expect(screen.getByText('Action 1')).toBeInTheDocument();
    expect(screen.getByText('Action 2')).toBeInTheDocument();
  });

  it('applies different styles based on severity', () => {
    render(<AIInsightsPanel insights={mockInsights} />);
    
    // Get all insight elements
    const insights = screen.getAllByRole('button');
    
    // Check if they have the correct styling classes based on severity
    expect(insights[0].closest('div')).toHaveClass('border-primary/20 bg-primary/5');
    expect(insights[1].closest('div')).toHaveClass('border-amber-500/20 bg-amber-500/5');
    expect(insights[2].closest('div')).toHaveClass('border-red-500/20 bg-red-500/5');
  });

  it('renders empty state when no insights are provided', () => {
    render(<AIInsightsPanel insights={[]} />);
    
    // Check if the panel is rendered but without insights
    expect(screen.getByText('AI-Powered Insights')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});