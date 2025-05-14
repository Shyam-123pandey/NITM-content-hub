import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const programs = ['PhD', 'B.Tech', 'M.Tech'];
const branches = {
  'PhD': ['CSE', 'ECE', 'EE', 'ME', 'CE'],
  'B.Tech': ['CSE', 'ECE', 'EE', 'ME', 'CE'],
  'M.Tech': ['CSE', 'ECE', 'EE', 'ME', 'CE'],
};

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  const steps = ['Welcome', 'Select Program', 'Select Branch'];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Save selections to localStorage or context
      localStorage.setItem('userProgram', selectedProgram);
      localStorage.setItem('userBranch', selectedBranch);
      navigate('/');
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h4" gutterBottom>
              Welcome to NIT Meghalaya Portal
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your one-stop platform for academic resources, discussions, and opportunities.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleNext}
              sx={{ mt: 3 }}
            >
              Get Started
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ py: 4 }}>
            <Typography variant="h5" gutterBottom>
              Select Your Program
            </Typography>
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>Program</InputLabel>
              <Select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                label="Program"
              >
                {programs.map((program) => (
                  <MenuItem key={program} value={program}>
                    {program}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!selectedProgram}
              >
                Next
              </Button>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ py: 4 }}>
            <Typography variant="h5" gutterBottom>
              Select Your Branch
            </Typography>
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>Branch</InputLabel>
              <Select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                label="Branch"
              >
                {branches[selectedProgram]?.map((branch) => (
                  <MenuItem key={branch} value={branch}>
                    {branch}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!selectedBranch}
              >
                Continue to Portal
              </Button>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mt: 8 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderStepContent(activeStep)}
      </Paper>
    </Container>
  );
};

export default OnboardingFlow; 