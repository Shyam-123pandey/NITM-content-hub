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
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Calendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: null,
    endDate: null,
    type: 'academic',
    category: 'class',
    location: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/calendar');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/calendar', newEvent);
      toast.success('Event created successfully');
      setOpenDialog(false);
      setNewEvent({
        title: '',
        description: '',
        startDate: null,
        endDate: null,
        type: 'academic',
        category: 'class',
        location: '',
      });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(`http://localhost:5000/api/calendar/${eventId}`);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleEditEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/calendar/${selectedEvent._id}`, selectedEvent);
      toast.success('Event updated successfully');
      setOpenDialog(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Calendar</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Event
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : events.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <img src="/empty-content.svg" alt="No Events" style={{ width: 180, marginBottom: 24 }} />
          <Typography variant="h6" gutterBottom>No events available yet.</Typography>
          <Typography variant="body2" color="text.secondary">This section is under construction or no events have been scheduled yet.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">{event.title}</Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedEvent(event);
                          setOpenDialog(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteEvent(event._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {event.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      icon={<EventIcon />}
                      label={new Date(event.startDate).toLocaleDateString()}
                      size="small"
                    />
                    <Chip label={event.type} size="small" color="primary" />
                    <Chip
                      label={event.category}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>

                  {event.location && (
                    <Typography variant="body2" color="text.secondary">
                      Location: {event.location}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Event Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedEvent(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedEvent ? 'Edit Event' : 'Create New Event'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={selectedEvent ? selectedEvent.title : newEvent.title}
              onChange={(e) =>
                selectedEvent
                  ? setSelectedEvent({ ...selectedEvent, title: e.target.value })
                  : setNewEvent({ ...newEvent, title: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={selectedEvent ? selectedEvent.description : newEvent.description}
              onChange={(e) =>
                selectedEvent
                  ? setSelectedEvent({ ...selectedEvent, description: e.target.value })
                  : setNewEvent({ ...newEvent, description: e.target.value })
              }
              margin="normal"
              required
              multiline
              rows={4}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Start Date"
                    value={selectedEvent ? selectedEvent.startDate : newEvent.startDate}
                    onChange={(date) =>
                      selectedEvent
                        ? setSelectedEvent({ ...selectedEvent, startDate: date })
                        : setNewEvent({ ...newEvent, startDate: date })
                    }
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="End Date"
                    value={selectedEvent ? selectedEvent.endDate : newEvent.endDate}
                    onChange={(date) =>
                      selectedEvent
                        ? setSelectedEvent({ ...selectedEvent, endDate: date })
                        : setNewEvent({ ...newEvent, endDate: date })
                    }
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={selectedEvent ? selectedEvent.type : newEvent.type}
                onChange={(e) =>
                  selectedEvent
                    ? setSelectedEvent({ ...selectedEvent, type: e.target.value })
                    : setNewEvent({ ...newEvent, type: e.target.value })
                }
                label="Type"
                required
              >
                <MenuItem value="academic">Academic</MenuItem>
                <MenuItem value="cultural">Cultural</MenuItem>
                <MenuItem value="sports">Sports</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={selectedEvent ? selectedEvent.category : newEvent.category}
                onChange={(e) =>
                  selectedEvent
                    ? setSelectedEvent({ ...selectedEvent, category: e.target.value })
                    : setNewEvent({ ...newEvent, category: e.target.value })
                }
                label="Category"
                required
              >
                <MenuItem value="class">Class</MenuItem>
                <MenuItem value="exam">Exam</MenuItem>
                <MenuItem value="meeting">Meeting</MenuItem>
                <MenuItem value="event">Event</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={selectedEvent ? selectedEvent.location : newEvent.location}
              onChange={(e) =>
                selectedEvent
                  ? setSelectedEvent({ ...selectedEvent, location: e.target.value })
                  : setNewEvent({ ...newEvent, location: e.target.value })
              }
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
              setSelectedEvent(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={selectedEvent ? handleEditEvent : handleCreateEvent}
            variant="contained"
          >
            {selectedEvent ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Calendar; 