import { useState } from 'react';
import { Box, Typography, Card, CardContent, Switch, FormControlLabel, TextField, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Save } from '@mui/icons-material';

const System = () => {
  const theme = useTheme();
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    cacheEnabled: true,
    siteTitle: 'My CMS',
    timezone: 'UTC',
  });

  const handleToggle = (name) => (event) => {
    setSettings({ ...settings, [name]: event.target.checked });
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
  };

  return (
    <Box>
      <Typography variant="h5" className="mb-6" style={{ color: theme.palette.primary.main }}>
        System Settings
      </Typography>

      <Card className="cms-card">
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Site Title"
              name="siteTitle"
              value={settings.siteTitle}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
            />

            <TextField
              fullWidth
              select
              label="Timezone"
              name="timezone"
              value={settings.timezone}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              SelectProps={{
                native: true,
              }}
            >
              {['UTC', 'EST', 'PST', 'GMT'].map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.maintenanceMode}
                  onChange={handleToggle('maintenanceMode')}
                  color="primary"
                />
              }
              label="Maintenance Mode"
              className="mt-4"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.cacheEnabled}
                  onChange={handleToggle('cacheEnabled')}
                  color="primary"
                />
              }
              label="Enable Caching"
            />

            <Box className="flex justify-end mt-6">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<Save />}
              >
                Save Settings
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default System;