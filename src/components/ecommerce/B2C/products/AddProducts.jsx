// src/pages/vendor/AddProducts.jsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FiPlus, FiX, FiUploadCloud } from 'react-icons/fi';
import { Button, Card, ColorPicker, Input, Select, Checkbox, Row, Col, Alert, InputNumber, message } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { showSuccessAlert, showErrorAlert } from '../../../../manageApi/utils/sweetAlert';

const { Option } = Select;

// Helper to get role slug
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

const ColorVariantItem = memo(({ 
  variant, 
  index, 
  colorNameError, 
  imagesError, 
  removable, 
  onUpdateField, 
  onRemoveVariant, 
  onRemoveImage, 
  onUpdateAlt, 
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
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">Variant {index + 1}</h4>
        <Button type="text" danger onClick={onRemoveVariant} disabled={!removable}>
          <FiX size={16} />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-2">
        <div>
          <label className="block text-sm font-medium mb-1">Color Name *</label>
          <Input
            size="large"
            value={variant.color_name}
            onChange={(e) => onUpdateField('color_name', e.target.value)}
            status={colorNameError ? 'error' : ''}
            placeholder="e.g. Red, Blue"
          />
          {colorNameError && <p className="text-red-500 text-xs italic mt-1">{colorNameError}</p>}
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
        className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-indigo-500 bg-gray-50 transition-colors"
      >
        <input {...getInputProps()} />
        <FiUploadCloud className="mx-auto text-4xl text-gray-400" />
        <p className="text-gray-600 mt-2">
          Drag 'n' drop images for {variant.color_name || `Variant ${index + 1}`}
        </p>
        <p className="text-xs text-gray-500">JPEG, PNG, JPG, GIF (max 5MB each, up to 5 total)</p>
      </div>
      {imagesError && <p className="text-red-500 text-xs italic mt-1">{imagesError}</p>}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {variant.images.map((file, i) => (
          <div key={i} className="relative border border-gray-200 rounded-md p-2 bg-white shadow-sm">
            <img
              src={URL.createObjectURL(file)}
              alt={`Preview ${i + 1}`}
              className="w-full h-32 object-cover rounded-md"
            />
            <Button
              type="text"
              danger
              className="absolute top-1 right-1 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-1 h-auto"
              onClick={() => onRemoveImage(i)}
            >
              <FiX size={14} />
            </Button>
            <div className="mt-2">
              <Checkbox
                checked={variant.images[i]?.is_primary || (i === 0)}
                onChange={(e) => {
                  // Update primary image logic
                  const updatedImages = variant.images.map((img, idx) => ({
                    ...img,
                    is_primary: idx === i ? e.target.checked : false
                  }));
                  onUpdateField('images', updatedImages);
                }}
                className="text-xs"
              >
                Primary
              </Checkbox>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const AddProducts = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Calculate role slug for dynamic links
  const roleSlug = user ? getRoleSlug(user.role.code) : 'dashboard';

  const [formData, setFormData] = useState({
    vendor: user?.id || '',
    category: '',
    brand: '',
    material: '',
    attributes: [],
    tags: [],
    name: '',
    description: '',
    short_description: '',
    pricing: {
      cost_price: 0,
      base_price: 0,
      currency: '',
    },
    color_variants: [{ 
      color_name: '', 
      color_code: '#000000', 
      images: [] 
    }],
    status: 'pending_verification'
  });

  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [currency, setCurrency] = useState({ id: '', name: '' });
  const [brands, setBrands] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [attributesList, setAttributesList] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch reference data
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
            
            if (curr.currency) {
                setCurrency({ id: curr.currency._id, name: curr.currency.name });
                setFormData(prev => ({ 
                  ...prev, 
                  pricing: { 
                    ...prev.pricing, 
                    currency: curr.currency._id 
                  } 
                }));
            }

            setBrands(brnds.brands || []);
            setMaterials(mats.materials || []);
            setAttributesList(attrs.attributes || []);
            setTagsList(tgs.tags || []);

        } catch (err) {
            console.error("Failed to fetch initial data", err);
        }
    };
    fetchData();
  }, []);

  // Form Change Handlers
  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handlePricingChange = (name, value) => {
    setFormData({
      ...formData,
      pricing: { ...formData.pricing, [name]: Number(value) || 0 },
    });
    setErrors({ ...errors, [`pricing.${name}`]: '' });
  };

  // Color Variant Logic
  const addColorVariant = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      color_variants: [
        ...prev.color_variants,
        { color_name: '', color_code: '#000000', images: [] },
      ],
    }));
  }, []);

  const handleUpdateVariantField = useCallback((index, field, value) => {
    setFormData((prev) => {
      const newVariants = [...prev.color_variants];
      newVariants[index][field] = value;
      return { ...prev, color_variants: newVariants };
    });
  }, []);

  const handleRemoveVariant = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      color_variants: prev.color_variants.filter((_, i) => i !== index),
    }));
  }, []);

  const handleRemoveImage = useCallback((variantIndex, imageIndex) => {
    setFormData((prev) => {
      const newVariants = [...prev.color_variants];
      newVariants[variantIndex].images.splice(imageIndex, 1);
      return { ...prev, color_variants: newVariants };
    });
  }, []);

  const handleVariantImageDrop = useCallback((index, acceptedFiles) => {
    setFormData((prev) => {
      const variant = prev.color_variants[index];
      const currentLength = variant.images.length;
      const maxAdditional = 5 - currentLength;
      
      if (acceptedFiles.length > maxAdditional) {
        message.error(`Maximum 5 images allowed. You can add ${maxAdditional} more.`);
        return prev;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      const maxSize = 5 * 1024 * 1024;
      const validFiles = acceptedFiles.filter((file) => allowedTypes.includes(file.type) && file.size <= maxSize);
      
      if (validFiles.length === 0) {
        message.error('Invalid file type or size. Only JPEG, PNG, JPG, GIF up to 5MB allowed.');
        return prev;
      }
      
      const newVariants = [...prev.color_variants];
      newVariants[index] = {
        ...newVariants[index],
        images: [...newVariants[index].images, ...validFiles],
      };
      return { ...prev, color_variants: newVariants };
    });
  }, []);

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields from schema
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.brand) {
      newErrors.brand = 'Brand is required';
    }
    
    if (!formData.material) {
      newErrors.material = 'Material is required';
    }
    
    if (!formData.pricing.cost_price || formData.pricing.cost_price <= 0) {
      newErrors['pricing.cost_price'] = 'Cost price must be greater than 0';
    }
    
    if (!formData.pricing.base_price || formData.pricing.base_price <= 0) {
      newErrors['pricing.base_price'] = 'Base price must be greater than 0';
    }
    
    if (!formData.pricing.currency) {
      newErrors['pricing.currency'] = 'Currency is required';
    }
    
    // Validate color variants
    if (!formData.color_variants || formData.color_variants.length === 0) {
      newErrors.color_variants = 'At least one color variant is required';
    } else {
      formData.color_variants.forEach((variant, index) => {
        if (!variant.color_name || variant.color_name.trim() === '') {
          newErrors[`color_variants.${index}.color_name`] = 'Color name is required';
        }
        
        if (!variant.images || variant.images.length === 0) {
          newErrors[`color_variants.${index}.images`] = 'At least one image is required';
        } else if (variant.images.length > 5) {
          newErrors[`color_variants.${index}.images`] = 'Maximum 5 images allowed';
        }
      });
    }
    
    return newErrors;
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);

    try {
      const payload = new FormData();
      
      // Basic required fields
      payload.append('name', formData.name);
      payload.append('category', formData.category);
      payload.append('brand', formData.brand);
      payload.append('material', formData.material);
      
      // Optional fields
      if (formData.description) {
        payload.append('description', formData.description);
      }
      if (formData.short_description) {
        payload.append('short_description', formData.short_description);
      }
      
      // Arrays (Attributes & Tags)
      formData.attributes.forEach((attr) => payload.append('attributes[]', attr));
      formData.tags.forEach((tag) => payload.append('tags[]', tag));
      
      // Pricing (required)
      payload.append('pricing.cost_price', formData.pricing.cost_price);
      payload.append('pricing.base_price', formData.pricing.base_price);
      payload.append('pricing.currency', formData.pricing.currency);
      
      // Color Variants (JSON String for data, direct files for images)
      const variantsData = formData.color_variants.map(v => ({
        color_name: v.color_name,
        color_code: v.color_code,
        // images will be handled by file uploads
      }));
      payload.append('color_variants', JSON.stringify(variantsData));
      
      // Append Images with specific keys matching Multer config (color_images_0, color_images_1...)
      formData.color_variants.forEach((variant, index) => {
        variant.images.forEach((file, imgIndex) => {
          payload.append(`color_images_${index}`, file);
        });
      });
      
      const response = await apiService.post('/products', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      showSuccessAlert('Success', 'Product created and submitted for verification');
      navigate(`/dashboard/${roleSlug}/products/my`);
    } catch (err) {
      console.error('API Error:', err);
      if (err.response?.data?.errors) {
        // Handle validation errors from backend
        const newErrors = {};
        err.response.data.errors.forEach((error) => {
          newErrors[error.field] = error.message;
        });
        setErrors(newErrors);
        showErrorAlert('Validation Error', 'Please check the form for errors.');
      } else {
        showErrorAlert('Error', err.response?.data?.message || 'Failed to create product');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field) => {
    return errors[field] ? <p className="text-red-500 text-xs italic mt-1">{errors[field]}</p> : null;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
          <p className="text-gray-600 mt-1">Products will be submitted for verification before publishing</p>
        </div>
        <Button onClick={() => navigate(-1)}>Cancel</Button>
      </div>
      
      {/* Show general validation errors */}
      {Object.keys(errors).length > 0 && !errors.name && !errors.category && !errors.brand && 
        !errors.material && !errors['pricing.cost_price'] && !errors['pricing.base_price'] && 
        !errors.color_variants && (
        <Alert
          message="Please fill all required fields"
          description="Some required fields are missing. Please check the form."
          type="warning"
          showIcon
          closable
          className="mb-4"
        />
      )}
      
      <form onSubmit={handleSubmit}>
        {/* General Information Section */}
        <Card title="General Information" className="mb-6 shadow-sm">
          <div className="space-y-6">
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    size="large"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    status={errors.name ? 'error' : ''}
                    placeholder="e.g. Wooden Chair"
                  />
                  {renderError('name')}
                </div>
              </Col>
              
              <Col span={12}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Select
                    size="large"
                    value={formData.category}
                    onChange={(value) => handleChange('category', value)}
                    className="w-full"
                    status={errors.category ? 'error' : ''}
                    showSearch
                    optionFilterProp="children"
                    placeholder="Select Category"
                  >
                    {categories.map((cat) => (
                      <Option key={cat._id} value={cat._id}>{cat.name}</Option>
                    ))}
                  </Select>
                  {renderError('category')}
                </div>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <Select
                    size="large"
                    value={formData.brand}
                    onChange={(value) => handleChange('brand', value)}
                    className="w-full"
                    status={errors.brand ? 'error' : ''}
                    showSearch
                    optionFilterProp="children"
                    placeholder="Select Brand"
                  >
                    {brands.map((brand) => (
                      <Option key={brand._id} value={brand._id}>{brand.name}</Option>
                    ))}
                  </Select>
                  {renderError('brand')}
                </div>
              </Col>
              
              <Col span={12}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material <span className="text-red-500">*</span>
                  </label>
                  <Select
                    size="large"
                    value={formData.material}
                    onChange={(value) => handleChange('material', value)}
                    className="w-full"
                    status={errors.material ? 'error' : ''}
                    showSearch
                    optionFilterProp="children"
                    placeholder="Select Material"
                  >
                    {materials.map((mat) => (
                      <Option key={mat._id} value={mat._id}>{mat.name}</Option>
                    ))}
                  </Select>
                  {renderError('material')}
                </div>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attributes</label>
                    <Select
                      mode="multiple"
                      size="large"
                      value={formData.attributes}
                      onChange={(value) => handleChange('attributes', value)}
                      className="w-full"
                      placeholder="Select Attributes (optional)"
                    >
                      {attributesList.map((attr) => (
                        <Option key={attr._id} value={attr._id}>{attr.name}</Option>
                      ))}
                    </Select>
                  </div>
                  <Link to={`/dashboard/${roleSlug}/attributes/add`} target="_blank" className="ant-btn ant-btn-default mb-[2px]">
                    <FiPlus />
                  </Link>
                </div>
              </Col>
              
              <Col span={12}>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <Select
                      mode="multiple"
                      size="large"
                      value={formData.tags}
                      onChange={(value) => handleChange('tags', value)}
                      className="w-full"
                      placeholder="Select Tags (optional)"
                    >
                      {tagsList.map((tag) => (
                        <Option key={tag._id} value={tag._id}>{tag.name}</Option>
                      ))}
                    </Select>
                  </div>
                  <Link to={`/dashboard/${roleSlug}/tags/add`} target="_blank" className="ant-btn ant-btn-default mb-[2px]">
                    <FiPlus />
                  </Link>
                </div>
              </Col>
            </Row>
           
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <ReactQuill
                value={formData.description}
                onChange={(value) => handleChange('description', value)}
                theme="snow"
                className="h-40 mb-12"
                placeholder="Product description..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <Input.TextArea
                value={formData.short_description}
                onChange={(e) => handleChange('short_description', e.target.value)}
                rows={2}
                placeholder="Brief product description..."
              />
            </div>
          </div>
        </Card>

        {/* Pricing Section */}
        <Card title="Pricing" className="mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            <div>
              <label className="block text-sm font-medium mb-1">
                Cost Price <span className="text-red-500">*</span>
              </label>
              <InputNumber
                size="large"
                value={formData.pricing.cost_price}
                onChange={(value) => handlePricingChange('cost_price', value)}
                min={0}
                step="0.01"
                // prefix={currency.name || '$'}
                className="w-full"
                status={errors['pricing.cost_price'] ? 'error' : ''}
                placeholder="0.00"
              />
              {renderError('pricing.cost_price')}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Base Price (Selling) <span className="text-red-500">*</span>
              </label>
              <InputNumber
                size="large"
                value={formData.pricing.base_price}
                onChange={(value) => handlePricingChange('base_price', value)}
                min={0}
                step="0.01"
                // prefix={currency.name || '$'}
                className="w-full"
                status={errors['pricing.base_price'] ? 'error' : ''}
                placeholder="0.00"
              />
              {renderError('pricing.base_price')}
            </div>
         
            
          </div>
        </Card>

        {/* Color Variants Section */}
        <Card title="Color Variants" className="mb-6 shadow-sm">
          {errors.color_variants && (
            <Alert
              message={errors.color_variants}
              type="error"
              showIcon
              className="mb-4"
            />
          )}
          
          {formData.color_variants.map((variant, index) => {
            const colorNameError = errors[`color_variants.${index}.color_name`];
            const imagesError = errors[`color_variants.${index}.images`];
            const removable = formData.color_variants.length > 1;
            return (
              <ColorVariantItem
                key={index}
                variant={variant}
                index={index}
                colorNameError={colorNameError}
                imagesError={imagesError}
                removable={removable}
                onUpdateField={(field, value) => handleUpdateVariantField(index, field, value)}
                onRemoveVariant={() => handleRemoveVariant(index)}
                onRemoveImage={(imageIndex) => handleRemoveImage(index, imageIndex)}
                onUpdateAlt={() => {}}
                onDrop={handleVariantImageDrop}
              />
            );
          })}
          <Button type="dashed" onClick={addColorVariant} block icon={<FiPlus />}>
            Add Another Color Variant
          </Button>
        </Card>

        {/* Submit Button Section - NOT Fixed (Scrolls with page) */}
        <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
          <Button size="large" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" size="large" loading={loading}>
            {loading ? 'Creating...' : 'Submit for Verification'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProducts;