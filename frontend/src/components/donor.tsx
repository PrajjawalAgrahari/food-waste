import { useState, ChangeEvent, FormEvent, JSX } from "react";
import axios from "axios";

// Define interfaces for our data structures
interface FoodItem {
  name: string;
  quantity: string;
  expiryDate: string;
  pickupLocation: string;
  pickupLatitude: string;
  pickupLongitude: string;
}

interface FormattedFoodItem {
  donorId: number;
  name: string;
  quantity: number;
  expiryDate: Date;
  pickupLocation: string;
  pickupLatitude: number | null;
  pickupLongitude: number | null;
}

function Donor({ onLogout }: { onLogout(): void }): JSX.Element {
  const [donorId, setDonorId] = useState<number>(
    localStorage.getItem("id")
      ? parseInt(localStorage.getItem("id") as string)
      : 0
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [foodItems, setFoodItems] = useState<FoodItem[]>([
    {
      name: "",
      quantity: "",
      expiryDate: "",
      pickupLocation: "",
      pickupLatitude: "",
      pickupLongitude: "",
    },
  ]);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);

  const handleChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const values = [...foodItems];
    const { name, value } = event.target;
    values[index] = {
      ...values[index],
      [name]: value,
    };
    setFoodItems(values);
  };

  const handleAddMore = (): void => {
    setFoodItems([
      ...foodItems,
      {
        name: "",
        quantity: "",
        expiryDate: "",
        pickupLocation: "",
        pickupLatitude: "",
        pickupLongitude: "",
      },
    ]);
  };

  const handleRemove = (index: number): void => {
    const values = [...foodItems];
    values.splice(index, 1);
    setFoodItems(values);
  };

  const validateForm = (): boolean => {
    for (const item of foodItems) {
      if (
        !item.name ||
        !item.quantity ||
        !item.expiryDate ||
        !item.pickupLocation
      ) {
        setErrorMessage(
          "Please fill in all required fields for each food item"
        );
        return false;
      }
    }
    return true;
  };

  const getCurrentLocation = (): void => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success handler
          const { latitude, longitude } = position.coords;

          // Create a copy of the current food items
          const updatedFoodItems = [...foodItems];

          // Update the last item in the array with the coordinates
          const lastIndex = updatedFoodItems.length - 1;
          updatedFoodItems[lastIndex] = {
            ...updatedFoodItems[lastIndex],
            pickupLatitude: latitude.toString(),
            pickupLongitude: longitude.toString(),
          };

          setFoodItems(updatedFoodItems);
          setIsLoadingLocation(false);
        },
        (error) => {
          // Error handler
          console.error("Error getting location:", error);
          setErrorMessage(
            "Unable to retrieve your location. Please enter coordinates manually."
          );
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      setErrorMessage(
        "Geolocation is not supported by your browser. Please enter coordinates manually."
      );
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Reset messages
    setSuccessMessage("");
    setErrorMessage("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Prepare data for API
    const formattedItems: FormattedFoodItem[] = foodItems.map((item) => ({
      donorId: donorId,
      name: item.name,
      quantity: parseInt(item.quantity, 10),
      expiryDate: new Date(item.expiryDate),
      pickupLocation: item.pickupLocation,
      pickupLatitude: item.pickupLatitude
        ? parseFloat(item.pickupLatitude)
        : null,
      pickupLongitude: item.pickupLongitude
        ? parseFloat(item.pickupLongitude)
        : null,
    }));

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8080/api/add-items", formattedItems, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccessMessage("Food items added successfully!");
      setFoodItems([
        {
          name: "",
          quantity: "",
          expiryDate: "",
          pickupLocation: "",
          pickupLatitude: "",
          pickupLongitude: "",
        },
      ]);
    } catch (error) {
      const axiosError = error as any; // Type assertion for axios error
      setErrorMessage(
        `Error submitting food items: ${
          axiosError.response?.data?.message || axiosError.message
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-blue-700">
        Donate Food Items
      </h1>
      <div>
        <button
          onClick={() => (window.location.href = "/donor-dashboard")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mr-2"
        >
          View Dashboard
        </button>
        <button
          onClick={onLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="mb-4 grid grid-cols-6 gap-4 font-semibold text-gray-700">
            <div className="col-span-1">Name*</div>
            <div className="col-span-1">Quantity*</div>
            <div className="col-span-1">Expiry Date*</div>
            <div className="col-span-1">Pickup Location*</div>
            <div className="col-span-1">Latitude</div>
            <div className="col-span-1">Longitude</div>
          </div>

          {foodItems.map((item, index) => (
            <div
              key={index}
              className="mb-4 grid grid-cols-6 gap-4 items-center"
            >
              <div className="col-span-1">
                <input
                  type="text"
                  name="name"
                  placeholder="Food name"
                  value={item.name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    handleChange(index, event)
                  }
                  className="border rounded p-2 w-full"
                  required
                />
              </div>

              <div className="col-span-1">
                <input
                  type="number"
                  name="quantity"
                  placeholder="Amount"
                  value={item.quantity}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    handleChange(index, event)
                  }
                  className="border rounded p-2 w-full"
                  min="1"
                  required
                />
              </div>

              <div className="col-span-1">
                <input
                  type="date"
                  name="expiryDate"
                  value={item.expiryDate}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    handleChange(index, event)
                  }
                  className="border rounded p-2 w-full"
                  required
                />
              </div>

              <div className="col-span-1">
                <input
                  type="text"
                  name="pickupLocation"
                  placeholder="Address"
                  value={item.pickupLocation}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    handleChange(index, event)
                  }
                  className="border rounded p-2 w-full"
                  required
                />
              </div>

              <div className="col-span-1">
                <input
                  type="text"
                  name="pickupLatitude"
                  placeholder="Latitude"
                  value={item.pickupLatitude}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    handleChange(index, event)
                  }
                  className="border rounded p-2 w-full"
                />
              </div>

              <div className="col-span-1 flex items-center">
                <input
                  type="text"
                  name="pickupLongitude"
                  placeholder="Longitude"
                  value={item.pickupLongitude}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    handleChange(index, event)
                  }
                  className="border rounded p-2 w-full"
                />

                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isLoadingLocation}
                  className={`ml-2 p-2 rounded ${
                    isLoadingLocation
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white`}
                  title="Get current location"
                >
                  {isLoadingLocation ? (
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>

                {foodItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleAddMore}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add More
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded transition ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit All Items"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Donor;
