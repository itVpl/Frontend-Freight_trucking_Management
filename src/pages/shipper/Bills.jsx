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
  AttachMoney
} from '@mui/icons-material';
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

// API service function to fetch unverified loads
const fetchUnverifiedLoads = async (shipperId, loadId = null) => {
  try {
    let url = `${BASE_API_URL}/api/v1/accountant/shipper/all-unverified-loads?shipperId=${shipperId}`;
    if (loadId) {
      url += `&loadId=${loadId}`;
    }
    
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
    console.error('Error fetching unverified loads:', error);
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

  // Fetch API data on component mount
  useEffect(() => {
    const loadApiData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Using the shipperId from the API example
        const shipperId = '68cd6ee176b6c23c1d2a87b3';
        
        // Try different API call approaches
        let response;
        try {
          // First try without loadId
          response = await fetchUnverifiedLoads(shipperId);
        } catch (firstError) {
          console.log('First attempt failed, trying with loadId...');
          // If that fails, try with loadId
          const loadId = '68e7eecea78740db1d29848e';
          response = await fetchUnverifiedLoads(shipperId, loadId);
        }
        setApiData(response);
        
        // Transform API data to match existing structure
        if (response.success && response.data.allLoads) {
          const transformedData = response.data.allLoads.map(load => ({
            billId: load.shipmentNumber || load._id,
            chargeSetId: load.poNumber || load._id,
            containerId: load.containerNo || 'N/A',
            secondaryRef: load.bolNumber || load._id,
            date: format(new Date(load.pickupDate), 'yyyy-MM-dd'),
            dueDate: format(new Date(load.deliveryDate), 'yyyy-MM-dd'),
            amount: load.rate || 0,
            status: load.status || 'Pending',
            amount0_30: load.status === 'Delivered' ? load.rate || 0 : 0,
            amount30_60: 0,
            amount60_90: 0,
            // Additional load-specific data
            loadData: {
              origin: load.origin,
              destination: load.destination,
              weight: load.weight,
              commodity: load.commodity,
              vehicleType: load.vehicleType,
              carrier: load.carrier,
              shipper: load.shipper,
              acceptedBid: load.acceptedBid,
              deliveryOrder: load.deliveryOrder,
              verificationStatus: load.verificationStatus
            }
          }));
          
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
    const headers = ['Shipment #', 'PO Number', 'Container #', 'BOL Number', 'Pickup Location', 'Drop Location', 'Rate ($)', 'Status', 'Verification Status'];
    const csvRows = [headers.join(',')];

    displayData.forEach((row) => {
      const values = [
        row.billId, 
        row.chargeSetId, 
        row.containerId, 
        row.secondaryRef,
        row.loadData?.origin?.city ? `${row.loadData.origin.city}, ${row.loadData.origin.state}` : 'N/A',
        row.loadData?.destination?.city ? `${row.loadData.destination.city}, ${row.loadData.destination.state}` : 'N/A',
        row.amount,
        row.status,
        row.loadData?.verificationStatus || 'N/A'
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

      // Find the matching load from API data to get complete information
      const matchedLoad = (Array.isArray(apiData?.data?.allLoads) ? apiData.data.allLoads : []).find(
        load => load.shipmentNumber === order.billId || load._id === order.billId
      );
      
      // Debug logging
      console.log('Order billId:', order.billId);
      console.log('Matched load:', matchedLoad);
      console.log('API data allLoads:', apiData?.data?.allLoads);
      
      // ---- Bill To + Address (from shippers list if available) ----
      const deliveryOrder = matchedLoad?.deliveryOrder || order?.loadData?.deliveryOrder;
      const cust = deliveryOrder?.customers?.[0] || {};
      const companyName = (cust.billTo || '').trim();
      
      const billAddr = [
        matchedLoad?.shipper?.compAdd,
        matchedLoad?.shipper?.city,
        matchedLoad?.shipper?.state,
        matchedLoad?.shipper?.zipcode,
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

      // Create pickup and drop location data from the matched load
      const pickRows = matchedLoad ? [
        {
          name: matchedLoad.origin?.city || 'Pickup Location',
          address: matchedLoad.origin?.city,
          city: matchedLoad.origin?.city,
          state: matchedLoad.origin?.state,
          zipCode: matchedLoad.origin?.zipCode
        }
      ] : [];
      
      const dropRows = matchedLoad ? [
        {
          name: matchedLoad.destination?.city || 'Drop Location', 
          address: matchedLoad.destination?.city,
          city: matchedLoad.destination?.city,
          state: matchedLoad.destination?.state,
          zipCode: matchedLoad.destination?.zipCode
        }
      ] : [];
      
      // Debug logging for locations
      console.log('Pick rows:', pickRows);
      console.log('Drop rows:', dropRows);
      console.log('Customer data:', cust);

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
        const weight = matchedLoad?.weight || 'N/A';
        const contNo = matchedLoad?.containerNo || order?.containerId || 'N/A';
        const contTp = matchedLoad?.vehicleType || order?.loadData?.vehicleType || 'N/A';
        const qty = 1;
        const dateSrc = matchedLoad?.pickupDate || order?.date;
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
        const weight = matchedLoad?.weight || 'N/A';
        const contNo = matchedLoad?.containerNo || order?.containerId || 'N/A';
        const contTp = matchedLoad?.vehicleType || order?.loadData?.vehicleType || 'N/A';
        const qty = 1;
        const dateSrc = matchedLoad?.deliveryDate || order?.dueDate;
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
          ${OTH > 0 ? `<tr><td>Other</td><td class="amount">$${OTH.toLocaleString()}</td></tr>` : ''}
          <tr class="total-row">
            <td><strong>TOTAL</strong></td>
            <td class="amount"><strong>$${CUSTOMER_TOTAL.toLocaleString()} USD</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">Thank you for your business!</div>
  </div>
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
        
        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading bills data...
            </Typography>
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
                  label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(1)}%`}
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
                  height={36}
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: '20px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
        )}

        {/* Data Table */}
        {displayData.length > 0 && (
          <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
                <TableCell sx={{ fontWeight: 600 }}>Shipment #</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>PO Number</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Container #</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>BOL Number</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Pickup Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Drop Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Rate ($)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Verification</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
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
                        <Chip 
                          label={bill.status} 
                          color={getStatusColor(bill.status)} 
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        {bill.loadData?.verificationStatus && (
                          <Chip 
                            label={bill.loadData.verificationStatus.replace('_', ' ').toUpperCase()} 
                            color={bill.loadData.verificationStatus === 'accountant_approved' ? 'success' : 'warning'} 
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        )}
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
             Bill Details
           </Typography>
           <IconButton 
             onClick={handleViewBillClose} 
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
         {selectedBill && (
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
                   <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, background: '#fafafa' }}>
                     <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                       Bill ID
                     </Typography>
                     <Typography variant="body1" fontWeight={600}>
                       {selectedBill.billId}
                     </Typography>
                   </Box>
                 </Grid>
                 <Grid item xs={12} md={4}>
                   <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, background: '#fafafa' }}>
                     <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                       Bill Date
                     </Typography>
                     <Typography variant="body1" fontWeight={600}>
                       {selectedBill.date}
                     </Typography>
                   </Box>
                 </Grid>
                 <Grid item xs={12} md={4}>
                   <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, background: '#fafafa' }}>
                     <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                       Status
                     </Typography>
                     <Chip 
                       label={selectedBill.status} 
                       color={getStatusColor(selectedBill.status)} 
                       size="small"
                       sx={{ fontWeight: 600 }}
                     />
                   </Box>
                 </Grid>
               </Grid>
             </Box>

             {/* Amount Details Section */}
             <Box>
               <Typography variant="h6" fontWeight={600} mb={2} sx={{
                 color: '#333',
                 display: 'flex',
                 alignItems: 'center',
                 gap: 1
               }}>
                 💰 Amount Details
               </Typography>
               <Divider sx={{ 
                 mb: 3,
                 background: '#e0e0e0',
                 height: 1
               }} />
               <Grid container spacing={2}>
                 <Grid item xs={12} md={6}>
                   <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, background: '#fafafa' }}>
                     <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                       Amount
                     </Typography>
                     <Typography variant="h4" fontWeight={700} color="#1976d2">
                       ${selectedBill.amount.toLocaleString()}
                     </Typography>
                   </Box>
                 </Grid>
                 <Grid item xs={12} md={6}>
                   <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, background: '#fafafa' }}>
                     <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                       Status
                     </Typography>
                     <Chip 
                       label={selectedBill.status} 
                       color={getStatusColor(selectedBill.status)} 
                       size="medium"
                       sx={{ fontWeight: 600 }}
                     />
                   </Box>
                 </Grid>
               </Grid>
             </Box>

             {/* Additional Information Section */}
             <Box>
               <Typography variant="h6" fontWeight={600} mb={2} sx={{
                 color: '#333',
                 display: 'flex',
                 alignItems: 'center',
                 gap: 1
               }}>
                 ℹ️ Additional Information
               </Typography>
               <Divider sx={{ 
                 mb: 3,
                 background: '#e0e0e0',
                 height: 1
               }} />
               <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, background: '#fafafa' }}>
                 <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                   Bill Description
                 </Typography>
                 <Typography variant="body1">
                   This is a detailed view of bill {selectedBill.billId}. The bill was generated on {selectedBill.date} and is currently in {selectedBill.status.toLowerCase()} status.
                 </Typography>
               </Box>
             </Box>
           </Box>
         )}
       </DialogContent>
       
       <Divider />
       
       <DialogActions sx={{ p: 2, gap: 2, background: '#f5f5f5' }}>
         <Button 
           onClick={handleViewBillClose}
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
           Close
         </Button>
                   <Button 
            variant="contained"
            startIcon={<Download />}
             onClick={() => selectedBill && generateInvoicePDF(selectedBill)}
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
            Download PDF
          </Button>
       </DialogActions>
     </Dialog>
     </LocalizationProvider>
   );
 };

export default Bills;
