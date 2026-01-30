import { render, screen } from '@testing-library/react';
import { Label } from '../label';
import { describe, it, expect } from 'vitest';

describe('Label', () => {
    it('renders with text content', () => {
        render(<Label>Username</Label>);
        expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('associates with input via htmlFor', () => {
        render(
            <div>
                <Label htmlFor="test-input">Email</Label>
                <input id="test-input" type="email" />
            </div>
        );
        const label = screen.getByText('Email');
        expect(label).toHaveAttribute('for', 'test-input');
    });

    it('applies custom className', () => {
        render(<Label className="custom-label">Custom</Label>);
        expect(screen.getByText('Custom')).toHaveClass('custom-label');
    });

    it('renders children elements', () => {
        render(
            <Label>
                <span>Required</span> Field
            </Label>
        );
        expect(screen.getByText('Required')).toBeInTheDocument();
        expect(screen.getByText('Field')).toBeInTheDocument();
    });
});
