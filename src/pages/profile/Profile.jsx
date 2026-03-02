import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Skeleton,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";
import {
  LocationOn,
  CalendarMonth,
  Person,
  Flag,
  Call,
  Email,
  Business,
  Assignment,
  CheckCircle,
  Pending,
  Cancel,
} from "@mui/icons-material";
import { BASE_API_URL } from "../../apiConfig";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, updateUserFromProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("company");
  // add 'useState' to your React import if not already there

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view profile");
          setLoading(false);
          return;
        }
        const isTrucker = user?.type === "trucker";
        const profileUrl = isTrucker
          ? `${BASE_API_URL}/api/v1/shipper_driver/trucker`
          : `${BASE_API_URL}/api/v1/shipper_driver/`;
        const response = await fetch(profileUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401 || response.status === 403) {
          setError("Session expired or access denied. Please log in again.");
          setLoading(false);
          return;
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          setUserData(result.data);
          // Merge profile permissions into auth so sidebar/route guards use them (trucker/shipper profile now returns isSubUser, permissions, etc.)
          const profilePayload = {
            ...result.data,
            ...(result.permissions != null && {
              permissions: result.permissions,
            }),
            ...(result.isSubUser != null && { isSubUser: result.isSubUser }),
            ...(result.subUserId != null && { subUserId: result.subUserId }),
            ...(result.displayName != null && {
              displayName: result.displayName,
            }),
            ...(result.displayEmail != null && {
              displayEmail: result.displayEmail,
            }),
          };
          if (
            profilePayload.permissions != null ||
            profilePayload.isSubUser != null
          ) {
            updateUserFromProfile(profilePayload);
          }
        } else {
          throw new Error(result.message || "No profile data found");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.type]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "linear-gradient(135deg, #10b981, #059669)";
      case "pending":
        return "linear-gradient(135deg, #f59e0b, #d97706)";
      case "rejected":
        return "linear-gradient(135deg, #ef4444, #dc2626)";
      default:
        return "linear-gradient(135deg, #9ca3af, #6b7280)";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "Approved";
      case "pending":
        return "Pending";
      case "rejected":
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <CheckCircle sx={{ color: "#fff !important", fontSize: 18 }} />;
      case "pending":
        return <AccessTime sx={{ color: "#fff !important", fontSize: 18 }} />;
      case "rejected":
        return <Cancel sx={{ color: "#fff !important", fontSize: 18 }} />;
      default:
        return <Help sx={{ color: "#fff !important", fontSize: 18 }} />;
    }
  };

  // Profile Skeleton Loading Component
  const ProfileSkeleton = () => (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Skeleton
              variant="circular"
              width={120}
              height={120}
              sx={{ mx: "auto", mb: 2 }}
            />
            <Skeleton
              variant="text"
              width={200}
              height={32}
              sx={{ mx: "auto", mb: 1 }}
            />
            <Skeleton
              variant="text"
              width={150}
              height={24}
              sx={{ mx: "auto", mb: 2 }}
            />
            <Skeleton
              variant="rectangular"
              width={100}
              height={26}
              sx={{ borderRadius: 1, mx: "auto" }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Skeleton variant="text" width={200} height={32} sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Grid item xs={12} sm={6} key={item}>
                  <Skeleton variant="text" width={120} height={20} />
                  <Skeleton variant="text" width={180} height={24} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">Error loading profile data: {error}</Alert>
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box p={2}>
        <Alert severity="warning">No user data available</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        p: 3,
      }}
    >
      {/* Hero Section */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          overflow: "hidden",
          background: "white",
        }}
      >
        {/* Cover Section */}
        <Box
          sx={{
            height: 220,
            background: "#1976d2",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Profile Avatar with gradient ring */}
          <Box
            sx={{
              position: "absolute",
              bottom: -70,
              width: 148,
              height: 148,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea, #06b6d4)",
              p: "4px",
              boxShadow: "0 8px 32px rgba(102,126,234,0.45)",
              "&::after": {
                content: '""',
                position: "absolute",
                inset: "3px",
                borderRadius: "50%",
                // border: '3px solid rgba(255,255,255,0.6)',
                pointerEvents: "none",
              },
            }}
          >
            <Avatar
              src={userData.docUpload || "/avatar.png"}
              alt={userData.compName}
              sx={{
                width: "100%",
                height: "100%",
                // border: '6px solid white',
                backgroundColor: "#e9eefc",
                color: "#7b61ff",
                fontSize: 48,
              }}
            />
          </Box>
        </Box>

        {/* Profile Info */}
        <CardContent sx={{ pt: 10, pb: 5 }}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            textAlign="center"
            gap={1.75}
          >
            <Typography
              variant="h3"
              fontWeight={700}
              color="text.primary"
              sx={{
                fontSize: { xs: "1.9rem", sm: "2.25rem" },
                lineHeight: 1.2,
              }}
            >
              {userData.compName || "Company Name"}
            </Typography>
            <Box
              display="flex"
              flexWrap="wrap"
              gap={1.25}
              justifyContent="center"
            >
              <Chip
                icon={<Person sx={{ color: "#fff" }} />}
                label={userData.userType === "trucker" ? "Trucker" : "Shipper"}
                sx={{
                  background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: "9999px",
                  px: 1.5,
                  boxShadow: "0 4px 12px rgba(6,182,212,0.35)",
                }}
              />
              <Chip
  icon={<CalendarMonth />}
  label={`Joined ${formatDate(userData.createdAt)}`}
  variant="outlined"
  sx={{
    background: "transparent",
    color: "black",
    fontWeight: 700,
    borderRadius: "9999px",
    px: 1.5,
    border: "1px solid gray",
    "& .MuiChip-icon": { color: "black" },
  }}
/>
<Chip
  icon={<LocationOn />}
  label={`${userData.city}, ${userData.state}`}
  variant="outlined"
  sx={{
    background: "transparent",
    color: "black",
    fontWeight: 700,
    borderRadius: "9999px",
    px: 1.5,
    border: "1px solid gray",
    "& .MuiChip-icon": { color: "black" },
  }}
/>
            </Box>
            <Chip
              icon={getStatusIcon(userData.status)}
              label={getStatusText(userData.status)}
              sx={{
                background: getStatusColor(userData.status),
                color: "#fff",
                fontWeight: 700,
                borderRadius: "9999px",
                px: 2,
                py: 1,
                fontSize: "0.95rem",
                boxShadow: (() => {
                  switch (userData.status?.toLowerCase()) {
                    case "approved":
                      return "0 4px 14px rgba(16,185,129,0.45)";
                    case "pending":
                      return "0 4px 14px rgba(245,158,11,0.45)";
                    case "rejected":
                      return "0 4px 14px rgba(239,68,68,0.45)";
                    default:
                      return "0 4px 14px rgba(0,0,0,0.15)";
                  }
                })(),
                "& .MuiChip-label": { color: "#fff" },
                "& .MuiChip-icon": { color: "#fff" },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Information Cards */}
      {/* Add this state at the top of your component */}
      {/* const [activeTab, setActiveTab] = useState('company'); */}

      <Box
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
          border: "1px solid #f0f0f0",
        }}
      >
        {/* Tab Headers */}
        <Box
          sx={{
            display: "flex",
            borderBottom: "1px solid #f0f0f0",
            overflowX: "auto",
          }}
        >
          {[
            {
              key: "company",
              label: "Company",
              icon: <Business sx={{ fontSize: 19 }} />,
              color: "#667eea",
            },
            {
              key: "contact",
              label: "Contact",
              icon: <Call sx={{ fontSize: 19 }} />,
              color: "#06b6d4",
            },
            {
              key: "location",
              label: "Location",
              icon: <LocationOn sx={{ fontSize: 19 }} />,
              color: "#f59e0b",
            },
            {
              key: "account",
              label: "Account",
              icon: <Person sx={{ fontSize: 19 }} />,
              color: "#10b981",
            },
          ].map(({ key, label, icon, color }) => {
            const isActive = activeTab === key;
            return (
              <Box
                key={key}
                onClick={() => setActiveTab(key)}
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  py: 2,
                  px: 1,
                  cursor: "pointer",
                  position: "relative",
                  color: isActive ? color : "#9ca3af",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "14px",
                  background: isActive ? `${color}08` : "transparent",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                  "&:hover": { color: color, background: `${color}08` },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    borderRadius: "3px 3px 0 0",
                    background: isActive ? color : "transparent",
                    transition: "all 0.2s ease",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "8px",
                    background: isActive ? `${color}18` : "rgba(0,0,0,0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isActive ? color : "#9ca3af",
                    transition: "all 0.2s ease",
                  }}
                >
                  {icon}
                </Box>
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: "inherit",
                    color: "inherit",
                  }}
                >
                  {label}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {/* Company Tab */}
          {activeTab === "company" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                {
                  icon: <Business sx={{ fontSize: 18, color: "#667eea" }} />,
                  label: "Company Name",
                  value: userData.compName,
                  color: "#667eea",
                },
                {
                  icon: <Assignment sx={{ fontSize: 18, color: "#667eea" }} />,
                  label: "MC/DOT Number",
                  value: userData.mc_dot_no,
                  color: "#667eea",
                },
              ].map(({ icon, label, value, color }) => (
                <Box
                  key={label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    py: 2,
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      background: `${color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: "#6b7280",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        fontSize: "0.78rem",
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      color="text.primary"
                      sx={{ fontSize: { xs: "1.02rem", sm: "1.08rem" } }}
                    >
                      {value || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {/* Contact Tab */}
          {activeTab === "contact" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                {
                  icon: <Call sx={{ fontSize: 18, color: "#06b6d4" }} />,
                  label: "Phone Number",
                  value: userData.phoneNo,
                  color: "#06b6d4",
                },
                {
                  icon: <Email sx={{ fontSize: 18, color: "#06b6d4" }} />,
                  label: "Email Address",
                  value: userData.email,
                  color: "#06b6d4",
                },
              ].map(({ icon, label, value, color }) => (
                <Box
                  key={label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    py: 2,
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      background: `${color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: "#6b7280",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        fontSize: "0.78rem",
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      color="text.primary"
                      sx={{ fontSize: { xs: "1.02rem", sm: "1.08rem" } }}
                    >
                      {value || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {/* Location Tab */}
          {activeTab === "location" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                {
                  icon: <LocationOn sx={{ fontSize: 18, color: "#f59e0b" }} />,
                  label: "Address",
                  value: userData.compAdd,
                  color: "#f59e0b",
                },
                {
                  icon: <Flag sx={{ fontSize: 18, color: "#f59e0b" }} />,
                  label: "Country",
                  value: userData.country,
                  color: "#f59e0b",
                },
                {
                  icon: <LocationOn sx={{ fontSize: 18, color: "#f59e0b" }} />,
                  label: "State",
                  value: userData.state,
                  color: "#f59e0b",
                },
                {
                  icon: <LocationOn sx={{ fontSize: 18, color: "#f59e0b" }} />,
                  label: "City",
                  value: userData.city,
                  color: "#f59e0b",
                },
                {
                  icon: <LocationOn sx={{ fontSize: 18, color: "#f59e0b" }} />,
                  label: "Zip Code",
                  value: userData.zipcode,
                  color: "#f59e0b",
                },
              ].map(({ icon, label, value, color }) => (
                <Box
                  key={label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    py: 2,
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      background: `${color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: "#6b7280",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        fontSize: "0.78rem",
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      color="text.primary"
                      sx={{ fontSize: { xs: "1.02rem", sm: "1.08rem" } }}
                    >
                      {value || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                {
                  icon: <Person sx={{ fontSize: 18, color: "#10b981" }} />,
                  label: "User Type",
                  value:
                    userData.userType === "trucker" ? "Trucker" : "Shipper",
                  color: "#10b981",
                },
                {
                  icon: (
                    <CalendarMonth sx={{ fontSize: 18, color: "#10b981" }} />
                  ),
                  label: "Account Created",
                  value: formatDate(userData.createdAt),
                  color: "#10b981",
                },
                {
                  icon: (
                    <CalendarMonth sx={{ fontSize: 18, color: "#10b981" }} />
                  ),
                  label: "Last Updated",
                  value: formatDate(userData.updatedAt),
                  color: "#10b981",
                },
              ].map(({ icon, label, value, color }) => (
                <Box
                  key={label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    py: 2,
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      background: `${color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: "#6b7280",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        fontSize: "0.78rem",
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      color="text.primary"
                      sx={{ fontSize: { xs: "1.02rem", sm: "1.08rem" } }}
                    >
                      {value || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {/* Status Badge row */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "12px",
                    background: "rgba(16,185,129,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Person sx={{ fontSize: 18, color: "#10b981" }} />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: "#6b7280",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      display: "block",
                      mb: 0.5,
                      fontSize: "0.78rem",
                    }}
                  >
                    Account Status
                  </Typography>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.8,
                      background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
                      color: "#065f46",
                      fontWeight: 700,
                      fontSize: "13px",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "20px",
                      border: "1px solid #6ee7b7",
                    }}
                  >
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#10b981",
                      }}
                    />
                    {getStatusText(userData.status)}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;
