import { render, screen } from '@testing-library/react';
import { ServiceCard } from '../service-card';
import { Service } from '@/types';
import { vi } from 'vitest';

// Mock everything that isn't the component under test to make it a true unit test
vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

// Mock simple UI components to avoid dependency on their implementation
vi.mock('@/components/ui/card', () => ({
    Card: ({ children, className }: any) => <div className={`mock-card ${className}`}>{children}</div>,
    CardContent: ({ children, className }: any) => <div className={`mock-card-content ${className}`}>{children}</div>,
}));

vi.mock('@/components/ui/badge', () => ({
    Badge: ({ children, className }: any) => <span className={`mock-badge ${className}`}>{children}</span>,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children }: any) => <button>{children}</button>,
}));

const mockService: Service = {
    _id: '1',
    name: 'Test Service',
    description: 'Test Description',
    basePrice: 100,
    category: 'Plumbing',
    images: ['test-image.jpg'],
    organization: {
        _id: 'org1',
        name: 'Test Org',
        email: 'test@org.com',
        phone: '1234567890',
        address: 'Org Address',
        description: 'Org Desc',
        rating: 4.5,
        joinedAt: '2023-01-01',
        isActive: true,
    },
    rating: 4.5,
    numReviews: 10,
    isAvailable: true,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    estimatedDuration: 2,
    address: 'Test Address',
    distanceInKm: 5.5,
};

describe('ServiceCard', () => {
    it('renders correctly in grid view (default)', () => {
        render(<ServiceCard service={mockService} />);

        expect(screen.getByText('Test Service')).toBeInTheDocument();
        expect(screen.getByText('Test Org')).toBeInTheDocument();
        expect(screen.getByText('₹100')).toBeInTheDocument();
        expect(screen.getByText('5.5 km')).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAttribute('src', 'test-image.jpg');

        // Check link href
        const link = screen.getByRole('link'); // Since we mocked Next/Link as <a>
        expect(link).toHaveAttribute('href', '/services/1');
    });

    it('renders correctly in list view', () => {
        render(<ServiceCard service={mockService} viewMode="list" />);

        expect(screen.getByText('Test Service')).toBeInTheDocument();
        expect(screen.getByText('Test Org')).toBeInTheDocument();
        expect(screen.getByText('₹100')).toBeInTheDocument();

        // List view specific structure check (optional, but good for regression)
        // Here we just ensure content is present
        expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('renders placeholder icon when no images provided', () => {
        const serviceWithoutImage = { ...mockService, images: [] };
        render(<ServiceCard service={serviceWithoutImage} />);

        // Plumbing icon
        expect(screen.getByText('🔧')).toBeInTheDocument();
    });

    it('handles missing organization name', () => {
        const serviceNoOrg = { ...mockService, organization: undefined };
        render(<ServiceCard service={serviceNoOrg} />);
        expect(screen.getByText('Provider')).toBeInTheDocument();
    });
});
