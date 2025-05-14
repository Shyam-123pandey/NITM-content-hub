import {
  Cancel as CancelIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, fetchUser, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    role: '',
    program: '',
    branch: '',
    semester: '',
    bio: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        program: user.program || '',
        branch: user.branch || '',
        semester: user.semester || '',
        bio: user.bio || '',
      });
      setLoading(false);
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('https://nitm-content-hub-1.onrender.com/api/auth/profile', profileData);
      setUser(response.data);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await axios.put('https://nitm-content-hub-1.onrender.com/api/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setOpenPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  margin: '0 auto',
                  mb: 2,
                  fontSize: '3rem',
                }}
              >
                {user.name.charAt(0)}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.role}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setOpenPasswordDialog(true)}
                >
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Profile Information</Typography>
                <IconButton onClick={() => setEditMode(!editMode)}>
                  {editMode ? <CancelIcon /> : <EditIcon />}
                </IconButton>
              </Box>

              <Box component="form" onSubmit={handleProfileUpdate}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      disabled={!editMode}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={profileData.email}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={profileData.role}
                        onChange={(e) =>
                          setProfileData({ ...profileData, role: e.target.value })
                        }
                        label="Role"
                        disabled={!editMode}
                        required
                      >
                        <MenuItem value="student">Student</MenuItem>
                        <MenuItem value="faculty">Faculty</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {(profileData.role === 'student' || profileData.role === 'faculty') && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Program</InputLabel>
                          <Select
                            value={profileData.program}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                program: e.target.value,
                              })
                            }
                            label="Program"
                            disabled={!editMode}
                            required
                          >
                            <MenuItem value="B.Tech">B.Tech</MenuItem>
                            <MenuItem value="M.Tech">M.Tech</MenuItem>
                            <MenuItem value="PhD">PhD</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Branch</InputLabel>
                          <Select
                            value={profileData.branch}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                branch: e.target.value,
                              })
                            }
                            label="Branch"
                            disabled={!editMode}
                            required
                          >
                            <MenuItem value="CSE">CSE</MenuItem>
                            <MenuItem value="ECE">ECE</MenuItem>
                            <MenuItem value="EE">EE</MenuItem>
                            <MenuItem value="ME">ME</MenuItem>
                            <MenuItem value="CE">CE</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      {profileData.role === 'student' && (
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Semester"
                            type="number"
                            value={profileData.semester}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                semester: e.target.value,
                              })
                            }
                            disabled={!editMode}
                            required
                          />
                        </Grid>
                      )}
                    </>
                  )}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      multiline
                      rows={4}
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                      disabled={!editMode}
                    />
                  </Grid>
                </Grid>

                {editMode && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                    >
                      Save Changes
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog
        open={openPasswordDialog}
        onClose={() => setOpenPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handlePasswordChange} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained">
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 