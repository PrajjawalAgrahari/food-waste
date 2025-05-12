import { useState, useEffect, JSX } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface PickupRequest {
  id: number;
  receiverId: number;
  receiverName: string;
  donorId: number;
  foodItemId: number;
  foodItemName: string;
  pickupDate: string;
  pickupTime: string;
  quantity: number;
  status: string;
  deliveryNumber: string;
  createdAt: string;
}

type GroupedDeliveries = {
  [deliveryNumber: string]: PickupRequest[];
};

function DonorPendingDeliveries({ onLogout }: { onLogout: () => void }): JSX.Element {
  const [groupedDeliveries, setGroupedDeliveries] = useState<GroupedDeliveries>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const navigate = useNavigate();

  const donorId = localStorage.getItem("id") ? parseInt(localStorage.getItem("id") as string) : 0;

  useEffect(() => {
    const fetchPendingDeliveries = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/pickup-requests/donor/${donorId}`);
        // Only keep PENDING or CONFIRMED
        const pendingRequests = response.data.requests.filter((req: PickupRequest) =>
          req.status === 'PENDING' || req.status === 'CONFIRMED'
        );
        // Group by deliveryNumber
        const grouped: GroupedDeliveries = {};
        pendingRequests.forEach((req: PickupRequest) => {
          if (!grouped[req.deliveryNumber]) grouped[req.deliveryNumber] = [];
          grouped[req.deliveryNumber].push(req);
        });
        setGroupedDeliveries(grouped);
        setError(null);
      } catch (err) {
        setError('Failed to fetch pending deliveries. Please try again later.');
        console.error('Error fetching pending deliveries:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingDeliveries();
  }, [donorId]);

  // Handle marking an entire delivery as delivered/cancelled
  const handleUpdateDeliveryStatus = async (deliveryNumber: string, status: string) => {
    try {
      await axios.patch(`http://localhost:8080/api/pickup-requests/delivery-number/${deliveryNumber}/status`, {status});
      // Remove this delivery group from the UI
      setGroupedDeliveries(prev =>
        Object.fromEntries(Object.entries(prev).filter(([num]) => num !== deliveryNumber))
      );
      setSuccessMessage(`Delivery ${deliveryNumber} marked as ${status.toLowerCase()}!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(`Failed to update delivery status. Please try again.`);
      console.error('Error updating delivery status:', err);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">Pending Deliveries</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/donor-dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Dashboard
          </button>
          <button 
            onClick={onLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : Object.keys(groupedDeliveries).length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">You don't have any pending deliveries.</p>
        </div>
      ) : (
        Object.entries(groupedDeliveries).map(([deliveryNumber, requests]) => (
          <div key={deliveryNumber} className="bg-white shadow-md rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-blue-800">Delivery #{deliveryNumber}</h2>
                <span className="text-gray-500 text-sm">
                  {requests[0].receiverName ? `Receiver: ${requests[0].receiverName}` : ""}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdateDeliveryStatus(deliveryNumber, 'DELIVERED')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition"
                >
                  Mark Delivered
                </button>
                <button
                  onClick={() => handleUpdateDeliveryStatus(deliveryNumber, 'CANCELLED')}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                >
                  Cancel Delivery
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Item</th>
                    <th className="py-2 px-4 border-b text-left">Quantity</th>
                    <th className="py-2 px-4 border-b text-left">Pickup Date</th>
                    <th className="py-2 px-4 border-b text-left">Pickup Time</th>
                    <th className="py-2 px-4 border-b text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{delivery.foodItemName}</td>
                      <td className="py-2 px-4 border-b">{delivery.quantity}</td>
                      <td className="py-2 px-4 border-b">{format(new Date(delivery.pickupDate), 'MMM dd, yyyy')}</td>
                      <td className="py-2 px-4 border-b">{delivery.pickupTime}</td>
                      <td className="py-2 px-4 border-b">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          delivery.status === 'PENDING' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {delivery.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default DonorPendingDeliveries;
