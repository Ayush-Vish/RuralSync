import { render, screen, fireEvent, within } from '@testing-library/react';
import { Header } from '../header';
import { vi, Mock } from 'vitest';
import { useAuthStore } from '@/store/store';
import { useLocationStore } from '@/store/location-store';
import { useRouter, usePathname } from 'next/navigation';

// Mock dependencies
vi.mock('next/link', () => ({
    default: ({ children, href, onClick }: any) => (
        <a href={href} onClick={onClick} data-testid={`link-${href}`}>
            {children}
        </a>
    ),
}));

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
    usePathname: vi.fn(),
}));

vi.mock('@/store/store');
vi.mock('@/store/location-store');
vi.mock('@/lib/geocoding', () => ({
    getStoredCity: vi.fn(),
    storeDetectedCity: vi.fn(),
}));

// Mock UI components that are complex or have internal state
vi.mock('@/components/location-search-input', () => ({
    LocationSearchInput: ({ onLocationSelect, onClear }: any) => (
        <div data-testid="location-search-input">
            <button onClick={() => onLocationSelect({ lat: 10, lng: 20, city: 'test-city', displayName: 'Test City' })}>
                Select Location Inside Input
            </button>
            <button onClick={onClear}>Clear</button>
        </div>
    ),
}));

describe('Header', () => {
    const mockRouter = { push: vi.fn() };
    const mockLogout = vi.fn();
    const mockSetLocation = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as Mock).mockReturnValue(mockRouter);
        (usePathname as Mock).mockReturnValue('/');

        // Default auth store state (logged out)
        (useAuthStore as unknown as Mock).mockReturnValue({
            user: null,
            isLoggedIn: false,
            isLoading: false,
            logout: mockLogout,
        });

        // Default location store state
        (useLocationStore as unknown as Mock).mockReturnValue({
            displayName: null,
            city: null,
            setLocation: mockSetLocation,
        });
    });

    it('renders logo and navigation links', () => {
        render(<Header />);
        expect(screen.getByText('RuralSync')).toBeInTheDocument();
        expect(screen.getByText('Search')).toBeInTheDocument();
        expect(screen.getByText('Services')).toBeInTheDocument();
        expect(screen.getByText('Providers')).toBeInTheDocument();

        // Login/Signup buttons should be present when logged out
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('renders user menu when logged in', () => {
        (useAuthStore as unknown as Mock).mockReturnValue({
            user: { name: 'Test User', email: 'test@example.com', profileImage: 'img.jpg' },
            isLoggedIn: true,
            isLoading: false,
            logout: mockLogout,
        });

        render(<Header />);

        // Avatar/User initials should be visible (mocked roughly or via fallback logic)
        // The dropdown trigger is an Avatar, we can look for the fallback text logic "TU"
        expect(screen.getByText('TU')).toBeInTheDocument();
    });

    it('displays stored location name if available', () => {
        (useLocationStore as unknown as Mock).mockReturnValue({
            displayName: 'My Saved Location',
            city: 'saved-city',
            setLocation: mockSetLocation,
        });

        render(<Header />);
        expect(screen.getByText('My Saved Location')).toBeInTheDocument();
    });

    it('handles location selection', () => {
        render(<Header />);

        // Open popover (trigger is the location button)
        const locationBtn = screen.getByText('Select Location');
        fireEvent.click(locationBtn);

        // Simulate selection from the mocked input
        // We updated the mock text to be unique to avoid ambiguity
        const selectBtn = screen.getByText('Select Location Inside Input');
        fireEvent.click(selectBtn);

        expect(mockSetLocation).toHaveBeenCalledWith({
            latitude: 10,
            longitude: 20,
            city: 'test-city',
            displayName: 'Test City',
        });

        // Should navigate
        expect(mockRouter.push).toHaveBeenCalled();
    });
});
