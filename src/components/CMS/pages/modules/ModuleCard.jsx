// src/components/module/ModuleCard.jsx
import { Card, CardContent, Typography, IconButton, Chip, Box } from '@mui/material';
import { Edit, Delete, Add, Restore } from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const ModuleCard = ({ module, onEdit, onDelete, onRestore, onAddSub }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: module._id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: module.isDeleted ? 0.6 : 1 };

  return (
    <Card ref={setNodeRef} style={style} {...attributes} className="shadow hover:shadow-lg transition-shadow">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'grab' }} {...listeners}>
            <i className={`${module.icon || 'fas fa-folder'} text-xl text-primary`} />
            <Typography variant="h6" className="font-bold">{module.name}</Typography>
          </Box>
          <Chip label={module.isDeleted ? 'Deleted' : 'Active'} color={module.isDeleted ? 'error' : 'success'} size="small" />
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>{module.route}</Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip label={`${module.subModules?.length ?? 0} subs`} size="small" />
          <Box>
            {module.isDeleted ? (
              <IconButton size="small" onClick={() => onRestore(module._id)} color="primary"><Restore /></IconButton>
            ) : (
              <>
                <IconButton size="small" onClick={() => onEdit(module)}><Edit /></IconButton>
                <IconButton size="small" onClick={() => onDelete(module._id)} color="error"><Delete /></IconButton>
                <IconButton size="small" onClick={() => onAddSub(module._id)}><Add /></IconButton>
              </>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};