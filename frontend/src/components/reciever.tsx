import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FoodItemCard, { FoodItem } from "./food-item-card";
import Pagination from "./pagination";
import RequestModal from "./request-modal";
import MapView from "./map";

interface RecipientPageProps {
  onLogout: () => void;
}

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  requestedQuantity: number;
  expiryDate: string;
  donorId: number;
  donorName: string;
  pickupLocation: string;
}

const RecipientPage: React.FC<RecipientPageProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  // Original states
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [itemsPerPage] = useState<number>(8);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterExpiringSoon, setFilterExpiringSoon] = useState<boolean>(false);
  const [mapView, setMapView] = useState<boolean>(false);
  const [distanceFilter, setDistanceFilter] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // New states for request functionality
  const [requestModalOpen, setRequestModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [filterByDonorId, setFilterByDonorId] = useState<number | null>(null);

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        setLoading(true);
        let response;
        if (distanceFilter && userLocation) {
          response = await axios.get(`http://localhost:8080/api/items/nearby`, {
            params: {
              lat: userLocation.lat,
              lng: userLocation.lng,
              distance: distanceFilter,
            },
          });
        } else {
          response = await axios.get<FoodItem[]>(
            "http://localhost:8080/api/items"
          );
        }
        console.log("API response:", response.data);
        setFoodItems(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (err) {
        setError("Failed to fetch food items. Please try again later.");
        console.error("Error fetching food items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodItems();
  }, [distanceFilter, userLocation]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);
  

  // Filter items based on search term, expiry filter, and donor filter
  const filteredItems = Array.isArray(foodItems)
    ? foodItems.filter((item) => {
        // Search filter
        const matchesSearch =
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase());

        // Expiring soon filter (items expiring within 3 days)
        const matchesExpiry = filterExpiringSoon
          ? (new Date(item.expiryDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24) <=
            3
          : true;

        // Donor filter
        const matchesDonor = filterByDonorId
          ? item.donorId === filterByDonorId
          : true;

        return matchesSearch && matchesExpiry && matchesDonor;
      })
    : [];

  console.log("Filtered items:", filteredItems);

  // Calculate pagination
  const pageCount = Math.ceil(filteredItems.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredItems.slice(offset, offset + itemsPerPage);

  console.log(pageCount, offset, currentItems);

  const handlePageChange = (selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected);
    // Scroll to top when changing page
    window.scrollTo(0, 0);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reset to first page when searching
  };

  const handleExpiryFilterChange = () => {
    setFilterExpiringSoon(!filterExpiringSoon);
    setCurrentPage(0); // Reset to first page when filtering
  };

  // Handle opening the request modal
  const handleRequestItem = (itemId: number) => {
    const item = foodItems.find((item) => item.id === itemId);
    if (item) {
      setSelectedItem(item);
      setRequestModalOpen(true);
    }
  };

  // Handle confirming an item request
  const handleConfirmRequest = (itemId: number, requestedQuantity: number) => {
    if (cartItems.length == 0) {
      setCurrentPage(0);
    }
    const item = foodItems.find((item) => item.id === itemId);
    if (item) {
      // Add item to cart
      const cartItem: CartItem = {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        requestedQuantity: requestedQuantity,
        expiryDate: item.expiryDate,
        donorId: item.donorId,
        donorName: item.donorName || "Unknown Donor", // Ensure donor name is available
        pickupLocation: item.pickupLocation,
      };

      // Check if item already exists in cart
      const existingItemIndex = cartItems.findIndex((i) => i.id === itemId);

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedCartItems = [...cartItems];
        updatedCartItems[existingItemIndex].requestedQuantity =
          requestedQuantity;
        setCartItems(updatedCartItems);
      } else {
        // Add new item
        setCartItems([...cartItems, cartItem]);
      }

      // Filter items by the same donor
      setFilterByDonorId(item.donorId);
    }
  };

  // Clear donor filter
  // const handleClearDonorFilter = () => {
  //   setFilterByDonorId(null);
  // };

  // Proceed to checkout
  const handleCheckout = () => {
    // Save cart items to localStorage or state management
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    // Navigate to checkout page
    navigate("/checkout");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center text-blue-700">
          Available Food Items
        </h1>
        <div className="flex items-center space-x-4">
          {cartItems.length > 0 && (
            <button
              onClick={handleCheckout}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              Checkout ({cartItems.length})
            </button>
          )}
          <button
            onClick={onLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Filter by donor notification */}
      {filterByDonorId && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>Showing items from the same donor</span>
          {/* <button 
            onClick={handleClearDonorFilter}
            className="text-blue-700 hover:text-blue-900 underline"
          >
            Clear filter
          </button> */}
        </div>
      )}

      {/* Search and filters */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            {/* View Toggle Switch */}
            <div className="flex items-center">
              <span className={`mr-2 text-sm ${!mapView ? "font-medium" : ""}`}>
                List
              </span>

              <label
                htmlFor="view-toggle"
                className="relative inline-block w-11 h-6 cursor-pointer"
              >
                <input
                  id="view-toggle"
                  type="checkbox"
                  className="sr-only peer"
                  checked={mapView}
                  onChange={() => setMapView((v) => !v)}
                />
                <div
                  className={`
        w-full h-full bg-gray-200 rounded-full 
        peer-checked:bg-blue-600 
        transition-colors
        after:content-[''] after:absolute after:top-0.5 after:left-0.5
        after:bg-white after:border-gray-300 after:border after:rounded-full
        after:h-5 after:w-5 after:transition-transform
        peer-checked:after:translate-x-full
      `}
                />
              </label>

              <span className={`ml-2 text-sm ${mapView ? "font-medium" : ""}`}>
                Map
              </span>
            </div>

            {/* Expiring Soon Toggle */}
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filterExpiringSoon}
                onChange={handleExpiryFilterChange}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-700">
                Expiring Soon
              </span>
            </label>
          </div>
          {/* Distance Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Within</span>
            <select
              value={distanceFilter || ""}
              onChange={(e) =>
                setDistanceFilter(
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="border rounded p-1 text-sm"
            >
              <option value="">Any distance</option>
              <option value="1">1 km</option>
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredItems.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No food items found
          </h3>
          <p className="mt-1 text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Food items grid */}
      {!loading && !error && !mapView && filteredItems.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentItems.map((item) => (
              <FoodItemCard
                key={item.id}
                item={item}
                onRequestItem={handleRequestItem}
                isInCart={cartItems.some((cartItem) => cartItem.id === item.id)}
              />
            ))}
          </div>

          {/* Results count */}
          <div className="mt-6 text-center text-gray-600">
            Showing {offset + 1}-
            {Math.min(offset + itemsPerPage, filteredItems.length)} of{" "}
            {filteredItems.length} items
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <Pagination
              pageCount={pageCount}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Map view */}
      {!loading && !error && mapView && filteredItems.length > 0 && (
        <MapView foodItems={filteredItems} />
      )}

      {/* Request Modal */}
      {selectedItem && (
        <RequestModal
          item={selectedItem}
          isOpen={requestModalOpen}
          onClose={() => setRequestModalOpen(false)}
          onConfirm={handleConfirmRequest}
        />
      )}
    </div>
  );
};

export default RecipientPage;
