import { useState, useEffect, JSX } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface PickupRequest {
  id: number;
  receiverId: number;
  donorId: number;
  donorName: string;
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

function ReceiverPendingDeliveries({ onLogout }: { onLogout: () => void }): JSX.Element {
  const [groupedDeliveries, setGroupedDeliveries] = useState<GroupedDeliveries>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const receiverId = localStorage.getItem("id") ? parseInt(localStorage.getItem("id") as string) : 0;
  
  // Fetch pending deliveries for the receiver
  useEffect(() => {
    const fetchPendingDeliveries = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/pickup-requests/receiver/${receiverId}`);
        console.log('Pending deliveries response:', response.data);
        
        // Only keep PENDING or CONFIRMED statuses
        // const pendingRequests = response.data.filter((req: PickupRequest) =>
        //   req.status === 'PENDING' || req.status === 'CONFIRMED'
        // );
        
        // Group by deliveryNumber
        const grouped: GroupedDeliveries = {};
        response.data.requests.forEach((req: PickupRequest) => {
          if (!grouped[req.deliveryNumber]) {
            grouped[req.deliveryNumber] = [];
          }
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
  }, [receiverId]);
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">My Pending Deliveries</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/receiver')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Browse Food Items
          </button>
          <button 
            onClick={onLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : Object.keys(groupedDeliveries).length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500">You don't have any pending deliveries.</p>
        </div>
      ) : (
        Object.entries(groupedDeliveries).map(([deliveryNumber, requests]) => (
          <div key={deliveryNumber} className="bg-white shadow-md rounded-lg p-6 mb-8">
            <div className="mb-4">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-blue-800">Delivery #{deliveryNumber}</h2>
                <span className="ml-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  {requests[0].status}
                </span>
              </div>
              <div className="mt-2 text-gray-600">
                <p><span className="font-medium">Pickup Date:</span> {formatDate(requests[0].pickupDate)}</p>
                <p><span className="font-medium">Pickup Time:</span> {requests[0].pickupTime}</p>
                <p><span className="font-medium">Donor:</span> {requests[0].donorName || 'Unknown'}</p>
                <p><span className="font-medium">Pickup Location:</span> {requests[0].pickupLocation || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Item</th>
                    <th className="py-2 px-4 border-b text-left">Quantity</th>
                    <th className="py-2 px-4 border-b text-left">Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{delivery.foodItemName}</td>
                      <td className="py-2 px-4 border-b">{delivery.quantity}</td>
                      <td className="py-2 px-4 border-b">{formatDate(delivery?.expiryDate)}</td>
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

export default ReceiverPendingDeliveries;
