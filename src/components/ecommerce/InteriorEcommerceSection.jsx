import React from "react";
import { motion } from "framer-motion";
import { FaCouch, FaPaintRoller, FaBoxes } from "react-icons/fa";

const InteriorEcommerceSection = () => {
  const features = [
    {
      icon: <FaCouch size={28} />,
      title: "Furniture & Furnishings",
      desc: "From sofas and beds to dining tables and more — shop curated collections for every room.",
    },
    {
      icon: <FaPaintRoller size={28} />,
      title: "Decor & Accessories",
      desc: "Lighting, curtains, vases, and everything in between to beautify your space.",
    },
    {
      icon: <FaBoxes size={28} />,
      title: "Materials & Essentials",
      desc: "Get plywood, laminates, tiles, and countertops from trusted material vendors.",
    },
  ];

  const products = [
    {
      id: 1,
      title: "Luxury Sofa Set",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
      price: "AED 2900",
    },
    {
      id: 2,
      title: "Contemporary Lamp",
      image: "https://www.homedecorcompany.in/cdn/shop/files/41xnFUmFvaL._AC.jpg?v=1714497193&width=1445",
      price: "AED 2,499",
    },
    {
      id: 3,
      title: "Wooden Coffee Table",
      image: "https://www.urbanwood.in//image/cache/catalog/coffee-tables/akin/honey/crop-400x281.jpg",
      price: "AED7,999",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      {/* Heading */}
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-[#2c1c0f] mb-4">
          We Also Provide E-Commerce Services for Interiors
        </h2>
        <p className="text-lg text-[#5c4535] max-w-2xl mx-auto">
          Like Flipkart but made exclusively for interior spaces. From decor to raw materials,
          get it all from trusted vendors in one place.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid md:grid-cols-3 gap-8 mb-20">
        {features.map((item, index) => (
          <motion.div
            key={index}
            className="bg-[#f9f6f3] rounded-xl p-6 text-center shadow-md hover:shadow-lg transition"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white p-4 inline-block rounded-full shadow-md mb-4">
              {item.icon}
            </div>
            <h3 className="text-xl font-semibold text-[#2c1c0f] mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-[#5c4535]">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Product Cards */}
      <h3 className="text-2xl font-bold text-[#2c1c0f] mb-8 text-center">
        Featured Products
      </h3>
      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-10">
        {products.map((product) => (
          <motion.div
            key={product.id}
            className="bg-white shadow-lg overflow-hidden border border-[#eee] hover:shadow-2xl transition"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.4 }}
          >
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-56 object-cover"
            />
            <div className="p-6">
              <h4 className="text-xl font-semibold text-[#2c1c0f] mb-2">
                {product.title}
              </h4>
              <p className="text-[#d97706] text-lg font-bold">{product.price}</p>
              <button className="mt-4 px-5 py-2 bg-[#d97706] text-white rounded-full text-sm font-medium hover:bg-[#bf6505] transition">
                Buy Now
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default InteriorEcommerceSection;
