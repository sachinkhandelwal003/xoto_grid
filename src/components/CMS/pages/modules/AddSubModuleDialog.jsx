// src/components/module/AddSubModuleDialog.jsx
import { Modal, Form, Input, Button, Switch } from 'antd';
import { useForm, Controller } from 'react-hook-form';

export const AddSubModuleDialog = ({ open, onCancel, onSubmit }) => {
  const { control, handleSubmit, reset } = useForm();

  const onOk = (data) => {
    onSubmit(data);
    reset();
  };

  return (
    <Modal title="Add Sub-module" open={open} onCancel={onCancel} footer={null}>
      <Form layout="vertical" onFinish={handleSubmit(onOk)}>
        <Controller
          name="name"
          control={control}
          rules={{ required: true }}
          render={({ field, fieldState: { error } }) => (
            <Form.Item label="Name" required validateStatus={error ? 'error' : ''}>
              <Input {...field} />
            </Form.Item>
          )}
        />
        <Controller
          name="route"
          control={control}
          rules={{ required: true }}
          render={({ field, fieldState: { error } }) => (
            <Form.Item label="Route" required validateStatus={error ? 'error' : ''}>
              <Input {...field} />
            </Form.Item>
          )}
        />
        <Controller
          name="dashboardView"
          control={control}
          render={({ field }) => (
            <Form.Item label="Show on Dashboard">
              <Switch {...field} checked={field.value} />
            </Form.Item>
          )}
        />
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" style={{ marginLeft: 8 }}>Add</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};