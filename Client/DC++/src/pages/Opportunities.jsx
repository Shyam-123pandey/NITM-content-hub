import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Opportunities = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [newOpportunity, setNewOpportunity] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    type: 'internship',
    category: 'technical',
    deadline: '',
    requirements: [],
    benefits: [],
    maxParticipants: 0,
  });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://nitm-content-hub-1.onrender.com/api/opportunities');
      setOpportunities(response.data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast.error('Failed to fetch opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOpportunity = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://nitm-content-hub-1.onrender.com/api/opportunities', newOpportunity);
      toast.success('Opportunity created successfully');
      setOpenDialog(false);
      setNewOpportunity({
        title: '',
        description: '',
        company: '',
        location: '',
        type: 'internship',
        category: 'technical',
        deadline: '',
        requirements: [],
        benefits: [],
        maxParticipants: 0,
      });
      fetchOpportunities();
    } catch (error) {
      console.error('Error creating opportunity:', error);
      toast.error('Failed to create opportunity');
    }
  };

  const handleDeleteOpportunity = async (opportunityId) => {
    try {
      await axios.delete(`https://nitm-content-hub-1.onrender.com/api/opportunities/${opportunityId}`);
      toast.success('Opportunity deleted successfully');
      fetchOpportunities();
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast.error('Failed to delete opportunity');
    }
  };

  const handleApply = async (opportunityId) => {
    try {
      await axios.post(`https://nitm-content-hub-1.onrender.com/api/opportunities/${opportunityId}/apply`);
      toast.success('Application submitted successfully');
      fetchOpportunities();
    } catch (error) {
      console.error('Error applying:', error);
      toast.error('Failed to apply');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Opportunities</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Opportunity
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : opportunities.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <img src="/empty-content.svg" alt="No Opportunities" style={{ width: 180, marginBottom: 24 }} />
          <Typography variant="h6" gutterBottom>No opportunities available yet.</Typography>
          <Typography variant="body2" color="text.secondary">This section is under construction or no opportunities have been posted yet.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {opportunities.map((opportunity) => (
            <Grid item xs={12} key={opportunity._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{opportunity.title}</Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        {opportunity.company}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedOpportunity(opportunity);
                          setOpenDialog(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteOpportunity(opportunity._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="body1" paragraph>
                    {opportunity.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      icon={<WorkIcon />}
                      label={opportunity.type}
                      size="small"
                      color="primary"
                    />
                    <Chip
                      icon={<LocationIcon />}
                      label={opportunity.location}
                      size="small"
                    />
                    <Chip
                      icon={<CalendarIcon />}
                      label={new Date(opportunity.deadline).toLocaleDateString()}
                      size="small"
                    />
                    <Chip
                      label={opportunity.category}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Requirements:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {opportunity.requirements.map((req, index) => (
                        <Chip key={index} label={req} size="small" />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Benefits:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {opportunity.benefits.map((benefit, index) => (
                        <Chip key={index} label={benefit} size="small" color="success" />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {opportunity.participants.length}/{opportunity.maxParticipants} participants
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => handleApply(opportunity._id)}
                      disabled={opportunity.participants.includes(user?._id)}
                    >
                      {opportunity.participants.includes(user?._id)
                        ? 'Applied'
                        : 'Apply Now'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Opportunity Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedOpportunity(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedOpportunity ? 'Edit Opportunity' : 'Create New Opportunity'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={selectedOpportunity ? selectedOpportunity.title : newOpportunity.title}
              onChange={(e) =>
                selectedOpportunity
                  ? setSelectedOpportunity({ ...selectedOpportunity, title: e.target.value })
                  : setNewOpportunity({ ...newOpportunity, title: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Company"
              name="company"
              value={selectedOpportunity ? selectedOpportunity.company : newOpportunity.company}
              onChange={(e) =>
                selectedOpportunity
                  ? setSelectedOpportunity({ ...selectedOpportunity, company: e.target.value })
                  : setNewOpportunity({ ...newOpportunity, company: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={selectedOpportunity ? selectedOpportunity.description : newOpportunity.description}
              onChange={(e) =>
                selectedOpportunity
                  ? setSelectedOpportunity({ ...selectedOpportunity, description: e.target.value })
                  : setNewOpportunity({ ...newOpportunity, description: e.target.value })
              }
              margin="normal"
              required
              multiline
              rows={4}
            />
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={selectedOpportunity ? selectedOpportunity.location : newOpportunity.location}
              onChange={(e) =>
                selectedOpportunity
                  ? setSelectedOpportunity({ ...selectedOpportunity, location: e.target.value })
                  : setNewOpportunity({ ...newOpportunity, location: e.target.value })
              }
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={selectedOpportunity ? selectedOpportunity.type : newOpportunity.type}
                onChange={(e) =>
                  selectedOpportunity
                    ? setSelectedOpportunity({ ...selectedOpportunity, type: e.target.value })
                    : setNewOpportunity({ ...newOpportunity, type: e.target.value })
                }
                label="Type"
                required
              >
                <MenuItem value="internship">Internship</MenuItem>
                <MenuItem value="job">Job</MenuItem>
                <MenuItem value="research">Research</MenuItem>
                <MenuItem value="project">Project</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={selectedOpportunity ? selectedOpportunity.category : newOpportunity.category}
                onChange={(e) =>
                  selectedOpportunity
                    ? setSelectedOpportunity({ ...selectedOpportunity, category: e.target.value })
                    : setNewOpportunity({ ...newOpportunity, category: e.target.value })
                }
                label="Category"
                required
              >
                <MenuItem value="technical">Technical</MenuItem>
                <MenuItem value="non-technical">Non-Technical</MenuItem>
                <MenuItem value="research">Research</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Deadline"
              name="deadline"
              type="date"
              value={selectedOpportunity ? selectedOpportunity.deadline : newOpportunity.deadline}
              onChange={(e) =>
                selectedOpportunity
                  ? setSelectedOpportunity({ ...selectedOpportunity, deadline: e.target.value })
                  : setNewOpportunity({ ...newOpportunity, deadline: e.target.value })
              }
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Requirements (comma separated)"
              name="requirements"
              value={selectedOpportunity ? selectedOpportunity.requirements.join(', ') : newOpportunity.requirements.join(', ')}
              onChange={(e) =>
                selectedOpportunity
                  ? setSelectedOpportunity({
                      ...selectedOpportunity,
                      requirements: e.target.value.split(',').map((req) => req.trim()),
                    })
                  : setNewOpportunity({
                      ...newOpportunity,
                      requirements: e.target.value.split(',').map((req) => req.trim()),
                    })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Benefits (comma separated)"
              name="benefits"
              value={selectedOpportunity ? selectedOpportunity.benefits.join(', ') : newOpportunity.benefits.join(', ')}
              onChange={(e) =>
                selectedOpportunity
                  ? setSelectedOpportunity({
                      ...selectedOpportunity,
                      benefits: e.target.value.split(',').map((benefit) => benefit.trim()),
                    })
                  : setNewOpportunity({
                      ...newOpportunity,
                      benefits: e.target.value.split(',').map((benefit) => benefit.trim()),
                    })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Maximum Participants"
              name="maxParticipants"
              type="number"
              value={selectedOpportunity ? selectedOpportunity.maxParticipants : newOpportunity.maxParticipants}
              onChange={(e) =>
                selectedOpportunity
                  ? setSelectedOpportunity({
                      ...selectedOpportunity,
                      maxParticipants: parseInt(e.target.value),
                    })
                  : setNewOpportunity({
                      ...newOpportunity,
                      maxParticipants: parseInt(e.target.value),
                    })
              }
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
              setSelectedOpportunity(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={selectedOpportunity ? handleEditOpportunity : handleCreateOpportunity}
            variant="contained"
          >
            {selectedOpportunity ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Opportunities; 