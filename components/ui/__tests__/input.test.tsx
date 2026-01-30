import { render, screen } from '@testing-library/react';
import { Input } from '../input';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

describe('Input', () => {
    it('renders with default props', () => {
        render(<Input placeholder="Enter text" />);
        expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('handles value changes', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();
        render(<Input onChange={handleChange} />);

        const input = screen.getByRole('textbox');
        await user.type(input, 'Hello');

        expect(handleChange).toHaveBeenCalled();
        expect(input).toHaveValue('Hello');
    });

    it('supports different types', () => {
        const { rerender } = render(<Input type="password" />);
        let input = screen.getByRole('textbox', { hidden: true });
        expect(input).toHaveAttribute('type', 'password');

        rerender(<Input type="email" />);
        input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('type', 'email');
    });

    it('renders as disabled', () => {
        render(<Input disabled placeholder="Disabled input" />);
        const input = screen.getByPlaceholderText('Disabled input');
        expect(input).toBeDisabled();
        expect(input).toHaveClass('disabled:opacity-50');
    });

    it('applies custom className', () => {
        render(<Input className="custom-input" />);
        expect(screen.getByRole('textbox')).toHaveClass('custom-input');
    });

    it('supports aria-invalid for error states', () => {
        render(<Input aria-invalid />);
        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveClass('aria-invalid:border-destructive');
    });

    it('renders with value prop', () => {
        render(<Input value="Initial value" readOnly />);
        expect(screen.getByRole('textbox')).toHaveValue('Initial value');
    });
});
