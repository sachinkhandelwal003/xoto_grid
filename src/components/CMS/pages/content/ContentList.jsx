import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  Add, 
  MoreVert, 
  Edit, 
  Delete, 
  Search,
  FilterList,
  Refresh,
  Publish,
  Drafts,
  Archive
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const ContentList = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Sample data
  const [contents, setContents] = useState([
    {
      id: 1,
      title: 'Getting Started with React',
      author: 'John Doe',
      status: 'published',
      date: '2023-05-15',
      views: 1245
    },
    {
      id: 2,
      title: 'Advanced CSS Techniques',
      author: 'Jane Smith',
      status: 'draft',
      date: '2023-06-02',
      views: 0
    },
    {
      id: 3,
      title: 'Building Modern Dashboards',
      author: 'Mike Johnson',
      status: 'published',
      date: '2023-06-10',
      views: 3421
    },
    {
      id: 4,
      title: 'State Management in 2023',
      author: 'Sarah Williams',
      status: 'archived',
      date: '2023-04-22',
      views: 892
    },
  ]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = (id) => {
    setContents(contents.filter(content => content.id !== id));
    handleMenuClose();
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    handleMenuClose();
  };

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         content.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || content.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'info';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'published': return <Publish fontSize="small" />;
      case 'draft': return <Drafts fontSize="small" />;
      case 'archived': return <Archive fontSize="small" />;
      default: return null;
    }
  };

  return (
    <Box>
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h5" className="font-semibold" style={{ color: theme.palette.primary.main }}>
          Content Management
        </Typography>
        <Button
          component={Link}
          to="/content/new"
          variant="contained"
          color="primary"
          startIcon={<Add />}
          className="shadow-md"
        >
          Create New
        </Button>
      </Box>

      <Card className="cms-card mb-4">
        <Box className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          
          <Box className="flex gap-2">
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={handleMenuOpen}
            >
              {filterStatus === 'all' ? 'Filter' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
            </Button>
            
            <IconButton>
              <Refresh />
            </IconButton>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleStatusFilter('all')}>All</MenuItem>
          <MenuItem onClick={() => handleStatusFilter('published')}>Published</MenuItem>
          <MenuItem onClick={() => handleStatusFilter('draft')}>Draft</MenuItem>
          <MenuItem onClick={() => handleStatusFilter('archived')}>Archived</MenuItem>
        </Menu>
      </Card>

      <Card className="cms-card">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow className="bg-gray-100">
                <TableCell className="font-semibold">Title</TableCell>
                <TableCell className="font-semibold">Author</TableCell>
                <TableCell className="font-semibold">Status</TableCell>
                <TableCell className="font-semibold">Date</TableCell>
                <TableCell className="font-semibold">Views</TableCell>
                <TableCell className="font-semibold text-right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContents.map((content) => (
                <TableRow key={content.id} hover>
                  <TableCell>
                    <Typography className="font-medium">
                      {content.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{content.author}</TableCell>
                  <TableCell>
                    <Chip
                      label={content.status}
                      color={getStatusColor(content.status)}
                      icon={getStatusIcon(content.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{content.date}</TableCell>
                  <TableCell>{content.views.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Box className="flex justify-end gap-1">
                      <IconButton
                        component={Link}
                        to={`/content/edit/${content.id}`}
                        size="small"
                        className="text-gray-600 hover:text-primary"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        className="text-gray-600 hover:text-red-500"
                        onClick={() => handleDelete(content.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {filteredContents.length === 0 && (
        <Box className="flex flex-col items-center justify-center p-8">
          <Typography variant="h6" className="text-gray-500 mb-2">
            No content found
          </Typography>
          <Typography variant="body2" className="text-gray-400">
            Try adjusting your search or filter criteria
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ContentList;