import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  TextField,
  IconButton,
  Chip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Email as EmailIcon,
  Send as SendIcon,
  Reply as ReplyIcon,
  ReplyAll as ReplyAllIcon,
  Forward as ForwardIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  AttachFile as AttachFileIcon,
  Inbox as InboxIcon,
  Drafts as DraftsIcon,
  Send as SentIcon,
  Star as StarredIcon,
  Delete as TrashIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { BASE_API_URL } from '../../apiConfig';

const Email = () => {
  const { user, userType } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State management
  const [selectedTab, setSelectedTab] = useState(0);
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);

  // Compose email state
  const [composeData, setComposeData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    attachments: []
  });

  // Tab configuration
  const tabs = [
    { label: 'Inbox', icon: <InboxIcon />, count: emails.filter(e => !e.isRead && e.folder === 'inbox').length },
    { label: 'Sent', icon: <SentIcon />, count: emails.filter(e => e.folder === 'sent').length },
    { label: 'Drafts', icon: <DraftsIcon />, count: emails.filter(e => e.folder === 'drafts').length },
    { label: 'Starred', icon: <StarredIcon />, count: emails.filter(e => e.isStarred).length },
    { label: 'Trash', icon: <TrashIcon />, count: emails.filter(e => e.folder === 'trash').length },
  ];

  // Sample email data (replace with API calls)
  const sampleEmails = [
    {
      id: 1,
      from: 'john.doe@logistics.com',
      fromName: 'John Doe',
      to: user?.email || 'user@example.com',
      subject: 'Shipment Update - LD0331',
      body: 'Your shipment LD0331 has been successfully delivered to the destination. Please find the delivery confirmation attached.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: false,
      isStarred: false,
      folder: 'inbox',
      priority: 'high',
      attachments: ['delivery_confirmation.pdf']
    },
    {
      id: 2,
      from: 'support@vpower.com',
      fromName: 'V Power Support',
      to: user?.email || 'user@example.com',
      subject: 'Welcome to V Power Logistics Platform',
      body: 'Thank you for joining V Power Logistics. We are excited to have you on board. Your account has been successfully created.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      isRead: true,
      isStarred: true,
      folder: 'inbox',
      priority: 'normal',
      attachments: []
    },
    {
      id: 3,
      from: user?.email || 'user@example.com',
      fromName: user?.name || 'You',
      to: 'billing@logistics.com',
      subject: 'Invoice Query - March 2024',
      body: 'I have a question regarding the invoice for March 2024. Could you please clarify the charges?',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isRead: true,
      isStarred: false,
      folder: 'sent',
      priority: 'normal',
      attachments: []
    },
    {
      id: 4,
      from: 'notifications@logistics.com',
      fromName: 'System Notifications',
      to: user?.email || 'user@example.com',
      subject: 'New Load Available - Houston to Dallas',
      body: 'A new load is available for bidding: Houston, TX to Dallas, TX. Weight: 25,000 lbs. Rate: $2,500.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      isRead: false,
      isStarred: false,
      folder: 'inbox',
      priority: 'high',
      attachments: []
    },
    {
      id: 5,
      from: 'admin@logistics.com',
      fromName: 'System Administrator',
      to: user?.email || 'user@example.com',
      subject: 'Account Security Alert',
      body: 'We detected a login from a new device. If this was not you, please contact support immediately.',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      isRead: true,
      isStarred: false,
      folder: 'inbox',
      priority: 'high',
      attachments: []
    }
  ];

  // Load emails on component mount
  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEmails(sampleEmails);
    } catch (err) {
      setError('Failed to load emails');
      console.error('Error loading emails:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setSelectedEmail(null);
  };

  const handleEmailSelect = (email) => {
    setSelectedEmail(email);
    // Mark as read when selected
    if (!email.isRead) {
      markAsRead(email.id);
    }
  };

  const markAsRead = (emailId) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isRead: true } : email
    ));
  };

  const markAsUnread = (emailId) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isRead: false } : email
    ));
  };

  const toggleStar = (emailId) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
    ));
  };

  const deleteEmail = (emailId) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, folder: 'trash' } : email
    ));
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
  };

  const handleComposeSubmit = () => {
    const newEmail = {
      id: Date.now(),
      from: user?.email || 'user@example.com',
      fromName: user?.name || 'You',
      to: composeData.to,
      subject: composeData.subject,
      body: composeData.body,
      timestamp: new Date(),
      isRead: true,
      isStarred: false,
      folder: 'sent',
      priority: 'normal',
      attachments: composeData.attachments
    };

    setEmails(prev => [newEmail, ...prev]);
    setComposeOpen(false);
    setComposeData({ to: '', cc: '', bcc: '', subject: '', body: '', attachments: [] });
  };

  const getFilteredEmails = () => {
    let filtered = emails;
    
    // Filter by tab
    const tabFolders = ['inbox', 'sent', 'drafts', 'starred', 'trash'];
    if (selectedTab < 4) {
      if (selectedTab === 3) { // Starred tab
        filtered = filtered.filter(email => email.isStarred);
      } else {
        filtered = filtered.filter(email => email.folder === tabFolders[selectedTab]);
      }
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(email => 
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.fromName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.body.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const emailDate = new Date(timestamp);
    const diffInHours = (now - emailDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return emailDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return emailDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return emailDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'normal': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const EmailList = () => (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Search and Actions */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
            }}
            sx={{ flexGrow: 1 }}
          />
          <IconButton onClick={() => setFilterMenuAnchor(document.getElementById('filter-button'))}>
            <FilterListIcon />
          </IconButton>
          <IconButton onClick={loadEmails}>
            <RefreshIcon />
          </IconButton>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setComposeOpen(true)}
          sx={{ width: '100%' }}
        >
          Compose
        </Button>
      </Box>

      {/* Email List */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {getFilteredEmails().map((email, index) => (
              <React.Fragment key={email.id}>
                <ListItem
                  button
                  onClick={() => handleEmailSelect(email)}
                  selected={selectedEmail?.id === email.id}
                  sx={{
                    borderLeft: email.priority === 'high' ? '4px solid #f44336' : 'none',
                    backgroundColor: email.isRead ? 'transparent' : '#f3f4f6',
                    '&:hover': { backgroundColor: '#f5f5f5' },
                    '&.Mui-selected': { backgroundColor: '#e3f2fd' }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getPriorityColor(email.priority) }}>
                      {email.fromName.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: email.isRead ? 400 : 600 }}
                        >
                          {email.fromName}
                        </Typography>
                        {email.isStarred && <StarIcon sx={{ color: '#ffc107', fontSize: 16 }} />}
                        {email.attachments.length > 0 && <AttachFileIcon sx={{ fontSize: 16 }} />}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ 
                            fontWeight: email.isRead ? 400 : 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {email.subject}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {email.body.substring(0, 100)}...
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(email.timestamp)}
                    </Typography>
                    {!email.isRead && (
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1976d2' }} />
                    )}
                  </Box>
                </ListItem>
                {index < getFilteredEmails().length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );

  const EmailViewer = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
      {selectedEmail ? (
        <>
          {/* Email Header - Gmail Style */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 400, color: '#202124' }}>
                {selectedEmail.subject}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title={selectedEmail.isStarred ? 'Remove from starred' : 'Add to starred'}>
                  <IconButton size="small" onClick={() => toggleStar(selectedEmail.id)}>
                    {selectedEmail.isStarred ? 
                      <StarIcon sx={{ color: '#fbbc04', fontSize: 20 }} /> : 
                      <StarBorderIcon sx={{ fontSize: 20, color: '#5f6368' }} />
                    }
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reply">
                  <IconButton size="small">
                    <ReplyIcon sx={{ fontSize: 20, color: '#5f6368' }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reply All">
                  <IconButton size="small">
                    <ReplyAllIcon sx={{ fontSize: 20, color: '#5f6368' }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Forward">
                  <IconButton size="small">
                    <ForwardIcon sx={{ fontSize: 20, color: '#5f6368' }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => deleteEmail(selectedEmail.id)}>
                    <DeleteIcon sx={{ fontSize: 20, color: '#5f6368' }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#202124', mb: 0.5 }}>
                  {selectedEmail.fromName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#5f6368' }}>
                  to me
                </Typography>
                <Typography variant="caption" sx={{ color: '#5f6368', ml: 1 }}>
                  {selectedEmail.timestamp.toLocaleString()}
                </Typography>
              </Box>
              {selectedEmail.priority === 'high' && (
                <Chip
                  label="High Priority"
                  size="small"
                  sx={{ 
                    bgcolor: '#fce8e6',
                    color: '#d93025',
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Email Body - Gmail Style */}
          <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                whiteSpace: 'pre-wrap', 
                lineHeight: 1.6,
                color: '#202124',
                fontSize: '0.875rem'
              }}
            >
              {selectedEmail.body}
            </Typography>
            
            {selectedEmail.attachments.length > 0 && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500, color: '#202124' }}>
                  Attachments ({selectedEmail.attachments.length})
                </Typography>
                {selectedEmail.attachments.map((attachment, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      backgroundColor: 'white',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0',
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f1f3f4' }
                    }}
                  >
                    <AttachFileIcon sx={{ fontSize: 16, color: '#5f6368' }} />
                    <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 500 }}>
                      {attachment}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: '#5f6368'
        }}>
          <EmailIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 400 }}>
            Select an email to read
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Choose an email from the list to view its contents
          </Typography>
        </Box>
      )}
    </Box>
  );

  const ComposeDialog = () => (
    <Dialog
      open={composeOpen}
      onClose={() => setComposeOpen(false)}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          minHeight: isMobile ? '100vh' : 600
        }
      }}
    >
      {/* Gmail-style Compose Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 400, color: '#202124' }}>
          New Message
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small">
            <AttachFileIcon sx={{ fontSize: 20, color: '#5f6368' }} />
          </IconButton>
          <IconButton size="small" onClick={() => setComposeOpen(false)}>
            <DeleteIcon sx={{ fontSize: 20, color: '#5f6368' }} />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          {/* To Field */}
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Typography variant="body2" sx={{ minWidth: 60, color: '#5f6368', fontWeight: 500 }}>
              To
            </Typography>
            <TextField
              value={composeData.to}
              onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
              fullWidth
              placeholder="Recipients"
              variant="standard"
              InputProps={{
                disableUnderline: true,
                sx: { fontSize: '0.875rem' }
              }}
              required
            />
          </Box>

          {/* CC Field */}
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Typography variant="body2" sx={{ minWidth: 60, color: '#5f6368', fontWeight: 500 }}>
              Cc
            </Typography>
            <TextField
              value={composeData.cc}
              onChange={(e) => setComposeData(prev => ({ ...prev, cc: e.target.value }))}
              fullWidth
              placeholder="Cc"
              variant="standard"
              InputProps={{
                disableUnderline: true,
                sx: { fontSize: '0.875rem' }
              }}
            />
          </Box>

          {/* Subject Field */}
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Typography variant="body2" sx={{ minWidth: 60, color: '#5f6368', fontWeight: 500 }}>
              Subject
            </Typography>
            <TextField
              value={composeData.subject}
              onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
              fullWidth
              placeholder="Subject"
              variant="standard"
              InputProps={{
                disableUnderline: true,
                sx: { fontSize: '0.875rem' }
              }}
              required
            />
          </Box>

          {/* Message Body */}
          <Box sx={{ flexGrow: 1, p: 2 }}>
            <TextField
              value={composeData.body}
              onChange={(e) => setComposeData(prev => ({ ...prev, body: e.target.value }))}
              fullWidth
              multiline
              placeholder="Compose email"
              variant="standard"
              InputProps={{
                disableUnderline: true,
                sx: { 
                  fontSize: '0.875rem',
                  '& textarea': {
                    minHeight: 300,
                    resize: 'none'
                  }
                }
              }}
              required
            />
          </Box>
        </Box>
      </DialogContent>

      {/* Gmail-style Footer */}
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={handleComposeSubmit}
          disabled={!composeData.to || !composeData.subject || !composeData.body}
          sx={{
            backgroundColor: '#1a73e8',
            color: 'white',
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            '&:hover': {
              backgroundColor: '#1557b0'
            },
            '&:disabled': {
              backgroundColor: '#e0e0e0',
              color: '#5f6368'
            }
          }}
        >
          Send
        </Button>
        <Button
          onClick={() => setComposeOpen(false)}
          sx={{
            color: '#5f6368',
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Discard
        </Button>
      </Box>
    </Dialog>
  );

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadEmails}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Gmail-style Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2, 
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: 'white',
        minHeight: 64
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 400, color: '#5f6368' }}>
            V Power Mail
          </Typography>
        </Box>
        
        {/* Search Bar */}
        <Box sx={{ 
          flexGrow: 1, 
          maxWidth: 600, 
          mx: 4,
          position: 'relative'
        }}>
          <TextField
            placeholder="Search mail"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: '#5f6368', mr: 1 }} />,
              endAdornment: <FilterListIcon sx={{ color: '#5f6368', ml: 1 }} />,
              sx: {
                backgroundColor: '#f1f3f4',
                borderRadius: '24px',
                '& fieldset': { border: 'none' },
                '&:hover': { backgroundColor: '#e8eaed' },
                '&.Mui-focused': { backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }
              }
            }}
            sx={{ width: '100%' }}
          />
        </Box>

        {/* Header Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small">
            <RefreshIcon />
          </IconButton>
          <IconButton size="small">
            <FilterListIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Left Sidebar - Gmail Style */}
        <Box sx={{ 
          width: 256, 
          backgroundColor: 'white', 
          borderRight: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Compose Button */}
          <Box sx={{ p: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setComposeOpen(true)}
              sx={{
                width: '100%',
                borderRadius: '24px',
                textTransform: 'none',
                fontWeight: 500,
                py: 1.5,
                backgroundColor: '#c2e7ff',
                color: '#001d35',
                '&:hover': {
                  backgroundColor: '#a8d8ff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                }
              }}
            >
              Compose
            </Button>
          </Box>

          {/* Navigation Menu */}
          <Box sx={{ flexGrow: 1, px: 1 }}>
            {tabs.map((tab, index) => (
              <Box
                key={index}
                onClick={() => handleTabChange(null, index)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  py: 1.5,
                  borderRadius: '0 24px 24px 0',
                  cursor: 'pointer',
                  backgroundColor: selectedTab === index ? '#fce8e6' : 'transparent',
                  color: selectedTab === index ? '#d93025' : '#5f6368',
                  '&:hover': {
                    backgroundColor: selectedTab === index ? '#fce8e6' : '#f1f3f4'
                  }
                }}
              >
                <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                  {tab.icon}
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    flexGrow: 1,
                    fontWeight: selectedTab === index ? 500 : 400
                  }}
                >
                  {tab.label}
                </Typography>
                {tab.count > 0 && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#5f6368',
                      fontWeight: 500,
                      ml: 1
                    }}
                  >
                    {tab.count}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Main Email Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Email List Toolbar */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 1, 
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: 'white',
            minHeight: 48
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
              <IconButton size="small">
                <Box sx={{ width: 18, height: 18, border: '1px solid #5f6368', borderRadius: '2px' }} />
              </IconButton>
              <IconButton size="small">
                <Box sx={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid #5f6368' }} />
              </IconButton>
              <IconButton size="small">
                <RefreshIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton size="small">
                <MoreVertIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
            <Typography variant="caption" sx={{ color: '#5f6368', mr: 2 }}>
              1-{getFilteredEmails().length}
            </Typography>
          </Box>

          {/* Email List */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {getFilteredEmails().map((email, index) => (
                  <ListItem
                    key={email.id}
                    onClick={() => handleEmailSelect(email)}
                    selected={selectedEmail?.id === email.id}
                    sx={{
                      borderBottom: '1px solid #e0e0e0',
                      backgroundColor: email.isRead ? 'white' : '#f8f9fa',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f1f3f4' },
                      '&.Mui-selected': { backgroundColor: '#e8f0fe' },
                      py: 0.5
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                      {/* Checkbox */}
                      <IconButton size="small" sx={{ p: 0.5 }}>
                        <Box sx={{ width: 18, height: 18, border: '1px solid #5f6368', borderRadius: '2px' }} />
                      </IconButton>

                      {/* Star */}
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(email.id);
                        }}
                        sx={{ p: 0.5 }}
                      >
                        {email.isStarred ? 
                          <StarIcon sx={{ fontSize: 18, color: '#fbbc04' }} /> : 
                          <StarBorderIcon sx={{ fontSize: 18, color: '#5f6368' }} />
                        }
                      </IconButton>

                      {/* Sender */}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          minWidth: 200,
                          fontWeight: email.isRead ? 400 : 600,
                          color: email.isRead ? '#5f6368' : '#202124'
                        }}
                      >
                        {email.fromName}
                      </Typography>

                      {/* Subject and Preview */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: email.isRead ? 400 : 600,
                              color: email.isRead ? '#5f6368' : '#202124',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {email.subject}
                          </Typography>
                          {email.attachments.length > 0 && (
                            <AttachFileIcon sx={{ fontSize: 16, color: '#5f6368' }} />
                          )}
                        </Box>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#5f6368',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block'
                          }}
                        >
                          {email.body.substring(0, 80)}...
                        </Typography>
                      </Box>

                      {/* Time */}
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#5f6368',
                          minWidth: 60,
                          textAlign: 'right'
                        }}
                      >
                        {formatTimestamp(email.timestamp)}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>

        {/* Email Viewer - Right Panel */}
        {selectedEmail && (
          <Box sx={{ 
            width: 400, 
            borderLeft: '1px solid #e0e0e0',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <EmailViewer />
          </Box>
        )}
      </Box>

      <ComposeDialog />
    </Box>
  );
};

export default Email;
