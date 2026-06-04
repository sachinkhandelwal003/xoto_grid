import { useState } from 'react';
import { Box, Typography, TextField, Button, Avatar, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CloudUpload } from '@mui/icons-material';

const Profile = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    bio: 'CMS Administrator',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
  };

  return (
    <Box>
      <Typography variant="h5" className="mb-6" style={{ color: theme.palette.primary.main }}>
        Profile Settings
      </Typography>

      <Box className="flex flex-col md:flex-row gap-6">
        <Box className="w-full md:w-1/3">
          <Card className="cms-card p-4">
            <Box className="flex flex-col items-center">
              <Avatar
                src="/avatar.jpg"
                sx={{ width: 120, height: 120 }}
                className="mb-4 border-2 border-primary"
              />
              <Button
                variant="outlined"
                color="primary"
                startIcon={<CloudUpload />}
                component="label"
              >
                Upload Photo
                <input type="file" hidden accept="image/*" />
              </Button>
              <Typography variant="body2" className="mt-2 text-gray-500">
                JPG, GIF or PNG. Max size 2MB
              </Typography>
            </Box>
          </Card>
        </Box>

        <Box className="w-full md:w-2/3">
          <Card className="cms-card p-6">
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
              />
              <Divider className="my-4" />
              <Box className="flex justify-end">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  className="mt-4"
                >
                  Save Changes
                </Button>
              </Box>
            </form>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;