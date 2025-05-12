// src/pages/ConfirmationPage.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format, parseISO, isValid } from "date-fns";

interface PickupRequest {
  id: number;
  receiverId: number;
  donorId: number;
  pickupDate: string;
  pickupTime: string;
  status: string;
  createdAt: string;
}

// Add this interface to handle the response structure
interface PickupResponse {
  requests: PickupRequest[];
}

const ConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pickupResponse = location.state?.pickupRequest as PickupResponse;

  console.log("Pickup Response:", pickupResponse);

  // Handle case where no pickup request is available
  if (!pickupResponse || !pickupResponse.requests || pickupResponse.requests.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-8 text-blue-700">
          Invalid Request
        </h1>
        <p className="mb-6">No pickup request information found.</p>
        <button
          onClick={() => navigate("/receiver")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Return to Food Items
        </button>
      </div>
    );
  }

  // Get the first pickup request from the array
  const pickupRequest = pickupResponse.requests[0];
  
  // Safely format the pickup date
  let pickupDateFormatted = "Date not available";
  try {
    if (pickupRequest.pickupDate) {
      const dateObj = parseISO(pickupRequest.pickupDate);
      if (isValid(dateObj)) {
        pickupDateFormatted = format(dateObj, 'EEEE, MMMM dd, yyyy');
      } else {
        // If parseISO fails, try direct date parsing
        const fallbackDate = new Date(pickupRequest.pickupDate);
        if (isValid(fallbackDate)) {
          pickupDateFormatted = format(fallbackDate, 'EEEE, MMMM dd, yyyy');
        } else {
          // If all parsing fails, just display the raw string
          pickupDateFormatted = pickupRequest.pickupDate;
        }
      }
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    // Fallback to the raw date string
    pickupDateFormatted = pickupRequest.pickupDate || "Date not available";
  }

  console.log("Formatted Pickup Date:", pickupDateFormatted);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white shadow-md rounded-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            Pickup Request Confirmed!
          </h1>
          <p className="text-gray-600">
            Your request has been successfully submitted.
          </p>
        </div>

        <div className="border-t border-b border-gray-200 py-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Pickup Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Pickup ID</p>
              <p className="font-medium">{pickupRequest.id}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                  {pickupRequest.status || "Pending"}
                </span>
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Pickup Date</p>
              <p className="font-medium">{pickupDateFormatted}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Pickup Time</p>
              <p className="font-medium">{pickupRequest.pickupTime}</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-6">
            Please arrive at the pickup location at the scheduled time. Bring
            this confirmation ID with you for verification.
          </p>

          <button
            onClick={() => navigate("/receiver")}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Return to Food Items
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
