import { Box, Typography, IconButton, Divider } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNavigate } from 'react-router-dom';

const Completed = () => {
  const navigate = useNavigate();

  const steps = [
    {
      title: 'Loading',
      name: 'Harman Chadda',
      date: 'June 03, 8:30 AM',
      icon: <CheckCircleIcon sx={{ color: 'green' }} />,
    },
    {
      title: 'In-Transit',
      name: 'Harman Chadda',
      date: 'June 04, 01:00 PM',
      icon: <CheckCircleIcon sx={{ color: 'green' }} />,
    },
    {
      title: 'Arriving',
      name: 'Harman Chadda',
      date: 'June 06, 03:00 PM',
      icon: <LocationOnIcon sx={{ color: 'green' }} />,
    },
  ];

  return (
    <Box sx={{ background: '#fff', borderRadius: 3, p: 4, maxWidth: 1000, m: '20px auto', boxShadow: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/reports')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="body1" sx={{ ml: 1 }}>Back to My Reports</Typography>
      </Box>

      <Typography variant="h5" align="center" fontWeight={700} mb={3}>
        Consignment No - CNU1234567
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="subtitle1" color="text.secondary">
          Completed
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          100%
        </Typography>
      </Box>

      <Box sx={{ height: 6, borderRadius: 2, background: 'green', mb: 4 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          {steps.map((step, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
                {step.icon}
                {index !== steps.length - 1 && <Box sx={{ width: 2, height: 40, background: 'green', mt: 0.5 }} />}
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'green' }}>{step.title}</Typography>
                <Typography variant="body2">{step.name}</Typography>
                <Typography variant="caption" color="text.secondary">{step.date}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ background: 'green', borderRadius: '50%', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" color="white">Completed</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Completed;