import { useEffect, useState, useRef } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tabs,
  Tab,
  MenuItem,
  Autocomplete,
  Skeleton,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Receipt, Download, Search, Send } from "@mui/icons-material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import MessageIcon from "@mui/icons-material/Message";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import alertify from "alertifyjs";
import axios from "axios";
import { BASE_API_URL } from "../../apiConfig";
import { useThemeConfig } from "../../context/ThemeContext";
import { useNegotiation } from "../../context/NegotiationContext";
import { useSocket } from "../../context/SocketContext";

const Dashboard = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [bidForm, setBidForm] = useState({
    pickupETA: "",
    dropETA: "",
    bidAmount: "",
    message: "",
    driverName: "",
    vehicleNumber: "",
    vehicleType: "",
  });
  const [bidErrors, setBidErrors] = useState({});
  const [tab, setTab] = useState(0);
  const { themeConfig } = useThemeConfig();
  const brand =
    themeConfig.header?.bg && themeConfig.header.bg !== "white"
      ? themeConfig.header.bg
      : themeConfig.tokens?.primary || "#1976d2";
  const headerTextColor = themeConfig.header?.text || "#ffffff";
  const [pendingBids, setPendingBids] = useState([]);
  const [acceptedBids, setAcceptedBids] = useState([]);
  const handleTabChange = (event, newValue) => setTab(newValue);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    driverId: "",
    vehicleNumber: "",
  });
  const [assignBidId, setAssignBidId] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [selectedBidDetails, setSelectedBidDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { addNotification, unreadBids, pollNegotiations } = useNegotiation();
  const { socket } = useSocket();
  const [negotiationHistory, setNegotiationHistory] = useState(null);
  const negotiationPollInFlightRef = useRef(false);
  const [negotiationMessage, setNegotiationMessage] = useState('');
  const [negotiationLoading, setNegotiationLoading] = useState(false);
  const formatCityState = (obj) => {
    if (!obj) return "";
    const city = obj.city || "";
    const state = obj.state || "";
    if (!city && !state) return "";
    return `${city}${state ? `, ${state}` : ""}`;
  };

  const formatLatLng = (latLng) => {
    if (!latLng || (latLng.lat == null && latLng.lon == null)) return "";
    const lat = latLng.lat;
    const lon = latLng.lon;
    if (lat === 0 && lon === 0) return "";
    return `${lat.toFixed ? lat.toFixed(4) : lat}, ${lon.toFixed ? lon.toFixed(4) : lon}`;
  };

  const resolvePickupLocation = (row) => {
    // Prefer array structure
    if (row.origins && row.origins.length > 0) {
      const loc =
        formatCityState(row.origins[0]) || row.origins[0]?.addressLine1 || "";
      if (loc) return loc;
    }
    // Fallback: single origin object
    const single =
      formatCityState(row.origin) || row.origin?.addressLine1 || "";
    if (single) return single;
    // Fallback: tracking coordinates
    const coords = formatLatLng(row.tracking?.originLatLng);
    if (coords) return coords;
    return "-";
  };

  const resolveDropLocation = (row) => {
    if (row.destinations && row.destinations.length > 0) {
      const loc =
        formatCityState(row.destinations[0]) ||
        row.destinations[0]?.addressLine1 ||
        "";
      if (loc) return loc;
    }
    const single =
      formatCityState(row.destination) || row.destination?.addressLine1 || "";
    if (single) return single;
    const coords = formatLatLng(row.tracking?.destinationLatLng);
    if (coords) return coords;
    return "-";
  };

  // Function to format Load ID as "L-last 4 digits"
  const formatLoadId = (loadId) => {
    if (!loadId) return "-";
    const idString = loadId.toString();
    const last4Digits = idString.slice(-4);
    return `L-${last4Digits}`;
  };

  const handleViewDetails = async (bid) => {
    setLoadingDetails(true);
    setViewDetailsModalOpen(true);
    setNegotiationHistory(null);
    setNegotiationMessage("");

    try {
      const token = localStorage.getItem("token");
      const bidId = bid.bidId || bid._id;
      const response = await axios.get(`${BASE_API_URL}/api/v1/bid/accepted`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Find the specific bid from the response
      let specificBid = bid;
      if (Array.isArray(response.data.acceptedBids)) {
        specificBid =
          response.data.acceptedBids.find(
            (b) => (b.bidId || b._id) === bidId,
          ) || bid;
      }
      setSelectedBidDetails(specificBid);

      // Fetch Negotiation History
      try {
        const negotiationResponse = await axios.get(
          `${BASE_API_URL}/api/v1/bid/${bidId}/internal-negotiation-thread`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (
          negotiationResponse.data.success &&
          negotiationResponse.data.data?.internalNegotiation
        ) {
          setNegotiationHistory(negotiationResponse.data.data);
        }
      } catch (err) {
        console.error("Error fetching negotiation history:", err);
      }
    } catch (err) {
      console.error("Error fetching bid details:", err);
      setSelectedBidDetails(bid); // Fallback to the bid data we already have
      if (window.alertify) {
        window.alertify.error("Failed to fetch complete bid details");
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseViewDetailsModal = () => {
    setViewDetailsModalOpen(false);
    setSelectedBidDetails(null);
  };

  const handleAssignDriver = (bid) => {
    setAssignBidId(bid.bidId || bid._id);
    setAssignForm({ driverId: "", vehicleNumber: "" });
    setAssignModalOpen(true);
  };
  const handleCloseAssignModal = () => {
    setAssignModalOpen(false);
    setAssignBidId(null);
  };
  const handleAssignFormChange = (e) => {
    const { name, value } = e.target;
    setAssignForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignForm.driverId || !assignForm.vehicleNumber) {
      if (window.alertify) {
        window.alertify.error("Please select driver and enter vehicle number");
      }
      return;
    }
    try {
      const token = localStorage.getItem("token");
      // Try to include origin/destination if backend expects them
      const currentBid =
        acceptedBids.find((b) => (b.bidId || b._id) === assignBidId) || {};
      const parseCityState = (str) => {
        if (!str || str === "-" || typeof str !== "string")
          return { city: "", state: "" };
        const parts = str.split(",").map((s) => s.trim());
        return { city: parts[0] || "", state: parts[1] || "" };
      };
      const originText = resolvePickupLocation(currentBid);
      const destText = resolveDropLocation(currentBid);
      const originObj = parseCityState(originText);
      const destObj = parseCityState(destText);
      await axios.post(
        `${BASE_API_URL}/api/v1/bid/${assignBidId}/assign-driver`,
        {
          driverId: assignForm.driverId,
          vehicleNumber: assignForm.vehicleNumber,
          origin: originObj,
          destination: destObj,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (window.alertify) {
        window.alertify.success("Driver assigned successfully");
      }
      setAssignModalOpen(false);
      setAssignBidId(null);
      setAssignForm({ driverId: "", vehicleNumber: "" });
      // refresh accepted bids list
      try {
        const refresh = await axios.get(`${BASE_API_URL}/api/v1/bid/accepted`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAcceptedBids(
          Array.isArray(refresh.data.acceptedBids)
            ? refresh.data.acceptedBids
            : [],
        );
      } catch (_) {
        console.error(_);
      }
    } catch (err) {
      if (window.alertify) {
        window.alertify.error(
          err.response?.data?.message || "Failed to assign driver",
        );
      }
    }
  };

  useEffect(() => {
    const fetchAvailableLoads = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_API_URL}/api/v1/load/available`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (Array.isArray(response.data.loads)) {
          setPendingBids(response.data.loads);
        } else {
          setPendingBids([]);
        }
      } catch (err) {
        setPendingBids([]);
      } finally {
        setLoading(false);
      }
    };
    const fetchDrivers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_API_URL}/api/v1/driver/my-drivers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setDrivers(
          Array.isArray(response.data)
            ? response.data
            : response.data.drivers || [],
        );
      } catch (err) {
        setDrivers([]);
      }
    };
    const fetchAcceptedBids = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_API_URL}/api/v1/bid/accepted`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (Array.isArray(response.data.acceptedBids)) {
          setAcceptedBids(response.data.acceptedBids);
        } else {
          setAcceptedBids([]);
        }
      } catch (err) {
        setAcceptedBids([]);
      } finally {
        setLoading(false);
      }
    };
    if (tab === 0) {
      fetchAvailableLoads();
    } else if (tab === 1) {
      fetchAcceptedBids();
      if (pollNegotiations) {
        pollNegotiations();
      }
    }
    fetchDrivers();
  }, [tab]);

  const bidData = tab === 0 ? pendingBids : acceptedBids;
  const filteredData = bidData.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil((totalItems || 1) / rowsPerPage));
  const clampedPage = Math.min(page, totalPages - 1);
  const pageStart = clampedPage * rowsPerPage;
  const pageEnd = Math.min(totalItems, pageStart + rowsPerPage);
  const visibleRows = filteredData.slice(pageStart, pageEnd);
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const start = Math.max(1, clampedPage + 1 - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (start > 1) pages.push(1, "…");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push("…", totalPages);
    return pages;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleBidNow = (load) => {
    setSelectedLoad(load);
    setBidModalOpen(true);
  };

  const handleCloseBidModal = () => {
    setBidModalOpen(false);
    setSelectedLoad(null);
    setBidForm({
      pickupETA: "",
      dropETA: "",
      bidAmount: "",
      message: "",
      driverName: "",
      vehicleNumber: "",
      vehicleType: "",
    });
    setBidErrors({});
  };

  const handleBidFormChange = (e) => {
    setBidForm({
      ...bidForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!bidForm.pickupETA) newErrors.pickupETA = true;
    if (!bidForm.dropETA) newErrors.dropETA = true;
    if (!bidForm.bidAmount) newErrors.bidAmount = true;
    if (!bidForm.message) newErrors.message = true;
    if (!bidForm.driverName) newErrors.driverName = true;
    if (!bidForm.vehicleNumber) newErrors.vehicleNumber = true;
    if (!bidForm.vehicleType) newErrors.vehicleType = true;
    setBidErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      alertify.error("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const bidData = {
        loadId: selectedLoad._id || selectedLoad.loadId,
        rate: parseFloat(bidForm.bidAmount),
        message: bidForm.message,
        estimatedPickupDate: bidForm.pickupETA.split("T")[0], // Extract date part only
        estimatedDeliveryDate: bidForm.dropETA.split("T")[0], // Extract date part only
        driverName: bidForm.driverName,
        driverPhone: "", // Always send blank
        vehicleNumber: bidForm.vehicleNumber,
        vehicleType: bidForm.vehicleType,
      };

      const response = await axios.post(
        `${BASE_API_URL}/api/v1/bid/place`,
        bidData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        alertify.success("Bid submitted successfully!");
        handleCloseBidModal();
        // Refresh the data after successful bid submission
        if (tab === 0) {
          // Refresh pending bids
          const refreshResponse = await axios.get(
            `${BASE_API_URL}/api/v1/load/available`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          if (Array.isArray(refreshResponse.data.loads)) {
            setPendingBids(refreshResponse.data.loads);
          }
        }
      }
    } catch (error) {
      console.error("Error submitting bid:", error);
      if (error.response?.data?.message) {
        alertify.error(error.response.data.message);
      } else {
        alertify.error("Failed to submit bid. Please try again.");
      }
    }
  };

  const exportToCSV = () => {
    const sectionName = tab === 0 ? "Pending Bids" : "Accepted Bids";
    const esc = (val) => {
      const s = val == null ? "" : String(val);
      return `"${s.replace(/"/g, '""')}"`;
    };

    let headers = [];
    let rows = [];

    if (tab === 0) {
      // Pending Bids
      headers = [
        "Load ID",
        "Shipper Name",
        "Pickup",
        "Drop",
        "Shipment Type",
        "ETA",
        "Bid Status",
      ];
      rows = filteredData.map((row) => {
        const loadId = formatLoadId(row._id || row.loadId);
        const shipper = row.shipper?.compName || row.shipperName || "";
        const pickup = resolvePickupLocation(row);
        const drop = resolveDropLocation(row);
        const type = row.shipper?.loadType || row.loadType || "";
        const eta = row.pickupDate
          ? new Date(row.pickupDate).toLocaleDateString()
          : row.eta || "";
        const status = row.status || "Bidding";
        return [loadId, shipper, pickup, drop, type, eta, status];
      });
    } else {
      // Accepted Bids
      headers = [
        "Shipment No",
        "Pickup Location",
        "Drop Location",
        "Pickup Date",
        "Drop Date",
        "Status",
      ];
      rows = filteredData.map((row) => {
        const shipmentNo = row.shipmentNumber || "";
        const pickup = resolvePickupLocation(row);
        const drop = resolveDropLocation(row);
        const pickupDate = row.pickupDate
          ? new Date(row.pickupDate).toLocaleDateString()
          : "";
        const dropDate = row.deliveryDate
          ? new Date(row.deliveryDate).toLocaleDateString()
          : "";
        const status = row.status || "";
        return [shipmentNo, pickup, drop, pickupDate, dropDate, status];
      });
    }

    const lines = [];
    lines.push(`Section,${sectionName}`);
    lines.push("");
    lines.push(headers.map((h) => esc(h)).join(","));
    rows.forEach((r) => lines.push(r.map(esc).join(",")));

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `${sectionName.toLowerCase().replace(/\s+/g, "_")}_${dateStr}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSendNegotiation = async () => {
    if (!negotiationMessage.trim()) return;

    setNegotiationLoading(true);
    try {
      const token = localStorage.getItem("token");
      const bidId = selectedBidDetails.bidId || selectedBidDetails._id;

      const response = await axios.put(
        `${BASE_API_URL}/api/v1/bid/${bidId}/trucker-internal-negotiate`,
        {
          message: negotiationMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        alertify.success("Message sent");

        setNegotiationMessage("");
        // Refresh history immediately
        const historyResponse = await axios.get(
          `${BASE_API_URL}/api/v1/bid/${bidId}/internal-negotiation-thread`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (
          historyResponse.data.success &&
          historyResponse.data.data?.internalNegotiation
        ) {
          setNegotiationHistory(historyResponse.data.data);
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
      alertify.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setNegotiationLoading(false);
    }
  };

  // Polling for negotiation history updates (throttled: 15s + in-flight guard to avoid rapid API calls)
  const NEGOTIATION_POLL_INTERVAL_MS = 15000;
  useEffect(() => {
    let interval;
    if (viewDetailsModalOpen && selectedBidDetails) {
      interval = setInterval(async () => {
        if (negotiationPollInFlightRef.current) return;
        negotiationPollInFlightRef.current = true;
        try {
          const token = localStorage.getItem("token");
          const bidId = selectedBidDetails.bidId || selectedBidDetails._id;
          const response = await axios.get(
            `${BASE_API_URL}/api/v1/bid/${bidId}/internal-negotiation-thread`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (
            response.data.success &&
            response.data.data?.internalNegotiation
          ) {
            setNegotiationHistory((prev) => {
              const newHistory =
                response.data.data.internalNegotiation.history || [];
              const prevHistory = prev?.internalNegotiation?.history || [];

              if (newHistory.length > prevHistory.length) {
                // New messages found
                const newMessages = newHistory.slice(prevHistory.length);
                // Note: Notification is now handled globally in NegotiationContext
                // We just return the new data to update the UI
                return response.data.data;
              }
              if (newHistory.length > prevHistory.length) return response.data.data;
              return prev;
            });
          }
        } catch (err) {
          console.error("Error polling negotiation history:", err);
          console.error('Error polling negotiation history:', err);
        } finally {
          negotiationPollInFlightRef.current = false;
        }
      }, NEGOTIATION_POLL_INTERVAL_MS);
    }
    return () => (interval && clearInterval(interval));
  }, [viewDetailsModalOpen, selectedBidDetails]);

  const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "#fafafa",
    "&:hover": { backgroundColor: "#f5f5f5" },
    "&.Mui-focused": { backgroundColor: "#fff" },
  },
  "& .MuiInputLabel-root": {
    fontWeight: 500,
    color: "#666",
  },
};

  return (
    <Box sx={{ p: 3 }}>
      <div className="mb-2 text-2xl font-semibold text-gray-700">
        Bid Overview
      </div>
      <div className="mb-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              className="w-full h-11 rounded-md border border-gray-200 pl-10 pr-3 text-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={exportToCSV}
            className="h-11 px-6 rounded-md border border-blue-600 text-blue-600 text-base font-medium cursor-pointer hover:bg-blue-600 hover:text-white"
          >
            Export CSV
          </button>
        </div>
      </div>

      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Pending Bids" sx={{ fontWeight: 700 }} />
        <Tab label="Accepted Bids" sx={{ fontWeight: 700 }} />
      </Tabs>
      {tab === 0 && (
        <Box>
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div className="overflow-x-auto p-4">
              <table className="min-w-full border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-left bg-slate-100">
                    <th className="px-4 py-3 text-base font-semibold text-gray-500 rounded-l-xl border-t border-b border-l border-gray-200">
                      Load ID
                    </th>
                    <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                      Shipper Name
                    </th>
                    <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                      Pickup
                    </th>
                    <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                      Drop
                    </th>
                    <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                      Shipment Type
                    </th>
                    <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                      ETA
                    </th>
                    <th className="px-4 py-3 text-base font-semibold text-gray-500 rounded-r-xl border-t border-b border-r border-gray-200">
                      Bid Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-sm text-slate-500"
                        colSpan={7}
                      >
                        Loading…
                      </td>
                    </tr>
                  ) : totalItems === 0 ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-sm text-slate-500"
                        colSpan={7}
                      >
                        No available loads found
                      </td>
                    </tr>
                  ) : (
                    visibleRows.map((row, i) => (
                      <tr key={row._id || i} className="hover:bg-slate-50">
                        <td className="px-4 py-4 font-medium text-gray-700 truncate rounded-l-xl border-t border-b border-l border-gray-200">
                          {formatLoadId(row._id || row.loadId)}
                        </td>
                        <td className="px-4 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
                          <div className="relative group max-w-[160px]">
                            <span className="block truncate">
                              {row.shipper?.compName || row.shipperName || "-"}
                            </span>

                            {/* Tooltip */}
                            {(row.shipper?.compName || row.shipperName) && (
                              <div
                                className="absolute left-0 top-full mt-1 hidden group-hover:block 
                      bg-gray-900 text-white text-sm px-3 py-1.5 
                      rounded-md shadow-lg whitespace-nowrap z-50"
                              >
                                {row.shipper?.compName || row.shipperName}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                          {row.origins && row.origins.length > 0
                            ? `${row.origins[0].city || ""}${row.origins[0].state ? `, ${row.origins[0].state}` : ""}`
                            : row.origin?.city || row.from || "-"}
                        </td>
                        <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                          {row.destinations && row.destinations.length > 0
                            ? `${row.destinations[0].city || ""}${row.destinations[0].state ? `, ${row.destinations[0].state}` : ""}`
                            : row.destination?.city || row.to || "-"}
                        </td>
                        <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                          {row.shipper?.loadType || row.loadType || "-"}
                        </td>
                        <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                          {row.pickupDate
                            ? new Date(row.pickupDate).toLocaleDateString()
                            : row.eta || "-"}
                        </td>
                        <td className="px-4 py-4 rounded-r-xl border-t border-b border-r border-gray-200">
                          <button
                            onClick={() => handleBidNow(row)}
                            className="h-8 px-3 rounded-md border border-blue-600 text-blue-600 text-base cursor-pointer font-medium hover:bg-blue-600 hover:text-white"
                          >
                            Bid Now
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-2 border border-gray-200 rounded-lg bg-white px-4 py-3 flex items-center justify-between pr-40">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span>{`Showing ${totalItems === 0 ? 0 : pageStart + 1} to ${pageEnd} of ${totalItems} bids`}</span>
            </div>
            <div className="flex items-center gap-2 mr-8">
              <label className="inline-flex items-center gap-2 font-medium text-gray-700">
                <span>Rows per page</span>
                <select
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  className="h-8 rounded-md border border-slate-300 px-2 text-sm bg-white cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </label>
              <button
                onClick={() => setPage(Math.max(0, clampedPage - 1))}
                disabled={clampedPage === 0}
                className={`h-8 px-3 text-base ${
                  clampedPage === 0
                    ? "text-slate-400 rounded-full cursor-not-allowed"
                    : "text-slate-900 font-semibold cursor-pointer rounded-md"
                }`}
              >
                Previous
              </button>
              {getPageNumbers().map((num, idx) =>
                num === "…" ? (
                  <span key={`e-${idx}`} className="px-1 text-gray-900">
                    …
                  </span>
                ) : (
                  <button
                    key={num}
                    onClick={() => setPage(Number(num) - 1)}
                    className={`min-w-8 h-8 px-2 rounded-xl text-base cursor-pointer ${
                      num === clampedPage + 1
                        ? "border border-gray-900"
                        : "text-slate-700"
                    }`}
                  >
                    {num}
                  </button>
                ),
              )}
              <button
                onClick={() =>
                  setPage(Math.min(totalPages - 1, clampedPage + 1))
                }
                disabled={clampedPage >= totalPages - 1}
                className={`h-8 px-3 text-base ${
                  clampedPage >= totalPages - 1
                    ? "text-slate-400 rounded-full cursor-not-allowed"
                    : "text-slate-900 font-semibold cursor-pointer rounded-md"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </Box>
      )}
      {tab === 1 && (
        <Box>
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div className="overflow-x-auto p-4">
              <table className="min-w-full border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-left bg-slate-100">
                    <th className="px-4 py-3 text-base font-semibold text-gray-500 rounded-l-xl border-t border-b border-l border-gray-200">
                      Shipment No
                    </th>
                    <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                      Pickup Location
                    </th>
                    <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                      Drop Location
                    </th>
                    <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                      Pickup Date
                    </th>
                    <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                      Drop Date
                    </th>
                    <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                      Status
                    </th>
                    <th className="px-4 py-3 text-base font-semibold text-gray-500 rounded-r-xl border-t border-b border-r border-gray-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-sm text-slate-500"
                        colSpan={7}
                      >
                        Loading…
                      </td>
                    </tr>
                  ) : totalItems === 0 ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-sm text-slate-500"
                        colSpan={7}
                      >
                        No accepted bids found
                      </td>
                    </tr>
                  ) : (
                    visibleRows.map((row, i) => (
                      <tr key={row._id || i} className="hover:bg-slate-50">
                        <td className="px-4 py-4 font-medium text-gray-700 truncate rounded-l-xl border-t border-b border-l border-gray-200">
                          {row.shipmentNumber}
                        </td>
                        <td className="px-5 py-4px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                          {resolvePickupLocation(row)}
                        </td>
                        <td className="px-5 py-4px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                          {resolveDropLocation(row)}
                        </td>
                        <td className="px-5 py-4px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                          {row.pickupDate
                            ? new Date(row.pickupDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-5 py-4px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                          {row.deliveryDate
                            ? new Date(row.deliveryDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                          <span className="inline-block rounded-full px-3 py-1 text-sm font-semibold border bg-green-50 text-green-700 border-green-200">
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 rounded-r-xl border-t border-b border-r border-gray-200">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(row)}
                              className="relative h-8 px-3 rounded-md border border-blue-600 text-blue-600 text-base cursor-pointer font-medium hover:bg-blue-600 hover:text-white"
                            >
                              View Details
                              {unreadBids.has(row._id || row.bidId) && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white"></span>
                              )}
                            </button>
                            <button
                              onClick={() => handleAssignDriver(row)}
                              className="h-8 px-3 rounded-md border border-green-600 text-green-600 text-base cursor-pointer font-medium hover:bg-green-600 hover:text-white"
                            >
                              Assign Driver
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-2 border border-gray-200 rounded-lg bg-white px-4 py-3 flex items-center justify-between pr-40">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span>{`Showing ${totalItems === 0 ? 0 : pageStart + 1} to ${pageEnd} of ${totalItems} bids`}</span>
            </div>
            <div className="flex items-center gap-2 mr-8">
              <label className="inline-flex items-center gap-2 font-medium text-gray-700">
                <span>Rows per page</span>
                <select
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  className="h-8 rounded-md border border-slate-300 px-2 text-sm bg-white cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </label>
              <button
                onClick={() => setPage(Math.max(0, clampedPage - 1))}
                disabled={clampedPage === 0}
                className={`h-8 px-3 text-base ${
                  clampedPage === 0
                    ? "text-slate-400 rounded-full cursor-not-allowed"
                    : "text-slate-900 font-semibold cursor-pointer rounded-md"
                }`}
              >
                Previous
              </button>
              {getPageNumbers().map((num, idx) =>
                num === "…" ? (
                  <span key={`e-${idx}`} className="px-1 text-gray-900">
                    …
                  </span>
                ) : (
                  <button
                    key={num}
                    onClick={() => setPage(Number(num) - 1)}
                    className={`min-w-8 h-8 px-2 rounded-xl text-base cursor-pointer ${
                      num === clampedPage + 1
                        ? "border border-gray-900"
                        : "text-slate-700"
                    }`}
                  >
                    {num}
                  </button>
                ),
              )}
              <button
                onClick={() =>
                  setPage(Math.min(totalPages - 1, clampedPage + 1))
                }
                disabled={clampedPage >= totalPages - 1}
                className={`h-8 px-3 text-base ${
                  clampedPage >= totalPages - 1
                    ? "text-slate-400 rounded-full cursor-not-allowed"
                    : "text-slate-900 font-semibold cursor-pointer rounded-md"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </Box>
      )}

      {/* Bid Modal */}
      <Dialog
        open={bidModalOpen}
        onClose={handleCloseBidModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 8,
            background: "#fff",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "white",
            background: brand,
            py: 1.5,
            px: 2.5,
          }}
        >
          Place Your Bid
          <IconButton
            aria-label="close"
            onClick={handleCloseBidModal}
            sx={{ color: "#ffffff" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 3, background: "#fff" }}>
  {selectedLoad && (
    <Box component="form" onSubmit={handleBidSubmit}>

      {/* Load Details - Styled like Image 1 */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          mt:3,
          borderRadius: 2,
          border: "1px solid #e8f0fe",
          overflow: "hidden",
        }}
      >
        {/* Section Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2.5,
            py: 1.5,
            background: "#eef4fd",
            borderBottom: "1px solid #e0eaf8",
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1,
              bgcolor: "#1976d2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LocalShippingIcon sx={{ color: "#fff", fontSize: 16 }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#1976d2" }}>
            Load Information
          </Typography>
        </Box>

        {/* Info Rows */}
       <Box sx={{ px: 3, py: 2, background: "#fff" }}>
  {[
    {
      label: "Pickup",
      value:
        selectedLoad.origins?.length > 0
          ? `${selectedLoad.origins[0].city || ""}${selectedLoad.origins[0].state ? `, ${selectedLoad.origins[0].state}` : ""}`
          : selectedLoad.origin?.city || "-",
    },
    {
      label: "Drop",
      value:
        selectedLoad.destinations?.length > 0
          ? `${selectedLoad.destinations[0].city || ""}${selectedLoad.destinations[0].state ? `, ${selectedLoad.destinations[0].state}` : ""}`
          : selectedLoad.destination?.city || "-",
    },
    {
      label: "Weight",
      value: selectedLoad.weight ? `${selectedLoad.weight} Kg` : "-",
    },
    { label: "Commodity", value: selectedLoad.commodity || "-" },
    { label: "Vehicle Type", value: selectedLoad.vehicleType || "-" },
  ].map((row, i) => (
    <Box
      key={i}
      sx={{
        display: "flex",
        alignItems: "center",
        py: 1.2,
        borderBottom: i < 4 ? "1px solid #f0f4fa" : "none",
      }}
    >
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: "0.82rem",
          color: "black",
          width: 110,
          flexShrink: 0,
          // textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {row.label}
      </Typography>
      <Typography sx={{ color: "#c8d0dc", fontSize: "0.75rem", mx: 1.5 }}>
        ——
      </Typography>
      <Typography
        sx={{
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "gray",
        }}
      >
        {row.value}
      </Typography>
    </Box>
  ))}
</Box>
      </Paper>

      {/* Bid Form - Styled like Image 2 */}
      <Box sx={{ mt: 1 }}>

        {/* Section 1: Timing & Amount */}
        <Paper
          elevation={0}
          sx={{
            mb: 2.5,
            borderRadius: 2,
            border: "1px solid #e8f0fe",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2.5,
              py: 1.5,
              background: "#eef4fd", 
              borderBottom: "1px solid #e8f0fe",
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                bgcolor: "#e3f0fd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AccessTimeIcon sx={{ color: "#1976d2", fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#1976d2" }}>
              Bid Details
            </Typography>
          </Box>
          <Box sx={{ px: 2.5, py: 2.5 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Pickup ETA"
                  name="pickupETA"
                  type="datetime-local"
                  value={bidForm.pickupETA}
                  onChange={handleBidFormChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  error={!!bidErrors.pickupETA}
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Drop ETA"
                  name="dropETA"
                  type="datetime-local"
                  value={bidForm.dropETA}
                  onChange={handleBidFormChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  error={!!bidErrors.dropETA}
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Bid Amount"
                  name="bidAmount"
                  type="number"
                  value={bidForm.bidAmount}
                  onChange={handleBidFormChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  error={!!bidErrors.bidAmount}
                  sx={fieldSx}
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Section 2: Driver & Vehicle */}
        <Paper
          elevation={0}
          sx={{
            mb: 2.5,
            borderRadius: 2,
            border: "1px solid #e8f0fe",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2.5,
              py: 1.5,
              background: "#eef4fd",
              borderBottom: "1px solid #e8f0fe",
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                bgcolor: "#e3f0fd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PersonIcon sx={{ color: "#1976d2", fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#1976d2" }}>
              Driver & Vehicle
            </Typography>
          </Box>
          <Box sx={{ px: 2.5, py: 2.5 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Driver Name"
                  name="driverName"
                  value={bidForm.driverName}
                  onChange={handleBidFormChange}
                  fullWidth
                  required
                  error={!!bidErrors.driverName}
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Vehicle Number"
                  name="vehicleNumber"
                  value={bidForm.vehicleNumber}
                  onChange={handleBidFormChange}
                  fullWidth
                  required
                  error={!!bidErrors.vehicleNumber}
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Vehicle Type"
                  name="vehicleType"
                  value={bidForm.vehicleType}
                  onChange={handleBidFormChange}
                  fullWidth
                  required
                  error={!!bidErrors.vehicleType}
                  sx={fieldSx}
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Section 3: Message */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "1px solid #e8f0fe",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2.5,
              py: 1.5,
              background: "#eef4fd",
              borderBottom: "1px solid #e8f0fe",
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                bgcolor: "#e3f0fd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageIcon sx={{ color: "#1976d2", fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#1976d2" }}>
              Message
            </Typography>
          </Box>
          <Box sx={{ px: 2.5, py: 2.5, width: '100%' }}>
            <Grid container sx={{ width: '100%' }}>
              <Grid item xs={12} sx={{ width: '100%' }}>
                <TextField
                  label="Message"
                  name="message"
                  value={bidForm.message || ""}
                  onChange={handleBidFormChange}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Write a message for the shipper..."
                  error={!!bidErrors.message}
                  sx={{ ...fieldSx, width: '100%' }}
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>

      </Box>
    </Box>
  )}
</DialogContent>
        <DialogActions
          sx={{ p: 3, justifyContent: "right", gap: 1, background: "#fff" }}
        >
          <Button
            onClick={handleCloseBidModal}
            variant="outlined"
            sx={{
              borderRadius: 3,
              backgroundColor: "#ffff",
              color: "#d32f2f",
              textTransform: "none",
              px: 4,
              borderColor: "#d32f2f",
              "&:hover": {
                color: "#fff",
                backgroundColor: "#d32f2f",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBidSubmit}
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 3,
              textTransform: "none",
              px: 4,
              color: "#fff",
            }}
          >
            Submit Bid
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Modal */}
      <Dialog
        open={viewDetailsModalOpen}
        onClose={handleCloseViewDetailsModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: "75vh",
            background: "#ffffff",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2,
            pt: 2,
            px: 3,
            background: brand,
            color: headerTextColor,
            borderRadius: "8px 8px 0 0",
            minHeight: 64,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Receipt sx={{ fontSize: 28, color: "white" }} />
            <Typography variant="h5" fontWeight={600} color="white">
              Bid Details
            </Typography>
          </Box>
          <Button
            onClick={handleCloseViewDetailsModal}
            sx={{
              color: "white",
              minWidth: "auto",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 26, fontWeight: 700 }} />
          </Button>
        </DialogTitle>

        <DialogContent sx={{ pt: 2, overflowY: "auto", flex: 1 }}>
          {loadingDetails ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 4,
              }}
            >
              <Typography>Loading bid details...</Typography>
            </Box>
          ) : selectedBidDetails ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Basic Information Card */}
              <Paper
                elevation={0}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    background: "#e3f2fd",
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      background: "#1976d2",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                    }}
                  >
                    i
                  </Box>
                  <Typography variant="h6" fontWeight={700} color="#0d47a1">
                    Basic Information
                  </Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Table
                    size="small"
                    sx={{ "& td, & th": { border: 0, py: 1.2 } }}
                  >
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ width: 220, color: "text.secondary" }}>
                          Shipment Number
                        </TableCell>
                        <TableCell sx={{ width: 80, color: "#9e9e9e" }}>
                          -----
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {selectedBidDetails.shipmentNumber || "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: "text.secondary" }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ color: "#9e9e9e" }}>-----</TableCell>
                        <TableCell>
                          <Chip
                            label={selectedBidDetails.status || "Accepted"}
                            size="small"
                            sx={{
                              backgroundColor: "#dcfce7", // light green bg
                              "& .MuiChip-label": {
                                color: "#15803d", // dark green text
                                fontWeight: 600,
                                fontSize: 11,
                              },
                            }}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: "text.secondary" }}>
                          Pickup Date
                        </TableCell>
                        <TableCell sx={{ color: "#9e9e9e" }}>-----</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {selectedBidDetails.pickupDate
                            ? new Date(
                                selectedBidDetails.pickupDate,
                              ).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: "text.secondary" }}>
                          Delivery Date
                        </TableCell>
                        <TableCell sx={{ color: "#9e9e9e" }}>-----</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {selectedBidDetails.deliveryDate
                            ? new Date(
                                selectedBidDetails.deliveryDate,
                              ).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              </Paper>

              {/* Shipment Information Card */}
              <Paper
                elevation={0}
                sx={{
                  border: "1px solid #c8e6c9",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    background: "#e8f5e9",
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      background: "#2e7d32",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                    }}
                  >
                    📍
                  </Box>
                  <Typography variant="h6" fontWeight={700} color="#1b5e20">
                    Shipment Information
                  </Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Table
                    size="small"
                    sx={{ "& td, & th": { border: 0, py: 1.2 } }}
                  >
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ width: 220, color: "text.secondary" }}>
                          Pickup Location
                        </TableCell>
                        <TableCell sx={{ width: 80, color: "#9e9e9e" }}>
                          -----
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {resolvePickupLocation(selectedBidDetails)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: "text.secondary" }}>
                          Drop Location
                        </TableCell>
                        <TableCell sx={{ color: "#9e9e9e" }}>-----</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {resolveDropLocation(selectedBidDetails)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              </Paper>

              {/* Load Details Card */}
              {(selectedBidDetails.weight ||
                selectedBidDetails.commodity ||
                selectedBidDetails.vehicleType) && (
                <Paper
                  elevation={0}
                  sx={{
                    border: "1px solid #b2dfdb",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: 2,
                      py: 1.5,
                      background: "#e0f2f1",
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        background: "#00897b",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                      }}
                    >
                      📦
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="#00695c">
                      Load Details
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Table
                      size="small"
                      sx={{ "& td, & th": { border: 0, py: 1.2 } }}
                    >
                      <TableBody>
                        {selectedBidDetails.weight && (
                          <TableRow>
                            <TableCell
                              sx={{ width: 220, color: "text.secondary" }}
                            >
                              Weight
                            </TableCell>
                            <TableCell sx={{ width: 80, color: "#9e9e9e" }}>
                              -----
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {selectedBidDetails.weight} Kg
                            </TableCell>
                          </TableRow>
                        )}
                        {selectedBidDetails.commodity && (
                          <TableRow>
                            <TableCell sx={{ color: "text.secondary" }}>
                              Commodity
                            </TableCell>
                            <TableCell sx={{ color: "#9e9e9e" }}>
                              -----
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {selectedBidDetails.commodity}
                            </TableCell>
                          </TableRow>
                        )}
                        {selectedBidDetails.vehicleType && (
                          <TableRow>
                            <TableCell sx={{ color: "text.secondary" }}>
                              Vehicle Type
                            </TableCell>
                            <TableCell sx={{ color: "#9e9e9e" }}>
                              -----
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {selectedBidDetails.vehicleType}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>
              )}

              {/* Driver Information Card */}
              {(selectedBidDetails.driverName ||
                selectedBidDetails.driverPhone ||
                selectedBidDetails.vehicleNumber) && (
                <Paper
                  elevation={0}
                  sx={{
                    border: "1px solid #ce93d8",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: 2,
                      py: 1.5,
                      background: "#f3e5f5",
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        background: "#6a1b9a",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                      }}
                    >
                      🧑‍✈️
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="#4a148c">
                      Driver Information
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Table
                      size="small"
                      sx={{ "& td, & th": { border: 0, py: 1.2 } }}
                    >
                      <TableBody>
                        {selectedBidDetails.driverName && (
                          <TableRow>
                            <TableCell
                              sx={{ width: 220, color: "text.secondary" }}
                            >
                              Driver Name
                            </TableCell>
                            <TableCell sx={{ width: 80, color: "#9e9e9e" }}>
                              -----
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {selectedBidDetails.driverName}
                            </TableCell>
                          </TableRow>
                        )}
                        {selectedBidDetails.driverPhone && (
                          <TableRow>
                            <TableCell sx={{ color: "text.secondary" }}>
                              Driver Phone
                            </TableCell>
                            <TableCell sx={{ color: "#9e9e9e" }}>
                              -----
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {selectedBidDetails.driverPhone}
                            </TableCell>
                          </TableRow>
                        )}
                        {selectedBidDetails.vehicleNumber && (
                          <TableRow>
                            <TableCell sx={{ color: "text.secondary" }}>
                              Vehicle Number
                            </TableCell>
                            <TableCell sx={{ color: "#9e9e9e" }}>
                              -----
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {selectedBidDetails.vehicleNumber}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>
              )}

              {/* Negotiation History Card */}
              <Paper
                elevation={0}
                sx={{
                  border: "1px solid #90caf9",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    background: "#e3f2fd",
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      background: "#1976d2",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                    }}
                  >
                    💬
                  </Box>
                  <Typography variant="h6" fontWeight={700} color="#0d47a1">
                    Negotiation History
                  </Typography>
                </Box>
                <Box sx={{ p: 2, maxHeight: 300, overflowY: "auto" }}>
                  {negotiationHistory?.internalNegotiation?.history?.length >
                  0 ? (
                    negotiationHistory.internalNegotiation.history.map(
                      (msg, index) => (
                        <Box
                          key={index}
                          sx={{
                            mb: 1.5,
                            p: 1.5,
                            bgcolor: (msg.by || "")
                              .toLowerCase()
                              .includes("shipper")
                              ? "#f5f5f5"
                              : "#e3f2fd",
                            borderRadius: 2,
                            maxWidth: "90%",
                            ml: (msg.by || "").toLowerCase().includes("shipper")
                              ? 0
                              : "auto",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem", mb: 0.5 }}
                          >
                            {msg.by} • {new Date(msg.at).toLocaleString()}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: "pre-wrap" }}
                          >
                            {msg.message}
                          </Typography>
                        </Box>
                      ),
                    )
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "center", py: 2 }}
                    >
                      No negotiation history found.
                    </Typography>
                  )}
                </Box>
                <Box
                  sx={{
                    p: 2,
                    borderTop: "1px solid #e0e0e0",
                    display: "flex",
                    gap: 1,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type your message..."
                    value={negotiationMessage}
                    onChange={(e) => setNegotiationMessage(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSendNegotiation()
                    }
                  />
                 <Button
  variant="contained"
  onClick={handleSendNegotiation}
  disabled={negotiationLoading || !negotiationMessage.trim()}
  sx={{
    "& .MuiButton-root": { color: "#fff" },
    color: "#fff !important",
    "&.Mui-disabled": {
      color: "rgba(255,255,255,0.5) !important",
    },
  }}
>
  Send
</Button>
                </Box>
              </Paper>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 4,
              }}
            >
              <Typography>No details available</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Driver Modal */}
      <Dialog
        open={assignModalOpen}
        onClose={handleCloseAssignModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            overflow: "visible",
          },
        }}
      >
        {/* Header with gradient and icon */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
            p: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#fff",
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "4px",
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <PersonIcon sx={{ fontSize: 28, color: "#fff" }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#fff",
                  fontSize: "1.25rem",
                  mb: 0.3,
                }}
              >
                Assign Driver
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255, 255, 255, 0.95)", fontSize: "0.875rem" }}
              >
                Assign a driver to this load
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleCloseAssignModal}
            sx={{
              color: "#fff",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.25)",
              },
            }}
            aria-label="Close assign driver dialog"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 4, backgroundColor: "#fff" }}>
          <Box component="form" onSubmit={handleAssignSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
              <Typography
                variant="body2"
                sx={{
                  mb: 1.5,
                  fontWeight: 600,
                  color: (themeConfig.tokens?.text || "#333333"),
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                Driver Name <span style={{ color: "#ef4444" }}>*</span>
              </Typography>
              <Autocomplete
                options={drivers}
                getOptionLabel={(d) => d?.fullName || d?.name || d?.email || "Driver"}
                value={drivers.find((d) => d._id === assignForm.driverId) || null}
                onChange={(e, newVal) =>
                  setAssignForm((prev) => ({
                    ...prev,
                    driverId: newVal?._id || "",
                  }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search and select driver"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <Search sx={{ color: "#9ca3af", ml: 1, mr: -0.5, fontSize: 22 }} />
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      "& .MuiInputBase-root": {
                        borderRadius: 2.5,
                        backgroundColor: "#E3F2FD",
                        fontSize: "0.95rem",
                        transition: "all 0.2s",
                        "&:hover": {
                          backgroundColor: "#fff",
                          boxShadow: "0 2px 8px rgba(25, 118, 210, 0.15)",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#fff",
                          boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.1)",
                        },
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#BBDEFB",
                        borderWidth: "1.5px",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                      "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                        borderWidth: "2px",
                      },
                    }}
                  />
                )}
                ListboxProps={{ sx: { maxHeight: 240 } }}
              />
            </Box>

            <Box>
              <Typography
                variant="body2"
                sx={{
                  mb: 1.5,
                  fontWeight: 600,
                  color: (themeConfig.tokens?.text || "#333333"),
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                Vehicle No <span style={{ color: "#ef4444" }}>*</span>
              </Typography>
              <TextField
                name="vehicleNumber"
                value={assignForm.vehicleNumber}
                onChange={handleAssignFormChange}
                fullWidth
                placeholder="Enter vehicle number"
                InputProps={{
                  startAdornment: (
                    <Box sx={{ display: "flex", alignItems: "center", mr: 0.5, fontSize: "1.3rem" }}>
                      🚛
                    </Box>
                  ),
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    borderRadius: 2.5,
                    backgroundColor: "#E3F2FD",
                    fontSize: "0.95rem",
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor: "#fff",
                      boxShadow: "0 2px 8px rgba(25, 118, 210, 0.15)",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "#fff",
                      boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.1)",
                    },
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#BBDEFB",
                    borderWidth: "1.5px",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                    borderWidth: "2px",
                  },
                }}
              />
            </Box>

            <DialogActions
              sx={{
                px: 0,
                pb: 0,
                pt: 1,
                justifyContent: "flex-end",
                backgroundColor: "#fff",
                gap: 1,
                borderTop: "1px solid #f3f4f6",
              }}
            >
              <Button
                onClick={handleCloseAssignModal}
                variant="outlined"
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 4,
                  py: 1,
                  borderColor: "red",
                  color: "red",
                  fontSize: "0.95rem",
                  transition: "all 0.2s",
                  "&:hover": {
                    color:"white",
                    backgroundColor: "red",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                  color: "#fff",
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 4,
                  py: 1.2,
                  fontSize: "0.95rem",
                  boxShadow: "0 4px 14px rgba(25, 118, 210, 0.4)",
                  transition: "all 0.2s",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
                    boxShadow: "0 6px 20px rgba(25, 118, 210, 0.5)",
                    transform: "translateY(-2px)",
                  },
                  "&.Mui-disabled": {
                    background: "#e5e7eb",
                    color: "#9ca3af",
                    boxShadow: "none",
                  },
                }}
                disabled={!assignForm.driverId || !assignForm.vehicleNumber}
              >
                Assign
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
