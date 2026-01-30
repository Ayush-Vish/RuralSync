import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LocationSearchInput } from '../location-search-input';
import { vi, Mock } from 'vitest';
import * as geocoding from '@/lib/geocoding';

// Mock dependencies
vi.mock('@/lib/geocoding');
vi.mock('@/hooks/use-debounce', () => ({
    useDebounce: (value: any) => value, // Instant debounce for tests
}));

describe('LocationSearchInput', () => {
    const mockOnLocationSelect = vi.fn();
    const mockOnClear = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders input with placeholder', () => {
        render(<LocationSearchInput onLocationSelect={mockOnLocationSelect} />);
        expect(screen.getByPlaceholderText('Search location...')).toBeInTheDocument();
    });

    it('updates query on input change', () => {
        render(<LocationSearchInput onLocationSelect={mockOnLocationSelect} />);
        const input = screen.getByPlaceholderText('Search location...');
        fireEvent.change(input, { target: { value: 'New York' } });
        expect(input).toHaveValue('New York');
    });

    it('calls searchPlaces when typing', async () => {
        (geocoding.searchPlaces as Mock).mockResolvedValue([
            { placeId: '1', displayName: 'New York', lat: 40, lng: -74, city: 'NYC' }
        ]);

        render(<LocationSearchInput onLocationSelect={mockOnLocationSelect} />);
        const input = screen.getByPlaceholderText('Search location...');
        fireEvent.change(input, { target: { value: 'New York' } });

        await waitFor(() => {
            expect(geocoding.searchPlaces).toHaveBeenCalledWith('New York', expect.any(Object));
        });

        expect(screen.getByText('New York')).toBeInTheDocument();
    });

    it('selects a location from results', async () => {
        const mockPlace = { placeId: '1', displayName: 'New York, USA', lat: 40, lng: -74, city: 'new-york' };
        (geocoding.searchPlaces as Mock).mockResolvedValue([mockPlace]);

        render(<LocationSearchInput onLocationSelect={mockOnLocationSelect} />);
        const input = screen.getByPlaceholderText('Search location...');
        fireEvent.change(input, { target: { value: 'New York' } });

        await waitFor(() => {
            expect(screen.getByText('New York, USA')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('New York, USA'));

        expect(mockOnLocationSelect).toHaveBeenCalledWith({
            lat: 40,
            lng: -74,
            city: 'new-york',
            displayName: 'New York, USA',
        });
    });

    it('detects GPS location', async () => {
        const mockPosition = { coords: { latitude: 12, longitude: 34 } };
        (geocoding.getCurrentPosition as Mock).mockResolvedValue(mockPosition);
        (geocoding.reverseGeocode as Mock).mockResolvedValue({
            city: 'gps-city',
            displayName: 'GPS Location',
        });

        render(<LocationSearchInput onLocationSelect={mockOnLocationSelect} showGpsButton={true} />);

        // Using role or text to find GPS button
        // The button has a Navigation icon and text 'GPS' (if not compact)
        const gpsButton = screen.getByRole('button', { name: /gps/i });
        fireEvent.click(gpsButton);

        await waitFor(() => {
            expect(geocoding.getCurrentPosition).toHaveBeenCalled();
            expect(geocoding.reverseGeocode).toHaveBeenCalledWith(12, 34);
        });

        expect(mockOnLocationSelect).toHaveBeenCalledWith({
            lat: 12,
            lng: 34,
            city: 'gps-city',
            displayName: 'GPS Location',
        });
    });

    it('clears input', () => {
        render(<LocationSearchInput value="Initial" onLocationSelect={mockOnLocationSelect} onClear={mockOnClear} />);

        // Type something to show the clear button (which appears when query is not empty)
        const input = screen.getByPlaceholderText('Search location...');
        fireEvent.change(input, { target: { value: 'Test Query' } });

        // The clear button is the small button inside the input wrapper
        // We can find it by finding all buttons in the component, excluding GPS button.
        // Or better, since we don't mock Lucide icons, they render as SVG.
        // We can interact with the button that calls handleClear.

        // Let's try to find the button that is NOT the GPS button.
        // GPS button usually has text GPS or specific class.
        // Clear button has standard p-1 class.

        // Let's rely on firing change -> finding the X icon?
        // But icons are imported from lucide-react. We didn't mock lucide-react in this file.
        // Real lucide icons render <svg>.

        // Let's interact with the button that is inside the input container but is not the GPS button.
        // The clear button is absolute positioned.
        const buttons = screen.getAllByRole('button');
        // Filter out GPS button if present (it has text/icon).
        // If we didn't enable GPS button in this test case?
        // This test case: render(<LocationSearchInput ... />) -> showGpsButton defaults to true.

        // Let's trust that the second button (or one of them) is the clear button.
        // GPS button is rendered SECOND in DOM order (after input wrapper)? No, input wrapper contains clear button.
        // <div relative> <Input/> {query && <button onClick={handleClear} ... />} </div>
        // <Button onClick={gps} ... />

        // So Clear button is before GPS button in DOM order? 
        // Component structure:
        // div (flex items-center gap-2)
        //   div (relative flex-1)
        //     Input
        //     Button (Clear) - if query
        //   Button (GPS)

        // So Clear button is indeed one of them.
        // Let's click the one that is NOT GPS.
        // GPS button has text "GPS" (hidden sm:inline) or Navigation icon.

        // Let's try to click the button that is inside the relative flex-1 container.
        // Or simpler: verify value clearing.

        // We will click the first button found, and see if it clears.
        // If it was GPS, it would trigger GPS location.
        // If it was Clear, it would clear input.

        // Let's try to find button with specific class 'absolute right-3'.
        // Testing library doesn't encourage class queries.

        // Let's just create a specific test setup where GPS is hidden.
        // But failing that, let's just trigger onClear directly? No, integration test style preferable.

        // Re-render without GPS button to be safe.
        // cleanup handled by testing-library automatically? No, we need to call render again or rerender.
    });

    it('clears input when clear button clicked', () => {
        const { container } = render(<LocationSearchInput value="Initial" onLocationSelect={mockOnLocationSelect} onClear={mockOnClear} showGpsButton={false} />);

        const input = screen.getByPlaceholderText('Search location...');
        fireEvent.change(input, { target: { value: 'Test' } });

        // Now only one button should be present (the clear button), as GPS is disabled.
        const buttons = screen.getAllByRole('button');
        const clearBtn = buttons[0];

        fireEvent.click(clearBtn);

        expect(input).toHaveValue('');
        expect(mockOnClear).toHaveBeenCalled();
    });
});
