import { render, screen } from '@testing-library/react';
import MapView from '../MapView';
import { vi } from 'vitest';

// Mock Leaflet components since they rely on browser APIs
vi.mock('react-leaflet', () => ({
    MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div data-testid="tile-layer" />,
    Marker: ({ children }: any) => <div data-testid="marker">{children}</div>,
    Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
    useMap: () => ({
        setView: vi.fn(),
        getZoom: vi.fn().mockReturnValue(13),
    }),
    useMapEvents: () => null,
}));

// Mock Leaflet L
vi.mock('leaflet', () => ({
    default: {
        Icon: {
            Default: {
                prototype: { _getIconUrl: vi.fn() },
                mergeOptions: vi.fn(),
            }
        }
    }
}));

describe('Map Components', () => {
    describe('MapView', () => {
        it('renders map container with marker', async () => {
            render(<MapView latitude={10} longitude={20} address="Test Address" />);
            // We expect the map container to appear once mounted
            const mapContainer = await screen.findByTestId('map-container');
            expect(mapContainer).toBeInTheDocument();
            expect(screen.getByTestId('marker')).toBeInTheDocument();
            expect(screen.getByText('Test Address')).toBeInTheDocument();
        });
    });
});
