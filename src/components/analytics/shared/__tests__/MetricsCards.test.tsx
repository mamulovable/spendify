import { render, screen } from '@testing-library/react';
import { MetricsCards, Metric } from '@/components/analytics/shared/MetricsCards';

describe('MetricsCards', () => {
  const mockMetrics: Metric[] = [
    {
      label: 'Total Revenue',
      value: '$1,000',
      change: 5,
      description: 'Monthly revenue'
    },
    {
      label: 'Active Users',
      value: '500',
      change: -2,
      description: 'Current active users'
    },
    {
      label: 'Conversion Rate',
      value: '2.5%',
      description: 'User conversion rate'
    }
  ];

  it('renders all metrics correctly', () => {
    render(<MetricsCards metrics={mockMetrics} />);
    
    // Check if all metric labels are rendered
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
    
    // Check if all metric values are rendered
    expect(screen.getByText('$1,000')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('2.5%')).toBeInTheDocument();
    
    // Check if descriptions are rendered
    expect(screen.getByText('Monthly revenue')).toBeInTheDocument();
    expect(screen.getByText('Current active users')).toBeInTheDocument();
    expect(screen.getByText('User conversion rate')).toBeInTheDocument();
    
    // Check if change indicators are rendered
    expect(screen.getByText('+5%')).toBeInTheDocument();
    expect(screen.getByText('-2%')).toBeInTheDocument();
  });

  it('renders empty state when no metrics are provided', () => {
    render(<MetricsCards metrics={[]} />);
    
    // The component should render an empty grid
    const gridElement = screen.getByRole('list');
    expect(gridElement).toBeEmptyDOMElement();
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-test-class';
    render(<MetricsCards metrics={mockMetrics} className={customClass} />);
    
    // Check if the custom class is applied
    const gridElement = screen.getByRole('list');
    expect(gridElement).toHaveClass(customClass);
  });
});