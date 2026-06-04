// src/pages/vendor/Inventory.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiPlus,
  FiRefreshCw,
  FiClock,
  FiEdit,
  FiArrowLeft,
  FiBox,
  FiAlertTriangle,
  FiSearch,
  FiArchive,
  FiCalendar
} from 'react-icons/fi';
import {
  Button,
  Card,
  Input,
  Form,
  Select,
  DatePicker,
  Modal,
  Row,
  Col,
  Tag,
  Space,
  Tabs,
  InputNumber,
  Badge,
  Tooltip
} from 'antd';
import moment from 'moment';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../manageApi/utils/toast';
import CustomTable from '../../../../components/CMS/pages/custom/CustomTable';
import { debounce } from 'lodash';

const { TabPane } = Tabs;
const { Option } = Select;

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1",
  secondary: "#1890ff",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
};

const Inventory = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  // --- STATE ---
  const [inventory, setInventory] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Pagination
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [historyPagination, setHistoryPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Filters
  const [filters, setFilters] = useState({ sku: '', warehouse: '' });
  const [historyFilters, setHistoryFilters] = useState({ type: '', startDate: null, endDate: null });
  
  const [warehouses, setWarehouses] = useState([]);
  
  // Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingInventory, setEditingInventory] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [form] = Form.useForm();

  // Get sku from query params for history filtering
  const searchParams = new URLSearchParams(location.search);
  const historySku = searchParams.get('sku') || '';

  // --- API CALLS ---

  // Fetch warehouses
  const fetchWarehouses = useCallback(async () => {
    try {
      const response = await apiService.get('/vendor/warehouses', { vendor_id: user.id });
      if (response.success) {
        setWarehouses(response.warehouses || []);
      }
    } catch (error) {
      showToast('Failed to fetch warehouses', 'error');
    }
  }, [user.id]);

  // Fetch inventory
  const fetchInventory = useCallback(async (page = 1, pageSize = 10, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
        sku: currentFilters.sku || undefined,
        warehouse: currentFilters.warehouse || undefined,
      };
      const response = await apiService.get(`/products/${productId}/inventory`, params);
      if (response.success) {
        setInventory(response.inventory || []);
        setPagination({
          current: response.pagination?.page || 1,
          pageSize: response.pagination?.limit || 10,
          total: response.pagination?.total || 0,
        });
      }
    } catch (error) {
      showToast('Failed to fetch inventory', 'error');
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }, [productId, filters]);

  // Fetch inventory history
  const fetchInventoryHistory = useCallback(async (page = 1, pageSize = 10, currentFilters = historyFilters) => {
    setHistoryLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
        sku: historySku || currentFilters.sku || undefined,
        type: currentFilters.type || undefined,
        startDate: currentFilters.startDate ? moment(currentFilters.startDate).toISOString() : undefined,
        endDate: currentFilters.endDate ? moment(currentFilters.endDate).toISOString() : undefined,
      };
      const response = await apiService.get(`/products/${productId}/inventory/history`, params);
      if (response.success) {
        setHistory(response.movements || []);
        setHistoryPagination({
          current: response.pagination?.page || 1,
          pageSize: response.pagination?.limit || 10,
          total: response.pagination?.total || 0,
        });
      }
    } catch (error) {
      showToast('Failed to fetch history', 'error');
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [productId, historySku, historyFilters]);

  // Debounced handlers
  const debouncedHandleFilter = useCallback(debounce((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Note: useEffect will trigger the fetch when filters change if included in deps, 
    // but here we manually call or let the effect handle it.
    // For safety, relying on effect dependency or manual call:
    fetchInventory(1, pagination.pageSize, { ...filters, ...newFilters });
  }, 500), [fetchInventory, pagination.pageSize, filters]);

  const debouncedHandleHistoryFilter = useCallback(debounce((newFilters) => {
    setHistoryFilters(prev => ({ ...prev, ...newFilters }));
    fetchInventoryHistory(1, historyPagination.pageSize, { ...historyFilters, ...newFilters });
  }, 500), [fetchInventoryHistory, historyPagination.pageSize, historyFilters]);

  // Initial Load
  useEffect(() => {
    if (user.id && productId) {
      fetchWarehouses();
      fetchInventory(pagination.current, pagination.pageSize, filters);
      fetchInventoryHistory(historyPagination.current, historyPagination.pageSize, { ...historyFilters, sku: historySku });
    }
  }, [refreshTrigger]); // Keep dependencies minimal to avoid loops, rely on explicit refresh

  // --- HANDLERS ---

  const handleInventoryPageChange = (page, pageSize) => {
    fetchInventory(page, pageSize, filters);
  };

  const handleHistoryPageChange = (page, pageSize) => {
    fetchInventoryHistory(page, pageSize, historyFilters);
  };

  const showModal = (inventoryItem = null) => {
    setEditingInventory(inventoryItem);
    if (inventoryItem) {
      form.setFieldsValue({
        sku: inventoryItem.sku,
        quantity: inventoryItem.quantity,
        low_stock_threshold: inventoryItem.low_stock_threshold,
        warehouse: inventoryItem.warehouse?._id,
        expiry_date: inventoryItem.expiry_date ? moment(inventoryItem.expiry_date) : null,
        type: 'adjustment',
        note: '',
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ type: 'initial', low_stock_threshold: 5 });
    }
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        sku: values.sku.trim(),
        quantity: parseInt(values.quantity),
        low_stock_threshold: parseInt(values.low_stock_threshold),
        warehouse: values.warehouse,
        note: values.note,
        type: values.type,
        expiry_date: values.expiry_date ? moment(values.expiry_date).toISOString() : undefined
      };

      const url = editingInventory 
        ? `/products/${productId}/inventory` 
        : `/products/${productId}/inventory/create`;
      
      const method = editingInventory ? 'put' : 'post';
      
      await apiService[method](url, payload);
      
      showToast(editingInventory ? 'Inventory updated' : 'Inventory created', 'success');
      setIsModalVisible(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      showToast(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  // --- COLUMNS ---

  const inventoryColumns = useMemo(() => [
    {
      title: 'SKU Info',
      width: 200,
      render: (_, r) => (
        <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 rounded text-purple-600"><FiBox /></div>
            <div>
                <div className="font-semibold text-gray-800">{r.sku || '--'}</div>
                <div className="text-xs text-gray-400">ID: {r._id?.substring(0, 8)}...</div>
            </div>
        </div>
      ),
    },
    {
      title: 'Stock Level',
      width: 150,
      render: (_, r) => (
        <div>
            <div className="text-lg font-bold text-gray-700">{r.quantity}</div>
            <div className="text-xs text-gray-500">Reserved: {r.reserved || 0}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      width: 120,
      render: (_, r) => (
        <Tag color={r.low_stock ? 'red' : 'green'} icon={r.low_stock ? <FiAlertTriangle /> : <FiClock />}>
          {r.low_stock ? 'Low Stock' : 'In Stock'}
        </Tag>
      ),
    },
    {
      title: 'Warehouse',
      dataIndex: ['warehouse', 'name'],
      width: 180,
      render: (text) => <span className="text-gray-600">{text || 'N/A'}</span>
    },
    {
      title: 'Expiry',
      dataIndex: 'expiry_date',
      width: 120,
      render: (date) => date ? (
        <span className={moment(date).isBefore(moment()) ? 'text-red-500 font-medium' : 'text-gray-600'}>
            {moment(date).format('DD MMM YYYY')}
        </span>
      ) : <span className="text-gray-400">--</span>
    },
    {
      title: 'Actions',
      fixed: 'right',
      width: 120,
      render: (_, r) => (
        <Space>
          <Tooltip title="View History">
             <Button 
                type="text" 
                shape="circle" 
                icon={<FiClock className="text-blue-500" />}
                // onClick={() => navigate(`/sawtar/cms/seller/b2c/product/inventory/${productId}/history?sku=${r.sku}`)}
             />
          </Tooltip>
          <Tooltip title="Edit Stock">
             <Button 
                type="text" 
                shape="circle" 
                icon={<FiEdit className="text-green-600" />}
                onClick={() => showModal(r)}
             />
          </Tooltip>
        </Space>
      ),
    },
  ], []);

  const historyColumns = useMemo(() => [
    {
        title: 'Movement Info',
        width: 200,
        render: (_, r) => (
            <div>
                <div className="font-medium text-gray-800">{r.sku}</div>
                <Tag className="mt-1 capitalize" color={r.type === 'in' ? 'blue' : r.type === 'out' ? 'orange' : 'default'}>
                    {r.type}
                </Tag>
            </div>
        )
    },
    {
        title: 'Quantity Change',
        dataIndex: 'quantity',
        width: 120,
        render: (val, r) => (
            <span className={`font-bold ${r.type === 'out' ? 'text-red-500' : 'text-green-600'}`}>
                {r.type === 'out' ? '-' : '+'}{val}
            </span>
        )
    },
    {
        title: 'Note',
        dataIndex: 'note',
        width: 250,
        render: (text) => <span className="text-gray-500 italic">{text || 'No remarks'}</span>
    },
    {
        title: 'Date',
        dataIndex: 'date',
        width: 180,
        render: (date) => (
            <div className="flex items-center gap-2 text-gray-600">
                <FiCalendar /> {moment(date).format('DD MMM YYYY, h:mm a')}
            </div>
        )
    }
  ], []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* 1. Header */}
      <div className="mb-6">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div className="flex items-center gap-3">
                 <Button 
                    icon={<FiArrowLeft />} 
                    type="text" 
                    onClick={() => navigate(-1)} 
                    className="text-gray-500 hover:text-gray-700"
                 />
                 <div>
                    <h1 className="text-2xl font-bold text-gray-900 m-0">Inventory Management</h1>
                    <p className="text-gray-500 m-0">Manage stock levels across warehouses</p>
                 </div>
             </div>
             
             <div className="flex gap-2">
                 <Button 
                    icon={<FiRefreshCw className={loading ? 'animate-spin' : ''} />} 
                    onClick={() => setRefreshTrigger(p => p + 1)}
                 >
                    Refresh
                 </Button>
                 <Button 
                    type="primary" 
                    icon={<FiPlus />} 
                    onClick={() => showModal()}
                    style={{ backgroundColor: THEME.primary }}
                 >
                    Add Stock
                 </Button>
             </div>
         </div>
      </div>

      {/* 2. Main Content Card */}
      <Card bordered={false} className="shadow-md rounded-lg" bodyStyle={{ padding: 0 }}>
         
         <Tabs 
            defaultActiveKey="inventory" 
            size="large"
            tabBarStyle={{ margin: 0, paddingLeft: 16, paddingTop: 16, background: '#fafafa' }}
            type="card"
         >
            {/* TAB 1: INVENTORY */}
            <TabPane tab={<Space><FiArchive /> Current Stock</Space>} key="inventory">
                {/* Filters */}
                <div className="p-4 border-b border-gray-100 bg-white">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                            <Input 
                                prefix={<FiSearch className="text-gray-400"/>}
                                placeholder="Search by SKU..." 
                                onChange={(e) => debouncedHandleFilter({ sku: e.target.value })}
                            />
                        </Col>
                        <Col xs={24} md={8}>
                            <Select 
                                style={{ width: '100%' }} 
                                placeholder="Filter by Warehouse"
                                allowClear
                                onChange={(val) => debouncedHandleFilter({ warehouse: val })}
                            >
                                {warehouses.map(w => <Option key={w._id} value={w._id}>{w.name}</Option>)}
                            </Select>
                        </Col>
                        <Col xs={24} md={8} className="flex justify-end">
                            <Button onClick={() => {
                                setFilters({ sku: '', warehouse: '' });
                                fetchInventory(1, pagination.pageSize, { sku: '', warehouse: '' });
                            }}>
                                Clear Filters
                            </Button>
                        </Col>
                    </Row>
                </div>

                {/* Table */}
                <div className="p-0">
                    <CustomTable 
                        columns={inventoryColumns}
                        data={inventory}
                        loading={loading}
                        totalItems={pagination.total}
                        currentPage={pagination.current}
                        itemsPerPage={pagination.pageSize}
                        onPageChange={handleInventoryPageChange}
                        scroll={{ x: 1000 }}
                    />
                </div>
            </TabPane>

            {/* TAB 2: HISTORY */}
            <TabPane tab={<Space><FiClock /> Movement History {historySku && `(SKU: ${historySku})`}</Space>} key="history">
                 {/* Filters */}
                 <div className="p-4 border-b border-gray-100 bg-white">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={6}>
                            <Select 
                                style={{ width: '100%' }} 
                                placeholder="Movement Type"
                                allowClear
                                onChange={(val) => debouncedHandleHistoryFilter({ type: val })}
                            >
                                <Option value="in">Stock In</Option>
                                <Option value="out">Stock Out</Option>
                                <Option value="adjustment">Adjustment</Option>
                                <Option value="initial">Initial</Option>
                            </Select>
                        </Col>
                        <Col xs={24} md={6}>
                            <DatePicker 
                                style={{ width: '100%' }} 
                                placeholder="Start Date"
                                onChange={(date) => debouncedHandleHistoryFilter({ startDate: date })}
                            />
                        </Col>
                        <Col xs={24} md={6}>
                            <DatePicker 
                                style={{ width: '100%' }} 
                                placeholder="End Date"
                                onChange={(date) => debouncedHandleHistoryFilter({ endDate: date })}
                            />
                        </Col>
                        <Col xs={24} md={6}>
                            <Button block onClick={() => {
                                setHistoryFilters({ type: '', startDate: null, endDate: null });
                                fetchInventoryHistory(1, historyPagination.pageSize, {});
                            }}>
                                Reset
                            </Button>
                        </Col>
                    </Row>
                </div>

                {/* Table */}
                <div className="p-0">
                    <CustomTable 
                        columns={historyColumns}
                        data={history}
                        loading={historyLoading}
                        totalItems={historyPagination.total}
                        currentPage={historyPagination.current}
                        itemsPerPage={historyPagination.pageSize}
                        onPageChange={handleHistoryPageChange}
                        scroll={{ x: 800 }}
                    />
                </div>
            </TabPane>
         </Tabs>
      </Card>

      {/* CREATE / EDIT MODAL */}
      <Modal
        open={isModalVisible}
        title={editingInventory ? 'Update Stock' : 'Add New Inventory'}
        onCancel={() => { setIsModalVisible(false); form.resetFields(); }}
        footer={null}
        width={600}
        destroyOnClose
      >
         <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
                        <Input disabled={!!editingInventory} placeholder="e.g. ITEM-001" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="warehouse" label="Warehouse" rules={[{ required: true }]}>
                        <Select placeholder="Select Location">
                            {warehouses.map(w => <Option key={w._id} value={w._id}>{w.name}</Option>)}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="low_stock_threshold" label="Low Stock Alert Limit">
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="type" label="Movement Type" rules={[{ required: true }]}>
                        <Select>
                            <Option value="initial">Initial Stock</Option>
                            <Option value="in">Stock In (Purchase)</Option>
                            <Option value="out">Stock Out (Sale/Loss)</Option>
                            <Option value="adjustment">Correction/Adjustment</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="expiry_date" label="Expiry Date (Optional)">
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item name="note" label="Notes / Remarks">
                <Input.TextArea rows={2} placeholder="Reason for update..." />
            </Form.Item>

            <div className="flex justify-end gap-3 pt-2">
                <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit" style={{ backgroundColor: THEME.primary }}>
                    {editingInventory ? 'Update Inventory' : 'Add Inventory'}
                </Button>
            </div>
         </Form>
      </Modal>

    </div>
  );
};

export default Inventory;