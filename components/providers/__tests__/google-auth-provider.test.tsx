import { render, screen } from '@testing-library/react';
import { GoogleOAuthWrapper } from '../google-auth-provider';
import { vi } from 'vitest';

// Mock the GoogleOAuthProvider
vi.mock('@react-oauth/google', () => ({
    GoogleOAuthProvider: ({ children, clientId }: { children: React.ReactNode; clientId: string }) => (
        <div data-testid="google-provider" data-client-id={clientId}>
            {children}
        </div>
    ),
}));

describe('GoogleOAuthWrapper', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('renders children wrapped in provider', () => {
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'test-client-id';

        render(
            <GoogleOAuthWrapper>
                <div data-testid="child">Child Content</div>
            </GoogleOAuthWrapper>
        );

        const provider = screen.getByTestId('google-provider');
        expect(provider).toBeInTheDocument();
        expect(provider).toHaveAttribute('data-client-id', 'test-client-id');
        expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('handles missing client id gracefully (passes empty string)', () => {
        delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

        render(
            <GoogleOAuthWrapper>
                <div>Child</div>
            </GoogleOAuthWrapper>
        );

        const provider = screen.getByTestId('google-provider');
        expect(provider).toHaveAttribute('data-client-id', '');
    });
});
