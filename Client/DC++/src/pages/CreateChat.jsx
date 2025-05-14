import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Chip,
    IconButton,
    useTheme
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CreateChat = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        type: 'general',
        category: 'all',
        description: '',
        rules: [{ title: '', description: '' }],
        program: user.program || '',
        branch: user.branch || '',
        semester: user.semester || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRuleChange = (index, field, value) => {
        const newRules = [...formData.rules];
        newRules[index][field] = value;
        setFormData(prev => ({
            ...prev,
            rules: newRules
        }));
    };

    const addRule = () => {
        setFormData(prev => ({
            ...prev,
            rules: [...prev.rules, { title: '', description: '' }]
        }));
    };

    const removeRule = (index) => {
        setFormData(prev => ({
            ...prev,
            rules: prev.rules.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/chats', formData);
            navigate(`/chat/${response.data._id}`);
        } catch (error) {
            console.error('Error creating chat:', error);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Create New Chat Room
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                    Create a new chat room for your community. Choose the type and category that best fits your needs.
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Basic Information */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Chat Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Chat Type</InputLabel>
                                <Select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    label="Chat Type"
                                >
                                    <MenuItem value="general">General Discussion</MenuItem>
                                    <MenuItem value="academic">Academic</MenuItem>
                                    <MenuItem value="project">Project Collaboration</MenuItem>
                                    <MenuItem value="achievement">Achievements</MenuItem>
                                    <MenuItem value="resource">Resource Sharing</MenuItem>
                                    <MenuItem value="mentorship">Mentorship</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    label="Category"
                                >
                                    <MenuItem value="all">All Users</MenuItem>
                                    <MenuItem value="program">Program Specific</MenuItem>
                                    <MenuItem value="branch">Branch Specific</MenuItem>
                                    <MenuItem value="semester">Semester Specific</MenuItem>
                                    <MenuItem value="faculty">Faculty Only</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                multiline
                                rows={3}
                            />
                        </Grid>

                        {/* Program, Branch, Semester Selection */}
                        {formData.category !== 'all' && (
                            <>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Program</InputLabel>
                                        <Select
                                            name="program"
                                            value={formData.program}
                                            onChange={handleChange}
                                            label="Program"
                                            required
                                        >
                                            <MenuItem value="B.Tech">B.Tech</MenuItem>
                                            <MenuItem value="M.Tech">M.Tech</MenuItem>
                                            <MenuItem value="MCA">MCA</MenuItem>
                                            <MenuItem value="Other">Other</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {formData.program && (
                                    <Grid item xs={12} md={4}>
                                        <FormControl fullWidth>
                                            <InputLabel>Branch</InputLabel>
                                            <Select
                                                name="branch"
                                                value={formData.branch}
                                                onChange={handleChange}
                                                label="Branch"
                                                required
                                            >
                                                <MenuItem value="CSE">Computer Science</MenuItem>
                                                <MenuItem value="IT">Information Technology</MenuItem>
                                                <MenuItem value="ECE">Electronics</MenuItem>
                                                <MenuItem value="Other">Other</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                )}

                                {formData.branch && (
                                    <Grid item xs={12} md={4}>
                                        <FormControl fullWidth>
                                            <InputLabel>Semester</InputLabel>
                                            <Select
                                                name="semester"
                                                value={formData.semester}
                                                onChange={handleChange}
                                                label="Semester"
                                                required
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                                    <MenuItem key={sem} value={sem}>
                                                        Semester {sem}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                )}
                            </>
                        )}

                        {/* Rules Section */}
                        <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Chat Rules
                                </Typography>
                                <Typography variant="body2" color="textSecondary" paragraph>
                                    Add rules to maintain a positive and productive environment.
                                </Typography>
                            </Box>

                            {formData.rules.map((rule, index) => (
                                <Box key={index} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={12} md={5}>
                                            <TextField
                                                fullWidth
                                                label="Rule Title"
                                                value={rule.title}
                                                onChange={(e) => handleRuleChange(index, 'title', e.target.value)}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Rule Description"
                                                value={rule.description}
                                                onChange={(e) => handleRuleChange(index, 'description', e.target.value)}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={1}>
                                            <IconButton
                                                color="error"
                                                onClick={() => removeRule(index)}
                                                disabled={formData.rules.length === 1}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))}

                            <Button
                                startIcon={<AddIcon />}
                                onClick={addRule}
                                variant="outlined"
                                sx={{ mt: 2 }}
                            >
                                Add Rule
                            </Button>
                        </Grid>

                        {/* Submit Button */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/chat')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                >
                                    Create Chat Room
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default CreateChat; 