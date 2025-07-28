import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Paper,
  Collapse,
  IconButton,
  Avatar,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import truckIconPng from "../../assets/Icons super admin/truck.png";

const truckIcon = new L.Icon({
  iconUrl: truckIconPng,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 6);
  }, [lat, lng]);
  return null;
}

export default function LiveTracker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [consignments, setConsignments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);

  const toggleExpand = (item) => {
    setExpandedId((prev) => (prev === item.id ? null : item.id));
    setSelectedShipment(item);
  };

  const fetchConsignments = async () => {
    try {
      const res = await axios.get(
        `https://vpl-liveproject-1.onrender.com/api/v1/load/shipment/${searchTerm.toUpperCase() || "SHP1806022"}`
      );
      if (res.data?.tracking) {
        const track = res.data.tracking;
        setConsignments([
          {
            id: track._id,
            number: track.shipmentNumber,
            location: `${track.load.origin.city}, ${track.load.origin.state} → ${track.load.destination.city}, ${track.load.destination.state}`,
            lat: track.currentLocation.lat,
            lng: track.currentLocation.lon,
            status: [
              {
                label: "Loading",
                name: track.driverName || "Driver",
                time: new Date(track.startedAt).toLocaleString(),
                done: true,
              },
              {
                label: "In-Transit",
                name: track.driverName || "Driver",
                time: new Date(track.currentLocation.updatedAt).toLocaleString(),
                done: track.status !== "loading",
              },
              {
                label: "Delivered",
                name: track.driverName || "Driver",
                time: new Date(track.load?.deliveryDate || Date.now()).toLocaleString(),
                done: track.status === "delivered",
              },
            ],
          },
        ]);
      } else setConsignments([]);
    } catch (err) {
      console.error("Error fetching data", err);
      setConsignments([]);
    }
  };

  useEffect(() => {
    fetchConsignments();
    const interval = setInterval(fetchConsignments, 10000);
    return () => clearInterval(interval);
  }, [searchTerm]);

  return (
    <Box sx={{ display: "flex", height: "93vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <Paper
        elevation={3}
        sx={{ width: 380, p: 2, borderRadius: "0 20px 20px 0", overflowY: "auto", zIndex: 1000 }}
      >
        <Typography variant="h6" fontWeight={600} mb={2}>Consignment</Typography>
        <TextField
          fullWidth
          placeholder="Search by Shipment Number..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2, borderRadius: "10px" }}
        />

        {consignments.map((item) => (
          <Paper
            key={item.id}
            sx={{ mb: 2, p: 2, backgroundColor: "#fafafa", borderRadius: 3, cursor: "pointer" }}
            onClick={() => toggleExpand(item)}
          >
            <Box display="flex" alignItems="center" gap={1}>
              {/* <Avatar src={boxIconPng} alt="box" sx={{ width: 36, height: 36 }} /> */}
              <Box sx={{display:"flex",background: "#AABBCC" , height:"45px", width:"45px", borderRadius:"50%",justifyContent:"center",alignItems:"center",textAlign:"center"}}>
              <Typography fontSize={32}>📦</Typography>
              </Box>

              <Box flexGrow={1}>
                <Typography fontWeight={700} fontSize={14}>{item.number}</Typography>
                <Typography fontSize={12} color="GrayText">{item.location}</Typography>
              </Box>
              <IconButton>{expandedId === item.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
            </Box>

            <Collapse in={expandedId === item.id}>
              <Box mt={2}>
                {item.status.map((step, index) => (
                  <Box key={index} display="flex" alignItems="flex-start" mb={2}>
                    <Box mt={0.5}>
                      {step.done ? (
                        <CheckCircleIcon sx={{ color: "green" }} fontSize="small" />
                      ) : index === 2 ? (
                        <LocationOnIcon sx={{ color: "gray" }} fontSize="small" />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ color: "gray" }} fontSize="small" />
                      )}
                    </Box>
                    <Box ml={1} borderLeft={index !== item.status.length - 1 ? "3px solid #16a34a" : "none"} pl={1}>
                      <Typography
                        fontWeight={600}
                        color={step.done && index !== 2 ? "#16a34a" : "text.primary"}
                        fontSize={14}
                      >
                        {step.label}
                      </Typography>
                      <Typography fontSize={13}>{step.name}</Typography>
                      <Typography fontSize={12} color="GrayText">{step.time}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Paper>
        ))}
      </Paper>

      {/* Map */}
      <Box flexGrow={1} position="relative">
        <MapContainer
          center={[39.8283, -98.5795]}
          zoom={4}
          scrollWheelZoom={true}
          className="leaflet-container"
          style={{ height: "93vh", width: "100%", zIndex: 1 }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {consignments.map((truck) => (
            <Marker key={truck.id} position={[truck.lat, truck.lng]} icon={truckIcon} />
          ))}
          {selectedShipment && <RecenterMap lat={selectedShipment.lat} lng={selectedShipment.lng} />}
        </MapContainer>
      </Box>
    </Box>
  );
}