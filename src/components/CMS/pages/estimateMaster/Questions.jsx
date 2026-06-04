import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Select, Button, Modal, message, Typography, Divider, Space, 
  Empty, Spin, Popconfirm, Input, Form, Avatar, InputNumber
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, AppstoreOutlined, 
  PictureOutlined, LoadingOutlined, EyeOutlined
} from '@ant-design/icons';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';

const { Title, Text } = Typography;

const THEME = {
  primary: "#722ed1",
  bgLight: "#f9f0ff",
  border: "#efdbff",
  success: "#722ed1"
};

const API_PREFIX = '/estimate/master/category';

/* ---------- HELPER: match by label OR name (case-insensitive) ---------- */
const matchItem = (item, keyword) => {
  const label = (item?.label || item?.name || "").toLowerCase();
  return label.includes(keyword.toLowerCase());
};

const TypesGallery = () => {
  const [form] = Form.useForm();
  
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [questionType, setQuestionType] = useState("text");
  const [options, setOptions] = useState([]);
  const [isAreaQuestion, setIsAreaQuestion] = useState(false);

  /* ---------- FETCH CATEGORIES ---------- */
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await apiService.get(API_PREFIX);
        setCategories(res.categories || res.data || []);
      } catch (err) { message.error("Failed to load categories"); }
    };
    fetchCats();
  }, []);

  /* ---------- AUTO-SELECT: Landscaping > Hardscape > Paving ---------- */
  useEffect(() => {
    if (!categories.length) return;

    const autoSelect = async () => {
      // 1️⃣ Find "Landscaping"
      const cat = categories.find((c) => matchItem(c, "landscaping"));
      if (!cat) return;
      setSelectedCat(cat._id);

      // 2️⃣ Load subcategories and find "Hardscape"
      const subRes = await apiService.get(`${API_PREFIX}/${cat._id}/subcategories`);
      const subs = subRes.data || subRes.subcategories || [];
      setSubcategories(subs);

      const sub = subs.find((s) => matchItem(s, "hardscape"));
      if (!sub) return;
      setSelectedSub(sub._id);

      // 3️⃣ Load types and find "Paving"
      const typeRes = await apiService.get(
        `${API_PREFIX}/${cat._id}/subcategories/${sub._id}/types`
      );
      const typeList = typeRes.data || typeRes.types || [];
      setTypes(typeList);

      const paving = typeList.find((t) => matchItem(t, "paving"));
      if (!paving) return;
      setSelectedType(paving._id);
    };

    autoSelect().catch((err) => console.error("Auto-select error:", err));
  }, [categories]);

  /* ---------- MANUAL CHANGE HANDLERS ---------- */
  const handleCatChange = async (val) => {
    setSelectedCat(val); setSelectedSub(null); setSelectedType(null); setGallery(null);
    try {
      const res = await apiService.get(`${API_PREFIX}/${val}/subcategories`);
      setSubcategories(res.data || res.subcategories || []);
    } catch (err) { message.error("Failed to load subcategories"); }
  };

  const handleSubChange = async (val) => {
    setSelectedSub(val); setSelectedType(null); setGallery(null);
    try {
      const res = await apiService.get(`${API_PREFIX}/${selectedCat}/subcategories/${val}/types`);
      setTypes(res.data || res.types || []);
    } catch (err) { message.error("Failed to load types"); }
  };

  /* ---------- FETCH GALLERY ---------- */
  const fetchGallery = useCallback(async (typeId) => {
    if (!typeId) return;
    setLoading(true);
    try {
      const res = await apiService.get(`${API_PREFIX}/types/${typeId}/questions`);
      setGallery(res.data || null);
    } catch (err) { setGallery(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (selectedType) fetchGallery(selectedType); }, [selectedType, fetchGallery]);

  /* ---------- OPEN MODAL ---------- */
  const handleOpenModal = async (questionId = null) => {
    if (questionId) {
      setActionLoading(true);
      try {
        const res = await apiService.get(`${API_PREFIX}/types/${selectedType}/get-questions/${questionId}`);
        const data = res.data;
        
        setEditingId(questionId);
        setQuestionType(data.questionType);
        setIsAreaQuestion(!!data.areaQuestion);
        if (data.options) {
          setOptions(data.options.map(o => ({
            title: o.title,
            value: o.value,
            valueSubType: o.valueSubType || "persqft"
          })));
        } else {
          setOptions([]);
        }

        form.setFieldsValue({
          question: data.question,
          questionType: data.questionType,
          valueSubType: data.valueSubType,
          isActive: data.isActive,
          includeInEstimate: data.includeInEstimate
        });
        setQuestionModalOpen(true);
      } catch (err) {
        message.error("Failed to load details");
      } finally {
        setActionLoading(false);
      }
    } else {
      setEditingId(null);
      setQuestionType("text");
      setOptions([]);
      setIsAreaQuestion(false);
      form.resetFields();
      setQuestionModalOpen(true);
    }
  };

  /* ---------- SUBMIT ---------- */
  const onFinish = async (values) => {
    setActionLoading(true);
    const payload = {
      type: selectedType,
      question: values.question,
      areaQuestion: questionType === "number" ? isAreaQuestion : false,
      questionType,
      isActive: values.isActive ?? true,
      includeInEstimate: values.includeInEstimate ?? true,
      valueType: "number",
      valueSubType: values.valueSubType || "persqft",
      options: (questionType === "options" || questionType === "yesorno")
        ? options.map((opt, index) => ({
            title: opt.title,
            order: index + 1,
            includeInEstimate: true,
            valueType: "number",
            value: Number(opt.value) || 0,
            valueSubType: opt.valueSubType || "persqft"
          }))
        : []
    };

    try {
      if (editingId) {
        await apiService.post(`${API_PREFIX}/types/${selectedType}/question/moodboard/edit/${editingId}`, payload);
        message.success("Question updated successfully");
      } else {
        await apiService.post(`${API_PREFIX}/types/${selectedType}/question/moodboard`, payload);
        message.success("Question created successfully");
      }
      setQuestionModalOpen(false);
      fetchGallery(selectedType);
    } catch (err) {
      message.error("Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------- DELETE ---------- */
  const deleteQuestion = async (questionId) => {
    try {
      await apiService.post(`${API_PREFIX}/types/${selectedType}/question/moodboard/delete`, { question_id: questionId });
      message.success('Question deleted');
      fetchGallery(selectedType);
    } catch (err) { message.error('Failed to delete'); }
  };

  /* ---------- UI ---------- */
  return (
    <div className="p-6 bg-[#f0f2f5] min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 flex justify-between items-center border-b-4" style={{ borderBottomColor: THEME.primary }}>
          <Space size="large">
            <div className="bg-purple-600 p-3 rounded-xl shadow-lg shadow-purple-200">
              <PictureOutlined className="text-white text-2xl" />
            </div>
            <div>
              <Title level={3} className="m-0">Questions</Title>
              <Text className="text-gray-400">Manage property visually with intelligent master questions.</Text>
            </div>
          </Space>
        </div>

        {/* Filters */}
        <Card className="rounded-2xl shadow-sm mb-6 border-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Text strong className="text-xs text-gray-400 uppercase">Category</Text>
              <Select size="large" className="w-full" placeholder="Choose Category" onChange={handleCatChange} value={selectedCat}>
                {categories.map(c => (
                  <Select.Option key={c._id} value={c._id}>{c.name || c.label}</Select.Option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Text strong className="text-xs text-gray-400 uppercase">Subcategory</Text>
              <Select size="large" className="w-full" placeholder="Choose Sub" disabled={!selectedCat} onChange={handleSubChange} value={selectedSub}>
                {subcategories.map(s => (
                  <Select.Option key={s._id} value={s._id}>{s.label || s.name}</Select.Option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Text strong className="text-xs text-gray-400 uppercase">Master Type</Text>
              <Select size="large" className="w-full" placeholder="Choose Type" disabled={!selectedSub} onChange={setSelectedType} value={selectedType}>
                {types.map(t => (
                  <Select.Option key={t._id} value={t._id}>{t.label || t.name}</Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: THEME.primary }} spin />} />
          </div>
        ) : selectedType ? (
          <div className="space-y-8">
            <section>
              <div className="flex justify-between items-center mb-6 mt-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <AppstoreOutlined style={{ color: THEME.primary }} />
                  </div>
                  <Title level={4} className="m-0">Estimate Questions</Title>
                </div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ background: THEME.primary, borderRadius: 12, border: 'none' }}
                  onClick={() => handleOpenModal()}
                >
                  Add Question
                </Button>
              </div>

              {gallery && gallery.length > 0 ? (
                <Card className="rounded-2xl shadow-sm border-none">
                  {gallery.map((obj) => (
                    <div key={obj._id} className="border rounded-lg p-4 mb-4 bg-white hover:border-purple-200 transition-all">
                      <div className="flex justify-between items-start gap-4">
                        <Title level={5} className="m-0 flex-1">{obj.question}</Title>
                        <Space>
                          <Button
                            type="text"
                            className="text-purple-600 hover:bg-purple-50"
                            icon={<EyeOutlined />}
                            onClick={() => handleOpenModal(obj._id)}
                          />
                          <Popconfirm title="Delete question?" onConfirm={() => deleteQuestion(obj._id)}>
                            <Button danger type="text" icon={<DeleteOutlined />} />
                          </Popconfirm>
                        </Space>
                      </div>
                      {obj.questionType === "options" && obj.options?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {obj.options.map((opt, index) => (
                            <span key={index} className="px-3 py-1 text-sm rounded-full bg-purple-600 text-white shadow-sm">
                              {opt.title} ({opt.value})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </Card>
              ) : (
                <Empty description="No questions added for this type" className="p-20 bg-white rounded-3xl" />
              )}
            </section>

            {/* Modal */}
            <Modal
              title={
                <div className="flex items-center gap-3">
                  <Avatar size={40} style={{ background: THEME.primary }} icon={<AppstoreOutlined />} />
                  <span className="text-lg font-semibold">{editingId ? "Edit Question Details" : "Add Estimate Question"}</span>
                </div>
              }
              open={questionModalOpen}
              onCancel={() => { setQuestionModalOpen(false); form.resetFields(); }}
              footer={null}
              width={650}
              centered
              destroyOnClose
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ isActive: true, includeInEstimate: true, valueType: "number", valueSubType: "persqft" }}
              >
                <Form.Item label="Question" name="question" rules={[{ required: true, message: 'Please enter the question' }]}>
                  <Input.TextArea rows={2} placeholder="Enter question text..." />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item label="Question Type" name="questionType">
                    <Select value={questionType} onChange={(val) => {
                      setQuestionType(val);
                      if (val === "yesorno") {
                        setOptions([{ title: "Yes", valueSubType: "persqft", value: 0 }, { title: "No", valueSubType: "persqft", value: 0 }]);
                      } else if (val === "options") {
                        setOptions([{ title: "", valueSubType: "persqft", value: 0 }]);
                      } else {
                        setOptions([]);
                      }
                    }}>
                      <Select.Option value="text">Text</Select.Option>
                      <Select.Option value="options">Options</Select.Option>
                      <Select.Option value="yesorno">Yes / No</Select.Option>
                      <Select.Option value="number">Number</Select.Option>
                    </Select>
                  </Form.Item>

                  {questionType !== "text" && (
                    <Form.Item label="Default Value Sub Type" name="valueSubType">
                      <Select>
                        <Select.Option value="persqft">Per Sq. Ft</Select.Option>
                        <Select.Option value="flat">Flat</Select.Option>
                      </Select>
                    </Form.Item>
                  )}
                </div>

                {(questionType === "options" || questionType === "yesorno") && (
                  <div className="bg-gray-50 p-4 rounded-xl mb-4">
                    <Text strong className="block mb-3 text-gray-500 uppercase text-xs">Configure Options & Pricing</Text>
                    <div className="flex flex-col gap-3">
                      {options.map((opt, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-6">
                            <Input
                              placeholder="Option Title"
                              value={opt.title}
                              disabled={questionType === "yesorno"}
                              onChange={e => {
                                const newOpts = [...options];
                                newOpts[index].title = e.target.value;
                                setOptions(newOpts);
                              }}
                            />
                          </div>
                          <div className="col-span-3">
                            <Select value={opt.valueSubType} onChange={v => {
                              const newOpts = [...options];
                              newOpts[index].valueSubType = v;
                              setOptions(newOpts);
                            }}>
                              <Select.Option value="persqft">Sq.Ft</Select.Option>
                              <Select.Option value="flat">Flat</Select.Option>
                            </Select>
                          </div>
                          <div className="col-span-3">
                            <InputNumber
                              style={{ width: "100%" }}
                              placeholder="Price"
                              value={opt.value}
                              onChange={v => {
                                const newOpts = [...options];
                                newOpts[index].value = v;
                                setOptions(newOpts);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      {questionType === "options" && (
                        <Button type="dashed" block icon={<PlusOutlined />} onClick={() => setOptions([...options, { title: "", valueSubType: "persqft", value: 0 }])}>
                          Add More Option
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {questionType === "number" && (
                  <Form.Item label="Is Area Based Question ?">
                    <Select value={isAreaQuestion} onChange={(val) => setIsAreaQuestion(val)}>
                      <Select.Option value={true}>Yes (Area Based)</Select.Option>
                      <Select.Option value={false}>No (Normal Number)</Select.Option>
                    </Select>
                  </Form.Item>
                )}

                <Divider className="my-4" />

                <div className="flex justify-end gap-3">
                  <Button size="large" onClick={() => setQuestionModalOpen(false)} className="rounded-lg">
                    Cancel
                  </Button>
                  {editingId ? (
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={actionLoading}
                      style={{ background: THEME.success, border: "none", borderRadius: 8, padding: '0 30px' }}
                    >
                      Update Question
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={actionLoading}
                      style={{ background: THEME.primary, border: "none", borderRadius: 8, padding: '0 30px' }}
                    >
                      Create Question
                    </Button>
                  )}
                </div>
              </Form>
            </Modal>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-24 text-center border-2 border-dashed border-gray-100">
            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <PictureOutlined style={{ fontSize: 40, color: '#d9d9d9' }} />
            </div>
            <Title level={4} className="text-gray-300">Select a type above to start managing questions</Title>
          </div>
        )}
      </div>

      {actionLoading && !questionModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center">
          <Spin size="large" />
        </div>
      )}
    </div>
  );
};

export default TypesGallery;