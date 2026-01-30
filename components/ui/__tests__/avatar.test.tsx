import { render, screen } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from '../avatar';
import { describe, it, expect } from 'vitest';

describe('Avatar', () => {
    it('renders with fallback when no image', () => {
        render(
            <Avatar>
                <AvatarFallback>JD</AvatarFallback>
            </Avatar>
        );
        expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('renders image when src is provided', () => {
        render(
            <Avatar>
                <AvatarImage src="/test.jpg" alt="Test user" />
                <AvatarFallback>JD</AvatarFallback>
            </Avatar>
        );
        const image = screen.getByRole('img', { name: 'Test user' });
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', '/test.jpg');
    });

    it('shows fallback when image fails to load', async () => {
        render(
            <Avatar>
                <AvatarImage src="/invalid.jpg" alt="Test" />
                <AvatarFallback>FB</AvatarFallback>
            </Avatar>
        );
        // Fallback should be visible when image fails
        expect(screen.getByText('FB')).toBeInTheDocument();
    });

    it('applies custom className to Avatar', () => {
        render(
            <Avatar className="custom-avatar" data-testid="avatar">
                <AvatarFallback>JD</AvatarFallback>
            </Avatar>
        );
        expect(screen.getByTestId('avatar')).toHaveClass('custom-avatar');
    });

    it('renders with proper rounded shape', () => {
        render(
            <Avatar data-testid="avatar">
                <AvatarFallback>JD</AvatarFallback>
            </Avatar>
        );
        expect(screen.getByTestId('avatar')).toHaveClass('rounded-full');
    });
});
