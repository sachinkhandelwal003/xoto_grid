import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  FormHelperText,
  Divider,
  Chip,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Save, ArrowBack, AddPhotoAlternate } from '@mui/icons-material';
import { Editor } from '@tinymce/tinymce-react';

const ContentEdit = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [content, setContent] = useState({
    title: isNew ? '' : 'Sample Content Title',
    slug: isNew ? '' : 'sample-content-title',
    content: isNew ? '' : '<p>This is sample content</p>',
    status: isNew ? 'draft' : 'published',
    tags: isNew ? [] : ['technology', 'web development'],
    featuredImage: null,
  });

  const [newTag, setNewTag] = useState('');

  const handleChange = (e) => {
    setContent({ ...content, [e.target.name]: e.target.value });
  };

  const handleEditorChange = (content) => {
    setContent({ ...content, content });
  };

  const handleAddTag = () => {
    if (newTag && !content.tags.includes(newTag)) {
      setContent({ ...content, tags: [...content.tags, newTag] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setContent({ 
      ...content, 
      tags: content.tags.filter(tag => tag !== tagToRemove) 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/content');
  };

  return (
    <Box>
      <Box className="flex items-center mb-6">
        <IconButton onClick={() => navigate('/content')} className="mr-2">
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" style={{ color: theme.palette.primary.main }}>
          {isNew ? 'Create New Content' : 'Edit Content'}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card className="cms-card mb-4">
              <CardContent>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={content.title}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  required
                />

                <TextField
                  fullWidth
                  label="Slug"
                  name="slug"
                  value={content.slug}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  helperText="URL-friendly version of the title"
                />

                <Box className="mt-4">
                  <Typography variant="subtitle2" className="mb-2">
                    Content
                  </Typography>
                  <Editor
                    apiKey="your-tinymce-api-key"
                    value={content.content}
                    init={{
                      height: 400,
                      menubar: true,
                      plugins: [
                        'advlist autolink lists link image charmap print preview anchor',
                        'searchreplace visualblocks code fullscreen',
                        'insertdatetime media table paste code help wordcount'
                      ],
                      toolbar:
                        'undo redo | formatselect | bold italic backcolor | \
                        alignleft aligncenter alignright alignjustify | \
                        bullist numlist outdent indent | removeformat | help'
                    }}
                    onEditorChange={handleEditorChange}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className="cms-card mb-4">
              <CardContent>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={content.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>

                <Box className="mt-4">
                  <Typography variant="subtitle2" className="mb-2">
                    Featured Image
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AddPhotoAlternate />}
                    component="label"
                    fullWidth
                  >
                    Upload Image
                    <input type="file" hidden accept="image/*" />
                  </Button>
                  {content.featuredImage && (
                    <Box className="mt-2">
                      <img 
                        src={content.featuredImage} 
                        alt="Featured" 
                        className="max-h-40 rounded"
                      />
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            <Card className="cms-card">
              <CardContent>
                <Typography variant="subtitle2" className="mb-2">
                  Tags
                </Typography>
                <Box className="flex flex-wrap gap-2 mb-4">
                  {content.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      size="small"
                    />
                  ))}
                </Box>
                <Box className="flex gap-2">
                  <TextField
                    fullWidth
                    size="small"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add new tag"
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddTag}
                    disabled={!newTag}
                  >
                    Add
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box className="flex justify-end mt-4">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Save />}
          >
            {isNew ? 'Publish Content' : 'Update Content'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ContentEdit;