import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FoodItem } from "./food-item-card";
import { useEffect, useState } from "react";
import L from "leaflet";

const userLocationIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function LocationMarker({
  setUserPosition,
}: {
  setUserPosition: (position: L.LatLng) => void;
}) {
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 13 });

    map.on("locationfound", (e) => {
      setUserPosition(e.latlng);
      // Optionally add a marker for user's location
      L.marker(e.latlng, {icon: userLocationIcon}).addTo(map).bindPopup("You are here").openPopup();
    });

    map.on("locationerror", (e) => {
      console.error("Location error:", e.message);
      alert(
        "Could not find your location. Distance calculations will not be available."
      );
    });

    return () => {
      map.off("locationfound");
      map.off("locationerror");
    };
  }, [map, setUserPosition]);

  return null;
}

export default function MapView({ foodItems }: { foodItems: FoodItem[] }) {
  const [userPosition, setUserPosition] = useState<L.LatLng | null>(null);
  const calculateDistance = (lat1: number, lng1: number): number | null => {
    if (!userPosition) return null;

    const from = userPosition;
    const to = L.latLng(lat1, lng1);

    return from.distanceTo(to);
  };

  // Format distance for display
  const formatDistance = (distance: number | null): string => {
    if (distance === null) return "Distance unavailable";
    if (distance < 1000) {
      return `${Math.round(distance)} meters away`;
    } else {
      return `${(distance / 1000).toFixed(2)} km away`;
    }
  };
  return (
    <MapContainer
      center={[25.427804, 81.77164]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker setUserPosition={setUserPosition} />
      {foodItems.map(
        (item) =>
          // Only create markers for items that have valid coordinates
          item.pickupLatitude &&
          item.pickupLongitude && (
            <Marker
              key={item.id}
              position={[item.pickupLatitude, item.pickupLongitude]}
            >
              <Popup>
                <div>
                  <h3>{item.name}</h3>
                  <p>Quantity: {item.quantity}</p>
                  <p>
                    Expiry Date:{" "}
                    {new Date(item.expiryDate).toLocaleDateString()}
                  </p>
                  <p>Pickup Location: {item.pickupLocation}</p>
                  {item.donorName && <p>Donor: {item.donorName}</p>}
                  {/* Display distance if user position is available */}
                  {userPosition && (
                    <p className="text-blue-600 font-semibold mt-2">
                      {formatDistance(
                        calculateDistance(
                          item.pickupLatitude,
                          item.pickupLongitude
                        )
                      )}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
      )}
    </MapContainer>
  );
}
