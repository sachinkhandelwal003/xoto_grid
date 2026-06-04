import React, { useEffect, useState } from "react";
import axios from "axios";

const MyListings = () => {
  const [properties, setProperties] = useState([]);

 const fetchProperties = async () => {
  try {
    const token = localStorage.getItem("token"); // 👈 yeh zaruri hai

    const res = await axios.get("/api/property/my", {
      headers: {
        Authorization: `Bearer ${token}`, 
         "Cache-Control": "no-cache" 
      },
    });

   setProperties(res.data.data || []);
  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Listings</h1>

      {(properties || []).length === 0 ? (
        <p>No properties found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {properties.map((item) => (
            <div
              key={item._id}
              className="border rounded-xl shadow p-4"
            >
              <img
                src={item.photos?.[0] || "https://via.placeholder.com/300"}
                alt="property"
                className="w-full h-40 object-cover rounded-md"
              />

              <h2 className="text-lg font-semibold mt-2">
                {item.projectName || "No Name"}
              </h2>

              <p>₹ {item.price || "N/A"}</p>
              <p>{item.area || 0} sqft</p>

              <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                {item.approvalStatus || "draft"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;