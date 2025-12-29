// LoadCalculator.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, Edges, RoundedBox, ContactShadows } from "@react-three/drei";
import {
  Box,
  Typography,
  Grid,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  Button,
  LinearProgress,
  Stack,
  Paper,
  Divider,
  Tooltip,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab, Switch, InputAdornment, ToggleButton, ToggleButtonGroup
} from "@mui/material";

// ✨ UI polish extras
import { ThemeProvider, createTheme, alpha } from "@mui/material/styles";
import LocalShippingIcon from "@mui/icons-material/LocalShipping"; // Containers & Trucks
import ViewInArIcon from "@mui/icons-material/ViewInAr";           // Stuffing Result (3D)

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import DeleteIcon from "@mui/icons-material/Delete";
// --------------------------- Container Icons ---------------------------
import s20 from "../assets/containerimg/s20.svg"; // 20ft
import s40 from "../assets/containerimg/s40.svg"; // 40ft
import hc40 from "../assets/containerimg/hc40.svg"; // 40ftHC
import hc45 from "../assets/containerimg/hc45.svg"; // 45ftHC
import ot20 from "../assets/containerimg/ot20.svg"; // 20ftOT
import ot40 from "../assets/containerimg/ot40.svg"; // 40ftOT
import f20 from "../assets/containerimg/f20.svg"; // 20ftFR
import f40 from "../assets/containerimg/f40.svg"; // 40ftFR
import fc20 from "../assets/containerimg/fc20.svg"; // 20ftFR-Collapsible
import fc40 from "../assets/containerimg/fc40.svg"; // 40ftFR-Collapsible
import p20 from "../assets/containerimg/p20.svg"; // 20ftPlatform
import p40 from "../assets/containerimg/p40.svg"; // 40ftPlatform
import r20 from "../assets/containerimg/r20.svg"; // 20ftReefer
import r40 from "../assets/containerimg/r40.svg"; // 40ftReefer 
import b20 from "../assets/containerimg/b20.svg"; // 20ftBulk
import t20 from "../assets/containerimg/t20.svg";
import d20 from "../assets/containerimg/d20.jpg";
import f48 from "../assets/containerimg/48flat.jpg";
import car141 from "../assets/containerimg/car141.png";
import step48 from "../assets/containerimg/48step.webp";
import ra20 from "../assets/containerimg/ra20.png";  // 20ftTank

const containerImages = {
  "20ft": s20,
  "40ft": s40,
  "40ftHC": hc40,
  "45ftHC": hc45,
  "20ftOT": ot20,
  "40ftOT": ot40,
  "20ftFR": f20, // 20ftFR
  "40ftFR": f40, // 40ftFR
  "20ftFR-Collapsible": fc20, // 20ftFR-Collapsible
  "40ftFR-Collapsible": fc40, // 40ftFR-Collapsible
  "20ftPlatform": p20, // 20ftPlatform
  "40ftPlatform": p40, // 40ftPlatform
  "20ftReefer": r20, // 20ftReefer
  "40ftReefer": r40, // 40ftReefergg
  "20ftBulk": b20, // 20ftBulk
  "20ftTank": t20, // 20ftTank

};

const truckImages = {
  "DryVan-20ft": d20,
  "Reefer-20ft": ra20,
  "StepDeck-48ft": step48,
  "Flatbed-48ft": f48,
  "CargoVan-14ft": car141,
  // ...
};

// ---------- Cargo icons ----------
import Inventory2Icon from "@mui/icons-material/Inventory2"; // Boxs
import GrainIcon from "@mui/icons-material/Grain";            // Sacks
import AllInboxIcon from "@mui/icons-material/AllInbox";      // Bigbags
import SportsBarIcon from "@mui/icons-material/SportsBar";    // Barrels
import DonutLargeIcon from "@mui/icons-material/DonutLarge";  // Roll
import PlumbingIcon from "@mui/icons-material/Plumbing";      // Pipe
import TerrainIcon from "@mui/icons-material/Terrain";        // Bulk
import OpacityIcon from "@mui/icons-material/Opacity";        // Liquid
import CategoryIcon from "@mui/icons-material/Category";      // default

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import ReplayIcon from "@mui/icons-material/Replay";
import SlowMotionVideoIcon from "@mui/icons-material/SlowMotionVideo";



const cargoIcon = (t, sx = { fontSize: 20, color: "action.active" }) => {
  const k = (t || "").toLowerCase();
  switch (k) {
    case "box": return <Inventory2Icon sx={sx} />;
    case "sacks": return <GrainIcon sx={sx} />;
    case "bigbags": return <AllInboxIcon sx={sx} />;
    case "barrels": return <SportsBarIcon sx={sx} />;
    case "roll": return <DonutLargeIcon sx={sx} />;
    case "pipe": return <PlumbingIcon sx={sx} />;
    case "bulk": return <TerrainIcon sx={sx} />;
    case "liquid": return <OpacityIcon sx={sx} />;
    default: return <CategoryIcon sx={sx} />;
  }
};

// --------------------------- Container Specs (meters) ---------------------------
const CONTAINER_SIZES = {
  "20ft": { length: 5.89, width: 2.35, height: 2.39, maxWeight: 28000 },
  "40ft": { length: 12.03, width: 2.35, height: 2.39, maxWeight: 28800 },
  "40ftHC": { length: 12.03, width: 2.35, height: 2.69, maxWeight: 28800 },
  "45ftHC": { length: 13.56, width: 2.35, height: 2.69, maxWeight: 30480 },
  "20ftOT": { length: 5.89, width: 2.35, height: 2.39, maxWeight: 28000 },
  "40ftOT": { length: 12.03, width: 2.35, height: 2.39, maxWeight: 28800 },
  "20ftFR": { length: 6.06, width: 2.44, height: 2.23, maxWeight: 31000 },
  "40ftFR": { length: 12.19, width: 2.44, height: 2.23, maxWeight: 45000 },
  "20ftFR-Collapsible": { length: 6.06, width: 2.44, height: 2.23, maxWeight: 31000 },
  "40ftFR-Collapsible": { length: 12.19, width: 2.44, height: 2.23, maxWeight: 45000 },
  "20ftPlatform": { length: 6.06, width: 2.44, height: 0.37, maxWeight: 31000 },
  "40ftPlatform": { length: 12.19, width: 2.44, height: 0.65, maxWeight: 45000 },
  "20ftReefer": { length: 5.45, width: 2.29, height: 2.26, maxWeight: 27700 },
  "40ftReefer": { length: 11.58, width: 2.29, height: 2.26, maxWeight: 27600 },
  "20ftTank": { length: 6.06, width: 2.44, height: 2.59, maxWeight: 34500 },
  "20ftBulk": { length: 5.89, width: 2.35, height: 2.38, maxWeight: 28000 },
  Custom: { length: 6, width: 2.5, height: 2.5, maxWeight: 30000 },
};

// ✅ Cargo list
const CARGO_TYPES = ["Box", "Sacks", "Bigbags", "Barrels", "Roll", "Pipe", "Bulk", "Liquid"];
const CARGO_COLORS = {
  Bigbags: "#3f51b5",
  Sacks: "#e91e63",
  Box: "#4caf50",
  Barrels: "#9c27b0",
  Roll: "#2196f3",
  Pipe: "#ff9800",
  Bulk: "#795548",
  Liquid: "#00bcd4",
  Other: "#607d8b",
};
// ✅ Allowed cargo per container
const CONTAINER_CARGO_MAP = {
  "20ft": ["Box", "Sacks", "Bigbags", "Barrels"],
  "40ft": ["Box", "Sacks", "Bigbags", "Barrels"],
  "40ftHC": ["Box", "Sacks", "Bigbags"],
  "45ftHC": ["Box", "Sacks", "Bigbags"],
  "20ftOT": ["Box", "Bigbags", "Barrels"],
  "40ftOT": ["Box", "Bigbags", "Barrels"],
  "20ftFR": ["Roll", "Pipe"],
  "40ftFR": ["Roll", "Pipe"],
  "20ftFR-Collapsible": ["Roll", "Pipe"],
  "40ftFR-Collapsible": ["Roll", "Pipe"],
  "20ftPlatform": ["Pipe", "Roll", "Bulk"],
  "40ftPlatform": ["Pipe", "Roll", "Bulk"],
  "20ftReefer": ["Box", "Sacks", "Bigbags", "Barrels"],
  "40ftReefer": ["Box", "Sacks", "Bigbags", "Barrels"],
  "20ftTank": ["Liquid"],        // Liquid only
  "20ftBulk": ["Bulk"],
  "Custom": ["Box", "Sacks", "Bigbags", "Barrels", "Roll", "Pipe", "Bulk", "Liquid"],
};
// ====================== Pallet Presets (meters) ======================
const PALLET_PRESETS = {
  "Europe Pallets": { length: 1.200, width: 0.800, baseHeight: 0.144, maxHeight: 2.000, maxWeight: 1500, color: "#8D6E63" },
  "Europe 1/2 Pallets": { length: 0.800, width: 0.600, baseHeight: 0.144, maxHeight: 1.800, maxWeight: 750, color: "#8D6E63" },
  "Europe Plastic Pallets": { length: 1.200, width: 0.800, baseHeight: 0.160, maxHeight: 2.000, maxWeight: 1500, color: "#455A64" },
  "US Pallets": { length: 1.219, width: 1.016, baseHeight: 0.146, maxHeight: 2.000, maxWeight: 1500, color: "#8D6E63" },
  "Custom Pallets": { length: 1.200, width: 0.800, baseHeight: 0.144, maxHeight: 2.000, maxWeight: 1500, color: "#8D6E63" },
};

// Palletization kin types par allow hai:
const PALLET_ALLOWED_CARGO = new Set(["Box", "Sacks", "Bigbags", "Barrels"]);

// ------------- Tank capacity (Liters) map -------------
const TANK_CAPACITY_L = {
  "20ftTank": 24000, // default nominal ~24k L
};

// --------------------------- Truck Specs (meters) ---------------------------
// ✅ NEW: Flatbed-48ft added
const TRUCK_SPECS = {
  "DryVan-20ft": { length: 6.10, width: 2.35, height: 2.40, maxWeight: 10000 },
  "Reefer-20ft": { length: 6.10, width: 2.30, height: 2.20, maxWeight: 9000 },
  "StepDeck-48ft": { length: 14.60, width: 2.44, height: 2.00, maxWeight: 25000 }, // open, low deck
  "Flatbed-48ft": { length: 14.60, width: 2.44, height: 1.60, maxWeight: 25000 }, // open flat deck (visual stake height)
  "CargoVan-14ft": { length: 4.20, width: 1.80, height: 1.75, maxWeight: 1500 },
};

// Allowed cargo per truck
const TRUCK_CARGO_MAP = {
  "DryVan-20ft": ["Box", "Sacks", "Bigbags", "Barrels"],
  "Reefer-20ft": ["Box", "Sacks", "Bigbags", "Barrels"],
  "StepDeck-48ft": ["Roll", "Pipe", "Bigbags", "Box"],
  "Flatbed-48ft": ["Roll", "Pipe", "Bigbags", "Box"], // ✅
  "CargoVan-14ft": ["Box", "Sacks", "Barrels"],
};

// Truck notes
const TRUCK_NOTES = {
  "DryVan-20ft": "Dry Van: enclosed box body.",
  "Reefer-20ft": "Reefer: insulated, temperature-controlled.",
  "StepDeck-48ft": "Step-Deck: low open deck for tall machinery (lashing needed).",
  "Flatbed-48ft": "Flatbed: open platform for oversize/irregular loads; lashing & permits may be required.",
  "CargoVan-14ft": "LCV/Cargo Van: city deliveries, small loads.",
};

// --------------------------- Unit Helpers & Parser ---------------------------
function parseToMeters(input, fallbackUnit = "mm") {
  if (input == null || String(input).trim() === "") return NaN;
  const raw = String(input).trim().toLowerCase();

  // 1) ft + optional in  -> "5ft 10in", "5'10\"", "5'"
  const m1 = raw.match(/^(\d+)\s*(?:ft|')\s*(?:(\d+(?:\.\d+)?)\s*(?:in|")\s*)?$/);
  if (m1) {
    const ft = parseFloat(m1[1]) || 0;
    const inch = parseFloat(m1[2] || "0");
    return ft * 0.3048 + inch * 0.0254;
  }

  // 2) inches-only -> `70"`, `70in`
  const m2 = raw.match(/^(\d+(?:\.\d+)?)\s*(?:in|")$/);
  if (m2) return parseFloat(m2[1]) * 0.0254;

  // 3) generic number + unit
  const m3 = raw.match(/^(-?\d+(?:\.\d+)?)(\s*(mm|cm|m|inch|in|ft|'))?$/);
  if (!m3) return NaN;
  const val = parseFloat(m3[1]);
  let unit = (m3[3] || "").toLowerCase();
  if (unit === "'") unit = "ft";           // <- important
  switch (unit || fallbackUnit) {
    case "mm": return val / 1000;
    case "cm": return val / 100;
    case "m": return val;
    case "inch":
    case "in": return val * 0.0254;
    case "ft": return val * 0.3048;
    default: return NaN;
  }
}

function toUI(m, unit) {
  switch (unit) {
    case "mm": return Math.round(m * 1000).toString();
    case "cm": return Math.round(m * 100).toString();
    case "m": return (m ?? 0).toFixed(3);
    case "inch": return ((m ?? 0) / 0.0254).toFixed(2);
    case "ft": return ((m ?? 0) / 0.3048).toFixed(2);
    default: return String(m ?? "");
  }
}
function palletFieldToMeters(val, u) { return parseToMeters(val, u); }
function palletMetersToUI(m, u) { return toUI(m, u); }

const unitShort = (u) => (u === "inch" ? "in" : u === "ft" ? "ft" : u);
const fmt2 = (n) => Number(n).toFixed(2);
const LB_TO_KG = 0.45359237;
const toKg = (v, u) => {
  const x = Number(v) || 0;
  return u === "lb" ? x * LB_TO_KG : x;
};
const fromKg = (kg, u) => (u === "lb" ? kg / LB_TO_KG : kg);

const exampleByUnit = (u) => {
  switch (u) {
    case "mm": return "e.g., 1200";
    case "cm": return "e.g., 120";
    case "m": return "e.g., 1.2";
    case "inch": return 'e.g., 47.24 or 4\'0"';
    case "ft": return 'e.g., 3.94 or 3\'11"';
    default: return "e.g., 1200";
  }
};

// --------------------------- 3D Renderer ---------------------------
const ContainerBox = ({ size, type }) => {
  const { length, width, height } = size;

  // Step-Deck & Flatbed -> open deck
  if (type.includes("StepDeck") || type.includes("Flatbed")) {
    return (
      <>
        <mesh position={[0, -height / 2 + 0.05, 0]}>
          <boxGeometry args={[length, 0.12, width]} />
          <meshStandardMaterial color="#1976d2" transparent opacity={0.25} />
          <Edges scale={1.001} threshold={15} color="#1976d2" />
        </mesh>
        {/* optional posts for visuals */}
        <mesh position={[-length / 2 + 0.05, 0, 0]}>
          <boxGeometry args={[0.08, height, width]} />
          <meshStandardMaterial color="#1976d2" transparent opacity={0.08} />
          <Edges scale={1.001} threshold={15} color="#1976d2" />
        </mesh>
        <mesh position={[length / 2 - 0.05, 0, 0]}>
          <boxGeometry args={[0.08, height, width]} />
          <meshStandardMaterial color="#1976d2" transparent opacity={0.08} />
          <Edges scale={1.001} threshold={15} color="#1976d2" />
        </mesh>
      </>
    );
  }

  if (type.includes("Platform")) {
    return (
      <mesh position={[0, -height / 2 + 0.05, 0]}>
        <boxGeometry args={[length, 0.2, width]} />
        <meshStandardMaterial color="#1976d2" transparent opacity={0.3} />
        <Edges scale={1.001} threshold={15} color="#1976d2" />
      </mesh>
    );
  }
  if (type.includes("FR")) {
    return (
      <>
        <mesh position={[0, -height / 2 + 0.05, 0]}>
          <boxGeometry args={[length, 0.1, width]} />
          <meshStandardMaterial color="#1976d2" transparent opacity={0.2} />
          <Edges scale={1.001} threshold={15} color="#1976d2" />
        </mesh>
        <mesh position={[-length / 2 + 0.05, 0, 0]}>
          <boxGeometry args={[0.1, height, width]} />
          <meshStandardMaterial color="#1976d2" transparent opacity={0.1} />
          <Edges scale={1.001} threshold={15} color="#1976d2" />
        </mesh>
        <mesh position={[length / 2 - 0.05, 0, 0]}>
          <boxGeometry args={[0.1, height, width]} />
          <meshStandardMaterial color="#1976d2" transparent opacity={0.1} />
          <Edges scale={1.001} threshold={15} color="#1976d2" />
        </mesh>
      </>
    );
  }
  if (type.includes("Tank")) {
    return (
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[width / 3, width / 3, length, 32]} />
        <meshStandardMaterial color="#1976d2" transparent opacity={0.2} />
        <Edges scale={1.001} threshold={15} color="#1976d2" />
      </mesh>
    );
  }
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[length, height, width]} />
      <meshStandardMaterial transparent opacity={0.02} color="#ffffff" />
      <Edges scale={1.001} threshold={15} color="#1976d2" />
    </mesh>
  );
};


// --- Hollow tube (pipes / paper-roll core) ---
function HollowTube({ position, length, outerR, thickness, rotation = [0, 0, 0], color }) {
  const innerR = Math.max(outerR - thickness, outerR * 0.85);
  const EPS = 0.0006; // tiny inset to avoid z-fighting/line

  return (
    <group position={position} rotation={rotation}>
      {/* OUTER WALL */}
      <mesh>
        <cylinderGeometry args={[outerR, outerR, length, 32, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.1} />
        {/* ✅ Edges only on outer wall */}
        <Edges scale={1.002} threshold={15} color="#ffffff" />
      </mesh>

      {/* INNER WALL (backside) */}
      <mesh>
        <cylinderGeometry args={[innerR, innerR, length + EPS, 32, 1, true]} />
        <meshStandardMaterial
          color={color}
          side={THREE.BackSide}
          roughness={0.55}
          metalness={0.1}
        />
      </mesh>

      {/* END RINGS — slightly inside + slightly smaller so no “line” */}
      <mesh position={[0, length / 2 - EPS, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[innerR + EPS, outerR - EPS, 32]} />
        <meshStandardMaterial
          color={color}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, -length / 2 + EPS, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[innerR + EPS, outerR - EPS, 32]} />
        <meshStandardMaterial
          color={color}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}


// --- Bulged steel drum (barrel) ---
function BulgedBarrel({ position, height, diameter, color }) {
  const radial = 28, hSeg = 16;
  const topR = Math.max(0.01, (diameter / 2) * 0.95);
  const geom = React.useMemo(() => {
    const g = new THREE.CylinderGeometry(topR, topR, height, radial, hSeg, false);
    const pos = g.attributes.position, halfH = height / 2;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i), t = (y + halfH) / height;      // 0..1
      const k = 1 + 0.14 * Math.sin(Math.PI * t);           // mid bulge
      pos.setX(i, pos.getX(i) * k);
      pos.setZ(i, pos.getZ(i) * k);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [height, diameter]);

  return (
    <mesh position={position} geometry={geom}>
      <meshStandardMaterial color={color} roughness={0.45} metalness={0.12} />
      <Edges scale={1.001} threshold={15} color="#ffffff" />
    </mesh>
  );
}

// --- Soft box (sacks/bigbags body) ---
function SoftBox({ position, dims, color }) {
  const [L, H, W] = dims;
  const geom = React.useMemo(() => {
    const g = new THREE.BoxGeometry(L, H, W, 6, 6, 6);
    const pos = g.attributes.position;
    let seed = Math.floor((L * 97 + H * 37 + W * 13) * 1000) | 0;
    const rand = () => { seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; };
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const nx = (rand() - 0.5) * 0.02 * Math.min(L, W);
      const ny = (rand() - 0.5) * 0.03 * H - 0.01 * (y / (H / 2));
      const nz = (rand() - 0.5) * 0.02 * Math.min(L, W);
      pos.setXYZ(i, x + nx, y + ny, z + nz);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [L, H, W]);

  return (
    <mesh position={position} geometry={geom}>
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.0} />
      <Edges scale={1.002} threshold={15} color="#ffffff" />
    </mesh>
  );
}


const OUTLINE_COLOR = "#ffffff";
const OUTLINE_SCALE = 1.002;
const VISUAL_GAP = 0.01;   // ~1 cm visual gap
// Rolls/Pipes ko kis axis par align karna hai:
// 'x' = container ki length ke along  ✅ (aksar ye hi chahiye)
// 'z' = container ki width ke along
// 'y' = seedha khada (upright)
const CYL_ALIGN = 'z';

const CargoMesh = ({ cargoType, position, dims, color }) => {
  const [L, H, W] = dims;
  const l = Math.max(0.02, L - VISUAL_GAP);
  const h = Math.max(0.02, H - VISUAL_GAP);
  const w = Math.max(0.02, W - VISUAL_GAP);

  const FaceMat = (
    <meshStandardMaterial
      color={color || "#ff9800"}
      polygonOffset
      polygonOffsetFactor={1}
      polygonOffsetUnits={1}
      roughness={0.6}
      metalness={0}
    />
  );
  const Stroke = <Edges scale={OUTLINE_SCALE} threshold={15} color={OUTLINE_COLOR} />;



  switch ((cargoType || "Box").toLowerCase()) {
    case "box":
      return (
        <mesh position={position}>
          <boxGeometry args={[l, h, w]} />
          {FaceMat}{Stroke}
        </mesh>
      );

    case "sacks":
      return <SoftBox position={position} dims={[l, h, w]} color={color} />;

    case "bigbags": {
      const body = <SoftBox position={position} dims={[l, h * 0.95, w]} color={color} />;
      // top lifting loops
      const loopR = Math.min(l, w) * 0.03;
      const loopH = h * 0.15;
      const dx = l / 2 - loopR * 1.5;
      const dz = w / 2 - loopR * 1.5;
      const yTop = position[1] + h / 2;
      const loopsPos = [
        [dx, yTop, dz], [dx, yTop, -dz], [-dx, yTop, dz], [-dx, yTop, -dz],
      ];
      const loops = loopsPos.map((p, i) => (
        <mesh key={i} position={[position[0] + p[0], p[1], position[2] + p[2]]}>
          <cylinderGeometry args={[loopR * 0.6, loopR * 0.6, loopH, 16]} />
          <meshStandardMaterial color={color || "#ff9800"} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
          <Edges scale={OUTLINE_SCALE} threshold={15} color={OUTLINE_COLOR} />
        </mesh>
      ));
      return <group>{body}{loops}</group>;
    }

    case "barrels": {
      // ✅ barrel size = cell ke chhote dimension par clamp (no overlap)
      const diameter = Math.max(0.02, Math.min(l, w) - VISUAL_GAP);
      return <BulgedBarrel position={position} height={h} diameter={diameter} color={color} />;
    }

    case "roll": {
      const axis = CYL_ALIGN;
      const len = axis === 'x' ? l : axis === 'z' ? w : h;                 // cylinder ki lambai
      const diam = axis === 'x' ? Math.min(h, w) : axis === 'z' ? Math.min(l, h) : Math.min(l, w);
      const rot = axis === 'x' ? [0, 0, Math.PI / 2] : axis === 'z' ? [Math.PI / 2, 0, 0] : [0, 0, 0];
      const outerR = Math.max(0.01, diam / 2 - VISUAL_GAP / 2);
      const thickness = Math.max(0.008, outerR * 0.12);                      // roll: patla core
      const length = Math.max(0.02, len - VISUAL_GAP);
      return (
        <HollowTube
          position={position}
          length={length}
          outerR={outerR}
          thickness={thickness}
          rotation={rot}
          color={color}
        />
      );
    }

    case "pipe": {
      const axis = CYL_ALIGN;
      const len = axis === 'x' ? l : axis === 'z' ? w : h;
      const diam = axis === 'x' ? Math.min(h, w) : axis === 'z' ? Math.min(l, h) : Math.min(l, w);
      const rot = axis === 'x' ? [0, 0, Math.PI / 2] : axis === 'z' ? [Math.PI / 2, 0, 0] : [0, 0, 0];
      const outerR = Math.max(0.01, diam / 2 - VISUAL_GAP / 2);
      const thickness = Math.max(0.006, outerR * 0.18);                      // pipe: thoda mota wall
      const length = Math.max(0.02, len - VISUAL_GAP);
      return (
        <HollowTube
          position={position}
          length={length}
          outerR={outerR}
          thickness={thickness}
          rotation={rot}
          color={color}
        />
      );
    }

    case "bulk":
      return (
        <mesh position={position}>
          <boxGeometry args={[l, Math.max(h * 0.5, 0.1), w]} />
          {FaceMat}{Stroke}
        </mesh>
      );

    case "liquid":
      return null;

    default:
      return (
        <mesh position={position}>
          <boxGeometry args={[l, h, w]} />
          {FaceMat}{Stroke}
        </mesh>
      );
  }
};


// --------------------------- Logic helpers ---------------------------
function getCategory(type) {
  if (type.includes("StepDeck")) return "FR"; // treat as open FR
  if (type.includes("Flatbed")) return "FR";  // treat as open FR
  if (type.toLowerCase().includes("reefer")) return "Reefer";
  if (type.includes("HC")) return "HC";
  if (type.includes("OT")) return "OT";
  if (type.includes("FR")) return "FR";
  if (type.includes("Platform")) return "Platform";
  if (type.includes("Tank")) return "Tank";
  if (type.includes("Bulk")) return "Bulk";
  return "Dry";
}
function estimateFitsDryOrHC(cont, item) {
  const tryOrient = (l, w, h) => {
    const perRow = Math.floor(cont.length / l);
    const perCol = Math.floor(cont.width / w);
    const perLayer = perRow * perCol;
    const layers = Math.floor(cont.height / h);
    return { perLayer, layers, fits: perLayer * layers, l, w, h };
  };
  const o1 = tryOrient(item.L, item.W, item.H);
  const o2 = tryOrient(item.W, item.L, item.H);
  return o2.fits > o1.fits ? o2 : o1;
}
function estimateFitsOT(cont, item) {
  const tryOrient = (l, w, h) => {
    const perRow = Math.floor(cont.length / l);
    const perCol = Math.floor(cont.width / w);
    const perLayer = perRow * perCol;
    const layers = h > cont.height ? 1 : Math.floor(cont.height / h);
    const overHeight = h > cont.height;
    return { perLayer, layers, fits: perLayer * layers, overHeight, l, w, h };
  };
  const o1 = tryOrient(item.L, item.W, item.H);
  const o2 = tryOrient(item.W, item.L, item.H);
  return o2.fits > o1.fits ? o2 : o1;
}
function estimateFitsFRorPlatform(cont, item) {
  const allowOverW = 0.5;
  const fitsIf = (l, w) =>
    l <= cont.length && w <= cont.width + allowOverW
      ? Math.floor(cont.length / l) * Math.floor(cont.width / Math.min(w, cont.width))
      : 0;
  const f1 = fitsIf(item.L, item.W);
  const f2 = fitsIf(item.W, item.L);
  const overW = item.W > cont.width || item.L > cont.width;
  const fits = Math.max(f1, f2);
  const usedL = f2 > f1 ? item.W : item.L;
  const usedW = f2 > f1 ? item.L : item.W;
  return { perLayer: Math.max(f1, f2), layers: 1, fits, overWidth: overW, l: usedL, w: usedW };
}

function suggestContainers({ L, W, H, weight, cargoType }) {
  const results = [];
  Object.entries(CONTAINER_SIZES).forEach(([key, cont]) => {
    const cat = getCategory(key);
    let suitable = true;
    const reasons = [];
    const warnings = [];
    let fits = 0;
    let util = 0;
    let score = 0;

    const itemVol = L * W * H;
    const contVol = cont.length * cont.width * cont.height;

    if (cargoType.toLowerCase() === "liquid" && cat !== "Tank") {
      suitable = false;
      reasons.push("Liquid requires a Tank container.");
    }

    if (cat === "Tank") {
      if (cargoType.toLowerCase() === "liquid") {
        reasons.push("Bulk liquid → Tank container required.");
        fits = 1;
        const maxByWeight = Math.floor(cont.maxWeight / Math.max(1, weight));
        if (fits > maxByWeight) {
          fits = maxByWeight;
          warnings.push(`Weight cap ~${maxByWeight} load(s).`);
        }
        util = 0.85;
        score += 10;
      } else {
        suitable = false;
        reasons.push("Tank is for bulk liquids only.");
      }
    } else if (cat === "Bulk") {
      if (cargoType.toLowerCase() === "bulk") {
        reasons.push("Granular bulk → Bulk container.");
        fits = 1;
        util = 0.8;
        score += 8;
      } else {
        suitable = false;
        reasons.push("Bulk container is for granules/powders.");
      }
    } else if (cat === "OT") {
      const o = estimateFitsOT(cont, { L, W, H });
      fits = o.fits;
      util = Math.min(1, (fits * itemVol) / contVol);
      if (o.overHeight) warnings.push("Over-height via top loading (tarpaulin).");
      reasons.push("Open Top handles crane loading / over-height.");
      score += o.overHeight ? 7 : 5;
    } else if (cat === "FR" || cat === "Platform") {
      const o = estimateFitsFRorPlatform(cont, { L, W, H });
      fits = o.fits;
      util = Math.min(1, (fits * itemVol) / contVol * 0.6);
      reasons.push(cat === "FR" ? "Flat Rack good for machinery/pipe/roll." : "Platform for heavy base loads.");
      if (o.overWidth) warnings.push("Out-of-Gauge width — special lashing & permits.");
      score += ["Pipe", "Roll"].includes(cargoType) ? 9 : 6;
    } else {
      const fitPhys =
        (L <= cont.length && W <= cont.width && H <= cont.height) ||
        (W <= cont.length && L <= cont.width && H <= cont.height);
      if (!fitPhys) {
        suitable = false;
      } else {
        const o = estimateFitsDryOrHC(cont, { L, W, H });
        fits = o.fits;
        util = Math.min(1, (fits * itemVol) / contVol);
        reasons.push(
          cat === "HC" ? "High-Cube: extra internal height."
            : cat === "Reefer" ? "Reefer: temperature-controlled (insulated)."
              : "Standard dry container."
        );
        score += (cat === "HC" || cat === "Reefer") ? 7 : 6;
      }
    }

    const c = cargoType.toLowerCase();
    if (["box", "sacks", "bigbags"].includes(c) && (cat === "Dry" || cat === "HC" || cat === "Reefer")) score += 2;
    if (["pipe", "roll"].includes(c) && (cat === "FR" || cat === "Platform" || cat === "OT")) score += 2;
    if (c === "barrels" && (cat === "Dry" || cat === "Reefer")) score += 1;

    const maxByWeight = Math.floor(cont.maxWeight / Math.max(1, weight));
    if (fits > maxByWeight) {
      fits = maxByWeight;
      warnings.push(`Weight cap allows ~${maxByWeight} pcs.`);
    }

    if (suitable && fits >= 0) {
      const warnPenalty = warnings.length * 0.5;
      const finalScore = score + util * 5 - warnPenalty;
      results.push({
        containerType: key,
        category: cat,
        fits,
        utilization: Math.round(util * 100),
        reasons,
        warnings,
        score: Number(finalScore.toFixed(2)),
      });
    }
  });
  return results.sort((a, b) => b.score - a.score).slice(0, 8);
}

// NEW: Truck suggestion logic
function suggestTrucks({ L, W, H, weight, cargoType }) {
  const results = [];

  // No liquids in trucks
  if (cargoType.toLowerCase() === "liquid") {
    return [{
      containerType: "Use 20ftTank (container)",
      category: "Liquid",
      fits: 0,
      utilization: 0,
      reasons: ["Liquid loads should go in ISO Tank container."],
      warnings: [],
      score: 0,
    }];
  }

  Object.entries(TRUCK_SPECS).forEach(([key, trk]) => {
    const allowed = TRUCK_CARGO_MAP[key] || [];
    if (!allowed.includes(cargoType)) return;

    const category =
      key.startsWith("DryVan") ? "DryVan" :
        key.startsWith("Reefer") ? "Reefer" :
          key.startsWith("StepDeck") ? "StepDeck" :
            key.startsWith("Flatbed") ? "Flatbed" :
              "CargoVan";

    const reasons = [];
    const warnings = [];
    let fits = 0;
    let util = 0;
    let score = 0;

    const itemVol = L * W * H;
    const trkVol = trk.length * trk.width * trk.height;

    if (category === "StepDeck" || category === "Flatbed") {
      const o = estimateFitsFRorPlatform(trk, { L, W, H });
      fits = o.fits;
      util = Math.min(1, (fits * itemVol) / trkVol * 0.6);
      reasons.push(category === "Flatbed"
        ? "Open flat deck for oversize machinery/pipes/rolls."
        : "Open low deck for machinery/pipe/roll.");
      if (o.overWidth) warnings.push("Out-of-Gauge width — lashing/permits required.");
      score += ["Pipe", "Roll"].includes(cargoType) ? 9 : 6;
    } else {
      const fitPhys =
        (L <= trk.length && W <= trk.width && H <= trk.height) ||
        (W <= trk.length && L <= trk.width && H <= trk.height);
      if (!fitPhys) return;

      const o = estimateFitsDryOrHC(trk, { L, W, H });
      fits = o.fits;
      util = Math.min(1, (fits * itemVol) / trkVol);
      reasons.push(category === "Reefer" ? "Insulated & temperature-controlled." : "Enclosed van body.");
      score += category === "Reefer" ? 7 : 6;
    }

    const maxByWeight = Math.floor(trk.maxWeight / Math.max(1, weight));
    if (fits > maxByWeight) {
      fits = maxByWeight;
      warnings.push(`Weight cap allows ~${maxByWeight} pcs.`);
    }

    if (fits > 0) {
      const warnPenalty = warnings.length * 0.5;
      const finalScore = score + util * 5 - warnPenalty;
      results.push({
        containerType: key,
        category,
        fits,
        utilization: Math.round(util * 100),
        reasons,
        warnings,
        score: Number(finalScore.toFixed(2)),
      });
    }
  });

  return results.sort((a, b) => b.score - a.score).slice(0, 8);
}
// ---------- THEME (rounded, bold headers, soft gradients) ----------
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1e88e5" },     // richer than #1976d2
    secondary: { main: "#9c27b0" },
    success: { main: "#2e7d32" },
    warning: { main: "#f9a825" },
    info: { main: "#0288d1" },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontWeightBold: 800,
    button: { textTransform: "none", fontWeight: 700 }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: "1px solid rgba(25,118,210,0.1)",
          boxShadow: "0 10px 30px rgba(25,118,210,0.08)",
          backdropFilter: "saturate(1.2) blur(2px)",
        }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& th": {
            fontWeight: 800,
            background: "linear-gradient(180deg,#f6f9ff,#eef3ff)",
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700 }
      }
    }
  }
});

// glass helper
const glass = (bg = "#ffffff") => ({
  background: `linear-gradient(180deg, ${alpha(bg, 0.9)}, ${alpha(bg, 0.85)})`,
});

// ---------- Tabs Helper ----------
function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index} aria-labelledby={`tab-${index}`}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

/* ===========================
   Gallery + Info popup
   =========================== */
const imgFor = (key) => containerImages[key] || null;
const imgTruckFor = (key) => truckImages[key] || null;

// Optional detailed spec sheet per type (example filled for 20ft)
const CONTAINER_SPECS = {
  "20ft": {
    insideLength: 5.895, insideWidth: 2.350, insideHeight: 2.392,
    doorWidth: 2.340, doorHeight: 2.292,
    capacityM3: 33,
    tare: 2230, maxCargo: 28230,
    desc: "20’ standard (general purpose) – closed on all sides; doors at one end.",
  },
};

const CONTAINER_CATALOG = Object.keys(CONTAINER_SIZES).map((key) => {
  const base = CONTAINER_SIZES[key];
  const info = CONTAINER_SPECS[key] || {};
  const capacity =
    info.capacityM3 ??
    Number((base.length * base.width * base.height).toFixed(2));
  return {
    key,
    title: key,
    img: imgFor(key),
    specs: {
      insideLength: info.insideLength ?? base.length,
      insideWidth: info.insideWidth ?? base.width,
      insideHeight: info.insideHeight ?? base.height,
      doorWidth: info.doorWidth ?? Math.min(base.width, 2.34),
      doorHeight: info.doorHeight ?? Math.min(base.height, 2.30),
      capacityM3: capacity,
      tare: info.tare ?? null,
      maxCargo: info.maxCargo ?? base.maxWeight ?? null,
      desc: info.desc ??
        (key.includes("HC") ? "High-Cube: extra internal height."
          : key.toLowerCase().includes("reefer") ? "Reefer: insulated, temperature-controlled."
            : key.includes("OT") ? "Open Top: top loading / over-height possible."
              : key.includes("FR") ? "Flat Rack: open sides for machinery/pipe."
                : key.includes("Platform") ? "Platform: heavy/oversize base loads."
                  : key.includes("Bulk") ? "Bulk: granular bulk via roof hatches."
                    : key.includes("Tank") ? "ISO Tank: bulk liquids."
                      : "General purpose container."),
    },
    allowed: CONTAINER_CARGO_MAP[key] || CARGO_TYPES,
  };
});

const TRUCK_CATALOG = Object.keys(TRUCK_SPECS).map((key) => {
  const t = TRUCK_SPECS[key];
  return {
    key,
    title: key,
    img: imgTruckFor(key),
    specs: {
      insideLength: t.length, insideWidth: t.width, insideHeight: t.height,
      capacityM3: Number((t.length * t.width * t.height).toFixed(2)),
      maxCargo: t.maxWeight ?? null,
      desc: TRUCK_NOTES[key] || "Truck body.",
    },
    allowed: TRUCK_CARGO_MAP[key] || [],
  };
});

const Thumb = ({ src, title }) => (
  <Box
    sx={{
      position: "relative",
      height: 140,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      overflow: "hidden",
      background:
        "radial-gradient(120% 80% at 0% 0%, #e9f3ff 0%, #f6fbff 45%, #ffffff 100%)",
    }}
  >
    {src ? (
      <img
        src={src}
        alt={title}
        onError={(e) => { e.currentTarget.style.display = "none"; }}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    ) : null}
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.15) 100%)",
      }}
    />
    <Box sx={{ position: "absolute", bottom: 8, left: 12 }}>
      <Typography
        variant="subtitle1"
        sx={{
          color: "#fff",
          fontWeight: 800,
          textShadow: "0 2px 8px rgba(0,0,0,0.35)",
        }}
      >
        {title}
      </Typography>
    </Box>
  </Box>
);

const TypeCard = ({ item, selected, onUse, onInfo }) => (
  <Paper
    elevation={selected ? 8 : 3}
    sx={{
      ...glass("#ffffff"),
      overflow: "hidden",
      border: selected ? "2px solid #1e88e5" : "1px solid #e0e7ff",
      transform: selected ? "translateY(-2px)" : "none",
      transition: "all .2s ease",
      "&:hover": { transform: "translateY(-4px)", boxShadow: 8 },
    }}
  >
    <Thumb src={item.img} title={item.title} />
    <Box sx={{ p: 1.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2" fontWeight={800}>
          {item.title}
        </Typography>
        {selected && <Chip size="small" color="primary" label="Selected" />}
      </Stack>

      <Stack direction="row" spacing={0.5} sx={{ mt: 0.75, flexWrap: "wrap" }}>
        {item.allowed.slice(0, 4).map((t, i) => (
          <Tooltip key={i} title={t}>
            {cargoIcon(t, { fontSize: 18, color: "#1e293b" })}
          </Tooltip>
        ))}
        {item.allowed.length > 4 && (
          <Chip size="small" variant="outlined" label={`+${item.allowed.length - 4}`} />
        )}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
        <Button
          size="small"
          variant="contained"
          onClick={onUse}
          sx={{
            px: 1.5,
            background:
              "linear-gradient(90deg, #1e88e5 0%, #42a5f5 100%)",
          }}
        >
          Use this
        </Button>
        <Button size="small" variant="outlined" onClick={onInfo}>
          Info
        </Button>
      </Stack>
    </Box>
  </Paper>
);


const TypeGallery = ({ items, selectedKey, onUse, onInfo }) => (
  <Grid container spacing={2}>
    {items.map((it) => (
      <Grid item key={it.key} xs={12} sm={6} md={4} lg={3}>
        <TypeCard
          item={it}
          selected={selectedKey === it.key}
          onUse={() => onUse(it.key)}
          onInfo={() => onInfo(it)}
        />
      </Grid>
    ))}
  </Grid>
);

// --------------------------- Main Component ---------------------------
export default function LoadCalculator() {
  // Tabs
  const [tab, setTab] = useState(0);

  // Mode toggle
  const [mode, setMode] = useState("Container"); // "Container" | "Truck"

  const [selectedSize, setSelectedSize] = useState("20ft");
  const [selectedTruck, setSelectedTruck] = useState("DryVan-20ft");

  const [customSize, setCustomSize] = useState(CONTAINER_SIZES["Custom"]);
  const [items, setItems] = useState([]); // METERS / liquidM3 for liquids

  const [entries, setEntries] = useState([]);

  // Popup 3D View ke liye
  const [open3D, setOpen3D] = useState(false);
  useEffect(() => { if (open3D) setShowSuggestion(false); }, [open3D]);


  // ▶ Stuffing playback
  const [timeline, setTimeline] = useState([]);  // place-order list of renderable items
  const [playhead, setPlayhead] = useState(0);   // kitne items visible hain
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepMs, setStepMs] = useState(600);     // speed: 600ms per step (≈1×)
  const [cargoType, setCargoType] = useState("Box");
  const [autoColor, setAutoColor] = useState(true);
  const [unit, setUnit] = useState("mm");
  // Palletization UI & config
  const [usePallets, setUsePallets] = useState(false);
  const [palletType, setPalletType] = useState("Europe Pallets");
  const [palletSpec, setPalletSpec] = useState({ ...PALLET_PRESETS["Europe Pallets"] });
  const [autoFitCustomPallet, setAutoFitCustomPallet] = useState(true);

  // Suggest dialog
  const [openSuggest, setOpenSuggest] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
// existing state ke paas add karo:
const [autoSmartPack, setAutoSmartPack] = useState(true);

  // Info dialog (for gallery)
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoItem, setInfoItem] = useState(null);
  const openInfo = (it) => { setInfoItem(it); setInfoOpen(true); };
  const closeInfo = () => setInfoOpen(false);

  // ----- form state -----
  const [form, setForm] = useState({
    productName: "",
    length: "1200",
    width: "1000",
    height: "1000",
    color: "#1976d2",
    quantity: 1,
    weight: 100, // kg per piece (non-liquid)
    // Liquid-only fields (Liters-only):
    liquidVolume: "",  // always in Liters
    sg: 1.0,           // specific gravity
    maxFillPercent: 95 // safety headspace
  });
const [weightUnit, setWeightUnit] = useState("kg"); // "kg" | "lb"

  const [nextPosition, setNextPosition] = useState({
    x: 0, y: 0, z: 0, rowDepth: 0, levelHeight: 0,
  });
  const [freeSpaces, setFreeSpaces] = useState([]);
  const [nextSuggestion, setNextSuggestion] = useState(null);
  const [showSuggestion, setShowSuggestion] = useState(false); // Toggle for optimization suggestion


  useEffect(() => {
    if (!freeSpaces.length) {
      setNextSuggestion(null);
      return;
    }
    // Prioritize Bottom-First (Low Y), then Volume to ensure bottom fills before top
    let best = null;
    const sorted = [...freeSpaces].sort((a, b) => {
        const yA = Math.round(a.y * 1000);
        const yB = Math.round(b.y * 1000);
        if (yA !== yB) return yA - yB; // Lower Y first
        return (b.L * b.W * b.H) - (a.L * a.W * a.H); // Larger Volume next
    });

    // Pick first usable space
    for (const s of sorted) {
       const sl = Math.max(0, s.L - 0.001);
       const sw = Math.max(0, s.W - 0.001);
       const sh = Math.max(0, s.H - 0.001);
       // Must be at least 1cm to be usable
       if (sl > 0.01 && sw > 0.01 && sh > 0.01) {
           best = s;
           break;
       }
    }

    if (best) { 
       const safeL = Math.max(0, best.L - 0.001);
       const safeW = Math.max(0, best.W - 0.001);
       const safeH = Math.max(0, best.H - 0.001);

       if (safeL > 0.01 && safeW > 0.01 && safeH > 0.01) {
         // Cap dimensions at 2.0m as requested, but split if necessary to fill space
         const maxDim = 2.0;
         
         // Calculate optimal count to fit in space while keeping dims <= maxDim
         const countL = Math.max(1, Math.ceil(safeL / maxDim));
         const countW = Math.max(1, Math.ceil(safeW / maxDim));
         const countH = Math.max(1, Math.ceil(safeH / maxDim));
         
         // Distribute space evenly
         const suggestL = safeL / countL;
         const suggestW = safeW / countW;
         const suggestH = safeH / countH;

         const qty = Math.max(1, countL * countW * countH);

         setNextSuggestion({ L: suggestL, W: suggestW, H: suggestH, qty });
       } else {
         setNextSuggestion(null);
       }
    } else {
       setNextSuggestion(null);
    }
  }, [freeSpaces]);

  // Compute current space (container OR truck)
  const container = mode === "Container"
    ? (selectedSize === "Custom" ? customSize : CONTAINER_SIZES[selectedSize])
    : TRUCK_SPECS[selectedTruck];

  const maxWeight = container.maxWeight;
  const cat = getCategory(mode === "Container" ? selectedSize : selectedTruck);

  // Allowed cargo options per mode
  const allowedTypes = mode === "Container"
    ? (CONTAINER_CARGO_MAP[selectedSize] || CARGO_TYPES)
    : (TRUCK_CARGO_MAP[selectedTruck] || ["Box", "Sacks", "Bigbags", "Barrels"]);

  // keep cargoType valid when mode/selection changes
  useEffect(() => {
    if (!allowedTypes.includes(cargoType)) {
      setCargoType(allowedTypes[0]);
    }
    // reset placement when target changes
    setNextPosition({ x: 0, y: 0, z: 0, rowDepth: 0, levelHeight: 0 });

    setItems([]);
    setTimeline([]);
    setPlayhead(0);
    setIsPlaying(false);
    setFreeSpaces([{ x: 0, y: 0, z: 0, L: container.length, W: container.width, H: container.height }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedSize, selectedTruck]);
  useEffect(() => {
    if (autoColor) {
      setForm(prev => ({ ...prev, color: CARGO_COLORS[cargoType] || prev.color }));
    }
  }, [cargoType, autoColor]);
  // ---------- FIXED: Safe Custom handler ----------
  // Red underline issues solved: safe numeric parsing, empty allowed while typing, maxWeight non-negative
  const handleCustomChange = useCallback((e) => {
    const { name, value } = e.target;

    // allow only digits, dot and empty string while typing
    const cleaned = typeof value === "string" ? value.replace(/[^\d.]/g, "") : value;

    setCustomSize((prev) => {
      const next = { ...prev };
      if (cleaned === "") {
        next[name] = 0; // internal safe
        return next;
      }

      const num = Number(cleaned);
      if (!Number.isFinite(num)) return prev;

      if (name === "maxWeight") {
        next.maxWeight = Math.max(0, Math.floor(num));
      } else {
        next[name] = Math.max(0, num);
      }
      return next;
    });
  }, []);

  const handleContainerChange = (val) => setSelectedSize(val);
  const handleTruckChange = (val) => setSelectedTruck(val);
  const handleModeChange = (val) => setMode(val);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
const handleWeightUnitChange = (nextUnit) => {
  setWeightUnit((prev) => {
    if (!nextUnit || nextUnit === prev) return prev;
    // current input ko convert karke same real weight rakho
    const kgNow = toKg(form.weight, prev);
    const displayInNext = fromKg(kgNow, nextUnit);
    setForm((p) => ({ ...p, weight: Number(displayInNext.toFixed(2)) }));
    return nextUnit;
  });
};

  const handleUnitSwitch = (nextUnit) => {
    const Lm = parseToMeters(form.length, unit);
    const Wm = parseToMeters(form.width, unit);
    const Hm = parseToMeters(form.height, unit);
    setForm((prev) => ({
      ...prev,
      length: Number.isFinite(Lm) ? toUI(Lm, nextUnit) : "",
      width: Number.isFinite(Wm) ? toUI(Wm, nextUnit) : "",
      height: Number.isFinite(Hm) ? toUI(Hm, nextUnit) : "",
    }));
    setUnit(nextUnit);
  };

  // Liquid helpers (Liters-only)
  const isTank = mode === "Container" && selectedSize.includes("Tank");
  const isLiquid = cargoType === "Liquid";
  const tankCapL = TANK_CAPACITY_L[selectedSize] || 24000;

  const volumeM3FromForm = () => {
    const volL = Number(form.liquidVolume) || 0;
    return volL / 1000; // L → m³
  };
  const computedLiquidWeight = () => {
    const m3 = volumeM3FromForm();
    const sg = Number(form.sg) || 0;
    return m3 * 1000 * sg; // kg
  };

  // Live previews (meters) for non-liquid
  const mLength = parseToMeters(form.length, unit);
  const mWidth = parseToMeters(form.width, unit);
  const mHeight = parseToMeters(form.height, unit);

  const addItem = () => {
    // -------- LIQUID (unchanged) --------
    if (cargoType === "Liquid") {
      const isTank = mode === "Container" && selectedSize.includes("Tank");
      if (!isTank) {
        alert("❌ Liquid requires a Tank container (use 20ftTank).");
        return;
      }
      const sg = Number(form.sg) || 0;
      if (sg <= 0) {
        alert("❌ Enter valid Specific Gravity (e.g., water = 1.0).");
        return;
      }
      const tankCapL = TANK_CAPACITY_L[selectedSize] || 24000;
      let m3 = (Number(form.liquidVolume) || 0) / 1000; // L -> m³
      if (m3 <= 0) {
        alert("❌ Enter a positive liquid volume (Liters).");
        return;
      }
      const maxFill = Math.min(100, Math.max(50, Number(form.maxFillPercent) || 95));
      const allowedM3 = (tankCapL * maxFill) / 100 / 1000;
      if (m3 > allowedM3) {
        alert(`⚠️ Over max fill ${maxFill}% of ${tankCapL} L. Using ${allowedM3 * 1000} L.`);
        m3 = allowedM3;
      }

      const usedWeightNow = items.reduce((s, it) => s + (it.weight || 0) * (it.quantity || 1), 0);
      const weight = m3 * 1000 * sg; // kg
      if (usedWeightNow + weight > container.maxWeight) {
        alert("❌ Overweight for Tank. Reduce volume or SG.");
        return;
      }

      const addedItem = {
        productName: form.productName,
        cargoType: "Liquid",
        color: form.color,
        length: 0, width: 0, height: 0,
        quantity: 1,
        weight,
        liquidM3: m3,
        renderGroupId: Date.now(),
      };
      setItems((prev) => [...prev, addedItem]);
      // --- snapshot (Liquid) ---
      {
        const groupId = addedItem.renderGroupId;
        setEntries((prev) => [
          ...prev,
          {
            id: groupId,
            isLiquid: true,
            cargoType: "Liquid",
            productName: form.productName,
            color: form.color,
            unit,
            liquidVolume: form.liquidVolume,
            sg: Number(form.sg) || 0,
            maxFillPercent: Number(form.maxFillPercent) || 95,
            weight,              // computed kg
            quantity: 1
          }
        ]);
      }

      return; // liquid: no discrete 3D blocks
    }

    // -------- NON-LIQUID (with palletization) --------
    const quantity = Number(form.quantity) || 0;
const weight = toKg(Number(form.weight) || 0, weightUnit); // always kg


    const mLength = parseToMeters(form.length, unit);
    const mWidth = parseToMeters(form.width, unit);
    const mHeight = parseToMeters(form.height, unit);

    if (!Number.isFinite(mLength) || !Number.isFinite(mWidth) || !Number.isFinite(mHeight)) {
      alert('❌ Invalid size. Try 1200, 120cm, 48in, 4ft or 4\'0"');
      return;
    }
    if (mLength <= 0 || mWidth <= 0 || mHeight <= 0 || quantity <= 0 || weight <= 0) {
      alert("❌ Positive values required for L/W/H, quantity, weight.");
      return;
    }

    // allowed cargo check (container/truck wise)
    if (!allowedTypes.includes(cargoType)) {
      alert(`❌ ${cargoType} is not allowed in this ${mode.toLowerCase()}.`);
      return;
    }

    const targetCat = cat; // current target category
    const heightOk = targetCat === "OT" ? true : mHeight <= container.height;

    if (
      !["FR", "Platform"].includes(targetCat) &&
      (mLength > container.length || mWidth > container.width || !heightOk)
    ) {
      alert("❌ Item too big for this target (size exceeds).");
      return;
    }
    if (targetCat === "OT" && mHeight > container.height) {
      alert("⚠️ Open Top over-height: tarp/lashing/permits may be needed.");
    }
    if (["FR", "Platform"].includes(targetCat) && mWidth > container.width + 0.5) {
      alert("⚠️ Over-width > 0.5 m — special lashing/permits likely.");
    }

    // weight guard
    const usedWeightNow = items.reduce((s, it) => s + (it.weight || 0) * (it.quantity || 1), 0);
    const remainingWeight = container.maxWeight - usedWeightNow;
    let allowedByWeight = Math.max(0, Math.floor(remainingWeight / weight));
    let askQty = Math.min(quantity, allowedByWeight);
    if (askQty <= 0) { alert("❌ Overweight. Cannot add more items."); return; }
    if (askQty < quantity) alert(`⚠️ Overweight limit. Only ${askQty} of ${quantity} added.`);

    function placeInto(fs, L, H, W, cont, category) {
      // Sort to prioritize Bottom (Y) -> Back (X) -> Left (Z)
      // This ensures we fill the container from bottom-up, back-to-front.
      fs.sort((a, b) => {
        if (Math.abs(a.y - b.y) > 0.001) return a.y - b.y;
        if (Math.abs(a.x - b.x) > 0.001) return a.x - b.x;
        return a.z - b.z;
      });

      const hFit = category === "OT" ? Math.min(H, cont.height) : H;
      for (let i = 0; i < fs.length; i++) {
        const s = fs[i];
        if (L <= s.L && W <= s.W && hFit <= s.H) {
          const pos = [
            (s.x + L / 2) - cont.length / 2,
            (s.y + hFit / 2) - cont.height / 2,
            (s.z + W / 2) - cont.width / 2,
          ];
          const newFs = fs.slice();
          newFs.splice(i, 1);
          const right = { x: s.x + L, y: s.y, z: s.z, L: s.L - L, W: s.W, H: s.H };
          const up = { x: s.x, y: s.y + hFit, z: s.z, L: L, W: s.W, H: s.H - hFit };
          const front = { x: s.x, y: s.y, z: s.z + W, L: L, W: s.W - W, H: hFit };
          if (right.L > 0 && right.W > 0 && right.H > 0) newFs.push(right);
          if (up.L > 0 && up.W > 0 && up.H > 0) newFs.push(up);
          if (front.L > 0 && front.W > 0 && front.H > 0) newFs.push(front);
          return { ok: true, position: pos, fs: newFs, swapped: false };
        }
        if (W <= s.L && L <= s.W && hFit <= s.H) {
          const pos = [
            (s.x + W / 2) - cont.length / 2,
            (s.y + hFit / 2) - cont.height / 2,
            (s.z + L / 2) - cont.width / 2,
          ];
          const newFs = fs.slice();
          newFs.splice(i, 1);
          const right = { x: s.x + W, y: s.y, z: s.z, L: s.L - W, W: s.W, H: s.H };
          const up = { x: s.x, y: s.y + hFit, z: s.z, L: W, W: s.W, H: s.H - hFit };
          const front = { x: s.x, y: s.y, z: s.z + L, L: W, W: s.W - L, H: hFit };
          if (right.L > 0 && right.W > 0 && right.H > 0) newFs.push(right);
          if (up.L > 0 && up.W > 0 && up.H > 0) newFs.push(up);
          if (front.L > 0 && front.W > 0 && front.H > 0) newFs.push(front);
          return { ok: true, position: pos, fs: newFs, swapped: true };
        }
      }
      return { ok: false, position: null, fs };
    }

    const renderGroupId = Date.now();
    let temp = { ...nextPosition };
    let added = 0;
    let newRender = [];
    let fsLocal = freeSpaces.length
      ? [...freeSpaces]
      : [{ x: 0, y: 0, z: 0, L: container.length, W: container.width, H: container.height }];

    // ---------- NO PALLETS: original per-piece packing ----------
    if (!usePallets) {
      for (let i = 0; i < askQty; i++) {
        const res = placeInto(fsLocal, mLength, mHeight, mWidth, container, targetCat);
        if (!res.ok) { alert("⚠️ No stacking space left."); break; }

        newRender.push({
          cargoType,
          length: res.swapped ? mWidth : mLength,
          width: res.swapped ? mLength : mWidth,
          height: mHeight,
          color: form.color,
          position: res.position,
          renderGroupId,
        });
        added++;
        fsLocal = res.fs;
      }
    } else {
      // ================= PALLETIZATION =================
      if (!PALLET_ALLOWED_CARGO.has(cargoType)) {
        alert("❌ Pallets: only Box / Sacks / Bigbags / Barrels supported.");
        return;
      }

      let pL = palletSpec.length;
      let pW = palletSpec.width;
      const pBase = palletSpec.baseHeight;
      const pMaxH = palletSpec.maxHeight;

      // layers limit (height)
      const maxLayersByHeight = Math.max(0, Math.floor((pMaxH - pBase) / mHeight));
      if (maxLayersByHeight <= 0) { alert("❌ Max pallet height too small for this item."); return; }

      let orient;
      if (palletType === "Custom Pallets" && autoFitCustomPallet) {
        let best = null;
        const gaps = fsLocal.length ? fsLocal : [{ x: 0, y: 0, z: 0, L: container.length, W: container.width, H: container.height }];
        for (const s of gaps) {
          const r1 = Math.floor(s.L / mLength), c1 = Math.floor(s.W / mWidth);
          const r2 = Math.floor(s.L / mWidth), c2 = Math.floor(s.W / mLength);
          const n1 = r1 * c1, n2 = r2 * c2;
          if (n1 > 0) {
            const score = n1;
            if (!best || score > best.score) best = { score, perRow: r1, perCol: c1, cellL: mLength, cellW: mWidth };
          }
          if (n2 > 0) {
            const score = n2;
            if (!best || score > best.score) best = { score, perRow: r2, perCol: c2, cellL: mWidth, cellW: mLength };
          }
        }
        if (!best) { alert("❌ No free gap fits this item footprint."); return; }
        pL = best.perRow * best.cellL;
        pW = best.perCol * best.cellW;
        orient = { l: best.cellL, w: best.cellW, perRow: best.perRow, perCol: best.perCol };
      } else {
        const perRow1 = Math.floor(pL / mLength), perCol1 = Math.floor(pW / mWidth);
        const perRow2 = Math.floor(pL / mWidth), perCol2 = Math.floor(pW / mLength);
        const count1 = perRow1 * perCol1, count2 = perRow2 * perCol2;
        orient = count2 > count1
          ? { l: mWidth, w: mLength, perRow: perRow2, perCol: perCol2 }
          : { l: mLength, w: mWidth, perRow: perRow1, perCol: perCol1 };
      }

      if (orient.perRow * orient.perCol <= 0) {
        alert("❌ Pallet footprint too small for this item.");
        return;
      }

      const perLayer = orient.perRow * orient.perCol;
      const itemsByHeight = perLayer * maxLayersByHeight;
      const itemsByPalletWeight = Math.max(0, Math.floor(palletSpec.maxWeight / weight));
      let itemsPerPallet = Math.min(itemsByHeight, itemsByPalletWeight);
      if (itemsPerPallet <= 0) { alert("❌ Item weight exceeds pallet max weight."); return; }

      let remaining = askQty;

      while (remaining > 0) {
        const thisPalletItems = Math.min(itemsPerPallet, remaining);
        const thisLayers = Math.ceil(thisPalletItems / perLayer);
        const stackHeight = pBase + thisLayers * mHeight;

        const placed = placeInto(fsLocal, pL, stackHeight, pW, container, targetCat);
        if (!placed.ok) { alert("⚠️ No stacking space left."); break; }

        const isSwapped = placed.swapped;
        const finalPL = isSwapped ? pW : pL;
        const finalPW = isSwapped ? pL : pW;

        // ✅ PALLET KO PEHLE LOCAL ARRAY ME BANAO (order lock)
        const palletFrames = [];

        // ---- Pallet base (FLOOR pe) ----
        const pCenter = placed.position;
        const baseH = Math.max(0.04, pBase);
        const baseYcenter = (pCenter[1] - stackHeight / 2) + baseH / 2;

        palletFrames.push({
          cargoType: "Pallet",
          length: finalPL, width: finalPW, height: baseH,
          color: palletSpec.color,
          position: [pCenter[0], baseYcenter, pCenter[2]],
          renderGroupId,
          sortPos: { x: pCenter[0], y: pCenter[1] - stackHeight / 2, z: pCenter[2] }, // Lock sort position (include Y base)
        });

        // ---- Exact local frame on pallet (no drift) ----
        const pMinX = pCenter[0] - finalPL / 2;
        const pMinZ = pCenter[2] - finalPW / 2;
        const baseY = pCenter[1] - stackHeight / 2; // pallet stack bottom


        // Tiny visual gap so items never "bleed" edges
        const GAP = Math.max(0.01, Math.min(orient.l, orient.w) * 0.02);
        const cellL = orient.l;
        const cellW = orient.w;
        const boxL = Math.max(0.02, cellL - GAP);
        const boxW = Math.max(0.02, cellW - GAP);

        let put = 0;
        for (let layer = 0; layer < thisLayers; layer++) {
          const y = baseY + pBase + (layer * mHeight) + (mHeight / 2);
          for (let r = 0; r < orient.perRow; r++) {
            for (let c = 0; c < orient.perCol; c++) {
              if (put >= thisPalletItems) break;
              // cell center
              const cx = isSwapped
                ? pMinX + (c + 0.5) * cellW
                : pMinX + (r + 0.5) * cellL;

              const cz = isSwapped
                ? pMinZ + (r + 0.5) * cellL
                : pMinZ + (c + 0.5) * cellW;

              palletFrames.push({
                cargoType,
                length: isSwapped ? boxW : boxL,
                width: isSwapped ? boxL : boxW,
                height: mHeight,
                color: form.color,
                position: [cx, y, cz],
                renderGroupId,
                sortPos: { x: pCenter[0], y: pCenter[1] - stackHeight / 2, z: pCenter[2] }, // Lock to pallet's sort position
              });
              put++;
            }
            if (put >= thisPalletItems) break;
          }
          if (put >= thisPalletItems) break;
        }

        // ✅ ab poori pallet (base + cartons) KO EK SAATH append karo
        newRender.push(...palletFrames);

        added += thisPalletItems;
        remaining -= thisPalletItems;
        fsLocal = placed.fs;
      }

    }

    // commit
    if (added > 0) {
      const addedItem = {
        productName: form.productName,
        cargoType,
        color: form.color,
        length: mLength,
        width: mWidth,
        height: mHeight,
        quantity: added,
        weight,
        renderGroupId,
      };
      setItems((prev) => [...prev, addedItem]);
      // --- snapshot (Non-Liquid) ---
      setEntries((prev) => [
        ...prev,
        {
          id: renderGroupId,
          isLiquid: false,
          cargoType,
          productName: form.productName,
          color: form.color,
          unit,
          length: form.length,   // user-entered string (e.g., "1200")
          width: form.width,
          height: form.height,
          weight: Number(form.weight) || 0,
          quantity: added        // actually added pieces
        }
      ]);


      setNextPosition(temp);
      setTimeline((prev) => {
        const nt = [...prev, ...newRender];
        // Sort for consistent playback:
        // Priority: Logical Group Y -> Logical Group X -> Logical Group Z -> Internal Y
        // This ensures pallets + their products play TOGETHER in sequence
        nt.sort((a, b) => {
          // 1. Group/Base Y (Vertical) - PRIMARY
          const yA = a.sortPos?.y ?? (a.position[1] - a.height / 2);
          const yB = b.sortPos?.y ?? (b.position[1] - b.height / 2);
          if (Math.abs(yA - yB) > 0.001) return yA - yB;

          // 2. Group/Base X (Back to Front)
          const xA = a.sortPos?.x ?? a.position[0];
          const xB = b.sortPos?.x ?? b.position[0];
          if (Math.abs(xA - xB) > 0.001) return xA - xB;

          // 3. Group/Base Z (Left to Right)
          const zA = a.sortPos?.z ?? a.position[2];
          const zB = b.sortPos?.z ?? b.position[2];
          if (Math.abs(zA - zB) > 0.001) return zA - zB;

          // 4. Internal Y (Within the same group/pallet, build up)
          const realYa = a.position[1] - a.height / 2;
          const realYb = b.position[1] - b.height / 2;
          return realYa - realYb;
        });
        if (!isPlaying) setPlayhead(nt.length);
        return nt;
      });
      setFreeSpaces(fsLocal);
    }
  };
const repackLargestFirst = useCallback(() => {
  // Palletized loads ko skip: unke liye alag logic chahiye
  if (usePallets) return;

  const targetCat = getCategory(mode === "Container" ? selectedSize : selectedTruck);

  // Liquid render nahi hota; skip
  const boxItems = items.filter(it => it.cargoType !== "Liquid");
  if (boxItems.length === 0) {
    setTimeline([]);
    setPlayhead(0);
    setIsPlaying(false);
    setNextPosition({ x:0,y:0,z:0,rowDepth:0,levelHeight:0 });
    return;
  }

  // Har piece ko unit-level me expand karo (qty ke hisab se)
  const unitQueue = [];
  for (const it of boxItems) {
    const qty = it.quantity || 1;

    // Orientation choose karo (container type ke hisaab se)
    let orient;
    if (targetCat === "OT") {
      orient = estimateFitsOT(container, { L: it.length, W: it.width, H: it.height });
    } else if (targetCat === "FR" || targetCat === "Platform") {
      const o = estimateFitsFRorPlatform(container, { L: it.length, W: it.width, H: it.height });
      orient = { l: o.l, w: o.w, h: it.height }; // FR/platform me height unchanged
    } else {
      orient = estimateFitsDryOrHC(container, { L: it.length, W: it.width, H: it.height });
    }

    for (let i = 0; i < qty; i++) {
      unitQueue.push({
        cargoType: it.cargoType,
        color: it.color,
        length: orient.l,
        width: orient.w,
        height: orient.h ?? it.height, // OT/Dry/HC ke case me h milta hai
      });
    }
  }

  // Largest-first sorting (volume desc, tie: footprint desc, then height)
  unitQueue.sort((a, b) => {
    const va = a.length * a.width * a.height;
    const vb = b.length * b.width * b.height;
    if (vb !== va) return vb - va;
    const fa = a.length * a.width, fb = b.length * b.width;
    if (fb !== fa) return fb - fa;
    return b.height - a.height;
  });

  // Timeline rebuild
  let fs = [{ x: 0, y: 0, z: 0, L: container.length, W: container.width, H: container.height }];
  const newTimeline = [];

  for (const u of unitQueue) {
    const res = (function () {
      const hFit = targetCat === "OT" ? Math.min(u.height, container.height) : u.height;
      for (let i = 0; i < fs.length; i++) {
        const s = fs[i];
        if (u.length <= s.L && u.width <= s.W && hFit <= s.H) {
          const pos = [
            (s.x + u.length / 2) - container.length / 2,
            (s.y + hFit / 2) - container.height / 2,
            (s.z + u.width / 2) - container.width / 2,
          ];
          const newFs = fs.slice();
          newFs.splice(i, 1);
          const right = { x: s.x + u.length, y: s.y, z: s.z, L: s.L - u.length, W: s.W, H: s.H };
          const up = { x: s.x, y: s.y + hFit, z: s.z, L: u.length, W: s.W, H: s.H - hFit };
          const front = { x: s.x, y: s.y, z: s.z + u.width, L: u.length, W: s.W - u.width, H: hFit };
          if (right.L > 0 && right.W > 0 && right.H > 0) newFs.push(right);
          if (up.L > 0 && up.W > 0 && up.H > 0) newFs.push(up);
          if (front.L > 0 && front.W > 0 && front.H > 0) newFs.push(front);
          fs = newFs;
          return { ok: true, position: pos, swapped: false };
        }
        if (u.width <= s.L && u.length <= s.W && hFit <= s.H) {
          const pos = [
            (s.x + u.width / 2) - container.length / 2,
            (s.y + hFit / 2) - container.height / 2,
            (s.z + u.length / 2) - container.width / 2,
          ];
          const newFs = fs.slice();
          newFs.splice(i, 1);
          const right = { x: s.x + u.width, y: s.y, z: s.z, L: s.L - u.width, W: s.W, H: s.H };
          const up = { x: s.x, y: s.y + hFit, z: s.z, L: u.width, W: s.W, H: s.H - hFit };
          const front = { x: s.x, y: s.y, z: s.z + u.length, L: u.width, W: s.W - u.length, H: hFit };
          if (right.L > 0 && right.W > 0 && right.H > 0) newFs.push(right);
          if (up.L > 0 && up.W > 0 && up.H > 0) newFs.push(up);
          if (front.L > 0 && front.W > 0 && front.H > 0) newFs.push(front);
          fs = newFs;
          return { ok: true, position: pos, swapped: true };
        }
      }
      return { ok: false, position: null };
    })();
    if (!res.ok) break;

    const finalL = res.swapped ? u.width : u.length;
    const finalW = res.swapped ? u.length : u.width;

    newTimeline.push({
      ...u,
      length: finalL,
      width: finalW,
      position: res.position,
      renderGroupId: "repacked",
      // Sort by Min Coordinates (Corner) for stable "Wall" building
      sortPos: { 
        x: res.position[0] - finalL / 2, 
        y: res.position[1] - u.height / 2, 
        z: res.position[2] - finalW / 2 
      },
    });
  }

  // UPDATED SORTING: Back-to-Front (X) -> Bottom-to-Top (Y) -> Left-to-Right (Z)
  newTimeline.sort((a, b) => {
    // 1. Group/Base X (Back to Front) - PRIMARY for Wall Building effect
    // Use Min X (Start position) to group items in the same vertical plane
    const xA = a.sortPos?.x ?? (a.position[0] - a.length / 2);
    const xB = b.sortPos?.x ?? (b.position[0] - b.length / 2);
    if (Math.abs(xA - xB) > 0.001) return xA - xB;

    // 2. Group/Base Y (Vertical) - SECONDARY
    const yA = a.sortPos?.y ?? (a.position[1] - a.height / 2);
    const yB = b.sortPos?.y ?? (b.position[1] - b.height / 2);
    if (Math.abs(yA - yB) > 0.001) return yA - yB;

    // 3. Group/Base Z (Left to Right)
    const zA = a.sortPos?.z ?? (a.position[2] - a.width / 2);
    const zB = b.sortPos?.z ?? (b.position[2] - b.width / 2);
    if (Math.abs(zA - zB) > 0.001) return zA - zB;

    return 0;
  });

  setTimeline(newTimeline);
  setPlayhead(newTimeline.length);
  setIsPlaying(false);
  setFreeSpaces(fs);
}, [items, container, mode, selectedSize, selectedTruck, usePallets, setTimeline, setPlayhead, setIsPlaying, setNextPosition]);


  // Suggest (containers OR trucks)
  const handleSuggest = () => {
    if (isLiquid) {
      const weight = computedLiquidWeight();
      const res = suggestContainers({ L: 1, W: 1, H: 1, weight, cargoType: "Liquid" });
      setSuggestions(res);
      setOpenSuggest(true);
      return;
    }

    const weight = toKg(Number(form.weight) || 0, weightUnit); // always kg

    const L = parseToMeters(form.length, unit);
    const W = parseToMeters(form.width, unit);
    const H = parseToMeters(form.height, unit);

    if (!Number.isFinite(L) || !Number.isFinite(W) || !Number.isFinite(H) || (Number(form.quantity) || 0) <= 0 || weight <= 0) {
      alert("Please enter valid L/W/H, qty and weight first.");
      return;
    }

    const res = (mode === "Truck")
      ? suggestTrucks({ L, W, H, weight, cargoType })
      : suggestContainers({ L, W, H, weight, cargoType });

    setSuggestions(res);
    setOpenSuggest(true);
  };

  // Totals:
  const boxTotalVol = container.length * container.width * container.height;
  const tankTotalVolM3 = isTank ? (TANK_CAPACITY_L[selectedSize] || 24000) / 1000 : 0;
  const totalVolumeForBars = isTank ? tankTotalVolM3 : boxTotalVol;

  const usedVolume = items.reduce((s, it) => {
    if (it.cargoType === "Liquid") return s + (it.liquidM3 || 0);
    const hCap = getCategory(mode === "Container" ? selectedSize : selectedTruck) === "OT"
      ? Math.min(it.height, container.height)
      : it.height;
    return s + it.length * it.width * hCap * (it.quantity || 1);
  }, 0);

  // const remainingVolume = Math.max(0, totalVolumeForBars - usedVolume);
  // const fillPercent = totalVolumeForBars > 0 ? (usedVolume / totalVolumeForBars) * 100 : 0;

  const usedWeight = items.reduce((s, it) => s + (it.weight || 0) * (it.quantity || 1), 0);
  // const weightPercent = maxWeight > 0 ? (usedWeight / maxWeight) * 100 : 0;

  // Info chips
  const containerInfo = useMemo(() => {
    const name = mode === "Container" ? selectedSize : selectedTruck;
    const { length, width, height, maxWeight } = container;
    const volInfo = isTank
      ? `${fmt2(tankTotalVolM3)} m³ (nominal)`
      : `${fmt2(length * width * height)} m³`;
    const notes =
      mode === "Truck"
        ? TRUCK_NOTES[selectedTruck] || "Truck"
        : (name.toLowerCase().includes("reefer") ? "Reefer: insulated, temperature-controlled."
          : name.includes("Tank") ? `Tank: bulk liquids (nominal ${TANK_CAPACITY_L[selectedSize] || 24000} L).`
            : name.includes("HC") ? "High-Cube: extra internal height."
              : name.includes("FR") ? "Flat Rack: over-width/height loads; lashing required."
                : name.includes("Platform") ? "Platform for heavy/oversize loads."
                  : name.includes("OT") ? "Open Top: top-loading; over-height cargo."
                    : name.includes("Bulk") ? "Bulk: granular bulk via roof hatches."
                      : "General dry container.");
    return {
      name,
      dims: `${fmt2(length)} × ${fmt2(width)} × ${fmt2(height)} m`,
      volume: volInfo,
      maxWeight: `${maxWeight} kg`,
      notes,
    };
  }, [mode, selectedSize, selectedTruck, container, isTank, tankTotalVolM3]);

  // ▶ Per-cargo breakdown (packages, volume m³, weight kg)
  const breakdown = useMemo(() => {
    const by = {};
    const targetCat = getCategory(mode === "Container" ? selectedSize : selectedTruck);

    items.forEach((it) => {
      const key = it.cargoType || "Other";
      const qty = it.quantity || 1;

      let vol = 0;
      if (it.cargoType === "Liquid") {
        vol = it.liquidM3 || 0;
      } else {
        const hCap = targetCat === "OT" ? Math.min(it.height, container.height) : it.height;
        vol = (it.length * it.width * hCap) * qty;
      }

      const wt = (it.weight || 0) * qty;
      if (!by[key]) by[key] = { cargo: key, packages: 0, volume: 0, weight: 0 };
      by[key].packages += qty;
      by[key].volume += vol;
      by[key].weight += wt;
    });

    // 🔁 Use the single source of truth
    const rows = Object.values(by).map(r => ({
      ...r,
      color: CARGO_COLORS[r.cargo] || CARGO_COLORS.Other
    }));
    rows.sort((a, b) => b.volume - a.volume);
    return rows;
  }, [items, container, mode, selectedSize, selectedTruck]);


  // CSS-only donut chart style (volume share)
  const donutStyle = useMemo(() => {
    const sum = breakdown.reduce((s, r) => s + (r.volume || 0), 0) || 1;
    let acc = 0;
    const parts = breakdown.map(r => {
      const pct = (r.volume / sum) * 100;
      const seg = `${r.color} ${acc}% ${acc + pct}%`;
      acc += pct;
      return seg;
    }).join(", ");
    return {
      width: 140,
      height: 140,
      borderRadius: "50%",
      background: `conic-gradient(${parts || "#e0e0e0 0% 100%"})`,
      position: "relative",
    };
  }, [breakdown]);


  // ▶ Only show items up to the playhead during playback
  const visibleItems = useMemo(
    () => timeline.slice(0, playhead),
    [timeline, playhead]
  );

  // 3D View Stats Calculation
  const containerVol = container.length * container.width * container.height;
  const currentFilledVol = useMemo(() => {
    return visibleItems.reduce((acc, item) => acc + (item.length * item.width * item.height), 0);
  }, [visibleItems]);
  
  const filledPercent = containerVol > 0 ? (currentFilledVol / containerVol) * 100 : 0;
  const freePercent = Math.max(0, 100 - filledPercent);

  // ▶ Auto-advance playhead while playing
  useEffect(() => {
    if (!isPlaying) return;
    if (playhead >= timeline.length) { setIsPlaying(false); return; }
    const t = setTimeout(() => {
      setPlayhead((p) => Math.min(p + 1, timeline.length));
    }, stepMs);
    return () => clearTimeout(t);
  }, [isPlaying, playhead, timeline.length, stepMs]);

useEffect(() => {
  if (!autoSmartPack) return;
  // Pallet mode me auto-skip
  if (usePallets) return;
  if (items.length > 0) repackLargestFirst();
}, [items, autoSmartPack, usePallets, repackLargestFirst]);

  // Quick presets (non-liquid only)
  const presets = [
    { label: "Euro Pallet 1200×800×144 mm", L: "1200", W: "800", H: "144", unit: "mm" },
    { label: "US Pallet 48×40×6 in", L: "48", W: "40", H: "6", unit: "inch" },
    { label: "Std Carton 600×400×400 mm", L: "600", W: "400", H: "400", unit: "mm" },
    { label: "55-gal Drum Ø23×35 in", L: "23", W: "23", H: "35", unit: "inch" },
  ];
  const applyPreset = (p) => {
    setUnit(p.unit);
    setForm((prev) => ({ ...prev, length: p.L, width: p.W, height: p.H }));
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 4, background: "#f0f4f8", minHeight: "100vh" }}>
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
          📦 3D Load Calculator
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mb: 1 }}>
          Inputs in <b>{unitShort(unit)}</b> • Internal calculations in <b>meters</b> {isTank && <>• Tank volume bars use <b>nominal capacity</b></>}
        </Typography>

        {/* --- TABS --- */}
        <Paper elevation={4} sx={{ mt: 2, borderRadius: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={{
              px: 1.5,
              pt: 1.5,
              "& .MuiTabs-flexContainer": {
                gap: 8,
                background: "linear-gradient(180deg,#f7fbff,#eef4ff)",
                p: 0.75,
                borderRadius: 12,
                border: "1px solid #e5edff",
              },
              "& .MuiTab-root": {
                fontWeight: 800,
                minHeight: 44,
                borderRadius: 10,
                textTransform: "none",
                color: "#334155",
                "&.Mui-selected": {
                  background: "#ffffff",
                  boxShadow: "0 8px 20px rgba(30,136,229,.12)",
                },
              },
              "& .MuiTabs-indicator": { height: 0 },
            }}
          >
            <Tab
              id="tab-0"
              icon={<LocalShippingIcon />}
              iconPosition="start"
              label="Containers & Trucks"
            />
            <Tab
              id="tab-1"
              icon={<Inventory2Icon />}
              iconPosition="start"
              label="Products"
            />
            <Tab
              id="tab-2"
              icon={<ViewInArIcon />}
              iconPosition="start"
              label="Stuffing Result"
            />

          </Tabs>


          {/* TAB 1: Select Target */}
          <TabPanel value={tab} index={0}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2} alignItems="center">
                {/* Mode */}
                {/* <Grid item xs={12} md="auto">
                  <FormControl size="small">
                    <InputLabel>Target</InputLabel>
                    <Select value={mode} label="Target" onChange={(e) => handleModeChange(e.target.value)}>
                      <MenuItem value="Container">Container</MenuItem>
                      <MenuItem value="Truck">Truck</MenuItem>
                    </Select>
                  </FormControl>
                </Grid> */}
                {/* Mode (Target) — tab-style buttons */}
                <Grid item xs={12} md="auto">
                  <Tabs
                    value={mode}
                    onChange={(_, v) => v && handleModeChange(v)}
                    aria-label="Select target"
                    sx={{
                      minHeight: 40,
                      "& .MuiTabs-flexContainer": {
                        gap: 8,
                        background: "linear-gradient(180deg,#f7fbff,#eef4ff)",
                        padding: "6px",
                        borderRadius: "12px",
                        border: "1px solid #e5edff",
                      },
                      "& .MuiTab-root": {
                        minHeight: 36,
                        padding: "8px 14px",
                        borderRadius: "10px",
                        textTransform: "none",
                        fontWeight: 800,
                        color: "#334155",
                      },
                      "& .Mui-selected": {
                        color: "#0b3a86 !important",
                        background: "#ffffff",
                        boxShadow: "0 8px 20px rgba(30,136,229,.12)",
                      },
                      "& .MuiTabs-indicator": { display: "none" }, // pill look (no underline)
                    }}
                  >
                    <Tab
                      value="Container"
                      icon={<ViewInArIcon fontSize="small" />}
                      iconPosition="start"
                      label="Container"
                      disableRipple
                    />
                    <Tab
                      value="Truck"
                      icon={<LocalShippingIcon fontSize="small" />}
                      iconPosition="start"
                      label="Truck"
                      disableRipple
                    />
                  </Tabs>
                </Grid>


                {/* Units quick switch */}
                {/* <Grid item xs={12} md="auto">
                  <FormControl size="small" disabled={mode === "Container" && selectedSize.includes("Tank") && cargoType === "Liquid"}>
                    <InputLabel>Units</InputLabel>
                    <Select value={unit} label="Units" onChange={(e) => handleUnitSwitch(e.target.value)}>
                      <MenuItem value="mm">mm</MenuItem>
                      <MenuItem value="cm">cm</MenuItem>
                      <MenuItem value="m">m</MenuItem>
                      <MenuItem value="inch">inch</MenuItem>
                      <MenuItem value="ft">feet</MenuItem>
                    </Select>
                  </FormControl>
                </Grid> */}

                {/* Info chips */}
                <Grid item xs={12}>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip label={`Mode: ${mode}`} />
                    <Chip label={`Type: ${containerInfo.name}`} />
                    <Chip label={`Internal: ${containerInfo.dims}`} />
                    <Chip label={`Volume: ${containerInfo.volume}`} />
                    <Chip label={`Max Payload: ${containerInfo.maxWeight}`} />
                    <Chip label={`Notes: ${containerInfo.notes}`} />
                  </Stack>
                </Grid>

                {/* Gallery */}
                <Grid item xs={12}>
                  {mode === "Container" ? (
                    <TypeGallery
                      items={CONTAINER_CATALOG}
                      selectedKey={selectedSize}
                      onUse={(k) => {
                        handleContainerChange(k);
                        setTab(1);              // ⬅️ Auto-jump to Products tab
                      }}
                      onInfo={(it) => openInfo(it)}
                    />
                  ) : (
                    <TypeGallery
                      items={TRUCK_CATALOG}
                      selectedKey={selectedTruck}
                      onUse={(k) => {
                        handleTruckChange(k);
                        setTab(1);              // ⬅️ Auto-jump to Products tab
                      }}
                      onInfo={(it) => openInfo(it)}
                    />
                  )}
                </Grid>

                {/* If Custom container selected, show safe numeric inputs */}
                {mode === "Container" && selectedSize === "Custom" && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>Custom container specs:</Typography>
                    <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
                      {["length", "width", "height", "maxWeight"].map((dim) => (
                        <TextField
                          key={dim}
                          label={dim === "maxWeight" ? "maxWeight (kg)" : `${dim} (m)`}
                          name={dim}
                          type="number"
                          value={customSize[dim] ?? ""}
                          onChange={handleCustomChange}   // ✅ FIXED handler
                          size="small"
                          inputProps={{ min: 0, step: dim === "maxWeight" ? 1 : "any" }}
                        />
                      ))}
                    </Stack>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button variant="contained" onClick={() => setTab(1)}>
                  Next: Add Products
                </Button>
              </Stack>
            </Box>
          </TabPanel>

          {/* TAB 2: Add Products */}
          <TabPanel value={tab} index={1}>
            <Box sx={{ p: 3 }}>
              {/* Tips + Presets */}
              <Paper elevation={1} sx={{ p: 2, mb: 2, background: "linear-gradient(180deg,#f7fbff,#ffffff)" }}>
                <Accordion sx={{ my: 0 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <HelpOutlineIcon fontSize="small" />
                      <Typography variant="subtitle2">How to enter size (beginner tips)</Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {isLiquid ? (
                        <>
                          • Liquids ke liye L×W×H nahi — bas <b>Volume (Liters)</b> aur <b>SG</b> (e.g., water 1.0).<br />
                          • Safety ke liye <b>Max Fill %</b> (default 95%).<br />
                          • Weight auto = <b>Liters × SG</b> (kg).
                        </>
                      ) : (
                        <>
                          • Unit choose karo (mm/cm/m/in/ft). Placeholder format dikhata rahega.<br />
                          • Feet–inches: <b>5'10"</b> (5 ft 10 in).<br />
                          • Helper <b>= Xm</b> meters me live show karega.<br />
                          • Barrel/Roll render me diameter = width.
                        </>
                      )}
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                {!isLiquid && (
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, flexWrap: "wrap" }}>
  <Typography variant="subtitle2" sx={{ mr: 1 }}>Quick Presets:</Typography>

  {presets.map((p) => (
    <Chip
      key={p.label}
      variant="outlined"
      label={p.label}
      onClick={() => applyPreset(p)}
      sx={{ borderStyle: "dashed" }}
    />
  ))}

  <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
    {/* L/W/H unit toggle (as-is) */}
    <ToggleButtonGroup
      size="small"
      value={unit}
      exclusive
      onChange={(_, v) => v && handleUnitSwitch(v)}
    >
      <ToggleButton value="mm">mm</ToggleButton>
      <ToggleButton value="cm">cm</ToggleButton>
      <ToggleButton value="m">m</ToggleButton>
      <ToggleButton value="inch">inch</ToggleButton>
      <ToggleButton value="ft">feet</ToggleButton>
    </ToggleButtonGroup>

    {/* NEW: Weight unit toggle */}
    <ToggleButtonGroup
      size="small"
      value={weightUnit}
      exclusive
      onChange={(_, v) => v && handleWeightUnitChange(v)}
    >
      <ToggleButton value="kg">kg</ToggleButton>
      <ToggleButton value="lb">lbs</ToggleButton>
    </ToggleButtonGroup>

    {/* Quick conversion hint for current input */}
    <Chip
      size="small"
      variant="outlined"
      label={
        weightUnit === "kg"
          ? `wt: ${Number(form.weight) || 0} kg ≈ ${(Number(form.weight) ? (Number(form.weight) / LB_TO_KG) : 0).toFixed(2)} lb`
          : `wt: ${Number(form.weight) || 0} lb ≈ ${(Number(form.weight) ? (Number(form.weight) * LB_TO_KG) : 0).toFixed(2)} kg`
      }
    />
  </Box>
</Stack>

                )}
              </Paper>

              {/* Main Form Cards */}
              <Grid container spacing={2}>
                {/* Left card: Item details */}
                {/* Left card: Item details — now SINGLE ROW */}
                <Grid item xs={12} md={7}>
                  <Divider sx={{ my: 1.5 }} />

<Typography variant="subtitle2" sx={{ mb: 1 }}>
  Previous inputs
</Typography>

{entries.length === 0 ? (
  <Typography variant="body2" color="text.secondary">No entries yet.</Typography>
) : (
  <Stack spacing={1.25}>
    {entries.map((e) => (
      <Paper key={e.id} variant="outlined" sx={{ p: 1.25, overflowX: "auto" }}>
        <Box
          sx={{
            display: "flex",
            gap: 1.25,
            alignItems: "center",
            flexWrap: "nowrap",
            minWidth: 980, // same row layout, scrollable
          }}
        >
          <TextField
            label="Cargo Type"
            value={e.cargoType}
            size="small"
            disabled
            sx={{ width: 220 }}
          />

          <TextField
            label="Product Name"
            value={e.productName || ""}
            size="small"
            disabled
            sx={{ width: 240 }}
          />

          

          {e.isLiquid ? (
            <>
              <TextField
                label="Volume"
                value={e.liquidVolume || ""}
                size="small"
                disabled
                sx={{ width: 160 }}
                InputProps={{ endAdornment: <InputAdornment position="end">L</InputAdornment> }}
              />
              <TextField
                label="SG"
                value={e.sg}
                size="small"
                disabled
                sx={{ width: 110 }}
              />
              <TextField
                label="Max Fill %"
                value={e.maxFillPercent}
                size="small"
                disabled
                sx={{ width: 130 }}
              />
              <TextField
                label="Weight"
                value={fmt2(e.weight)}
                size="small"
                disabled
                sx={{ width: 140 }}
                InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
              />
              <TextField
                label="Qty"
                value={e.quantity}
                size="small"
                disabled
                sx={{ width: 100 }}
              />
              <TextField
            label="Color"
            type="color"
            value={e.color}
            size="small"
            disabled
            sx={{ width: 90 }}
          />
            </>
          ) : (
            <>
              <TextField
                label="length"
                value={e.length}
                size="small"
                disabled
                sx={{ width: 150 }}
                InputProps={{ endAdornment: <InputAdornment position="end">{unitShort(e.unit)}</InputAdornment> }}
              />
              <TextField
                label="width"
                value={e.width}
                size="small"
                disabled
                sx={{ width: 150 }}
                InputProps={{ endAdornment: <InputAdornment position="end">{unitShort(e.unit)}</InputAdornment> }}
              />
              <TextField
                label="height"
                value={e.height}
                size="small"
                disabled
                sx={{ width: 150 }}
                InputProps={{ endAdornment: <InputAdornment position="end">{unitShort(e.unit)}</InputAdornment> }}
              />
              <TextField
                label="weight"
                value={e.weight}
                size="small"
                disabled
                sx={{ width: 140 }}
                InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
              />
              <TextField
                label="quantity (added)"
                value={e.quantity}
                size="small"
                disabled
                sx={{ width: 150 }}
              />
              <TextField
            label="Color"
            type="color"
            value={e.color}
            size="small"
            disabled
            sx={{ width: 90 }}
          />
            </>
          )}

          <IconButton
            color="error"
            size="small"
            onClick={() => {
              const groupId = e.id;
              setItems((prev) => prev.filter((it) => it.renderGroupId !== groupId));
              setTimeline((prev) => {
                const nt = prev.filter((r) => r.renderGroupId !== groupId);
                setPlayhead((p) => Math.min(p, nt.length));
                return nt;
              });
              setEntries((prev) => prev.filter((s) => s.id !== groupId));
            }}
            title="Remove this entry"
            sx={{ ml: 0.5 }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>
    ))}
  </Stack>
)}
                  <Paper elevation={1} sx={{ p: 2, overflowX: "auto" }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>➕ Add Item</Typography>

                    {/* Row container */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1.25,
                        alignItems: "center",
                        flexWrap: "nowrap",
                        minWidth: 980,           // fields ek hi row me; chhote screens par scroll
                        pb: 0.5,
                      }}
                    >
                      {/* Cargo type */}
                      <FormControl size="small" sx={{ width: 220 }}>
                        <InputLabel>Cargo Type</InputLabel>
                        <Select
                          value={cargoType}
                          label="Cargo Type"
                          onChange={(e) => {
                            const val = e.target.value;
                            setCargoType(val);
                            if (autoColor) setForm((prev) => ({ ...prev, color: CARGO_COLORS[val] || prev.color }));
                          }}
                          renderValue={(val) => (
                            <Stack direction="row" spacing={1} alignItems="center">
                              {cargoIcon(val)}
                              <span>{val}</span>
                            </Stack>
                          )}
                        >
                          {allowedTypes.map((t) => (
                            <MenuItem key={t} value={t}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                {cargoIcon(t)}
                                <span>{t}</span>
                              </Stack>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Product name */}
                      <TextField
                        label="Product Name"
                        name="productName"
                        value={form.productName}
                        onChange={handleFormChange}
                        type="text"
                        size="small"
                        sx={{ width: 240 }}
                      />



                      {/* LIQUID vs NON-LIQUID (inline) */}
                      {isLiquid && isTank ? (
                        <>
                          <TextField
                            label="Volume (L)"
                            name="liquidVolume"
                            value={form.liquidVolume}
                            onChange={handleFormChange}
                            type="number"
                            size="small"
                            inputProps={{ min: 0, step: "any" }}
                            sx={{ width: 160 }}
                            InputProps={{ endAdornment: <InputAdornment position="end">L</InputAdornment> }}
                          />
                          <TextField
                            label="SG"
                            name="sg"
                            value={form.sg}
                            onChange={handleFormChange}
                            type="number"
                            size="small"
                            inputProps={{ min: 0.1, step: 0.01 }}
                            sx={{ width: 110 }}
                          />
                          <TextField
                            label="Max Fill %"
                            name="maxFillPercent"
                            value={form.maxFillPercent}
                            onChange={handleFormChange}
                            type="number"
                            size="small"
                            inputProps={{ min: 50, max: 100, step: 1 }}
                            sx={{ width: 130 }}
                          />
                          {/* Color */}
                          <TextField
                            label="Color"
                            name="color"
                            type="color"
                            value={form.color}
                            onChange={(e) => { setAutoColor(false); handleFormChange(e); }}
                            size="small"
                            sx={{ width: 90 }}
                          />
                          <Button
                            variant="contained"
                            onClick={addItem}
                            disabled={!(Number(form.liquidVolume) > 0 && Number(form.sg) > 0)}
                            sx={{ background: "linear-gradient(90deg,#1e88e5,#42a5f5)", width: 120 }}
                          >
                            Add
                          </Button>

                          <Chip
                            color="info"
                            variant="outlined"
                            label={`≈ ${fmt2(computedLiquidWeight())} kg`}
                            sx={{ ml: 0.5 }}
                          />
                        </>
                      ) : (
                        <>
                          {/* L, W, H in a row */}
                          {["length", "width", "height"].map((field) => {
                            const meters = field === "length" ? mLength : field === "width" ? mWidth : mHeight;
                            const u = unitShort(unit);
                            return (
                              <TextField
                                key={field}
                                label={field}
                                name={field}
                                value={form[field]}
                                onChange={handleFormChange}
                                type="text"
                                size="small"
                                placeholder={exampleByUnit(unit)}
                                error={!Number.isFinite(meters)}
                                sx={{ width: 150 }}
                                InputProps={{ endAdornment: <InputAdornment position="end">{u}</InputAdornment> }}
                              />
                            );
                          })}

                          <TextField
  label="weight"
  name="weight"
  value={form.weight}
  onChange={handleFormChange}
  type="number"
  size="small"
  inputProps={{ min: 0.1, step: 0.1 }}
  sx={{ width: 160 }}
  InputProps={{
    endAdornment: <InputAdornment position="end">{weightUnit}</InputAdornment>,
  }}
/>


                          <TextField
                            label="quantity"
                            name="quantity"
                            value={form.quantity}
                            onChange={handleFormChange}
                            type="number"
                            size="small"
                            inputProps={{ min: 1, step: 1 }}
                            sx={{ width: 130 }}
                          />
                          {/* Color */}
                          <TextField
                            label="Color"
                            name="color"
                            type="color"
                            value={form.color}
                            onChange={(e) => { setAutoColor(false); handleFormChange(e); }}
                            size="small"
                            sx={{ width: 90 }}
                          />
                          <Button
                            variant="contained"
                            onClick={addItem}
                            disabled={!form.length || !form.width || !form.height || !Number(form.quantity) || !Number(form.weight)}
                            sx={{ background: "linear-gradient(90deg,#1e88e5,#42a5f5)", width: 120 }}
                          >
                            Add
                          </Button>
                        </>
                      )}
                    </Box>
                    

                  </Paper>
                </Grid>


                {/* Right card: Palletization + Live capacity */}
                <Grid item xs={12} md={5}>
                  <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                      <Switch
                        checked={usePallets}
                        onChange={(e) => setUsePallets(e.target.checked)}
                        inputProps={{ "aria-label": "Use pallets" }}
                      />
                      <Typography variant="subtitle1" fontWeight={800}>Use pallets</Typography>
                      <Tooltip title="Cartons ko pallet par stack karenge. Height/weight limits follow honge.">
                        <HelpOutlineIcon fontSize="small" />
                      </Tooltip>
                    </Stack>

                    {usePallets && (
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormControl size="small" sx={{ minWidth: 220 }}>
                            <InputLabel>Pallets type</InputLabel>
                            <Select
                              label="Pallets type"
                              value={palletType}
                              onChange={(e) => {
                                const t = e.target.value;
                                setPalletType(t);
                                setPalletSpec({ ...PALLET_PRESETS[t] });
                              }}
                            >
                              {Object.keys(PALLET_PRESETS).map((k) => (
                                <MenuItem key={k} value={k}>{k}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        {palletType === "Custom Pallets" && (
                          <Grid item xs={12}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Switch
                                checked={autoFitCustomPallet}
                                onChange={(e) => setAutoFitCustomPallet(e.target.checked)}
                                inputProps={{ "aria-label": "Auto-fit custom pallet to gaps" }}
                              />
                              <Typography variant="subtitle2" fontWeight={700}>
                                Auto-fit custom pallet to remaining gap
                              </Typography>
                            </Stack>
                          </Grid>
                        )}

                        <Grid item xs={6}>
                          <TextField
                            size="small"
                            label={`Length (${unitShort(unit)})`}
                            value={palletMetersToUI(palletSpec.length, unit)}
                            onChange={(e) => setPalletSpec((p) => ({ ...p, length: Math.max(0, palletFieldToMeters(e.target.value, unit)) }))}
                            disabled={palletType !== "Custom Pallets"}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            size="small"
                            label={`Width (${unitShort(unit)})`}
                            value={palletMetersToUI(palletSpec.width, unit)}
                            onChange={(e) => setPalletSpec((p) => ({ ...p, width: Math.max(0, palletFieldToMeters(e.target.value, unit)) }))}
                            disabled={palletType !== "Custom Pallets"}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            size="small"
                            label={`Max Height (${unitShort(unit)})`}
                            value={palletMetersToUI(palletSpec.maxHeight, unit)}
                            onChange={(e) => setPalletSpec((p) => ({ ...p, maxHeight: Math.max(0, palletFieldToMeters(e.target.value, unit)) }))}
                            disabled={palletType !== "Custom Pallets"}
                            helperText="Pallet + cartons total"
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            size="small"
                            label={`Base/Deck (${unitShort(unit)})`}
                            value={palletMetersToUI(palletSpec.baseHeight, unit)}
                            onChange={(e) => setPalletSpec((p) => ({ ...p, baseHeight: Math.max(0, palletFieldToMeters(e.target.value, unit)) }))}
                            disabled={palletType !== "Custom Pallets"}
                            helperText="Pallet thickness"
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={8}>
                          <TextField
                            size="small"
                            label="Max Weight (kg)"
                            type="number"
                            value={palletSpec.maxWeight}
                            onChange={(e) => setPalletSpec((p) => ({ ...p, maxWeight: Math.max(0, Number(e.target.value) || 0) }))}
                            disabled={palletType !== "Custom Pallets"}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            size="small"
                            type="color"
                            label="Color"
                            value={palletSpec.color}
                            onChange={(e) => setPalletSpec((p) => ({ ...p, color: e.target.value }))}
                            disabled={palletType !== "Custom Pallets"}
                            sx={{ width: "100%" }}
                          />
                        </Grid>
                      </Grid>
                    )}
                  </Paper>

                  {/* Live capacity bars */}
                  <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Capacity so far</Typography>
                    <Stack spacing={1}>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption">Volume</Typography>
                          <Typography variant="caption">
                            {fmt2(usedVolume)} m³ / {fmt2(totalVolumeForBars)} m³
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, totalVolumeForBars ? (usedVolume / totalVolumeForBars) * 100 : 0)}
                          sx={{ height: 8, borderRadius: 6 }}
                        />
                      </Stack>

                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption">Weight</Typography>
                          <Typography variant="caption">
                            {fmt2(usedWeight)} kg / {maxWeight} kg
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, maxWeight ? (usedWeight / maxWeight) * 100 : 0)}
                          color="secondary"
                          sx={{ height: 8, borderRadius: 6 }}
                        />
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              {/* Action row */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center" sx={{ mt: 2 }}>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" onClick={handleSuggest}>
                    Suggest {mode === "Truck" ? "Truck" : "Container"}
                  </Button>
                </Stack>

                <Box sx={{ flex: 1 }} />

                <Stack direction="row" spacing={1}>
                  <Button variant="text" onClick={() => setTab(0)}>Back</Button>
                  <Button variant="contained" onClick={() => setTab(2)}>Next: 3D Result</Button>
                </Stack>
              </Stack>

              
            </Box>
          </TabPanel>


          {/* TAB 3: 3D Stuffing Result */}
          <TabPanel value={tab} index={2}>
            <Box sx={{ p: 3 }}>
              {/* Card 1: Selected target quick card */}
              <Paper elevation={1} sx={{ mb: 2, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ width: 140, height: 100, bgcolor: "#f5f7fb", borderRadius: 1.5, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img
                          src={mode === "Container" ? imgFor(selectedSize) : imgTruckFor(selectedTruck)}
                          alt={containerInfo.name}
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>{containerInfo.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          weight: {fmt2(usedWeight)} kg / {maxWeight} kg
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          volume: {fmt2(usedVolume)} m³ / {fmt2(totalVolumeForBars)} m³
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={9}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip label={`Internal: ${containerInfo.dims}`} />
                      <Chip label={`Notes: ${containerInfo.notes}`} />
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>

              {/* Card 2: Totals + Donut + Breakdown + 3D VIEW */}
              <Paper elevation={1} sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  {/* Left: stats + button */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" sx={{ mb: 1 }}>{containerInfo.name} #{1}</Typography>
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Typography variant="body2"><b>Total</b> &nbsp;&nbsp;{items.reduce((s, it) => s + (it.quantity || 1), 0)} packages</Typography>
                      <Typography variant="body2">
                        <b>Cargo volume</b> &nbsp;&nbsp;{fmt2(usedVolume)} m³ ({fmt2(Math.min(100, (totalVolumeForBars > 0 ? (usedVolume / totalVolumeForBars) * 100 : 0)))}% of volume)
                      </Typography>
                      <Typography variant="body2">
                        <b>Cargo weight</b> &nbsp;&nbsp;{fmt2(usedWeight)} kg ({fmt2(Math.min(100, (maxWeight > 0 ? (usedWeight / maxWeight) * 100 : 0)))}% of max weight)
                      </Typography>
                    </Stack>

                    <Button variant="contained" onClick={() => setOpen3D(true)}>
                      3D VIEW
                    </Button>
                  </Grid>

                  {/* Middle: Donut */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <Box sx={donutStyle}>
                        <Box sx={{
                          position: "absolute", inset: 18, borderRadius: "50%", bgcolor: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexDirection: "column"
                        }}>
                          <Typography variant="caption" color="text.secondary">Volume</Typography>
                          <Typography variant="subtitle2">{fmt2(usedVolume)} m³</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Right: Breakdown table */}
                  <Grid item xs={12} md={4}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Name</strong></TableCell>
                          <TableCell align="right"><strong>Packages</strong></TableCell>
                          <TableCell align="right"><strong>Volume</strong></TableCell>
                          <TableCell align="right"><strong>Weight</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {breakdown.map((r, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: r.color }} />
                                {r.cargo}
                              </Stack>
                            </TableCell>
                            <TableCell align="right">{r.packages}</TableCell>
                            <TableCell align="right">{fmt2(r.volume)} m³</TableCell>
                            <TableCell align="right">{fmt2(r.weight)} kg</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </TabPanel>

        </Paper>

        {/* Suggestion Dialog */}
        <Dialog open={openSuggest} onClose={() => setOpenSuggest(false)} maxWidth="md" fullWidth>
          <DialogTitle>Suggested {mode === "Truck" ? "Trucks" : "Containers"} for this cargo</DialogTitle>
          <DialogContent dividers>
            {suggestions.length === 0 ? (
              <Typography>No suitable {mode === "Truck" ? "trucks" : "containers"} found. Try changing size or inputs.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>{mode === "Truck" ? "Truck" : "Container"}</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell align="right"><strong>Fit (pcs)</strong></TableCell>
                    <TableCell align="right"><strong>Utilization</strong></TableCell>
                    <TableCell><strong>Reasons</strong></TableCell>
                    <TableCell><strong>Warnings</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {suggestions.map((s) => (
                    <TableRow key={s.containerType}>
                      <TableCell><b>{s.containerType}</b></TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={s.category}
                          color={
                            /Reefer/i.test(s.category) ? "info" :
                              /HC|Dry/i.test(s.category) ? "primary" :
                                /Flat|Step|FR|Platform/i.test(s.category) ? "secondary" :
                                  "warning"
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">{s.fits}</TableCell>
                      <TableCell align="right">
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, s.utilization)}
                          sx={{ height: 8, borderRadius: 6, minWidth: 120 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack component="ul" sx={{ m: 0, pl: 2 }}>
                          {s.reasons.map((r, i) => <li key={i}>{r}</li>)}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {s.warnings.map((w, i) => (
                            <Chip key={i} size="small" color="warning" variant="outlined" label={w} />
                          ))}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>

              </Table>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSuggest(false)}>Close</Button>
          </DialogActions>
        </Dialog>
        {/* 3D VIEW Dialog with playback */}
        <Dialog open={open3D} onClose={() => setOpen3D(false)} maxWidth="lg" fullWidth>
          <DialogTitle>3D View – Stuffing Playback</DialogTitle>
          <DialogContent dividers>

            {/* Suggestion Box for Remaining Space */}
            {nextSuggestion && showSuggestion && (
              <Paper elevation={3} sx={{ mb: 2, p: 2, bgcolor: "#e3f2fd", borderLeft: "6px solid #2196f3" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                      💡Capacity management
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      To fill the remaining space, add <b>{nextSuggestion.qty}</b> item(s) with these dimensions:
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    color="secondary"
                    onClick={() => {
                        // 1. Get raw suggestions
                        const rawL = nextSuggestion.L;
                        const rawW = nextSuggestion.W;
                        const rawH = nextSuggestion.H;

                        // Helper: Convert meters to UI unit
                        const toSafeUI = (m, u) => {
                          const EPS = 0.0005; 
                          const val = Math.max(0, m - EPS); 
                          switch (u) {
                            case "mm": return Math.floor(val * 1000).toString();
                            case "cm": return (Math.floor(val * 1000) / 10).toString();
                            case "m": return (Math.floor(val * 1000) / 1000).toString();
                            case "inch": return (Math.floor((val / 0.0254) * 100) / 100).toString();
                            case "ft": return (Math.floor((val / 0.3048) * 100) / 100).toString();
                            default: return val.toFixed(3);
                          }
                        };

                        // 2. Convert to UI units (Full dimensions, no pallet base)
                        const uiL = toSafeUI(Math.max(0.01, rawL), unit);
                        const uiW = toSafeUI(Math.max(0.01, rawW), unit);
                        const uiH = toSafeUI(Math.max(0.01, rawH), unit);

                        // 3. Apply to State as Loose Box
                        setUsePallets(false);
                        setCargoType("Box");
                        
                        setForm(prev => ({
                          ...prev,
                          productName: "Custom Fill Box",
                          length: uiL,
                          width: uiW,
                          height: uiH,
                          quantity: nextSuggestion.qty || 1
                        }));
                        setTab(1); // Go to Products tab
                        setOpen3D(false); // Close 3D view
                    }}
                  >
                    Without Pallet
                  </Button>
                  <Button 
                    variant="contained" 
                    size="small"
                    color="primary"
                    onClick={() => {
                        // 1. Get raw suggestions (already has 1mm buffer from useEffect)
                        const rawL = nextSuggestion.L;
                        const rawW = nextSuggestion.W;
                        const rawH = nextSuggestion.H;

                        // Helper: Convert meters to UI unit, rounding DOWN to ensure fit
                        const toSafeUI = (m, u) => {
                          const EPS = 0.0005; // Increased safety margin
                          const val = Math.max(0, m - EPS); 
                          switch (u) {
                            case "mm": return Math.floor(val * 1000).toString();
                            case "cm": return (Math.floor(val * 1000) / 10).toString(); // 1 decimal for cm
                            case "m": return (Math.floor(val * 1000) / 1000).toString();
                            case "inch": return (Math.floor((val / 0.0254) * 100) / 100).toString();
                            case "ft": return (Math.floor((val / 0.3048) * 100) / 100).toString();
                            default: return val.toFixed(3);
                          }
                        };

                        // 2. Convert to UI units (safe floor)
                        const uiL = toSafeUI(Math.max(0.01, rawL), unit);
                        const uiW = toSafeUI(Math.max(0.01, rawW), unit);
                        
                        // 3. Convert back to exact meters to ensure Pallet = Product
                        const exactL = parseToMeters(uiL, unit);
                        const exactW = parseToMeters(uiW, unit);

                        // 4. Handle Height (Base + Product)
                        // Dynamic base: 15cm usually, but if space is tight, shrink base.
                        const baseH = rawH > 0.3 ? 0.15 : Number((rawH * 0.4).toFixed(3));
                        
                        const availProdH = rawH - baseH;
                        const uiH = toSafeUI(Math.max(0.01, availProdH), unit);
                        const exactProdH = parseToMeters(uiH, unit);

                        // 5. Apply to State
                        setUsePallets(true);
                        setPalletType("Custom Pallets");
                        setCargoType("Box"); // Ensure cargo type is compatible with pallets
                        setAutoFitCustomPallet(false); // Strict mode

                        setPalletSpec(prev => ({
                          ...prev,
                          length: exactL,
                          width: exactW,
                          maxHeight: baseH + exactProdH + 0.001, // Add tiny epsilon to ensure floor() > 0
                          baseHeight: baseH
                        }));

                        setForm(prev => ({
                          ...prev,
                          productName: "Custom Fill Pallet",
                          length: uiL,
                          width: uiW,
                          height: uiH,
                          quantity: nextSuggestion.qty || 1
                        }));
                        setTab(1); // Go to Products tab
                        setOpen3D(false); // Close 3D view
                    }}
                  >
                    Use Pallet
                  </Button>
                  </Stack>
                </Stack>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={4}>
                    <Chip label={`Length: ${toUI(nextSuggestion.L, unit)} ${unitShort(unit)}`} color="primary" variant="outlined" sx={{ fontWeight: "bold" }} />
                  </Grid>
                  <Grid item xs={4}>
                    <Chip label={`Width: ${toUI(nextSuggestion.W, unit)} ${unitShort(unit)}`} color="primary" variant="outlined" sx={{ fontWeight: "bold" }} />
                  </Grid>
                  <Grid item xs={4}>
                    <Chip label={`Height: ${toUI(nextSuggestion.H, unit)} ${unitShort(unit)}`} color="primary" variant="outlined" sx={{ fontWeight: "bold" }} />
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* ▶ Controls (ye wahi play/pause/next/prev/speed wale controls hain) */}
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
              <IconButton
                onClick={() => { setIsPlaying(false); setPlayhead((p) => Math.max(0, p - 1)); }}
                disabled={playhead === 0}
                title="Previous"
              >
                <SkipPreviousIcon />
              </IconButton>

              <IconButton
                onClick={() => setIsPlaying((v) => !v)}
                disabled={timeline.length === 0 || (playhead >= timeline.length && !isPlaying)}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>

              <IconButton
                onClick={() => { setIsPlaying(false); setPlayhead((p) => Math.min(timeline.length, p + 1)); }}
                disabled={playhead >= timeline.length}
                title="Next"
              >
                <SkipNextIcon />
              </IconButton>

              <IconButton
                onClick={() => { setPlayhead(0); setIsPlaying(true); }}
                disabled={timeline.length === 0}
                title="Replay"
              >
                <ReplayIcon />
              </IconButton>

              <Chip icon={<SlowMotionVideoIcon />} label="Speed" variant="outlined" sx={{ ml: 1 }} />
              <FormControl size="small" sx={{ minWidth: 90 }}>
                <Select value={stepMs} onChange={(e) => setStepMs(Number(e.target.value))}>
                  <MenuItem value={900}>0.5×</MenuItem>
                  <MenuItem value={600}>1×</MenuItem>
                  <MenuItem value={300}>2×</MenuItem>
                  <MenuItem value={150}>4×</MenuItem>
                </Select>
              </FormControl>

              <Chip label={`${playhead}/${timeline.length} items`} />
            </Stack>
<Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 1 }}>
  <Switch
    checked={autoSmartPack}
    onChange={(e) => setAutoSmartPack(e.target.checked)}
    disabled={usePallets}
  />
  <Chip label="Auto largest-first" variant="outlined" />
  <Button
    variant="outlined"
    onClick={repackLargestFirst}
    disabled={timeline.length === 0 || usePallets}
  >
    Smart Repack
  </Button>
</Stack>

            {/* 3D Canvas */}
            <Box height="520px" borderRadius={3} overflow="hidden" boxShadow={4} sx={{ background: "#fff", position: "relative" }}>
              {/* Overlay Stats */}
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  zIndex: 10,
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(4px)",
                  borderRadius: 2,
                  boxShadow: 3,
                  p: 1.5,
                  minWidth: 140,
                }}
              >
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      FILLED
                    </Typography>
                    <Typography variant="h6" color="primary.main" fontWeight="800" lineHeight={1}>
                      {filledPercent.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Divider />
                  <Box 
                    onClick={() => {
                        if (nextSuggestion) setShowSuggestion(true);
                    }}
                    sx={{ 
                        cursor: nextSuggestion ? "pointer" : "default",
                        "&:hover": nextSuggestion ? { bgcolor: "rgba(0,0,0,0.04)", borderRadius: 1 } : {}
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        FREE
                        </Typography>
                        {nextSuggestion && (
                            <Tooltip title="Click for Capacity management">
                                <HelpOutlineIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                            </Tooltip>
                        )}
                    </Stack>
                    <Typography variant="h6" color="success.main" fontWeight="800" lineHeight={1}>
                      {freePercent.toFixed(1)}%
                    </Typography>
                    {nextSuggestion && !showSuggestion && (
                        <Typography variant="caption" color="primary" sx={{ display: 'block', fontSize: '0.7rem', mt: 0.5 }}>
                            Tap for Suggestion
                        </Typography>
                    )}
                  </Box>
                </Stack>
              </Box>

              <Canvas camera={{ position: [10, 5, 10], fov: 50 }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[5, 8, 5]} intensity={0.9} />
                <OrbitControls />
                <ContainerBox size={container} type={mode === "Container" ? selectedSize : selectedTruck} />
                <ContactShadows position={[0, -container.height / 2 + 0.005, 0]} opacity={0.3} blur={1.5} far={20} />

                {visibleItems.map((ri, i) => (
                  <CargoMesh
                    key={`${ri.renderGroupId}-${i}`}
                    cargoType={ri.cargoType}
                    position={ri.position}
                    dims={[ri.length, ri.height, ri.width]}
                    color={ri.color}
                  />
                ))}
              </Canvas>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen3D(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Info Dialog (image + spec sheet) */}
        <Dialog open={infoOpen} onClose={closeInfo} maxWidth="sm" fullWidth>
          <DialogTitle>{infoItem?.title}</DialogTitle>
          <DialogContent dividers>
            {infoItem && (
              <Stack spacing={2}>
                {/* Yahan image automatically load hogi from public/images/... */}
                <img
                  src={infoItem.img}
                  alt={infoItem.title}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                  style={{ width: "100%", borderRadius: 12 }}
                />
                <Grid container spacing={1}>
                  <Grid item xs={7}><Typography variant="body2"><b>Inside Length:</b> {fmt2(infoItem.specs.insideLength)} m</Typography></Grid>
                  <Grid item xs={5}><Typography variant="body2"><b>Inside Width:</b> {fmt2(infoItem.specs.insideWidth)} m</Typography></Grid>
                  <Grid item xs={7}><Typography variant="body2"><b>Inside Height:</b> {fmt2(infoItem.specs.insideHeight)} m</Typography></Grid>
                  {"doorWidth" in infoItem.specs && (
                    <>
                      <Grid item xs={6}><Typography variant="body2"><b>Door Width:</b> {fmt2(infoItem.specs.doorWidth)} m</Typography></Grid>
                      <Grid item xs={6}><Typography variant="body2"><b>Door Height:</b> {fmt2(infoItem.specs.doorHeight)} m</Typography></Grid>
                    </>
                  )}
                  <Grid item xs={6}><Typography variant="body2"><b>Capacity:</b> {fmt2(infoItem.specs.capacityM3)} m³</Typography></Grid>
                  {infoItem.specs.tare != null && (
                    <Grid item xs={6}><Typography variant="body2"><b>Tare:</b> {infoItem.specs.tare} kg</Typography></Grid>
                  )}
                  {infoItem.specs.maxCargo != null && (
                    <Grid item xs={6}><Typography variant="body2"><b>Max Cargo:</b> {infoItem.specs.maxCargo} kg</Typography></Grid>
                  )}
                </Grid>
                <Typography variant="body2" color="text.secondary">{infoItem.specs.desc}</Typography>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Allowed Cargo:</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {infoItem.allowed.map((t) => (
                      <Chip key={t} size="small" icon={cargoIcon(t, { fontSize: 16 })} label={t} />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeInfo}>Close</Button>
            {infoItem && (
              <Button
                variant="contained"
                onClick={() => {
                  if (mode === "Container") setSelectedSize(infoItem.key);
                  else setSelectedTruck(infoItem.key);
                  closeInfo();
                  setTab(1);              // ⬅️ Auto-jump to Products tab
                }}
              >
                Use this
              </Button>
            )}

          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
