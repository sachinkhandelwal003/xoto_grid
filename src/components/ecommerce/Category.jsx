import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import { apiService } from '../../manageApi/utils/custom.apiservice'; // path adjust kar lena

const Category = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.get(
          "/products/get-all-category",
          { limit: 100 }
        );

        let apiCategories = response?.data || [];

        apiCategories.sort((a, b) => {
          const nameA = (a.name || "").toLowerCase();
          const nameB = (b.name || "").toLowerCase();
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        });

        const formatted = apiCategories.map((cat, index) => {
          const name = cat.name || "Category";

          const imageUrl = cat.icon
            ? cat.icon
            : `https://via.placeholder.com/64?text=${name}`;

          return {
            id: cat._id || index + 1,
            name: name,
            icon: (
              <img
                src={imageUrl}
                alt={name}
                loading="lazy"
                // 👇 Yahan se brightness-0 aur invert hata diya hai
                className="w-full h-full object-contain p-1" 
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/64?text=Error";
                }}
              />
            ),
            color: getOriginalColor(index),
            isNew: false,
            isDeal: false,
          };
        });

        formatted.push({
          id: 999,
          name: "See More",
          icon: <FaPlus />,
          color: "from-gray-700 to-gray-500",
        });

        setCategories(formatted);
      } catch (err) {
        console.error("❌ Fetch failed:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

 const getOriginalColor = (index) => {
  const colors = [
    "from-[#5c039b] to-[#5c039b]",
    "from-[#5c039b] to-[#5c039b]",
    "from-[#5c039b] to-[#5c039b]",
    "from-[#5c039b] to-[#5c039b]",
    "from-[#5c039b] to-[#5c039b]",
    "from-[#5c039b] to-[#5c039b]",
    "from-[#5c039b] to-[#5c039b]",
    "from-[#5c039b] to-[#5c039b]",
    "from-[#5c039b] to-[#5c039b]",
    "from-[#5c039b] to-[#5c039b]",
    "from-[#5c039b] to-[#5c039b]",
    "from-[#5c039b] to-[#5c039b]",
    "from-[#5c039b] to-[#5c039b]",
  ];
  return colors[index % colors.length];
};

  const handleCategoryClick = (categoryName) => {
    const slug = categoryName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/&/g, "and");

    navigate(`/ecommerce/filter?category=${slug}`);
  };

  if (loading) {
    return (
      <div className='bg-[var(--color-body)]'>
        <div className="max-w-7xl mx-auto px-4 py-16 bg-[var(--color-body)]">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Shop by <span className="text-[var(--color-primary)]">Category</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Loading categories...
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div
                key={i}
                className="w-[140px] h-[140px] bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-[var(--color-body)]'>
      <div className="max-w-7xl mx-auto px-4 py-16 bg-[var(--color-body)]">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Shop by <span className="text-[var(--color-primary)]">Category</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse through our carefully curated furniture categories
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-6">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => handleCategoryClick(category.name)}
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative"
            >
              <div className="relative group flex flex-col items-center justify-center p-4 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 w-[140px] h-[140px] shrink-0">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shrink-0 overflow-hidden`}>
                  <div className="text-white text-2xl w-full h-full flex items-center justify-center">
                    {category.icon}
                  </div>
                </div>

                <div className="h-10 flex items-center justify-center">
                  <span className="text-[12px] sm:text-sm font-semibold text-gray-800 group-hover:text-[var(--color-primary)] transition-colors text-center leading-tight line-clamp-2">
                    {category.name}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Category;