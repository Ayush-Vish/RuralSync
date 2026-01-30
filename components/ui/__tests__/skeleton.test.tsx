import { render, screen } from '@testing-library/react';
import { Skeleton } from '../skeleton';
import { describe, it, expect } from 'vitest';

describe('Skeleton', () => {
    it('renders with default styles', () => {
        render(<Skeleton data-testid="skeleton" />);
        const skeleton = screen.getByTestId('skeleton');
        expect(skeleton).toBeInTheDocument();
        expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted');
    });

    it('applies custom className', () => {
        render(<Skeleton className="h-20 w-full" data-testid="skeleton" />);
        const skeleton = screen.getByTestId('skeleton');
        expect(skeleton).toHaveClass('h-20', 'w-full');
    });

    it('renders with custom dimensions', () => {
        render(<Skeleton style={{ width: '100px', height: '50px' }} data-testid="skeleton" />);
        const skeleton = screen.getByTestId('skeleton');
        expect(skeleton).toHaveStyle({ width: '100px', height: '50px' });
    });

    it('can be used multiple times for loading states', () => {
        render(
            <div>
                <Skeleton data-testid="skeleton-1" />
                <Skeleton data-testid="skeleton-2" />
                <Skeleton data-testid="skeleton-3" />
            </div>
        );
        expect(screen.getByTestId('skeleton-1')).toBeInTheDocument();
        expect(screen.getByTestId('skeleton-2')).toBeInTheDocument();
        expect(screen.getByTestId('skeleton-3')).toBeInTheDocument();
    });
});
