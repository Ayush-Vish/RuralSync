import { render, screen, waitFor } from '@testing-library/react';
import { AuthGuard } from '../auth-gaurd';
import { vi, Mock } from 'vitest';
import { useAuthStore } from '@/store/store';
import { useRouter } from 'next/navigation';

// Mock dependencies
vi.mock('@/store/store');
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

describe('AuthGuard', () => {
    const mockRouter = {
        push: vi.fn(),
    };

    const mockCheckAuthStatus = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as Mock).mockReturnValue(mockRouter);

        // Default mock implementation for store
        (useAuthStore as unknown as Mock).mockReturnValue({
            isLoggedIn: false,
            isLoading: false,
            checkAuthStatus: mockCheckAuthStatus.mockResolvedValue(false),
        });
    });

    it('renders children when requireAuth is false', () => {
        render(
            <AuthGuard requireAuth={false}>
                <div data-testid="child">Child Content</div>
            </AuthGuard>
        );
        expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('shows loading state when isLoading is true', () => {
        (useAuthStore as unknown as Mock).mockReturnValue({
            isLoggedIn: false,
            isLoading: true,
            checkAuthStatus: mockCheckAuthStatus,
        });

        render(
            <AuthGuard>
                <div data-testid="child">Child Content</div>
            </AuthGuard>
        );

        expect(screen.getByText('Verifying authentication...')).toBeInTheDocument();
        expect(screen.queryByTestId('child')).not.toBeInTheDocument();
    });

    it('redirects to login when not authenticated', async () => {
        mockCheckAuthStatus.mockResolvedValue(false);

        render(
            <AuthGuard>
                <div data-testid="child">Child Content</div>
            </AuthGuard>
        );

        // Initial render shows helper text or nothing before redirect logic completes
        // In the component, if !isLoggedIn it shows "Redirecting to login..."
        expect(screen.getByText('Redirecting to login...')).toBeInTheDocument();

        await waitFor(() => {
            expect(mockCheckAuthStatus).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith('/login');
        });
    });

    it('renders children when authenticated', async () => {
        (useAuthStore as unknown as Mock).mockReturnValue({
            isLoggedIn: true,
            isLoading: false,
            checkAuthStatus: mockCheckAuthStatus.mockResolvedValue(true),
        });

        render(
            <AuthGuard>
                <div data-testid="child">Child Content</div>
            </AuthGuard>
        );

        expect(screen.getByTestId('child')).toBeInTheDocument();
    });
});
