// src/cms/components/common/ContentLoader.jsx
import React from 'react';
import { Spin } from 'antd';

const ContentLoader = ({ loading, minHeight = '60vh' }) => {
  if (!loading) return null;

  return (
    <div
      style={{
        minHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
      }}
    >
      <Spin size="large" tip="Loading..." />
    </div>
  );
};

export default ContentLoader;