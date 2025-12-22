import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
  IconButton,
  Popover,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Card,
  CardContent,
  InputAdornment,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material';
import { 
  Receipt, 
  Download, 
  DateRange, 
  Clear, 
  Close, 
  Add, 
  Search,
  ArrowForward,
  ArrowDownward,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  LocalShipping
} from '@mui/icons-material';
import { useThemeConfig } from '../../context/ThemeContext';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, isWithinInterval, startOfDay, endOfDay, differenceInDays } from 'date-fns';
import { jsPDF } from 'jspdf';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import SearchNavigationFeedback from '../../components/SearchNavigationFeedback';
import { BASE_API_URL } from '../../apiConfig';

// API service function to fetch VERIFIED loads
const fetchVerifiedLoads = async (shipperId) => {
  try {
    let url = `${BASE_API_URL}/api/v1/accountant/shipper/all-verified-loads?shipperId=${shipperId}`;
    
    // Get token from various possible storage locations
    const token = sessionStorage.getItem('token') || 
                  localStorage.getItem('token') ||
                  sessionStorage.getItem('authToken') ||
                  localStorage.getItem('authToken') ||
                  sessionStorage.getItem('accessToken') ||
                  localStorage.getItem('accessToken');
    
    console.log('Token found:', token ? 'Yes' : 'No');
    console.log('Available storage keys:', {
      sessionStorage: Object.keys(sessionStorage),
      localStorage: Object.keys(localStorage)
    });
    console.log('Making API request to:', url);
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found. API call may fail.');
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });
    
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API Response data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching verified loads:', error);
    throw error;
  }
};

const Bills = () => {
  const location = useLocation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState([null, null]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [originalBillsData, setOriginalBillsData] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [generateBillOpen, setGenerateBillOpen] = useState(false);
  const [viewBillOpen, setViewBillOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiData, setApiData] = useState(null);

  const { themeConfig } = useThemeConfig();
  const brand = (themeConfig.header?.bg && themeConfig.header.bg !== 'white') ? themeConfig.header.bg : (themeConfig.tokens?.primary || '#1976d2');
  const headerTextColor = themeConfig.header?.text || '#ffffff';

  // Fetch API data on component mount
  useEffect(() => {
    const loadApiData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Resolve shipperId dynamically
        const shipperId =
          // from route state if passed
          location.state?.shipperId ||
          // from local/session storage common keys
          localStorage.getItem('shipperId') ||
          sessionStorage.getItem('shipperId') ||
          // from persisted user profile object
          (() => {
            try {
              const userRaw =
                localStorage.getItem('user') ||
                sessionStorage.getItem('user') ||
                localStorage.getItem('profile') ||
                sessionStorage.getItem('profile');
              if (!userRaw) return null;
              const user = JSON.parse(userRaw);
              return user?.shipperId || user?._id || user?.id || null;
            } catch {
              return null;
            }
          })();

        if (!shipperId) {
          throw new Error('Missing shipperId. Please login or pass shipperId via navigation.');
        }

        const response = await fetchVerifiedLoads(shipperId);
        setApiData(response);
        
        // Transform VERIFIED DOs to match existing table structure
        if (response.success && Array.isArray(response?.data?.verifiedDOs)) {
          const transformedData = response.data.verifiedDOs.map((doItem) => {
            const lr = doItem.loadReference || {};
            const cust = Array.isArray(doItem.customers) ? doItem.customers[0] : undefined;
            const amount = Number(cust?.calculatedTotal ?? cust?.totalAmount ?? lr?.rate ?? 0) || 0;

            // Origin/Destination best-effort extraction
            const origin = lr.origins?.[0] || lr.originPlace || (doItem.shipper?.pickUpLocations?.[0] ? {
              city: doItem.shipper.pickUpLocations[0].city,
              state: doItem.shipper.pickUpLocations[0].state,
              zipCode: doItem.shipper.pickUpLocations[0].zipCode,
              address: doItem.shipper.pickUpLocations[0].address,
            } : undefined);
            const destination = lr.destinations?.[0] || lr.destinationPlace || (doItem.shipper?.dropLocations?.[0] ? {
              city: doItem.shipper.dropLocations[0].city,
              state: doItem.shipper.dropLocations[0].state,
              zipCode: doItem.shipper.dropLocations[0].zipCode,
              address: doItem.shipper.dropLocations[0].address,
            } : undefined);

            // Dates
            const pickupDate = lr.pickupDate || doItem.shipper?.pickUpLocations?.[0]?.pickUpDate || doItem.date;
            const deliveryDate = lr.deliveryDate || doItem.shipper?.dropLocations?.[0]?.dropDate || doItem.date;

            return {
              billId: lr.shipmentNumber || doItem._id,
              chargeSetId: lr.poNumber || doItem._id,
              containerId: lr.containerNo || doItem.shipper?.containerNo || 'N/A',
              secondaryRef: lr.bolNumber || doItem.bols?.[0]?.bolNo || doItem._id,
              date: pickupDate ? format(new Date(pickupDate), 'yyyy-MM-dd') : 'N/A',
              dueDate: deliveryDate ? format(new Date(deliveryDate), 'yyyy-MM-dd') : 'N/A',
              amount,
              status: (doItem.paymentStatus?.status || 'Pending'),
              amount0_30: amount, // treat verified DOs as current
            amount30_60: 0,
            amount60_90: 0,
            loadData: {
                origin,
                destination,
                weight: lr.weight ?? doItem.shipper?.weight,
                commodity: lr.commodity ?? doItem.shipper?.commodity,
                vehicleType: lr.vehicleType ?? doItem.shipper?.containerType,
                carrier: doItem.carrier,
                shipper: doItem.shipper,
                acceptedBid: lr.acceptedBid,
                deliveryOrder: {
                  customers: doItem.customers
                },
                verificationStatus: doItem.assignmentStatus || doItem.accountantApproval?.status || doItem.salesApproval?.status
              }
            };
          });
          
          setOriginalBillsData(transformedData);
          setFilteredData(transformedData);
        }
      } catch (err) {
        let errorMessage = `API Error: ${err.message}`;
        
        // Check if it's an authentication error
        if (err.message.includes('Please login to access this resource')) {
          errorMessage = 'Authentication required. Please login to access load data.';
        }
        
        setError(errorMessage);
        console.error('Failed to load API data:', err);
        
        // No fallback data - show empty state
        setOriginalBillsData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    loadApiData();
  }, []);

  // Handle search result from universal search
  useEffect(() => {
    if (location.state?.selectedBill) {
      const bill = location.state.selectedBill;
      console.log('Navigated from search:', bill);
      
      // Filter to show only the searched bill
      if (originalBillsData.length > 0) {
        const filteredBill = originalBillsData.find(b => 
          b.billId === bill.id ||
          b.billNumber === bill.billNumber
        );
        
        if (filteredBill) {
          setFilteredData([filteredBill]);
          setIsFiltered(true);
        }
      }
    }
  }, [location.state, originalBillsData]);

  // Clear search filter
  const clearSearchFilter = () => {
    setFilteredData(originalBillsData);
    setIsFiltered(false);
  };
  const [billForm, setBillForm] = useState({
    billNumber: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    billDate: new Date(),
    dueDate: new Date(),
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: '',
  });


  // Calculate summary data from API data
  const calculateSummary = () => {
    const totalOutstanding = originalBillsData.reduce((sum, bill) => sum + bill.amount, 0);
    const amount0_30 = originalBillsData.reduce((sum, bill) => sum + bill.amount0_30, 0);
    const amount30_60 = originalBillsData.reduce((sum, bill) => sum + bill.amount30_60, 0);
    const amount60_90 = originalBillsData.reduce((sum, bill) => sum + bill.amount60_90, 0);
    
    return {
      totalOutstanding,
      amount0_30,
      amount30_60,
      amount60_90
    };
  };

  const summary = calculateSummary();

  // Chart data
  const chartData = [
    { name: '0-30 Days', amount: summary.amount0_30, color: '#1976d2' },
    { name: '30-60 Days', amount: summary.amount30_60, color: '#ff9800' },
    { name: '60-90 Days', amount: summary.amount60_90, color: '#f44336' }
  ];

  const pieData = [
    { name: '0-30 Days', value: summary.amount0_30, color: '#1976d2' },
    { name: '30-60 Days', value: summary.amount30_60, color: '#ff9800' },
    { name: '60-90 Days', value: summary.amount60_90, color: '#f44336' }
  ];

  // Filter data based on search and category
  const getFilteredData = () => {
    let filtered = originalBillsData;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(bill => 
        bill.billId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.containerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.secondaryRef.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(bill => {
        switch (selectedCategory) {
          case '0-30':
            return bill.amount0_30 > 0;
          case '30-60':
            return bill.amount30_60 > 0;
          case '60-90':
            return bill.amount60_90 > 0;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const displayData = getFilteredData();

  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      const filtered = originalBillsData.filter((bill) => {
        const billDate = new Date(bill.date);
        return isWithinInterval(billDate, {
          start: startOfDay(dateRange[0]),
          end: endOfDay(dateRange[1]),
        });
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(originalBillsData);
    }
    setPage(0);
  }, [dateRange, originalBillsData]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDateRangeClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDateRangeClose = () => {
    setAnchorEl(null);
  };

  const handleDateChange = (index) => (newValue) => {
    const newDateRange = [...dateRange];
    newDateRange[index] = newValue;
    setDateRange(newDateRange);
  };

  const clearDateRange = () => {
    setDateRange([null, null]);
    handleDateRangeClose();
  };

  const getDateRangeText = () => {
    if (dateRange[0] && dateRange[1]) {
      return `${format(dateRange[0], 'MMM dd, yyyy')} - ${format(dateRange[1], 'MMM dd, yyyy')}`;
    }
    return 'Select Date Range';
  };

  const exportToCSV = () => {
    const headers = ['Shipment #', 'PO Number', 'Container #', 'BOL Number', 'Pickup Location', 'Drop Location', 'Rate ($)'];
    const csvRows = [headers.join(',')];

    displayData.forEach((row) => {
      const values = [
        row.billId, 
        row.chargeSetId, 
        row.containerId, 
        row.secondaryRef,
        row.loadData?.origin?.city ? `${row.loadData.origin.city}, ${row.loadData.origin.state}` : 'N/A',
        row.loadData?.destination?.city ? `${row.loadData.destination.city}, ${row.loadData.destination.state}` : 'N/A',
        row.amount
      ];
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'loads_data.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Get the current filtered data
    const dataToPrint = displayData;
    
    // Create HTML content for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bills Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1976d2; text-align: center; margin-bottom: 30px; }
            .summary { margin-bottom: 30px; }
            .summary-card { 
              display: inline-block; 
              margin: 10px; 
              padding: 15px; 
              border: 1px solid #ddd; 
              border-radius: 8px; 
              text-align: center;
              min-width: 150px;
            }
            .summary-label { font-size: 12px; color: #666; margin-bottom: 5px; }
            .summary-value { font-size: 18px; font-weight: bold; color: #1976d2; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .amount-0-30 { color: #1976d2; }
            .amount-30-60 { color: #ff9800; }
            .amount-60-90 { color: #f44336; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Bills Report</h1>
          <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
          
          <div class="summary">
            <div class="summary-card">
              <div class="summary-label">Total Outstanding</div>
              <div class="summary-value">$${summary.totalOutstanding.toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">0-30 Days</div>
              <div class="summary-value">$${summary.amount0_30.toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">30-60 Days</div>
              <div class="summary-value">$${summary.amount30_60.toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">60-90 Days</div>
              <div class="summary-value">$${summary.amount60_90.toLocaleString()}</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Shipment #</th>
                <th>PO Number</th>
                <th>Container #</th>
                <th>BOL Number</th>
                <th>Pickup Location</th>
                <th>Drop Location</th>
                <th>Rate ($)</th>
                <th>Status</th>
                <th>Verification</th>
              </tr>
            </thead>
            <tbody>
              ${dataToPrint.map(bill => `
                <tr>
                  <td>${bill.billId}</td>
                  <td>${bill.chargeSetId}</td>
                  <td>${bill.containerId}</td>
                  <td>${bill.secondaryRef}</td>
                  <td>${bill.loadData?.origin?.city ? `${bill.loadData.origin.city}, ${bill.loadData.origin.state}` : 'N/A'}</td>
                  <td>${bill.loadData?.destination?.city ? `${bill.loadData.destination.city}, ${bill.loadData.destination.state}` : 'N/A'}</td>
                  <td class="amount-0-30">$${bill.amount.toLocaleString()}</td>
                  <td>${bill.status}</td>
                  <td>${bill.loadData?.verificationStatus || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Total Records: ${dataToPrint.length}
          </p>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const getStatusColor = (status) => {
    // Updated color scheme: pending=yellow, paid=green, overdue=red
    switch (status.toLowerCase()) {
      case 'pending':
        // return 'warning';
      case 'paid':
        return 'success';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const open = Boolean(anchorEl);

  const handleGenerateBillClick = () => {
    setGenerateBillOpen(true);
  };

  const handleGenerateBillClose = () => {
    setGenerateBillOpen(false);
    // Reset form
    setBillForm({
      billNumber: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      billDate: new Date(),
      dueDate: new Date(),
      items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      subtotal: 0,
      tax: 0,
      total: 0,
      notes: '',
    });
  };

  const handleFormChange = (field, value) => {
    setBillForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...billForm.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    
    // Calculate amount for this item
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    
    // Calculate subtotal
    const subtotal = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const tax = (subtotal * billForm.tax) / 100;
    const total = subtotal + tax;
    
    setBillForm(prev => ({
      ...prev,
      items: newItems,
      subtotal,
      total
    }));
  };

  const addItem = () => {
    setBillForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (billForm.items.length > 1) {
      const newItems = billForm.items.filter((_, i) => i !== index);
      const subtotal = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      const tax = (subtotal * billForm.tax) / 100;
      const total = subtotal + tax;
      
      setBillForm(prev => ({
        ...prev,
        items: newItems,
        subtotal,
        total
      }));
    }
  };

  const handleTaxChange = (value) => {
    const tax = parseFloat(value) || 0;
    const total = billForm.subtotal + (billForm.subtotal * tax / 100);
    setBillForm(prev => ({
      ...prev,
      tax,
      total
    }));
  };

  const handleSubmitBill = () => {
    // Here you would typically send the bill data to your backend
    console.log('Generating bill:', billForm);
    
    // Add the new bill to the billing data
    const newBill = {
      billId: billForm.billNumber || `INV-${Date.now()}`,
      date: format(billForm.billDate, 'yyyy-MM-dd'),
      amount: billForm.total,
      status: 'Pending'
    };
    
    // In a real app, you'd update the state properly
    // For now, just close the modal
    handleGenerateBillClose();
    
    // You could show a success message here
    alert('Bill generated successfully!');
  };

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setViewBillOpen(true);
  };

  const handleViewBillClose = () => {
    setViewBillOpen(false);
    setSelectedBill(null);
  };

  // Note: View modal uses the already-fetched apiData.data.verifiedDOs; no extra API call.

  const handleDownloadPDF = (bill) => {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set font
    doc.setFont('helvetica');
    
    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL DETAILS', 105, 20, { align: 'center' });
    
    // Add generation date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
    
    // Add bill information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill Information:', 20, 50);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Bill ID: ${bill.billId}`, 20, 60);
    doc.text(`Date: ${bill.date}`, 20, 70);
    doc.text(`Amount: $${bill.amount.toLocaleString()}`, 20, 80);
    doc.text(`Status: ${bill.status}`, 20, 90);
    
    // Add description
    doc.setFont('helvetica', 'bold');
    doc.text('Description:', 20, 110);
    
    doc.setFont('helvetica', 'normal');
    const description = `This is a detailed view of bill ${bill.billId}. The bill was generated on ${bill.date} and is currently in ${bill.status.toLowerCase()} status.`;
    doc.text(description, 20, 120);
    
    // Save the PDF
    doc.save(`bill_${bill.billId}.pdf`);
  };

  const generateInvoicePDF = (order) => {
    try {
      const printWindow = window.open('', '_blank');

      // Find the matching DO from API data to get complete information
      const matchedLoad = (Array.isArray(apiData?.data?.verifiedDOs) ? apiData.data.verifiedDOs : []).find((doItem) => {
        const lr = doItem.loadReference || {};
        return lr.shipmentNumber === order.billId || doItem._id === order.billId;
      });
      
      // Debug logging
      console.log('Order billId:', order.billId);
      console.log('Matched load:', matchedLoad);
      console.log('API data verifiedDOs:', apiData?.data?.verifiedDOs);
      
      // ---- Bill To + Address (from shippers list if available) ----
      const deliveryOrder = order?.loadData?.deliveryOrder || { customers: matchedLoad?.customers || [] };
      const cust = deliveryOrder?.customers?.[0] || {};
      const companyName = (cust.billTo || matchedLoad?.shipper?.name || '').trim();
      
      const billAddr = [
        matchedLoad?.shipper?.address,
        matchedLoad?.shipper?.city,
        matchedLoad?.shipper?.state,
        matchedLoad?.shipper?.zipCode,
      ].filter(Boolean).join(', ');
      const billToDisplay = [companyName || 'N/A', billAddr].filter(Boolean).join('<br>');
      const workOrderNo = cust.workOrderNo || 'N/A';
      const invoiceNo = order.billId || cust.loadNo || 'N/A';
      const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

      // ---- ONLY customer rates ----
      const LH = Number(cust.lineHaul) || 0;
      const FSC = Number(cust.fsc) || 0;
      const OTH = Number(cust.other) || 0;
      const CUSTOMER_TOTAL = LH + FSC + OTH;

      // helpers
      const fmtDate = (d) => {
        if (!d) return 'N/A';
        try {
          const dt = new Date(d);
          if (Number.isNaN(dt.getTime())) return 'Invalid Date';
          // Sirf date; UTC use kiya to avoid timezone issues
          return dt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'UTC'
          });
        } catch (error) {
          console.error('Error formatting date:', error, d);
          return 'Invalid Date';
        }
      };

      const fullAddr = (loc) =>
        [loc?.address, loc?.city, loc?.state, loc?.zipCode].filter(Boolean).join(', ') || 'N/A';

      // Create pickup and drop location data from the matched DO
      const lr = matchedLoad?.loadReference || {};
      const origin = lr.origins?.[0] || lr.originPlace || matchedLoad?.shipper?.pickUpLocations?.[0];
      const destination = lr.destinations?.[0] || lr.destinationPlace || matchedLoad?.shipper?.dropLocations?.[0];

      const pickRows = matchedLoad && origin ? [{
        name: origin?.city || origin?.name || 'Pickup Location',
        address: origin?.address,
        city: origin?.city,
        state: origin?.state,
        zipCode: origin?.zip || origin?.zipCode
      }] : [];
      
      const dropRows = matchedLoad && destination ? [{
        name: destination?.city || destination?.name || 'Drop Location',
        address: destination?.address,
        city: destination?.city,
        state: destination?.state,
        zipCode: destination?.zip || destination?.zipCode
      }] : [];
      
      // Debug logging for locations
      console.log('Pick rows:', pickRows);
      console.log('Drop rows:', dropRows);
      console.log('Customer data:', cust);

      // Gather all images for PDF
      const lrImgs = lr?.dropLocationImages || {};
      const allPickupImages = [
        ...(Array.isArray(lr?.emptyTruckImages) ? lr.emptyTruckImages : []),
        ...(Array.isArray(lr?.loadedTruckImages) ? lr.loadedTruckImages : []),
        ...(Array.isArray(lr?.containerImages) ? lr.containerImages : []),
        ...(Array.isArray(lr?.sealImages) ? lr.sealImages : []),
        ...(Array.isArray(lr?.eirTickets) ? lr.eirTickets : []),
      ];
      const allDeliveryImages = [
        ...(Array.isArray(lrImgs?.podImages) ? lrImgs.podImages : []),
        ...(Array.isArray(lrImgs?.loadedTruckImages) ? lrImgs.loadedTruckImages : []),
        ...(Array.isArray(lrImgs?.dropLocationImages) ? lrImgs.dropLocationImages : []),
        ...(Array.isArray(lrImgs?.emptyTruckImages) ? lrImgs.emptyTruckImages : []),
      ];

      // Logo source - using a placeholder or default logo
      const logoSrc = '/images/logo_vpower.png';

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Delivery Order Invoice</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;line-height:1.4;color:#333;background:#fff;font-size:12px}
  .invoice{max-width:800px;margin:0 auto;background:#fff;padding:20px}
  .header{display:flex;gap:16px;align-items:flex-start;margin-bottom:16px;border-bottom:1px solid #333;padding-bottom:12px}
  .logo{width:140px;height:90px;object-fit:contain;flex:0 0 auto}
  .header-right{flex:1 1 auto}
  .billto{border-collapse:collapse;width:65%;font-size:12px;margin-left:auto}
  .billto th,.billto td{border:1px solid #ddd;padding:6px;text-align:left;vertical-align:top}
  .billto th{background:#f5f5f5;font-weight:bold;width:35%}
  .section{margin-top:14px}
  .tbl{width:100%;border-collapse:collapse;margin-top:8px}
  .tbl th,.tbl td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}
  .amount{text-align:right;font-weight:bold}
  .total-row{background:#fff;color:#000;font-weight:bold;font-size:14px}
  .total-row td{border-top:2px solid #000;padding:12px}
  @media print{@page{margin:0;size:A4}}
</style>
</head>
<body>
  <div class="invoice">
    <!-- HEADER: logo (left) + Bill To table (right) -->
    <div class="header">
      <img src="${logoSrc}" alt="Company Logo" class="logo">
      <div class="header-right">
        <table class="billto">
          <tr><th>Bill To</th><td>${billToDisplay}</td></tr>
          <tr><th>W/O (Ref)</th><td>${workOrderNo}</td></tr>
          <tr><th>Invoice Date</th><td>${todayStr}</td></tr>
          <tr><th>Invoice No</th><td>${invoiceNo}</td></tr>
        </table>
      </div>
    </div>

    <!-- Pick Up Locations -->
    <div class="section">
      <table class="tbl">
        <thead>
          <tr>
            <th>Pick Up Location</th>
            <th>Address</th>
            <th>Weight (lbs)</th>
            <th>Container No</th>
            <th>Container Type</th>
            <th>Qty</th>
            <th>Pickup Date</th>
          </tr>
        </thead>
        <tbody>
          ${pickRows.map(l => {
        const weight = lr?.weight || matchedLoad?.shipper?.weight || 'N/A';
        const contNo = lr?.containerNo || matchedLoad?.shipper?.containerNo || order?.containerId || 'N/A';
        const contTp = lr?.vehicleType || matchedLoad?.shipper?.containerType || order?.loadData?.vehicleType || 'N/A';
        const qty = 1;
        const dateSrc = lr?.pickupDate || matchedLoad?.shipper?.pickUpLocations?.[0]?.pickUpDate || order?.date;
        return `
              <tr>
                <td>${l?.name || 'N/A'}</td>
                <td>${fullAddr(l)}</td>
                <td>${weight}</td>
                <td>${contNo}</td>
                <td>${contTp}</td>
                <td>${qty}</td>
                <td>${fmtDate(dateSrc)}</td>
              </tr>
            `;
      }).join('')}
        </tbody>
      </table>
    </div>

    <!-- Drop Locations -->
    <div class="section">
      <table class="tbl">
        <thead>
          <tr>
            <th>Drop Location</th>
            <th>Address</th>
            <th>Weight (lbs)</th>
            <th>Container No</th>
            <th>Container Type</th>
            <th>Qty</th>
            <th>Drop Date</th>
          </tr>
        </thead>
        <tbody>
          ${dropRows.map(l => {
        const weight = lr?.weight || matchedLoad?.shipper?.weight || 'N/A';
        const contNo = lr?.containerNo || matchedLoad?.shipper?.containerNo || order?.containerId || 'N/A';
        const contTp = lr?.vehicleType || matchedLoad?.shipper?.containerType || order?.loadData?.vehicleType || 'N/A';
        const qty = 1;
        const dateSrc = lr?.deliveryDate || matchedLoad?.shipper?.dropLocations?.[0]?.dropDate || order?.dueDate;
        return `
              <tr>
                <td>${l?.name || 'N/A'}</td>
                <td>${fullAddr(l)}</td>
                <td>${weight}</td>
                <td>${contNo}</td>
                <td>${contTp}</td>
                <td>${qty}</td>
                <td>${fmtDate(dateSrc)}</td>
              </tr>
            `;
      }).join('')}
        </tbody>
      </table>
    </div>

    <!-- Charges: ONLY customer information rates -->
    <div class="section">
      <table class="tbl">
        <thead><tr><th>Description</th><th>Amount</th></tr></thead>
        <tbody>
          ${LH > 0 ? `<tr><td>Line Haul</td><td class="amount">$${LH.toLocaleString()}</td></tr>` : ''}
          ${FSC > 0 ? `<tr><td>FSC</td><td class="amount">$${FSC.toLocaleString()}</td></tr>` : ''}
          ${OTH > 0 && !isNaN(OTH) ? `<tr><td>Other</td><td class="amount">$${OTH.toLocaleString()}</td></tr>` : ''}
          <tr class="total-row">
            <td><strong>TOTAL</strong></td>
            <td class="amount"><strong>$${CUSTOMER_TOTAL.toLocaleString()} USD</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">Thank you for your business!</div>
  </div>
  
  ${allPickupImages.map((imgUrl, idx) => `
    <div style="page-break-before: always; text-align: center; padding: 40px 20px;">
      <h2 style="margin-bottom: 20px; color: #1976d2;">Pickup Image ${idx + 1}</h2>
      <img src="${imgUrl}" alt="Pickup Image ${idx + 1}" style="max-width: 100%; max-height: 600px; object-fit: contain; border: 1px solid #ddd; border-radius: 8px;" />
    </div>
  `).join('')}
  
  ${allDeliveryImages.map((imgUrl, idx) => `
    <div style="page-break-before: always; text-align: center; padding: 40px 20px;">
      <h2 style="margin-bottom: 20px; color: #1976d2;">Delivery Image ${idx + 1}</h2>
      <img src="${imgUrl}" alt="Delivery Image ${idx + 1}" style="max-width: 100%; max-height: 600px; object-fit: contain; border: 1px solid #ddd; border-radius: 8px;" />
    </div>
  `).join('')}
</body>
</html>
    `;

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = function () {
        printWindow.print();
        printWindow.close();
      };
      
      // Show success message (you can replace alertify with your preferred notification system)
      if (typeof alertify !== 'undefined') {
        alertify.success('Invoice PDF generated successfully!');
      } else {
        alert('Invoice PDF generated successfully!');
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      if (typeof alertify !== 'undefined') {
        alertify.error('Failed to generate PDF. Please try again.');
      } else {
        alert('Failed to generate PDF. Please try again.');
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <SearchNavigationFeedback 
          searchResult={location.state?.selectedBill} 
          searchQuery={location.state?.searchQuery} 
        />
        
        {/* Bills Skeleton Loading Component */}
        {loading && (
          <Box sx={{ p: 3 }}>
            {/* Summary Cards Skeleton */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              mb: 3, 
              width: '100%',
              flexWrap: 'nowrap'
            }}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} sx={{ flex: 1 }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Skeleton variant="text" width={120} height={20} sx={{ mx: 'auto', mb: 1 }} />
                    <Skeleton variant="text" width={100} height={32} sx={{ mx: 'auto' }} />
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Header with Search and Action Buttons Skeleton */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3,
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 2, maxWidth: 400 }} />
              <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: 2 }} />
            </Box>

            {/* Results Count Skeleton */}
            <Skeleton variant="text" width={120} height={28} sx={{ mb: 2 }} />

            {/* Table Skeleton */}
            <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <TableCell key={index}>
                        <Skeleton variant="text" width={100} height={20} />
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton variant="text" width={100} /></TableCell>
                      <TableCell><Skeleton variant="text" width={120} /></TableCell>
                      <TableCell><Skeleton variant="text" width={100} /></TableCell>
                      <TableCell><Skeleton variant="text" width={100} /></TableCell>
                      <TableCell><Skeleton variant="text" width={80} /></TableCell>
                      <TableCell><Skeleton variant="text" width={80} /></TableCell>
                      <TableCell><Skeleton variant="text" width={100} /></TableCell>
                      <TableCell><Skeleton variant="rectangular" width={70} height={26} sx={{ borderRadius: 1 }} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Pagination Skeleton */}
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e0e0e0' }}>
                <Skeleton variant="text" width={200} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="text" width={100} />
                  <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
                </Box>
              </Box>
            </Paper>
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 3, 
          width: '100%',
          flexWrap: 'nowrap'
        }}>
          <Card 
            sx={{ 
              flex: 1,
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
            }}
            onClick={() => setSelectedCategory('all')}
          >
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  Total Outstanding
                </Typography>
                <ArrowForward sx={{ fontSize: 16, color: 'text.secondary' }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color="primary">
                ${summary.totalOutstanding.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
          
          <Card 
            sx={{ 
              flex: 1,
              cursor: 'pointer',
              transition: 'all 0.3s',
              backgroundColor: selectedCategory === '0-30' ? '#e3f2fd' : 'white',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
            }}
            onClick={() => setSelectedCategory('0-30')}
          >
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  0-30 Days
                </Typography>
                {selectedCategory === '0-30' ? 
                  <ArrowDownward sx={{ fontSize: 16, color: 'primary' }} /> :
                  <ArrowForward sx={{ fontSize: 16, color: 'text.secondary' }} />
                }
              </Box>
              <Typography variant="h5" fontWeight={700} color="primary">
                ${summary.amount0_30.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
          
          <Card 
            sx={{ 
              flex: 1,
              cursor: 'pointer',
              transition: 'all 0.3s',
              backgroundColor: selectedCategory === '30-60' ? '#fff3e0' : 'white',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
            }}
            onClick={() => setSelectedCategory('30-60')}
          >
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  30-60 Days
                </Typography>
                {selectedCategory === '30-60' ? 
                  <ArrowDownward sx={{ fontSize: 16, color: 'warning.main' }} /> :
                  <ArrowForward sx={{ fontSize: 16, color: 'text.secondary' }} />
                }
              </Box>
              <Typography variant="h5" fontWeight={700} color="warning.main">
                ${summary.amount30_60.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
          
          <Card 
            sx={{ 
              flex: 1,
              cursor: 'pointer',
              transition: 'all 0.3s',
              backgroundColor: selectedCategory === '60-90' ? '#ffebee' : 'white',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
            }}
            onClick={() => setSelectedCategory('60-90')}
          >
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  60-90 Days
                </Typography>
                {selectedCategory === '60-90' ? 
                  <ArrowDownward sx={{ fontSize: 16, color: 'error.main' }} /> :
                  <ArrowForward sx={{ fontSize: 16, color: 'text.secondary' }} />
                }
              </Box>
              <Typography variant="h5" fontWeight={700} color="error.main">
                ${summary.amount60_90.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Header with Search and Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          {/* Search Bar */}
          <Box sx={{ flexGrow: 1, minWidth: 300 }}>
            <TextField
              fullWidth
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                }
              }}
            />
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={exportToCSV}
              sx={{
                borderRadius: 2,
                fontSize: '0.875rem',
                px: 3,
                py: 1,
                fontWeight: 500,
                textTransform: 'none',
                color: '#1976d2',
                borderColor: '#1976d2',
                '&:hover': {
                  borderColor: '#0d47a1',
                  color: '#0d47a1',
                  backgroundColor: '#e3f2fd',
                },
              }}
            >
              Download CSV
            </Button>
            
            
          </Stack>
        </Box>

        {/* Results Count */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          {displayData.length} Results
        </Typography>

        {/* Empty State */}
        {!loading && !error && displayData.length === 0 && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            py: 8,
            textAlign: 'center'
          }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No load data available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please check your authentication or try refreshing the page
            </Typography>
          </Box>
        )}

        {/* Charts Section */}
        {displayData.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            mb: 3, 
            width: '100%',
            flexWrap: 'nowrap'
          }}>
          <Paper 
            elevation={3} 
            sx={{ 
              flex: 1,
              p: 3, 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid #e3f2fd',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                mr: 2,
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
              }} />
              <Typography variant="h6" fontWeight={700} sx={{ 
                color: '#1976d2',
                fontSize: '1.1rem'
              }}>
                Outstanding Amount by Category
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="barGradient0" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1976d2" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#42a5f5" stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff9800" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#ffb74d" stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f44336" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#ef5350" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e0e0e0" 
                  strokeOpacity={0.6}
                />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickMargin={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(10px)',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                  labelStyle={{ color: '#1976d2', fontWeight: '600' }}
                />
                <Bar 
                  dataKey="amount" 
                  radius={[8, 8, 0, 0]}
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#barGradient${index})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
          
          <Paper 
            elevation={3} 
            sx={{ 
              flex: 1,
              p: 3, 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid #e3f2fd',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                mr: 2,
                boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)'
              }} />
              <Typography variant="h6" fontWeight={700} sx={{ 
                color: '#ff9800',
                fontSize: '1.1rem'
              }}>
                Distribution Overview
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <defs>
                  <linearGradient id="pieGradient0" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1976d2" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#42a5f5" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="pieGradient1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ff9800" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#ffb74d" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="pieGradient2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f44336" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#ef5350" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => {
                    if (percent < 0.05) return ''; // Hide labels for very small slices
                    return `${name}\n${(percent * 100).toFixed(1)}%`;
                  }}
                  outerRadius={100}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-out"
                  stroke="#ffffff"
                  strokeWidth={3}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#pieGradient${index})`}
                      stroke="#ffffff"
                      strokeWidth={3}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(10px)',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                  labelStyle={{ color: '#1976d2', fontWeight: '600' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={60}
                  iconType="circle"
                  layout="horizontal"
                  wrapperStyle={{
                    paddingTop: '20px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                  formatter={(value) => value}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
        )}

        {/* Data Table */}
        {displayData.length > 0 && (
          <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', backgroundColor: ((themeConfig.table?.bgImage || themeConfig.content?.bgImage) ? 'transparent' : (themeConfig.table?.bg || '#fff')), position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>
            {themeConfig.table?.bgImage && (
              <Box sx={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${themeConfig.table.bgImage})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                opacity: Number(themeConfig.table?.bgImageOpacity ?? 0),
                pointerEvents: 'none',
                zIndex: 0,
              }} />
            )}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Table>
            <TableHead>
            <TableRow sx={{ backgroundColor: (themeConfig.table?.headerBg || '#f0f4f8') }}>
                <TableCell sx={{ fontWeight: 600, color: (themeConfig.table?.headerText || themeConfig.table?.text || '#333333') }}>Shipment #</TableCell>
                <TableCell sx={{ fontWeight: 600, color: (themeConfig.table?.headerText || themeConfig.table?.text || '#333333') }}>PO Number</TableCell>
                <TableCell sx={{ fontWeight: 600, color: (themeConfig.table?.headerText || themeConfig.table?.text || '#333333') }}>Container #</TableCell>
                <TableCell sx={{ fontWeight: 600, color: (themeConfig.table?.headerText || themeConfig.table?.text || '#333333') }}>BOL Number</TableCell>
                <TableCell sx={{ fontWeight: 600, color: (themeConfig.table?.headerText || themeConfig.table?.text || '#333333') }}>Pickup Location</TableCell>
                <TableCell sx={{ fontWeight: 600, color: (themeConfig.table?.headerText || themeConfig.table?.text || '#333333') }}>Drop Location</TableCell>
                <TableCell sx={{ fontWeight: 600, color: (themeConfig.table?.headerText || themeConfig.table?.text || '#333333') }}>Rate ($)</TableCell>
                <TableCell sx={{ fontWeight: 600, color: (themeConfig.table?.headerText || themeConfig.table?.text || '#333333') }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((bill, i) => {
                  const isSearchedItem = isFiltered && location.state?.selectedBill && 
                    (bill.billId === location.state.selectedBill.id ||
                     bill.billId === location.state.selectedBill.billNumber);
                  
                  return (
                    <TableRow
                      key={i}
                      hover
                      sx={{ 
                        transition: '0.3s', 
                        '&:hover': { backgroundColor: '#e3f2fd' },
                        ...(isSearchedItem && {
                          backgroundColor: '#fff3e0',
                          borderLeft: '4px solid #ff9800',
                          '&:hover': { backgroundColor: '#ffe0b2' }
                        })
                      }}
                    >
                      <TableCell>{bill.billId}</TableCell>
                      <TableCell>{bill.chargeSetId}</TableCell>
                      <TableCell>{bill.containerId}</TableCell>
                      <TableCell>{bill.secondaryRef}</TableCell>
                      <TableCell>
                        {bill.loadData?.origin?.city ? 
                          `${bill.loadData.origin.city}, ${bill.loadData.origin.state}` : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        {bill.loadData?.destination?.city ? 
                          `${bill.loadData.destination.city}, ${bill.loadData.destination.state}` : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 600 }}>
                        ${bill.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button 
                            size="small" 
                            variant="text"
                            onClick={() => handleViewBill(bill)}
                          >
                            View
                          </Button>
                          <Button 
                            size="small" 
                            variant="text" 
                            startIcon={<Download />}
                            onClick={() => generateInvoicePDF(bill)}
                          >
                            Download
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
          </Box>
          <TablePagination
            component="div"
            count={displayData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 15, 20]}
          />
        </Paper>
        )}
      </Box>

             {/* Generate Bill Dialog */}
               <Dialog 
          open={generateBillOpen} 
          onClose={handleGenerateBillClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              maxHeight: '90vh',
              background: '#ffffff',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }
          }}
        >
                  <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 2,
            background: '#f5f5f5',
            color: '#333',
            borderRadius: '8px 8px 0 0'
          }}>
            <Typography variant="h5" fontWeight={600}>
              Generate New Bill
            </Typography>
            <IconButton 
              onClick={handleGenerateBillClose} 
              size="small"
              sx={{
                color: '#666',
                '&:hover': {
                  background: '#e0e0e0',
                }
              }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
        
        <Divider />
        
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
                         {/* Bill Information Section */}
             <Box>
                               <Typography variant="h6" fontWeight={600} mb={2} sx={{
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  📋 Bill Information
                </Typography>
                <Divider sx={{ 
                  mb: 3,
                  background: '#e0e0e0',
                  height: 1
                }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Bill Number"
                    value={billForm.billNumber}
                    onChange={(e) => handleFormChange('billNumber', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Bill Date"
                      value={billForm.billDate}
                      onChange={(value) => handleFormChange('billDate', value)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Due Date"
                      value={billForm.dueDate}
                      onChange={(value) => handleFormChange('dueDate', value)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Box>

                         {/* Customer Information Section */}
             <Box>
                               <Typography variant="h6" fontWeight={600} mb={2} sx={{
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  👤 Customer Information
                </Typography>
                <Divider sx={{ 
                  mb: 3,
                  background: '#e0e0e0',
                  height: 1
                }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Customer Name"
                    value={billForm.customerName}
                    onChange={(e) => handleFormChange('customerName', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Customer Email"
                    type="email"
                    value={billForm.customerEmail}
                    onChange={(e) => handleFormChange('customerEmail', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Customer Phone"
                    value={billForm.customerPhone}
                    onChange={(e) => handleFormChange('customerPhone', e.target.value)}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>

                         {/* Bill Items Section */}
             <Box>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                   <Typography variant="h6" fontWeight={600} sx={{
                    color: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    🛍️ Bill Items
                  </Typography>
                  <Button
                    startIcon={<Add />}
                    onClick={addItem}
                    size="small"
                    variant="contained"
                    sx={{
                      backgroundColor: '#1976d2',
                      textTransform: 'none',
                      borderRadius: 2,
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: '#1565c0',
                      },
                    }}
                  >
                    Add Item
                  </Button>
                </Box>
                <Divider sx={{ 
                  mb: 3,
                  background: '#e0e0e0',
                  height: 1
                }} />
              
              {billForm.items.map((item, index) => (
                                 <Box key={index} sx={{ 
                   display: 'flex', 
                   gap: 2, 
                   alignItems: 'flex-start',
                   p: 2,
                   border: '1px solid #e0e0e0',
                   borderRadius: 2,
                   background: '#fafafa',
                   mb: 2,
                   '&:hover': {
                     borderColor: '#ccc',
                     background: '#f5f5f5'
                   }
                 }}>
                                     <TextField
                     label="Product"
                     value={item.description}
                     onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                     size="small"
                     sx={{ flexGrow: 1 }}
                   />
                  <TextField
                    label="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    size="small"
                    sx={{ width: 100 }}
                  />
                  <TextField
                    label="Rate ($)"
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                    size="small"
                    sx={{ width: 120 }}
                  />
                  <TextField
                    label="Amount ($)"
                    value={item.amount.toFixed(2)}
                    size="small"
                    sx={{ width: 120 }}
                    InputProps={{ readOnly: true }}
                  />
                  {billForm.items.length > 1 && (
                    <IconButton 
                      onClick={() => removeItem(index)}
                      size="small"
                      color="error"
                    >
                      <Clear />
                    </IconButton>
                  )}
                </Box>
              ))}

              {/* Tax and Total Section */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Tax Rate (%)"
                    type="number"
                    value={billForm.tax}
                    onChange={(e) => handleTaxChange(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Tax Amount ($)"
                    value={((billForm.subtotal * billForm.tax) / 100).toFixed(2)}
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                                 <Grid item xs={12} md={4}>
                   <TextField
                     fullWidth
                     label="Total Amount ($)"
                     value={billForm.total.toFixed(2)}
                     size="small"
                     InputProps={{ readOnly: true }}
                                           sx={{
                        '& .MuiInputBase-input': {
                          fontWeight: 600,
                          color: '#1976d2',
                          fontSize: '1rem'
                        },
                        '& .MuiOutlinedInput-root': {
                          background: '#f8f9fa',
                          '&:hover': {
                            background: '#f0f0f0'
                          }
                        }
                      }}
                   />
                 </Grid>
              </Grid>
            </Box>

            {/* Notes Section */}
            <Box>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={billForm.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                size="small"
              />
            </Box>
          </Box>
        </DialogContent>
        
        <Divider />
        
                                   <DialogActions sx={{ p: 2, gap: 2, background: '#f5f5f5' }}>
            <Button 
              onClick={handleGenerateBillClose}
              variant="outlined"
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none',
                borderColor: '#ccc',
                color: '#666',
                fontWeight: 500,
                px: 3,
                py: 1,
                '&:hover': {
                  borderColor: '#999',
                  color: '#333',
                  background: '#f0f0f0'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitBill}
              variant="contained"
              startIcon={<Receipt />}
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none',
                backgroundColor: '#1976d2',
                fontWeight: 500,
                px: 3,
                py: 1,
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
              }}
            >
              Generate Bill
            </Button>
                     </DialogActions>
       </Dialog>

      {/* View Bill Dialog */}
      <Dialog 
        open={viewBillOpen} 
        onClose={handleViewBillClose}
        maxWidth="lg"
        fullWidth
         PaperProps={{
           sx: {
             borderRadius: 2,
             maxHeight: '75vh',
             background: '#ffffff',
             boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
             display: 'flex',
             flexDirection: 'column',
           }
         }}
       >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2,
          pt: 2,
          px: 3,
          background: brand,
          color: headerTextColor,
          borderRadius: '8px 8px 0 0',
          minHeight: 64
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LocalShipping sx={{ fontSize: 28, color: headerTextColor }} />
            <Typography variant="h5" fontWeight={600} color={headerTextColor}>
              Consignment Details
            </Typography>
          </Box>
          <IconButton 
            onClick={handleViewBillClose} 
            size="small"
            sx={{
              color: headerTextColor,
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
       
       <Divider />
       
       <DialogContent sx={{ pt: 2, overflowY: 'auto', flex: 1 }}>
         {selectedBill && (
           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {(() => {
              const doData = (Array.isArray(apiData?.data?.verifiedDOs) ? apiData.data.verifiedDOs : []).find((d) => {
                const sn = d?.loadReference?.shipmentNumber;
                return sn === selectedBill?.billId || d?._id === selectedBill?.billId;
              });
              // compute display helpers
              const lr = doData?.loadReference || {};
              const customers = Array.isArray(doData?.customers) ? doData.customers : [];
              const firstCust = customers[0] || {};
              const lineHaul = Number(firstCust?.lineHaul || 0);
              const fsc = Number(firstCust?.fsc || 0);
              const other = Number(firstCust?.other || 0);
              const totalRates = Number((firstCust?.calculatedTotal ?? firstCust?.totalAmount ?? (lineHaul + fsc + other)) ?? 0);
              const paymentStatus = doData?.paymentStatus?.status || 'pending';
              const equipmentType = doData?.shipper?.containerType || lr?.vehicleType || selectedBill?.loadData?.vehicleType || 'N/A';
              const statusLabel = (doData?.assignmentStatus || doData?.accountantApproval?.status || doData?.salesApproval?.status || 'verified')
                .toString()
                .replace('_', ' ');

              return (
                <>
                {/* Basic Information Card */}
                <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#e3f2fd' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#1976d2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      i
                   </Box>
                    <Typography variant="h6" fontWeight={700} color="#0d47a1">Basic Information</Typography>
                   </Box>

                  <Box sx={{ p: 2 }}>
                    <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ width: 220, color: 'text.secondary' }}>Consignment ID</TableCell>
                          <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{lr?.shipmentNumber || selectedBill.billId}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Equipment Type</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{equipmentType}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>PO Number</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{lr?.poNumber || selectedBill.chargeSetId}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>BOL Number</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{lr?.bolNumber || selectedBill.secondaryRef}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Container Number</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{lr?.containerNo || selectedBill.containerId}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                   </Box>
                </Paper>

                {/* Rate Information Card */}
                <Paper elevation={0} sx={{ border: '1px solid #ffe0b2', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#fff8e1' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#ffb300', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      $
                   </Box>
                    <Typography variant="h6" fontWeight={700} color="#e65100">Rate Information</Typography>
                   </Box>
                  <Box sx={{ p: 2 }}>
                    <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ width: 220, color: 'text.secondary' }}>Rate</TableCell>
                          <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>${totalRates.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Line Haul</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>${lineHaul.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>FSC</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>${fsc.toLocaleString()}</TableCell>
                        </TableRow>
                        {(other > 0 && !isNaN(other)) && (
                          <TableRow>
                            <TableCell sx={{ color: 'text.secondary' }}>Other</TableCell>
                            <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>${other.toLocaleString()}</TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Total Rates</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: 'success.main' }}>${totalRates.toLocaleString()}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
             </Box>
                </Paper>

                {/* Load Details */}
                <Paper elevation={0} sx={{ border: '1px solid #b2dfdb', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#e0f2f1' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#00897b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>📦</Box>
                    <Typography variant="h6" fontWeight={700} color="#00695c">Load Details</Typography>
               </Box>
                  <Box sx={{ p: 2 }}>
                    <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ width: 220, color: 'text.secondary' }}>Weight</TableCell>
                          <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{lr?.weight ?? doData?.shipper?.weight ?? 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Commodity</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{lr?.commodity ?? doData?.shipper?.commodity ?? 'N/A'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
             </Box>
                </Paper>

                {/* Locations Card */}
                {(Array.isArray(doData?.shipper?.pickUpLocations) || Array.isArray(doData?.shipper?.dropLocations)) && (
                  <Paper elevation={0} sx={{ border: '1px solid #c8e6c9', borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#e8f5e9' }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#2e7d32', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>📍</Box>
                      <Typography variant="h6" fontWeight={700} color="#1b5e20">Locations</Typography>
           </Box>
                    <Box sx={{ p: 2 }}>
                      {(doData?.shipper?.pickUpLocations || []).map((l, idx) => (
                        <Box key={`pu-${idx}`} sx={{ mb: idx < (doData?.shipper?.pickUpLocations?.length || 0) - 1 ? 2 : 0 }}>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: '#2e7d32' }}>Pickup Location {idx + 1}</Typography>
                          <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                            <TableBody>
                              <TableRow>
                                <TableCell sx={{ width: 220, color: 'text.secondary' }}>Address</TableCell>
                                <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{l.address || 'N/A'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ color: 'text.secondary' }}>City</TableCell>
                                <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{l.city || 'N/A'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ color: 'text.secondary' }}>State</TableCell>
                                <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{l.state || 'N/A'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ color: 'text.secondary' }}>Zip</TableCell>
                                <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{l.zipCode || 'N/A'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ color: 'text.secondary' }}>Date</TableCell>
                                <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{l.pickUpDate ? format(new Date(l.pickUpDate), 'yyyy-MM-dd') : 'N/A'}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Box>
                      ))}
                      {(doData?.shipper?.dropLocations || []).map((l, idx) => (
                        <Box key={`dr-${idx}`} sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: '#2e7d32' }}>Drop Location {idx + 1}</Typography>
                          <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                            <TableBody>
                              <TableRow>
                                <TableCell sx={{ width: 220, color: 'text.secondary' }}>Address</TableCell>
                                <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{l.address || 'N/A'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ color: 'text.secondary' }}>City</TableCell>
                                <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{l.city || 'N/A'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ color: 'text.secondary' }}>State</TableCell>
                                <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{l.state || 'N/A'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ color: 'text.secondary' }}>Zip</TableCell>
                                <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{l.zipCode || 'N/A'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ color: 'text.secondary' }}>Date</TableCell>
                                <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{l.dropDate ? format(new Date(l.dropDate), 'yyyy-MM-dd') : 'N/A'}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                )}

                {/* Driver and Vehicle Information - Only show if data exists */}
                {(() => {
                  const driverName = doData?.driver?.name || doData?.driverName;
                  const vehicleNo = lr?.vehicleNumber || doData?.vehicleNo;
                  const hasDriverOrVehicleInfo = driverName || vehicleNo;
                  
                  if (!hasDriverOrVehicleInfo) return null;
                  
                  return (
                    <Paper elevation={0} sx={{ border: '1px solid #ce93d8', borderRadius: 2, overflow: 'hidden' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#f3e5f5' }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#6a1b9a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>🧑‍✈️</Box>
                        <Typography variant="h6" fontWeight={700} color="#4a148c">Driver and Vehicle Information</Typography>
                      </Box>
                      <Box sx={{ p: 2 }}>
                        <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                          <TableBody>
                            {driverName && (
                              <TableRow>
                                <TableCell sx={{ width: 220, color: 'text.secondary' }}>Driver Name</TableCell>
                                <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{driverName}</TableCell>
                              </TableRow>
                            )}
                            {vehicleNo && (
                              <TableRow>
                                <TableCell sx={{ color: 'text.secondary' }}>Vehicle No</TableCell>
                                <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{vehicleNo}</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </Box>
                    </Paper>
                  );
                })()}

                {/* Important Dates */}
                <Paper elevation={0} sx={{ border: '1px solid #9fa8da', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#e8eaf6' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#283593', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>🗓️</Box>
                    <Typography variant="h6" fontWeight={700} color="#1a237e">Important Dates</Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ width: 220, color: 'text.secondary' }}>Pickup Dated</TableCell>
                          <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{lr?.pickupDate ? format(new Date(lr.pickupDate), 'yyyy-MM-dd') : (doData?.shipper?.pickUpLocations?.[0]?.pickUpDate ? format(new Date(doData.shipper.pickUpLocations[0].pickUpDate), 'yyyy-MM-dd') : 'N/A')}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Drop Dated</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{lr?.deliveryDate ? format(new Date(lr.deliveryDate), 'yyyy-MM-dd') : (doData?.shipper?.dropLocations?.[0]?.dropDate ? format(new Date(doData.shipper.dropLocations[0].dropDate), 'yyyy-MM-dd') : 'N/A')}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>

                {/* Images Section - Pickup and Delivery */}
                {(() => {
                  const lrImgs = lr?.dropLocationImages || {};
                  // Gather pickup-related images from either loadReference or root
                  const pickupGroups = [
                    { title: 'Empty Truck Images', urls: lr?.emptyTruckImages || doData?.emptyTruckImages || [] },
                    { title: 'Loaded Truck Images', urls: lr?.loadedTruckImages || doData?.loadedTruckImages || [] },
                    { title: 'Container Images', urls: lr?.containerImages || doData?.containerImages || [] },
                    { title: 'Seal Images', urls: lr?.sealImages || doData?.sealImages || [] },
                    { title: 'EIR Tickets', urls: lr?.eirTickets || doData?.eirTickets || [] },
                  ].filter(g => Array.isArray(g.urls) && g.urls.length > 0);

                  // Gather drop-related images from nested dropLocationImages structure
                  const dropGroups = [
                    { title: 'POD Images', urls: lrImgs?.podImages || [] },
                    { title: 'Loaded Truck Images (Drop)', urls: lrImgs?.loadedTruckImages || [] },
                    { title: 'Drop Location Images', urls: lrImgs?.dropLocationImages || [] },
                    { title: 'Empty Truck Images (Drop)', urls: lrImgs?.emptyTruckImages || [] },
                  ].filter(g => Array.isArray(g.urls) && g.urls.length > 0);

                  const GroupCard = ({ title, urls }) => {
                    const preview = Array.isArray(urls) && urls.length > 0 ? urls[0] : null;
                    return (
                      <Paper
           variant="outlined"
           sx={{ 
                          width: 220,
             borderRadius: 2, 
                          overflow: 'hidden',
                          p: 2,
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                          {title} ({urls?.length || 0})
                        </Typography>
                        {preview ? (
                          <Box
                            component="img"
                            src={preview}
                            alt={title}
                            onClick={() => window.open(preview, '_blank')}
            sx={{ 
                              width: '100%',
                              height: 140,
                              objectFit: 'cover',
                              borderRadius: 1,
                              border: '1px solid #e0e0e0',
                              cursor: 'pointer',
                              boxShadow: 0.5,
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: 140,
                              borderRadius: 1,
                              border: '1px dashed #cfd8dc',
                 display: 'flex',
                 alignItems: 'center',
                              justifyContent: 'center',
                              color: 'text.secondary',
                              fontSize: 12,
                            }}
                          >
                            No image
                          </Box>
                        )}
                      </Paper>
                    );
                  };

                  if (pickupGroups.length === 0 && dropGroups.length === 0) return null;

                  return (
                    <Paper elevation={0} sx={{ border: '1px solid #90caf9', borderRadius: 2, overflow: 'hidden' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#e3f2fd' }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#3949ab', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>🖼️</Box>
                        <Typography variant="h6" fontWeight={700} color="#1565c0">Images</Typography>
                      </Box>
                      <Box sx={{ p: 2 }}>
               <Grid container spacing={2}>
                 <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" fontWeight={800} color="#1b5e20" sx={{ mb: 1.5 }}>Pickup Images</Typography>
                            {pickupGroups.length > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                {pickupGroups.map((g, idx) => (
                                  <GroupCard key={`pu-${idx}`} title={g.title} urls={g.urls} />
                                ))}
                   </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">No pickup images</Typography>
                            )}
                 </Grid>
                 <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" fontWeight={800} color="#b71c1c" sx={{ mb: 1.5 }}>Delivery Images</Typography>
                            {dropGroups.length > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                {dropGroups.map((g, idx) => (
                                  <GroupCard key={`dr-${idx}`} title={g.title} urls={g.urls} />
                                ))}
                   </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">No delivery images</Typography>
                            )}
                 </Grid>
               </Grid>
             </Box>
                    </Paper>
                  );
                })()}
                {!doData && (
                  <Alert severity="info">No detailed data found for this shipment in loaded results.</Alert>
                )}
              </>
              );
            })()}
           </Box>
         )}
       </DialogContent>
     </Dialog>
     </LocalizationProvider>
   );
 };

export default Bills;
