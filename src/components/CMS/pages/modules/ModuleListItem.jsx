// src/components/module/ModuleListItem.jsx
import { Box, Typography, IconButton, Button, Switch, Chip } from '@mui/material';
import { Edit, Delete, Add, Restore } from '@mui/icons-material';
import { SortableAccordion, SortableSubAccordion } from './SortableAccordion';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { moduleService } from './module.service';
import { showToast } from '../../../../manageApi/utils/toast';

export const ModuleListItem = ({
  module,
  onModuleEdit,
  onModuleDelete,
  onModuleRestore,
  onSubAdd,
  onSubEdit,
  onSubDelete,
  onSubRestore,
  onSubReorder,
}) => {
  const [editing, setEditing] = useState(false);
  const { control, handleSubmit, reset, setValue } = useForm();

  const startEdit = () => {
    setValue('name', module.name);
    setValue('route', module.route);
    setEditing(true);
  };
  const cancelEdit = () => { setEditing(false); reset(); };
  const saveEdit = async (data) => {
    await moduleService.update(module._id, data);
    showToast('Module updated', 'success');
    setEditing(false);
    onModuleEdit();
  };

  return (
    <SortableAccordion id={module._id}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {module.name} ({module.subModules?.filter(s => !s.isDeleted).length ?? 0})
        </Typography>
        <Box>
          {module.isDeleted ? (
            <IconButton onClick={() => onModuleRestore(module._id)} color="primary"><Restore /></IconButton>
          ) : (
            <>
              <IconButton onClick={startEdit}><Edit /></IconButton>
              <IconButton onClick={() => onModuleDelete(module._id)} color="error"><Delete /></IconButton>
              <Button startIcon={<Add />} size="small" onClick={() => onSubAdd(module._id)}>Sub</Button>
            </>
          )}
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ p: 2 }}>
        {editing ? (
          <form onSubmit={handleSubmit(saveEdit)} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Controller name="name" control={control} render={({ field }) => <input {...field} className="border rounded px-2 py-1" placeholder="Name" />} />
            <Controller name="route" control={control} render={({ field }) => <input {...field} className="border rounded px-2 py-1" placeholder="Route" />} />
            <Button type="submit" variant="contained" size="small">Save</Button>
            <Button onClick={cancelEdit} size="small">Cancel</Button>
          </form>
        ) : (
          <>
            <Typography><strong>Route:</strong> {module.route}</Typography>
            <Typography><strong>Icon:</strong> {module.icon}</Typography>
          </>
        )}

        {/* Sub-modules */}
        <Box sx={{ mt: 3 }}>
          {module.subModules?.filter(s => !s.isDeleted).map(sub => (
            <SubModuleItem
              key={sub._id}
              sub={sub}
              moduleId={module._id}
              onEdit={onSubEdit}
              onDelete={onSubDelete}
              onRestore={onSubRestore}
            />
          ))}
        </Box>
      </Box>
    </SortableAccordion>
  );
};

const SubModuleItem = ({ sub, moduleId, onEdit, onDelete, onRestore }) => {
  const [editing, setEditing] = useState(false);
  const { control, handleSubmit, reset, setValue } = useForm();

  const startEdit = () => {
    setValue('name', sub.name);
    setValue('route', sub.route);
    setValue('dashboardView', sub.dashboardView);
    setEditing(true);
  };
  const cancel = () => { setEditing(false); reset(); };
  const save = async (data) => {
    await moduleService.updateSub(moduleId, sub._id, data);
    showToast('Sub-module updated', 'success');
    setEditing(false);
    onEdit();
  };

  return (
    <SortableSubAccordion id={sub._id}>
      <Typography>{sub.name}</Typography>
      <Box sx={{ p: 1 }}>
        {editing ? (
          <form onSubmit={handleSubmit(save)} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <Controller name="name" control={control} render={({ field }) => <input {...field} className="border rounded px-2 py-1" />} />
            <Controller name="route" control={control} render={({ field }) => <input {...field} className="border rounded px-2 py-1" />} />
            <Controller name="dashboardView" control={control} render={({ field }) => <Switch {...field} checked={field.value} />} />
            <Button type="submit" size="small" variant="contained">Save</Button>
            <Button size="small" onClick={cancel}>Cancel</Button>
          </form>
        ) : (
          <>
            <Typography variant="body2">{sub.route}</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
              <IconButton size="small" onClick={startEdit}><Edit /></IconButton>
              <IconButton size="small" onClick={() => onDelete(moduleId, sub._id)} color="error"><Delete /></IconButton>
              {sub.isDeleted && <IconButton size="small" onClick={() => onRestore(moduleId, sub._id)} color="primary"><Restore /></IconButton>}
            </Box>
          </>
        )}
      </Box>
    </SortableSubAccordion>
  );
};