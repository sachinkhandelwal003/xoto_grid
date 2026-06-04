// src/pages/vendor/UpdateProduct.jsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FiPlus, FiX, FiUploadCloud, FiArrowLeft } from 'react-icons/fi';
import { Button, Card, ColorPicker, Input, Select, Checkbox, InputNumber, Spin } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { showSuccessAlert, showErrorAlert } from '../../../../manageApi/utils/sweetAlert';

const { Option } = Select;

// --- Helper to get role slug ---
const getRoleSlug = (roleCode) => {
  const map = {
    0: 'superadmin',
    1: 'admin',
    5: 'vendor-b2c',
    6: 'vendor-b2b',
    7: 'freelancer',
    11: 'accountant'
  };
  return map[roleCode] || 'dashboard';
};

// --- Color Variant Item ---
const ColorVariantItem = memo(({
  variant,
  index,
  colorNameError,
  imagesError,
  removable,
  onUpdateField,
  onRemoveVariant,
  onRemoveImage,
  onDrop
}) => {
  const localOnDrop = useCallback(
    (acceptedFiles) => {
      onDrop(index, acceptedFiles);
    },
    [index, onDrop]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: localOnDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
    },
    multiple: true,
  });

  return (
    <div className="border p-4 rounded-md mb-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium">Variant {index + 1}</h4>
        <Button type="text" danger onClick={onRemoveVariant} disabled={!removable}>
          <FiX size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Color Name *</label>
          <Input
            size="large"
            value={variant.color_name}
            onChange={(e) => onUpdateField('color_name', e.target.value)}
            status={colorNameError ? 'error' : ''}
            placeholder="e.g. Red, Blue"
          />
          {colorNameError && <p className="text-red-500 text-xs mt-1">{colorNameError}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Color Code</label>
          <ColorPicker
            value={variant.color_code}
            onChange={(color) => onUpdateField('color_code', color.toHexString())}
            showText
            disabledAlpha
          />
        </div>
      </div>

      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 bg-gray-50 transition-colors"
      >
        <input {...getInputProps()} />
        <FiUploadCloud className="mx-auto text-5xl text-gray-400 mb-3" />
        <p className="text-gray-700 font-medium">
          Drop images here or click to upload for <span className="font-semibold">{variant.color_name || `Variant ${index + 1}`}</span>
        </p>
        <p className="text-xs text-gray-500 mt-2">JPEG, PNG, GIF • Max 5 images • Up to 5MB each</p>
      </div>

      {imagesError && <p className="text-red-500 text-xs mt-2">{imagesError}</p>}

      {variant.images.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-6">
          {variant.images.map((img, i) => {
            const previewSrc = img instanceof File
              ? URL.createObjectURL(img)
              : `http://localhost:5000/${img.url}`;

            return (
              <div key={i} className="relative group">
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  <img
                    src={previewSrc}
                    alt={`Image ${i + 1}`}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                    <Button
                      type="primary"
                      danger
                      size="small"
                      shape="circle"
                      icon={<FiX />}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveImage(i);
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

const UpdateProduct = () => {
  const navigate = useNavigate();
  const { id: productId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const roleSlug = user?.role?.code ? getRoleSlug(user.role.code) : 'dashboard';

  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [currency, setCurrency] = useState({ id: '', name: '' });
  const [brands, setBrands] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [attributesList, setAttributesList] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, curr, brnds, mats, attrs, tgs] = await Promise.all([
          apiService.get('/categories'),
          apiService.get('/setting/currency?isDefault=true'),
          apiService.get('/brands'),
          apiService.get('/materials'),
          apiService.get('/attributes'),
          apiService.get('/tags')
        ]);

        setCategories(cats.categories || []);
        setCurrency(curr.currency ? { id: curr.currency._id, name: curr.currency.name || curr.currency.symbol } : { id: '', name: '$' });
        setBrands(brnds.brands || []);
        setMaterials(mats.materials || []);
        setAttributesList(attrs.attributes || []);
        setTagsList(tgs.tags || []);

        const productRes = await apiService.get(`/products/vendor/my-products?product_id=${productId}`);
        if (productRes.success && productRes.product) {
          const p = productRes.product;

          setFormData({
            name: p.name || '',
            category: p.category?._id || p.category || '',
            brand: p.brand?._id || p.brand || '',
            material: p.material?._id || p.material || '',
            attributes: p.attributes?.map(a => a._id || a) || [],
            tags: p.tags?.map(t => t._id || t) || [],
            description: p.description || '',
            short_description: p.short_description || '',
            care_maintenance: p.care_maintenance || '',
            warranty: p.warranty || '',
            returns: p.returns || '',
            quality_promise: p.quality_promise || '',
            pricing: {
              cost_price: p.pricing?.cost_price || 0,
              base_price: p.pricing?.base_price || 0,
              mrp: p.pricing?.mrp || 0,
              currency: p.pricing?.currency?._id || p.pricing?.currency || '',
              margin: p.pricing?.margin || 0,
            },
            shipping: {
              weight: p.shipping?.weight || '',
              dimensions: p.shipping?.dimensions || { length: '', width: '', height: '' },
              free_shipping: p.shipping?.free_shipping || false,
            },
            seo: {
              meta_title: p.seo?.meta_title || '',
              meta_description: p.seo?.meta_description || '',
              keywords: p.seo?.keywords || [],
            },
            documents: {
              product_invoice: p.documents?.product_invoice || null,
              product_certificate: p.documents?.product_certificate || null,
              quality_report: p.documents?.quality_report || null,
            },
            color_variants: p.color_variants?.length > 0
              ? p.color_variants.map(v => ({
                  color_name: v.color_name || '',
                  color_code: v.color_code || '#000000',
                  images: v.images || []
                }))
              : [{ color_name: '', color_code: '#000000', images: [] }],
            three_d_model: p.three_d_model || null,
          });
        } else {
          showErrorAlert('Error', 'Product not found');
          navigate(-1);
        }
      } catch (err) {
        console.error(err);
        showErrorAlert('Error', 'Failed to load product data');
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchData();
  }, [productId, navigate]);

  // Auto margin
  useEffect(() => {
    if (!formData) return;
    const base = parseFloat(formData.pricing.base_price) || 0;
    const cost = parseFloat(formData.pricing.cost_price) || 0;
    const margin = Math.max(base - cost, 0);
    if (margin !== formData.pricing.margin) {
      setFormData(prev => ({
        ...prev,
        pricing: { ...prev.pricing, margin }
      }));
    }
  }, [formData?.pricing?.base_price, formData?.pricing?.cost_price]);

  // Handlers
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePricingChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      pricing: { ...prev.pricing, [name]: value }
    }));
  };

  const handleShippingChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      shipping: { ...prev.shipping, [name]: value }
    }));
  };

  const handleDimensionsChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        dimensions: { ...prev.shipping.dimensions, [name]: value }
      }
    }));
  };

  const handleSeoChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, [name]: value }
    }));
  };

  const [keywordInput, setKeywordInput] = useState('');
  const addKeyword = () => {
    if (keywordInput.trim()) {
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          keywords: [...prev.seo.keywords, keywordInput.trim()]
        }
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (index) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter((_, i) => i !== index)
      }
    }));
  };

  // Variant handlers
  const addColorVariant = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      color_variants: [...prev.color_variants, { color_name: '', color_code: '#000000', images: [] }]
    }));
  }, []);

  const handleUpdateVariantField = useCallback((index, field, value) => {
    setFormData(prev => {
      const newVariants = [...prev.color_variants];
      newVariants[index][field] = value;
      return { ...prev, color_variants: newVariants };
    });
  }, []);

  const handleRemoveVariant = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      color_variants: prev.color_variants.filter((_, i) => i !== index)
    }));
  }, []);

  const handleRemoveImage = useCallback((variantIndex, imageIndex) => {
    setFormData(prev => {
      const newVariants = [...prev.color_variants];
      newVariants[variantIndex].images.splice(imageIndex, 1);
      return { ...prev, color_variants: newVariants };
    });
  }, []);

  const handleVariantImageDrop = useCallback((index, acceptedFiles) => {
    setFormData(prev => {
      const current = prev.color_variants[index].images.length;
      if (current + acceptedFiles.length > 5) {
        showErrorAlert('Limit Reached', 'Maximum 5 images per color variant');
        return prev;
      }

      const validFiles = acceptedFiles.filter(f =>
        ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(f.type)
      );

      if (validFiles.length === 0) return prev;

      const newVariants = [...prev.color_variants];
      newVariants[index].images = [...newVariants[index].images, ...validFiles];
      return { ...prev, color_variants: newVariants };
    });
  }, []);

  // Dropzones for docs & 3D
  const onDrop3DModel = useCallback((files) => {
    if (files[0]) {
      const file = files[0];
      const format = file.name.split('.').pop().toLowerCase();
      setFormData(prev => ({ ...prev, three_d_model: { file, format, alt_text: '' } }));
    }
  }, []);

  const onDropDocument = useCallback((field) => (files) => {
    if (files[0]) {
      setFormData(prev => ({
        ...prev,
        documents: { ...prev.documents, [field]: files[0] }
      }));
    }
  }, []);

  const dropzone3D = useDropzone({
    onDrop: onDrop3DModel,
    multiple: false,
    accept: { 'model/gltf-binary': ['.glb'], 'model/gltf+json': ['.gltf'], 'model/obj': ['.obj'], 'model/fbx': ['.fbx'] },
  });

  const dropzoneInvoice = useDropzone({ onDrop: onDropDocument('product_invoice'), multiple: false, accept: { 'application/pdf': [], 'image/*': [] } });
  const dropzoneCertificate = useDropzone({ onDrop: onDropDocument('product_certificate'), multiple: false, accept: { 'application/pdf': [], 'image/*': [] } });
  const dropzoneQuality = useDropzone({ onDrop: onDropDocument('quality_report'), multiple: false, accept: { 'application/pdf': [], 'image/*': [] } });

  const documentDropzones = {
    product_invoice: dropzoneInvoice,
    product_certificate: dropzoneCertificate,
    quality_report: dropzoneQuality
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      const payload = new FormData();

      // Basic
      payload.append('name', formData.name);
      payload.append('category', formData.category);
      payload.append('brand', formData.brand);
      payload.append('material', formData.material);
      payload.append('description', formData.description);
      payload.append('short_description', formData.short_description);
      payload.append('care_maintenance', formData.care_maintenance);
      payload.append('warranty', formData.warranty);
      payload.append('returns', formData.returns);
      payload.append('quality_promise', formData.quality_promise);
      payload.append('status', 'pending_verification');

      // Arrays
      formData.attributes.forEach(id => payload.append('attributes[]', id));
      formData.tags.forEach(id => payload.append('tags[]', id));

      // Pricing & Shipping
      payload.append('pricing.cost_price', formData.pricing.cost_price);
      payload.append('pricing.base_price', formData.pricing.base_price);
      payload.append('pricing.mrp', formData.pricing.mrp);
      payload.append('pricing.currency', formData.pricing.currency);

      payload.append('shipping.weight', formData.shipping.weight);
      payload.append('shipping.dimensions.length', formData.shipping.dimensions.length);
      payload.append('shipping.dimensions.width', formData.shipping.dimensions.width);
      payload.append('shipping.dimensions.height', formData.shipping.dimensions.height);
      payload.append('shipping.free_shipping', formData.shipping.free_shipping);

      // SEO
      payload.append('seo.meta_title', formData.seo.meta_title);
      payload.append('seo.meta_description', formData.seo.meta_description);
      formData.seo.keywords.forEach(kw => payload.append('seo.keywords[]', kw));

      // === COLOR VARIANTS ===
      const variantsData = formData.color_variants.map(variant => ({
        color_name: variant.color_name.trim(),
        color_code: variant.color_code,
        existing_images: variant.images
          .filter(img => !(img instanceof File))
          .map(img => ({
            _id: img._id || null,
            url: img.url,
            is_primary: img.is_primary || false,
            verified: img.verified || false
          }))
      }));
      payload.append('color_variants', JSON.stringify(variantsData));

      formData.color_variants.forEach((variant, index) => {
        const newFiles = variant.images.filter(img => img instanceof File);
        newFiles.forEach(file => {
          payload.append(`color_images_${index}`, file);
        });
      });

      // 3D Model
      if (formData.three_d_model?.file) {
        const ext = formData.three_d_model.format;
        payload.append(`threeDModel_${ext}`, formData.three_d_model.file);
        payload.append('three_d_alt', '');
      }

      // Documents
      Object.entries(formData.documents).forEach(([key, file]) => {
        if (file instanceof File) {
          payload.append(key, file);
        }
      });

      await apiService.put(`/products/${productId}`, payload);

      showSuccessAlert('Success!', 'Product updated successfully and sent for verification.');
      navigate(-1);
    } catch (err) {
      if (err.response?.data?.errors) {
        const newErrors = {};
        err.response.data.errors.forEach(e => {
          newErrors[e.field] = e.message;
        });
        setErrors(newErrors);
        showErrorAlert('Validation Failed', 'Please fix the highlighted errors.');
      } else {
        showErrorAlert('Error', err.response?.data?.message || 'Failed to update product');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderError = (field) => errors[field] ? <p className="text-red-500 text-xs mt-1">{errors[field]}</p> : null;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spin size="large" /></div>;
  if (!formData) return null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button icon={<FiArrowLeft />} onClick={() => navigate(-1)} size="large" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Update Product</h1>
            <p className="text-gray-600 mt-1">Changes will resubmit the product for admin verification</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pb-24">
          {/* All your cards here (General, Pricing, Shipping, Color Variants, 3D, Documents, SEO) */}
          {/* ... (keep all your existing Card sections exactly as before) ... */}

          {/* Example: Keep one as placeholder */}
          <Card title="General Information" className="shadow-sm">
            {/* Your general fields */}
          </Card>

          {/* ... other cards ... */}

          <Card title="Color Variants" className="shadow-sm">
            {formData.color_variants.map((variant, index) => (
              <ColorVariantItem
                key={index}
                variant={variant}
                index={index}
                colorNameError={errors[`color_variants.${index}.color_name`]}
                imagesError={errors[`color_variants.${index}.images`]}
                removable={formData.color_variants.length > 1}
                onUpdateField={handleUpdateVariantField}
                onRemoveVariant={() => handleRemoveVariant(index)}
                onRemoveImage={(imgIdx) => handleRemoveImage(index, imgIdx)}
                onDrop={handleVariantImageDrop}
              />
            ))}
            <Button type="dashed" onClick={addColorVariant} block icon={<FiPlus />} className="mt-4">
              Add Another Color Variant
            </Button>
          </Card>

          {/* Other sections... */}

        </form>

        {/* Non-fixed footer with safe spacing */}
        <div className="bg-white border-t shadow-lg py-4 px-6 mt-12">
          <div className="max-w-7xl mx-auto flex justify-end gap-4">
            <Button
              size="large"
              onClick={() => navigate(`/dashboard/${roleSlug}/products`)}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Updating...' : 'Update Product'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;