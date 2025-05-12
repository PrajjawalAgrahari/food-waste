import { useState, useEffect, JSX } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface FoodItem {
  id: number;
  name: string;
  quantity: number;
  expiryDate: string;
  pickupLocation: string;
  pickupLatitude: number | null;
  pickupLongitude: number | null;
  createdAt: string;
}

function DonorDashboard({ onLogout }: { onLogout: () => void }): JSX.Element {
  const navigate = useNavigate();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availabilityTimeFrom, setAvailabilityTimeFrom] =
    useState<string>("09:00");
  const [availabilityTimeTo, setAvailabilityTimeTo] = useState<string>("17:00");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateSuccess, setUpdateSuccess] = useState<string>("");

  const donorId = localStorage.getItem("id")
    ? parseInt(localStorage.getItem("id") as string)
    : 0;

  // Fetch donor's food items and availability times
  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        setLoading(true);
        // Fetch food items
        const itemsResponse = await axios.get(
          `http://localhost:8080/api/items/${donorId}`
        );
        setFoodItems(
          Array.isArray(itemsResponse.data) ? itemsResponse.data : []
        );

        // Fetch user profile to get availability times
        const userResponse = await axios.get(
          `http://localhost:8080/api/users/${donorId}`
        );
        if (userResponse.data) {
          setAvailabilityTimeFrom(
            userResponse.data.availabilityTimeFrom || "09:00"
          );
          setAvailabilityTimeTo(
            userResponse.data.availabilityTimeTo || "17:00"
          );
        }

        setError(null);
      } catch (err) {
        setError("Failed to fetch your data. Please try again later.");
        console.error("Error fetching donor data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonorData();
  }, [donorId]);

  // Update availability time
  const handleUpdateAvailability = async () => {
    if (!availabilityTimeFrom || !availabilityTimeTo) {
      setError("Please specify both from and to times for your availability");
      return;
    }

    setIsUpdating(true);
    try {
      console.log("Updating availability time:", {
        availabilityTimeFrom,
        availabilityTimeTo,
      });
      await axios.patch(
        `http://localhost:8080/api/users/${donorId}/availability`,
        {
          availabilityTimeFrom,
          availabilityTimeTo,
        }
      );
      setUpdateSuccess("Your availability time has been updated successfully!");
      setTimeout(() => setUpdateSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update availability time. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">Donor Dashboard</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate("/donor-pending-deliveries")}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
          >
            Pending Deliveries
          </button>
          <button
            onClick={onLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Availability Time Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Pickup Availability</h2>

        {updateSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {updateSuccess}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow">
            <label
              htmlFor="availabilityTimeFrom"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Available From:
            </label>
            <input
              type="time"
              id="availabilityTimeFrom"
              value={availabilityTimeFrom}
              onChange={(e) => setAvailabilityTimeFrom(e.target.value)}
              className="border rounded p-2"
              min="00:00"
              max="23:59"
            />
          </div>
          <div className="flex-grow">
            <label
              htmlFor="availabilityTimeTo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Available To:
            </label>
            <input
              type="time"
              id="availabilityTimeTo"
              value={availabilityTimeTo}
              onChange={(e) => setAvailabilityTimeTo(e.target.value)}
              className="border rounded p-2"
              min="00:00"
              max="23:59"
            />
          </div>
          <button
            onClick={handleUpdateAvailability}
            disabled={isUpdating}
            className={`px-6 py-2 rounded transition ${
              isUpdating
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isUpdating ? "Updating..." : "Update Availability"}
          </button>
        </div>
      </div>

      {/* Food Items Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Your Food Donations</h2>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : foodItems.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              You haven't posted any food items yet.
            </p>
            <button
              onClick={() => (window.location.href = "/donor")}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Donate Food Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Food Item</th>
                  <th className="py-2 px-4 border-b text-left">Quantity</th>
                  <th className="py-2 px-4 border-b text-left">Expiry Date</th>
                  <th className="py-2 px-4 border-b text-left">
                    Pickup Location
                  </th>
                  <th className="py-2 px-4 border-b text-left">Posted On</th>
                </tr>
              </thead>
              <tbody>
                {foodItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{item.name}</td>
                    <td className="py-2 px-4 border-b">{item.quantity}</td>
                    <td className="py-2 px-4 border-b">
                      {format(new Date(item.expiryDate), "MMM dd, yyyy")}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {item.pickupLocation}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {format(new Date(item.createdAt), "MMM dd, yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DonorDashboard;
