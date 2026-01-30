import { render, screen } from '@testing-library/react';
import { Textarea } from '../textarea';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

describe('Textarea', () => {
    it('renders with placeholder', () => {
        render(<Textarea placeholder="Enter description" />);
        expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
    });

    it('handles value changes', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();
        render(<Textarea onChange={handleChange} />);

        const textarea = screen.getByRole('textbox');
        await user.type(textarea, 'Hello world');

        expect(handleChange).toHaveBeenCalled();
        expect(textarea).toHaveValue('Hello world');
    });

    it('renders as disabled', () => {
        render(<Textarea disabled placeholder="Disabled textarea" />);
        const textarea = screen.getByPlaceholderText('Disabled textarea');
        expect(textarea).toBeDisabled();
        expect(textarea).toHaveClass('disabled:opacity-50');
    });

    it('applies custom className', () => {
        render(<Textarea className="custom-textarea" />);
        expect(screen.getByRole('textbox')).toHaveClass('custom-textarea');
    });

    it('supports rows attribute', () => {
        render(<Textarea rows={5} />);
        expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
    });

    it('supports aria-invalid for error states', () => {
        render(<Textarea aria-invalid />);
        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveAttribute('aria-invalid', 'true');
        expect(textarea).toHaveClass('aria-invalid:border-destructive');
    });
});
