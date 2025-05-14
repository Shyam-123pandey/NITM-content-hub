import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
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
  Chip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Content = () => {
  const { user } = useAuth();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: '',
  });
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    type: 'document',
    category: 'academic',
    file: null,
    tags: [],
  });

  useEffect(() => {
    fetchContent();
  }, [filters]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/content', {
        params: filters,
      });
      setContent(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to fetch content');
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(newContent).forEach((key) => {
        if (key === 'tags') {
          formData.append(key, JSON.stringify(newContent[key]));
        } else if (key === 'file' && newContent[key]) {
          formData.append('file', newContent[key]);
        } else {
          formData.append(key, newContent[key]);
        }
      });

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to upload content');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/content', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.data) {
        toast.success('Content uploaded successfully');
        setOpenDialog(false);
        setNewContent({
          title: '',
          description: '',
          type: 'document',
          category: 'academic',
          file: null,
          tags: [],
        });
        fetchContent();
      }
    } catch (error) {
      console.error('Error creating content:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to upload content');
      } else {
        toast.error(error.response?.data?.message || 'Failed to upload content');
      }
    }
  };

  const handleDeleteContent = async (contentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/content/${contentId}`);
      toast.success('Content deleted successfully');
      fetchContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const handleDownload = async (contentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/content/${contentId}/download`, {
        responseType: 'blob',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      // Create a blob from the response data
      const blob = new Blob([response.data]);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      
      // Get the filename from the content
      const contentItem = content.find((c) => c._id === contentId);
      const filename = contentItem?.title || 'file';
      
      // Set the download attribute
      link.setAttribute('download', filename);
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
      
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading content:', error);
      toast.error(error.response?.data?.message || 'Failed to download content');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Content</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Upload Content
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                label="Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="document">Document</MenuItem>
                <MenuItem value="video">Video</MenuItem>
                <MenuItem value="image">Image</MenuItem>
                <MenuItem value="link">Link</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                label="Category"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="academic">Academic</MenuItem>
                <MenuItem value="research">Research</MenuItem>
                <MenuItem value="project">Project</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : content.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <img src="/empty-content.svg" alt="No Content" style={{ width: 180, marginBottom: 24 }} />
          <Typography variant="h6" gutterBottom>No content available yet.</Typography>
          <Typography variant="body2" color="text.secondary">This section is under construction or no content has been uploaded yet.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {content.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">{item.title}</Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(item._id)}
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteContent(item._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {item.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={item.type} size="small" color="primary" />
                    <Chip
                      label={item.category}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {(item.tags || []).map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Uploaded by: {item.uploadedBy?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Views: {item.views}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Upload Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload New Content</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleCreateContent} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={newContent.title}
              onChange={(e) =>
                setNewContent({ ...newContent, title: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={newContent.description}
              onChange={(e) =>
                setNewContent({ ...newContent, description: e.target.value })
              }
              margin="normal"
              required
              multiline
              rows={4}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                value={newContent.type}
                onChange={(e) =>
                  setNewContent({ ...newContent, type: e.target.value })
                }
                label="Type"
                required
              >
                <MenuItem value="document">Document</MenuItem>
                <MenuItem value="video">Video</MenuItem>
                <MenuItem value="image">Image</MenuItem>
                <MenuItem value="link">Link</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                value={newContent.category}
                onChange={(e) =>
                  setNewContent({ ...newContent, category: e.target.value })
                }
                label="Category"
                required
              >
                <MenuItem value="academic">Academic</MenuItem>
                <MenuItem value="research">Research</MenuItem>
                <MenuItem value="project">Project</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="file"
              onChange={(e) =>
                setNewContent({ ...newContent, file: e.target.files[0] })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Tags (comma separated)"
              value={newContent.tags.join(', ')}
              onChange={(e) =>
                setNewContent({
                  ...newContent,
                  tags: e.target.value.split(',').map((tag) => tag.trim()),
                })
              }
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateContent} variant="contained">
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Content; 