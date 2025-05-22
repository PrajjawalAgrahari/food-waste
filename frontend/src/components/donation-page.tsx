import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

type Donor = {
  id: string;
  username: string;
  paymentQrCodeUrl: string;
  upiId: string;
};

function DonationPage() {
  const { donorId } = useParams();
  const navigate = useNavigate();
  const [donor, setDonor] = useState<Donor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState(100);
  const [message, setMessage] = useState("");
  const [donationStep, setDonationStep] = useState("form"); // form, payment, confirmation
  const [donationId, setDonationId] = useState(null);

  useEffect(() => {
    const fetchDonorInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8080/api/users/${donorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDonor(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load donor information");
        setLoading(false);
      }
    };

    fetchDonorInfo();
  }, [donorId]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const receiverId = localStorage.getItem("id");

      const response = await axios.post(
        "http://localhost:8080/api/donations/intent",
        {
          donorId,
          receiverId,
          amount,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDonationId(response.data.id);
      setDonationStep("payment");
    } catch (err) {
      console.error(err);
      setError("Failed to create donation intent");
    }
  };

  const handleConfirmPayment = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:8080/api/donations/confirm/${donationId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDonationStep("confirmation");
    } catch (err) {
      setError("Failed to confirm donation");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">Loading donor information...</div>
    );
  }

  if (!donor) {
    return (
      <div className="text-center py-10 text-red-600">Donor not found</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Support {donor.username}</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          {donationStep === "form" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  Donation Amount (₹)
                </label>
                <div className="flex space-x-2 mb-2">
                  {[50, 100, 200, 500].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`px-3 py-1 rounded ${
                        amount === value
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                      onClick={() => setAmount(value)}
                    >
                      ₹{value}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="border rounded px-3 py-2 w-full"
                  min="10"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  rows={3}
                  placeholder="Add a thank you message..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Proceed to Payment
                </button>
              </div>
            </form>
          )}

          {donationStep === "payment" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Make Payment</h2>
              <p className="mb-4">
                Please complete your payment using one of these methods:
              </p>

              {donor.paymentQrCodeUrl && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={donor.paymentQrCodeUrl}
                    alt="Payment QR Code"
                    className="w-48 h-48"
                  />
                </div>
              )}

              {donor.upiId && (
                <div className="mb-4">
                  <p className="font-medium">UPI ID:</p>
                  <div className="flex items-center border rounded p-2">
                    <span className="flex-grow">{donor.upiId}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(donor.upiId)}
                      className="text-blue-500"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-4">
                  After completing the payment, please click the button below to
                  confirm.
                </p>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                  >
                    I've Completed Payment
                  </button>
                </div>
              </div>
            </div>
          )}

          {donationStep === "confirmation" && (
            <div className="text-center py-6">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
              <p className="mb-6">Your donation has been recorded.</p>
              <button
                onClick={() => navigate("/receiver")}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Return to Food Items
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DonationPage;
