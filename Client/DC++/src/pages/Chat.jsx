import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    TextField,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    Button,
    Chip,
    Menu,
    MenuItem,
    Badge,
    Tooltip,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Send as SendIcon,
    AttachFile as AttachFileIcon,
    EmojiEmotions as EmojiIcon,
    MoreVert as MoreVertIcon,
    ThumbUp as ThumbUpIcon,
    Lightbulb as InsightfulIcon,
    Help as HelpfulIcon,
    Favorite as MotivatingIcon,
    Pin as PinIcon,
    Share as ShareIcon,
    Bookmark as BookmarkIcon,
    Group as GroupIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Chat = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const { user } = useAuth();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            const response = await axios.get('/api/chats');
            setChats(response.data);
            if (response.data.length > 0) {
                setSelectedChat(response.data[0]);
            }
        } catch (error) {
            console.error('Error fetching chats:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        try {
            const response = await axios.post(`/api/chats/${selectedChat._id}/messages`, {
                content: message,
                type: 'text'
            });

            setChats(chats.map(chat => 
                chat._id === selectedChat._id 
                    ? { ...chat, messages: [...chat.messages, response.data] }
                    : chat
            ));
            setMessage('');
            scrollToBottom();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleReaction = async (messageId, type) => {
        try {
            const response = await axios.post(`/api/chats/${selectedChat._id}/messages/${messageId}/reactions`, {
                type
            });

            setChats(chats.map(chat => 
                chat._id === selectedChat._id 
                    ? {
                        ...chat,
                        messages: chat.messages.map(msg =>
                            msg._id === messageId ? response.data : msg
                        )
                    }
                    : chat
            ));
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadResponse = await axios.post('/api/upload', formData);
            const response = await axios.post(`/api/chats/${selectedChat._id}/messages`, {
                content: file.name,
                type: file.type.startsWith('image/') ? 'image' : 'file',
                fileUrl: uploadResponse.data.url
            });

            setChats(chats.map(chat => 
                chat._id === selectedChat._id 
                    ? { ...chat, messages: [...chat.messages, response.data] }
                    : chat
            ));
            scrollToBottom();
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const renderMessage = (message) => {
        const isOwnMessage = message.sender._id === user._id;
        const reactions = message.reactions.reduce((acc, reaction) => {
            acc[reaction.type] = (acc[reaction.type] || 0) + 1;
            return acc;
        }, {});

        return (
            <Box
                key={message._id}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                    mb: 2
                }}
            >
                <Paper
                    elevation={1}
                    sx={{
                        p: 2,
                        maxWidth: '70%',
                        backgroundColor: isOwnMessage ? theme.palette.primary.light : theme.palette.background.paper,
                        color: isOwnMessage ? theme.palette.primary.contrastText : 'inherit'
                    }}
                >
                    {!isOwnMessage && (
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            {message.sender.name}
                        </Typography>
                    )}
                    {message.type === 'text' ? (
                        <Typography>{message.content}</Typography>
                    ) : message.type === 'image' ? (
                        <img
                            src={message.fileUrl}
                            alt={message.content}
                            style={{ maxWidth: '100%', borderRadius: 4 }}
                        />
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AttachFileIcon />
                            <Typography>{message.content}</Typography>
                        </Box>
                    )}
                    {message.tags?.length > 0 && (
                        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {message.tags.map(tag => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}
                                />
                            ))}
                        </Box>
                    )}
                </Paper>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    {Object.entries(reactions).map(([type, count]) => (
                        <Tooltip key={type} title={type}>
                            <Chip
                                size="small"
                                label={count}
                                icon={getReactionIcon(type)}
                                sx={{ backgroundColor: theme.palette.background.paper }}
                            />
                        </Tooltip>
                    ))}
                </Box>
            </Box>
        );
    };

    const getReactionIcon = (type) => {
        switch (type) {
            case 'like':
                return <ThumbUpIcon fontSize="small" />;
            case 'insightful':
                return <InsightfulIcon fontSize="small" />;
            case 'helpful':
                return <HelpfulIcon fontSize="small" />;
            case 'motivating':
                return <MotivatingIcon fontSize="small" />;
            default:
                return null;
        }
    };

    return (
        <Container maxWidth="xl" sx={{ height: 'calc(100vh - 64px)', py: 2 }}>
            <Grid container spacing={2} sx={{ height: '100%' }}>
                {/* Chat List */}
                <Grid item xs={12} md={3}>
                    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6">Chats</Typography>
                            <Button
                                startIcon={<AddIcon />}
                                variant="contained"
                                size="small"
                                onClick={() => navigate('/create-chat')}
                            >
                                New Chat
                            </Button>
                        </Box>
                        <Divider />
                        <List sx={{ flex: 1, overflow: 'auto' }}>
                            {chats.map(chat => (
                                <ListItem
                                    key={chat._id}
                                    button
                                    selected={selectedChat?._id === chat._id}
                                    onClick={() => setSelectedChat(chat)}
                                >
                                    <ListItemAvatar>
                                        <Avatar>
                                            <GroupIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={chat.name}
                                        secondary={`${chat.members.length} members`}
                                    />
                                    {chat.messages.length > 0 && (
                                        <Badge
                                            badgeContent={chat.messages.length}
                                            color="primary"
                                            sx={{ ml: 1 }}
                                        />
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Chat Area */}
                <Grid item xs={12} md={9}>
                    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {selectedChat ? (
                            <>
                                {/* Chat Header */}
                                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h6">{selectedChat.name}</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {selectedChat.members.length} members
                                        </Typography>
                                    </Box>
                                    <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </Box>
                                <Divider />

                                {/* Messages */}
                                <Box
                                    sx={{
                                        flex: 1,
                                        overflow: 'auto',
                                        p: 2,
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    {selectedChat.messages.map(renderMessage)}
                                    <div ref={messagesEndRef} />
                                </Box>

                                {/* Message Input */}
                                <Box sx={{ p: 2, backgroundColor: theme.palette.background.default }}>
                                    <Grid container spacing={1} alignItems="center">
                                        <Grid item>
                                            <input
                                                type="file"
                                                hidden
                                                ref={fileInputRef}
                                                onChange={handleFileUpload}
                                            />
                                            <IconButton onClick={() => fileInputRef.current?.click()}>
                                                <AttachFileIcon />
                                            </IconButton>
                                        </Grid>
                                        <Grid item xs>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                placeholder="Type a message..."
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item>
                                            <IconButton>
                                                <EmojiIcon />
                                            </IconButton>
                                        </Grid>
                                        <Grid item>
                                            <IconButton
                                                color="primary"
                                                onClick={handleSendMessage}
                                                disabled={!message.trim()}
                                            >
                                                <SendIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </>
                        ) : (
                            <Box
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Typography variant="h6" color="textSecondary">
                                    Select a chat to start messaging
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Chat Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem onClick={() => navigate(`/chat/${selectedChat?._id}/members`)}>
                    <ListItemIcon>
                        <GroupIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>View Members</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => navigate(`/chat/${selectedChat?._id}/settings`)}>
                    <ListItemIcon>
                        <MoreVertIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Chat Settings</ListItemText>
                </MenuItem>
            </Menu>
        </Container>
    );
};

export default Chat; 