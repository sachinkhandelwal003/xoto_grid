import bannerImage from '../../assets/img/ecommercebanner.png'; // Placeholder for banner image

const Banner = () => {
  return (
    <div className="relative bg-indigo-100 rounded-lg overflow-hidden mb-6">
      <img src={bannerImage} alt="Promotional Banner" className="w-full h-32 object-cover opacity-50" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900">Discover Your Perfect Style</h3>
          <p className="text-sm text-gray-700">Use our filters to find the ideal pieces for your home</p>
        </div>
      </div>
    </div>
  );
};

export default Banner;