import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Tag, Button, Affix, Drawer } from 'antd';
import { VideoCameraOutlined, StarFilled, FilterOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { apiService } from '../../manageApi/utils/custom.apiservice';

import Filters from './Filters';
import ProductGrid from './ProductGrid';

const { Content } = Layout;

const ProductFilterPage = () => {

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortOption, setSortOption] = useState('most-popular');

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const isMobile = window.innerWidth < 992;

  /* ───────── FETCH METADATA ───────── */

  useEffect(() => {

    const fetchMetadata = async () => {

      try {

        const [catRes, brandRes] = await Promise.all([

          apiService.get("/products/get-all-category", { limit: 100 }),
          apiService.get("/products/get-all-brand", { limit: 100 })

        ]);

        if (catRes?.success) setCategories(catRes.data || []);
        if (brandRes?.success) setBrands(brandRes.data || []);

      } catch (err) {

        console.error(err);

      }

    };

    fetchMetadata();

  }, []);

  /* ───────── FETCH PRODUCTS ───────── */

  const fetchProducts = useCallback(async () => {

    setLoading(true);

    try {

      const params = {
        page: 1,
        limit: 500
      };

      if (selectedCategories.length)
        params.category_id = selectedCategories.join(',');

      if (selectedBrands.length)
        params.brand_id = selectedBrands.join(',');

      if (priceRange[0] > 0)
        params.min_price = priceRange[0];

      if (priceRange[1] < 50000)
        params.max_price = priceRange[1];

      const res = await apiService.get(
        "/products/get-all-products",
        params
      );

      if (res?.success) {
        setProducts(res?.data?.products || []);
      }

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  }, [selectedCategories, selectedBrands, priceRange]);

  useEffect(() => {

    fetchProducts();

  }, [fetchProducts]);

  const resetFilters = () => {

    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 50000]);

  };

  return (

    <Layout style={{ background: '#f8fafc', minHeight: '100vh' }}>

      <Content style={{ padding: '12px sm:0 16px md:0 24px' }}>

        {/* HERO SECTION */}

        <div
          className="relative rounded-xl sm:rounded-2xl overflow-hidden mt-6 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #420183 0%, #764ba2 100%)',
            height: isMobile ? 260 : 300
          }}
        >

          <div className="absolute inset-0 bg-black/20" />

          <div className="absolute top-4 right-4 z-20 sm:top-6 sm:right-6">

            <Tag color="gold" className="font-bold">
              New Collection
            </Tag>

          </div>

          <div className="relative z-10 h-full flex flex-col md:flex-row items-center justify-between p-6 sm:p-10 md:p-16">

            <div className="max-w-2xl text-center md:text-left">

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                  Discover Your Perfect Space
                </h1>

                <p className="text-white/90 text-base md:text-xl mb-6 max-w-xl mx-auto md:mx-0">
                  AI-curated furniture collections that blend modern design with timeless elegance.
                </p>

                <div className="flex flex-wrap gap-4 justify-center md:justify-start">

                  <Button size="large" className="!bg-white !text-black font-bold">
                    Shop New Arrivals
                  </Button>

                  <Button size="large" disabled className="!bg-white/10 !text-white">
                    <VideoCameraOutlined /> AR Preview
                  </Button>

                </div>

              </motion.div>

            </div>

            {/* Featured Image */}

            <div className="hidden lg:block relative">

              <img
                src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500"
                alt="Furniture"
                className="w-55 h-55 object-cover rounded-2xl shadow-2xl"
              />

              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-xl">

                <div className="text-center">

                  <div className="text-2xl font-bold text-purple-600">4.8</div>

                  <div className="flex justify-center">

                    {[...Array(5)].map((_, i) => (
                      <StarFilled key={i} className="text-yellow-500 text-sm" />
                    ))}

                  </div>

                  <div className="text-xs text-gray-600 mt-1">
                    Customer Rating
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ───────── MAIN CONTENT ───────── */}

        <div className="relative flex w-full gap-6 mt-9">

          {/* DESKTOP SIDEBAR */}

          {showFilters && !isMobile && (

            <div className="hidden lg:block lg:w-72 lg:shrink-0">

              <div className="lg:sticky lg:top-4">

                <Filters
                  categories={categories}
                  brands={brands}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  selectedBrands={selectedBrands}
                  setSelectedBrands={setSelectedBrands}
                  mobileFiltersOpen={mobileFiltersOpen}
                  setMobileFiltersOpen={setMobileFiltersOpen}
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  resetFilters={resetFilters}
                />

              </div>

            </div>

          )}

          {/* PRODUCT GRID */}

          <div className="flex-1 min-w-0">

            <ProductGrid
              products={products}
              loading={loading}
              showFilters={showFilters}
              sortOption={sortOption}
              setSortOption={setSortOption}
            />

          </div>

        </div>

        {/* MOBILE FILTER DRAWER */}

        <Drawer
          title="Filters"
          placement="left"
          open={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          width="85%"
        >

          <Filters
            categories={categories}
            brands={brands}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
            mobileFiltersOpen={mobileFiltersOpen}
            setMobileFiltersOpen={setMobileFiltersOpen}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            resetFilters={resetFilters}
          />

        </Drawer>

        {(isMobile || !showFilters) && (

          <Affix offsetBottom={24}>

            <Button
              type="primary"
              size="large"
              icon={<FilterOutlined />}
              onClick={() =>
                isMobile
                  ? setMobileFiltersOpen(true)
                  : setShowFilters(true)
              }
              style={{
                height: 52,
                borderRadius: 50,
                background: '#5C039B',
                border: 'none',
                fontWeight: 600
              }}
            >
              {isMobile ? "Filters" : "Show Filters"}
            </Button>

          </Affix>

        )}

      </Content>

    </Layout>

  );

};

export default ProductFilterPage;