import { render, screen } from '@testing-library/react';
import { Badge } from '../badge';
import { describe, it, expect } from 'vitest';

describe('Badge', () => {
    it('renders with default variant', () => {
        render(<Badge>Default Badge</Badge>);
        const badge = screen.getByText('Default Badge');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('bg-primary');
    });

    it('applies different variants', () => {
        const { rerender } = render(<Badge variant="secondary">Secondary</Badge>);
        let badge = screen.getByText('Secondary');
        expect(badge).toHaveClass('bg-secondary');

        rerender(<Badge variant="destructive">Destructive</Badge>);
        badge = screen.getByText('Destructive');
        expect(badge).toHaveClass('bg-destructive');

        rerender(<Badge variant="outline">Outline</Badge>);
        badge = screen.getByText('Outline');
        expect(badge).toHaveClass('text-foreground');
    });

    it('renders custom className', () => {
        render(<Badge className="custom-badge">Custom</Badge>);
        expect(screen.getByText('Custom')).toHaveClass('custom-badge');
    });

    it('supports asChild prop', () => {
        render(
            <Badge asChild>
                <a href="/test">Link Badge</a>
            </Badge>
        );
        const link = screen.getByRole('link', { name: 'Link Badge' });
        expect(link).toBeInTheDocument();
        expect(link).toHaveClass('bg-primary');
    });

    it('renders with icons', () => {
        render(
            <Badge>
                <svg data-testid="icon" />
                With Icon
            </Badge>
        );
        expect(screen.getByTestId('icon')).toBeInTheDocument();
        expect(screen.getByText('With Icon')).toBeInTheDocument();
    });
});
