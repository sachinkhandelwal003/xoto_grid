import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { BarChart, PieChart } from '@mui/icons-material';

const Overview = () => {
  const theme = useTheme();

  const stats = [
    { label: 'Total Visitors', value: '12,345', change: '+12%' },
    { label: 'Page Views', value: '45,678', change: '+8%' },
    { label: 'Avg. Session', value: '2m 45s', change: '-3%' },
    { label: 'Bounce Rate', value: '34%', change: '-5%' },
  ];

  return (
    <Box>
      <Typography variant="h5" className="mb-6" style={{ color: theme.palette.primary.main }}>
        Analytics Overview
      </Typography>

      <Grid container spacing={3} className="mb-6">
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card className="cms-card h-full">
              <CardContent>
                <Typography variant="subtitle2" className="text-gray-500">
                  {stat.label}
                </Typography>
                <Box className="flex items-baseline mt-2">
                  <Typography variant="h4" className="font-semibold">
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`ml-2 ${
                      stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {stat.change}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card className="cms-card h-full">
            <CardContent>
              <Box className="flex items-center mb-4">
                <BarChart className="mr-2 text-primary" />
                <Typography variant="h6">Visitor Trends</Typography>
              </Box>
              <Box className="h-64 bg-gray-100 rounded flex items-center justify-center">
                <Typography className="text-gray-400">Chart Placeholder</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card className="cms-card h-full">
            <CardContent>
              <Box className="flex items-center mb-4">
                <PieChart className="mr-2 text-primary" />
                <Typography variant="h6">Traffic Sources</Typography>
              </Box>
              <Box className="h-64 bg-gray-100 rounded flex items-center justify-center">
                <Typography className="text-gray-400">Pie Chart Placeholder</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview;