import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Paper,
  InputBase,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  CircularProgress,
  Fade,
  Popper,
  ClickAwayListener,
  Badge,
} from '@mui/material';
import {
  Search,
  LocalShipping,
  Receipt,
  Person,
  Assignment,
  Assessment,
  Clear,
  TrendingUp,
  LocationOn,
} from '@mui/icons-material';
import searchService from '../services/searchService';

const UniversalSearch = () => {
  const navigate = useNavigate();
  const { userType } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Search categories with icons and colors
  const searchCategories = {
    shipments: {
      icon: <LocalShipping />,
      color: '#1976d2',
      label: 'Shipments',
    },
    bills: {
      icon: <Receipt />,
      color: '#4caf50',
      label: 'Bills',
    },
    users: {
      icon: <Person />,
      color: '#ff9800',
      label: 'Users',
    },
    loads: {
      icon: <Assignment />,
      color: '#9c27b0',
      label: 'Loads',
    },
    reports: {
      icon: <Assessment />,
      color: '#f44336',
      label: 'Reports',
    },
    drivers: {
      icon: <Person />,
      color: '#607d8b',
      label: 'Drivers',
    },
    fleet: {
      icon: <LocalShipping />,
      color: '#795548',
      label: 'Fleet',
    },
  };

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery.trim());
        setShowSuggestions(false);
      } else if (searchQuery.trim().length >= 1) {
        // Show suggestions for shorter queries
        loadSuggestions(searchQuery.trim());
        setShowResults(false);
      } else {
        setSearchResults([]);
        setShowResults(false);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Load search suggestions
  const loadSuggestions = async (query) => {
    try {
      const suggestionResults = await searchService.getSearchSuggestions(query);
      setSuggestions(suggestionResults);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setSuggestions([]);
    }
  };

  // Perform comprehensive search across all data types
  const performSearch = async (query) => {
    setIsSearching(true);
    setShowResults(true);
    
    try {
      const results = await searchService.performUniversalSearch(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };


  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setAnchorEl(event.currentTarget);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    const allItems = showSuggestions ? suggestions : searchResults;
    
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex(prev => 
        prev < allItems.length - 1 ? prev + 1 : prev
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (selectedIndex >= 0 && allItems[selectedIndex]) {
        if (showSuggestions) {
          setSearchQuery(allItems[selectedIndex]);
          setShowSuggestions(false);
        } else {
          handleResultClick(allItems[selectedIndex]);
        }
      }
    } else if (event.key === 'Escape') {
      setShowResults(false);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  // Global keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Handle search result click
  const handleResultClick = (result) => {
    console.log('Selected result:', result);
    
    // Navigate to appropriate page based on result type
    switch (result.type) {
      case 'shipments':
        // Navigate based on moduleType or user type
        if (result.moduleType === 'loadboard') {
          navigate('/loadboard', { 
            state: { 
              selectedShipment: result,
              searchQuery: searchQuery 
            } 
          });
        } else if (result.moduleType === 'consignment') {
          navigate('/consignment', { 
            state: { 
              selectedShipment: result,
              searchQuery: searchQuery 
            } 
          });
        } else {
          // Fallback based on user type
          if (userType === 'shipper') {
            navigate('/loadboard', { 
              state: { 
                selectedShipment: result,
                searchQuery: searchQuery 
              } 
            });
          } else {
            navigate('/consignment', { 
              state: { 
                selectedShipment: result,
                searchQuery: searchQuery 
              } 
            });
          }
        }
        break;
        
      case 'bills':
        // Navigate to bills page
        navigate('/bills', { 
          state: { 
            selectedBill: result,
            searchQuery: searchQuery 
          } 
        });
        break;
        
      case 'users':
        // Navigate to user management or profile
        navigate('/profile', { 
          state: { 
            selectedUser: result,
            searchQuery: searchQuery 
          } 
        });
        break;
        
      case 'drivers':
        // Navigate to driver management
        navigate('/driver', { 
          state: { 
            selectedDriver: result,
            searchQuery: searchQuery 
          } 
        });
        break;
        
      case 'fleet':
        // Navigate to fleet management
        navigate('/fleet', { 
          state: { 
            selectedVehicle: result,
            searchQuery: searchQuery 
          } 
        });
        break;
        
      case 'reports':
        // Navigate to reports page
        navigate('/reports', { 
          state: { 
            selectedReport: result,
            searchQuery: searchQuery 
          } 
        });
        break;
        
      default:
        // Default to dashboard
        navigate('/dashboard', { 
          state: { 
            searchResult: result,
            searchQuery: searchQuery 
          } 
        });
        break;
    }
    
    // Clear search and close results
    setSearchQuery('');
    setShowResults(false);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle click away
  const handleClickAway = () => {
    setShowResults(false);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusColors = {
      'Delivered': '#4caf50',
      'In Transit': '#2196f3',
      'Bidding': '#ff9800',
      'Assigned': '#9c27b0',
      'Posted': '#607d8b',
      'Pending': '#ff9800',
      'Overdue': '#f44336',
      'Paid': '#4caf50',
      'Active': '#4caf50',
      'Maintenance': '#ff9800',
    };
    return statusColors[status] || '#e0e0e0';
  };

  // Group results by category and handle duplicates
  const groupedResults = {};
  const duplicateGroups = {};
  const processedShipments = new Set(); // Track processed shipments to avoid duplicates
  
  searchResults.forEach(result => {
    if (result.isDuplicate && result.type === 'shipments') {
      // This is a cross-module shipment duplicate
      const shipmentKey = result.title; // Use title as key to identify same shipment
      if (!processedShipments.has(shipmentKey)) {
        processedShipments.add(shipmentKey);
        // Find all modules for this shipment
        const allModules = searchResults.filter(r => 
          r.isDuplicate && 
          r.type === 'shipments' && 
          r.title === shipmentKey
        );
        duplicateGroups[shipmentKey] = allModules;
      }
    } else if (!result.isDuplicate) {
      // Regular result (not a duplicate) - includes bills, users, drivers, etc.
      if (!groupedResults[result.type]) {
        groupedResults[result.type] = [];
      }
      groupedResults[result.type].push(result);
    }
  });

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <Paper
          ref={searchRef}
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            backgroundColor: '#f5f5f5',
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#eeeeee',
            },
            '&:focus-within': {
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            },
          }}
        >
          <IconButton sx={{ p: '10px' }} aria-label="search">
            <Search />
          </IconButton>
          <InputBase
            ref={inputRef}
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search shipments, bills, users, drivers, fleet... (Ctrl+K)"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            inputProps={{ 'aria-label': 'universal search' }}
          />
          {searchQuery && (
            <IconButton
              size="small"
              onClick={handleClearSearch}
              sx={{ p: '5px' }}
            >
              <Clear />
            </IconButton>
          )}
          {isSearching && (
            <CircularProgress size={20} sx={{ mr: 1 }} />
          )}
        </Paper>

        {/* Search Results Dropdown */}
        <Popper
          open={(showResults && searchResults.length > 0) || (showSuggestions && suggestions.length > 0)}
          anchorEl={anchorEl}
          placement="bottom-start"
          sx={{
            zIndex: 1300,
            width: searchRef.current ? searchRef.current.offsetWidth : 'auto',
            maxHeight: '400px',
            overflow: 'auto',
          }}
        >
          <Fade in={(showResults && searchResults.length > 0) || (showSuggestions && suggestions.length > 0)}>
            <Paper
              sx={{
                mt: 1,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                borderRadius: 2,
                overflow: 'hidden',
                maxHeight: '400px',
                overflowY: 'auto',
              }}
            >
              {/* Show suggestions if available */}
              {showSuggestions && suggestions.length > 0 && (
                <Box>
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      backgroundColor: '#f8f9fa',
                      borderBottom: '1px solid #e0e0e0',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          color: '#666',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <TrendingUp />
                      </Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: '#333',
                        }}
                      >
                        Suggestions
                      </Typography>
                      <Chip
                        label={suggestions.length}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.75rem',
                          backgroundColor: '#666',
                          color: 'white',
                        }}
                      />
                    </Box>
                  </Box>
                  <List sx={{ py: 0 }}>
                    {suggestions.map((suggestion, index) => (
                      <ListItem
                        key={index}
                        button
                        onClick={() => handleSuggestionClick(suggestion)}
                        sx={{
                          py: 1.5,
                          px: 2,
                          backgroundColor: selectedIndex === index ? '#e3f2fd' : 'transparent',
                          '&:hover': {
                            backgroundColor: selectedIndex === index ? '#e3f2fd' : '#f5f5f5',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Search sx={{ color: '#666' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                color: '#333',
                              }}
                            >
                              {suggestion}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Show duplicate groups first */}
              {showResults && Object.keys(duplicateGroups).length > 0 && Object.entries(duplicateGroups).map(([key, duplicateGroup]) => (
                <Box key={`duplicate-${key}`}>
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      backgroundColor: '#fff3e0',
                      borderBottom: '1px solid #e0e0e0',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          color: '#ff9800',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <TrendingUp />
                      </Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: '#333',
                        }}
                      >
                        Found in Multiple Modules
                      </Typography>
                      <Chip
                        label={duplicateGroup.length}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.75rem',
                          backgroundColor: '#ff9800',
                          color: 'white',
                        }}
                      />
                    </Box>
                  </Box>
                  <List sx={{ py: 0 }}>
                    {duplicateGroup.map((result, index) => {
                      const globalIndex = showSuggestions ? suggestions.length + index : index;
                      return (
                        <React.Fragment key={result.id}>
                          <ListItem
                            button
                            onClick={() => handleResultClick(result)}
                            sx={{
                              py: 1.5,
                              px: 2,
                              backgroundColor: selectedIndex === globalIndex ? '#e3f2fd' : 'transparent',
                              '&:hover': {
                                backgroundColor: selectedIndex === globalIndex ? '#e3f2fd' : '#f5f5f5',
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <Box
                                sx={{
                                  color: result.moduleInfo?.color || '#666',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                {result.moduleInfo?.icon}
                              </Box>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 500,
                                      color: '#333',
                                    }}
                                  >
                                    {result.title}
                                  </Typography>
                                  <Chip
                                    label={result.moduleInfo?.name || result.type}
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.7rem',
                                      backgroundColor: result.moduleInfo?.color || '#666',
                                      color: 'white',
                                    }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: '#666',
                                      display: 'block',
                                    }}
                                  >
                                    {result.subtitle}
                                  </Typography>
                                  {result.status && (
                                    <Chip
                                      label={result.status}
                                      size="small"
                                      sx={{
                                        height: 18,
                                        fontSize: '0.7rem',
                                        backgroundColor: getStatusColor(result.status),
                                        color: 'white',
                                        mt: 0.5,
                                      }}
                                    />
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < duplicateGroup.length - 1 && <Divider />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                </Box>
              ))}

              {/* Show regular search results if available */}
              {showResults && Object.entries(groupedResults).map(([category, results]) => {
                // Filter out results that are already shown in duplicate groups
                const filteredResults = results.filter(result => !result.isDuplicate);
                if (filteredResults.length === 0) return null;
                
                return (
                <Box key={category}>
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      backgroundColor: '#f8f9fa',
                      borderBottom: '1px solid #e0e0e0',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          color: searchCategories[category]?.color || '#666',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {searchCategories[category]?.icon}
                      </Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: '#333',
                        }}
                      >
                        {searchCategories[category]?.label || category}
                      </Typography>
                      <Chip
                        label={results.length}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.75rem',
                          backgroundColor: searchCategories[category]?.color || '#666',
                          color: 'white',
                        }}
                      />
                    </Box>
                  </Box>
                  <List sx={{ py: 0 }}>
                    {filteredResults.map((result, index) => {
                      const globalIndex = showSuggestions ? suggestions.length + index : index;
                      return (
                        <React.Fragment key={result.id}>
                          <ListItem
                            button
                            onClick={() => handleResultClick(result)}
                            sx={{
                              py: 1.5,
                              px: 2,
                              backgroundColor: selectedIndex === globalIndex ? '#e3f2fd' : 'transparent',
                              '&:hover': {
                                backgroundColor: selectedIndex === globalIndex ? '#e3f2fd' : '#f5f5f5',
                              },
                            }}
                          >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Box
                              sx={{
                                color: searchCategories[result.type]?.color || '#666',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              {searchCategories[result.type]?.icon}
                            </Box>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 500,
                                    color: '#333',
                                  }}
                                >
                                  {result.title}
                                </Typography>
                                <Chip
                                  label={result.moduleInfo?.name || searchCategories[result.type]?.label}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: '0.7rem',
                                    backgroundColor: result.moduleInfo?.color || searchCategories[result.type]?.color || '#666',
                                    color: 'white',
                                  }}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#666',
                                    display: 'block',
                                  }}
                                >
                                  {result.subtitle}
                                </Typography>
                                {result.status && (
                                  <Chip
                                    label={result.status}
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.7rem',
                                      backgroundColor: getStatusColor(result.status),
                                      color: 'white',
                                      mt: 0.5,
                                    }}
                                  />
                                )}
                                {result.rate && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: '#4caf50',
                                      fontWeight: 600,
                                      ml: 1,
                                    }}
                                  >
                                    ${result.rate}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < results.length - 1 && <Divider />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                </Box>
                );
              })}
            </Paper>
          </Fade>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default UniversalSearch;
