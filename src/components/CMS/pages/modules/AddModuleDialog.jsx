// src/components/module/AddModuleDialog.jsx
import { Modal, Form, Input, Button, Space, Switch, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

const { Item } = Form;

export const AddModuleDialog = ({ open, onCancel, onSubmit, defaultValues = {} }) => {
  const { control, handleSubmit, reset } = useForm({ defaultValues });
  const { fields, append, remove } = useFieldArray({ control, name: 'subModules' });

  const onOk = (data) => {
    onSubmit(data);
    reset();
  };

  return (
    <Modal title="Add Module + Sub-modules" open={open} onCancel={onCancel} footer={null} width={720}>
      <Form layout="vertical" onFinish={handleSubmit(onOk)}>
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Name is required' }}
          render={({ field, fieldState: { error } }) => (
            <Item label="Name" required validateStatus={error ? 'error' : ''} help={error?.message}>
              <Input {...field} placeholder="Products" />
            </Item>
          )}
        />

        <Controller
          name="route"
          control={control}
          rules={{ required: 'Route is required' }}
          render={({ field, fieldState: { error } }) => (
            <Item label="Route" required validateStatus={ error ? 'error' : '' } help={error?.message}>
              <Input {...field} placeholder="/products" />
            </Item>
          )}
        />

        <Controller
          name="icon"
          control={control}
          render={({ field }) => (
            <Item label="Icon (FontAwesome)" help="e.g. fas fa-box">
              <Input {...field} placeholder="fas fa-folder" />
            </Item>
          )}
        />

        {/* ----- Sub-modules ----- */}
        <Item label="Sub-modules (optional)">
          <Space direction="vertical" style={{ width: '100%' }}>
            {fields.map((field, idx) => (
              <Space key={field.id} align="baseline" style={{ width: '100%' }}>
                <Controller
                  name={`subModules[${idx}].name`}
                  control={control}
                  render={({ field }) => <Input {...field} placeholder="Name" />}
                />
                <Controller
                  name={`subModules[${idx}].route`}
                  control={control}
                  render={({ field }) => <Input {...field} placeholder="/products/list" />}
                />
                <Controller
                  name={`subModules[${idx}].icon`}
                  control={control}
                  render={({ field }) => <Input {...field} placeholder="fas fa-list" />}
                />
                <Controller
                  name={`subModules[${idx}].dashboardView336`}
                  control={control}
                  render={({ field }) => <Switch {...field} checked={field.value} />}
                />
                <Button danger icon={<DeleteOutlined />} onClick={() => remove(idx)} />
              </Space>
            ))}
            <Button
              type="dashed"
              onClick={() => append({ name: '', route: '', icon: '', dashboardView: false })}
              block
              icon={<PlusOutlined />}
            >
              Add Sub-module
            </Button>
          </Space>
        </Item>

        <Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit">Create</Button>
          </Space>
        </Item>
      </Form>
    </Modal>
  );
};