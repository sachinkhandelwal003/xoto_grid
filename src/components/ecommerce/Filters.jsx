import React from 'react';
import { 
  Card, Collapse, Slider, Checkbox, Button, Space, Typography, 
  Row, Col, Drawer 
} from 'antd';
import { FilterOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const { Text, Title } = Typography;

const Filters = ({
  categories,
  brands,
  priceRange,
  setPriceRange,
  selectedCategories,
  setSelectedCategories,
  selectedBrands,
  setSelectedBrands,
  mobileFiltersOpen,
  setMobileFiltersOpen,
  showFilters,
  setShowFilters,
  resetFilters,
  isMobile = false,
}) => {
  const filterContent = (
    <>
      {/* Compact Header */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 16, 
          paddingBottom: 12,
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <Title 
          level={5} 
          style={{ 
            margin: 0, 
            fontWeight: 700, 
            color: '#4f46e5', 
            fontSize: isMobile ? '16px' : '18px' 
          }}
        >
          <FilterOutlined style={{ marginRight: 8, color: '#8b5cf6' }} /> 
          Filters
        </Title>

        <Space size={6}>
          <Button 
            size="small" 
            icon={<ReloadOutlined />} 
            onClick={resetFilters}
          >
            Reset
          </Button>
          
          {!isMobile && (
            <Button 
              size="small" 
              icon={<CloseOutlined />} 
              onClick={() => setShowFilters(false)}
            >
              Hide
            </Button>
          )}
        </Space>
      </div>

      {/* Compact Collapse */}
      <Collapse 
        defaultActiveKey={['price']} 
        ghost 
        expandIconPosition="right"
        style={{ marginBottom: 8 }}
      >
        {/* Price first (most used) */}
        <Panel 
          header={<Text strong style={{ fontSize: isMobile ? '13.5px' : '14px' }}>Price Range (AED)</Text>} 
          key="price"
        >
          <div style={{ padding: '10px 0 4px' }}>
            <Slider 
              range 
              min={0} 
              max={50000} 
              step={250} 
              value={priceRange} 
              onChange={setPriceRange} 
              trackStyle={{ background: '#8b5cf6' }}
              railStyle={{ background: '#e2e8f0' }}
            />
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: 4,
                fontSize: isMobile ? '12px' : '13px',
                color: '#64748b'
              }}
            >
              <span>AED {priceRange[0].toLocaleString()}</span>
              <span>AED {priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </Panel>

        {/* Categories */}
        <Panel 
          header={<Text strong style={{ fontSize: isMobile ? '13.5px' : '14px' }}>Categories</Text>} 
          key="categories"
        >
          <Checkbox.Group 
            value={selectedCategories} 
            onChange={setSelectedCategories} 
            style={{ width: '100%' }}
          >
            <div style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: 8 }}>
              {categories.map(cat => (
                <div key={cat._id} style={{ padding: '3px 0' }}>
                  <Checkbox 
                    value={cat._id} 
                    style={{ fontSize: isMobile ? '13px' : '14px' }}
                  >
                    {cat.name}
                  </Checkbox>
                </div>
              ))}
            </div>
          </Checkbox.Group>
        </Panel>

        {/* Brands */}
        <Panel 
          header={<Text strong style={{ fontSize: isMobile ? '13.5px' : '14px' }}>Brands</Text>} 
          key="brands"
        >
          <Checkbox.Group 
            value={selectedBrands} 
            onChange={setSelectedBrands} 
            style={{ width: '100%' }}
          >
            <div style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: 8 }}>
              {brands.map(brand => (
                <div key={brand._id} style={{ padding: '3px 0' }}>
                  <Checkbox 
                    value={brand._id} 
                    style={{ fontSize: isMobile ? '13px' : '14px' }}
                  >
                    {brand.brandName}
                  </Checkbox>
                </div>
              ))}
            </div>
          </Checkbox.Group>
        </Panel>
      </Collapse>

      {/* Mobile Apply button */}
      {isMobile && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Button 
            type="primary" 
            size="middle" 
            block 
            onClick={() => setMobileFiltersOpen(false)}
            style={{ 
              background: '#5C039B', 
              border: 'none',
              height: 42,
              fontWeight: 600
            }}
          >
            Apply Filters
          </Button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop - Compact sticky card */}
      {!isMobile && showFilters && (
        <Card 
          style={{ 
            borderRadius: '10px', 
            position: 'sticky', 
            top: 80, 
            width: '100%',
            maxWidth: '280px',        // ← yahan se chhota kiya
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }} 
          bodyStyle={{ padding: '16px' }}   // ← padding kam kiya
        >
          {filterContent}
        </Card>
      )}

      {/* Mobile Drawer */}
      <Drawer
        title={null}
        placement="left"
        onClose={() => setMobileFiltersOpen(false)}
        open={mobileFiltersOpen}
        width={isMobile ? '82%' : '340px'}   // ← mobile pe thoda chhota
        styles={{ body: { padding: '16px' } }}
      >
        {filterContent}
      </Drawer>
    </>
  );
};

export default Filters;