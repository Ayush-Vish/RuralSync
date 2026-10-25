import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RootPage from "../page";

const mocks = vi.hoisted(() => ({
  getCurrentPosition: vi.fn(),
  getStoredCity: vi.fn(),
  getStoredLocation: vi.fn(),
  push: vi.fn(),
  reverseGeocode: vi.fn(),
  setLocation: vi.fn(),
  storeDetectedCity: vi.fn(),
  storeLocation: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/lib/geocoding", () => ({
  getStoredCity: mocks.getStoredCity,
  getStoredLocation: mocks.getStoredLocation,
  reverseGeocode: mocks.reverseGeocode,
  storeDetectedCity: mocks.storeDetectedCity,
  storeLocation: mocks.storeLocation,
}));

vi.mock("@/store/location-store", () => ({
  useLocationStore: (selector: (state: { setLocation: typeof mocks.setLocation }) => unknown) =>
    selector({ setLocation: mocks.setLocation }),
}));

vi.mock("@/components/location-search-input", () => ({
  LocationSearchInput: ({
    onLocationSelect,
  }: {
    onLocationSelect: (location: {
      lat: number;
      lng: number;
      city: string;
      displayName: string;
    }) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onLocationSelect({
          lat: 22.7196,
          lng: 75.8577,
          city: "Indore",
          displayName: "Indore, Madhya Pradesh",
        })
      }
    >
      Select Indore manually
    </button>
  ),
}));

describe("RootPage location selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getStoredCity.mockReturnValue(null);
    mocks.getStoredLocation.mockReturnValue(null);
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition: mocks.getCurrentPosition },
    });
  });

  it("does not redirect to a default city when permission is denied", async () => {
    mocks.getCurrentPosition.mockImplementation(
      (_success: PositionCallback, error: PositionErrorCallback) =>
        error({ code: 1 } as GeolocationPositionError)
    );

    render(<RootPage />);

    expect(await screen.findByText("Choose your location")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("permission was denied");
    expect(mocks.storeDetectedCity).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("allows manual selection while the permission request is pending", async () => {
    mocks.getCurrentPosition.mockImplementation(() => undefined);

    render(<RootPage />);
    fireEvent.click(screen.getByRole("button", { name: "Select Indore manually" }));

    await waitFor(() =>
      expect(mocks.push).toHaveBeenCalledWith(
        "/indore?lat=22.7196&lng=75.8577"
      )
    );
    expect(mocks.storeDetectedCity).toHaveBeenCalledWith("indore");
    expect(mocks.setLocation).toHaveBeenCalledWith({
      latitude: 22.7196,
      longitude: 75.8577,
      city: "indore",
      displayName: "Indore, Madhya Pradesh",
    });
    expect(mocks.storeLocation).toHaveBeenCalledWith({
      lat: 22.7196,
      lng: 75.8577,
      city: "indore",
      displayName: "Indore, Madhya Pradesh",
    });
  });
});
