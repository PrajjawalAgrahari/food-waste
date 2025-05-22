import React, { useState, useEffect } from "react";
import axios from "axios";

function DonorProfile() {
  const [profile, setProfile] = useState({
    id: "",
    username: "",
    email: "",
    role: "",
    homeLat: null,
    homeLon: null,
    availabilityTimeFrom: "",
    availabilityTimeTo: "",
    upiId: "",
    qrCodeUrl: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [qrPreview, setQrPreview] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("id");
        
        const response = await axios.get(`http://localhost:8080/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setProfile({
          ...response.data,
          upiId: response.data.upiId || "",
          qrCodeUrl: response.data.paymentQrCodeUrl || ""
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to load profile information");
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleChange = (e : any) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };

  const generateQrCode = () => {
    if (!profile.upiId) {
      setError("Please enter a UPI ID first");
      return;
    }
    
    // Generate QR code using a free API
    const upiLink = `upi://pay?pa=${profile.upiId}&pn=${encodeURIComponent(profile.username)}&cu=INR`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
    
    setQrPreview(qrApiUrl);
    setProfile({
      ...profile,
      qrCodeUrl: qrApiUrl
    });
  };

  const handleSubmit = async (e : any) => {
    e.preventDefault();
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      
      // Create a payload with only the fields from your User entity
      // plus the UPI fields we want to add
      const payload = {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        role: profile.role,
        homeLat: profile.homeLat,
        homeLon: profile.homeLon,
        availabilityTimeFrom: profile.availabilityTimeFrom,
        availabilityTimeTo: profile.availabilityTimeTo,
        upiId: profile.upiId,
        paymentQrCodeUrl: profile.qrCodeUrl
      };
      
      await axios.put(`http://localhost:8080/api/users/profile`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Donor Profile</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          {!isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 font-medium">Username:</span>
                      <p>{profile.username}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Email:</span>
                      <p>{profile.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Role:</span>
                      <p>{profile.role}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Location:</span>
                      <p>Lat: {profile.homeLat}, Lon: {profile.homeLon}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Availability:</span>
                      <p>
                        {profile.availabilityTimeFrom && profile.availabilityTimeTo 
                          ? `${profile.availabilityTimeFrom} - ${profile.availabilityTimeTo}`
                          : "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 font-medium">UPI ID:</span>
                      <p>{profile.upiId || "Not provided"}</p>
                    </div>
                    
                    {profile.qrCodeUrl && (
                      <div>
                        <span className="text-gray-600 font-medium">Payment QR Code:</span>
                        <div className="mt-2 border rounded p-4 inline-block">
                          <img src={profile.qrCodeUrl} alt="Payment QR Code" className="w-48 h-48" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={profile.username || ""}
                        onChange={handleChange}
                        className="border rounded p-2 w-full"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={profile.email || ""}
                        onChange={handleChange}
                        className="border rounded p-2 w-full"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Location (Latitude)</label>
                      <input
                        type="number"
                        name="homeLat"
                        value={profile.homeLat || ""}
                        onChange={handleChange}
                        className="border rounded p-2 w-full"
                        step="0.000001"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Location (Longitude)</label>
                      <input
                        type="number"
                        name="homeLon"
                        value={profile.homeLon || ""}
                        onChange={handleChange}
                        className="border rounded p-2 w-full"
                        step="0.000001"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Available From</label>
                      <input
                        type="time"
                        name="availabilityTimeFrom"
                        value={profile.availabilityTimeFrom || ""}
                        onChange={handleChange}
                        className="border rounded p-2 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Available To</label>
                      <input
                        type="time"
                        name="availabilityTimeTo"
                        value={profile.availabilityTimeTo || ""}
                        onChange={handleChange}
                        className="border rounded p-2 w-full"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-700 mb-1">UPI ID</label>
                      <input
                        type="text"
                        name="upiId"
                        value={profile.upiId || ""}
                        onChange={handleChange}
                        placeholder="yourname@upi"
                        className="border rounded p-2 w-full"
                      />
                    </div>
                    
                    {!qrPreview && profile.upiId && (
                      <button
                        type="button"
                        onClick={generateQrCode}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Generate QR Code
                      </button>
                    )}
                    
                    {(qrPreview || profile.qrCodeUrl) && (
                      <div>
                        <label className="block text-gray-700 mb-1">Payment QR Code</label>
                        <div className="border rounded p-4 inline-block">
                          <img 
                            src={qrPreview || profile.qrCodeUrl} 
                            alt="Payment QR Code" 
                            className="w-48 h-48" 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setQrPreview("");
                  }}
                  className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default DonorProfile;
