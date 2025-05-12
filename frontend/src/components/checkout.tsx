// src/pages/CheckoutPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";

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

interface DonorAvailability {
  donorId: number;
  donorName: string;
  availabilityTimeFrom: string;
  availabilityTimeTo: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pickupDate, setPickupDate] = useState<string>("");
  const [pickupTime, setPickupTime] = useState<string>("");
  const [donorAvailability, setDonorAvailability] =
    useState<DonorAvailability | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [earliestExpiryDate, setEarliestExpiryDate] = useState<Date | null>(
    null
  );

  useEffect(() => {
    // Load cart items from localStorage
    const savedCartItems = localStorage.getItem("cartItems");
    if (savedCartItems) {
      const parsedItems = JSON.parse(savedCartItems) as CartItem[];
      setCartItems(parsedItems);

      // Find earliest expiry date
      if (parsedItems.length > 0) {
        const expiryDates = parsedItems.map(
          (item) => new Date(item.expiryDate)
        );
        const earliestDate = new Date(
          Math.min(...expiryDates.map((date) => date.getTime()))
        );
        setEarliestExpiryDate(earliestDate);

        // Set default pickup date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setPickupDate(format(tomorrow, "yyyy-MM-dd"));

        // Get donor availability
        fetchDonorAvailability(parsedItems[0].donorId);
      }
    }
    setLoading(false);
  }, []);

  // Fetch donor availability
  const fetchDonorAvailability = async (donorId: number) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/users/${donorId}`
      );
      if (response.data) {
        setDonorAvailability({
          donorId: response.data.id,
          donorName: response.data.username,
          availabilityTimeFrom: response.data.availabilityTimeFrom,
          availabilityTimeTo: response.data.availabilityTimeTo,
        });

        // Generate time slots based on donor availability
        generateTimeSlots(
          response.data.availabilityTimeFrom,
          response.data.availabilityTimeTo
        );
      }
    } catch (err) {
      setError("Failed to fetch donor availability. Please try again later.");
      console.error("Error fetching donor availability:", err);
    }
  };

  // Generate time slots based on donor availability (30 minute intervals)
  const generateTimeSlots = (startTime: string, endTime: string) => {
    const slots: string[] = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMinute <= endMinute)
    ) {
      slots.push(
        `${currentHour.toString().padStart(2, "0")}:${currentMinute
          .toString()
          .padStart(2, "0")}`
      );

      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }

    setAvailableTimeSlots(slots);
    if (slots.length > 0) {
      setPickupTime(slots[0]);
    }
  };

  // Handle pickup date change
  const handlePickupDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPickupDate(e.target.value);
  };

  // Handle pickup time change
  const handlePickupTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPickupTime(e.target.value);
  };

  // Calculate total items
  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.requestedQuantity,
    0
  );

  // Handle checkout submission
  const handleSubmitCheckout = async () => {
    try {
      setLoading(true);

      // Create pickup request object
      const pickupRequest = {
        receiverId: localStorage.getItem("id")
          ? parseInt(localStorage.getItem("id") as string)
          : 0, 
        donorId: cartItems[0].donorId,
        pickupDate,
        pickupTime,
        items: cartItems.map((item) => ({
          itemId: item.id,
          quantity: item.requestedQuantity,
        })),
      };

      // Send request to backend
      const response = await axios.post(
        "http://localhost:8080/api/pickup-requests",
        pickupRequest
      );

      if (response.status === 200 || response.status === 201) {
        // Clear cart
        localStorage.removeItem("cartItems");

        // Navigate to confirmation page
        navigate("/confirmation", { state: { pickupRequest: response.data } });
      }
    } catch (err) {
      setError("Failed to submit pickup request. Please try again later.");
      console.error("Error submitting pickup request:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">
        Checkout
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">
            Your cart is empty
          </h3>
          <button
            onClick={() => navigate("/receiver")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Browse Food Items
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2">
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Your Items</h2>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Item</th>
                      <th className="py-2 px-4 border-b text-left">Donor</th>
                      <th className="py-2 px-4 border-b text-left">Quantity</th>
                      <th className="py-2 px-4 border-b text-left">
                        Expires On
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{item.name}</td>
                        <td className="py-2 px-4 border-b">{item.donorName}</td>
                        <td className="py-2 px-4 border-b">
                          {item.requestedQuantity}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {format(new Date(item.expiryDate), "MMM dd, yyyy")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-right">
                <p className="text-gray-700">
                  Total Items:{" "}
                  <span className="font-semibold">{totalItems}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Pickup Details */}
          <div className="md:col-span-1">
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Pickup Details</h2>

              {donorAvailability && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Donor:</span>{" "}
                    {donorAvailability.donorName}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Available Hours:</span>{" "}
                    {donorAvailability.availabilityTimeFrom} -{" "}
                    {donorAvailability.availabilityTimeTo}
                  </p>
                  {earliestExpiryDate && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Items Expire By:</span>{" "}
                      {format(earliestExpiryDate, "MMM dd, yyyy")}
                    </p>
                  )}
                </div>
              )}

              <div className="mb-4">
                <label
                  htmlFor="pickupDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Pickup Date:
                </label>
                <input
                  type="date"
                  id="pickupDate"
                  value={pickupDate}
                  onChange={handlePickupDateChange}
                  min={format(new Date(), "yyyy-MM-dd")}
                  max={
                    earliestExpiryDate
                      ? format(earliestExpiryDate, "yyyy-MM-dd")
                      : undefined
                  }
                  className="border rounded p-2 w-full"
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="pickupTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Pickup Time:
                </label>
                <select
                  id="pickupTime"
                  value={pickupTime}
                  onChange={handlePickupTimeChange}
                  className="border rounded p-2 w-full"
                  required
                >
                  {availableTimeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSubmitCheckout}
                disabled={loading}
                className={`w-full py-2 px-4 rounded transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {loading ? "Processing..." : "Confirm Pickup"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
