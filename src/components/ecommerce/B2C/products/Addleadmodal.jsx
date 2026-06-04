import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { apiService } from "../../../../manageApi/utils/custom.apiservice"; // Path check kar lena

const AddLeadModal = ({ onClose, leadData }) => {
  const [loading, setLoading] = useState(false);

  // === CHANGE 1: 'country_code' add kiya with default Dubai code (+971) ===
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country_code: "+971", 
    phone_number: "",
    requirement_description: "",
    status: "new",
  });

  // === CHANGE 2: Smart Pre-fill Logic ===
  useEffect(() => {
    if (leadData) {
      let existingPhone = leadData?.phone_number || "";
      let code = "+971";
      let number = existingPhone;

      // Agar purane number me code pehle se juda hua hai, toh usko alag kar do
      if (existingPhone.startsWith("+971")) {
        code = "+971";
        number = existingPhone.replace("+971", "").trim();
      } else if (existingPhone.startsWith("+91")) {
        code = "+91";
        number = existingPhone.replace("+91", "").trim();
      }

      setFormData({
        first_name: leadData?.name?.first_name || "",
        last_name: leadData?.name?.last_name || "",
        email: leadData?.email || "",
        country_code: code,
        phone_number: number,
        requirement_description: leadData?.requirement_description || "",
        status: leadData?.status || "new",
      });
    }
  }, [leadData]);

  // ================= CLOSE LOGIC =================
  const handleClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  // ESC CLOSE
  useEffect(() => {
    const escClose = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", escClose);
    return () => window.removeEventListener("keydown", escClose);
  }, [handleClose]);

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // BASIC VALIDATION (Dubai numbers bina 0 ke 9 digits ke hote hain, isliye length thodi choti check ki hai)
    if (String(formData.phone_number).trim().length < 7) {
      alert("Enter a Valid Phone Number");
      return;
    }

    try {
      setLoading(true);

      // === CHANGE 3: Payload me country code aur number ko jod diya ===
      const fullPhoneNumber = `${formData.country_code} ${formData.phone_number.trim()}`;

      const payload = {
        name: {
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
        },
        email: formData.email.trim(),
        phone_number: fullPhoneNumber, // Yahan full number ja raha hai backend me
        requirement_description: formData.requirement_description.trim(),
        agent: "6996cc4ddb8bd522e640f2da",
        status: formData.status,
      };

      

      if (leadData) {
        // UPDATE API (Maine isko .put kar diya hai, dhyan rakhna)
        await apiService.put(`/agent/lead/update-lead/${leadData._id}`, payload); 
        alert("Lead Updated Successfully ✅");
      } else {
        // CREATE API
        await apiService.post("/agent/lead/create-lead", payload);
        alert("Lead Created Successfully ✅");
      }
      
      handleClose();

    } catch (error) {
      
      alert(error.response?.data?.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = () => {
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        onClick={(e) => e.stopPropagation()} 
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-6 md:p-10 relative max-h-[95vh] overflow-y-auto"
      >
        {/* CLOSE ICON */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-semibold mb-8">
          {leadData ? "Update Lead" : "Add New Lead"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* FIRST NAME */}
            <div>
              <label className="text-sm font-medium text-gray-600">First Name</label>
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full mt-2 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* LAST NAME */}
            <div>
              <label className="text-sm font-medium text-gray-600">Last Name</label>
              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full mt-2 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-2 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* === CHANGE 4: PHONE NUMBER WITH COUNTRY CODE === */}
            <div>
              <label className="text-sm font-medium text-gray-600">Phone Number</label>
              <div className="flex gap-2 mt-2">
                <select
                  name="country_code"
                  value={formData.country_code}
                  onChange={handleChange}
                  className="w-1/3 px-2 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                </select>
                <input
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="50 123 4567"
                  className="w-2/3 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            {/* STATUS */}
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full mt-2 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="new">New</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* REQUIREMENT */}
          <div>
            <label className="text-sm font-medium text-gray-600">Requirement Description</label>
            <textarea
              name="requirement_description"
              value={formData.requirement_description}
              onChange={handleChange}
              rows="4"
              className="w-full mt-2 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9] transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : (leadData ? "Update Lead" : "Save Lead")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;