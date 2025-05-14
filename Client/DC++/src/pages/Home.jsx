import { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [recentContent, setRecentContent] = useState([]);
  const [recentDiscussions, setRecentDiscussions] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [activeOpportunities, setActiveOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const userProgram = localStorage.getItem('userProgram');
  const userBranch = localStorage.getItem('userBranch');

  useEffect(() => {
    if (!authLoading) {
      if (!userProgram || !userBranch) {
        navigate('/');
        return;
      }

      const fetchData = async () => {
        try {
          setLoading(true);
          const [contentRes, discussionsRes, eventsRes, opportunitiesRes] = await Promise.all([
            axios.get('http://localhost:5000/api/content?limit=3'),
            axios.get('http://localhost:5000/api/discussions?limit=3'),
            axios.get('http://localhost:5000/api/calendar?limit=3'),
            axios.get('http://localhost:5000/api/opportunities?limit=3'),
          ]);

          setRecentContent(contentRes.data);
          setRecentDiscussions(discussionsRes.data);
          setUpcomingEvents(eventsRes.data);
          setActiveOpportunities(opportunitiesRes.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [user, authLoading, navigate, userProgram, userBranch]);

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {userProgram} - {userBranch}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Here's what's happening in your portal
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Recent Content */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Content
              </Typography>
              {recentContent.length > 0 ? (
                recentContent.map((content) => (
                  <Card key={content._id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1">{content.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {content.description}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={content.type}
                          size="small"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={content.category}
                          size="small"
                          color="secondary"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent content available
                </Typography>
              )}
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/content')}
                sx={{ mt: 2 }}
              >
                View All Content
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Discussions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Discussions
              </Typography>
              {recentDiscussions.length > 0 ? (
                recentDiscussions.map((discussion) => (
                  <Card key={discussion._id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1">{discussion.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {discussion.content.substring(0, 100)}...
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Chip
                          label={`${discussion.upvotes} Upvotes`}
                          size="small"
                          color="success"
                        />
                        <Chip
                          label={`${discussion.comments.length} Comments`}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent discussions available
                </Typography>
              )}
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/discussions')}
                sx={{ mt: 2 }}
              >
                View All Discussions
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Events
              </Typography>
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <Card key={event._id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1">{event.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(event.startDate).toLocaleDateString()} -{' '}
                        {new Date(event.endDate).toLocaleDateString()}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={event.type}
                          size="small"
                          color="info"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={event.category}
                          size="small"
                          color="warning"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No upcoming events available
                </Typography>
              )}
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/calendar')}
                sx={{ mt: 2 }}
              >
                View All Events
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Opportunities */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Opportunities
              </Typography>
              {activeOpportunities.length > 0 ? (
                activeOpportunities.map((opportunity) => (
                  <Card key={opportunity._id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1">{opportunity.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {opportunity.description.substring(0, 100)}...
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={opportunity.type}
                          size="small"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={opportunity.deadline}
                          size="small"
                          color="error"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No active opportunities available
                </Typography>
              )}
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/opportunities')}
                sx={{ mt: 2 }}
              >
                View All Opportunities
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home; 