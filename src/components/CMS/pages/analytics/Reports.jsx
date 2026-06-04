import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  MenuItem,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Download, FilterAlt, Refresh } from '@mui/icons-material';

const Reports = () => {
  const theme = useTheme();
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null,
  });
  const [reportType, setReportType] = useState('daily');

  const reports = [
    { date: '2023-06-01', visitors: 1245, pageViews: 3456, revenue: 1250 },
    { date: '2023-06-02', visitors: 1356, pageViews: 3654, revenue: 1420 },
    { date: '2023-06-03', visitors: 1489, pageViews: 3987, revenue: 1560 },
    { date: '2023-06-04', visitors: 1123, pageViews: 3120, revenue: 1100 },
    { date: '2023-06-05', visitors: 1654, pageViews: 4210, revenue: 1820 },
  ];

  const handleDateChange = (name) => (date) => {
    setDateRange({ ...dateRange, [name]: date });
  };

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  return (
    <Box>
      <Typography variant="h5" className="mb-6" style={{ color: theme.palette.primary.main }}>
        Analytics Reports
      </Typography>

      <Card className="cms-card mb-6">
        <CardContent>
          <Box className="flex flex-col md:flex-row md:items-end gap-4">
            <TextField
              select
              label="Report Type"
              value={reportType}
              onChange={handleReportTypeChange}
              variant="outlined"
              size="small"
              className="w-full md:w-48"
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </TextField>

            <DatePicker
              label="Start Date"
              value={dateRange.start}
              onChange={handleDateChange('start')}
              renderInput={(params) => (
                <TextField {...params} size="small" className="w-full md:w-48" />
              )}
            />

            <DatePicker
              label="End Date"
              value={dateRange.end}
              onChange={handleDateChange('end')}
              renderInput={(params) => (
                <TextField {...params} size="small" className="w-full md:w-48" />
              )}
            />

            <Button
              variant="contained"
              color="primary"
              startIcon={<FilterAlt />}
              className="h-10"
            >
              Apply Filters
            </Button>

            <Box className="flex ml-auto gap-2">
              <IconButton>
                <Refresh />
              </IconButton>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Download />}
                className="h-10"
              >
                Export
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card className="cms-card">
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow className="bg-gray-100">
                <TableCell className="font-semibold">Date</TableCell>
                <TableCell className="font-semibold" align="right">Visitors</TableCell>
                <TableCell className="font-semibold" align="right">Page Views</TableCell>
                <TableCell className="font-semibold" align="right">Revenue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report, index) => (
                <TableRow key={index}>
                  <TableCell>{report.date}</TableCell>
                  <TableCell align="right">{report.visitors.toLocaleString()}</TableCell>
                  <TableCell align="right">{report.pageViews.toLocaleString()}</TableCell>
                  <TableCell align="right">${report.revenue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default Reports;