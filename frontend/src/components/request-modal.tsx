// src/components/RequestModal.tsx
import React, { useState } from 'react';
import { FoodItem } from './food-item-card';

interface RequestModalProps {
  item: FoodItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (itemId: number, quantity: number) => void;
}

const RequestModal: React.FC<RequestModalProps> = ({ item, isOpen, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState<number>(item.quantity);
  
  if (!isOpen) return null;
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= item.quantity) {
      setQuantity(value);
    }
  };
  
  const handleConfirm = () => {
    onConfirm(item.id, quantity);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Request Item</h2>
        <div className="mb-4">
          <p className="font-medium">{item.name}</p>
          <p className="text-gray-600">Available: {item.quantity} units</p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Select Quantity:
          </label>
          <input
            type="number"
            id="quantity"
            min="1"
            max={item.quantity}
            defaultValue={item.quantity}
            onChange={handleQuantityChange}
            className="border rounded p-2 w-full"
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Confirm Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestModal;
