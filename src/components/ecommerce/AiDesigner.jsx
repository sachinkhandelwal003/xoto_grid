import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, FaSearch, FaTimes, FaCouch, FaInfoCircle, 
  FaPen, FaHeart, FaBars, FaUndo, FaShareAlt, 
  FaTrash, FaEllipsisH, FaPlus, FaMinus, FaArrowsAlt 
} from 'react-icons/fa';

const AiDesigner = ({ isOpen, onClose }) => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('Living Room');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [placedItems, setPlacedItems] = useState([]);
  const [activeTool, setActiveTool] = useState('select');
  const productsRef = useRef(null);
  const roomImageRef = useRef(null);

  // Room and product data
  const rooms = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Dining Room'];
  
  const products = [
    {
      id: 1,
      name: 'HAVSTA',
      description: 'Coffee table, gray, 39x22 inches',
      price: '$179.99',
      image: 'https://storage.googleapis.com/a1aa/image/d950a094-36ed-4eb1-7d28-5e92779d69e2.jpg',
      category: 'Tables',
      dimensions: { width: 39, height: 22, depth: 39 }
    },
    {
      id: 2,
      name: 'HAVSTA',
      description: 'Coffee table, dark brown, 39x22 inches',
      price: '$179.99',
      image: 'https://storage.googleapis.com/a1aa/image/41df53e0-4002-43ad-37d3-63420ebd4952.jpg',
      category: 'Tables',
      dimensions: { width: 39, height: 22, depth: 39 }
    },
    {
      id: 3,
      name: 'KRAGSTA',
      description: 'Coffee table, white, 35 inches diameter',
      price: '$99.99',
      image: 'https://storage.googleapis.com/a1aa/image/15199eee-c331-4508-1963-a087d62a7d64.jpg',
      category: 'Tables',
      dimensions: { width: 35, height: 35, depth: 35 }
    },
    {
      id: 4,
      name: 'GLADOM',
      description: 'Tray table, black, 17 1/4 inches diameter',
      price: '$24.99',
      image: 'https://storage.googleapis.com/a1aa/image/90c2fa2e-1aa1-4f0d-ce2a-8bf406b827ac.jpg',
      category: 'Tables',
      dimensions: { width: 17.25, height: 17.25, depth: 17.25 }
    },
    {
      id: 5,
      name: 'GLADOM',
      description: 'Tray table, green, 17 1/4 inches diameter',
      price: '$24.99',
      image: 'https://storage.googleapis.com/a1aa/image/5c2a0461-94ce-437e-067d-936bb5124094.jpg',
      category: 'Tables',
      dimensions: { width: 17.25, height: 17.25, depth: 17.25 }
    },
    {
      id: 6,
      name: 'LACK',
      description: 'Side table, white, 21 5/8 inches square',
      price: '$12.99',
      image: 'https://storage.googleapis.com/a1aa/image/cebe8197-154f-4de9-2a13-e12ee20bb327.jpg',
      category: 'Tables',
      dimensions: { width: 21.625, height: 21.625, depth: 21.625 }
    },
    {
      id: 7,
      name: 'POÄNG',
      description: 'Armchair, birch veneer/black',
      price: '$129.00',
      image: 'https://storage.googleapis.com/a1aa/image/poang-armchair.jpg',
      category: 'Chairs',
      dimensions: { width: 28, height: 34, depth: 35 }
    },
    {
      id: 8,
      name: 'STRANDMON',
      description: 'Wing chair, Nordvalla dark gray',
      price: '$249.00',
      image: 'https://storage.googleapis.com/a1aa/image/strandmon-wing-chair.jpg',
      category: 'Chairs',
      dimensions: { width: 35, height: 40, depth: 38 }
    },
  ];

  const roomImages = {
    'Living Room': 'https://storage.googleapis.com/a1aa/image/9340dbaf-a1c8-4026-0b6a-9894f0ff89fd.jpg',
    'Bedroom': 'https://storage.googleapis.com/a1aa/image/bedroom-placeholder.jpg',
    'Kitchen': 'https://storage.googleapis.com/a1aa/image/kitchen-placeholder.jpg',
    'Bathroom': 'https://storage.googleapis.com/a1aa/image/bathroom-placeholder.jpg',
    'Dining Room': 'https://storage.googleapis.com/a1aa/image/dining-room-placeholder.jpg',
  };

  // Filtering logic
  const categories = [...new Set(products.map(product => product.category))];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProducts = products.filter(
    (product) =>
      (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       product.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedCategory === 'All' || product.category === selectedCategory)
  );

  // Handle drag events
  const handleDragStart = (product) => {
    setSelectedProduct(product);
    setIsDragging(true);
  };

  const handleDragEnd = (e) => {
    if (roomImageRef.current && selectedProduct) {
      const rect = roomImageRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Only add if dropped within the room image
      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        setPlacedItems([...placedItems, {
          ...selectedProduct,
          position: { x, y },
          rotation: 0,
          scale: 1
        }]);
      }
    }
    
    setIsDragging(false);
    setSelectedProduct(null);
  };

  const handleRemoveItem = (id) => {
    setPlacedItems(placedItems.filter(item => item.id !== id));
  };

  // Zoom functionality
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  // Scroll to top when search changes
  useEffect(() => {
    if (productsRef.current) {
      productsRef.current.scrollTop = 0;
    }
  }, [searchQuery, selectedCategory]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50"
            onClick={onClose}
          />

          {/* Full-Screen Modal Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 w-full h-full bg-white z-50 flex overflow-hidden"
          >
            {/* Left Room Selector */}
            <div className="w-48 bg-gray-50 border-r border-gray-300 flex flex-col">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-300">
                <h1 className="text-lg font-bold text-gray-800">Room Planner</h1>
                <button
                  onClick={onClose}
                  className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FaArrowLeft className="text-xs" />
                  <span>Close</span>
                </button>
              </div>
              <div className="flex-grow p-4 overflow-y-auto">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Room</h3>
                {rooms.map((room) => (
                  <button
                    key={room}
                    onClick={() => {
                      setSelectedRoom(room);
                      setPlacedItems([]);
                    }}
                    className={`block w-full text-left px-3 py-2 text-sm rounded mb-1 transition-colors ${
                      selectedRoom === room
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {room}
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-gray-300">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Room Dimensions</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Width: 12 ft</p>
                  <p>Length: 15 ft</p>
                  <p>Height: 9 ft</p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow flex flex-col relative">
              {/* Top Toolbar */}
              <div className="flex justify-between items-center py-2 px-4 border-b border-gray-300 bg-white">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">Tools:</span>
                  <button 
                    onClick={() => setActiveTool('select')}
                    className={`p-2 rounded ${activeTool === 'select' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    title="Select tool"
                  >
                    <FaArrowsAlt />
                  </button>
                  <button 
                    onClick={() => setActiveTool('place')}
                    className={`p-2 rounded ${activeTool === 'place' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    title="Place tool"
                  >
                    <FaPlus />
                  </button>
                  <button 
                    onClick={() => setActiveTool('delete')}
                    className={`p-2 rounded ${activeTool === 'delete' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    title="Delete tool"
                  >
                    <FaTrash />
                  </button>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 50}
                      className={`p-1 rounded ${zoomLevel <= 50 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <FaMinus />
                    </button>
                    <span className="text-sm text-gray-700">{zoomLevel}%</span>
                    <button 
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 200}
                      className={`p-1 rounded ${zoomLevel >= 200 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <button className="rounded-full bg-blue-600 text-white px-4 py-1 text-sm font-semibold hover:bg-blue-700 transition-colors">
                    Save Design
                  </button>
                </div>
              </div>

              {/* Room Label */}
              <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300 bg-white">
                <span className="text-sm font-semibold text-gray-700">{selectedRoom}</span>
                <span className="text-xs text-gray-500">{placedItems.length} items placed</span>
              </div>

              {/* Main Image Area */}
              <div className="relative flex-grow bg-gray-100 overflow-hidden">
                <div 
                  className="w-full h-full flex justify-center items-center p-6"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={() => setIsDragging(false)}
                >
                  <div className="relative" ref={roomImageRef}>
                    <img
                      alt={`${selectedRoom} interior`}
                      className="max-w-full max-h-full object-contain shadow-md"
                      src={roomImages[selectedRoom] || roomImages['Living Room']}
                    />
                    
                    {/* Placed items */}
                    {placedItems.map((item) => (
                      <motion.div
                        key={`${item.id}-${item.position.x}-${item.position.y}`}
                        className="absolute cursor-move"
                        style={{
                          left: item.position.x,
                          top: item.position.y,
                          width: '80px',
                          height: '80px',
                          backgroundImage: `url(${item.image})`,
                          backgroundSize: 'contain',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                          transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
                        }}
                        drag={activeTool === 'select'}
                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        whileHover={{ scale: 1.05 }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          handleRemoveItem(item.id);
                        }}
                      >
                        {activeTool === 'delete' && (
                          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            <FaTimes />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Dragged Product Preview */}
                {isDragging && selectedProduct && (
                  <motion.div
                    className="absolute z-10 pointer-events-none"
                    style={{
                      width: '80px',
                      height: '80px',
                      backgroundImage: `url(${selectedProduct.image})`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      opacity: 0.8,
                    }}
                    drag
                    dragConstraints={roomImageRef}
                    onDragEnd={handleDragEnd}
                  />
                )}

                {/* Floating Controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white rounded-full border border-gray-300 px-4 py-2 shadow-md text-gray-700 text-sm select-none">
                  <button 
                    className="hover:text-black transition-colors"
                    onClick={() => setPlacedItems([])}
                    title="Clear all"
                  >
                    <FaUndo />
                  </button>
                  <button 
                    className="hover:text-black transition-colors"
                    title="Share design"
                  >
                    <FaShareAlt />
                  </button>
                  <button 
                    className="hover:text-black transition-colors"
                    title="Save to favorites"
                  >
                    <FaHeart />
                  </button>
                  <div className="w-px h-6 bg-gray-300"></div>
                  <button 
                    className="hover:text-black transition-colors"
                    title="More options"
                  >
                    <FaEllipsisH />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Product Sidebar */}
            <div className="w-80 bg-white border-l border-gray-300 flex flex-col">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
                <h2 className="text-sm font-semibold text-gray-700">Product Catalog</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={onClose}
                >
                  <FaTimes />
                </button>
              </div>

              {/* Search Section */}
              <div className="p-4 border-b border-gray-300">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-100 rounded-full px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    placeholder="Search products..."
                  />
                  <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-sm" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter */}
              <div className="px-4 py-3 border-b border-gray-300">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`px-3 py-1 text-xs rounded-full ${
                      selectedCategory === 'All'
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 text-xs rounded-full ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Count */}
              <div className="px-4 py-2 text-xs text-gray-600 border-b border-gray-300">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                {searchQuery && (
                  <span> for "<span className="font-semibold">{searchQuery}</span>"</span>
                )}
              </div>

              {/* Product Grid */}
              <div 
                ref={productsRef}
                className="flex-grow overflow-y-auto p-4 grid grid-cols-2 gap-4"
              >
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      className="flex flex-col items-center text-center text-xs text-gray-700 cursor-pointer relative group p-2 rounded-lg border border-transparent hover:border-gray-200 hover:shadow-sm transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      draggable
                      onDragStart={() => handleDragStart(product)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="relative w-full h-24 mb-2">
                        <img
                          alt={product.description}
                          className="w-full h-full object-contain"
                          src={product.image}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                          <div className="w-8 h-8 border-2 border-gray-400 rounded-full flex items-center justify-center text-gray-700 text-lg font-bold select-none">
                            +
                          </div>
                        </div>
                      </div>
                      <div className="font-bold leading-tight mb-1">{product.name}</div>
                      <div className="text-gray-500 text-2xs leading-tight mb-1">{product.description}</div>
                      <div className="font-bold text-blue-600">{product.price}</div>
                      <div className="text-2xs text-gray-400 mt-1">
                        {product.dimensions.width}"W × {product.dimensions.height}"H × {product.dimensions.depth}"D
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-2 flex flex-col items-center justify-center py-8 text-gray-400">
                    <FaSearch className="text-2xl mb-2" />
                    <p className="text-sm mb-2">No products found</p>
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Clear search filters
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-300 text-xs text-gray-500">
                <p>Drag and drop products into your room design</p>
                <p className="mt-1">Right-click on placed items to remove them</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AiDesigner;