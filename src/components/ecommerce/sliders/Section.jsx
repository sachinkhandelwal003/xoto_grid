import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShippingFast,
  faLock,
  faHeadset,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";

const features = [
  {
    icon: faShippingFast,
    title: "Fast & Free Shipping",
    desc: "Enjoy quick and reliable delivery on every order, with no hidden shipping costs.",
    bgColor: "bg-purple-50",
  },
  {
    icon: faLock,
    title: "Secure Checkout",
    desc: "Your data is protected with industry-leading encryption for safe shopping.",
    bgColor: "bg-blue-50",
  },
  {
    icon: faHeadset,
    title: "24/7 Customer Support",
    desc: "Our expert support team is always ready to help with your questions or concerns.",
    bgColor: "bg-orange-50",
  },
  {
    icon: faUndo,
    title: "Easy Returns",
    desc: "Changed your mind? Our return policy makes it simple and stress-free.",
    bgColor: "bg-yellow-50",
  },
];

const FeaturedItem = ({ feature }) => {
  return (
    <div className={`rounded-lg p-6 ${feature.bgColor} text-black transition hover:shadow-lg`}>
      <div className="text-3xl mb-4 text-[#373572]">
        <FontAwesomeIcon icon={feature.icon} />
      </div>
      <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
      <p className="text-sm text-gray-700">{feature.desc}</p>
    </div>
  );
};

FeaturedItem.propTypes = {
  feature: PropTypes.object.isRequired,
};

const Section = () => {
  return (
    <section className="py-16 bg-white text-zinc-900 relative overflow-hidden z-10">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our Unique eCommerce Features
          </h2>
          <p className="text-lg text-gray-600">
            Designed to give you a seamless and confident shopping experience, every time.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <FeaturedItem key={i} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Section;
