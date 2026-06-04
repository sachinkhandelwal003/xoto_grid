// src/components/ui/SortableAccordion.jsx
import { Accordion, AccordionSummary, AccordionDetails, Box } from '@mui/material';
import { DragIndicator } from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const SortableAccordion = ({ id, children, expanded, onChange }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <Accordion ref={setNodeRef} style={style} {...attributes} expanded={expanded} onChange={onChange}>
      <AccordionSummary>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <DragIndicator {...listeners} sx={{ cursor: 'grab', mr: 1, color: 'text.secondary' }} />
          {children[0]}
        </Box>
      </AccordionSummary>
      <AccordionDetails>{children[1]}</AccordionDetails>
    </Accordion>
  );
};

export const SortableSubAccordion = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <Accordion ref={setNodeRef} style={style} {...attributes}>
      <AccordionSummary>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <DragIndicator {...listeners} sx={{ cursor: 'grab', mr: 1, color: 'text.secondary' }} />
          {children[0]}
        </Box>
      </AccordionSummary>
      <AccordionDetails>{children[1]}</AccordionDetails>
    </Accordion>
  );
};