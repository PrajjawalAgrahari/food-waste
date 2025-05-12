// src/components/food-item-card.tsx
import React from 'react';
import { format } from 'date-fns';
import { FaMapMarkerAlt, FaCalendarAlt, FaUser } from 'react-icons/fa';

export interface FoodItem {
  id: number;
  donorId: number;
  donorName: string;
  name: string;
  quantity: number;
  expiryDate: string;
  pickupLocation: string;
  pickupLatitude: number | null;
  pickupLongitude: number | null;
  createdAt: string;
  availabilityTimeFrom: string;
  availabilityTimeTo: string;
}

interface FoodItemCardProps {
  item: FoodItem;
  onRequestItem: (itemId: number) => void;
  isInCart?: boolean;
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({ item, onRequestItem, isInCart = false }) => {
  // Format the expiry date
  const formattedDate = format(new Date(item.expiryDate), 'MMM dd, yyyy');
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h3>
        <div className="flex items-center text-gray-600 mb-2">
          <span className="font-medium mr-2">Quantity:</span> 
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{item.quantity} units</span>
        </div>
        <div className="flex items-center text-gray-600 mb-2">
          <FaCalendarAlt className="mr-2 text-orange-500" />
          <span>Expires on {formattedDate}</span>
        </div>
        <div className="flex items-start text-gray-600 mb-2">
          <FaMapMarkerAlt className="mr-2 mt-1 text-red-500" />
          <span>{item.pickupLocation}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <FaUser className="mr-2 text-blue-500" />
          <span>Donor: {item.donorName || 'Anonymous'}</span>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          <span className="font-medium">Available for pickup:</span> 
          {item.availabilityTimeFrom} - {item.availabilityTimeTo}
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Posted {format(new Date(item.createdAt), 'MMM dd, yyyy')}
        </span>
        <button 
          className={`px-4 py-2 rounded-md text-sm transition-colors ${
            isInCart 
              ? "bg-gray-400 text-white cursor-not-allowed" 
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
          onClick={() => onRequestItem(item.id)}
          disabled={isInCart}
        >
          {isInCart ? "Added to Cart" : "Request Item"}
        </button>
      </div>
    </div>
  );
};

export default FoodItemCard;
