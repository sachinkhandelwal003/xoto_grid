import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import {
  Button, Form, Input, Card, Select, Typography, Row, Col,
  Divider, message, notification, Switch, Upload, InputNumber,
  DatePicker, Modal, Checkbox, Segmented, Alert, Spin,
} from "antd";
import {
  PlusOutlined, EnvironmentOutlined,
  HomeOutlined, DollarOutlined, SearchOutlined,
  MinusCircleOutlined, DeleteOutlined, VideoCameraOutlined,
  FileTextOutlined, CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { showToast } from "../../manageApi/utils/toast";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const THEME = { primary: "#7c3aed", success: "#10b981", error: "#ef4444" };
const UPLOAD_API = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/upload`;

/* ── UAE Areas ── */
const UAE_AREAS = {
  Dubai: [
    "Dubai Marina", "Downtown Dubai", "JBR – Jumeirah Beach Residence", "Palm Jumeirah",
    "Business Bay", "DIFC – Dubai International Financial Centre", "JVC – Jumeirah Village Circle",
    "Al Barsha", "Deira", "Bur Dubai", "Jumeirah", "Al Quoz", "Al Nahda (Dubai)",
    "Mirdif", "Silicon Oasis", "Sports City", "Motor City", "Al Furjan",
    "Discovery Gardens", "International City", "The Greens", "The Views",
    "Emirates Hills", "Arabian Ranches", "Mudon", "Damac Hills", "Town Square",
    "Al Warqa", "Oud Metha", "Karama", "Satwa", "Al Mankhool", "Rashidiya",
    "Al Garhoud", "Festival City", "Creek Harbour", "Dubai Hills Estate",
    "Bluewaters Island", "Port De La Mer", "La Mer", "Madinat Jumeirah Living",
    "Sobha Hartland", "Mohammed Bin Rashid City", "Tilal Al Ghaf", "The Sustainable City",
  ],
  "Abu Dhabi": [
    "Corniche Road", "Al Reem Island", "Yas Island", "Saadiyat Island",
    "Khalifa City A", "Khalifa City B", "Al Nahyan", "Masdar City",
    "Tourist Club Area (TCA)", "Al Khalidiyah", "Al Muroor", "Al Mushrif",
    "Al Bateen", "Al Manhal", "Al Karamah", "Al Shamkhah", "Mohamed Bin Zayed City",
    "Mussafah", "Al Reef", "Al Ghadeer", "Hydra Village", "Al Samha",
    "Shakhbout City", "Zayed City", "Al Raha Beach", "Al Raha Gardens",
    "Yas Acres", "Bloom Gardens", "Golf Gardens", "Rawdhat Abu Dhabi",
    "Al Wathba", "Al Falah", "Baniyas", "Al Shahama", "Ghantoot",
  ],
  Sharjah: [
    "Al Nahda (Sharjah)", "Al Majaz", "Al Taawun", "Al Qasimia",
    "Muwaileh Commercial", "Al Khan", "Al Mamzar (Sharjah Side)",
    "Al Wahda", "Al Yarmook", "Abu Shagara", "Al Butina", "Al Jubail",
    "Aljada", "Tilal City", "Muwaileh", "Sharjah Waterfront City", "Al Zahia",
  ],
  Ajman: [
    "Al Nuaimiya 1", "Al Nuaimiya 2", "Al Nuaimiya 3",
    "Al Rashidiya 1", "Al Rashidiya 2", "Al Rashidiya 3",
    "Emirates City", "Al Rawda 1", "Al Rawda 2", "Al Rawda 3",
    "Garden City", "Al Rumaila", "Ajman Uptown",
  ],
  "Ras Al Khaimah": [
    "Al Nakheel", "Al Hamra Village", "Mina Al Arab", "Al Qawasim Corniche",
    "Al Dhait South", "Al Dhait North", "Al Mamourah",
  ],
  Fujairah: [
    "Fujairah City Centre", "Merashid", "Dibba Al Fujairah",
    "Khor Fakkan", "Kalba", "Al Faseel", "Al Gurfa",
  ],
  "Umm Al Quwain": [
    "UAQ City Centre", "Al Salama", "Al Hayl", "Al Dour", "Falaj Al Mualla",
  ],
};

const EMIRATES = Object.keys(UAE_AREAS);
const EMIRATE_CITY = {
  Dubai: "Dubai", "Abu Dhabi": "Abu Dhabi", Sharjah: "Sharjah",
  Ajman: "Ajman", "Ras Al Khaimah": "Ras Al Khaimah",
  Fujairah: "Fujairah", "Umm Al Quwain": "Umm Al Quwain",
};

const UNIT_TYPES = [
  { label: "Apartment", value: "apartment" }, { label: "Villa", value: "villa" },
  { label: "Penthouse", value: "penthouse" }, { label: "Townhouse", value: "townhouse" },
  { label: "Duplex", value: "duplex" }, { label: "Office", value: "office" },
  { label: "Retail", value: "retail" }, { label: "Warehouse", value: "warehouse" },
];

const BEDROOM_OPTIONS = [
  { label: "Studio", value: 0 },
  { label: "1 Bed", value: 1 },
  { label: "2 Beds", value: 2 },
  { label: "3 Beds", value: 3 },
  { label: "4 Beds", value: 4 },
  { label: "5 Beds", value: 5 },
  { label: "6 Beds", value: 6 },
  { label: "7 Beds", value: 7 },
  { label: "8+ Beds", value: 8 },
];

const getBedroomType = (bedrooms) => {
  const count = Number(bedrooms || 0);
  if (count === 0) return "studio";
  if (count >= 8) return "8plus";
  return `${count}bed`;
};

const FURNISHING_OPTIONS = [
  { label: "Furnished", value: "furnished" },
  { label: "Semi Furnished", value: "semi_furnished" },
  { label: "Unfurnished", value: "unfurnished" },
];

const RENTAL_FREQUENCY_OPTIONS = [
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
];

const CHEQUES_OPTIONS = [
  { label: "1 Cheque", value: 1 }, { label: "2 Cheques", value: 2 },
  { label: "4 Cheques", value: 4 }, { label: "6 Cheques", value: 6 },
  { label: "12 Cheques", value: 12 },
];

const AMENITIES_OPTIONS = [
  "Pool", "Gym", "Parking", "Sea View", "Balcony",
  "Chiller Free", "WiFi", "Near Metro", "DEWA Included",
  "Kids Play Area", "Maid's Room",
];

/* ── Off-Plan constants ── */
const UAE_LOCALITIES = [
  "Dubai Marina", "Downtown Dubai", "JVC", "Business Bay", "Palm Jumeirah",
  "Dubai Hills", "Abu Dhabi", "Sharjah", "Al Barsha", "Al Reem Island",
  "Saadiyat Island", "Yas Island", "Jumeirah", "Al Furjan", "Dubai Hills Estate",
  "Mohammed Bin Rashid City", "Creek Harbour", "Sobha Hartland", "Tilal Al Ghaf",
];

const OFFPLAN_AMENITIES = [
  "Swimming Pool", "Gym / Fitness Centre", "Kids Play Area", "Sauna & Steam Room",
  "BBQ Area", "Rooftop Terrace", "Jogging Track", "Yoga / Meditation Deck",
  "Co-working Space", "Cinema / Movie Room", "Club House", "Concierge Service",
  "24/7 Security", "Smart Home Technology", "EV Charging Station", "Spa",
  "Tennis Court", "Basketball Court", "Squash Court", "Golf Simulator",
  "Visitor Parking", "Retail Outlets", "Cafeteria / Café", "Mosque",
  "School / Nursery Nearby", "Pet-Friendly Area", "Business Lounge",
  "Infinity Pool", "Sky Garden", "Water Feature",
];

/* ── Helpers ── */
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });

const customUploadRequest = async ({ file, onSuccess, onError }) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(UPLOAD_API, { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok || data.success === false) throw new Error(data.message || "Upload failed");
    onSuccess(data, file);
  } catch (err) {
    onError(err);
  }
};

const UploadBox = ({ label, fileList, onChange, maxCount = 20, hint }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</div>
    {hint && <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8 }}>{hint}</div>}
    <Upload
      listType="picture-card" multiple={maxCount > 1}
      fileList={fileList} onChange={({ fileList: fl }) => onChange(fl)}
      customRequest={customUploadRequest}
      beforeUpload={(file) => {
        const ok = file.size / 1024 / 1024 < 5;
        if (!ok) message.error("Image must be smaller than 5MB!");
        return ok || Upload.LIST_IGNORE;
      }}
      accept="image/*"
    >
      {fileList.length < maxCount ? (
        <div><PlusOutlined /><div style={{ marginTop: 6, fontSize: 12 }}>Upload</div></div>
      ) : null}
    </Upload>
  </div>
);


/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════ */
const CreateProperty = () => {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const isEditMode = Boolean(id);
  const [formMode, setFormMode] = useState("rental");

  /* ── Rental ── */
  const [rentalForm]    = Form.useForm();
  const [rentalLoading, setRentalLoading] = useState(false);
  const [rentalEmirate, setRentalEmirate] = useState("");
  const [rentalQrFile,  setRentalQrFile]  = useState([]);
  const [rentalPermitOnly, setRentalPermitOnly] = useState(false);
  
  const [rentalMainLogoFileList, setRentalMainLogoFileList] = useState([]);
  const [rentalPhotosArchitecture, setRentalPhotosArchitecture] = useState([]);
  const [rentalPhotosInterior, setRentalPhotosInterior] = useState([]);
  const [rentalPhotosLobby, setRentalPhotosLobby] = useState([]);
  const [rentalPhotosOther, setRentalPhotosOther] = useState([]);
  const [rentalBrochureFileList, setRentalBrochureFileList] = useState([]);

  /* ── Secondary ── */
  const [secondaryForm]    = Form.useForm();
  const [secondaryLoading, setSecondaryLoading] = useState(false);
  const [secondaryEmirate, setSecondaryEmirate] = useState("");
  const [secondaryQrFile,  setSecondaryQrFile]  = useState([]);
  const [secondaryPermitOnly, setSecondaryPermitOnly] = useState(false);
  
  const [secMainLogoFileList, setSecMainLogoFileList] = useState([]);
  const [secPhotosArchitecture, setSecPhotosArchitecture] = useState([]);
  const [secPhotosInterior, setSecPhotosInterior] = useState([]);
  const [secPhotosLobby, setSecPhotosLobby] = useState([]);
  const [secPhotosOther, setSecPhotosOther] = useState([]);
  const [secBrochureFileList, setSecBrochureFileList] = useState([]);

  /* ── Off-Plan ── */
  const [offplanForm]              = Form.useForm();
  const [offplanLoading,           setOffplanLoading]           = useState(false);
  const [offplanPermitOnly,        setOffplanPermitOnly]        = useState(false);
  const [selectedDeveloperId,      setSelectedDeveloperId]      = useState(null);
  const [developers,               setDevelopers]               = useState([]);
  const [loadingDevelopers,        setLoadingDevelopers]        = useState(false);
  const [selectedDeveloperProfile, setSelectedDeveloperProfile] = useState(null);
  const [fetchingProfile,          setFetchingProfile]          = useState(false);
  const [mainLogoFileList,   setMainLogoFileList]   = useState([]);
  const [photosArchitecture, setPhotosArchitecture] = useState([]);
  const [photosInterior,     setPhotosInterior]     = useState([]);
  const [photosLobby,        setPhotosLobby]        = useState([]);
  const [photosOther,        setPhotosOther]        = useState([]);
  const [brochureFileList,   setBrochureFileList]   = useState([]);
  const [offplanQrFile,      setOffplanQrFile]      = useState([]);

  /* ── Shared preview ── */
  const [previewOpen,  setPreviewOpen]  = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const formatFiles = (urls) => (urls || []).map((url, i) => ({ uid: Math.random().toString(), name: `img-${i}`, status: "done", url, response: { url } }));

  /* ── Edit mode load ── */
  useEffect(() => {
    if (isEditMode && formMode === "rental") fetchRentalById();
  }, [isEditMode, formMode]);

  const fetchRentalById = async () => {
    try {
      setRentalLoading(true);
      const res  = await apiService.get(`/properties/${id}`);
      const raw  = res?.data ?? res;
      const data = raw?.data ?? raw;
      if (!data) return;
      const emirate = Object.keys(EMIRATE_CITY).find(k => EMIRATE_CITY[k] === data.city) || data.city || "";
      setRentalEmirate(emirate);
      setRentalPermitOnly(Boolean(data.permitAvailable));
      rentalForm.setFieldsValue({
        propertyName: data.propertyName || "", description: data.description || "",
        emirate, area: data.area || undefined, city: data.city || "",
        unitType: data.unitType || undefined, bedroomType: data.bedroomType || undefined,
        bedrooms: data.bedrooms || 0, bathrooms: data.bathrooms || 0,
        builtUpArea: data.builtUpArea || 0, builtUpAreaUnit: data.builtUpAreaUnit || "sqft",
        price: data.price || 0, rentalFrequency: data.rentalFrequency || undefined,
        minimumContract: data.minimumContract || null, cheques: data.cheques || null,
        isImmediate: data.isImmediate ?? true, isShortTerm: data.isShortTerm || false,
        furnishing: data.furnishing || "unfurnished", parkingSpaces: data.parkingSpaces || 0,
        hasView: data.hasView || false, viewType: data.viewType || [],
        availableFrom: data.availableFrom ? dayjs(data.availableFrom) : null,
        permitAvailable: data.permitAvailable || false,
        reraPermitNumber: data.reraPermitNumber || "", dldRegistrationNumber: data.dldRegistrationNumber || "",
        amenities: data.amenities || [], unitNumber: data.unitNumber || "",
        floorNumber: data.floorNumber || 0, isFeatured: data.isFeatured || false,
        showContactOnlyVerified: data.showContactOnlyVerified ?? true,
      });
      
      const photos = data.photos || {};
      if (data.mainLogo) setRentalMainLogoFileList(formatFiles([data.mainLogo]));
      setRentalPhotosArchitecture(formatFiles(photos.architecture));
      setRentalPhotosInterior(formatFiles(photos.interior));
      setRentalPhotosLobby(formatFiles(photos.lobby));
      setRentalPhotosOther(formatFiles(photos.other));
      if (data.brochure) setRentalBrochureFileList(formatFiles([data.brochure]));

    } catch { message.error("Failed to load property for editing."); }
    finally { setRentalLoading(false); }
  };

  const handleImageUpload = async ({ file, onSuccess, onError }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiService.upload(UPLOAD_API, formData);
      const uploadedUrl = response?.data?.file?.url || response?.data?.url || response?.file?.url || response?.url;
      if (uploadedUrl) { message.success(`${file.name} uploaded!`); onSuccess({ url: uploadedUrl }); }
      else throw new Error("No URL returned from upload API");
    } catch (err) { message.error(`Upload failed for ${file.name}`); onError(err); }
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) file.preview = await getBase64(file.originFileObj);
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf("/") + 1));
  };

  const extractUrl = (file) => file.url || file.response?.url;

  /* ── Off-Plan helpers ── */
  useEffect(() => {
    if (formMode !== "offplan") return;
    const load = async () => {
      setLoadingDevelopers(true);
      try {
        const res = await apiService.get("/developer/get-all-developers");
        setDevelopers(res?.data?.data || res?.data || []);
      } catch { showToast("Failed to load developers", "error"); }
      finally { setLoadingDevelopers(false); }
    };
    load();
  }, [formMode]);

  useEffect(() => {
    if (!selectedDeveloperId || formMode !== "offplan") { setSelectedDeveloperProfile(null); return; }
    const load = async () => {
      setFetchingProfile(true);
      try {
        const res = await apiService.get(`developer/get-developer-by-id?id=${selectedDeveloperId}`);
        const profile = res?.data?.data || res?.data || res;
        setSelectedDeveloperProfile(profile);
        offplanForm.setFieldsValue({ developerDetails: { companyName: profile.companyName || profile.name || "", developerLicenseNumber: profile.developerLicenseNumber || "", primaryContactName: profile.primaryContactName || "", phone: profile.phone || profile.phone_number || "", email: profile.email || "" } });
      } catch { showToast("Could not fetch developer details", "error"); }
      finally { setFetchingProfile(false); }
    };
    load();
  }, [selectedDeveloperId, offplanForm, formMode]);

  useEffect(() => {
    if (formMode !== "offplan") { setSelectedDeveloperId(null); setSelectedDeveloperProfile(null); }
  }, [formMode]);

  const collectUrls = (fileList) => fileList.filter(f => f.status === "done").map(f => f.url || extractPhotoUrl(f)).filter(Boolean);

  const extractPhotoUrl = (fileItem) => {
    const r = fileItem.response;
    if (!r) return null;
    return r.url || r.imageUrl || r.data?.url || r.file?.url || r.file?.location || null;
  };

  const isAnyOffplanUploading = () =>
    [mainLogoFileList, photosArchitecture, photosInterior, photosLobby, photosOther, brochureFileList]
      .some(l => l.some(f => f.status === "uploading"));
      
  const isAnyRentalUploading = () =>
    [rentalMainLogoFileList, rentalPhotosArchitecture, rentalPhotosInterior, rentalPhotosLobby, rentalPhotosOther, rentalBrochureFileList]
      .some(l => l.some(f => f.status === "uploading"));
      
  const isAnySecUploading = () =>
    [secMainLogoFileList, secPhotosArchitecture, secPhotosInterior, secPhotosLobby, secPhotosOther, secBrochureFileList]
      .some(l => l.some(f => f.status === "uploading"));



/* ── Rental submit ── */
const handleSaveRental = async () => {
  if (isAnyRentalUploading()) return showToast("Please wait for uploads to finish.", "error");
  
  const mainLogoUrls = collectUrls(rentalMainLogoFileList);
  if (mainLogoUrls.length === 0) return showToast("Please upload a main logo image.", "error");

  let values;
  try { values = await rentalForm.validateFields(); } catch { return; }
  const rentalQrUrl = rentalQrFile.map(extractUrl).filter(Boolean)[0] || null;
  const permitAvailable = Boolean(values.permitAvailable);
  setRentalLoading(true);
  try {
    const brochureUrl = rentalBrochureFileList.length > 0 && rentalBrochureFileList[0].status === "done" 
      ? rentalBrochureFileList[0]?.url || extractPhotoUrl(rentalBrochureFileList[0]) || "" : "";

    const payload = {
      propertySubType: "rental", 
      propertyName: values.propertyName,
      projectName: values.propertyName,  
      description: values.description || "", 
      overview: values.description || "", 
      area: values.area, 
      city: values.city, 
      country: "UAE",
      locality: values.area || "", 
      location: {
        address: values.area || "",
        latitude: null,
        longitude: null
      },
      unitType: values.unitType || "apartment", 
      bedroomType: getBedroomType(values.bedrooms),
      bedrooms: Number(values.bedrooms || 0), 
      bathrooms: Number(values.bathrooms || 0),
      builtUpArea: Number(values.builtUpArea || 0), 
      builtUpAreaUnit: values.builtUpAreaUnit || "sqft",
      unitNumber: values.unitNumber || "", 
      floorNumber: Number(values.floorNumber || 0),
      price: Number(values.price || 0), 
      price_min: Number(values.price || 0), 
      currency: "AED",
      transactionType: "rent", 
      rentalFrequency: values.rentalFrequency,
      permitAvailable,
      reraPermitNumber: permitAvailable ? null : values.reraPermitNumber, 
      minimumContract: values.minimumContract || null,
      cheques: values.cheques || null, 
      isImmediate: values.isImmediate ?? true,
      isShortTerm: values.isShortTerm || false,
      availableFrom: values.availableFrom ? values.availableFrom.toISOString() : null,
      furnishing: values.furnishing || "unfurnished", 
      parkingSpaces: Number(values.parkingSpaces || 0),
      hasView: values.hasView || false, 
      viewType: values.viewType || [], 
      amenities: values.amenities || [],
      locationHighlights: values.locationHighlights || "",
      investmentPoints: values.investmentPoints || "",
      socialMedia: values.socialMedia || {},
      purpose: values.purpose || null,
      listingEndDate: values.listingEndDate ? values.listingEndDate.toISOString() : null,
      dldRegistrationNumber: values.dldRegistrationNumber || null,
      trakheesiPermitId: permitAvailable ? null : (values.trakheesiPermitId || null),
      qrCode: permitAvailable ? null : rentalQrUrl,
      mainLogo: mainLogoUrls[0] || "",
      brochure: brochureUrl,
      photos: { 
        architecture: collectUrls(rentalPhotosArchitecture), 
        interior: collectUrls(rentalPhotosInterior), 
        lobby: collectUrls(rentalPhotosLobby), 
        other: collectUrls(rentalPhotosOther) 
      },
      isFeatured: values.isFeatured || false,
      showContactOnlyVerified: values.showContactOnlyVerified ?? true,
      approvalStatus: "approved",
      listingStatus: "active",
      status: "approved"
    };
    
    const response = isEditMode
      ? await apiService.put(`/properties/${id}`, payload)
      : await apiService.post("/properties", payload);
    
    if (response) {
      notification.success({ 
        message: isEditMode ? "Property Updated" : "Property Created", 
        description: `Rental listing "${values.propertyName}" is now LIVE on the platform!`, 
        placement: "topRight" 
      });
      navigate(-1);
    }
  } catch (err) {
    message.error(err?.response?.data?.message || err?.message || "Failed to save property.");
  } finally { setRentalLoading(false); }
};

/* ── Secondary submit ── */
const handleSubmitSecondary = async () => {
  if (isAnySecUploading()) return showToast("Please wait for uploads to finish.", "error");

  const mainLogoUrls = collectUrls(secMainLogoFileList);
  if (mainLogoUrls.length === 0) return showToast("Please upload a main logo image.", "error");

  let values;
  try { values = await secondaryForm.validateFields(); } catch { return; }
  const secondaryQrUrl = secondaryQrFile.map(extractUrl).filter(Boolean)[0] || null;
  setSecondaryLoading(true);
  try {
    const brochureUrl = secBrochureFileList.length > 0 && secBrochureFileList[0].status === "done" 
      ? secBrochureFileList[0]?.url || extractPhotoUrl(secBrochureFileList[0]) || "" : "";

    const payload = {
      propertySubType: "secondary", 
      propertyName: values.propertyName, 
      projectName: values.propertyName,  
      description: values.description || "",
      overview: values.description || "",
      area: values.area, 
      city: values.city, 
      country: "UAE",
      locality: values.area || "",
      location: {
        address: values.area || "",
        latitude: null,
        longitude: null
      },
      unitType: values.unitType || "apartment", 
      bedroomType: getBedroomType(values.bedrooms),
      bedrooms: Number(values.bedrooms || 0), 
      bathrooms: Number(values.bathrooms || 0),
      builtUpArea: Number(values.builtUpArea || 0), 
      builtUpAreaUnit: values.builtUpAreaUnit || "sqft",
      unitNumber: values.unitNumber || "", 
      floorNumber: Number(values.floorNumber || 0),
      price: Number(values.price || 0), 
      price_min: Number(values.price || 0), 
      currency: "AED",
      transactionType: values.transactionType || "sell", 
      ownershipType: values.ownershipType || "freehold",
      availableFrom: values.availableFrom ? values.availableFrom.toISOString() : null,
      isFeatured: values.isFeatured || false, 
      showContactOnlyVerified: values.showContactOnlyVerified ?? true,
      hasView: values.hasView || false, 
      viewType: values.viewType || [], 
      amenities: values.amenities || [],
      locationHighlights: values.locationHighlights || "",
      investmentPoints: values.investmentPoints || "",
      socialMedia: values.socialMedia || {},
      purpose: values.purpose || null,
      listingEndDate: values.listingEndDate ? values.listingEndDate.toISOString() : null,
      furnishing: values.furnishing || "unfurnished",
      parkingSpaces: Number(values.parkingSpaces || 0),
      commission: Number(values.commission || 0),
      shareCommission: values.shareCommission || false,
      shareCommissionPercentage: values.shareCommissionPercentage || 0,
      dldRegistrationNumber: values.dldRegistrationNumber || null,
      permitAvailable: secondaryPermitOnly,
      trakheesiPermitId: secondaryPermitOnly ? null : (values.trakheesiPermitId || null),
      qrCode: secondaryPermitOnly ? null : secondaryQrUrl,
      inventory: (values.secondaryInventory || []).map(u => ({
        unitNumber:  u.unitNumber  || "",
        floorNumber: Number(u.floor || 0),
        unitType:    u.unitType    || "",
        bedrooms:    Number(u.bedrooms || 0),
        builtUpArea: Number(u.builtUpArea || 0),
        price:       Number(u.price || 0),
        status:      u.status || "available",
      })),
      mainLogo: mainLogoUrls[0] || "",
      brochure: brochureUrl,
      photos: { 
        architecture: collectUrls(secPhotosArchitecture), 
        interior: collectUrls(secPhotosInterior), 
        lobby: collectUrls(secPhotosLobby), 
        other: collectUrls(secPhotosOther) 
      },
      approvalStatus: "approved",
      listingStatus: "active",
      status: "approved"
    };
    await apiService.post("/properties", payload);
    notification.success({ 
      message: "Secondary Property Created", 
      description: `"${values.propertyName}" is now LIVE on the platform!`, 
      placement: "topRight" 
    });
    secondaryForm.resetFields();
    
    setSecMainLogoFileList([]);
    setSecPhotosArchitecture([]);
    setSecPhotosInterior([]);
    setSecPhotosLobby([]);
    setSecPhotosOther([]);
    setSecBrochureFileList([]);
  } catch (err) {
    message.error(err?.response?.data?.message || err?.message || "Failed to save property.");
  } finally { setSecondaryLoading(false); }
};

/* ── Off-Plan submit ── */
const handleSaveOffplan = async () => {
  if (!selectedDeveloperId) return showToast("Please select a developer first", "error");
  const values = offplanForm.getFieldsValue(true);
  if (!values.propertyName?.trim()) return showToast("Project Name is required", "error");
  if (!values.locality) return showToast("Locality is required", "error");
  if (!values.overview?.trim()) return showToast("Project Overview is required", "error");
  if (!values.priceRangeFrom || !values.priceRangeTo) return showToast("Price range is required", "error");
  if (isAnyOffplanUploading()) return showToast("Please wait for uploads to finish.", "error");
  const offplanQrUrl = offplanQrFile.map(extractUrl).filter(Boolean)[0] || null;
  if (!offplanPermitOnly && !offplanQrUrl) return showToast("QR Code is required before publishing.", "error");
  if (!offplanPermitOnly && !values.trakheesiPermitId?.trim()) return showToast("Trakheesi Permit ID is required before publishing.", "error");
  const mainLogoUrls = collectUrls(mainLogoFileList);
  if (mainLogoUrls.length === 0) return showToast("Please upload a main logo image.", "error");
  const brochureUrl = brochureFileList.length > 0 && brochureFileList[0].status === "done" 
    ? brochureFileList[0]?.url || extractPhotoUrl(brochureFileList[0]) || "" : "";
  
  const payload = {
    developerId: selectedDeveloperId, 
    propertyType: values.propertyType || "Residential",
    unitTypes: values.unitTypes || [], 
    unitType: values.unitTypes?.[0] || "apartment",
    bedroomType: getBedroomType(values.bedrooms),
    bedrooms: Number(values.bedrooms || 0),
    bathrooms: Number(values.bathrooms || 0),
    propertySubType: "off_plan", 
    transactionType: "sell",
    approvalStatus: "approved",      // Directly approved
    listingStatus: "active",          // ✅ ADDED: listingStatus active
    status: "approved",                 // Set as active/live
    projectName: values.propertyName?.trim(), 
    propertyName: values.propertyName?.trim(),
    locality: values.locality, 
    area: values.locality, 
    city: values.city || values.locality || "", 
    country: "UAE",
    completionDate: { fullDate: values.completionDate ? values.completionDate.format("YYYY-MM-DD") : null },
    overview: values.overview?.trim(), 
    description: values.overview?.trim(),
    priceRange: { from: values.priceRangeFrom || 0, to: values.priceRangeTo || 0 },
    price_min: values.priceRangeFrom || 0, 
    price_max: values.priceRangeTo || 0, 
    price: values.priceRangeFrom || 0,
    mainLogo: mainLogoUrls[0],
    media: { 
      mainLogo: mainLogoUrls[0], 
      architectureImages: collectUrls(photosArchitecture), 
      interiorImages: collectUrls(photosInterior), 
      lobbyImages: collectUrls(photosLobby), 
      otherImages: collectUrls(photosOther), 
      youtubeVideos: (values.youtubeVideos || []).filter(Boolean) 
    },
    photos: { 
      architecture: collectUrls(photosArchitecture), 
      interior: collectUrls(photosInterior), 
      lobby: collectUrls(photosLobby), 
      other: collectUrls(photosOther) 
    },
    location: { address: values.address || "", latitude: values.latitude || null, longitude: values.longitude || null },
    brochure: brochureUrl,
    permitAvailable: offplanPermitOnly,
    trakheesiPermitId: offplanPermitOnly ? null : (values.trakheesiPermitId || null),
    qrCode: offplanPermitOnly ? null : offplanQrUrl,
    buildings: values.buildings || [],
    amenities: values.amenities || [],
    floorPlans: values.floorPlans || [], 
    inventory: values.inventory || [],
    parkingAllocation: values.parkingAllocation || "", 
    parkingSpaces: values.parkingSpaces || 0,
    numberOfFloors: values.floors || 0, 
    floors: values.floors || 0,
    furnishingStatus: values.furnishing === "unfurnished" ? "Unfurnished" 
      : values.furnishing === "semi-furnished" ? "Semi-Furnished" : "Fully Furnished",
    serviceCharge: values.serviceCharge || "", 
    constructionProgress: values.constructionProgress || 0,
    readinessProgress: `${values.constructionProgress || 0}%`, 
    paymentPlan: values.paymentPlan || [],
    projectStatus: values.projectStatus || "presale", 
    developmentStatus: values.developmentStatus || "Planned",
    saleStatus: values.saleStatus || "Available", 
    isFeatured: values.isFeatured || false,
    developerDetails: { 
      companyName: selectedDeveloperProfile?.companyName || "", 
      contactName: selectedDeveloperProfile?.primaryContactName || selectedDeveloperProfile?.name || "", 
      email: selectedDeveloperProfile?.email || "", 
      phone: selectedDeveloperProfile?.phone_number || selectedDeveloperProfile?.phone || "", 
      logo: selectedDeveloperProfile?.logo || "" 
    },
  };
  
  setOffplanLoading(true);
  try {
    const res = await apiService.post("/properties", payload);
    const savedProperty = res?.data?.data || res?.data;
    if (savedProperty) {
      showToast("Property created and LIVE on the platform!", "success");
      offplanForm.resetFields();
      setSelectedDeveloperId(null); 
      setSelectedDeveloperProfile(null);
      setMainLogoFileList([]); 
      setPhotosArchitecture([]); 
      setPhotosInterior([]); 
      setPhotosLobby([]); 
      setPhotosOther([]); 
      setBrochureFileList([]);
    } else { 
      showToast(res?.message || "Failed to save property.", "error"); 
    }
  } catch (error) { 
    showToast(error?.response?.data?.message || error?.message || "Something went wrong.", "error"); 
  } finally { 
    setOffplanLoading(false); 
  }
};


  /* ═══════════════════════════════════════════════════════════
     RENTAL STEP RENDERERS
     ═══════════════════════════════════════════════════════════ */
  const renderRentalStep = (step) => {
    switch (step) {
      case 0: return (
        <>
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Basic Details</Divider>
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item name="propertyName" label="Property Name" rules={[{ required: true }]}>
                <Input size="large" placeholder="E.g. Luxury 3BR Apartment — Marina Walk" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="unitType" label="Unit Type" rules={[{ required: true }]}>
                <Select size="large" placeholder="Select type">
                  {UNIT_TYPES.map(t => <Option key={t.value} value={t.value}>{t.label}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="bedrooms" label="Bedrooms" rules={[{ required: true }]}>
                <Select size="large" placeholder="Select bedrooms" options={BEDROOM_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="bathrooms" label="Bathrooms" rules={[{ required: true }]}>
                <InputNumber size="large" style={{ width: "100%" }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="parkingSpaces" label="Parking Spaces">
                <InputNumber size="large" style={{ width: "100%" }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="builtUpArea" label="Built-Up Area" rules={[{ required: true }]}>
                <InputNumber size="large" style={{ width: "100%" }} min={0} placeholder="1150" />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item name="builtUpAreaUnit" label="Unit">
                <Select size="large"><Option value="sqft">Sqft</Option><Option value="sqm">Sqm</Option></Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="unitNumber" label="Unit Number"><Input size="large" placeholder="e.g. A-1204" /></Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="floorNumber" label="Floor Number">
                <InputNumber size="large" style={{ width: "100%" }} min={0} placeholder="12" />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="furnishing" label="Furnishing">
                <Select size="large">
                  {FURNISHING_OPTIONS.map(f => <Option key={f.value} value={f.value}>{f.label}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item name="hasView" label="Has View?" valuePropName="checked"><Switch /></Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                <TextArea rows={3} placeholder="Describe the property..." style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
        </>
      );

      case 1: return (
        <>
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Pricing & Rental Terms</Divider>
          <Row gutter={16}>
            <Col xs={12} md={8}>
              <Form.Item name="price" label="Annual Rent (AED)" rules={[{ required: true }]}>
                <InputNumber size="large" style={{ width: "100%" }} min={0}
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} placeholder="120000" />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="rentalFrequency" label="Rental Frequency" rules={[{ required: true }]}>
                <Select size="large" placeholder="Select frequency">
                  {RENTAL_FREQUENCY_OPTIONS.map(r => <Option key={r.value} value={r.value}>{r.label}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="cheques" label="No. of Cheques">
                <Select size="large" placeholder="Select" allowClear>
                  {CHEQUES_OPTIONS.map(c => <Option key={c.value} value={c.value}>{c.label}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="minimumContract" label="Minimum Contract (months)">
                <InputNumber size="large" style={{ width: "100%" }} min={1} placeholder="12" />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item name="isImmediate" label="Immediate?" valuePropName="checked"><Switch /></Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item name="isShortTerm" label="Short Term?" valuePropName="checked"><Switch /></Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="availableFrom" label="Listing Start Date">
                <DatePicker size="large" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="listingEndDate" label="Listing End Date">
                <DatePicker size="large" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="purpose" label="Purpose">
                <Select size="large" placeholder="Select purpose">
                  <Option value="residential">Residential</Option>
                  <Option value="commercial">Commercial</Option>
                  <Option value="mixed_use">Mixed Use</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Compliance <span style={{ fontSize: 11, fontWeight: 400, color: "#9ca3af" }}>— optional, admin requires before publishing</span></Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="permitAvailable" label="Permit Available?" valuePropName="checked">
                <Switch
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                  onChange={(checked) => {
                    setRentalPermitOnly(checked);
                    if (checked) {
                      rentalForm.setFieldsValue({
                        reraPermitNumber: "",
                        trakheesiPermitId: "",
                      });
                      setRentalQrFile([]);
                    }
                  }}
                />
              </Form.Item>
            </Col>
            {rentalPermitOnly && (
                <Col span={24}>
                  <Alert
                    type="warning"
                    showIcon
                    message="This property will be visible only to the GRID userbase and will not be published on the website."
                    style={{ marginBottom: 16, borderRadius: 8 }}
                  />
                </Col>
            )}
            {rentalPermitOnly && (
              <Col xs={24} md={12}>
                <Form.Item name="dldRegistrationNumber" label="DLD Registration Number">
                  <Input size="large" placeholder="Optional" />
                </Form.Item>
              </Col>
            )}
            {!rentalPermitOnly && (
              <>
            <Col xs={24} md={12}>
              <Form.Item name="reraPermitNumber" label="RERA Permit Number">
                <Input size="large" placeholder="e.g. 7123456789" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="dldRegistrationNumber" label="DLD Registration Number">
                <Input size="large" placeholder="Optional" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="trakheesiPermitId" label="Trakheesi Permit ID">
                <Input size="large" placeholder="Enter Trakheesi Permit ID" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 4, fontWeight: 600 }}>
                QR Code
                <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400, marginLeft: 6 }}>JPG / PNG — must be scannable</span>
              </div>
              <Upload
                listType="picture-card"
                fileList={rentalQrFile}
                onChange={({ fileList }) => setRentalQrFile(fileList)}
                customRequest={customUploadRequest}
                accept="image/*"
                maxCount={1}
              >
                {rentalQrFile.length < 1 && <div><PlusOutlined /><div style={{ marginTop: 6, fontSize: 12 }}>Upload QR</div></div>}
              </Upload>
            </Col>
              </>
            )}
          </Row>

          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Settings</Divider>
          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item name="isFeatured" label="Featured?" valuePropName="checked"><Switch /></Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="showContactOnlyVerified" label="Verified Users Only?" valuePropName="checked"><Switch /></Form.Item>
            </Col>
          </Row>
        </>
      );

      case 2: return (
        <>
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Location</Divider>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="emirate" label="Emirate" rules={[{ required: true }]}>
                <Select size="large" placeholder="Select Emirate"
                  onChange={v => { setRentalEmirate(v); rentalForm.setFieldsValue({ area: undefined, city: EMIRATE_CITY[v] || "" }); }}>
                  {EMIRATES.map(em => <Option key={em} value={em}>{em}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="area" label="Community / Area" rules={[{ required: true }]}>
                <Select size="large" showSearch placeholder={!rentalEmirate ? "Select an emirate first…" : "Search area…"}
                  disabled={!rentalEmirate} optionFilterProp="label"
                  filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                  suffixIcon={<SearchOutlined style={{ color: "#9ca3af" }} />}>
                  {(rentalEmirate ? UAE_AREAS[rentalEmirate] || [] : []).map(a => <Option key={a} value={a} label={a}>{a}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="city" label="City" rules={[{ required: true }]}>
                <Input size="large" placeholder="Dubai" />
              </Form.Item>
            </Col>
          </Row>
        </>
      );

      case 3: return (
        <>
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Amenities</Divider>
          <Form.Item name="amenities">
            <Checkbox.Group style={{ width: "100%" }}>
              <Row gutter={[12, 10]}>
                {AMENITIES_OPTIONS.map(a => (
                  <Col xs={12} sm={8} md={6} key={a}><Checkbox value={a}>{a}</Checkbox></Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Additional Details</Divider>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="locationHighlights" label="Location Highlights">
                <TextArea rows={3} placeholder="e.g. 5 mins to Dubai Mall, Metro access, Waterfront views..." style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="investmentPoints" label="Investment Points">
                <TextArea rows={3} placeholder="e.g. High ROI area, Freehold, Strong rental demand..." style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Social Media Links</Divider>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name={["socialMedia", "instagram"]} label="Instagram">
                <Input size="large" placeholder="https://instagram.com/..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name={["socialMedia", "facebook"]} label="Facebook">
                <Input size="large" placeholder="https://facebook.com/..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name={["socialMedia", "youtube"]} label="YouTube">
                <Input size="large" placeholder="https://youtube.com/..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name={["socialMedia", "tiktok"]} label="TikTok">
                <Input size="large" placeholder="https://tiktok.com/..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name={["socialMedia", "linkedin"]} label="LinkedIn">
                <Input size="large" placeholder="https://linkedin.com/..." />
              </Form.Item>
            </Col>
          </Row>
        </>
      );

      case 4: return (
        <>
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Media & Photos</Divider>
          <Alert type="info" showIcon message="Upload high-quality images. Main Logo is required. Max 5 MB each." style={{ marginBottom: 20, borderRadius: 8 }} />
          
          <UploadBox label="Main Logo / Cover Image *" hint="Primary image shown on listings" fileList={rentalMainLogoFileList} onChange={setRentalMainLogoFileList} maxCount={1} />
          <UploadBox label="Architecture Photos" hint="Exterior, renders, facade" fileList={rentalPhotosArchitecture} onChange={setRentalPhotosArchitecture} />
          <UploadBox label="Interior Photos" hint="Living areas, kitchens, bedrooms" fileList={rentalPhotosInterior} onChange={setRentalPhotosInterior} />
          <UploadBox label="Lobby / Common Area Photos" fileList={rentalPhotosLobby} onChange={setRentalPhotosLobby} />
          <UploadBox label="Other Photos" fileList={rentalPhotosOther} onChange={setRentalPhotosOther} />
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Brochure (PDF)</div>
            <Upload fileList={rentalBrochureFileList} onChange={({ fileList: fl }) => setRentalBrochureFileList(fl)} customRequest={customUploadRequest} accept=".pdf" maxCount={1}>
              <Button icon={<PlusOutlined />}>Upload Brochure</Button>
            </Upload>
          </div>

          <Divider orientation="left" style={{ borderColor: THEME.primary, marginTop: 24 }}>Review</Divider>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {[
              { label: "Property Name", value: rentalForm.getFieldValue("propertyName") || "—" },
              { label: "Unit Type",     value: rentalForm.getFieldValue("unitType")     || "—" },
              { label: "Annual Rent",   value: rentalForm.getFieldValue("price") ? `AED ${Number(rentalForm.getFieldValue("price")).toLocaleString()}` : "—" },
              { label: "Frequency",     value: rentalForm.getFieldValue("rentalFrequency") || "—" },
              { label: "Area",          value: rentalForm.getFieldValue("area") || "—" },
              { label: "City",          value: rentalForm.getFieldValue("city") || "—" },
              { label: "Images",        value: `${rentalMainLogoFileList.length + rentalPhotosArchitecture.length + rentalPhotosInterior.length + rentalPhotosLobby.length + rentalPhotosOther.length} uploaded` },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "12px 16px", background: "#fafafa", borderRadius: 10, border: "1px solid #e5e7eb", minWidth: 160 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{value}</div>
              </div>
            ))}
          </div>
        </>
      );

      default: return null;
    }
  };

  /* ═══════════════════════════════════════════════════════════
     SECONDARY STEP RENDERERS
     ═══════════════════════════════════════════════════════════ */
  const renderSecondaryStep = (step) => {
    switch (step) {
      case 0: return (
        <>
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Basic Details</Divider>
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item name="propertyName" label="Property Name" rules={[{ required: true }]}>
                <Input size="large" placeholder="E.g. Luxurious 3BR Apartment – Downtown" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="unitType" label="Unit Type" rules={[{ required: true }]}>
                <Select size="large" placeholder="Select type">
                  {UNIT_TYPES.map(t => <Option key={t.value} value={t.value}>{t.label}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="bedrooms" label="Bedrooms" rules={[{ required: true }]}>
                <Select size="large" placeholder="Select bedrooms" options={BEDROOM_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="bathrooms" label="Bathrooms" rules={[{ required: true }]}>
                <InputNumber size="large" style={{ width: "100%" }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="parkingSpaces" label="Parking Spaces">
                <InputNumber size="large" style={{ width: "100%" }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="builtUpArea" label="Built-Up Area" rules={[{ required: true }]}>
                <InputNumber size="large" style={{ width: "100%" }} min={0} placeholder="1150" />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item name="builtUpAreaUnit" label="Unit">
                <Select size="large"><Option value="sqft">Sqft</Option><Option value="sqm">Sqm</Option></Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="unitNumber" label="Unit Number"><Input size="large" placeholder="e.g. A-1204" /></Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="floorNumber" label="Floor Number">
                <InputNumber size="large" style={{ width: "100%" }} min={0} placeholder="12" />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="furnishing" label="Furnishing">
                <Select size="large">
                  {FURNISHING_OPTIONS.map(f => <Option key={f.value} value={f.value}>{f.label}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item name="hasView" label="Has View?" valuePropName="checked"><Switch /></Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                <TextArea rows={3} placeholder="Describe the property..." style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
        </>
      );

      case 1: return (
        <>
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Pricing & Transaction</Divider>
          <Row gutter={16}>
            <Col xs={12} md={8}>
              <Form.Item name="price" label="Price (AED)" rules={[{ required: true }]}>
                <InputNumber size="large" style={{ width: "100%" }} min={0}
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} placeholder="1200000" />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="transactionType" label="Transaction Type">
                <Select size="large"><Option value="sell">Sell</Option><Option value="rent">Rent</Option></Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="ownershipType" label="Ownership Type">
                <Select size="large"><Option value="freehold">Freehold</Option><Option value="leasehold">Leasehold</Option></Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="availableFrom" label="Listing Start Date">
                <DatePicker size="large" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="listingEndDate" label="Listing End Date">
                <DatePicker size="large" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="purpose" label="Purpose">
                <Select size="large" placeholder="Select purpose">
                  <Option value="residential">Residential</Option>
                  <Option value="commercial">Commercial</Option>
                  <Option value="mixed_use">Mixed Use</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Commission</Divider>
          <Row gutter={16}>
            <Col xs={12} md={8}>
              <Form.Item name="commission" label="Commission (%)">
                <InputNumber size="large" style={{ width: "100%" }} min={0} max={100} placeholder="0" />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="shareCommission" label="Share Commission?" valuePropName="checked"><Switch /></Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="shareCommissionPercentage" label="Share %">
                <InputNumber size="large" style={{ width: "100%" }} min={0} max={100} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Compliance & Settings <span style={{ fontSize: 11, fontWeight: 400, color: "#9ca3af" }}>— optional, admin requires before publishing</span></Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Permit Available?">
                <Switch
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                  checked={secondaryPermitOnly}
                  onChange={(checked) => {
                    setSecondaryPermitOnly(checked);
                    if (checked) {
                      secondaryForm.setFieldsValue({ trakheesiPermitId: "" });
                      setSecondaryQrFile([]);
                    }
                  }}
                />
              </Form.Item>
            </Col>
            {secondaryPermitOnly && (
              <Col span={24}>
                <Alert
                  type="warning"
                  showIcon
                  message="This property will be visible only to the GRID userbase and will not be published on the website."
                  style={{ marginBottom: 16, borderRadius: 8 }}
                />
              </Col>
            )}
            <Col xs={24} md={12}>
              <Form.Item name="dldRegistrationNumber" label="DLD Registration Number">
                <Input size="large" placeholder="Optional" />
              </Form.Item>
            </Col>
            {!secondaryPermitOnly && (
              <>
                <Col xs={24} md={12}>
                  <Form.Item name="trakheesiPermitId" label="Trakheesi Permit ID">
                    <Input size="large" placeholder="Enter Trakheesi Permit ID" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <div style={{ marginBottom: 4, fontWeight: 600 }}>
                    QR Code
                    <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400, marginLeft: 6 }}>JPG / PNG — must be scannable</span>
                  </div>
                  <Upload
                    listType="picture-card"
                    fileList={secondaryQrFile}
                    onChange={({ fileList }) => setSecondaryQrFile(fileList)}
                    customRequest={customUploadRequest}
                    accept="image/*"
                    maxCount={1}
                  >
                    {secondaryQrFile.length < 1 && <div><PlusOutlined /><div style={{ marginTop: 6, fontSize: 12 }}>Upload QR</div></div>}
                  </Upload>
                </Col>
              </>
            )}
            <Col xs={12} md={6}>
              <Form.Item name="isFeatured" label="Featured?" valuePropName="checked"><Switch /></Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="showContactOnlyVerified" label="Verified Users Only?" valuePropName="checked"><Switch /></Form.Item>
            </Col>
          </Row>
        </>
      );

      case 2: return (
        <>
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Location</Divider>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="emirate" label="Emirate" rules={[{ required: true }]}>
                <Select size="large" placeholder="Select Emirate"
                  onChange={v => { setSecondaryEmirate(v); secondaryForm.setFieldsValue({ area: undefined, city: EMIRATE_CITY[v] || "" }); }}>
                  {EMIRATES.map(em => <Option key={em} value={em}>{em}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="area" label="Community / Area" rules={[{ required: true }]}>
                <Select size="large" showSearch placeholder={!secondaryEmirate ? "Select an emirate first…" : "Search area…"}
                  disabled={!secondaryEmirate} optionFilterProp="label"
                  filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                  suffixIcon={<SearchOutlined style={{ color: "#9ca3af" }} />}>
                  {(secondaryEmirate ? UAE_AREAS[secondaryEmirate] || [] : []).map(a => <Option key={a} value={a} label={a}>{a}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="city" label="City" rules={[{ required: true }]}>
                <Input size="large" placeholder="Dubai" />
              </Form.Item>
            </Col>
          </Row>
        </>
      );

      case 3: return (
        <>
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Amenities</Divider>
          <Form.Item name="amenities">
            <Checkbox.Group style={{ width: "100%" }}>
              <Row gutter={[12, 10]}>
                {AMENITIES_OPTIONS.map(a => (
                  <Col xs={12} sm={8} md={6} key={a}><Checkbox value={a}>{a}</Checkbox></Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Additional Details</Divider>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="locationHighlights" label="Location Highlights">
                <TextArea rows={3} placeholder="e.g. 5 mins to Dubai Mall, Metro access, Waterfront views..." style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="investmentPoints" label="Investment Points">
                <TextArea rows={3} placeholder="e.g. High ROI area, Freehold, Strong rental demand..." style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Social Media Links</Divider>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name={["socialMedia", "instagram"]} label="Instagram">
                <Input size="large" placeholder="https://instagram.com/..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name={["socialMedia", "facebook"]} label="Facebook">
                <Input size="large" placeholder="https://facebook.com/..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name={["socialMedia", "youtube"]} label="YouTube">
                <Input size="large" placeholder="https://youtube.com/..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name={["socialMedia", "tiktok"]} label="TikTok">
                <Input size="large" placeholder="https://tiktok.com/..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name={["socialMedia", "linkedin"]} label="LinkedIn">
                <Input size="large" placeholder="https://linkedin.com/..." />
              </Form.Item>
            </Col>
          </Row>
        </>
      );

      case 4: return (
        <>
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Media & Photos</Divider>
          <Alert type="info" showIcon message="Upload high-quality images. Main Logo is required. Max 5 MB each." style={{ marginBottom: 20, borderRadius: 8 }} />
          
          <UploadBox label="Main Logo / Cover Image *" hint="Primary image shown on listings" fileList={secMainLogoFileList} onChange={setSecMainLogoFileList} maxCount={1} />
          <UploadBox label="Architecture Photos" hint="Exterior, renders, facade" fileList={secPhotosArchitecture} onChange={setSecPhotosArchitecture} />
          <UploadBox label="Interior Photos" hint="Living areas, kitchens, bedrooms" fileList={secPhotosInterior} onChange={setSecPhotosInterior} />
          <UploadBox label="Lobby / Common Area Photos" fileList={secPhotosLobby} onChange={setSecPhotosLobby} />
          <UploadBox label="Other Photos" fileList={secPhotosOther} onChange={setSecPhotosOther} />
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Brochure (PDF)</div>
            <Upload fileList={secBrochureFileList} onChange={({ fileList: fl }) => setSecBrochureFileList(fl)} customRequest={customUploadRequest} accept=".pdf" maxCount={1}>
              <Button icon={<PlusOutlined />}>Upload Brochure</Button>
            </Upload>
          </div>

          <Divider orientation="left" style={{ borderColor: THEME.primary, marginTop: 24 }}>Review</Divider>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {[
              { label: "Property Name",  value: secondaryForm.getFieldValue("propertyName")      || "—" },
              { label: "Unit Type",      value: secondaryForm.getFieldValue("unitType")           || "—" },
              { label: "Price",          value: secondaryForm.getFieldValue("price") ? `AED ${Number(secondaryForm.getFieldValue("price")).toLocaleString()}` : "—" },
              { label: "Transaction",    value: secondaryForm.getFieldValue("transactionType")    || "—" },
              { label: "Area",           value: secondaryForm.getFieldValue("area")               || "—" },
              { label: "City",           value: secondaryForm.getFieldValue("city")               || "—" },
              { label: "Images",         value: `${secMainLogoFileList.length + secPhotosArchitecture.length + secPhotosInterior.length + secPhotosLobby.length + secPhotosOther.length} uploaded` },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "12px 16px", background: "#fafafa", borderRadius: 10, border: "1px solid #e5e7eb", minWidth: 160 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{value}</div>
              </div>
            ))}
          </div>
        </>
      );

      default: return null;
    }
  };

  const renderSecondaryInventory = () => (
    <>
      <Divider orientation="left" style={{ borderColor: THEME.primary }}>Inventory / Units</Divider>
      <Alert
        type="info" showIcon
        message="Add individual units available in this property. Each unit can have its own price and status."
        style={{ marginBottom: 16, borderRadius: 8 }}
      />
      <Form.List name="secondaryInventory">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }) => (
              <div key={key} style={{ background: "#fafafa", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
                <Row gutter={[12, 0]} align="middle">
                  <Col xs={12} sm={8} md={4}>
                    <Form.Item name={[name, "unitNumber"]} label="Unit No." style={{ marginBottom: 0 }}>
                      <Input placeholder="e.g. A-1201" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={8} md={4}>
                    <Form.Item name={[name, "floor"]} label="Floor" style={{ marginBottom: 0 }}>
                      <InputNumber style={{ width: "100%" }} min={0} placeholder="12" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={8} md={4}>
                    <Form.Item name={[name, "unitType"]} label="Type" style={{ marginBottom: 0 }}>
                      <Select placeholder="Type" allowClear>
                        {UNIT_TYPES.map(t => <Option key={t.value} value={t.value}>{t.label}</Option>)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={8} md={3}>
                    <Form.Item name={[name, "bedrooms"]} label="Beds" style={{ marginBottom: 0 }}>
                      <InputNumber style={{ width: "100%" }} min={0} placeholder="2" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={8} md={4}>
                    <Form.Item name={[name, "builtUpArea"]} label="Area (sqft)" style={{ marginBottom: 0 }}>
                      <InputNumber style={{ width: "100%" }} min={0} placeholder="1200" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={8} md={4}>
                    <Form.Item name={[name, "price"]} label="Price (AED)" style={{ marginBottom: 0 }}>
                      <InputNumber
                        style={{ width: "100%" }} min={0}
                        formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={v => v.replace(/,/g, "")}
                        placeholder="1,200,000"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={8} md={4}>
                    <Form.Item name={[name, "status"]} label="Status" style={{ marginBottom: 0 }}>
                      <Select placeholder="Status" defaultValue="available">
                        <Option value="available">Available</Option>
                        <Option value="reserved">Reserved</Option>
                        <Option value="booked">Booked</Option>
                        <Option value="sold">Sold</Option>
                        <Option value="hold">Hold</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={8} md={1} style={{ display: "flex", alignItems: "flex-end", paddingBottom: 1 }}>
                    <Button
                      danger type="text" icon={<DeleteOutlined />}
                      style={{ marginTop: 22 }}
                      onClick={() => remove(name)}
                    />
                  </Col>
                </Row>
              </div>
            ))}
            <Button
              type="dashed" block icon={<PlusOutlined />}
              onClick={() => add({ status: "available" })}
              style={{ borderColor: THEME.primary, color: THEME.primary, borderRadius: 8, height: 42 }}
            >
              Add Unit
            </Button>
          </>
        )}
      </Form.List>
    </>
  );

  /* ═══════════════════════════════════════════════════════════
     OFF-PLAN RENDERERS (unchanged from original)
     ═══════════════════════════════════════════════════════════ */

  const renderDeveloperSelection = () => (
    <>
      <Divider orientation="left" style={{ borderColor: THEME.primary }}>Select Developer</Divider>
      <Alert message="Choose the developer account this off‑plan project belongs to." type="info" showIcon style={{ marginBottom: 20, borderRadius: 8 }} />
      <Form.Item label="Developer" required>
        <Select showSearch size="large" placeholder="Search and select a developer" loading={loadingDevelopers}
          value={selectedDeveloperId} onChange={val => setSelectedDeveloperId(val)}
          filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} style={{ width: "100%" }}>
          {developers.map(dev => (
            <Option key={dev._id} value={dev._id} label={dev.name || dev.companyName || dev.username}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {dev.logo && <img src={dev.logo} alt="" style={{ width: 24, height: 24, borderRadius: 4, objectFit: "contain", flexShrink: 0 }} />}
                <span style={{ fontWeight: 600 }}>{dev.name || dev.companyName}</span>
                {dev.email && <span style={{ color: "#9ca3af", fontSize: 12 }}>· {dev.email}</span>}
              </div>
            </Option>
          ))}
        </Select>
      </Form.Item>
      {fetchingProfile && <div style={{ textAlign: "center", padding: 20 }}><Spin tip="Loading developer profile…" /></div>}
      {selectedDeveloperProfile && !fetchingProfile && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", marginTop: 8 }}>
          {selectedDeveloperProfile.logo && <img src={selectedDeveloperProfile.logo} alt="logo" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "contain", background: "#fff", padding: 4 }} />}
          <div>
            <div style={{ fontWeight: 700, color: "#15803d" }}>✓ {selectedDeveloperProfile.companyName || selectedDeveloperProfile.name}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{selectedDeveloperProfile.email}{selectedDeveloperProfile.phone && ` · ${selectedDeveloperProfile.phone}`}</div>
          </div>
        </div>
      )}
    </>
  );

  const renderPropertyOverview = () => (
    <>
      <Divider orientation="left" style={{ borderColor: THEME.primary }}>Property Overview</Divider>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="propertyName" label="Project Name" rules={[{ required: true, message: "Enter project name" }]}>
            <Input placeholder="e.g., Luxury Tower Downtown" size="large" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="locality" label="Property Locality" rules={[{ required: true, message: "Select locality" }]}>
            <Select showSearch placeholder="Select locality" size="large">
              {UAE_LOCALITIES.map(l => <Option key={l} value={l}>{l}</Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}><Form.Item name="city" label="City"><Input placeholder="Dubai" size="large" /></Form.Item></Col>
        <Col xs={24} md={8}><Form.Item name="completionDate" label="Completion Date"><DatePicker style={{ width: "100%" }} size="large" /></Form.Item></Col>
        <Col xs={24} md={8}>
          <Form.Item name="propertyType" label="Property Type" rules={[{ required: true }]}>
            <Select size="large"><Option value="Residential">Residential</Option><Option value="Commercial">Commercial</Option><Option value="Mixed-Use">Mixed-Use</Option></Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="unitTypes" label="Unit Types" rules={[{ required: true }]}>
            <Select mode="multiple" placeholder="Select unit types" size="large">
              {["apartment","penthouse","villa","townhouse","duplex","office","retail","warehouse","plot"].map(v => (
                <Option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={12} md={6}>
          <Form.Item name="bedrooms" label="Bedrooms" rules={[{ required: true }]}>
            <Select size="large" placeholder="Select bedrooms" options={BEDROOM_OPTIONS} />
          </Form.Item>
        </Col>
        <Col xs={12} md={6}>
          <Form.Item name="bathrooms" label="Bathrooms" rules={[{ required: true }]}>
            <InputNumber min={0} max={50} size="large" style={{ width: "100%" }} placeholder="e.g., 2" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="projectStatus" label="Project Status">
            <Select size="large" defaultValue="presale">
              <Option value="presale">Pre-Sale</Option><Option value="under_construction">Under Construction</Option>
              <Option value="ready">Ready</Option><Option value="sold_out">Sold Out</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="overview" label="Project Overview / Description" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="Describe the project…" style={{ borderRadius: 8 }} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  const renderPropertyDetails = () => (
    <>
      <Divider orientation="left" style={{ borderColor: THEME.primary }}>Pricing</Divider>
      <Row gutter={16}>
        <Col xs={12} md={8}>
          <Form.Item name="priceRangeFrom" label="Starting Price (AED)" rules={[{ required: true }]}>
            <InputNumber size="large" style={{ width: "100%" }} min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} placeholder="500,000" />
          </Form.Item>
        </Col>
        <Col xs={12} md={8}>
          <Form.Item name="priceRangeTo" label="Max Price (AED)" rules={[{ required: true }]}>
            <InputNumber size="large" style={{ width: "100%" }} min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} placeholder="5,000,000" />
          </Form.Item>
        </Col>
        <Col xs={12} md={8}>
          <Form.Item name="currency" label="Currency">
            <Select size="large" defaultValue="AED"><Option value="AED">AED</Option><Option value="USD">USD</Option></Select>
          </Form.Item>
        </Col>
      </Row>
      <Divider orientation="left" style={{ borderColor: THEME.primary }}><EnvironmentOutlined style={{ marginRight: 6 }} /> Location Details</Divider>
      <Row gutter={16}>
        <Col span={24}><Form.Item name="address" label="Full Address"><Input size="large" placeholder="e.g., Building 12, Downtown Dubai" /></Form.Item></Col>
        <Col xs={12} md={6}><Form.Item name="latitude" label="Latitude"><InputNumber size="large" style={{ width: "100%" }} placeholder="25.2048" /></Form.Item></Col>
        <Col xs={12} md={6}><Form.Item name="longitude" label="Longitude"><InputNumber size="large" style={{ width: "100%" }} placeholder="55.2708" /></Form.Item></Col>
      </Row>
      <Divider orientation="left" style={{ borderColor: THEME.primary }}>Amenities & Features</Divider>
      <Form.Item name="amenities">
        <Checkbox.Group style={{ width: "100%" }}>
          <Row gutter={[8, 10]}>{OFFPLAN_AMENITIES.map(a => <Col xs={12} sm={8} md={6} key={a}><Checkbox value={a} style={{ fontSize: 13 }}>{a}</Checkbox></Col>)}</Row>
        </Checkbox.Group>
      </Form.Item>
      <Divider orientation="left" style={{ borderColor: THEME.primary }}>Media & Photos</Divider>
      <Alert type="info" showIcon message="Upload high-quality images. Main Logo is required. Max 5 MB each." style={{ marginBottom: 20, borderRadius: 8 }} />
      <UploadBox label="Main Logo / Cover Image *" hint="Primary image shown on listings" fileList={mainLogoFileList} onChange={setMainLogoFileList} maxCount={1} />
      <UploadBox label="Architecture Photos" hint="Exterior, renders, facade" fileList={photosArchitecture} onChange={setPhotosArchitecture} />
      <UploadBox label="Interior Photos" hint="Living areas, kitchens, bedrooms" fileList={photosInterior} onChange={setPhotosInterior} />
      <UploadBox label="Lobby / Common Area Photos" fileList={photosLobby} onChange={setPhotosLobby} />
      <UploadBox label="Other Photos" fileList={photosOther} onChange={setPhotosOther} />
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Brochure (PDF)</div>
        <Upload fileList={brochureFileList} onChange={({ fileList: fl }) => setBrochureFileList(fl)} customRequest={customUploadRequest} accept=".pdf" maxCount={1}>
          <Button icon={<PlusOutlined />}>Upload Brochure</Button>
        </Upload>
      </div>
      <Divider orientation="left" style={{ borderColor: THEME.primary }}><VideoCameraOutlined style={{ marginRight: 6 }} /> YouTube Videos</Divider>
      <Form.List name="youtubeVideos">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }) => (
              <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                <Col flex="auto"><Form.Item name={name} noStyle rules={[{ type: "url", message: "Enter a valid YouTube URL" }]}><Input prefix={<VideoCameraOutlined style={{ color: "#9ca3af" }} />} placeholder="https://www.youtube.com/watch?v=..." size="large" /></Form.Item></Col>
                <Col><Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(name)} /></Col>
              </Row>
            ))}
            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} style={{ borderRadius: 8, color: THEME.primary, borderColor: "#c4b5fd" }}>Add YouTube Link</Button>
          </>
        )}
      </Form.List>
      <Divider orientation="left" style={{ borderColor: THEME.primary }}>Buildings / Towers</Divider>
      <Form.List name="buildings">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }) => (
              <Card key={key} size="small" style={{ marginBottom: 12, borderRadius: 10, border: "1px solid #ede9fe" }}
                extra={<Button danger type="text" size="small" icon={<DeleteOutlined />} onClick={() => remove(name)}>Remove</Button>}
                title={<span style={{ fontSize: 13, color: THEME.primary, fontWeight: 700 }}>Tower / Block {name + 1}</span>}>
                <Row gutter={12}>
                  <Col xs={24} md={10}><Form.Item name={[name, "title"]} label="Building Name"><Input placeholder="e.g., Tower A" /></Form.Item></Col>
                  <Col xs={24} md={14}><Form.Item name={[name, "description"]} label="Description"><Input placeholder="Brief description" /></Form.Item></Col>
                </Row>
              </Card>
            ))}
            <Button type="dashed" block onClick={() => add()} style={{ borderColor: "#c4b5fd", color: THEME.primary, borderRadius: 8 }} icon={<PlusOutlined />}>Add Building / Tower</Button>
          </>
        )}
      </Form.List>
      <Divider orientation="left" style={{ borderColor: THEME.primary }}>Floor Plan Summary</Divider>
      <Form.List name="floorPlans">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }) => (
              <Row key={key} gutter={12} align="middle" style={{ marginBottom: 8 }}>
                <Col xs={24} md={8}><Form.Item name={[name, "unitType"]} label="Unit Type" style={{ marginBottom: 0 }}><Select placeholder="Select type">{["apartment","villa","townhouse","penthouse","duplex","office","retail"].map(v => <Option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</Option>)}</Select></Form.Item></Col>
                <Col xs={10} md={6}><Form.Item name={[name, "areaFrom"]} label="Area From (sqft)" style={{ marginBottom: 0 }}><InputNumber style={{ width: "100%" }} min={0} /></Form.Item></Col>
                <Col xs={10} md={6}><Form.Item name={[name, "areaTo"]} label="Area To (sqft)" style={{ marginBottom: 0 }}><InputNumber style={{ width: "100%" }} min={0} /></Form.Item></Col>
                <Col xs={4} md={4} style={{ paddingTop: 28 }}><Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(name)} /></Col>
              </Row>
            ))}
            <Button type="dashed" onClick={() => add()} style={{ marginTop: 8, borderRadius: 8, color: THEME.primary, borderColor: "#c4b5fd" }} icon={<PlusOutlined />}>Add Floor Plan</Button>
          </>
        )}
      </Form.List>
    </>
  );

  const renderInventoryOverview = () => (
    <>
      <Divider orientation="left" style={{ borderColor: THEME.primary }}>Inventory Overview</Divider>
      <Alert type="info" showIcon message="Add each unit type available in this project." style={{ marginBottom: 16, borderRadius: 8 }} />
      <Form.List name="inventory">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }) => (
              <Card key={key} size="small" style={{ marginBottom: 12, borderRadius: 10, border: "1px solid #ede9fe" }} bodyStyle={{ padding: "12px 16px" }}>
                <Row gutter={12} align="middle">
                  <Col xs={24} md={5}><Form.Item name={[name, "unitType"]} label="Unit Type" rules={[{ required: true }]} style={{ marginBottom: 0 }}><Select placeholder="Select type"><Option value="Studio">Studio</Option><Option value="1BR">1 Bedroom</Option><Option value="2BR">2 Bedrooms</Option><Option value="3BR">3 Bedrooms</Option><Option value="4BR">4 Bedrooms</Option><Option value="Penthouse">Penthouse</Option><Option value="Villa">Villa</Option><Option value="Townhouse">Townhouse</Option></Select></Form.Item></Col>
                  <Col xs={12} md={4}><Form.Item name={[name, "units"]} label="No. of Units" style={{ marginBottom: 0 }}><InputNumber style={{ width: "100%" }} min={1} placeholder="50" /></Form.Item></Col>
                  <Col xs={12} md={4}><Form.Item name={[name, "sqft"]} label="Size (sqft)" style={{ marginBottom: 0 }}><InputNumber style={{ width: "100%" }} min={0} placeholder="850" /></Form.Item></Col>
                  <Col xs={12} md={4}><Form.Item name={[name, "sqm"]} label="Size (sqm)" style={{ marginBottom: 0 }}><InputNumber style={{ width: "100%" }} min={0} placeholder="79" /></Form.Item></Col>
                  <Col xs={12} md={4}><Form.Item name={[name, "price"]} label="Price (AED)" style={{ marginBottom: 0 }}><InputNumber style={{ width: "100%" }} min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} placeholder="750,000" /></Form.Item></Col>
                  <Col xs={24} md={3} style={{ display: "flex", alignItems: "flex-end", paddingBottom: 1 }}><Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(name)} style={{ marginTop: 22 }}>Remove</Button></Col>
                </Row>
              </Card>
            ))}
            <Button type="dashed" block onClick={() => add()} style={{ borderColor: THEME.primary, color: THEME.primary, borderRadius: 8, height: 42 }} icon={<PlusOutlined />}>Add Unit Type</Button>
          </>
        )}
      </Form.List>
      <Divider style={{ margin: "20px 0 16px" }} />
      <Form.Item name="parkingAllocation" label="Parking Allocation Policy"><TextArea rows={2} placeholder="e.g., 1 covered space per unit" style={{ borderRadius: 8 }} /></Form.Item>
      <Row gutter={16}><Col xs={12} md={6}><Form.Item name="parkingSpaces" label="Total Parking Spaces"><InputNumber size="large" style={{ width: "100%" }} min={0} placeholder="200" /></Form.Item></Col></Row>
    </>
  );

  const renderOtherDetails = () => (
    <>
      <Divider orientation="left" style={{ borderColor: THEME.primary }}>Construction & Development</Divider>
      <Row gutter={16}>
        <Col xs={12} md={6}><Form.Item name="floors" label="Number of Floors"><InputNumber size="large" min={0} style={{ width: "100%" }} placeholder="40" /></Form.Item></Col>
        <Col xs={12} md={6}><Form.Item name="constructionProgress" label="Construction Progress (%)"><InputNumber size="large" min={0} max={100} style={{ width: "100%" }} addonAfter="%" placeholder="65" /></Form.Item></Col>
        <Col xs={12} md={6}><Form.Item name="developmentStatus" label="Development Status"><Select size="large" defaultValue="Planned"><Option value="Planned">Planned</Option><Option value="Under Construction">Under Construction</Option><Option value="Completed">Completed</Option></Select></Form.Item></Col>
        <Col xs={12} md={6}><Form.Item name="projectStatus" label="Project Status"><Select size="large" defaultValue="presale"><Option value="presale">Pre-Sale</Option><Option value="under_construction">Under Construction</Option><Option value="ready">Ready</Option><Option value="sold_out">Sold Out</Option></Select></Form.Item></Col>
      </Row>
      <Divider orientation="left" style={{ borderColor: THEME.primary }}>Property Specifications</Divider>
      <Row gutter={16}>
        <Col xs={12} md={6}><Form.Item name="furnishing" label="Furnishing Status"><Select size="large" defaultValue="unfurnished"><Option value="unfurnished">Unfurnished</Option><Option value="semi-furnished">Semi-Furnished</Option><Option value="fully-furnished">Fully Furnished</Option></Select></Form.Item></Col>
        <Col xs={12} md={6}><Form.Item name="ownershipType" label="Ownership Type"><Select size="large" defaultValue="freehold"><Option value="freehold">Freehold</Option><Option value="leasehold">Leasehold</Option></Select></Form.Item></Col>
        <Col xs={12} md={6}><Form.Item name="serviceCharge" label="Service Charge (AED/sqft/yr)"><Input size="large" placeholder="e.g., 15" /></Form.Item></Col>
        <Col xs={12} md={6}><Form.Item name="saleStatus" label="Sale Status"><Select size="large" defaultValue="Available"><Option value="Available">Available</Option><Option value="Reserved">Reserved</Option><Option value="Sold">Sold</Option></Select></Form.Item></Col>
      </Row>
      <Divider orientation="left" style={{ borderColor: THEME.primary }}>Commission & Listing</Divider>
      <Row gutter={16}>
        <Col xs={12} md={6}><Form.Item name="commission" label="Commission (%)"><InputNumber size="large" min={0} max={100} style={{ width: "100%" }} addonAfter="%" placeholder="5" /></Form.Item></Col>
        <Col xs={12} md={6}><Form.Item name="shareCommission" label="Share Commission?" valuePropName="checked"><Switch /></Form.Item></Col>
        <Col xs={12} md={6}><Form.Item name="shareCommissionPercentage" label="Shared % (if split)"><InputNumber size="large" min={0} max={100} style={{ width: "100%" }} addonAfter="%" /></Form.Item></Col>
        <Col xs={12} md={6}><Form.Item name="isFeatured" label="Featured Listing?" valuePropName="checked"><Switch /></Form.Item></Col>
        <Col xs={12} md={6}><Form.Item name="showContactOnlyVerified" label="Verified Users Only?" valuePropName="checked"><Switch /></Form.Item></Col>
      </Row>

      <Divider orientation="left" style={{ borderColor: THEME.primary }}>Compliance</Divider>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="Permit Available?">
            <Switch
              checkedChildren="ON"
              unCheckedChildren="OFF"
              checked={offplanPermitOnly}
              onChange={(checked) => {
                setOffplanPermitOnly(checked);
                if (checked) {
                  offplanForm.setFieldsValue({ trakheesiPermitId: "" });
                  setOffplanQrFile([]);
                }
              }}
            />
          </Form.Item>
        </Col>
        {offplanPermitOnly && (
          <Col span={24}>
            <Alert
              type="warning"
              showIcon
              message="This property will be visible only to the GRID userbase and will not be published on the website."
              style={{ marginBottom: 16, borderRadius: 8 }}
            />
          </Col>
        )}
        {!offplanPermitOnly && (
          <>
            <Col xs={24} md={12}>
              <Form.Item
                name="trakheesiPermitId"
                label={<span style={{ fontWeight: 600 }}>Trakheesi Permit ID <span style={{ color: "#ef4444" }}>*</span></span>}
              >
                <Input size="large" placeholder="Enter Trakheesi Permit ID" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 4, fontWeight: 600 }}>
                QR Code <span style={{ color: "#ef4444" }}>*</span>
                <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400, marginLeft: 6 }}>JPG / PNG — must be scannable</span>
              </div>
              <Upload
                listType="picture-card"
                fileList={offplanQrFile}
                onChange={({ fileList }) => setOffplanQrFile(fileList)}
                customRequest={customUploadRequest}
                accept="image/*"
                maxCount={1}
              >
                {offplanQrFile.length < 1 && <div><PlusOutlined /><div style={{ marginTop: 6, fontSize: 12 }}>Upload QR</div></div>}
              </Upload>
            </Col>
          </>
        )}
      </Row>
    </>
  );

  const renderPaymentPlanStep = () => (
    <>
      <Divider orientation="left" style={{ borderColor: THEME.primary }}>Payment Plan</Divider>
      <Alert type="info" showIcon message="Add one or more payment plan options." style={{ marginBottom: 20, borderRadius: 8 }} />
      <Form.List name="paymentPlan">
        {(planFields, { add: addPlan, remove: removePlan }) => (
          <>
            {planFields.map(({ key: planKey, name: planName }) => (
              <Card key={planKey} size="small" style={{ marginBottom: 16, borderRadius: 10, border: "1px solid #e0d7f5" }} bodyStyle={{ padding: 16 }}
                title={<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 13, fontWeight: 700, color: THEME.primary }}>Plan {planName + 1}</span><Button danger size="small" type="text" icon={<DeleteOutlined />} onClick={() => removePlan(planName)}>Remove Plan</Button></div>}>
                <Form.Item name={[planName, "title"]} label="Plan Title" rules={[{ required: true, message: "Enter plan title" }]}><Input placeholder="e.g., Standard Payment Plan" /></Form.Item>
                <Form.List name={[planName, "stages"]}>
                  {(stageFields, { add: addStage, remove: removeStage }) => (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Stages</div>
                      {stageFields.map(({ key: stageKey, name: stageName }) => (
                        <div key={stageKey} style={{ background: "#faf9ff", borderRadius: 8, padding: "12px 14px", marginBottom: 10, border: "1px solid #ede9fe" }}>
                          <Row gutter={12} align="middle">
                            <Col xs={24} md={7}><Form.Item name={[stageName, "stage"]} label="Stage" rules={[{ required: true }]} style={{ marginBottom: 0 }}><Select placeholder="Select stage"><Option value="on_booking">On Booking</Option><Option value="during_construction">During Construction</Option><Option value="upon_handover">Upon Handover</Option><Option value="other">Other</Option></Select></Form.Item></Col>
                            <Col xs={12} md={5}><Form.Item name={[stageName, "percentage"]} label="Percentage (%)" rules={[{ required: true }, { type: "number", min: 1, max: 100 }]} style={{ marginBottom: 0 }}><InputNumber style={{ width: "100%" }} min={1} max={100} addonAfter="%" /></Form.Item></Col>
                            <Col xs={12} md={10}><Form.Item name={[stageName, "description"]} label="Description" style={{ marginBottom: 0 }}><Input placeholder="e.g., Paid on signing SPA" /></Form.Item></Col>
                            <Col xs={24} md={2} style={{ display: "flex", alignItems: "flex-end", paddingBottom: 1 }}><Button danger type="text" size="small" icon={<MinusCircleOutlined />} onClick={() => removeStage(stageName)} style={{ marginTop: 22 }} /></Col>
                          </Row>
                        </div>
                      ))}
                      <Button type="dashed" block onClick={() => addStage()} style={{ borderColor: "#c4b5fd", color: THEME.primary, marginBottom: 8, borderRadius: 8 }} icon={<PlusOutlined />}>Add Stage</Button>
                    </>
                  )}
                </Form.List>
              </Card>
            ))}
            <Button type="dashed" block onClick={() => addPlan()} style={{ borderColor: THEME.primary, color: THEME.primary, height: 42, borderRadius: 10 }} icon={<PlusOutlined />}>Add Payment Plan</Button>
          </>
        )}
      </Form.List>
    </>
  );

  const renderDeveloperDetails = () => (
    <>
      <Divider orientation="left" style={{ borderColor: THEME.primary }}>Developer Details</Divider>
      <Alert message="Auto-populated from selected developer's profile" description="Review the details below." type="success" showIcon style={{ marginBottom: 20, borderRadius: 8 }} />
      {selectedDeveloperProfile?.logo && <div style={{ marginBottom: 20 }}><img src={selectedDeveloperProfile.logo} alt="Developer Logo" style={{ height: 56, borderRadius: 8, border: "1px solid #e5e7eb", padding: 4, background: "#fff" }} /></div>}
      <Row gutter={16}>
        <Col xs={24} md={12}><Form.Item name={["developerDetails", "companyName"]} label="Company Name"><Input readOnly size="large" style={{ background: "#fafafa" }} /></Form.Item></Col>
        <Col xs={24} md={12}><Form.Item name={["developerDetails", "developerLicenseNumber"]} label="Developer Licence Number"><Input readOnly size="large" style={{ background: "#fafafa" }} /></Form.Item></Col>
        <Col xs={24} md={12}><Form.Item name={["developerDetails", "primaryContactName"]} label="Primary Contact"><Input readOnly size="large" style={{ background: "#fafafa" }} /></Form.Item></Col>
        <Col xs={24} md={12}><Form.Item name={["developerDetails", "phone"]} label="Phone"><Input readOnly size="large" style={{ background: "#fafafa" }} /></Form.Item></Col>
        <Col xs={24} md={12}><Form.Item name={["developerDetails", "email"]} label="Email"><Input readOnly size="large" style={{ background: "#fafafa" }} /></Form.Item></Col>
      </Row>
    </>
  );


  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */

  const MODE_META = {
    rental:    { label: "Rental Listing",       color: "#10b981", bg: "#ecfdf5", border: "#6ee7b7" },
    secondary: { label: "Secondary / Resale",   color: "#3b82f6", bg: "#eff6ff", border: "#93c5fd" },
    offplan:   { label: "Off-Plan Project",     color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" },
  };
  const meta = MODE_META[formMode];

  return (
    <div style={{ padding: "24px 28px", background: "#f8f9fb", minHeight: "100vh" }}>

      {/* PAGE HEADER */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Title level={4} style={{ margin: 0, color: "#111827" }}>
            {isEditMode ? "Edit Property" : "Create Property"}
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {isEditMode ? "Update the details of this listing." : "Fill in the details and submit at the bottom."}
          </Text>
        </div>
        <Segmented
          options={[
            { label: "Rental",    value: "rental"    },
            { label: "Secondary", value: "secondary" },
            { label: "Off-Plan",  value: "offplan"   },
          ]}
          value={formMode}
          onChange={val => setFormMode(val)}
          size="large"
        />
      </div>

      {/* PROPERTY TYPE LABEL */}
    <div style={{ marginBottom: 20 }}>
  <Text strong style={{ fontSize: 16, color: "#000", fontWeight: 700 }}>
    {meta.label}
  </Text>
</div>

      {/* ═══════════ RENTAL ═══════════ */}
      {formMode === "rental" && (
        <Card bordered={false} style={{ maxWidth: 1099, margin: "0 auto", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" }} styles={{ body: { padding: "28px 32px" } }}>
          <Form form={rentalForm} layout="vertical" initialValues={{ permitAvailable: false, bedrooms: 1, bathrooms: 1 }}>
            {renderRentalStep(0)}
            {renderRentalStep(1)}
            {renderRentalStep(2)}
            {renderRentalStep(3)}
            {renderRentalStep(4)}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32, paddingTop: 20, borderTop: "1px solid #f0f0f0" }}>
              <Button size="large" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="primary" size="large" onClick={handleSaveRental} loading={rentalLoading}
                style={{ backgroundColor: THEME.primary, borderColor: THEME.primary, minWidth: 180 }}>
                {isEditMode ? "Update Rental" : "Create Rental Property"}
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {/* ═══════════ SECONDARY ═══════════ */}
      {formMode === "secondary" && (
        <Card bordered={false} style={{ maxWidth: 1099, margin: "0 auto", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" }} styles={{ body: { padding: "28px 32px" } }}>
          <Form form={secondaryForm} layout="vertical" initialValues={{ bedrooms: 1, bathrooms: 1 }}>
            {renderSecondaryStep(0)}
            {renderSecondaryStep(1)}
            {renderSecondaryStep(2)}
            {renderSecondaryStep(3)}
            {renderSecondaryInventory()}
            {renderSecondaryStep(4)}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32, paddingTop: 20, borderTop: "1px solid #f0f0f0" }}>
              <Button size="large" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="primary" size="large" onClick={handleSubmitSecondary} loading={secondaryLoading}
                style={{ backgroundColor: THEME.primary, borderColor: THEME.primary, minWidth: 180 }}>
                {isEditMode ? "Update Secondary" : "Create Secondary Property"}
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {/* ═══════════ OFF-PLAN ═══════════ */}
      {formMode === "offplan" && (
        <Card bordered={false} style={{ maxWidth: 1099, margin: "0 auto", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" }} styles={{ body: { padding: "28px 32px" } }}>
          <Form form={offplanForm} layout="vertical" preserve
            initialValues={{ currency: "AED", builtUpAreaUnit: "sqft", unitType: "apartment", bedroomType: "1bed", bedrooms: 1, bathrooms: 1, propertyType: "Residential", furnishing: "unfurnished", parkingSpaces: 0, ownershipType: "freehold", projectStatus: "presale", developmentStatus: "Planned", saleStatus: "Available", isFeatured: false, readinessProgress: "0%", hasView: false, viewType: [], showContactOnlyVerified: false, shareCommission: false, shareCommissionPercentage: 0, constructionProgress: 0, commission: 0 }}>
            {renderDeveloperSelection()}
            {renderPropertyOverview()}
            {renderPropertyDetails()}
            {renderInventoryOverview()}
            {renderOtherDetails()}
            {renderPaymentPlanStep()}
            {renderDeveloperDetails()}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32, paddingTop: 20, borderTop: "1px solid #f0f0f0" }}>
              <Button size="large" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="primary" size="large" onClick={() => handleSaveOffplan("submit")} loading={offplanLoading}
                style={{ backgroundColor: THEME.primary, borderColor: THEME.primary, minWidth: 180 }}>
                Create Off-Plan Property
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {/* IMAGE PREVIEW MODAL */}
      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)} centered>
        <img alt="preview" style={{ width: "100%", borderRadius: 8 }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default CreateProperty;