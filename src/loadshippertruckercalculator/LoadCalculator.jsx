// LoadCalculator.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import DeleteIcon from "@mui/icons-material/Delete";

// ---------- Cargo icons ----------
import Inventory2Icon from "@mui/icons-material/Inventory2"; // Box
import GrainIcon from "@mui/icons-material/Grain";            // Sacks
import AllInboxIcon from "@mui/icons-material/AllInbox";      // Bigbags
import SportsBarIcon from "@mui/icons-material/SportsBar";    // Barrels
import DonutLargeIcon from "@mui/icons-material/DonutLarge";  // Roll
import PlumbingIcon from "@mui/icons-material/Plumbing";      // Pipe
import TerrainIcon from "@mui/icons-material/Terrain";        // Bulk
import OpacityIcon from "@mui/icons-material/Opacity";        // Liquid
import CategoryIcon from "@mui/icons-material/Category";      // default

const cargoIcon = (t, sx = { fontSize: 20, color: "action.active" }) => {
  const k = (t || "").toLowerCase();
  switch (k) {
    case "box":     return <Inventory2Icon sx={sx} />;
    case "sacks":   return <GrainIcon sx={sx} />;
    case "bigbags": return <AllInboxIcon sx={sx} />;
    case "barrels": return <SportsBarIcon sx={sx} />;
    case "roll":    return <DonutLargeIcon sx={sx} />;
    case "pipe":    return <PlumbingIcon sx={sx} />;
    case "bulk":    return <TerrainIcon sx={sx} />;
    case "liquid":  return <OpacityIcon sx={sx} />;
    default:        return <CategoryIcon sx={sx} />;
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

// ------------- Tank capacity (Liters) map -------------
const TANK_CAPACITY_L = {
  "20ftTank": 24000, // default nominal ~24k L
};

// --------------------------- Truck Specs (meters) ---------------------------
const TRUCK_SPECS = {
  "DryVan-20ft":   { length: 6.10, width: 2.35, height: 2.40, maxWeight: 10000 },
  "Reefer-20ft":   { length: 6.10, width: 2.30, height: 2.20, maxWeight: 9000  },
  "StepDeck-48ft": { length: 14.60, width: 2.44, height: 2.00, maxWeight: 25000 }, // open, low deck
  "CargoVan-14ft": { length: 4.20, width: 1.80, height: 1.75, maxWeight: 1500  },
};

// Allowed cargo per truck
const TRUCK_CARGO_MAP = {
  "DryVan-20ft":   ["Box", "Sacks", "Bigbags", "Barrels"],
  "Reefer-20ft":   ["Box", "Sacks", "Bigbags", "Barrels"],
  "StepDeck-48ft": ["Roll", "Pipe", "Bigbags", "Box"], // open/tall cargo
  "CargoVan-14ft": ["Box", "Sacks", "Barrels"],
};

// Truck notes
const TRUCK_NOTES = {
  "DryVan-20ft":   "Dry Van: enclosed box body.",
  "Reefer-20ft":   "Reefer: insulated, temperature-controlled.",
  "StepDeck-48ft": "Step-Deck: low open deck for tall machinery (lashing needed).",
  "CargoVan-14ft": "LCV/Cargo Van: city deliveries, small loads.",
};

// --------------------------- Unit Helpers & Parser ---------------------------
function parseToMeters(input, fallbackUnit = "mm") {
  if (input == null) return 0;
  const raw = String(input).trim().toLowerCase();

  const feetInchMatch = raw.match(/^(\d+)\s*'\s*(\d+(?:\.\d+)?)\s*(?:\."|in)?$/);
  if (feetInchMatch) {
    const ft = parseFloat(feetInchMatch[1] || "0");
    const inch = parseFloat(feetInchMatch[2] || "0");
    return ft * 0.3048 + inch * 0.0254;
  }

  const m = raw.match(/^(-?\d+(?:\.\d+)?)(\s*(mm|cm|m|inch|in|ft|'))?$/);
  if (!m) return NaN;
  const val = parseFloat(m[1]);
  const unit = (m[3] || "").replace("'", "") || fallbackUnit;

  switch (unit) {
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
const unitShort = (u) => (u === "inch" ? "in" : u === "ft" ? "ft" : u);
const fmt2 = (n) => Number(n).toFixed(2);
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

  // Step-Deck -> render like flat rack/platform (open low deck)
  if (type.includes("StepDeck")) {
    return (
      <>
        <mesh position={[0, -height / 2 + 0.05, 0]}>
          <boxGeometry args={[length, 0.12, width]} />
          <meshStandardMaterial color="#1976d2" transparent opacity={0.25} />
          <Edges scale={1.001} threshold={15} color="#1976d2" />
        </mesh>
        {/* small posts at ends for visual */}
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

const OUTLINE_COLOR = "#ffffff";
const OUTLINE_SCALE = 1.002;
const VISUAL_GAP   = 0.01;   // ~1 cm visual gap

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

  const cyl = (r, hLen, rot) => (
    <mesh position={position} rotation={rot || [0, 0, 0]}>
      <cylinderGeometry
        args={[
          Math.max(0.01, r - VISUAL_GAP / 2),
          Math.max(0.01, r - VISUAL_GAP / 2),
          Math.max(0.02, hLen - VISUAL_GAP),
          32,
        ]}
      />
      {FaceMat}
      {Stroke}
    </mesh>
  );

  switch ((cargoType || "Box").toLowerCase()) {
    case "box":
      return (
        <mesh position={position}>
          <boxGeometry args={[l, h, w]} />
          {FaceMat}
          {Stroke}
        </mesh>
      );
    case "sacks":
      return (
        <RoundedBox args={[l, h, w]} radius={Math.min(l, h, w) * 0.06} smoothness={3} position={position}>
          {FaceMat}
          {Stroke}
        </RoundedBox>
      );
    case "bigbags": {
      const body = (
        <RoundedBox args={[l, h * 0.95, w]} radius={Math.min(l, h, w) * 0.06} smoothness={3} position={position}>
          {FaceMat}
          {Stroke}
        </RoundedBox>
      );
      const loopR = Math.min(l, w) * 0.03;
      const loopH = h * 0.15;
      const dx = l / 2 - loopR * 1.5;
      const dz = w / 2 - loopR * 1.5;
      const yTop = position[1] + h / 2;
      const loops = [
        [dx, yTop, dz],
        [dx, yTop, -dz],
        [-dx, yTop, dz],
        [-dx, yTop, -dz],
      ].map((p, i) => (
        <mesh key={i} position={[position[0] + p[0], p[1], position[2] + p[2]]}>
          <cylinderGeometry args={[loopR * 0.6, loopR * 0.6, loopH, 16]} />
          <meshStandardMaterial color={color || "#ff9800"} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1}/>
          <Edges scale={OUTLINE_SCALE} threshold={15} color={OUTLINE_COLOR} />
        </mesh>
      ));
      return <group>{body}{loops}</group>;
    }
    case "barrels": {
      const r = Math.max(w, l) / 2;
      return cyl(r, h, undefined);
    }
    case "roll": {
      const radius = w / 2;
      const length = l;
      return cyl(radius, length, [0, 0, Math.PI / 2]);
    }
    case "pipe": {
      const radius = w / 2;
      const length = l;
      return cyl(radius, length, [0, 0, Math.PI / 2]);
    }
    case "bulk":
      return (
        <mesh position={position}>
          <boxGeometry args={[l, Math.max(h * 0.5, 0.1), w]} />
          {FaceMat}
          {Stroke}
        </mesh>
      );
    case "liquid":
      return null; // no discrete piece
    default:
      return (
        <mesh position={position}>
          <boxGeometry args={[l, h, w]} />
          {FaceMat}
          {Stroke}
        </mesh>
      );
  }
};

// --------------------------- Logic helpers ---------------------------
function getCategory(type) {
  if (type.includes("StepDeck")) return "FR"; // treat step-deck like open FR for warnings
  if (type.toLowerCase().includes("reefer")) return "Reefer"; // NEW
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
  return o2.fits > o1 ? o2 : o1;
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
  return o2.fits > o1 ? o2 : o1;
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
        // NEW: add Reefer reason
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

  // No liquids in trucks (per your rule)
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
      "CargoVan";

    const reasons = [];
    const warnings = [];
    let fits = 0;
    let util = 0;
    let score = 0;

    const itemVol = L * W * H;
    const trkVol = trk.length * trk.width * trk.height;

    if (category === "StepDeck") {
      // open deck: allow limited over-width like FR
      const o = estimateFitsFRorPlatform(trk, { L, W, H });
      fits = o.fits;
      util = Math.min(1, (fits * itemVol) / trkVol * 0.6);
      reasons.push("Open low deck for machinery/pipe/roll.");
      if (o.overWidth) warnings.push("Out-of-Gauge width — lashing/permits required.");
      score += ["Pipe", "Roll"].includes(cargoType) ? 9 : 6;
    } else {
      // enclosed body
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
        containerType: key, // keep same field name for dialog table
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

// --------------------------- Main Component ---------------------------
export default function LoadCalculator() {
  // Mode toggle
  const [mode, setMode] = useState("Container"); // "Container" | "Truck"

  const [selectedSize, setSelectedSize] = useState("20ft");
  const [selectedTruck, setSelectedTruck] = useState("DryVan-20ft");

  const [customSize, setCustomSize] = useState(CONTAINER_SIZES["Custom"]);
  const [items, setItems] = useState([]); // METERS / liquidM3 for liquids
  const [renderItems, setRenderItems] = useState([]);
  const [cargoType, setCargoType] = useState("Box");
  const [unit, setUnit] = useState("mm");

  // Suggest dialog
  const [openSuggest, setOpenSuggest] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

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

  const [nextPosition, setNextPosition] = useState({
    x: 0, y: 0, z: 0, rowDepth: 0, levelHeight: 0,
  });

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
    setRenderItems([]);
    setItems([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedSize, selectedTruck]);

  // --- Handlers ---
  const handleCustomChange = (e) => {
    const { name, value } = e.target;
    setCustomSize((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleContainerChange = (val) => {
    setSelectedSize(val);
  };

  const handleTruckChange = (val) => {
    setSelectedTruck(val);
  };

  const handleModeChange = (val) => {
    setMode(val);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
  const isTank = mode === "Container" && selectedSize.includes("Tank"); // define ONCE
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
  const mWidth  = parseToMeters(form.width, unit);
  const mHeight = parseToMeters(form.height, unit);

  const addItem = () => {
    // Liquid only allowed in Tank container
    if (isLiquid) {
      if (!isTank) {
        alert("❌ Liquid requires a Tank container (use 20ftTank).");
        return;
      }
      const sg = Number(form.sg) || 0;
      if (sg <= 0) {
        alert("❌ Enter valid Specific Gravity (e.g., water = 1.0).");
        return;
      }

      let m3 = volumeM3FromForm();
      if (m3 <= 0) {
        alert("❌ Enter a positive liquid volume (Liters).");
        return;
      }

      const maxFill = Math.min(100, Math.max(50, Number(form.maxFillPercent) || 95)); // clamp 50–100
      const allowedL = (tankCapL * maxFill) / 100;
      const allowedM3 = allowedL / 1000;
      if (m3 > allowedM3) {
        alert(`⚠️ Over max fill ${maxFill}% of ${tankCapL} L. Using ${allowedL} L.`);
        m3 = allowedM3;
      }

      const usedWeightNow = items.reduce((s, it) => s + (it.weight || 0) * (it.quantity || 1), 0);
      const weight = m3 * 1000 * sg; // kg
      if (usedWeightNow + weight > maxWeight) {
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
      return; // no 3D blocks for liquid
    }

    // ---- Non-liquid ----
    const quantity = Number(form.quantity) || 0;
    const weight = Number(form.weight) || 0;

    const mLength = parseToMeters(form.length, unit);
    const mWidth  = parseToMeters(form.width, unit);
    const mHeight = parseToMeters(form.height, unit);

    if (!Number.isFinite(mLength) || !Number.isFinite(mWidth) || !Number.isFinite(mHeight)) {
      alert('❌ Invalid size. Try 1200, 120cm, 48in, 4ft or 4\'0"');
      return;
    }
    if (mLength <= 0 || mWidth <= 0 || mHeight <= 0 || quantity <= 0 || weight <= 0) {
      alert("❌ Positive values required for L/W/H, quantity, weight.");
      return;
    }

    // Enforce allowed types per current target (container or truck)
    const allowed = allowedTypes;
    if (!allowed.includes(cargoType)) {
      alert(`❌ ${cargoType} is not allowed in this ${mode.toLowerCase()}.`);
      return;
    }

    const targetCat = cat;
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

    const itemVolume = mLength * mWidth * mHeight;
    const totalVolume = container.length * container.width * container.height;

    const usedVolumeNow = items.reduce((s, it) => {
      if (it.cargoType === "Liquid") return s + (it.liquidM3 || 0);
      const hCap = targetCat === "OT" ? Math.min(it.height, container.height) : it.height;
      return s + it.length * it.width * hCap * (it.quantity || 1);
    }, 0);
    const usedWeightNow = items.reduce((s, it) => s + (it.weight || 0) * (it.quantity || 1), 0);

    const remainingWeight = maxWeight - usedWeightNow;
    let targetQty = Math.min(quantity, Math.max(0, Math.floor(remainingWeight / weight)));

    if (quantity > targetQty) {
      if (targetQty <= 0) {
        alert("❌ Overweight. Cannot add more items.");
        return;
      }
      alert(`⚠️ Overweight limit. Only ${targetQty} of ${quantity} added.`);
    }

    const renderGroupId = Date.now();
    const newRender = [];
    let temp = { ...nextPosition };
    let totalNewVol = 0;
    let added = 0;

    for (let i = 0; i < targetQty; i++) {
      const deltaVol = targetCat === "OT"
        ? (mLength * mWidth * Math.min(mHeight, container.height))
        : itemVolume;

      if (usedVolumeNow + totalNewVol + deltaVol > totalVolume) {
        alert(`⚠️ Full by volume. Added ${added} piece(s).`);
        break;
      }

      let { x, y, z, rowDepth, levelHeight } = temp;
      if (x + mLength > container.length) { x = 0; z += rowDepth; rowDepth = 0; }
      if (z + mWidth  > container.width ) { z = 0; y += levelHeight; levelHeight = 0; }

      const maxStackHeight = targetCat === "OT" ? Math.max(container.height, mHeight) : container.height;
      if (y + mHeight > maxStackHeight) { alert("⚠️ No stacking space left."); break; }

      const position = [
        x - container.length / 2 + mLength / 2,
        y - container.height / 2 + mHeight / 2,
        z - container.width / 2 + mWidth / 2,
      ];

      newRender.push({
        cargoType,
        length: mLength, width: mWidth, height: mHeight,
        color: form.color, position, renderGroupId,
      });
      totalNewVol += deltaVol; added++;

      temp = {
        x: x + mLength,
        y,
        z,
        rowDepth: Math.max(rowDepth, mWidth),
        levelHeight: Math.max(levelHeight, mHeight),
      };
    }

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
      setRenderItems((prev) => [...prev, ...newRender]);
      setNextPosition(temp);
    }
  };

  // Suggest (containers OR trucks)
  const handleSuggest = () => {
    if (isLiquid) {
      // liquids -> only via tank container
      const weight = computedLiquidWeight();
      const res = suggestContainers({ L: 1, W: 1, H: 1, weight, cargoType: "Liquid" });
      setSuggestions(res);
      setOpenSuggest(true);
      return;
    }

    const weight = Number(form.weight) || 0;
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

  const remainingVolume = Math.max(0, totalVolumeForBars - usedVolume);
  const fillPercent = totalVolumeForBars > 0 ? (usedVolume / totalVolumeForBars) * 100 : 0;

  const usedWeight = items.reduce((s, it) => s + (it.weight || 0) * (it.quantity || 1), 0);
  const weightPercent = maxWeight > 0 ? (usedWeight / maxWeight) * 100 : 0;

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
    <Box sx={{ p: 4, background: "#f0f4f8", minHeight: "100vh" }}>
      <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
        📦 3D Load Calculator
      </Typography>
      <Typography align="center" color="text.secondary" sx={{ mb: 1 }}>
        Inputs in <b>{unitShort(unit)}</b> • Internal calculations in <b>meters</b> {isTank && <>• Tank volume bars use <b>nominal capacity</b></>}
      </Typography>

      <Paper elevation={4} sx={{ p: 3, mt: 2, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Mode */}
          <Grid item xs={12} md="auto">
            <FormControl size="small">
              <InputLabel>Target</InputLabel>
              <Select value={mode} label="Target" onChange={(e) => handleModeChange(e.target.value)}>
                <MenuItem value="Container">Container</MenuItem>
                <MenuItem value="Truck">Truck</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Container or Truck selector */}
          {mode === "Container" ? (
            <>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Container Size</InputLabel>
                  <Select value={selectedSize} onChange={(e) => handleContainerChange(e.target.value)} label="Container Size">
                    {Object.keys(CONTAINER_SIZES).map((key) => (
                      <MenuItem key={key} value={key}>{key}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {selectedSize === "Custom" &&
                ["length", "width", "height", "maxWeight"].map((dim) => (
                  <Grid item key={dim}>
                    <TextField
                      label={dim === "maxWeight" ? "maxWeight (kg)" : `${dim} (m)`}
                      name={dim}
                      value={customSize[dim]}
                      onChange={handleCustomChange}
                      type="number"
                      size="small"
                    />
                  </Grid>
                ))}

              <Grid item xs={12} md="auto">
                <FormControl size="small" disabled={isLiquid && isTank /* disable only for Liquid+Tank */}>
                  <InputLabel>Units</InputLabel>
                  <Select value={unit} label="Units" onChange={(e) => handleUnitSwitch(e.target.value)}>
                    <MenuItem value="mm">mm</MenuItem>
                    <MenuItem value="cm">cm</MenuItem>
                    <MenuItem value="m">m</MenuItem>
                    <MenuItem value="inch">inch</MenuItem>
                    <MenuItem value="ft">feet</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Truck Type</InputLabel>
                  <Select value={selectedTruck} onChange={(e) => handleTruckChange(e.target.value)} label="Truck Type">
                    {Object.keys(TRUCK_SPECS).map((key) => (
                      <MenuItem key={key} value={key}>{key}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Units active for sizing inputs */}
              <Grid item xs={12} md="auto">
                <FormControl size="small">
                  <InputLabel>Units</InputLabel>
                  <Select value={unit} label="Units" onChange={(e) => handleUnitSwitch(e.target.value)}>
                    <MenuItem value="mm">mm</MenuItem>
                    <MenuItem value="cm">cm</MenuItem>
                    <MenuItem value="m">m</MenuItem>
                    <MenuItem value="inch">inch</MenuItem>
                    <MenuItem value="ft">feet</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

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
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Quick Presets (hide for liquid) */}
        {!isLiquid && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Quick Presets:</Typography>
            {presets.map((p) => (
              <Chip key={p.label} label={p.label} onClick={() => applyPreset(p)} />
            ))}
          </Stack>
        )}

        {/* Beginner Tips */}
        <Accordion sx={{ my: 1 }}>
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
                  • For liquids, you don’t need L×W×H — just enter <b>Volume (Liters)</b> and <b>SG</b> (e.g., water 1.0).<br />
                  • For safety, set a <b>Max Fill %</b> (default 95%).<br />
                  • Weight is auto-calculated: <b>Liters × SG</b> (kg).
                </>
              ) : (
                <>
                  • First choose the unit (mm/cm/m/in/ft). The placeholder shows the expected format.<br />
                  • Feet–inches: <b>5'10"</b> (5 ft 10 in).<br />
                  • The live preview shows <b>= Xm</b> — that’s the actual size in meters.<br />
                  • For Barrel/Roll, diameter = width (rendering simplification).<br />
                  • Enter <b>weight</b> always in <b>kg</b> (per piece).
                </>
              )}
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Typography variant="h6" gutterBottom>➕ Add Item to {mode}</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <TextField
              label="Product Name"
              name="productName"
              value={form.productName}
              onChange={handleFormChange}
              type="text"
              size="small"
            />
          </Grid>

          {/* Liquid fields (only when Tank container + Liquid cargo) */}
          {isLiquid && isTank && (
            <>
              <Grid item>
                <TextField
                  label="Volume (L)"
                  name="liquidVolume"
                  value={form.liquidVolume}
                  onChange={handleFormChange}
                  type="number"
                  size="small"
                  inputProps={{ min: 0, step: "any" }}
                  helperText={`Tank cap: ${tankCapL} L • Max Fill: ${form.maxFillPercent}%`}
                />
              </Grid>
              <Grid item>
                <TextField
                  label="SG"
                  name="sg"
                  value={form.sg}
                  onChange={handleFormChange}
                  type="number"
                  size="small"
                  inputProps={{ min: 0.1, step: 0.01 }}
                  helperText="Water≈1.00 • Diesel≈0.83"
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Max Fill %"
                  name="maxFillPercent"
                  value={form.maxFillPercent}
                  onChange={handleFormChange}
                  type="number"
                  size="small"
                  inputProps={{ min: 50, max: 100, step: 1 }}
                />
              </Grid>
              <Grid item>
                <Chip
                  color="info"
                  variant="outlined"
                  label={`Est. Weight: ${fmt2(computedLiquidWeight())} kg`}
                />
              </Grid>
            </>
          )}

          {/* Non-liquid fields */}
          {!(isLiquid && isTank) && (
            <>
              {["length", "width", "height"].map((field) => {
                const meters =
                  field === "length" ? mLength :
                  field === "width"  ? mWidth  : mHeight;
                const u = unitShort(unit);
                return (
                  <Grid item key={field}>
                    <TextField
                      label={`${field} (${u})`}
                      name={field}
                      value={form[field]}
                      onChange={handleFormChange}
                      type="text"
                      size="small"
                      placeholder={exampleByUnit(unit)}
                      helperText={`= ${Number.isFinite(meters) ? meters.toFixed(3) : "?"} m`}
                      error={!Number.isFinite(meters)}
                      sx={{ width: 190 }}
                    />
                  </Grid>
                );
              })}
              <Grid item>
                <TextField
                  label="quantity"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleFormChange}
                  type="number"
                  size="small"
                  inputProps={{ min: 1, step: 1 }}
                />
              </Grid>
              <Grid item>
                <TextField
                  label="weight (kg)"
                  name="weight"
                  value={form.weight}
                  onChange={handleFormChange}
                  type="number"
                  size="small"
                  inputProps={{ min: 0.1, step: 0.1 }}
                />
              </Grid>
            </>
          )}

          {/* Cargo Type with icons */}
          <Grid item>
            <FormControl size="small">
              <InputLabel>Cargo Type</InputLabel>
              <Select
                value={cargoType}
                label="Cargo Type"
                onChange={(e) => setCargoType(e.target.value)}
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
          </Grid>
          <Grid item>
            <TextField
              label="Color"
              name="color"
              type="color"
              value={form.color}
              onChange={handleFormChange}
              size="small"
              sx={{ width: 80 }}
            />
          </Grid>

          <Grid item>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                onClick={addItem}
                disabled={
                  isLiquid && isTank
                    ? !(Number(form.liquidVolume) > 0 && Number(form.sg) > 0)
                    : (!form.length || !form.width || !form.height || !Number(form.quantity) || !Number(form.weight))
                }
              >
                Add
              </Button>
              <Button variant="outlined" onClick={handleSuggest}>
                Suggest {mode === "Truck" ? "Truck" : "Container"}
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* Summary */}
        <Box mt={4} textAlign="center">
          <Typography variant="subtitle1">
            <strong>Total:</strong> {fmt2(totalVolumeForBars)} m³ |{" "}
            <strong>Used:</strong> {fmt2(usedVolume)} m³ |{" "}
            <strong>Remaining:</strong> {fmt2(remainingVolume)} m³
          </Typography>
        </Box>
        <LinearProgress
          value={Math.min(100, Math.max(0, fillPercent))}
          variant="determinate"
          sx={{ mt: 1, height: 14, borderRadius: 8, width: "60%", mx: "auto" }}
        />
        <Typography align="center" variant="caption" color="text.secondary">
          {fmt2(fillPercent)}% full by volume
        </Typography>

        <Box mt={2} textAlign="center">
          <Typography variant="subtitle1">
            <strong>Used Weight:</strong> {fmt2(usedWeight)} kg / {maxWeight} kg
          </Typography>
          <LinearProgress
            value={Math.min(100, Math.max(0, weightPercent))}
            variant="determinate"
            sx={{ mt: 1, height: 14, borderRadius: 8, width: "60%", mx: "auto" }}
          />
          <Typography variant="caption" color="text.secondary">
            {fmt2(weightPercent)}% full by weight
          </Typography>
        </Box>
      </Paper>

      {/* Items Table */}
      <Box mt={5}>
        <Typography variant="h6" gutterBottom>📋 Added Items</Typography>
        <Paper elevation={2} sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Product Name</strong></TableCell>
                <TableCell><strong>Length</strong></TableCell>
                <TableCell><strong>Width</strong></TableCell>
                <TableCell><strong>Height</strong></TableCell>
                <TableCell><strong>Volume (m³)</strong></TableCell>
                <TableCell><strong>Weight (kg)</strong></TableCell>
                <TableCell><strong>Quantity</strong></TableCell>
                <TableCell><strong>Row Total Weight (kg)</strong></TableCell>
                <TableCell><strong>Row Volume (m³)</strong></TableCell>
                <TableCell><strong>Color</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => {
                const rowTotalWeight = (item.weight || 0) * (item.quantity || 1);
                const u = unitShort(unit);
                const isLiqRow = item.cargoType === "Liquid";
                const rowVol = isLiqRow
                  ? (item.liquidM3 || 0)
                  : (item.length * item.width * item.height) * (item.quantity || 1);

                return (
                  <TableRow key={index}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {cargoIcon(item.cargoType)}
                        <span style={{ fontSize: 12 }}>{item.cargoType}</span>
                      </Stack>
                    </TableCell>

                    <TableCell>{item.productName || "-"}</TableCell>
                    <TableCell>{isLiqRow ? "—" : `${toUI(item.length, unit)} ${u}`}</TableCell>
                    <TableCell>{isLiqRow ? "—" : `${toUI(item.width, unit)} ${u}`}</TableCell>
                    <TableCell>{isLiqRow ? "—" : `${toUI(item.height, unit)} ${u}`}</TableCell>
                    <TableCell>{isLiqRow ? fmt2(item.liquidM3 || 0) : "—"}</TableCell>
                    <TableCell>{fmt2(item.weight)}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{fmt2(rowTotalWeight)}</TableCell>
                    <TableCell>{fmt2(rowVol)}</TableCell>
                    <TableCell>
                      <Tooltip title={item.color}>
                        <Box sx={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: item.color, border: "1px solid #ccc" }} />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => {
                          const groupId = items[index].renderGroupId;
                          setItems((prev) => prev.filter((_, i) => i !== index));
                          setRenderItems((prev) => prev.filter((r) => r.renderGroupId !== groupId));
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      {/* 3D View */}
      <Box mt={5} height="500px" borderRadius={3} overflow="hidden" boxShadow={4} sx={{ background: "#fff" }}>
        <Canvas camera={{ position: [10, 5, 10], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 8, 5]} intensity={0.9} />
          <OrbitControls />
          <ContainerBox size={container} type={mode === "Container" ? selectedSize : selectedTruck} />
          <ContactShadows position={[0, -container.height / 2 + 0.005, 0]} opacity={0.3} blur={1.5} far={10} />

          {renderItems.map((ri, i) => (
            <CargoMesh
              key={i}
              cargoType={ri.cargoType}
              position={ri.position}
              dims={[ri.length, ri.height, ri.width]}
              color={ri.color}
            />
          ))}
        </Canvas>
      </Box>

      {/* Suggestion Dialog */}
      <Dialog open={openSuggest} onClose={()=>setOpenSuggest(false)} maxWidth="md" fullWidth>
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
                    <TableCell>{s.containerType}</TableCell>
                    <TableCell>{s.category}</TableCell>
                    <TableCell align="right">{s.fits}</TableCell>
                    <TableCell align="right">{s.utilization}%</TableCell>
                    <TableCell>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {s.reasons.map((r, i)=><li key={i}>{r}</li>)}
                      </ul>
                    </TableCell>
                    <TableCell>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {s.warnings.map((w, i)=><li key={i}>{w}</li>)}
                      </ul>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenSuggest(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
