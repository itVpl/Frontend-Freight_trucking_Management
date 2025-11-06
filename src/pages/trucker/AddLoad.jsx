import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Button,
  Stack,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Modal,
  IconButton,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Search,
  Clear,
  Close,
  Visibility,
  Edit,
  Delete,
  LocalShipping,
  LocationOn,
  CalendarToday,
  AttachMoney,
  Description,
  Save,
  Cancel,
  Business,
  Room,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { BASE_API_URL } from '../../apiConfig';

const DRAYAGE_VEHICLE_TYPES = [
  "20' Standard (Dry Van)",
  "40' Standard (Dry Van)",
  "45' Standard (Dry Van)",
  "20' Reefer",
  "40' Reefer (High Cube or Standard)",
  "Open Top Container",
  "Flat Rack Container",
  "Tank Container (ISO Tank)",
  "40' High Cube (HC)",
  "45' High Cube (HC)"
];

const OTR_VEHICLE_TYPES = [
  "Dry Van",
  "Reefer (Refrigerated Van)",
  "Step Deck (Drop Deck)",
  "Double Drop / Lowboy",
  "Conestoga",
  "Livestock Trailer",
  "Car Hauler",
  "Container Chassis",
  "End Dump",
  "Side Dump",
  "Hopper Bottom"
];

const AddLoad = () => {
  const { user, userType } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadsData, setLoadsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [loadType, setLoadType] = useState('OTR');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [viewLoadData, setViewLoadData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [chargesCalculatorModalOpen, setChargesCalculatorModalOpen] = useState(false);
  const [charges, setCharges] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [formData, setFormData] = useState(() => ({
    customerId: '',
    loadType: 'OTR',
    vehicleType: 'Dry Van',
    rate: '',
    rateType: 'Flat Rate',
    lineHaul: '',
    fsc: '',
    other: '',
    total: '',
    bidDeadline: '',
    // DRAYAGE single fields
    fromAddress: '',
    fromCity: '',
    fromState: '',
    fromZip: '',
    toAddress: '',
    toCity: '',
    toState: '',
    toZip: '',
    returnAddress: '',
    returnCity: '',
    returnState: '',
    returnZip: '',
    // Common single pickup/delivery (backward compat)
    pickupLocation: '',
    pickupCity: '',
    pickupState: '',
    pickupZip: '',
    deliveryLocation: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryZip: '',
    pickupDate: '',
    deliveryDate: '',
    // OTR arrays (preferred)
    origins: [{
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zip: '',
      weight: '',
      commodity: '',
      pickupDate: '',
      deliveryDate: ''
    }],
    destinations: [{
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zip: '',
      weight: '',
      commodity: '',
      deliveryDate: ''
    }],
    // Common
    weight: '',
    commodity: '',
    containerNo: '',
    poNumber: '',
    bolNumber: '',
    shipmentNo: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      specialInstructions: '',
      returnDate: '',
      returnLocation: '',
      chargesArray: []
    }));

  // Fetch all loads on component mount
  useEffect(() => {
    fetchAllLoads();
  }, []);

  // Fetch customers when modal opens
  useEffect(() => {
    if (addModalOpen) {
      fetchCustomers();
    }
  }, [addModalOpen]);

  // API Functions
  const fetchAllLoads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_API_URL}/api/v1/customer-load`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setLoadsData(result.data.loads || []);
      } else {
        throw new Error(result.message || 'Failed to fetch loads');
      }
    } catch (err) {
      console.error('Error fetching loads:', err);
      setError(err.message || 'Failed to fetch loads');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_API_URL}/api/v1/trucker-customer/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setCustomers(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch customers');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setCustomersLoading(false);
    }
  };

  const fetchLoadById = async (loadId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_API_URL}/api/v1/customer-load/${loadId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch load details');
      }
    } catch (err) {
      console.error('Error fetching load details:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addLoad = async (loadData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Transform form data to match API structure
      const hasArrays = Array.isArray(loadData.origins) && loadData.origins.length > 0 && Array.isArray(loadData.destinations) && loadData.destinations.length > 0;
      
      // Prepare origins
      let origins = [];
      
      // For DRAYAGE, always use the DRAYAGE fields regardless of hasArrays
      if (loadData.loadType === 'DRAYAGE') {
        const fromAddress = loadData.fromAddress ? String(loadData.fromAddress).trim() : '';
        const fromCity = loadData.fromCity ? String(loadData.fromCity).trim() : '';
        const fromState = loadData.fromState ? String(loadData.fromState).trim() : '';
        const fromZip = loadData.fromZip ? String(loadData.fromZip).trim() : '';
        
        // Helper function to safely convert date
        const safeDateISO = (dateValue) => {
          if (!dateValue) return undefined;
          const date = new Date(dateValue);
          return isNaN(date.getTime()) ? undefined : date.toISOString();
        };
        
        // Always create origin for DRAYAGE
        const originObj = {
          addressLine1: fromAddress,
          addressLine2: '',
          city: fromCity,
          state: fromState,
          zip: fromZip
        };
        
        // Only add optional fields if they have valid values
        if (loadData.weight) {
          originObj.weight = parseFloat(loadData.weight);
        }
        if (loadData.commodity) {
          originObj.commodity = String(loadData.commodity);
        }
        const pickupDateISO = safeDateISO(loadData.pickupDate);
        if (pickupDateISO) {
          originObj.pickupDate = pickupDateISO;
        }
        const deliveryDateISO = safeDateISO(loadData.deliveryDate);
        if (deliveryDateISO) {
          originObj.deliveryDate = deliveryDateISO;
        }
        
        origins = [originObj];
      } else if (hasArrays) {
        // OTR with arrays
        // Helper function to safely convert date
        const safeDateISO = (dateValue) => {
          if (!dateValue) return undefined;
          const date = new Date(dateValue);
          return isNaN(date.getTime()) ? undefined : date.toISOString();
        };
        
        origins = loadData.origins
          .filter(o => o !== null && o !== undefined && typeof o === 'object') // Filter out null/undefined items
          .map(o => {
            const originObj = {
              addressLine1: (o && o.addressLine1) ? String(o.addressLine1) : '',
              addressLine2: (o && o.addressLine2) ? String(o.addressLine2) : '',
              city: (o && o.city) ? String(o.city) : '',
              state: (o && o.state) ? String(o.state) : '',
              zip: (o && o.zip) ? String(o.zip) : ''
            };
            
            // Only add optional fields if they have valid values
            if (o && o.weight) {
              originObj.weight = parseFloat(o.weight);
            }
            if (o && o.commodity) {
              originObj.commodity = String(o.commodity);
            }
            const pickupDateISO = safeDateISO(o && o.pickupDate);
            if (pickupDateISO) {
              originObj.pickupDate = pickupDateISO;
            }
            const deliveryDateISO = safeDateISO(o && o.deliveryDate);
            if (deliveryDateISO) {
              originObj.deliveryDate = deliveryDateISO;
            }
            
            return originObj;
          })
          .filter(o => o.city !== '' || o.addressLine1 !== ''); // Filter out completely empty entries
      } else {
        // OTR fallback
        // Helper function to safely convert date
        const safeDateISO = (dateValue) => {
          if (!dateValue) return undefined;
          const date = new Date(dateValue);
          return isNaN(date.getTime()) ? undefined : date.toISOString();
        };
        
        const originObj = {
          addressLine1: (loadData.pickupLocation) ? String(loadData.pickupLocation) : '',
          addressLine2: '',
          city: (loadData.pickupCity) ? String(loadData.pickupCity) : '',
          state: (loadData.pickupState) ? String(loadData.pickupState) : '',
          zip: (loadData.pickupZip) ? String(loadData.pickupZip) : ''
        };
        
        // Only add optional fields if they have valid values
        if (loadData.weight) {
          originObj.weight = parseFloat(loadData.weight);
        }
        if (loadData.commodity) {
          originObj.commodity = String(loadData.commodity);
        }
        const pickupDateISO = safeDateISO(loadData.pickupDate);
        if (pickupDateISO) {
          originObj.pickupDate = pickupDateISO;
        }
        const deliveryDateISO = safeDateISO(loadData.deliveryDate);
        if (deliveryDateISO) {
          originObj.deliveryDate = deliveryDateISO;
        }
        
        origins = [originObj];
      }

      // Prepare destinations
      let destinations = [];
      
      // For DRAYAGE, always use the DRAYAGE fields regardless of hasArrays
      if (loadData.loadType === 'DRAYAGE') {
        const toAddress = loadData.toAddress ? String(loadData.toAddress).trim() : '';
        const toCity = loadData.toCity ? String(loadData.toCity).trim() : '';
        const toState = loadData.toState ? String(loadData.toState).trim() : '';
        const toZip = loadData.toZip ? String(loadData.toZip).trim() : '';
        
        // Helper function to safely convert date
        const safeDateISO = (dateValue) => {
          if (!dateValue) return undefined;
          const date = new Date(dateValue);
          return isNaN(date.getTime()) ? undefined : date.toISOString();
        };
        
        // Always create destination for DRAYAGE
        const destObj = {
          addressLine1: toAddress,
          addressLine2: '',
          city: toCity,
          state: toState,
          zip: toZip
        };
        
        // Only add optional fields if they have valid values
        if (loadData.weight) {
          destObj.weight = parseFloat(loadData.weight);
        }
        if (loadData.commodity) {
          destObj.commodity = String(loadData.commodity);
        }
        const deliveryDateISO = safeDateISO(loadData.deliveryDate);
        if (deliveryDateISO) {
          destObj.deliveryDate = deliveryDateISO;
        }
        
        destinations = [destObj];
      } else if (hasArrays) {
        // OTR with arrays
        // Helper function to safely convert date
        const safeDateISO = (dateValue) => {
          if (!dateValue) return undefined;
          const date = new Date(dateValue);
          return isNaN(date.getTime()) ? undefined : date.toISOString();
        };
        
        destinations = loadData.destinations
          .filter(d => d !== null && d !== undefined && typeof d === 'object') // Filter out null/undefined items
          .map(d => {
            const destObj = {
              addressLine1: (d && d.addressLine1) ? String(d.addressLine1) : '',
              addressLine2: (d && d.addressLine2) ? String(d.addressLine2) : '',
              city: (d && d.city) ? String(d.city) : '',
              state: (d && d.state) ? String(d.state) : '',
              zip: (d && d.zip) ? String(d.zip) : ''
            };
            
            // Only add optional fields if they have valid values
            if (d && d.weight) {
              destObj.weight = parseFloat(d.weight);
            }
            if (d && d.commodity) {
              destObj.commodity = String(d.commodity);
            }
            const deliveryDateISO = safeDateISO(d && d.deliveryDate);
            if (deliveryDateISO) {
              destObj.deliveryDate = deliveryDateISO;
            }
            
            return destObj;
          })
          .filter(d => d.city !== '' || d.addressLine1 !== ''); // Filter out completely empty entries
      } else {
        // OTR fallback
        const deliveryAddress = (loadData.deliveryLocation) ? String(loadData.deliveryLocation).trim() : '';
        const deliveryCity = (loadData.deliveryCity) ? String(loadData.deliveryCity).trim() : '';
        
        // Helper function to safely convert date
        const safeDateISO = (dateValue) => {
          if (!dateValue) return undefined;
          const date = new Date(dateValue);
          return isNaN(date.getTime()) ? undefined : date.toISOString();
        };
        
        // Only add destination if at least address or city is provided
        if (deliveryAddress || deliveryCity) {
          const destObj = {
            addressLine1: deliveryAddress,
            addressLine2: '',
            city: deliveryCity,
            state: (loadData.deliveryState) ? String(loadData.deliveryState) : '',
            zip: (loadData.deliveryZip) ? String(loadData.deliveryZip) : ''
          };
          
          // Only add optional fields if they have valid values
          if (loadData.weight) {
            destObj.weight = parseFloat(loadData.weight);
          }
          if (loadData.commodity) {
            destObj.commodity = String(loadData.commodity);
          }
          const deliveryDateISO = safeDateISO(loadData.deliveryDate);
          if (deliveryDateISO) {
            destObj.deliveryDate = deliveryDateISO;
          }
          
          destinations = [destObj];
        }
      }

      // Ensure we have at least one origin and destination
      if (origins.length === 0) {
        throw new Error('At least one pickup location is required. Please fill in the pickup address or city.');
      }
      if (destinations.length === 0) {
        throw new Error('At least one delivery location is required. Please fill in the delivery address or city.');
      }

      // Calculate rate details
      const lineHaul = parseFloat(loadData.lineHaul) || 0;
      const fscPercent = parseFloat(loadData.fsc) || 0;
      const otherChargesAmount = parseFloat(loadData.other) || 0;
      const fscAmount = lineHaul * (fscPercent / 100);
      const totalRates = lineHaul + fscAmount + otherChargesAmount;

      // Prepare other charges array
      // Priority: 1. chargesArray from formData (from Charges Calculator), 2. charges state, 3. other amount
      let otherChargesArray = [];
      if (loadData.chargesArray && loadData.chargesArray.length > 0) {
        // Use chargesArray from formData (stored when user applies charges)
        otherChargesArray = loadData.chargesArray
          .filter(charge => charge && charge.name)
          .map(charge => ({
            name: charge.name || 'Other Charge',
            amount: parseFloat(charge.amount) || 0,
            quantity: parseFloat(charge.quantity) || 1
          }));
      } else if (otherChargesAmount > 0) {
        // Fallback: create single charge entry from other amount
        otherChargesArray = [{
          name: 'Other Charges',
          amount: otherChargesAmount,
          quantity: 1
        }];
      }

      // Recalculate totalRates including quantity in other charges
      const otherChargesTotal = otherChargesArray.reduce((sum, charge) => {
        return sum + (parseFloat(charge.amount) || 0) * (parseFloat(charge.quantity) || 1);
      }, 0);
      const finalTotalRates = lineHaul + fscAmount + otherChargesTotal;

      // Build rateDetails
      const rateDetails = {
        lineHaul: lineHaul,
        fsc: fscPercent,
        other: otherChargesArray,
        totalRates: finalTotalRates
      };

      // Build API payload
      const apiPayload = {
        customerId: loadData.customerId || '',
        loadType: loadData.loadType,
        vehicleType: loadData.vehicleType || 'Dry Van',
        rate: finalTotalRates, // Use totalRates from rateDetails
        rateType: loadData.rateType || 'Flat Rate',
        rateDetails: rateDetails,
        origins: origins,
        destinations: destinations
      };

      // Helper function to safely convert date (used for common fields)
      const safeDateISO = (dateValue) => {
        if (!dateValue) return undefined;
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? undefined : date.toISOString();
      };

      // Add optional fields only if they have values
      if (loadData.containerNo) {
        apiPayload.containerNo = loadData.containerNo;
      }
      if (loadData.poNumber) {
        apiPayload.poNumber = loadData.poNumber;
      }
      if (loadData.bolNumber) {
        apiPayload.bolNumber = loadData.bolNumber;
      }
      if (loadData.shipmentNo) {
        apiPayload.shipmentNo = loadData.shipmentNo;
      }
      
      // Add bidDeadline if provided
      const bidDeadlineISO = safeDateISO(loadData.bidDeadline);
      if (bidDeadlineISO) {
        apiPayload.bidDeadline = bidDeadlineISO;
      }

      // Add DRAYAGE specific fields
      if (loadData.loadType === 'DRAYAGE') {
        const returnDateISO = safeDateISO(loadData.returnDate);
        if (returnDateISO) {
          apiPayload.returnDate = returnDateISO;
        }
        if (loadData.returnAddress) {
          apiPayload.returnAddress = loadData.returnAddress;
        }
        if (loadData.returnCity) {
          apiPayload.returnCity = loadData.returnCity;
        }
        if (loadData.returnState) {
          apiPayload.returnState = loadData.returnState;
        }
        if (loadData.returnZip) {
          apiPayload.returnZip = loadData.returnZip;
        }
      }

      const response = await fetch(`${BASE_API_URL}/api/v1/customer-load/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to add load');
      }
    } catch (err) {
      console.error('Error adding load:', err);
      throw err;
    }
  };

  const updateLoad = async (loadId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_API_URL}/api/v1/trucker-loads/${loadId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update load');
      }
    } catch (err) {
      console.error('Error updating load:', err);
      throw err;
    }
  };

  const deleteLoad = async (loadId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_API_URL}/api/v1/trucker-loads/${loadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return true;
      } else {
        throw new Error(result.message || 'Failed to delete load');
      }
    } catch (err) {
      console.error('Error deleting load:', err);
      throw err;
    }
  };

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleAddLoad = useCallback(() => {
    setLoadType('OTR');
    setSelectedLoad(null);
    setFormData({
      customerId: '',
      loadType: 'OTR',
      vehicleType: 'Dry Van',
      rate: '',
      rateType: 'Flat Rate',
      bidDeadline: '',
      fromAddress: '',
      fromCity: '',
      fromState: '',
      fromZip: '',
      toAddress: '',
      toCity: '',
      toState: '',
      toZip: '',
      returnAddress: '',
      returnCity: '',
      returnState: '',
      returnZip: '',
      pickupLocation: '',
      pickupCity: '',
      pickupState: '',
      pickupZip: '',
      deliveryLocation: '',
      deliveryCity: '',
      deliveryState: '',
      deliveryZip: '',
      pickupDate: '',
      deliveryDate: '',
      origins: [{
        addressLine1: '', addressLine2: '', city: '', state: '', zip: '', weight: '', commodity: '', pickupDate: '', deliveryDate: ''
      }],
      destinations: [{
        addressLine1: '', addressLine2: '', city: '', state: '', zip: '', weight: '', commodity: '', deliveryDate: ''
      }],
      weight: '',
      commodity: '',
      containerNo: '',
      poNumber: '',
      bolNumber: '',
      shipmentNo: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      specialInstructions: '',
      returnDate: '',
      returnLocation: '',
      chargesArray: []
    });
    setCharges([]); // Also reset charges state
    setAddModalOpen(true);
  }, []);

  const handleEditLoad = useCallback(async (load) => {
    try {
      setLoading(true);
      // Fetch full load details from API
      const loadDetails = await fetchLoadById(load.loadId || load._id);
      
      if (!loadDetails) {
        throw new Error('Failed to fetch load details');
      }

      const loadData = loadDetails.load || loadDetails;
      const loadTypeValue = loadData.loadType || 'OTR';
      
      // Set load type
      setLoadType(loadTypeValue);
      
      // Extract rate details
      const rateDetails = loadData.rateDetails || {};
      const lineHaul = rateDetails.lineHaul || '';
      const fsc = rateDetails.fsc || '';
      const other = rateDetails.other ? (Array.isArray(rateDetails.other) 
        ? rateDetails.other.reduce((sum, charge) => sum + (parseFloat(charge.total) || 0), 0).toFixed(2)
        : parseFloat(rateDetails.other).toFixed(2)) : '';
      
      // Populate form data
      const formDataToSet = {
        customerId: loadData.customerId || '',
        loadType: loadTypeValue,
        vehicleType: loadData.vehicleType || 'Dry Van',
        rate: loadData.rate || '',
        rateType: loadData.rateType || 'Flat Rate',
        lineHaul: lineHaul,
        fsc: fsc,
        other: other,
        total: loadData.rate || '',
        bidDeadline: loadData.bidDeadline ? loadData.bidDeadline.split('T')[0] : '',
        // OTR fields
        pickupLocation: loadData.origins?.[0]?.addressLine1 || '',
        pickupCity: loadData.origins?.[0]?.city || '',
        pickupState: loadData.origins?.[0]?.state || '',
        pickupZip: loadData.origins?.[0]?.zip || '',
        deliveryLocation: loadData.destinations?.[0]?.addressLine1 || '',
        deliveryCity: loadData.destinations?.[0]?.city || '',
        deliveryState: loadData.destinations?.[0]?.state || '',
        deliveryZip: loadData.destinations?.[0]?.zip || '',
        pickupDate: loadData.origins?.[0]?.pickupDate ? loadData.origins[0].pickupDate.split('T')[0] : '',
        deliveryDate: loadData.destinations?.[0]?.deliveryDate ? loadData.destinations[0].deliveryDate.split('T')[0] : '',
        weight: loadData.origins?.[0]?.weight || loadData.weight || '',
        commodity: loadData.origins?.[0]?.commodity || loadData.commodity || '',
        // DRAYAGE fields - populate from origins/destinations arrays if loadType is DRAYAGE
        fromAddress: loadTypeValue === 'DRAYAGE' ? (loadData.origins?.[0]?.addressLine1 || loadData.fromAddress || '') : (loadData.fromAddress || ''),
        fromCity: loadTypeValue === 'DRAYAGE' ? (loadData.origins?.[0]?.city || loadData.fromCity || '') : (loadData.fromCity || ''),
        fromState: loadTypeValue === 'DRAYAGE' ? (loadData.origins?.[0]?.state || loadData.fromState || '') : (loadData.fromState || ''),
        fromZip: loadTypeValue === 'DRAYAGE' ? (loadData.origins?.[0]?.zip || loadData.fromZip || '') : (loadData.fromZip || ''),
        toAddress: loadTypeValue === 'DRAYAGE' ? (loadData.destinations?.[0]?.addressLine1 || loadData.toAddress || '') : (loadData.toAddress || ''),
        toCity: loadTypeValue === 'DRAYAGE' ? (loadData.destinations?.[0]?.city || loadData.toCity || '') : (loadData.toCity || ''),
        toState: loadTypeValue === 'DRAYAGE' ? (loadData.destinations?.[0]?.state || loadData.toState || '') : (loadData.toState || ''),
        toZip: loadTypeValue === 'DRAYAGE' ? (loadData.destinations?.[0]?.zip || loadData.toZip || '') : (loadData.toZip || ''),
        returnAddress: loadData.returnAddress || '',
        returnCity: loadData.returnCity || '',
        returnState: loadData.returnState || '',
        returnZip: loadData.returnZip || '',
        // Common fields
        containerNo: loadData.containerNo || '',
        poNumber: loadData.poNumber || '',
        bolNumber: loadData.bolNumber || '',
        shipmentNo: loadData.shipmentNo || '',
        customerName: loadData.customerLoadDetails?.customerName || '',
        customerPhone: loadData.customerLoadDetails?.customerPhone || '',
        customerEmail: loadData.customerLoadDetails?.customerEmail || '',
        specialInstructions: loadData.specialInstructions || '',
        returnDate: loadData.returnDate ? loadData.returnDate.split('T')[0] : '',
        returnLocation: loadData.returnLocation || '',
        // OTR arrays
        origins: loadData.origins || [{
          addressLine1: '', addressLine2: '', city: '', state: '', zip: '', weight: '', commodity: '', pickupDate: '', deliveryDate: ''
        }],
        destinations: loadData.destinations || [{
          addressLine1: '', addressLine2: '', city: '', state: '', zip: '', weight: '', commodity: '', deliveryDate: ''
        }],
      };
      
      setFormData(formDataToSet);
      setSelectedLoad(loadData);
      setAddModalOpen(true);
      
      // Fetch customers when modal opens
      await fetchCustomers();
    } catch (err) {
      console.error('Error loading load for edit:', err);
      setError(err.message || 'Failed to load load details');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleViewLoad = useCallback(async (load) => {
    try {
      setViewLoading(true);
      setSelectedLoad(load);
      // Fetch full load details from API
      const loadDetails = await fetchLoadById(load.loadId || load._id);
      
      if (loadDetails) {
        setViewLoadData(loadDetails.load || loadDetails);
      } else {
        setViewLoadData(load);
      }
      setViewModalOpen(true);
    } catch (err) {
      console.error('Error loading load for view:', err);
      setError(err.message || 'Failed to load load details');
      setViewLoadData(load); // Fallback to original load data
      setViewModalOpen(true);
      setTimeout(() => setError(null), 3000);
    } finally {
      setViewLoading(false);
    }
  }, []);

  const handleDeleteLoad = async (loadId) => {
    if (window.confirm('Are you sure you want to delete this load?')) {
      try {
        setLoading(true);
        await deleteLoad(loadId);
        
        // Refresh the load list
        await fetchAllLoads();
        setSuccess('Load deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err.message || 'Failed to delete load');
        setTimeout(() => setError(null), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveLoad = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    try {
      setLoading(true);
      
      if (selectedLoad && (selectedLoad.loadId || selectedLoad._id)) {
        // Update existing load with form data
        await updateLoad(selectedLoad.loadId || selectedLoad._id, formData);
        setSuccess('Load updated successfully');
      } else {
        // Add new load
        await addLoad(formData);
        setSuccess('Load added successfully');
      }
      
      // Refresh the load list
      await fetchAllLoads();
      setAddModalOpen(false);
      setSelectedLoad(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save load');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Filter loads based on search term - memoized for performance
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return loadsData;
    
    const searchLower = searchTerm.toLowerCase();
    return loadsData.filter(load =>
      load.loadType?.toLowerCase().includes(searchLower) ||
      load.origins?.[0]?.addressLine1?.toLowerCase().includes(searchLower) ||
      load.destinations?.[0]?.addressLine1?.toLowerCase().includes(searchLower) ||
      load.customerLoadDetails?.customerName?.toLowerCase().includes(searchLower) ||
      load.origins?.[0]?.commodity?.toLowerCase().includes(searchLower) ||
      load.containerNo?.toLowerCase().includes(searchLower) ||
      load.poNumber?.toLowerCase().includes(searchLower)
    );
  }, [loadsData, searchTerm]);

  const handleFormInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Charges Calculator Modal Handlers
  const handleOpenChargesCalculator = () => {
    setChargesCalculatorModalOpen(true);
  };

  const handleCloseChargesCalculator = () => {
    setChargesCalculatorModalOpen(false);
  };

  const handleAddCharge = () => {
    setCharges([...charges, { id: Date.now(), name: '', quantity: '', amount: '', total: 0 }]);
  };

  const handleDeleteCharge = (id) => {
    setCharges(charges.filter(charge => charge.id !== id));
  };

  const handleChargeChange = (id, field, value) => {
    setCharges(charges.map(charge => {
      if (charge.id === id) {
        const updatedCharge = { ...charge, [field]: value };
        if (field === 'quantity' || field === 'amount') {
          const qty = parseFloat(updatedCharge.quantity) || 0;
          const amt = parseFloat(updatedCharge.amount) || 0;
          updatedCharge.total = (qty * amt).toFixed(2);
        }
        return updatedCharge;
      }
      return charge;
    }));
  };

  const handleApplyCharges = () => {
    const totalCharges = charges.reduce((sum, charge) => {
      return sum + (parseFloat(charge.total) || 0);
    }, 0);

    // Update form with new other charges and recalculate total
    // Store charges array for API submission with quantity
    const updatedForm = { 
      ...formData, 
      other: totalCharges.toFixed(2),
      chargesArray: charges
        .filter(charge => charge && charge.name && (charge.total || charge.amount))
        .map(charge => ({
          name: charge.name || 'Other Charge',
          amount: parseFloat(charge.amount) || 0,
          quantity: parseFloat(charge.quantity) || 1
        }))
    };

    // Recalculate Total Rate
    const lineHaul = parseFloat(updatedForm.lineHaul) || 0;
    const fscPercent = parseFloat(updatedForm.fsc) || 0;
    const otherCharges = parseFloat(totalCharges.toFixed(2)) || 0;

    // FSC is percentage of Line Haul: FSC Amount = Line Haul × (FSC / 100)
    const fscAmount = lineHaul * (fscPercent / 100);

    // Total Rate = Line Haul + FSC Amount + Other Charges
    const totalRate = lineHaul + fscAmount + otherCharges;
    updatedForm.total = totalRate.toFixed(2);
    updatedForm.rate = totalRate.toFixed(2); // Also update rate field

    setFormData(updatedForm);
    handleCloseChargesCalculator();
  };

  const loadTypes = [
    'OTR',
    'Local',
    'Regional',
    'Intermodal'
  ];

  if (loading && loadsData.length === 0) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading loads...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" fontWeight={700}>
            Add Load
          </Typography>
          <Chip
            label={`${loadsData.length} Load${loadsData.length !== 1 ? 's' : ''}`}
            color="primary"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search loads..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="primary" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                fontSize: '0.85rem',
                px: 1,
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddLoad}
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#0d47a1',
              },
            }}
          >
            Add Load
          </Button>
        </Stack>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
              <TableCell sx={{ fontWeight: 600, width: '120px' }}>Load Type</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '150px' }}>Pickup</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '150px' }}>Delivery</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '100px' }}>Weight</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '100px' }}>Rate</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '120px' }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '100px' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '150px' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData && filteredData.length > 0 ? (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((load) => (
                  <TableRow 
                    key={load._id} 
                    hover 
                    sx={{ 
                      transition: '0.3s', 
                      '&:hover': { backgroundColor: '#e3f2fd' }
                    }}
                  >
                    <TableCell sx={{ width: '120px', fontWeight: 600 }}>
                      {load.loadType}
                    </TableCell>
                    <TableCell sx={{ width: '150px' }}>
                      {load.origins?.[0]?.addressLine1 || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ width: '150px' }}>
                      {load.destinations?.[0]?.addressLine1 || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ width: '100px' }}>
                      {load.origins?.[0]?.weight || 'N/A'} lbs
                    </TableCell>
                    <TableCell sx={{ width: '100px' }}>
                      ${load.rate}
                    </TableCell>
                    <TableCell sx={{ width: '120px' }}>
                      {load.customerLoadDetails?.customerName || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ width: '100px' }}>
                      <Chip
                        label={load.status}
                        size="small"
                        color={load.status === 'Auto-Approved' ? 'success' : 'default'}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ width: '150px' }}>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewLoad(load)}
                          sx={{
                            fontSize: '0.75rem',
                            px: 1,
                            py: 0.5,
                            textTransform: 'none',
                            minWidth: 'auto'
                          }}
                        >
                          View
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => handleEditLoad(load)}
                          sx={{
                            fontSize: '0.75rem',
                            px: 1,
                            py: 0.5,
                            textTransform: 'none',
                            minWidth: 'auto'
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Delete />}
                          onClick={() => handleDeleteLoad(load._id)}
                          sx={{
                            fontSize: '0.75rem',
                            px: 1,
                            py: 0.5,
                            textTransform: 'none',
                            minWidth: 'auto',
                            color: 'error.main',
                            borderColor: 'error.main',
                            '&:hover': {
                              backgroundColor: 'error.main',
                              color: 'white'
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {loadsData.length === 0 ? 'No loads found. Add your first load!' : 'No loads match your search criteria'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredData ? filteredData.length : 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#fafafa'
          }}
        />
      </Paper>

      {/* Modern Add Load Modal */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            minHeight: '85vh',
            maxHeight: '95vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle className="border-b-0 bg-[#1976d2] flex items-center justify-between gap-3 py-4 px-6 relative rounded-t-lg" sx={{ backgroundColor: '#1976d2' }}>
          <Box className="flex items-center gap-3 flex-1">
            <Box className="bg-white rounded-lg w-12 h-12 flex items-center justify-center border-2 border-blue-300 shadow-sm">
              <LocalShipping className="text-xl text-blue-500" />
            </Box>
            <Box>
              <Typography variant="h5" className="font-bold text-white mb-0.5 text-xl">
                {selectedLoad ? 'Edit Load' : 'Create New Load'}
              </Typography>
              <Typography variant="body2" className="text-white text-sm opacity-95">
                {selectedLoad ? 'Update the load details below' : 'Fill in the details to create a new shipment'}
              </Typography>
            </Box>
          </Box>

          {/* Load Type Toggle and Close Button */}
          <Stack direction="row" spacing={1.5} className="items-center">
            {/* OTR Button */}
            <Button
              onClick={() => { setLoadType('OTR'); setFormData(prev => ({ ...prev, loadType: 'OTR' })); }}
              variant="contained"
              sx={{
                textTransform: 'none',
                ...(loadType === 'OTR' ? {
                  backgroundColor: '#ffffff',
                  color: '#1976d2',
                  border: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: '#f3f4f6',
                    boxShadow: 'none'
                  }
                } : {
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  borderColor: '#ffffff',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    boxShadow: 'none'
                  }
                }),
                borderRadius: 2,
                minWidth: 90,
                py: 1.5,
                px: 3,
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              OTR
            </Button>
            {/* DRAYAGE Button */}
            <Button
              onClick={() => { setLoadType('DRAYAGE'); setFormData(prev => ({ ...prev, loadType: 'DRAYAGE' })); }}
              variant="contained"
              sx={{
                textTransform: 'none',
                ...(loadType === 'DRAYAGE' ? {
                  backgroundColor: '#ffffff',
                  color: '#1976d2',
                  border: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: '#f3f4f6',
                    boxShadow: 'none'
                  }
                } : {
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  borderColor: '#ffffff',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    boxShadow: 'none'
                  }
                }),
                borderRadius: 2,
                minWidth: 110,
                py: 1.5,
                px: 3,
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              DRAYAGE
            </Button>
            {/* Close Button */}
            <IconButton
              onClick={() => {
                setAddModalOpen(false);
                setSelectedLoad(null);
              }}
              sx={{
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                },
                ml: 0.5
              }}
              size="small"
            >
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent className="p-0 bg-gray-100 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-gray-500" sx={{ p: 0, backgroundColor: '#f5f5f5', flex: 1, overflowY: 'auto' }}>
          <Box component="form" onSubmit={handleSaveLoad} sx={{ p: 3 }}>
            {/* Form Sections */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Customer Name Section */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Business sx={{ color: '#1976d2', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748', fontSize: '1.125rem' }}>
                    Customer Information
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl 
                      
                      sx={{
                        width: '280px',
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                          backgroundColor: '#fff',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          transition: 'border-color 0.2s ease',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#E2E8F0',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#4A90E2',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#4A90E2',
                        },
                        '& .MuiInputLabel-root': {
                          color: '#4A5568',
                          fontSize: '0.875rem',
                        },
                      }}
                    >
                      <InputLabel shrink>Customer Name *</InputLabel>
                      <Select
                        name="customerId"
                        value={formData.customerId || ''}
                        onChange={(e) => {
                          const selectedCustomer = customers.find(c => c.customerId === e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            customerId: e.target.value,
                            customerName: selectedCustomer?.companyInfo?.companyName || '',
                            customerPhone: selectedCustomer?.contactInfo?.mobile || '',
                            customerEmail: selectedCustomer?.contactInfo?.email || ''
                          }));
                        }}
                        label="Customer Name *"
                        disabled={customersLoading}
                        displayEmpty
                        renderValue={(selected) => {
                          if (!selected) {
                            return <span style={{ color: '#9ca3af' }}>Select Customer</span>;
                          }
                          const selectedCustomer = customers.find(c => c.customerId === selected);
                          return selectedCustomer?.companyInfo?.companyName || 'Unnamed Company';
                        }}
                        sx={{
                          '& .MuiSelect-select': {
                            paddingTop: '16.5px',
                            paddingBottom: '16.5px',
                          },
                        }}
                      >
                        <MenuItem value="" disabled>
                          <em>Select Customer</em>
                        </MenuItem>
                        {customersLoading ? (
                          <MenuItem disabled>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Loading customers...
                          </MenuItem>
                        ) : customers.length === 0 ? (
                          <MenuItem disabled>No customers found</MenuItem>
                        ) : (
                          customers.map((customer) => (
                            <MenuItem key={customer.customerId} value={customer.customerId}>
                              {customer.companyInfo?.companyName || 'Unnamed Company'}
                              {customer.companyInfo?.mcDotNo && ` (MC: ${customer.companyInfo.mcDotNo})`}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>

            {/* Customer ID removed as requested */}

              {/* OTR Origins and Destinations - Only for OTR */}
              {loadType === 'OTR' ? (
                <>
                  {/* 🟦 PICKUP SECTION */}
                  <Box
                    sx={{
                      backgroundColor: '#fff',
                      borderRadius: 3,
                      p: 3,
                      boxShadow: '0px 2px 6px rgba(0,0,0,0.08)',
                      border: '1px solid #E0E0E0',
                    }}
                  >
                    {/* Header */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#1976D2',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 3,
                        borderLeft: '4px solid #1976D2',
                        pl: 1.5,
                        letterSpacing: '0.3px',
                      }}
                    >
                      <LocationOn sx={{ fontSize: 22, color: '#1976D2' }} />
                      Pickup Locations
                    </Typography>

                    {formData.origins.map((origin, index) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          p: 3,
                          mb: 3,
                          border: '1px solid #E0E0E0',
                          borderRadius: 2,
                          backgroundColor: '#FAFAFA',
                        }}
                      >
                        {/* Header Row */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                            Pickup Location {index + 1}
                          </Typography>
                          {formData.origins.length > 1 && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Delete />}
                              onClick={() => setFormData(prev => ({ ...prev, origins: prev.origins.filter((_, i) => i !== index) }))}
                              sx={{
                                minWidth: 'auto',
                                px: 1,
                                py: 0.5,
                                fontSize: '0.75rem',
                              }}
                            >
                              Delete
                            </Button>
                          )}
                        </Box>

                        {/* Fields */}
                        <Grid container spacing={2.5}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Full Address *"
                              value={origin.addressLine1}
                              onChange={(e) => {
                                const arr = [...formData.origins];
                                arr[index].addressLine1 = e.target.value;
                                setFormData(prev => ({ ...prev, origins: arr }));
                              }}
                              fullWidth
                              placeholder="Enter full address"
                              InputLabelProps={{ shrink: true }}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#fff',
                                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
                                },
                                '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="City *"
                              value={origin.city}
                              onChange={(e) => {
                                const arr = [...formData.origins];
                                arr[index].city = e.target.value;
                                setFormData(prev => ({ ...prev, origins: arr }));
                              }}
                              fullWidth
                              placeholder="Enter city"
                              InputLabelProps={{ shrink: true }}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#fff',
                                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
                                },
                                '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="State *"
                              value={origin.state}
                              onChange={(e) => {
                                const arr = [...formData.origins];
                                arr[index].state = e.target.value;
                                setFormData(prev => ({ ...prev, origins: arr }));
                              }}
                              fullWidth
                              placeholder="Enter state"
                              InputLabelProps={{ shrink: true }}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#fff',
                                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
                                },
                                '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Zip Code *"
                              value={origin.zip}
                              onChange={(e) => {
                                const arr = [...formData.origins];
                                arr[index].zip = e.target.value;
                                setFormData(prev => ({ ...prev, origins: arr }));
                              }}
                              fullWidth
                              placeholder="Enter zip code"
                              InputLabelProps={{ shrink: true }}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#fff',
                                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
                                },
                                '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Weight (lbs) *"
                              value={origin.weight}
                              onChange={(e) => {
                                const arr = [...formData.origins];
                                arr[index].weight = e.target.value;
                                setFormData(prev => ({ ...prev, origins: arr }));
                              }}
                              fullWidth
                              placeholder="e.g., 26000"
                              InputLabelProps={{ shrink: true }}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#fff',
                                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
                                },
                                '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Commodity *"
                              value={origin.commodity}
                              onChange={(e) => {
                                const arr = [...formData.origins];
                                arr[index].commodity = e.target.value;
                                setFormData(prev => ({ ...prev, origins: arr }));
                              }}
                              fullWidth
                              placeholder="Enter commodity"
                              InputLabelProps={{ shrink: true }}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#fff',
                                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
                                },
                                '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              type="date"
                              label="Pickup Date *"
                              value={origin.pickupDate}
                              onChange={(e) => {
                                const arr = [...formData.origins];
                                arr[index].pickupDate = e.target.value;
                                setFormData(prev => ({ ...prev, origins: arr }));
                              }}
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              sx={{
                                width: '225px',
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#fff',
                                  width: '100%',
                                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
                                },
                                '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              type="date"
                              label="Delivery Date"
                              value={origin.deliveryDate || ''}
                              onChange={(e) => {
                                const arr = [...formData.origins];
                                arr[index].deliveryDate = e.target.value;
                                setFormData(prev => ({ ...prev, origins: arr }));
                              }}
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              sx={{
                                width: '225px',
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#fff',
                                  width: '100%',
                                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976D2' },
                                },
                                '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}

                    <Button
                      variant="outlined"
                      onClick={() => setFormData(prev => ({ ...prev, origins: [...prev.origins, { addressLine1: '', addressLine2: '', city: '', state: '', zip: '', weight: '', commodity: '', pickupDate: '', deliveryDate: '' }] }))}
                      sx={{ mt: 1 }}
                    >
                      Add Pickup Location
                    </Button>
                  </Box>

                  {/* 🟩 DELIVERY SECTION */}
                  <Box
                    sx={{
                      backgroundColor: '#fff',
                      borderRadius: 3,
                      p: 3,
                      mt: 4,
                      boxShadow: '0px 2px 6px rgba(0,0,0,0.08)',
                      border: '1px solid #E0E0E0',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#2E7D32',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 3,
                        borderLeft: '4px solid #2E7D32',
                        pl: 1.5,
                        letterSpacing: '0.3px',
                      }}
                    >
                      <LocalShipping sx={{ fontSize: 22, color: '#2E7D32' }} />
                      Delivery Locations
                    </Typography>

                    {formData.destinations.map((destination, index) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          p: 3,
                          mb: 3,
                          border: '1px solid #E0E0E0',
                          borderRadius: 2,
                          backgroundColor: '#FAFAFA',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                            Delivery Location {index + 1}
                          </Typography>
                          {formData.destinations.length > 1 && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Delete />}
                              onClick={() => setFormData(prev => ({ ...prev, destinations: prev.destinations.filter((_, i) => i !== index) }))}
                              sx={{
                                minWidth: 'auto',
                                px: 1,
                                py: 0.5,
                                fontSize: '0.75rem',
                              }}
                            >
                              Delete
                            </Button>
                          )}
                        </Box>

                        {/* Fields */}
                        <Grid container spacing={2.5}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Full Address *"
                              value={destination.addressLine1}
                              onChange={(e) => {
                                const arr = [...formData.destinations];
                                arr[index].addressLine1 = e.target.value;
                                setFormData(prev => ({ ...prev, destinations: arr }));
                              }}
                              fullWidth
                              placeholder="Enter full address"
                              InputLabelProps={{ shrink: true }}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#fff',
                                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32' },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32' },
                                },
                                '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="City *"
                              value={destination.city}
                              onChange={(e) => {
                                const arr = [...formData.destinations];
                                arr[index].city = e.target.value;
                                setFormData(prev => ({ ...prev, destinations: arr }));
                              }}
                              fullWidth
                              placeholder="Enter city"
                              InputLabelProps={{ shrink: true }}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#fff',
                                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32' },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32' },
                                },
                                '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="State *"
                              value={destination.state}
                              onChange={(e) => {
                                const arr = [...formData.destinations];
                                arr[index].state = e.target.value;
                                setFormData(prev => ({ ...prev, destinations: arr }));
                              }}
                              fullWidth
                              placeholder="Enter state"
                              InputLabelProps={{ shrink: true }}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#fff',
                                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32' },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32' },
                                },
                                '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Zip Code *"
                              value={destination.zip}
                              onChange={(e) => {
                                const arr = [...formData.destinations];
                                arr[index].zip = e.target.value;
                                setFormData(prev => ({ ...prev, destinations: arr }));
                              }}
                              fullWidth
                              placeholder="Enter zip code"
                              InputLabelProps={{ shrink: true }}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#fff',
                                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32' },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32' },
                                },
                                '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Weight (lbs) *"
                              value={destination.weight}
                              onChange={(e) => {
                                const arr = [...formData.destinations];
                                arr[index].weight = e.target.value;
                                setFormData(prev => ({ ...prev, destinations: arr }));
                              }}
                              fullWidth
                              placeholder="e.g., 26000"
                              InputLabelProps={{ shrink: true }}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#fff',
                                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32' },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32' },
                                },
                                '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Commodity *"
                              value={destination.commodity}
                              onChange={(e) => {
                                const arr = [...formData.destinations];
                                arr[index].commodity = e.target.value;
                                setFormData(prev => ({ ...prev, destinations: arr }));
                              }}
                              fullWidth
                              placeholder="Enter commodity"
                              InputLabelProps={{ shrink: true }}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#fff',
                                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32' },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32' },
                                },
                                '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              type="date"
                              label="Delivery Date *"
                              value={destination.deliveryDate}
                              onChange={(e) => {
                                const arr = [...formData.destinations];
                                arr[index].deliveryDate = e.target.value;
                                setFormData(prev => ({ ...prev, destinations: arr }));
                              }}
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              sx={{
                                width: '225px',
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#fff',
                                  width: '100%',
                                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32' },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32' },
                                },
                                '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}

                    <Button
                      variant="outlined"
                      onClick={() => setFormData(prev => ({ ...prev, destinations: [...prev.destinations, { addressLine1: '', addressLine2: '', city: '', state: '', zip: '', weight: '', commodity: '', deliveryDate: '' }] }))}
                      sx={{ mt: 1 }}
                    >
                      Add Delivery Location
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  {/* DRAYAGE Location Section */}
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#c8e6c9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LocationOn sx={{ color: '#2e7d32', fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748', fontSize: '1.125rem' }}>
                        Location Details
                      </Typography>
                    </Box>

                    {/* Pick Up Location Sub-section */}
                    <Box
                      sx={{
                        mb: 3,
                        p: 3,
                        borderRadius: 2,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: '#2D3748',
                          fontSize: '1rem',
                          mb: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          letterSpacing: '0.3px',
                        }}
                      >
                        <LocationOn sx={{ color: '#4A90E2', fontSize: 20 }} />
                        Pickup Location
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Pickup Full Address *"
                            name="fromAddress"
                            value={formData.fromAddress}
                            onChange={handleFormInputChange}
                            fullWidth
                            placeholder="Full Address"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              '& .MuiInputBase-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                transition: 'border-color 0.2s ease',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E2E8F0',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '& .MuiInputLabel-root': {
                                color: '#4A5568',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="City *"
                            name="fromCity"
                            value={formData.fromCity}
                            onChange={handleFormInputChange}
                            fullWidth
                            placeholder="City"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              '& .MuiInputBase-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E2E8F0',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '& .MuiInputLabel-root': {
                                color: '#4A5568',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="State *"
                            name="fromState"
                            value={formData.fromState}
                            onChange={handleFormInputChange}
                            fullWidth
                            placeholder="State"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              '& .MuiInputBase-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E2E8F0',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '& .MuiInputLabel-root': {
                                color: '#4A5568',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="ZIP Code *"
                            name="fromZip"
                            value={formData.fromZip}
                            onChange={handleFormInputChange}
                            fullWidth
                            placeholder="ZIP code"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              '& .MuiInputBase-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E2E8F0',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '& .MuiInputLabel-root': {
                                color: '#4A5568',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Loading/Unloading Location Sub-section */}
                    <Box
                      sx={{
                        mb: 3,
                        p: 3,
                        borderRadius: 2,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: '#2D3748',
                          fontSize: '1rem',
                          mb: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          letterSpacing: '0.3px',
                        }}
                      >
                        <LocalShipping sx={{ color: '#4A90E2', fontSize: 20 }} />
                        Loading / Unloading Location
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Full Address"
                            name="toAddress"
                            value={formData.toAddress}
                            onChange={handleFormInputChange}
                            fullWidth
                            placeholder="Full address"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              '& .MuiInputBase-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                transition: 'border-color 0.2s ease',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E2E8F0',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '& .MuiInputLabel-root': {
                                color: '#4A5568',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="City *"
                            name="toCity"
                            value={formData.toCity}
                            onChange={handleFormInputChange}
                            fullWidth
                            placeholder="City"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              '& .MuiInputBase-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E2E8F0',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '& .MuiInputLabel-root': {
                                color: '#4A5568',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="State *"
                            name="toState"
                            value={formData.toState}
                            onChange={handleFormInputChange}
                            fullWidth
                            placeholder="State"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              '& .MuiInputBase-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E2E8F0',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '& .MuiInputLabel-root': {
                                color: '#4A5568',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="ZIP Code *"
                            name="toZip"
                            value={formData.toZip}
                            onChange={handleFormInputChange}
                            fullWidth
                            placeholder="ZIP code"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              '& .MuiInputBase-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E2E8F0',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '& .MuiInputLabel-root': {
                                color: '#4A5568',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Return Location Sub-section */}
                    <Box
                      sx={{
                        mb: 3,
                        p: 3,
                        borderRadius: 2,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: '#2D3748',
                          fontSize: '1rem',
                          mb: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          letterSpacing: '0.3px',
                        }}
                      >
                        <Room sx={{ color: '#4A90E2', fontSize: 20 }} />
                        Return Location
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Full Address *"
                            name="returnAddress"
                            value={formData.returnAddress}
                            onChange={handleFormInputChange}
                            fullWidth
                            placeholder="Full Address"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              '& .MuiInputBase-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                transition: 'border-color 0.2s ease',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E2E8F0',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '& .MuiInputLabel-root': {
                                color: '#4A5568',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="City *"
                            name="returnCity"
                            value={formData.returnCity}
                            onChange={handleFormInputChange}
                            fullWidth
                            placeholder="City"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              '& .MuiInputBase-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E2E8F0',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '& .MuiInputLabel-root': {
                                color: '#4A5568',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="State *"
                            name="returnState"
                            value={formData.returnState}
                            onChange={handleFormInputChange}
                            fullWidth
                            placeholder="State"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              '& .MuiInputBase-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E2E8F0',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '& .MuiInputLabel-root': {
                                color: '#4A5568',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="ZIP Code *"
                            name="returnZip"
                            value={formData.returnZip}
                            onChange={handleFormInputChange}
                            fullWidth
                            placeholder="ZIP code"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              '& .MuiInputBase-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E2E8F0',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '& .MuiInputLabel-root': {
                                color: '#4A5568',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            type="date"
                            label="Return Date *"
                            name="returnDate"
                            value={formData.returnDate}
                            onChange={handleFormInputChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              width: '100%',
                              '& .MuiInputBase-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E2E8F0',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '& .MuiInputLabel-root': {
                                color: '#4A5568',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Schedule & Dates Sub-section for DRAYAGE */}
                    <Box
                      sx={{
                        mb: 3,
                        p: 3,
                        borderRadius: 2,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: '#2D3748',
                          fontSize: '1rem',
                          mb: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          letterSpacing: '0.3px',
                        }}
                      >
                        <CalendarToday sx={{ color: '#4A90E2', fontSize: 20 }} />
                        Schedule & Timeline
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            type="date"
                            label="Pickup Date *"
                            name="pickupDate"
                            value={formData.pickupDate}
                            onChange={handleFormInputChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              width: '100%',
                              '& .MuiInputBase-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E2E8F0',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '& .MuiInputLabel-root': {
                                color: '#4A5568',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <TextField
                            type="date"
                            label="Delivery Date *"
                            name="deliveryDate"
                            value={formData.deliveryDate}
                            onChange={handleFormInputChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              width: '100%',
                              '& .MuiInputBase-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E2E8F0',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '& .MuiInputLabel-root': {
                                color: '#4A5568',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <TextField
                            type="date"
                            label="Bid Deadline *"
                            name="bidDeadline"
                            value={formData.bidDeadline}
                            onChange={handleFormInputChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              width: '100%',
                              '& .MuiInputBase-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E2E8F0',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4A90E2',
                              },
                              '& .MuiInputLabel-root': {
                                color: '#4A5568',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Paper>
                </>
              )}

              {/* Load Details Section */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#f3e5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Business sx={{ color: '#7b1fa2', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748', fontSize: '1.125rem' }}>
                    Load Details
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {loadType === 'OTR' && (
                    <Box
                      sx={{
                        background: 'linear-gradient(to right, #F9FAFB, #FFFFFF)',
                        border: '1px solid #E2E8F0',
                        borderRadius: 3,
                        p: 3,
                        mt: 3,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        width: '100%',
                        maxWidth: '100%',
                        mx: 'auto',
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: '#2D3748',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 3,
                          borderLeft: '4px solid #4A90E2',
                          pl: 1.5,
                          letterSpacing: '0.3px',
                        }}
                      >
                        <LocalShipping sx={{ fontSize: 22, color: '#4A90E2' }} />
                        OTR Details
                      </Typography>

                      <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControl
                            sx={{
                              width: '230px',
                              '& .MuiInputBase-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                width: '100%',
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                              },
                              '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                            }}
                          >
                            <InputLabel>Vehicle Type *</InputLabel>
                            <Select
                              name="vehicleType"
                              value={formData.vehicleType}
                              onChange={handleFormInputChange}
                              label="Vehicle Type *"
                              sx={{
                                width: '100%',
                                height: '56px',
                                '& .MuiSelect-select': { paddingTop: '16.5px', paddingBottom: '16.5px' },
                              }}
                            >
                              {OTR_VEHICLE_TYPES.map((vehicleType) => (
                                <MenuItem key={vehicleType} value={vehicleType}>
                                  {vehicleType}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <TextField
                            label="Line Haul ($)"
                            name="lineHaul"
                            value={formData.lineHaul}
                            onChange={handleFormInputChange}
                            fullWidth
                            placeholder="e.g., 7500"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                              },
                              '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <TextField
                            label="FSC (%)"
                            name="fsc"
                            value={formData.fsc}
                            onChange={handleFormInputChange}
                            fullWidth
                            placeholder="e.g., 10"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                              },
                              '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <TextField
                            label="Other Charges ($)"
                            name="other"
                            value={formData.other}
                            onChange={handleFormInputChange}
                            fullWidth
                            placeholder="Click to add charges"
                            onClick={handleOpenChargesCalculator}
                            InputProps={{ readOnly: true }}
                            sx={{
                              cursor: 'pointer',
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                              },
                              '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <TextField
                            label="Total Rate ($)"
                            name="total"
                            value={(() => {
                              const lineHaul = parseFloat(formData.lineHaul) || 0;
                              const fscPercent = parseFloat(formData.fsc) || 0;
                              const otherCharges = parseFloat(formData.other) || 0;
                              const fscAmount = lineHaul * (fscPercent / 100);
                              const totalRate = lineHaul + fscAmount + otherCharges;
                              return totalRate.toFixed(2);
                            })()}
                            fullWidth
                            disabled
                            placeholder="00.00"
                            InputProps={{ readOnly: true }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                              },
                              '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {loadType === 'DRAYAGE' && (
                    <Box
                      sx={{
                        background: 'linear-gradient(to right, #F9FAFB, #FFFFFF)',
                        border: '1px solid #E2E8F0',
                        borderRadius: 3,
                        p: 3,
                        mt: 3,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        width: '100%',
                        maxWidth: '100%',
                        mx: 'auto',
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: '#2D3748',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 3,
                          borderLeft: '4px solid #4A90E2',
                          pl: 1.5,
                          letterSpacing: '0.3px',
                        }}
                      >
                        <LocalShipping sx={{ fontSize: 22, color: '#4A90E2' }} />
                        Drayage Details
                      </Typography>

                      <Grid container spacing={2.5} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControl
                            sx={{
                              width: '270px',
                              '& .MuiInputBase-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                width: '100%',
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                              },
                              '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                            }}
                          >
                            <InputLabel>Vehicle Type *</InputLabel>
                            <Select
                              name="vehicleType"
                              value={formData.vehicleType}
                              onChange={handleFormInputChange}
                              label="Vehicle Type *"
                              sx={{
                                width: '100%',
                                height: '56px',
                                '& .MuiSelect-select': { paddingTop: '16.5px', paddingBottom: '16.5px' },
                              }}
                            >
                              {DRAYAGE_VEHICLE_TYPES.map((vehicleType) => (
                                <MenuItem key={vehicleType} value={vehicleType}>
                                  {vehicleType}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            label="Weight (lbs) *"
                            name="weight"
                            value={formData.weight}
                            onChange={handleFormInputChange}
                            fullWidth
                            placeholder="e.g., 26000"
                            sx={{
                              width: '270px',
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                              },
                              '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            label="Commodity *"
                            name="commodity"
                            value={formData.commodity}
                            onChange={handleFormInputChange}
                            fullWidth
                            placeholder="e.g., Electronics, Furniture"
                            sx={{
                              width: '270px',
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                              },
                              '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                            }}
                          />
                        </Grid>
                      </Grid>

                      <Grid container spacing={2.5} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            label="Line Haul ($)"
                            name="lineHaul"
                            value={formData.lineHaul}
                            onChange={handleFormInputChange}
                            fullWidth
                            placeholder="e.g., 1600 or 1600.00"
                            sx={{
                              width: '270px',
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                              },
                              '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            label="FRC (%)"
                            name="fsc"
                            value={formData.fsc}
                            onChange={handleFormInputChange}
                            fullWidth
                            placeholder="e.g., 10 for 10%"
                            sx={{
                              width: '270px',
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                              },
                              '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            label="Other Charges ($)"
                            name="other"
                            value={formData.other}
                            onChange={handleFormInputChange}
                            fullWidth
                            placeholder="Click to add charges"
                            onClick={handleOpenChargesCalculator}
                            InputProps={{ readOnly: true }}
                            sx={{
                              cursor: 'pointer',
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                              },
                              '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                            }}
                          />
                        </Grid>
                      </Grid>

                      <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            label="Total Rate ($)"
                            name="total"
                            value={(() => {
                              const lineHaul = parseFloat(formData.lineHaul) || 0;
                              const fscPercent = parseFloat(formData.fsc) || 0;
                              const otherCharges = parseFloat(formData.other) || 0;
                              const fscAmount = lineHaul * (fscPercent / 100);
                              const totalRate = lineHaul + fscAmount + otherCharges;
                              return totalRate.toFixed(2);
                            })()}
                            fullWidth
                            disabled
                            placeholder="00.00"
                            InputProps={{ readOnly: true }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                              },
                              '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Grid>
              </Paper>

              {/* Bid Deadline for OTR */}
              {loadType === 'OTR' && (
                <Paper elevation={2} sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'white',
                  border: '1px solid #e0e0e0'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CalendarToday sx={{ color: '#2e7d32', fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                      Schedule & Timeline
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        type="date"
                        label="Bid Deadline *"
                        name="bidDeadline"
                        value={formData.bidDeadline}
                        onChange={handleFormInputChange}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          minWidth: '270px',
                          '& .MuiInputBase-root': {
                            borderRadius: 2,
                            backgroundColor: '#fff',
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                          },
                          '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* Additional Details Section */}
              <Box
                sx={{
                  background: 'linear-gradient(to right, #FFF9F3, #FFFFFF)',
                  border: '1px solid #FBD38D',
                  borderRadius: 3,
                  p: 3,
                  mt: 3,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  width: '100%',
                  maxWidth: '100%',
                  mx: 'auto',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#2D3748',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2.5,
                    borderLeft: '4px solid #F97316',
                    pl: 1.5,
                    letterSpacing: '0.3px',
                  }}
                >
                  <Description sx={{ fontSize: 22, color: '#F97316' }} />
                  Additional Details
                </Typography>

                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Container No."
                      name="containerNo"
                      value={formData.containerNo}
                      onChange={handleFormInputChange}
                      fullWidth
                      placeholder="Alphanumeric only"
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                          backgroundColor: '#fff',
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#F97316' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#F97316' },
                        },
                        '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="PO Number"
                      name="poNumber"
                      value={formData.poNumber}
                      onChange={handleFormInputChange}
                      fullWidth
                      placeholder="Alphanumeric only"
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                          backgroundColor: '#fff',
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#F97316' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#F97316' },
                        },
                        '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="BOL Number"
                      name="bolNumber"
                      value={formData.bolNumber}
                      onChange={handleFormInputChange}
                      fullWidth
                      placeholder="Alphanumeric only"
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                          backgroundColor: '#fff',
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#F97316' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#F97316' },
                        },
                        '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Shipment Number"
                      name="shipmentNo"
                      value={formData.shipmentNo}
                      onChange={handleFormInputChange}
                      fullWidth
                      placeholder="Optional reference"
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                          backgroundColor: '#fff',
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#F97316' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#F97316' },
                        },
                        '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            backgroundColor: '#f9fafb',
            borderTop: '1px solid #e5e7eb',
            justifyContent: 'flex-end',
            gap: 2,
          }}
        >
          <Button
            onClick={() => {
              setAddModalOpen(false);
              setSelectedLoad(null);
            }}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              color: '#4A90E2',
              borderColor: '#4A90E2',
              px: 4,
              py: 1,
              fontWeight: 500,
              fontSize: '0.95rem',
              '&:hover': {
                backgroundColor: '#f0f7ff',
                borderColor: '#357ABD',
                color: '#357ABD',
              },
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSaveLoad}
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              backgroundColor: '#2F5AA8',
              px: 4,
              py: 1,
              fontWeight: 600,
              fontSize: '0.95rem',
              '&:hover': {
                backgroundColor: '#244A8F',
              },
            }}
          >
            {loading 
              ? (selectedLoad ? 'Updating...' : 'Creating...') 
              : (selectedLoad ? 'Update Load' : 'Create Load')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Load Dialog */}
      <Dialog 
        open={viewModalOpen} 
        onClose={() => {
          setViewModalOpen(false);
          setViewLoadData(null);
        }} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(to right, #1976d2, #1565c0)',
          color: '#fff',
          py: 3,
          px: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LocalShipping sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
                Load Details
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
                Complete load information
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => {
              setViewModalOpen(false);
              setViewLoadData(null);
            }}
            sx={{ color: '#fff' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, backgroundColor: '#f5f5f5' }}>
          {viewLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : viewLoadData ? (
            <Box sx={{ p: 3 }}>
              {/* Customer Information Section */}
              <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Business sx={{ color: '#1976d2', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                    Customer Information
                  </Typography>
                </Box>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: '1px solid #e0e0e0' }}>Customer Name</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{viewLoadData.customerLoadDetails?.customerName || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Email</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{viewLoadData.customerLoadDetails?.customerEmail || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Phone</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{viewLoadData.customerLoadDetails?.customerPhone || 'N/A'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>

              {/* Load Details Section */}
              <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <LocalShipping sx={{ color: '#1976d2', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                    Load Details
                  </Typography>
                </Box>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: '1px solid #e0e0e0' }}>Load Type</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                        <Chip label={viewLoadData.loadType || 'N/A'} color="primary" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Vehicle Type</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{viewLoadData.vehicleType || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Status</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                        <Chip 
                          label={viewLoadData.status || 'N/A'} 
                          color={viewLoadData.status === 'active' ? 'success' : 'default'} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                    {viewLoadData.weight && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Weight</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{viewLoadData.weight} lbs</TableCell>
                      </TableRow>
                    )}
                    {viewLoadData.commodity && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Commodity</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{viewLoadData.commodity}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>

              {/* Location Details Section */}
              {viewLoadData.loadType === 'DRAYAGE' ? (
                <>
                  {/* DRAYAGE Pickup Location */}
                  {viewLoadData.origins && viewLoadData.origins.length > 0 && (
                    <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <LocationOn sx={{ color: '#1976d2', fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                          Pickup Location
                        </Typography>
                      </Box>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: '1px solid #e0e0e0' }}>Address</TableCell>
                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{viewLoadData.origins[0]?.addressLine1 || viewLoadData.fromAddress || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>City</TableCell>
                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{viewLoadData.origins[0]?.city || viewLoadData.fromCity || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>State</TableCell>
                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{viewLoadData.origins[0]?.state || viewLoadData.fromState || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, borderBottom: 'none' }}>ZIP Code</TableCell>
                            <TableCell sx={{ borderBottom: 'none' }}>{viewLoadData.origins[0]?.zip || viewLoadData.fromZip || 'N/A'}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Paper>
                  )}

                  {/* DRAYAGE Delivery Location */}
                  {viewLoadData.destinations && viewLoadData.destinations.length > 0 && (
                    <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <LocationOn sx={{ color: '#1976d2', fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                          Delivery Location
                        </Typography>
                      </Box>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: '1px solid #e0e0e0' }}>Address</TableCell>
                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{viewLoadData.destinations[0]?.addressLine1 || viewLoadData.toAddress || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>City</TableCell>
                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{viewLoadData.destinations[0]?.city || viewLoadData.toCity || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>State</TableCell>
                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{viewLoadData.destinations[0]?.state || viewLoadData.toState || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, borderBottom: 'none' }}>ZIP Code</TableCell>
                            <TableCell sx={{ borderBottom: 'none' }}>{viewLoadData.destinations[0]?.zip || viewLoadData.toZip || 'N/A'}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Paper>
                  )}

                  {/* Return Location */}
                  {viewLoadData.returnAddress && (
                    <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Room sx={{ color: '#1976d2', fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                          Return Location
                        </Typography>
                      </Box>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: '1px solid #e0e0e0' }}>Address</TableCell>
                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{viewLoadData.returnAddress}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>City</TableCell>
                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{viewLoadData.returnCity || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>State</TableCell>
                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{viewLoadData.returnState || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, borderBottom: 'none' }}>ZIP Code</TableCell>
                            <TableCell sx={{ borderBottom: 'none' }}>{viewLoadData.returnZip || 'N/A'}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Paper>
                  )}
                </>
              ) : (
                <>
                  {/* OTR Pickup Locations */}
                  {viewLoadData.origins && viewLoadData.origins.length > 0 && (
                    <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <LocationOn sx={{ color: '#1976d2', fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                          Pickup Locations
                        </Typography>
                      </Box>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>State</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>ZIP</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Pickup Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {viewLoadData.origins.map((origin, index) => (
                            <TableRow key={index}>
                              <TableCell>{origin.addressLine1 || 'N/A'}</TableCell>
                              <TableCell>{origin.city || 'N/A'}</TableCell>
                              <TableCell>{origin.state || 'N/A'}</TableCell>
                              <TableCell>{origin.zip || 'N/A'}</TableCell>
                              <TableCell>{origin.pickupDate ? new Date(origin.pickupDate).toLocaleDateString() : 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Paper>
                  )}

                  {/* OTR Delivery Locations */}
                  {viewLoadData.destinations && viewLoadData.destinations.length > 0 && (
                    <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <LocationOn sx={{ color: '#1976d2', fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                          Delivery Locations
                        </Typography>
                      </Box>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>State</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>ZIP</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Delivery Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {viewLoadData.destinations.map((destination, index) => (
                            <TableRow key={index}>
                              <TableCell>{destination.addressLine1 || 'N/A'}</TableCell>
                              <TableCell>{destination.city || 'N/A'}</TableCell>
                              <TableCell>{destination.state || 'N/A'}</TableCell>
                              <TableCell>{destination.zip || 'N/A'}</TableCell>
                              <TableCell>{destination.deliveryDate ? new Date(destination.deliveryDate).toLocaleDateString() : 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Paper>
                  )}
                </>
              )}

              {/* Rate Details Section */}
              <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <AttachMoney sx={{ color: '#1976d2', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                    Rate Details
                  </Typography>
                </Box>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: '1px solid #e0e0e0' }}>Rate Type</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{viewLoadData.rateType || 'N/A'}</TableCell>
                    </TableRow>
                    {viewLoadData.rateDetails?.lineHaul && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Line Haul</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>${viewLoadData.rateDetails.lineHaul}</TableCell>
                      </TableRow>
                    )}
                    {viewLoadData.rateDetails?.fsc && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>FSC (%)</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{viewLoadData.rateDetails.fsc}%</TableCell>
                      </TableRow>
                    )}
                    {viewLoadData.rateDetails?.other && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Other Charges</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                          ${Array.isArray(viewLoadData.rateDetails.other) 
                            ? viewLoadData.rateDetails.other.reduce((sum, charge) => sum + (parseFloat(charge.total) || 0), 0).toFixed(2)
                            : parseFloat(viewLoadData.rateDetails.other).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, borderBottom: 'none', fontSize: '1rem' }}>Total Rate</TableCell>
                      <TableCell sx={{ borderBottom: 'none', fontWeight: 700, fontSize: '1rem', color: '#1976d2' }}>
                        ${viewLoadData.rate || '0.00'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>

              {/* Additional Information Section */}
              <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Description sx={{ color: '#1976d2', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                    Additional Information
                  </Typography>
                </Box>
                <Table size="small">
                  <TableBody>
                    {viewLoadData.containerNo && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: '1px solid #e0e0e0' }}>Container Number</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{viewLoadData.containerNo}</TableCell>
                      </TableRow>
                    )}
                    {viewLoadData.poNumber && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>PO Number</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{viewLoadData.poNumber}</TableCell>
                      </TableRow>
                    )}
                    {viewLoadData.bolNumber && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>BOL Number</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{viewLoadData.bolNumber}</TableCell>
                      </TableRow>
                    )}
                    {viewLoadData.shipmentNo && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Shipment Number</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{viewLoadData.shipmentNo}</TableCell>
                      </TableRow>
                    )}
                    {viewLoadData.specialInstructions && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, borderBottom: 'none', verticalAlign: 'top' }}>Special Instructions</TableCell>
                        <TableCell sx={{ borderBottom: 'none' }}>{viewLoadData.specialInstructions}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">No load data available</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'flex-end', backgroundColor: '#f5f5f5' }}>
          <Button
            onClick={() => {
              setViewModalOpen(false);
              setViewLoadData(null);
            }}
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': {
                backgroundColor: '#0d47a1',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Charges Calculator Modal */}
      <Dialog
        open={chargesCalculatorModalOpen}
        onClose={handleCloseChargesCalculator}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            maxHeight: '90vh'
          }
        }}
      >
        {/* Header with Gradient */}
        <Box
          sx={{
            background: 'linear-gradient(to right, #4A90E2, #9B59B6)',
            p: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#fff'
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: '1.5rem',
              color: '#fff'
            }}
          >
            Charges Calculator
          </Typography>
          <IconButton
            onClick={handleCloseChargesCalculator}
            sx={{
              color: '#fff',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Main Content */}
        <DialogContent
          sx={{
            p: 3,
            backgroundColor: '#fff',
            minHeight: '400px'
          }}
        >
          {/* Table Header */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
              gap: 2,
              mb: 2,
              pb: 1.5,
              borderBottom: '2px solid #E2E8F0',
              fontWeight: 600,
              color: '#2D3748',
              fontSize: '0.875rem'
            }}
          >
            <Typography>Name *</Typography>
            <Typography># Quantity *</Typography>
            <Typography>$ Amount *</Typography>
            <Typography>$ Total</Typography>
            <Typography>Action</Typography>
          </Box>

          {/* Charges Rows */}
          {charges.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                color: '#94a3b8'
              }}
            >
              <Typography>No charges added yet. Click "Add New Charge" to get started.</Typography>
            </Box>
          ) : (
            charges.map((charge) => (
              <Box
                key={charge.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
                  gap: 2,
                  mb: 2,
                  alignItems: 'center'
                }}
              >
                <TextField
                  placeholder="Enter name"
                  value={charge.name}
                  onChange={(e) => handleChargeChange(charge.id, 'name', e.target.value)}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#fff',
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' }
                    }
                  }}
                />
                <TextField
                  type="number"
                  placeholder="Qty"
                  value={charge.quantity}
                  onChange={(e) => handleChargeChange(charge.id, 'quantity', e.target.value)}
                  size="small"
                  inputProps={{ min: 0, step: 1 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#fff',
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' }
                    }
                  }}
                />
                <TextField
                  type="number"
                  placeholder="Amount"
                  value={charge.amount}
                  onChange={(e) => handleChargeChange(charge.id, 'amount', e.target.value)}
                  size="small"
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#fff',
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' }
                    }
                  }}
                />
                <TextField
                  value={`$${parseFloat(charge.total || 0).toFixed(2)}`}
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#E6F7E6',
                      '& .MuiOutlinedInput-input': {
                        fontWeight: 600,
                        color: '#2d5016'
                      }
                    }
                  }}
                />
                <IconButton
                  onClick={() => handleDeleteCharge(charge.id)}
                  sx={{
                    color: '#ef4444',
                    '&:hover': {
                      backgroundColor: '#fee2e2'
                    }
                  }}
                >
                  <Delete />
                </IconButton>
              </Box>
            ))
          )}

          {/* Add New Charge Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              onClick={handleAddCharge}
              variant="contained"
              startIcon={<Add />}
              sx={{
                background: 'linear-gradient(to right, #4A90E2, #9B59B6)',
                color: '#fff',
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.9375rem',
                boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(to right, #357ABD, #8E44AD)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(74, 144, 226, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Add New Charge
            </Button>
          </Box>
        </DialogContent>

        {/* Footer */}
        <Box
          sx={{
            p: 3,
            backgroundColor: '#fff',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {/* Total Charges Display */}
          <Box
            sx={{
              backgroundColor: '#10b981',
              color: '#fff',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 700,
              fontSize: '1rem'
            }}
          >
            <Typography>
              Total Charges ${charges.reduce((sum, charge) => {
                return sum + (parseFloat(charge.total) || 0);
              }, 0).toFixed(2)}
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={handleCloseChargesCalculator}
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                borderColor: '#cbd5e1',
                color: '#334155',
                '&:hover': {
                  borderColor: '#94a3b8',
                  backgroundColor: '#f1f5f9'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyCharges}
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                backgroundColor: '#10b981',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#059669'
                }
              }}
            >
              Apply to Carrier Fees
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default AddLoad;