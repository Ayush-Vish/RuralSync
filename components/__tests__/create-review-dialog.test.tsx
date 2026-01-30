import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateReviewDialog } from '../create-review-dialog';
import { vi, Mock } from 'vitest';
import { apiService } from '@/lib/api-service';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/lib/api-service', () => ({
  apiService: {
    createReview: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Dialog UI components
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => <div data-testid="dialog" data-state={open ? 'open' : 'closed'}>{children}</div>,
  DialogTrigger: ({ children, asChild }: any) => <div data-testid="dialog-trigger">{children}</div>,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h1>{children}</h1>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
}));

describe('CreateReviewDialog', () => {
  const defaultProps = {
    serviceProviderId: 'provider-1',
    serviceId: 'service-1',
    serviceName: 'Test Service',
    providerName: 'Test Provider',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders trigger button', () => {
    render(<CreateReviewDialog {...defaultProps} />);
    expect(screen.getByText('Write Review')).toBeInTheDocument();
  });

  it('validates submission', async () => {
    render(<CreateReviewDialog {...defaultProps} />);

    // In our mock, content is always in DOM.
    const submitBtn = screen.getByText('Submit Review');

    // Try submit without data
    fireEvent.click(submitBtn);
    expect(submitBtn).toBeDisabled();
  });

  it('handles API submission', async () => {
    const { container } = render(<CreateReviewDialog {...defaultProps} />);

    // Find textarea
    const textarea = screen.getByPlaceholderText(/tell us about/i);
    fireEvent.change(textarea, { target: { value: 'Great service!' } });

    // Find rating stars. In the DOM, they are buttons.
    // We can query selector button containing svg.
    const dialogContent = screen.getByTestId('dialog-content');
    const buttonsInContent = dialogContent.querySelectorAll('button');

    // 5 stars, then Cancel, then Submit.
    // So index 4 is the 5th star.
    if (buttonsInContent.length >= 5) {
      fireEvent.click(buttonsInContent[4]);
    }

    const submitBtn = screen.getByText('Submit Review');
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiService.createReview).toHaveBeenCalledWith({
        serviceProviderId: 'provider-1',
        serviceId: 'service-1',
        rating: 5,
        comment: 'Great service!',
      });
      expect(toast.success).toHaveBeenCalled();
    });
  });
});
