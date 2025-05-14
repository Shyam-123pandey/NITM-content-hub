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
  ThumbUp,
  ThumbUpOutlined,
  Comment,
  Share,
  MoreVert,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Discussions = () => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    tags: [],
    category: 'general',
  });
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/discussions');
      setDiscussions(response.data);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast.error('Failed to fetch discussions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    try {
      const discussionData = {
        ...newDiscussion,
        authorRole: user.role || 'student'
      };
      await axios.post('http://localhost:5000/api/discussions', discussionData);
      toast.success('Discussion created successfully');
      setOpenDialog(false);
      setNewDiscussion({
        title: '',
        content: '',
        tags: [],
        category: 'general',
      });
      fetchDiscussions();
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast.error('Failed to create discussion');
    }
  };

  const handleAddComment = async (discussionId) => {
    if (!comment.trim()) return;
    try {
      await axios.post(`http://localhost:5000/api/discussions/${discussionId}/comments`, {
        content: comment,
      });
      setComment('');
      fetchDiscussions();
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleUpvote = async (discussionId) => {
    try {
      await axios.post(`http://localhost:5000/api/discussions/${discussionId}/upvote`);
      fetchDiscussions();
    } catch (error) {
      console.error('Error upvoting:', error);
      toast.error('Failed to upvote');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Discussions</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
        >
          Start Discussion
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : discussions.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <img src="./../../assets/empty.jpeg" alt="No Discussions" style={{ width: 180, marginBottom: 24 }} />
          <Typography variant="h6" gutterBottom>No discussions available yet.</Typography>
          <Typography variant="body2" color="text.secondary">This section is under construction or no discussions have been started yet.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {discussions.map((discussion) => (
            <Grid item xs={12} key={discussion._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar>{discussion.author.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="subtitle1">
                          {discussion.author.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(discussion.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton>
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    {discussion.title}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {discussion.content}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {discussion.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                    <Chip
                      label={discussion.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      startIcon={
                        discussion.upvotes?.includes(user?._id) ? (
                          <ThumbUp />
                        ) : (
                          <ThumbUpOutlined />
                        )
                      }
                      onClick={() => handleUpvote(discussion._id)}
                    >
                      {discussion.upvotes?.length || 0} Upvotes
                    </Button>
                    <Button
                      startIcon={<Comment />}
                      onClick={() => setSelectedDiscussion(discussion)}
                    >
                      {discussion.comments.length} Comments
                    </Button>
                    <Button startIcon={<Share />}>Share</Button>
                  </Box>

                  {selectedDiscussion?._id === discussion._id && (
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Comments
                      </Typography>
                      {discussion.comments.map((comment) => (
                        <Box key={comment._id} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Avatar>{comment.author.name.charAt(0)}</Avatar>
                            <Box>
                              <Typography variant="subtitle2">
                                {comment.author.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2">{comment.content}</Typography>
                        </Box>
                      ))}
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Add a comment..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                        <Button
                          variant="contained"
                          onClick={() => handleAddComment(discussion._id)}
                        >
                          Post
                        </Button>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Discussion Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Start a New Discussion</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={newDiscussion.title}
              onChange={(e) =>
                setNewDiscussion({ ...newDiscussion, title: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Content"
              name="content"
              value={newDiscussion.content}
              onChange={(e) =>
                setNewDiscussion({ ...newDiscussion, content: e.target.value })
              }
              margin="normal"
              required
              multiline
              rows={4}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={newDiscussion.category}
                onChange={(e) =>
                  setNewDiscussion({ ...newDiscussion, category: e.target.value })
                }
                label="Category"
                required
              >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="academic">Academic</MenuItem>
                <MenuItem value="technical">Technical</MenuItem>
                <MenuItem value="social">Social</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Tags (comma separated)"
              name="tags"
              value={newDiscussion.tags.join(', ')}
              onChange={(e) =>
                setNewDiscussion({
                  ...newDiscussion,
                  tags: e.target.value.split(',').map((tag) => tag.trim()),
                })
              }
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateDiscussion} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Discussions; 