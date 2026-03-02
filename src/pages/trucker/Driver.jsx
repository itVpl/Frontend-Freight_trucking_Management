import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { Download, Edit } from "@mui/icons-material";
import Close from "@mui/icons-material/Close";
import axios from "axios";
import { BASE_API_URL } from "../../apiConfig";
import { useThemeConfig } from "../../context/ThemeContext";

const Dashboard = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch drivers from API
  const [driverData, setDriverData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_API_URL}/api/v1/driver/my-drivers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        // Assuming response.data is an array of drivers
        setDriverData(
          Array.isArray(response.data)
            ? response.data
            : response.data.drivers || [],
        );
      } catch {
        setDriverData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "DOB",
      "Nationality",
      "Gender",
      "Phone No",
      "Email",
      "Address",
    ];
    const csvRows = [headers.join(",")];
    driverData.forEach((row) => {
      const values = [
        row.fullName,
        row.dob,
        row.nationality,
        row.gender,
        row.phone,
        row.email,
        row.address,
      ];
      csvRows.push(values.join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "driver_data.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { themeConfig } = useThemeConfig();
  const brand =
    themeConfig.header?.bg && themeConfig.header.bg !== "white"
      ? themeConfig.header.bg
      : themeConfig.tokens?.primary || "#1976d2";
  const headerTextColor = themeConfig.header?.text || "#ffffff";
  const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#f4f6f9",
    fontSize: "0.9rem",
    "& fieldset": { borderColor: "#dde3ea" },
    "&:hover fieldset": { borderColor: "#1976d2" },
    "&.Mui-focused fieldset": { borderColor: "#1976d2" },
    "&.Mui-focused": { backgroundColor: "#fff" },
  },
  "& .MuiInputLabel-root": {
    fontSize: "1rem",
    color: "gray",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#1976d2",
  },
};
  const [editingDriver, setEditingDriver] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    mcDot: "",
    phone: "",
    email: "",
    license: "",
    gender: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    address: "",
    password: "",
  });

  // State me image aur preview bhi add karo agar nahi hai
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cdlPreview, setCdlPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ open: false, type: "", message: "" });

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const filteredDrivers = driverData.filter((d) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return [
      d.fullName || d.name || "",
      d.mcDot || "",
      d.phone || "",
      d.email || "",
      d.driverLicense || "",
      d.country || "",
      d.city || "",
    ].some((v) => String(v).toLowerCase().includes(term));
  });
  const totalPages = Math.max(
    1,
    Math.ceil(filteredDrivers.length / rowsPerPage),
  );
  const clampedPage = Math.min(page, totalPages - 1);
  const pageStart = clampedPage * rowsPerPage;
  const pageEnd = Math.min(pageStart + rowsPerPage, filteredDrivers.length);
  const visibleDrivers = filteredDrivers.slice(pageStart, pageEnd);

  const getPageNumbers = () => {
    const total = totalPages;
    const current = clampedPage + 1;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [1];
    if (current > 4) pages.push("…");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 3) pages.push("…");
    pages.push(total);
    return pages;
  };

  const handleOpenEditModal = (driver) => {
    setEditingDriver(driver);
    setForm({
      fullName: driver.fullName || driver.name || "",
      mcDot: driver.mcDot || "",
      phone: driver.phone || "",
      email: driver.email || "",
      license: driver.driverLicense || "",
      gender: driver.gender || "",
      country: driver.country || "",
      state: driver.state || "",
      city: driver.city || "",
      zipCode: driver.zipCode || "",
      address: driver.fullAddress || "",
      password: "",
    });
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingDriver(null);
    setForm({
      fullName: "",
      mcDot: "",
      phone: "",
      email: "",
      license: "",
      gender: "",
      country: "",
      state: "",
      city: "",
      zipCode: "",
      address: "",
      password: "",
    });
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo" && files && files[0]) {
      setPhoto(files[0]);
      setPhotoPreview(URL.createObjectURL(files[0]));
    } else if (name === "cdl" && files && files[0]) {
      setForm({ ...form, [name]: files[0] });
      if (files[0].type.startsWith("image/")) {
        setCdlPreview(URL.createObjectURL(files[0]));
      } else {
        setCdlPreview(null);
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    // Required fields except photo and cdl
    const requiredFields = [
      "fullName",
      "mcDot",
      "phone",
      "email",
      "license",
      "gender",
      "country",
      "state",
      "city",
      "zipCode",
      "address",
      "password",
    ];
    requiredFields.forEach((field) => {
      if (!form[field]) newErrors[field] = true;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Prepare FormData for multipart/form-data
    const formData = new FormData();
    formData.append("fullName", form.fullName);
    formData.append("mcDot", form.mcDot);
    formData.append("phone", form.phone);
    formData.append("email", form.email);
    formData.append("driverLicense", form.license);
    formData.append("gender", form.gender);
    formData.append("country", form.country);
    formData.append("state", form.state);
    formData.append("city", form.city);
    formData.append("zipCode", form.zipCode);
    formData.append("fullAddress", form.address);
    formData.append("password", form.password);
    if (form.photo) formData.append("driverPhoto", form.photo);
    if (form.cdl) formData.append("cdlDocument", form.cdl);

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${BASE_API_URL}/api/v1/driver/register`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Do not set Content-Type, browser will set it automatically
        },
      });
      setAlert({
        open: true,
        type: "success",
        message: "Driver registered successfully!",
      });
      handleCloseModal();
      setForm({
        fullName: "",
        mcDot: "",
        phone: "",
        email: "",
        license: "",
        gender: "",
        country: "",
        state: "",
        city: "",
        zipCode: "",
        address: "",
        password: "",
        photo: null,
        cdl: null,
      });
      setPhoto(null);
      setPhotoPreview(null);
      setCdlPreview(null);
      // Refresh driver list
      setLoading(true);
      try {
        const response = await axios.get(
          `${BASE_API_URL}/api/v1/driver/my-drivers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setDriverData(
          Array.isArray(response.data)
            ? response.data
            : response.data.drivers || [],
        );
      } catch {
        setDriverData([]);
      } finally {
        setLoading(false);
      }
    } catch (err) {
      setAlert({
        open: true,
        type: "error",
        message: err.response?.data?.message || "Failed to register driver",
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    // Required fields except photo and cdl
    const requiredFields = [
      "fullName",
      "mcDot",
      "phone",
      "email",
      "license",
      "gender",
      "country",
      "state",
      "city",
      "zipCode",
      "address",
    ];
    requiredFields.forEach((field) => {
      if (!form[field]) newErrors[field] = true;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const token = localStorage.getItem("token");
      const editData = {
        fullName: form.fullName,
        mcDot: form.mcDot,
        phone: form.phone,
        email: form.email,
        driverLicense: form.license,
        gender: form.gender,
        country: form.country,
        state: form.state,
        city: form.city,
        zipCode: form.zipCode,
        fullAddress: form.address,
      };

      await axios.put(
        `${BASE_API_URL}/api/v1/driver/${editingDriver._id}`,
        editData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      setAlert({
        open: true,
        type: "success",
        message: "Driver updated successfully!",
      });
      handleCloseEditModal();

      // Refresh driver list
      setLoading(true);
      try {
        const response = await axios.get(
          `${BASE_API_URL}/api/v1/driver/my-drivers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setDriverData(
          Array.isArray(response.data)
            ? response.data
            : response.data.drivers || [],
        );
      } catch {
        setDriverData([]);
      } finally {
        setLoading(false);
      }
    } catch (err) {
      setAlert({
        open: true,
        type: "error",
        message: err.response?.data?.message || "Failed to update driver",
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <div className="mb-2 text-2xl font-semibold text-gray-700">
        Driver Details
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
              className="w-full h-12 rounded-md border border-gray-200 pl-10 pr-3 text-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={exportToCSV}
            className="h-11 px-6 rounded-md border border-blue-600 text-blue-600 text-base font-medium cursor-pointer hover:bg-blue-600 hover:text-white"
          >
            Export CSV
          </button>
          <button
            onClick={handleOpenModal}
            className="h-11 px-6 rounded-md bg-blue-600 text-white text-base font-medium cursor-pointer flex items-center gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Driver
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto p-4">
          <table className="min-w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-left bg-slate-100">
                <th className="px-4 py-3 text-base font-semibold text-gray-500 rounded-l-xl border-t border-b border-l border-gray-200">
                  Name
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                  MC/Dot No
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                  License No
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                  Gender
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                  Phone No
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                  Email
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                  Country
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                  State
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                  City
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                  Zip Code
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                  Address
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 rounded-r-xl border-t border-b border-r border-gray-200">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 text-sm text-slate-700 rounded-l-xl border-t border-b border-l border-gray-200">
                      Loading…
                    </td>
                    <td className="px-3 py-2 border-t border-b border-gray-200"></td>
                    <td className="px-3 py-2 border-t border-b border-gray-200"></td>
                    <td className="px-3 py-2 border-t border-b border-gray-200"></td>
                    <td className="px-3 py-2 border-t border-b border-gray-200"></td>
                    <td className="px-3 py-2 border-t border-b border-gray-200"></td>
                    <td className="px-3 py-2 border-t border-b border-gray-200"></td>
                    <td className="px-3 py-2 border-t border-b border-gray-200"></td>
                    <td className="px-3 py-2 border-t border-b border-gray-200"></td>
                    <td className="px-3 py-2 border-t border-b border-gray-200"></td>
                    <td className="px-3 py-2 border-t border-b border-gray-200"></td>
                    <td className="px-3 py-2 rounded-r-xl border-t border-b border-r border-gray-200"></td>
                  </tr>
                ))
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-sm text-slate-500"
                    colSpan={12}
                  >
                    No drivers found
                  </td>
                </tr>
              ) : (
                visibleDrivers.map((driver, i) => (
                  <tr key={driver._id || i} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-medium text-gray-700 truncate rounded-l-xl border-t border-b border-l border-gray-200">
                      {driver.fullName || driver.name || "-"}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                      {driver.mcDot || "-"}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
                      <div className="relative group max-w-[65px]">
                        <span className="block truncate">
                          {driver.driverLicense || "-"}
                        </span>
                        {driver.driverLicense && (
                          <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-sm px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap z-50">
                            {driver.driverLicense}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                      {driver.gender || "-"}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                      {driver.phone || "-"}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
                      <div className="relative group max-w-[80px]">
                        <span className="block truncate">
                          {driver.email || "-"}
                        </span>
                        {driver.email && (
                          <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-sm px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap z-50">
                            {driver.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                      {driver.country || "-"}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                      {driver.state || "-"}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                      {driver.city || "-"}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                      {driver.zipCode || "-"}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
                      <div className="relative group max-w-[80px]">
                        <span className="block truncate">
                          {driver.fullAddress || "-"}
                        </span>
                        {driver.fullAddress && (
                          <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-sm px-3 py-2 rounded-md shadow-lg z-50 whitespace-normal break-words max-w-xs">
                            {driver.fullAddress}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 rounded-r-xl border-t border-b border-r border-gray-200">
                      <button
                        onClick={() => handleOpenEditModal(driver)}
                        className="h-8 px-6 rounded-md border border-blue-600 text-blue-600 text-base font-medium cursor-pointer hover:bg-blue-600 hover:text-white"
                      >
                        Edit
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
          <span>{`Showing ${filteredDrivers.length === 0 ? 0 : pageStart + 1} to ${pageEnd} of ${filteredDrivers.length} drivers`}</span>
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
            onClick={() => setPage(Math.min(totalPages - 1, clampedPage + 1))}
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

      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { boxShadow: "none" } }}
      >
        <DialogTitle
          sx={{
            textAlign: "left",
            pb: 2,
            pt: 3,
            background: brand,
            color: headerTextColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h5" fontWeight={700} color="white">
            Add Driver
          </Typography>
          <IconButton aria-label="close" onClick={handleCloseModal} sx={{ color: "#ffffff" }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent
  sx={{
    pb: 4,
    pt: 3,
    maxHeight: "70vh",
    overflowY: "auto",
    background: "#fafafa",
  }}
>
  <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, px: 3 }}>
    
    {/* Personal Information */}
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        background: "white",
        mb: 3,
        border: "1px solid #e8edf2",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2.5,
          color: "#1976d2",
          fontWeight: 700,
          fontSize: "1.2rem",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box sx={{ width: 4, height: 22, background: "#1976d2", borderRadius: 1 }} />
        Personal Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Full Name"
            name="fullName"
            value={form.fullName || ""}
            onChange={handleFormChange}
            fullWidth
            error={!!errors.fullName}
            variant="outlined"
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="MC/DOT No"
            name="mcDot"
            value={form.mcDot || ""}
            onChange={handleFormChange}
            fullWidth
            error={!!errors.mcDot}
            variant="outlined"
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Phone Number"
            name="phone"
            value={form.phone || ""}
            onChange={handleFormChange}
            fullWidth
            error={!!errors.phone}
            variant="outlined"
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Email Address"
            name="email"
            value={form.email || ""}
            onChange={handleFormChange}
            fullWidth
            error={!!errors.email}
            variant="outlined"
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Driver License No"
            name="license"
            value={form.license || ""}
            onChange={handleFormChange}
            fullWidth
            error={!!errors.license}
            variant="outlined"
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
  <TextField
    select
    label="Gender"
    name="gender"
    value={form.gender || ""}
    onChange={handleFormChange}
    fullWidth
    error={!!errors.gender}
    variant="outlined"
    sx={{
      ...fieldSx,
      minWidth: 150,
    }}
  >
    <MenuItem value="Male">Male</MenuItem>
    <MenuItem value="Female">Female</MenuItem>
    <MenuItem value="Other">Other</MenuItem>
  </TextField>
</Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password || ""}
            onChange={handleFormChange}
            fullWidth
            error={!!errors.password}
            variant="outlined"
            sx={fieldSx}
          />
        </Grid>
      </Grid>
    </Paper>

    {/* Address Information */}
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        background: "white",
        mb: 3,
        border: "1px solid #e8edf2",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2.5,
          color: "#1976d2",
          fontWeight: 700,
          fontSize: "1.2rem",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box sx={{ width: 4, height: 22, background: "#1976d2", borderRadius: 1 }} />
        Address Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Country"
            name="country"
            value={form.country || ""}
            onChange={handleFormChange}
            fullWidth
            error={!!errors.country}
            variant="outlined"
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="State"
            name="state"
            value={form.state || ""}
            onChange={handleFormChange}
            fullWidth
            error={!!errors.state}
            variant="outlined"
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="City"
            name="city"
            value={form.city || ""}
            onChange={handleFormChange}
            fullWidth
            error={!!errors.city}
            variant="outlined"
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Zip Code"
            name="zipCode"
            value={form.zipCode || ""}
            onChange={handleFormChange}
            fullWidth
            error={!!errors.zipCode}
            variant="outlined"
            sx={fieldSx}
          />
        </Grid>
        
        <Grid item xs={12} sx={{ flexBasis: '100% !important', maxWidth: '100% !important' }}>
          <TextField
            label="Full Address"
            name="address"
            value={form.address || ""}
            onChange={handleFormChange}
            fullWidth
            multiline
            rows={3}
            error={!!errors.address}
            variant="outlined"
            sx={fieldSx}
          />
        </Grid>
      </Grid>
    </Paper>

    {/* Uploads */}
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        background: "white",
        mb: 3,
        border: "1px solid #e8edf2",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2.5,
          color: "#1976d2",
          fontWeight: 700,
          fontSize: "1.2rem",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box sx={{ width: 4, height: 22, background: "#1976d2", borderRadius: 1 }} />
        Uploads
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{
              borderRadius: "10px",
              minHeight: "52px",
              fontWeight: 500,
              justifyContent: "flex-start",
              textTransform: "none",
              background: "#f8fafc",
              borderColor: "#dde3ea",
              color: "#444",
              fontSize: "0.875rem",
              px: 2,
              "&:hover": {
                background: "#f0f4f8",
                borderColor: "#1976d2",
              },
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="20" height="20" fill="#1976d2">
                <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM5 5h14v14H5V5zm7 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-5 9.5V17h10v-.5l-3.5-4.5-2.5 3-1.5-2z" />
              </svg>
              {photo ? (typeof photo === "string" ? photo : photo.name) : "Upload Photo"}
            </span>
            <input type="file" accept="image/*" hidden name="photo" onChange={handleFormChange} />
          </Button>
          {photoPreview && (
            <Box mt={1}>
              <img src={photoPreview} alt="Preview" height={60} style={{ borderRadius: 8, maxWidth: "200px", objectFit: "cover" }} />
            </Box>
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{
              borderRadius: "10px",
              minHeight: "52px",
              fontWeight: 500,
              justifyContent: "flex-start",
              textTransform: "none",
              background: "#f8fafc",
              borderColor: "#dde3ea",
              color: "#444",
              fontSize: "0.875rem",
              px: 2,
              "&:hover": {
                background: "#f0f4f8",
                borderColor: "#1976d2",
              },
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="20" height="20" fill="#1976d2">
                <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM5 5h14v14H5V5zm7 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-5 9.5V17h10v-.5l-3.5-4.5-2.5 3-1.5-2z" />
              </svg>
              {form.cdl ? (typeof form.cdl === "string" ? form.cdl : form.cdl.name) : "Upload CDL"}
            </span>
            <input type="file" accept="image/*,application/pdf" hidden name="cdl" onChange={handleFormChange} />
          </Button>
          {cdlPreview ? (
            <Box mt={1}>
              <img src={cdlPreview} alt="CDL Preview" height={60} style={{ borderRadius: 8, maxWidth: "200px", objectFit: "cover" }} />
            </Box>
          ) : form.cdl ? (
            <Box mt={1}>
              <span style={{ fontSize: 13, color: "#1976d2", fontWeight: 500 }}>
                {typeof form.cdl === "string" ? form.cdl : form.cdl.name || "File Selected"}
              </span>
            </Box>
          ) : null}
        </Grid>
      </Grid>
    </Paper>

    <DialogActions sx={{ mt: 2, justifyContent: "flex-end", gap: 1, px: 0 }}>
      <Button
        onClick={handleCloseModal}
        variant="outlined"
        size="large"
        sx={{
          borderRadius: 3,
          textTransform: "none",
          px: 4,
          py: 1.1,
          fontWeight: 600,
          backgroundColor: "transparent",
          color: "#d32f2f",
          borderColor: "#d32f2f",
          "&:hover": {
            backgroundColor: "#d32f2f",
            borderColor: "#d32f2f",
            color: "white",
          },
        }}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="contained"
        size="large"
        sx={{
          borderRadius: 3,
          textTransform: "none",
          px: 4,
          py: 1.2,
          fontWeight: 600,
          color: "white",
          "&:hover": { filter: "brightness(1.15)" },
        }}
      >
        Submit
      </Button>
    </DialogActions>
  </Box>
</DialogContent>
      </Dialog>

      {/* Edit Driver Modal */}
      <Dialog
        open={editModalOpen}
        onClose={handleCloseEditModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "none",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
  sx={{
    textAlign: "left",
    pb: 2,
    pt: 3,
    background: brand,
    color: headerTextColor,
    position: "relative",
  }}
>
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start", // 👈 changed
      gap: 1,
    }}
  >
    <Edit sx={{ fontSize: 28, color: "white" }} />

    <Typography
      variant="h4"
      fontWeight={700}
      color="white"
    >
      Edit Driver Information
    </Typography>
  </Box>

  <Typography
    variant="body2"
    sx={{
      mt: 1,
      opacity: 0.9,
      color: "white",
      ml: 6, // 👈 changed
      textAlign: "left", // 👈 changed
    }}
  >
    Update driver details below
  </Typography>
</DialogTitle>

        <DialogContent
          sx={{
            pb: 4,
            pt: 3,
            maxHeight: "70vh",
            overflowY: "auto",
            background: "#fafafa",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#c1c1c1",
              borderRadius: "4px",
              "&:hover": {
                background: "#a8a8a8",
              },
            },
          }}
        >
          <Box
            component="form"
            onSubmit={handleEditSubmit}
            sx={{ mt: 2, px: 3 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                background: "white",
                mb: 3,
                boxShadow: "none",
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: "#1976d2",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 4,
                    height: 20,
                    background: "#1976d2",
                    borderRadius: 1,
                  }}
                ></Box>
                Personal Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    name="fullName"
                    value={form.fullName || ""}
                    onChange={handleFormChange}
                    fullWidth
                    error={!!errors.fullName}
                    variant="outlined"
                    sx={{
                      "& .MuiInputBase-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f8f9fa",
                        "&:hover": {
                          backgroundColor: "#f1f3f4",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "white",
                        },
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e0e0e0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="MC/DOT No"
                    name="mcDot"
                    value={form.mcDot || ""}
                    onChange={handleFormChange}
                    fullWidth
                    error={!!errors.mcDot}
                    variant="outlined"
                    sx={{
                      "& .MuiInputBase-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f8f9fa",
                        "&:hover": {
                          backgroundColor: "#f1f3f4",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "white",
                        },
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e0e0e0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number"
                    name="phone"
                    value={form.phone || ""}
                    onChange={handleFormChange}
                    fullWidth
                    error={!!errors.phone}
                    variant="outlined"
                    sx={{
                      "& .MuiInputBase-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f8f9fa",
                        "&:hover": {
                          backgroundColor: "#f1f3f4",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "white",
                        },
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e0e0e0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email Address"
                    name="email"
                    value={form.email || ""}
                    onChange={handleFormChange}
                    fullWidth
                    error={!!errors.email}
                    variant="outlined"
                    sx={{
                      "& .MuiInputBase-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f8f9fa",
                        "&:hover": {
                          backgroundColor: "#f1f3f4",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "white",
                        },
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e0e0e0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Driver License No"
                    name="license"
                    value={form.license || ""}
                    onChange={handleFormChange}
                    fullWidth
                    error={!!errors.license}
                    variant="outlined"
                    sx={{
                      "& .MuiInputBase-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f8f9fa",
                        "&:hover": {
                          backgroundColor: "#f1f3f4",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "white",
                        },
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e0e0e0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    label="Gender"
                    name="gender"
                    value={form.gender || ""}
                    onChange={handleFormChange}
                    error={!!errors.gender}
                    variant="outlined"
                    sx={{
                      "& .MuiInputBase-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f8f9fa",
                        "&:hover": {
                          backgroundColor: "#f1f3f4",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "white",
                        },
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e0e0e0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    }}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                background: "white",
                boxShadow: "none",
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: "#1976d2",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 4,
                    height: 20,
                    background: "#1976d2",
                    borderRadius: 1,
                  }}
                ></Box>
                Address Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Country"
                    name="country"
                    value={form.country || ""}
                    onChange={handleFormChange}
                    fullWidth
                    error={!!errors.country}
                    variant="outlined"
                    sx={{
                      "& .MuiInputBase-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f8f9fa",
                        "&:hover": {
                          backgroundColor: "#f1f3f4",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "white",
                        },
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e0e0e0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="State"
                    name="state"
                    value={form.state || ""}
                    onChange={handleFormChange}
                    fullWidth
                    error={!!errors.state}
                    variant="outlined"
                    sx={{
                      "& .MuiInputBase-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f8f9fa",
                        "&:hover": {
                          backgroundColor: "#f1f3f4",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "white",
                        },
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e0e0e0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="City"
                    name="city"
                    value={form.city || ""}
                    onChange={handleFormChange}
                    fullWidth
                    error={!!errors.city}
                    variant="outlined"
                    sx={{
                      "& .MuiInputBase-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f8f9fa",
                        "&:hover": {
                          backgroundColor: "#f1f3f4",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "white",
                        },
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e0e0e0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Zip Code"
                    name="zipCode"
                    value={form.zipCode || ""}
                    onChange={handleFormChange}
                    fullWidth
                    error={!!errors.zipCode}
                    variant="outlined"
                    sx={{
                      "& .MuiInputBase-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f8f9fa",
                        "&:hover": {
                          backgroundColor: "#f1f3f4",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "white",
                        },
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e0e0e0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    }}
                  />
                </Grid>
                 <Grid item xs={12} sx={{ flexBasis: '100% !important', maxWidth: '100% !important' }}>
                  <TextField
                    label="Full Address"
                    name="address"
                    value={form.address || ""}
                    onChange={handleFormChange}
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.address}
                    variant="outlined"
                    sx={{
                      "& .MuiInputBase-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f8f9fa",
                        "&:hover": {
                          backgroundColor: "#f1f3f4",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "white",
                        },
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e0e0e0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            <DialogActions
  sx={{
    mt: 2,
    justifyContent: "flex-end", // 👈 move to right
    gap: 1,
    px: 3,
  }}
>
  <Button
  onClick={handleCloseEditModal}
  variant="outlined"
  size="large"
  sx={{
    borderRadius: 3,
    textTransform: "none",
    px: 4,
    py: 1,
    fontWeight: 600,
    backgroundColor: "transparent",
    color: "#d32f2f",
    borderColor: "#d32f2f",
    "&:hover": {
      backgroundColor: "#d32f2f",
      borderColor: "#d32f2f",
      color: "white",
    },
  }}
>
  Cancel
</Button>

  <Button
  type="submit"
  variant="contained"
  size="large"
  sx={{
    borderRadius: 3,
    textTransform: "none",
    px: 4,
    py: 1.2,
    fontWeight: 600,
    color: "white",
    "&:hover": {
      filter: "brightness(1.15)",
    },
  }}
>
  Update Driver
</Button>
</DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.type}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
