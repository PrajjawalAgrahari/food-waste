import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

type Donor = {
  id: string;
  username: string;
};

function DonorList() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8080/api/users/donors",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDonors(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load donors");
        setLoading(false);
      }
    };

    fetchDonors();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading donors...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Support Food Donors</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {donors.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">No donors available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {donors.map((donor) => (
            <div
              key={donor.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">
                  {donor.username}
                </h2>
                {/* {donor.description && (
                  <p className="text-gray-600 mb-4">{donor.description}</p>
                )} */}
                <div className="flex justify-end">
                  <Link
                    to={`/donate/${donor.id}`}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Support This Donor
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DonorList;
