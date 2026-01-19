import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../../apiConfig';
import alertify from 'alertifyjs';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  InputAdornment,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Zoom,
  Skeleton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';
import {
  Add,
  Refresh,
  Clear,
  Close,
  Send,
  LocationOn,
  LocalShipping,
  Assignment,
  CalendarToday,
  AttachMoney,
  Scale,
  Business,
  Description,
  Delete,
  AttachFile,
  CloudUpload,
  CheckCircle,
  Room,
  Inventory2,
  Category,
  Percent
} from '@mui/icons-material';
import { Download, Search } from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';
import SearchNavigationFeedback from '../../components/SearchNavigationFeedback';
import PageLoader from '../../components/PageLoader';
// import MessageTester from '../../components/MessageTester';
import { useThemeConfig } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShipperLoads, resetLoadsToOriginal, setLoads } from '../../redux/slices/loadBoardSlice';
import {
  selectLoads,
  selectOriginalLoads,
  selectLoadBoardLoading,
  selectLoadBoardError,
  selectTabCounts,
  selectLastFetched,
} from '../../redux/selectors/loadBoardSelectors';

// Premium Dark Tooltip
const PremiumTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#263238',
    color: '#ffffff',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
    fontSize: 12,
    borderRadius: 12,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: 0,
    maxWidth: 300
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: '#263238',
  },
}));

// US Cities List
const usCities = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
  'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
  'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC',
  'Boston, MA', 'El Paso, TX', 'Nashville, TN', 'Detroit, MI', 'Oklahoma City, OK',
  'Portland, OR', 'Las Vegas, NV', 'Memphis, TN', 'Louisville, KY', 'Baltimore, MD',
  'Milwaukee, WI', 'Albuquerque, NM', 'Tucson, AZ', 'Fresno, CA', 'Sacramento, CA',
  'Mesa, AZ', 'Kansas City, MO', 'Atlanta, GA', 'Long Beach, CA', 'Colorado Springs, CO',
  'Raleigh, NC', 'Miami, FL', 'Virginia Beach, VA', 'Omaha, NE', 'Oakland, CA',
  'Minneapolis, MN', 'Tulsa, OK', 'Arlington, TX', 'Tampa, FL', 'New Orleans, LA',
  'Wichita, KS', 'Cleveland, OH', 'Bakersfield, CA', 'Aurora, CO', 'Anaheim, CA',
  'Honolulu, HI', 'Santa Ana, CA', 'Corpus Christi, TX', 'Riverside, CA', 'Lexington, KY',
  'Stockton, CA', 'Henderson, NV', 'Saint Paul, MN', 'St. Louis, MO', 'Fort Wayne, IN',
  'Jersey City, NJ', 'Chandler, AZ', 'Madison, WI', 'Lubbock, TX', 'Scottsdale, AZ',
  'Reno, NV', 'Buffalo, NY', 'Gilbert, AZ', 'Glendale, AZ', 'North Las Vegas, NV',
  'Winston-Salem, NC', 'Chesapeake, VA', 'Norfolk, VA', 'Fremont, CA', 'Garland, TX',
  'Irving, TX', 'Hialeah, FL', 'Richmond, VA', 'Boise, ID', 'Spokane, WA',
  'Baton Rouge, LA', 'Tacoma, WA', 'San Bernardino, CA', 'Grand Rapids, MI', 'Huntsville, AL',
  'Salt Lake City, UT', 'Frisco, TX', 'Yonkers, NY', 'Amarillo, TX', 'Glendale, CA',
  'McKinney, TX', 'Montgomery, AL', 'Aurora, IL', 'Des Moines, IA', 'Modesto, CA',
  'Fayetteville, NC', 'Shreveport, LA', 'Akron, OH', 'Tacoma, WA', 'Oxnard, CA',
  'Little Rock, AR', 'Moreno Valley, CA', 'Columbus, GA', 'Fontana, CA', 'Huntington Beach, CA',
  'Grand Prairie, TX', 'Sioux Falls, SD', 'Tallahassee, FL', 'Peoria, AZ', 'Overland Park, KS',
  'Garden Grove, CA', 'Vancouver, WA', 'Chattanooga, TN', 'Oceanside, CA', 'Jackson, MS',
  'Fort Lauderdale, FL', 'Santa Rosa, CA', 'Rancho Cucamonga, CA', 'Port St. Lucie, FL',
  'Tempe, AZ', 'Ontario, CA', 'Vancouver, WA', 'Cape Coral, FL', 'Sioux City, IA',
  'Springfield, MO', 'Pembroke Pines, FL', 'Elk Grove, CA', 'Salem, OR', 'Lancaster, CA',
  'Corona, CA', 'Eugene, OR', 'Palmdale, CA', 'Salinas, CA', 'Springfield, MA',
  'Pasadena, TX', 'Fort Collins, CO', 'Hayward, CA', 'Pomona, CA', 'Cary, NC',
  'Rockford, IL', 'Alexandria, VA', 'Escondido, CA', 'McKinney, TX', 'Kansas City, KS',
  'Joliet, IL', 'Sunnyvale, CA', 'Torrance, CA', 'Bridgeport, CT', 'Lakewood, CO',
  'Hollywood, FL', 'Paterson, NJ', 'Naperville, IL', 'Syracuse, NY', 'Mesquite, TX',
  'Dayton, OH', 'Savannah, GA', 'Clarksville, TN', 'Orange, CA', 'Pasadena, CA',
  'Fullerton, CA', 'Killeen, TX', 'Frisco, TX', 'Hampton, VA', 'McAllen, TX',
  'Warren, MI', 'Bellevue, WA', 'West Valley City, UT', 'Columbia, SC', 'Olathe, KS',
  'Sterling Heights, MI', 'New Haven, CT', 'Miramar, FL', 'Waco, TX', 'Thousand Oaks, CA',
  'Cedar Rapids, IA', 'Charleston, SC', 'Visalia, CA', 'Topeka, KS', 'Elizabeth, NJ',
  'Gainesville, FL', 'Thornton, CO', 'Roseville, CA', 'Carrollton, TX', 'Coral Springs, FL',
  'Stamford, CT', 'Simi Valley, CA', 'Concord, CA', 'Hartford, CT', 'Kent, WA',
  'Lafayette, LA', 'Midland, TX', 'Surprise, AZ', 'Denton, TX', 'Victorville, CA',
  'Evansville, IN', 'Santa Clara, CA', 'Abilene, TX', 'Athens, GA', 'Vallejo, CA',
  'Allentown, PA', 'Norman, OK', 'Beaumont, TX', 'Independence, MO', 'Murfreesboro, TN',
  'Ann Arbor, MI', 'Springfield, IL', 'Berkeley, CA', 'Peoria, IL', 'Provo, UT',
  'El Monte, CA', 'Columbia, MO', 'Lansing, MI', 'Fargo, ND', 'Downey, CA',
  'Costa Mesa, CA', 'Wilmington, NC', 'Arvada, CO', 'Inglewood, CA', 'Miami Gardens, FL',
  'Carlsbad, CA', 'Westminster, CO', 'Rochester, MN', 'Odessa, TX', 'Manchester, NH',
  'Elgin, IL', 'West Jordan, UT', 'Round Rock, TX', 'Clearwater, FL', 'Waterbury, CT',
  'Gresham, OR', 'Fairfield, CA', 'Billings, MT', 'Lowell, MA', 'San Buenaventura, CA',
  'Pueblo, CO', 'High Point, NC', 'West Covina, CA', 'Richmond, CA', 'Murrieta, CA',
  'Cambridge, MA', 'Antioch, CA', 'Temecula, CA', 'Norwalk, CA', 'Centennial, CO',
  'Everett, WA', 'Palm Bay, FL', 'Wichita Falls, TX', 'Green Bay, WI', 'Daly City, CA',
  'Burbank, CA', 'Richardson, TX', 'Pompano Beach, FL', 'North Charleston, SC', 'Broken Arrow, OK',
  'Boulder, CO', 'West Palm Beach, FL', 'Santa Maria, CA', 'El Cajon, CA', 'Davenport, IA',
  'Rialto, CA', 'Las Cruces, NM', 'San Mateo, CA', 'Lewisville, TX', 'South Bend, IN',
  'Lakeland, FL', 'Erie, PA', 'Tyler, TX', 'Pearland, TX', 'College Station, TX',
  'Kenosha, WI', 'Sandy Springs, GA', 'Clovis, CA', 'Flint, MI', 'Roanoke, VA',
  'Albany, NY', 'Jurupa Valley, CA', 'Compton, CA', 'San Angelo, TX', 'Hillsboro, OR',
  'Lawton, OK', 'Renton, WA', 'Vista, CA', 'Davie, FL', 'Greeley, CO',
  'Mission Viejo, CA', 'Portsmouth, VA', 'Dearborn, MI', 'South Gate, CA', 'Tuscaloosa, AL',
  'Livonia, MI', 'New Bedford, MA', 'Vacaville, CA', 'Brockton, MA', 'Roswell, GA',
  'Beaverton, OR', 'Quincy, MA', 'Sparks, NV', 'Yakima, WA', 'Lee\'s Summit, MO',
  'Federal Way, WA', 'Carson, CA', 'Greenville, SC', 'Santa Monica, CA', 'Hesperia, CA',
  'Allen, TX', 'Rio Rancho, NM', 'Yuma, AZ', 'Westminster, CA', 'Orem, UT',
  'Lynn, MA', 'Redding, CA', 'Spokane Valley, WA', 'Miami Beach, FL', 'League City, TX',
  'Lawrence, KS', 'Santa Barbara, CA', 'Plantation, FL', 'Sandy, UT', 'Sunrise, FL',
  'Macon, GA', 'Longmont, CO', 'Boca Raton, FL', 'San Marcos, TX', 'Greenville, NC',
  'Waukegan, IL', 'Fall River, MA', 'Chico, CA', 'Newton, MA', 'San Leandro, CA',
  'Reading, PA', 'Norwalk, CT', 'Fort Smith, AR', 'Newport Beach, CA', 'Asheville, NC',
  'Nashua, NH', 'Edmond, OK', 'Whittier, CA', 'Nampa, ID', 'Bloomington, MN',
  'Deltona, FL', 'Hawthorne, CA', 'Duluth, MN', 'Carmel, IN', 'Suffolk, VA',
  'Clifton, NJ', 'Citrus Heights, CA', 'Livermore, CA', 'Tracy, CA', 'Alhambra, CA',
  'Kirkland, WA', 'Trenton, NJ', 'Ogden, UT', 'Hoover, AL', 'Cicero, IL',
  'Fishers, IN', 'Sugar Land, TX', 'Danbury, CT', 'Meridian, ID', 'Indio, CA',
  'Concord, NC', 'Menifee, CA', 'Champaign, IL', 'Buena Park, CA', 'Troy, MI',
  'O\'Fallon, MO', 'Edinburg, TX', 'Caldwell, ID', 'Bryan, TX', 'Bloomington, IN',
  'Reno, NV', 'Hagerstown, MD', 'Bellflower, CA', 'Westland, MI', 'Charleston, WV',
  'Bloomington, IL', 'Chesterfield, MO', 'Mount Vernon, NY', 'Dearborn Heights, MI', 'Temple, TX',
  'Kenner, LA', 'Conroe, TX', 'New Rochelle, NY', 'Lake Forest, CA', 'Napa, CA',
  'Hammond, IN', 'Fayetteville, AR', 'Bloomfield, NJ', 'Southaven, MS', 'Bryan, TX',
  'Auburn, WA', 'Warwick, RI', 'Edmonds, WA', 'Bonita Springs, FL', 'Layton, UT',
  'Lombard, IL', 'DeKalb, IL', 'Anderson, IN', 'West Sacramento, CA', 'Mankato, MN',
  'Schaumburg, IL', 'Seaside, CA', 'Pocatello, ID', 'Hattiesburg, MS', 'Des Plaines, IL',
  'Troy, NY', 'West New York, NJ', 'Auburn, AL', 'Decatur, IL', 'San Ramon, CA',
  'Pleasanton, CA', 'Wyoming, MI', 'Lake Charles, LA', 'Plymouth, MN', 'Bolingbrook, IL',
  'Pharr, TX', 'Appleton, WI', 'Gastonia, NC', 'Folsom, CA', 'Southfield, MI',
  'Sanford, FL', 'Riverview, FL', 'Tuscaloosa, AL', 'Caesar\'s Bay, NY', 'Hendersonville, TN',
  'Sparks, NV', 'Valdosta, GA', 'Perris, CA', 'St. George, UT', 'Mauldin, SC',
  'Meridian, MS', 'Brockton, MA', 'Cape Coral, FL', 'Roswell, NM', 'Muncie, IN',
  'Temple, TX', 'Missouri City, TX', 'Redwood City, CA', 'New Braunfels, TX', 'Arlington Heights, IL',
  'Evansville, IN', 'Fayetteville, NC', 'Carol Stream, IL', 'Camden, NJ', 'Hanford, CA',
  'Kenner, LA', 'Baytown, TX', 'Highland, CA', 'Portland, ME', 'Santa Fe, NM',
  'Davis, CA', 'Camarillo, CA', 'Lakewood, WA', 'Upland, CA', 'San Clemente, CA',
  'Bowie, MD', 'Bethlehem, PA', 'Schaumburg, IL', 'Apex, NC', 'Rosemead, CA',
  'Roy, UT', 'South San Francisco, CA', 'Bismarck, ND', 'Dunwoody, GA', 'Grapevine, TX',
  'Apple Valley, MN', 'Santee, CA', 'Dothan, AL', 'Redlands, CA', 'La Crosse, WI',
  'Turlock, CA', 'Temple City, CA', 'La Mesa, CA', 'Orland Park, IL', 'Brentwood, TN',
  'Encinitas, CA', 'Bethesda, MD', 'Arlington Heights, IL', 'Woodbury, MN', 'Cathedral City, CA',
  'Kingsport, TN', 'West Haven, CT', 'Apopka, FL', 'Davis, CA', 'Palm Desert, CA',
  'Bowling Green, KY', 'Doral, FL', 'San Rafael, CA', 'Royal Oak, MI', 'Oak Lawn, IL',
  'Redondo Beach, CA', 'Pflugerville, TX', 'San Marcos, CA', 'La Habra, CA', 'Medford, OR',
  'Chino Hills, CA', 'Bountiful, UT', 'Fayetteville, GA', 'Deerfield Beach, FL', 'Warwick, RI',
  'Linden, NJ', 'West Orange, NJ', 'Vineland, NJ', 'Cleveland, TN', 'Rowlett, TX',
  'Palm Springs, CA', 'Pico Rivera, CA', 'Freeport, NY', 'Huntersville, NC', 'Tigard, OR',
  'Lenexa, KS', 'Saginaw, MI', 'Mentor, OH', 'Beavercreek, OH', 'Loveland, CO',
  'Layton, UT', 'Elizabethtown, KY', 'Texarkana, TX', 'Cedar Park, TX', 'Kannapolis, NC',
  'San Bruno, CA', 'Newark, CA', 'Wheaton, IL', 'Mankato, MN', 'Coon Rapids, MN',
  'Caldwell, ID', 'San Gabriel, CA', 'Moses Lake, WA', 'Tualatin, OR', 'La Quinta, CA',
  'Mountain View, CA', 'Tracy, CA', 'Westfield, MA', 'Coconut Creek, FL', 'Bowie, MD',
  'Berwyn, IL', 'Midwest City, OK', 'Fountain Valley, CA', 'Buckeye, AZ', 'Dearborn Heights, MI',
  'Woodland, CA', 'Noblesville, IN', 'Beverly, MA', 'Lynn, MA', 'West Allis, WI',
  'Hollister, CA', 'Keller, TX', 'Newport Beach, CA', 'South Jordan, UT', 'Casa Grande, AZ',
  'Alameda, CA', 'Bellevue, NE', 'Middletown, OH', 'Kearny, NJ', 'Champaign, IL',
  'Mansfield, TX', 'Rancho Cordova, CA', 'Conway, AR', 'New Brunswick, NJ', 'Marietta, GA',
  'The Villages, FL', 'Palm Beach Gardens, FL', 'West Des Moines, IA', 'Tamarac, FL', 'Grand Junction, CO',
  'North Port, FL', 'Boca Raton, FL', 'Carson City, NV', 'Montebello, CA', 'Lodi, CA',
  'Madison, AL', 'Wylie, TX', 'Lawrence, IN', 'Bell Gardens, CA', 'Pittsburg, CA',
  'Alpharetta, GA', 'Longview, TX', 'Covina, CA', 'Manteca, CA', 'Tulare, CA',
  'Lakeville, MN', 'Newark, OH', 'Oshkosh, WI', 'Park Ridge, IL', 'Addison, TX',
  'Calexico, CA', 'Mankato, MN', 'Cleveland Heights, OH', 'Burnsville, MN', 'Coppell, TX',
  'East Providence, RI', 'Cottage Grove, MN', 'Broomfield, CO', 'Farmington, NM', 'New Britain, CT',
  'Moorhead, MN', 'Roseville, MN', 'Bismarck, ND', 'Mankato, MN', 'St. Louis Park, MN',
  'Hickory, NC', 'Lake Elsinore, CA', 'Burlington, NC', 'Mankato, MN', 'Mankato, MN'
];

// Vehicle types - Separate for DRAYAGE and OTR as per server enum
// IMPORTANT: These must match EXACTLY with API enum values
const DRAYAGE_VEHICLE_TYPES = [
  "20' Standard",
  "40' Standard",
  "45' Standard",
  "20' Reefer",
  "40' Reefer",
  "Open Top Container",
  "Flat Rack Container",
  "Tank Container",
  "40' High Cube",
  "45' High Cube"
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

const LoadBoard = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadType, setLoadType] = useState('OTR');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltered, setIsFiltered] = useState(false);
  const [chargesCalculatorModalOpen, setChargesCalculatorModalOpen] = useState(false);
  const [charges, setCharges] = useState([]);

  const { themeConfig } = useThemeConfig();
  const { socket } = useSocket();
  const primary = themeConfig.tokens?.primary || '#1976d2';
  const brand = (themeConfig.header?.bg && themeConfig.header.bg !== 'white')
    ? themeConfig.header.bg
    : primary;
  const headerTextColor = themeConfig.header?.text || '#ffffff';

  // Vehicle type options - Use constants defined outside component


  const [form, setForm] = useState({
    // Common fields
    loadType: 'OTR',
    vehicleType: '',
    rate: '',
    rateType: 'Flat Rate',
    bidDeadline: '',

    // DRAYAGE specific fields
    fromAddress: '',
    fromCity: '',
    fromState: '',
    fromZip: '',
    toAddress: '',
    toCity: '',
    toState: '',
    toZip: '',
    weight: '',
    commodity: '',
    pickupDate: '',
    deliveryDate: '',
    containerNo: '',
    poNumber: '',
    bolNumber: '',
    returnDate: '',
    returnLocation: '',
    returnAddress: '',
    returnCity: '',
    returnState: '',
    returnZip: '',
    lineHaul: '',
    fsc: '',
    others: '',
    total: '',

    // OTR specific fields - origins and destinations arrays
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
    }]
  });

  // Naya state for errors
  const [errors, setErrors] = useState({});

  // Redux-managed load board state
  const loads = useSelector(selectLoads);
  const originalLoadData = useSelector(selectOriginalLoads);
  const loading = useSelector(selectLoadBoardLoading);
  const loadError = useSelector(selectLoadBoardError);
  const tabCounts = useSelector(selectTabCounts);
  const lastFetched = useSelector(selectLastFetched);

  const [createLoadLoading, setCreateLoadLoading] = useState(false);

  const [bidsModalOpen, setBidsModalOpen] = useState(false);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [bids, setBids] = useState([]);
  const [selectedLoadId, setSelectedLoadId] = useState(null);

  const [bidDetailsModalOpen, setBidDetailsModalOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);

  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [acceptForm, setAcceptForm] = useState({ shipmentNumber: '', poNumber: '', bolNumber: '', acceptanceAttachment1: null });
  const [acceptBidId, setAcceptBidId] = useState(null);
  const [acceptErrors, setAcceptErrors] = useState({});
  const [acceptingBid, setAcceptingBid] = useState(false);
  const [acceptFilePreview, setAcceptFilePreview] = useState(null);

  // Ref to track locally rejected bids to prevent race conditions
  const recentlyRejectedRef = useRef(new Set());

  // Negotiation modal state
  const [negotiationModalOpen, setNegotiationModalOpen] = useState(false);
  const [negotiationForm, setNegotiationForm] = useState({
    shipperCounterRate: '',
    shipperNegotiationMessage: ''
  });
  const [negotiationErrors, setNegotiationErrors] = useState({});
  const [negotiationBidId, setNegotiationBidId] = useState(null);

  // Negotiation history modal state
  const [negotiationHistoryModalOpen, setNegotiationHistoryModalOpen] = useState(false);
  const [negotiationHistory, setNegotiationHistory] = useState(null);
  const [negotiationHistoryLoading, setNegotiationHistoryLoading] = useState(false);
  const [negotiationHistoryError, setNegotiationHistoryError] = useState(null);
  const [viewBidId, setViewBidId] = useState(null);
  const [viewBidData, setViewBidData] = useState(null);
  
  // Ref for auto-scrolling negotiation history
  const negotiationHistoryRef = useRef(null);

  // Reject confirmation modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectBidId, setRejectBidId] = useState(null);
  const [rejectBidData, setRejectBidData] = useState(null);
  const [rejectingBid, setRejectingBid] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [editLoadType, setEditLoadType] = useState('OTR');
  const [editForm, setEditForm] = useState({
    // Common fields
    loadType: 'OTR',
    vehicleType: '',
    rate: '',
    rateType: 'Flat Rate',
    bidDeadline: '',

    // DRAYAGE specific fields
    fromAddress: '',
    fromCity: '',
    fromState: '',
    fromZip: '',
    toAddress: '',
    toCity: '',
    toState: '',
    toZip: '',
    weight: '',
    commodity: '',
    pickupDate: '',
    deliveryDate: '',
    containerNo: '',
    poNumber: '',
    bolNumber: '',
    returnDate: '',
    returnLocation: '',
    returnAddress: '',
    returnCity: '',
    returnState: '',
    returnZip: '',
    lineHaul: '',
    fsc: '',
    others: '',
    total: '',

    // OTR specific fields - origins and destinations arrays
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
    }]
  });
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editCharges, setEditCharges] = useState([]);
  const [editChargesCalculatorModalOpen, setEditChargesCalculatorModalOpen] = useState(false);

  // CMT Agent Details modal state
  const [cmtModalOpen, setCmtModalOpen] = useState(false);
  const [cmtLoading, setCmtLoading] = useState(false);
  const [cmtData, setCmtData] = useState(null);
  const [selectedLoadForCmt, setSelectedLoadForCmt] = useState(null);

  // Rate suggestion state
  const [rateSuggestions, setRateSuggestions] = useState(null);
  const [rateSuggestionsLoading, setRateSuggestionsLoading] = useState(false);
  const [showRateSuggestions, setShowRateSuggestions] = useState(false);
  const [suggestionDetailsModalOpen, setSuggestionDetailsModalOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [smartRateModalOpen, setSmartRateModalOpen] = useState(false);

  // Tab state management
  const [activeTab, setActiveTab] = useState(0);

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0); // Reset to first page when changing tabs
  };

  // Memoized filter loads based on active tab (optimized for performance)
  const filteredLoadsByTab = useMemo(() => {
    if (!loads || loads.length === 0) return [];

    const normalize = (status) => status ? status.toLowerCase() : '';

    switch (activeTab) {
      case 0: // Pending Approval
        return loads.filter(load =>
          ['pending', 'approval', 'pending approval', 'posted'].includes(normalize(load.status))
        );
      case 1: // Bidding
        return loads.filter(load =>
          ['bidding', 'bid received', 'posted'].includes(normalize(load.status))
        );
      case 2: // Transit
        return loads.filter(load =>
          ['assigned', 'in transit', 'picked up'].includes(normalize(load.status))
        ).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      case 3: // Delivered
        return loads.filter(load =>
          ['delivered', 'completed'].includes(normalize(load.status))
        );
      default:
        return loads;
    }
  }, [loads, activeTab]);

  // Keep getFilteredLoads function for backward compatibility
  const getFilteredLoads = useCallback(() => filteredLoadsByTab, [filteredLoadsByTab]);

  // Handle search result from universal search
  useEffect(() => {
    if (location.state?.selectedShipment) {
      const shipment = location.state.selectedShipment;
      setSearchTerm(shipment.shipmentNumber || '');
      console.log('Navigated from search:', shipment);

      // Filter to show only the searched shipment
      if (originalLoadData && originalLoadData.length > 0) {
        const filteredShipment = originalLoadData.find(load =>
          load.shipmentNumber === shipment.shipmentNumber ||
          load._id === shipment.id ||
          load.id === shipment.id
        );

        if (filteredShipment) {
          dispatch(setLoads([filteredShipment]));
          setIsFiltered(true);
        }
      }
    }
  }, [location.state, originalLoadData]);

  // Clear search filter
  const clearSearchFilter = () => {
    dispatch(resetLoadsToOriginal());
    setIsFiltered(false);
    setSearchTerm('');
  };

  useEffect(() => {
    // Smart caching: Check if data is fresh (< 2 minutes)
    const CACHE_TTL = 2 * 60 * 1000; // 2 minutes
    const isDataFresh = lastFetched && (Date.now() - lastFetched) < CACHE_TTL;
    
    // If we have cached data, we don't need to fetch immediately unless it's stale
    // or if the loads list is empty
    if (!isDataFresh || !loads || loads.length === 0) {
      dispatch(fetchShipperLoads());
    }
    
    // Auto-refresh every 30 seconds to check for updates
    const refreshInterval = setInterval(() => {
      dispatch(fetchShipperLoads());
    }, 30000); // 30 seconds
    
    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // Socket listener for real-time negotiation updates
  useEffect(() => {
    if (!socket) return;

    const handleNegotiationUpdate = async (data) => {
      console.log('🔄 Real-time negotiation update received:', data);
      
      // Normalize IDs for comparison (handle string/number mismatch)
      const currentBidId = viewBidId?.toString();
      const updateBidId = (data.bidId || data._id || data.negotiationId)?.toString();
      
      // If negotiation history modal is open and this update is for the current bid
      if (negotiationHistoryModalOpen && currentBidId && updateBidId === currentBidId) {
        
        console.log('📱 Processing negotiation update for open modal');

        // 🚀 Optimistic Update: Append message immediately without waiting for API
        if (data.message || data.rate) {
          console.log('⚡ Optimistically adding message to history');
          
          // Determine sender type for UI styling
          // If sender is shipper, it's 'shipper', otherwise treat as 'trucker' (left side)
          const senderType = (data.sender === 'shipper' || data.type === 'shipper') ? 'shipper' : 'trucker';
          
          const newMessage = {
             _id: data._id || Date.now().toString(),
             by: senderType,
             message: data.message || '',
             rate: data.rate || null,
             at: data.timestamp || new Date().toISOString()
          };

          setNegotiationHistory(prev => {
             // If history doesn't exist yet, initialize it
             if (!prev?.internalNegotiation?.history) {
                 return {
                     ...prev,
                     internalNegotiation: {
                         ...prev?.internalNegotiation,
                         history: [newMessage]
                     }
                 };
             }
             
             // Check for duplicates to avoid adding same message twice
             // (Compare ID or timestamp+message)
             const exists = prev.internalNegotiation.history.some(
                 msg => (msg._id && msg._id === newMessage._id) || 
                 (msg.at === newMessage.at && msg.message === newMessage.message && msg.rate === newMessage.rate)
             );
             
             if (exists) return prev;

             return {
                 ...prev,
                 internalNegotiation: {
                     ...prev.internalNegotiation,
                     history: [...prev.internalNegotiation.history, newMessage]
                 }
             };
          });
          
          // Force loading to false so user sees the message immediately
          setNegotiationHistoryLoading(false);
          
          // Scroll to bottom after optimistic update
          if (negotiationHistoryRef.current) {
            setTimeout(() => {
              negotiationHistoryRef.current?.scrollTo({
                top: negotiationHistoryRef.current.scrollHeight,
                behavior: 'smooth'
              });
            }, 100);
          }
        }
        
        // Still fetch from API to ensure synchronization
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${BASE_API_URL}/api/v1/bid/${viewBidId}/internal-negotiation-thread`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.data.success && response.data.data?.internalNegotiation) {
            setNegotiationHistory(response.data.data);
            setNegotiationHistoryLoading(false); // Ensure loading is off
            console.log('✅ Negotiation history synced with server');
          }
        } catch (err) {
          console.error('❌ Error refreshing negotiation history:', err);
        }
      }
      
      // Also refresh bids if bids modal is open for the same load
      if (bidsModalOpen && selectedLoadId && data.loadId === selectedLoadId) {
        console.log('📱 Refreshing bids for open modal');
        handleViewBids(selectedLoadId);
      }
    };

    // Listen for various negotiation events
    const negotiationEvents = [
      'internal_negotiation_update',
      'negotiation_thread_update', 
      'bid_negotiation_update',
      'shipper_internal_negotiate',
      'inhouse_internal_negotiate',
      'new_negotiation_message',
      'negotiation_message_received',
      'internal_negotiation_message',
      'driver_internal_negotiate',
      'trucker_internal_negotiate',
      'negotiation_update'
    ];

    negotiationEvents.forEach(event => {
      socket.on(event, handleNegotiationUpdate);
    });

    console.log('🎧 Socket listeners registered for negotiation updates');

    // Cleanup
    return () => {
      negotiationEvents.forEach(event => {
        socket.off(event, handleNegotiationUpdate);
      });
      console.log('🧹 Socket listeners cleaned up');
    };
  }, [socket, negotiationHistoryModalOpen, viewBidId, bidsModalOpen, selectedLoadId]);

  // Auto-scroll to bottom when negotiation history updates
  useEffect(() => {
    if (negotiationHistory?.internalNegotiation?.history && negotiationHistoryRef.current) {
      setTimeout(() => {
        negotiationHistoryRef.current?.scrollTo({
          top: negotiationHistoryRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [negotiationHistory?.internalNegotiation?.history]);

  // 🔄 Silent Polling: Auto-refresh negotiation history when modal is open
  // This ensures that even if socket events are missed, the user sees new messages within 3 seconds
  useEffect(() => {
    let intervalId;
    
    if (negotiationHistoryModalOpen && viewBidId) {
      console.log('🔄 Starting silent polling for negotiation history...');
      
      intervalId = setInterval(async () => {
        try {
          const token = localStorage.getItem('token');
          // Silent fetch - do not trigger loading state
          const response = await axios.get(`${BASE_API_URL}/api/v1/bid/${viewBidId}/internal-negotiation-thread`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success && response.data.data?.internalNegotiation) {
             setNegotiationHistory(prev => {
                const newHistory = response.data.data.internalNegotiation.history || [];
                const oldHistory = prev?.internalNegotiation?.history || [];
                
                // Only update if there's a change in message count or content
                // This prevents unnecessary re-renders
                if (JSON.stringify(newHistory) !== JSON.stringify(oldHistory)) {
                   console.log('📩 Polling found new messages! Updating UI...');
                   return response.data.data;
                }
                return prev;
             });
          }
        } catch (error) {
          // Silent catch - don't disturb user
          console.error('Silent polling error:', error);
        }
      }, 3000); // Poll every 3 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log('🛑 Stopped negotiation polling');
      }
    };
  }, [negotiationHistoryModalOpen, viewBidId]);


  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'posted':
        return 'info';
      case 'assigned':
        return 'warning';
      case 'in transit':
        return 'primary';
      case 'delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleOpenModal = () => {
    setModalOpen(true);
    // Convert to uppercase for API compatibility
    const apiLoadType = loadType === 'Drayage' ? 'DRAYAGE' : 'OTR';
    setForm({ ...form, loadType: apiLoadType, rateType: 'Flat Rate' });
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setRateSuggestions(null);
    setShowRateSuggestions(false);
    setSuggestionDetailsModalOpen(false);
    setSelectedSuggestion(null);
    setSmartRateModalOpen(false);
    setCreateLoadLoading(false); // Reset loading state when modal closes
  };

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
    const updatedForm = { ...form, others: totalCharges.toFixed(2) };

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

    setForm(updatedForm);
    handleCloseChargesCalculator();
  };

  // Edit Charges Calculator Modal Handlers
  const handleOpenEditChargesCalculator = () => {
    // Populate editCharges from editForm.others or from rateDetails.other if available
    if (selectedLoad?.rateDetails?.other && selectedLoad.rateDetails.other.length > 0) {
      const chargesFromLoad = selectedLoad.rateDetails.other.map(charge => ({
        id: Date.now() + Math.random(),
        name: charge.name || '',
        quantity: charge.quantity || 1,
        amount: charge.amount || 0,
        total: charge.total || (charge.amount * (charge.quantity || 1))
      }));
      setEditCharges(chargesFromLoad);
    } else if (editForm.others) {
      const totalOthers = parseFloat(editForm.others) || 0;
      if (totalOthers > 0) {
        setEditCharges([{
          id: Date.now(),
          name: 'Other Charges',
          quantity: 1,
          amount: totalOthers,
          total: totalOthers
        }]);
      }
    }
    setEditChargesCalculatorModalOpen(true);
  };

  const handleCloseEditChargesCalculator = () => {
    setEditChargesCalculatorModalOpen(false);
  };

  const handleAddEditCharge = () => {
    setEditCharges([...editCharges, { id: Date.now(), name: '', quantity: '', amount: '', total: 0 }]);
  };

  const handleDeleteEditCharge = (id) => {
    setEditCharges(editCharges.filter(charge => charge.id !== id));
  };

  const handleEditChargeChange = (id, field, value) => {
    setEditCharges(editCharges.map(charge => {
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

  const handleApplyEditCharges = () => {
    const totalCharges = editCharges.reduce((sum, charge) => {
      return sum + (parseFloat(charge.total) || 0);
    }, 0);
    
    // Recalculate Total Rate
    const lineHaul = parseFloat(editForm.lineHaul) || 0;
    const fscPercent = parseFloat(editForm.fsc) || 0;
    const otherCharges = parseFloat(totalCharges.toFixed(2)) || 0;
    
    // FSC is percentage of Line Haul: FSC Amount = Line Haul × (FSC / 100)
    const fscAmount = lineHaul * (fscPercent / 100);
    
    // Total Rate = Line Haul + FSC Amount + Other Charges
    const totalRate = lineHaul + fscAmount + otherCharges;
    setEditForm({
      ...editForm,
      others: totalCharges.toFixed(2),
      total: totalRate.toFixed(2),
      rate: totalRate.toFixed(2)
    });
    
    handleCloseEditChargesCalculator();
  };

  const handleFormChange = (e) => {
    const newForm = { ...form, [e.target.name]: e.target.value };

    // Calculate Total Rate when Line Haul, FSC, or Other Charges change
    if (e.target.name === 'lineHaul' || e.target.name === 'fsc' || e.target.name === 'others') {
      const lineHaul = parseFloat(newForm.lineHaul) || 0;
      const fscPercent = parseFloat(newForm.fsc) || 0;
      const otherCharges = parseFloat(newForm.others) || 0;

      // FSC is percentage of Line Haul: FSC Amount = Line Haul × (FSC / 100)
      const fscAmount = lineHaul * (fscPercent / 100);

      // Total Rate = Line Haul + FSC Amount + Other Charges
      const totalRate = lineHaul + fscAmount + otherCharges;
      newForm.total = totalRate.toFixed(2);
      newForm.rate = totalRate.toFixed(2); // Also update rate field
    }

    setForm(newForm);

    // Trigger rate suggestions when both pickup and delivery locations are filled
    if ((e.target.name === 'fromCity' || e.target.name === 'toCity') &&
      newForm.fromCity && newForm.toCity) {
      // Add a small delay to avoid too many API calls
      setTimeout(() => {
        fetchRateSuggestions(newForm.fromCity, newForm.toCity);
      }, 500);
    }
  };

  const handleLoadTypeChange = (type) => {
    setLoadType(type);

    // Reset form based on load type
    if (type === 'DRAYAGE') {
      setForm({
        loadType: 'DRAYAGE',
        vehicleType: '',
        rate: '',
        rateType: 'Flat Rate',
        bidDeadline: '',
        fromAddress: '',
        fromCity: '',
        fromState: '',
        toAddress: '',
        toCity: '',
        toState: '',
        weight: '',
        commodity: '',
        pickupDate: '',
        deliveryDate: '',
        containerNo: '',
        poNumber: '',
        bolNumber: '',
        returnDate: '',
        returnLocation: '',
        returnAddress: '',
        returnCity: '',
        returnState: '',
        returnZip: '',
        origins: [],
        destinations: []
      });
    } else {
      setForm({
        loadType: 'OTR',
        vehicleType: '',
        rate: '',
        rateType: 'Per Mile',
        bidDeadline: '',
        fromAddress: '',
        fromCity: '',
        fromState: '',
        toAddress: '',
        toCity: '',
        toState: '',
        weight: '',
        commodity: '',
        pickupDate: '',
        deliveryDate: '',
        containerNo: '',
        poNumber: '',
        bolNumber: '',
        returnDate: '',
        returnLocation: '',
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
        }]
      });
    }
    setErrors({});
  };

  const handleSubmit = async (e) => {
    console.log('🔵 handleSubmit function called!');
    console.log('🔵 Event:', e);
    console.log('🔵 Form submit triggered', form);
    console.log('🔵 loadType being sent to API:', form.loadType);
    console.log('🔵 returnDate:', form.returnDate);
    console.log('🔵 drayageLocation:', form.drayageLocation);
    
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    const newErrors = {};

    // Validate based on load type
    if (form.loadType === 'DRAYAGE') {
      const requiredFields = ['fromAddress', 'fromCity', 'fromState', 'fromZip', 'toAddress', 'toCity', 'toState', 'toZip', 'weight', 'commodity', 'vehicleType', 'pickupDate', 'deliveryDate', 'returnDate', 'returnAddress', 'returnCity', 'returnState', 'returnZip'];
      requiredFields.forEach(field => {
        if (!form[field]) newErrors[field] = true;
      });
      // Rate or Total must be present
      if (!form.rate && !form.total) {
        newErrors.rate = true;
      }
    } else if (form.loadType === 'OTR') {
      const requiredFields = ['vehicleType'];
      requiredFields.forEach(field => {
        if (!form[field]) newErrors[field] = true;
      });
      // Rate or Total must be present
      if (!form.rate && !form.total) {
        newErrors.rate = true;
      }

      // Validate origins
      if (!form.origins || form.origins.length === 0) {
        newErrors.origins = true;
      } else {
        form.origins.forEach((origin, index) => {
          const requiredOriginFields = ['addressLine1', 'city', 'weight', 'commodity', 'pickupDate'];
          requiredOriginFields.forEach(field => {
            if (!origin[field]) {
              newErrors[`origin_${index}_${field}`] = true;
            }
          });
        });
      }

      // Validate destinations
      if (!form.destinations || form.destinations.length === 0) {
        newErrors.destinations = true;
      } else {
        form.destinations.forEach((destination, index) => {
          const requiredDestinationFields = ['addressLine1', 'city', 'weight', 'commodity', 'deliveryDate'];
          requiredDestinationFields.forEach(field => {
            if (!destination[field]) {
              newErrors[`destination_${index}_${field}`] = true;
            }
          });
        });
      }
    }

    setErrors(newErrors);
    console.log('Validation errors:', newErrors);
    console.log('Form data:', form);
    console.log('Number of validation errors:', Object.keys(newErrors).length);
    
    if (Object.keys(newErrors).length === 0) {
      console.log('✅ Validation passed, proceeding with API call...');
      setCreateLoadLoading(true); // Start loading
      // Create payload based on load type
      let payload;

      if (form.loadType === 'DRAYAGE') {
        // Prepare rateDetails for DRAYAGE
        const otherCharges = charges.length > 0 
          ? charges
              .filter(charge => charge.name && charge.name.trim() !== '') // Only include charges with names
              .map(charge => ({
                name: charge.name || '',
                quantity: Number(charge.quantity) || 1,
                amount: parseFloat(charge.amount) || 0,
                total: parseFloat(charge.total) || 0
              }))
          : [];
        
        // If charges array is empty but others field has value, parse it
        let parsedOtherCharges = [];
        if (otherCharges.length === 0 && form.others) {
          // If others field has a total value, we can add it as a single charge
          const totalOthers = parseFloat(form.others) || 0;
          if (totalOthers > 0) {
            parsedOtherCharges = [{
              name: 'Other Charges',
              quantity: 1,
              amount: totalOthers,
              total: totalOthers
            }];
          }
        } else {
          parsedOtherCharges = otherCharges;
        }

        payload = {
          loadType: 'DRAYAGE',
          fromCity: form.fromCity,
          fromState: form.fromState,
          fromAddressLine1: form.fromAddress || '',
          fromAddressLine2: '', // Add if you have this field in form
          fromZip: form.fromZip || '',
          toCity: form.toCity,
          toState: form.toState,
          toAddressLine1: form.toAddress || '',
          toAddressLine2: '', // Add if you have this field in form
          toZip: form.toZip || '',
          weight: Number(form.weight),
          commodity: form.commodity,
          vehicleType: form.vehicleType,
          pickupDate: form.pickupDate ? new Date(form.pickupDate).toISOString() : '',
          deliveryDate: form.deliveryDate ? new Date(form.deliveryDate).toISOString() : '',
          returnDate: form.returnDate ? new Date(form.returnDate).toISOString() : '',
          rate: Number(form.total) || Number(form.rate) || 0,
          rateType: form.rateType || 'Flat Rate',
          bidDeadline: form.bidDeadline ? new Date(form.bidDeadline).toISOString() : '',
          containerNo: form.containerNo || '',
          poNumber: form.poNumber || '',
          bolNumber: form.bolNumber || '',
          returnAddress: form.returnAddress || '',
          returnCity: form.returnCity || '',
          returnState: form.returnState || '',
          returnZip: form.returnZip || '',
          rateDetails: {
            lineHaul: Number(form.lineHaul) || 0,
            fsc: Number(form.fsc) || 0,
            other: parsedOtherCharges,
            totalRates: Number(form.total) || Number(form.rate) || 0
          }
        };
      } else {
        // OTR Load
        // Prepare rateDetails for OTR
        const otherCharges = charges.length > 0 
          ? charges
              .filter(charge => charge.name && charge.name.trim() !== '') // Only include charges with names
              .map(charge => ({
                name: charge.name || '',
                quantity: Number(charge.quantity) || 1,
                amount: parseFloat(charge.amount) || 0,
                total: parseFloat(charge.total) || 0
              }))
          : [];
        
        // If charges array is empty but others field has value, parse it
        let parsedOtherCharges = [];
        if (otherCharges.length === 0 && form.others) {
          const totalOthers = parseFloat(form.others) || 0;
          if (totalOthers > 0) {
            parsedOtherCharges = [{
              name: 'Other Charges',
              quantity: 1,
              amount: totalOthers,
              total: totalOthers
            }];
          }
        } else {
          parsedOtherCharges = otherCharges;
        }

        payload = {
          loadType: 'OTR',
          vehicleType: form.vehicleType,
          rate: Number(form.total) || Number(form.rate) || 0,
          rateType: form.rateType || 'Flat Rate',
          bidDeadline: form.bidDeadline ? new Date(form.bidDeadline).toISOString() : '',
          poNumber: form.poNumber || '',
          bolNumber: form.bolNumber || '',
          origins: form.origins.map(origin => ({
            city: origin.city,
            state: origin.state || '',
            addressLine1: origin.addressLine1,
            addressLine2: origin.addressLine2 || '',
            zip: origin.zip || '',
            weight: Number(origin.weight) || 0,
            commodity: origin.commodity,
            pickupDate: origin.pickupDate ? new Date(origin.pickupDate).toISOString() : '',
            deliveryDate: origin.deliveryDate ? new Date(origin.deliveryDate).toISOString() : ''
          })),
          destinations: form.destinations.map(destination => ({
            city: destination.city,
            state: destination.state || '',
            addressLine1: destination.addressLine1,
            addressLine2: destination.addressLine2 || '',
            zip: destination.zip || '',
            weight: Number(destination.weight) || 0,
            commodity: destination.commodity,
            deliveryDate: destination.deliveryDate ? new Date(destination.deliveryDate).toISOString() : ''
          })),
          rateDetails: {
            lineHaul: Number(form.lineHaul) || 0,
            fsc: Number(form.fsc) || 0,
            other: parsedOtherCharges,
            totalRates: Number(form.total) || Number(form.rate) || 0
          }
        };
      }
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('❌ No token found in localStorage');
          alertify.error('Authentication required. Please login again.');
          return;
        }
        console.log('🚀 Making API call with payload:', JSON.stringify(payload, null, 2));
        console.log('🌐 API URL:', `${BASE_API_URL}/api/v1/load/create`);
        console.log('🔑 Token exists:', !!token);
        
        const response = await axios.post(`${BASE_API_URL}/api/v1/load/create`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('API response:', response);
        console.log('Created load status:', response.data?.load?.status || response.data?.status);
        setCreateLoadLoading(false); // Stop loading on success
        alertify.success('Load created successfully!');
        handleCloseModal();
        // Reset form
        setForm({
          loadType: 'OTR',
          vehicleType: '',
          rate: '',
          rateType: 'Flat Rate',
          bidDeadline: '',
          fromAddress: '',
          fromCity: '',
          fromState: '',
          toAddress: '',
          toCity: '',
          toState: '',
          weight: '',
          commodity: '',
          pickupDate: '',
          deliveryDate: '',
          containerNo: '',
          poNumber: '',
          bolNumber: '',
          returnDate: '',
          returnLocation: '',
          returnAddress: '',
          returnCity: '',
          returnState: '',
          returnZip: '',
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
          }]
        });
        setErrors({});
        // Refresh loads via Redux thunk
        console.log('Refreshing loads after successful creation...');
        await dispatch(fetchShipperLoads());
      } catch (err) {
        console.error('❌ Error creating load:', err);
        console.error('❌ Error response:', err.response);
        console.error('❌ Error message:', err.message);
        console.error('❌ Error data:', err.response?.data);
        setCreateLoadLoading(false); // Stop loading on error
        if (err.response) {
          alertify.error(err.response?.data?.message || err.response?.data?.error || 'Failed to create load');
        } else if (err.request) {
          alertify.error('Network error: Could not reach server. Please check your connection.');
        } else {
          alertify.error('An error occurred: ' + err.message);
        }
      }
    } else {
      console.warn('⚠️ Validation failed. Errors:', newErrors);
      alertify.warning('Please fill in all required fields');
    }
  };

  const handleViewBids = async (loadId) => {
    setSelectedLoadId(loadId);
    setBidsModalOpen(true);
    setBidsLoading(true);
    setBids([]);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_API_URL}/api/v1/bid/load/${loadId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (Array.isArray(response.data.bids)) {
        let processedBids = response.data.bids.map(bid => {
           // Apply local rejection if needed
           if (recentlyRejectedRef.current.has(bid._id)) {
             return { ...bid, status: 'Rejected' };
           }
           return bid;
        });

        // If any bid is Accepted, mark all others as Rejected
        const hasAcceptedBid = processedBids.some(bid => bid.status === 'Accepted');
        if (hasAcceptedBid) {
            processedBids = processedBids.map(bid => {
                if (bid.status !== 'Accepted') {
                    return { ...bid, status: 'Rejected' };
                }
                return bid;
            });
        }

        setBids(processedBids);
      } else {
        setBids([]);
      }
    } catch (err) {
      setBids([]);
    } finally {
      setBidsLoading(false);
    }
  };
  const handleCloseBidsModal = () => {
    setBidsModalOpen(false);
    setBids([]);
    setSelectedLoadId(null);
  };

  const handleViewBidDetails = (bid) => {
    setSelectedBid(bid);
    setBidDetailsModalOpen(true);
  };
  const handleCloseBidDetailsModal = () => {
    setBidDetailsModalOpen(false);
    setSelectedBid(null);
  };

  // Negotiation handlers
  const handleStartNegotiation = (bid) => {
    setNegotiationBidId(bid._id);
    setNegotiationForm({
      shipperCounterRate: bid.intermediateRate || '',
      shipperNegotiationMessage: ''
    });
    setNegotiationErrors({});
    setNegotiationModalOpen(true);
  };

  const handleCloseNegotiationModal = () => {
    setNegotiationModalOpen(false);
    setNegotiationForm({
      shipperCounterRate: '',
      shipperNegotiationMessage: ''
    });
    setNegotiationErrors({});
    setNegotiationBidId(null);
  };

  const handleNegotiationFormChange = (e) => {
    const { name, value } = e.target;
    setNegotiationForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (negotiationErrors[name]) {
      setNegotiationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNegotiationSubmit = async (e, bidId = null) => {
    e.preventDefault();

    // Use provided bidId or fallback to negotiationBidId state
    const activeBidId = bidId || negotiationBidId;

    if (!activeBidId) {
      alertify.error('Bid ID not found. Please try again.');
      return;
    }

    // Validation
    const errors = {};
    if (!negotiationForm.shipperCounterRate || negotiationForm.shipperCounterRate <= 0) {
      errors.shipperCounterRate = 'Please enter a valid counter rate';
    }
    if (!negotiationForm.shipperNegotiationMessage.trim()) {
      errors.shipperNegotiationMessage = 'Please enter a negotiation message';
    }

    if (Object.keys(errors).length > 0) {
      setNegotiationErrors(errors);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${BASE_API_URL}/api/v1/bid/${activeBidId}/shipper-internal-negotiate`, {
        shipperCounterRate: parseFloat(negotiationForm.shipperCounterRate),
        message: negotiationForm.shipperNegotiationMessage
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        alertify.success('Negotiation message sent successfully');

        // Clear form
        setNegotiationForm({
          shipperCounterRate: '',
          shipperNegotiationMessage: ''
        });
        setNegotiationErrors({});

        // Refresh negotiation history if modal is open
        if (negotiationHistoryModalOpen && viewBidId) {
          try {
            const token = localStorage.getItem('token');
            const historyResponse = await axios.get(`${BASE_API_URL}/api/v1/bid/${viewBidId}/internal-negotiation-thread`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            if (historyResponse.data.success && historyResponse.data.data?.internalNegotiation) {
              setNegotiationHistory(historyResponse.data.data);
            }
          } catch (err) {
            console.error('Error refreshing negotiation history:', err);
          }
        }

        // Close negotiation modal if open
        if (negotiationModalOpen) {
          handleCloseNegotiationModal();
        }
        handleCloseBidDetailsModal();

        // Refresh bids to show updated status
        if (selectedLoadId) {
          handleViewBids(selectedLoadId);
        }
      }
    } catch (err) {
      alertify.error(err.response?.data?.message || 'Failed to start negotiation');
    }
  };

  const handleViewNegotiationHistory = async (bid) => {
    setViewBidId(bid._id || bid.bidId);
    setViewBidData(bid);
    setNegotiationHistoryModalOpen(true);
    setNegotiationHistoryLoading(true);
    setNegotiationHistoryError(null);
    setNegotiationHistory(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_API_URL}/api/v1/bid/${bid._id || bid.bidId}/internal-negotiation-thread`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success && response.data.data?.internalNegotiation) {
        setNegotiationHistory(response.data.data);
      } else {
        throw new Error('Failed to fetch negotiation history');
      }
    } catch (err) {
      console.error('Error fetching negotiation history:', err);
      setNegotiationHistoryError(err.response?.data?.message || 'Failed to load negotiation history');
    } finally {
      setNegotiationHistoryLoading(false);
    }
  };

  const handleCloseNegotiationHistoryModal = () => {
    setNegotiationHistoryModalOpen(false);
    setNegotiationHistory(null);
    setNegotiationHistoryError(null);
    setViewBidId(null);
    setViewBidData(null);
    // Clear negotiation form when closing modal
    setNegotiationForm({
      shipperCounterRate: '',
      shipperNegotiationMessage: ''
    });
    setNegotiationErrors({});
  };

  const handleRejectBid = (bid) => {
    setRejectBidId(bid._id);
    setRejectBidData(bid);
    setRejectModalOpen(true);
  };

  const handleCloseRejectModal = () => {
    setRejectModalOpen(false);
    setRejectBidId(null);
    setRejectBidData(null);
  };

  const handleConfirmReject = async () => {
    setRejectingBid(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${BASE_API_URL}/api/v1/bid/${rejectBidId}/status`, {
        status: 'Rejected'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alertify.success('Bid rejected successfully');
        handleCloseRejectModal();
        
        // Add to locally rejected set to prevent race conditions
        recentlyRejectedRef.current.add(rejectBidId);

        // Update status to rejected but keep in list
        setBids(prevBids => prevBids.map(bid => bid._id === rejectBidId ? { ...bid, status: 'Rejected' } : bid));

        // Close details modal if open for this bid
        if (selectedBid && selectedBid._id === rejectBidId) {
          setBidDetailsModalOpen(false);
          setSelectedBid(null);
        }

        // Note: We intentionally do NOT call handleViewBids here to avoid 
        // a race condition where the backend might still return the rejected bid 
        // with 'Pending' status before the write is fully consistent.
        // The local update above is sufficient for UI feedback.
      }
    } catch (err) {
      alertify.error(err.response?.data?.message || 'Failed to reject bid');
    } finally {
      setRejectingBid(false);
    }
  };

  const handleAcceptBid = (bid) => {
    setAcceptBidId(bid._id);
    setAcceptForm({
      shipmentNumber: bid.shipmentNumber || '',
      poNumber: bid.poNumber || '',
      bolNumber: bid.bolNumber || '',
      acceptanceAttachment1: null
    });
    setAcceptFilePreview(null);
    setAcceptModalOpen(true);
  };
  const handleCloseAcceptModal = () => {
    setAcceptModalOpen(false);
    setAcceptBidId(null);
    setAcceptForm({ shipmentNumber: '', poNumber: '', bolNumber: '', acceptanceAttachment1: null });
    setAcceptErrors({});
    setAcceptFilePreview(null);
  };

 // Edit handlers
const handleEditLoad = (load) => {
  setSelectedLoad(load);
  const loadType = load.loadType || 'OTR';
  setEditLoadType(loadType);
  
  console.log('Editing load:', load); // Debug log
  
  if (loadType === 'DRAYAGE') {
    setEditForm({
      loadType: 'DRAYAGE',
      vehicleType: load.vehicleType || '',
      rate: load.rate || '',
      rateType: load.rateType || 'Flat Rate',
      bidDeadline: load.bidDeadline ? new Date(load.bidDeadline).toISOString().split('T')[0] : '',
      
      // DRAYAGE specific fields - using origins/destinations from API
      fromAddress: load.origins && load.origins.length > 0 ? load.origins[0].addressLine1 || '' : '',
      fromCity: load.origins && load.origins.length > 0 ? load.origins[0].city || '' : '',
      fromState: load.origins && load.origins.length > 0 ? load.origins[0].state || '' : '',
      fromZip: load.origins && load.origins.length > 0 ? load.origins[0].zip || '' : '',
      
      toAddress: load.destinations && load.destinations.length > 0 ? load.destinations[0].addressLine1 || '' : '',
      toCity: load.destinations && load.destinations.length > 0 ? load.destinations[0].city || '' : '',
      toState: load.destinations && load.destinations.length > 0 ? load.destinations[0].state || '' : '',
      toZip: load.destinations && load.destinations.length > 0 ? load.destinations[0].zip || '' : '',
      
      weight: load.weight || '',
      commodity: load.commodity || '',
      pickupDate: load.pickupDate ? new Date(load.pickupDate).toISOString().split('T')[0] : '',
      deliveryDate: load.deliveryDate ? new Date(load.deliveryDate).toISOString().split('T')[0] : '',
      containerNo: load.containerNo || '',
      poNumber: load.poNumber || '',
      bolNumber: load.bolNumber || '',
      returnDate: load.returnDate ? new Date(load.returnDate).toISOString().split('T')[0] : '',
      returnLocation: load.returnLocation || '',
      returnAddress: load.returnAddress || '',
      returnCity: load.returnCity || '',
      returnState: load.returnState || '',
      returnZip: load.returnZip || '',
      
      // Rate details
      lineHaul: load.rateDetails?.lineHaul || '',
      fsc: load.rateDetails?.fsc || '',
      others: load.rateDetails?.other?.reduce((sum, item) => sum + (item.total || item.amount || 0), 0) || '',
      total: load.rateDetails?.totalRates || load.rate || '',
      
      // Clear OTR fields
      origins: [],
      destinations: []
    });
  } else {
    // OTR load
    setEditForm({
      loadType: 'OTR',
      vehicleType: load.vehicleType || '',
      rate: load.rate || '',
      rateType: load.rateType || 'Flat Rate',
      bidDeadline: load.bidDeadline ? new Date(load.bidDeadline).toISOString().split('T')[0] : '',
      
      // OTR specific fields - origins and destinations arrays
      origins: load.origins && load.origins.length > 0 ? load.origins.map(origin => ({
        addressLine1: origin.addressLine1 || '',
        addressLine2: origin.addressLine2 || '',
        city: origin.city || '',
        state: origin.state || '',
        zip: origin.zip || '',
        weight: origin.weight || '',
        commodity: origin.commodity || '',
        pickupDate: origin.pickupDate ? new Date(origin.pickupDate).toISOString().split('T')[0] : '',
        deliveryDate: origin.deliveryDate ? new Date(origin.deliveryDate).toISOString().split('T')[0] : ''
      })) : [{
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
      
      destinations: load.destinations && load.destinations.length > 0 ? load.destinations.map(destination => ({
        addressLine1: destination.addressLine1 || '',
        addressLine2: destination.addressLine2 || '',
        city: destination.city || '',
        state: destination.state || '',
        zip: destination.zip || '',
        weight: destination.weight || '',
        commodity: destination.commodity || '',
        deliveryDate: destination.deliveryDate ? new Date(destination.deliveryDate).toISOString().split('T')[0] : ''
      })) : [{
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        weight: '',
        commodity: '',
        deliveryDate: ''
      }],
      
      // Rate details
      lineHaul: load.rateDetails?.lineHaul || '',
      fsc: load.rateDetails?.fsc || '',
      others: load.rateDetails?.other?.reduce((sum, item) => sum + (item.total || item.amount || 0), 0) || '',
      total: load.rateDetails?.totalRates || load.rate || '',
      
      // Clear DRAYAGE fields
      fromAddress: '',
      fromCity: '',
      fromState: '',
      fromZip: '',
      toAddress: '',
      toCity: '',
      toState: '',
      toZip: '',
      weight: '',
      commodity: '',
      pickupDate: '',
      deliveryDate: '',
      containerNo: '',
      poNumber: '',
      bolNumber: '',
      returnDate: '',
      returnLocation: '',
      returnAddress: '',
      returnCity: '',
      returnState: '',
      returnZip: ''
    });
  }
  
  // Set edit charges for charges calculator
  if (load.rateDetails?.other && load.rateDetails.other.length > 0) {
    const chargesFromLoad = load.rateDetails.other.map(charge => ({
      id: Date.now() + Math.random(),
      name: charge.name || '',
      quantity: charge.quantity || 1,
      amount: charge.amount || 0,
      total: charge.total || (charge.amount * (charge.quantity || 1))
    }));
    setEditCharges(chargesFromLoad);
  } else {
    setEditCharges([]);
  }
  
  setEditErrors({});
  setEditModalOpen(true);
};

  const handleDuplicateLoad = (load) => {
  // Set load type first
  setLoadType(load.loadType || 'OTR');

  console.log('Duplicating load:', load); // Debug log

  // Populate form with existing load data for duplication
  if (load.loadType === 'DRAYAGE') {
    setForm({
      loadType: 'DRAYAGE',
      
      // DRAYAGE specific fields - using origins/destinations from API
      fromAddress: load.origins && load.origins.length > 0 ? load.origins[0].addressLine1 || '' : '',
      fromCity: load.origins && load.origins.length > 0 ? load.origins[0].city || '' : '',
      fromState: load.origins && load.origins.length > 0 ? load.origins[0].state || '' : '',
      fromZip: load.origins && load.origins.length > 0 ? load.origins[0].zip || '' : '',
      
      toAddress: load.destinations && load.destinations.length > 0 ? load.destinations[0].addressLine1 || '' : '',
      toCity: load.destinations && load.destinations.length > 0 ? load.destinations[0].city || '' : '',
      toState: load.destinations && load.destinations.length > 0 ? load.destinations[0].state || '' : '',
      toZip: load.destinations && load.destinations.length > 0 ? load.destinations[0].zip || '' : '',
      
      weight: load.weight || '',
      commodity: load.commodity || '',
      vehicleType: load.vehicleType || '',
      pickupDate: load.pickupDate ? new Date(load.pickupDate).toISOString().split('T')[0] : '',
      deliveryDate: load.deliveryDate ? new Date(load.deliveryDate).toISOString().split('T')[0] : '',
      rate: load.rate || '',
      rateType: load.rateType || 'Flat Rate',
      bidDeadline: load.bidDeadline ? new Date(load.bidDeadline).toISOString().split('T')[0] : '',
      containerNo: load.containerNo || '',
      poNumber: load.poNumber || '',
      bolNumber: load.bolNumber || '',
      returnDate: load.returnDate ? new Date(load.returnDate).toISOString().split('T')[0] : '',
      returnLocation: load.returnLocation || '',
      returnAddress: load.returnAddress || '',
      returnCity: load.returnCity || '',
      returnState: load.returnState || '',
      returnZip: load.returnZip || '',
      
      // Rate details
      lineHaul: load.rateDetails?.lineHaul || '',
      fsc: load.rateDetails?.fsc || '',
      others: load.rateDetails?.other?.reduce((sum, item) => sum + (item.total || item.amount || 0), 0) || '',
      total: load.rateDetails?.totalRates || load.rate || '',
      
      // Clear OTR fields
      origins: [],
      destinations: []
    });
  } else {
    // OTR load duplication
    setForm({
      loadType: 'OTR',
      vehicleType: load.vehicleType || '',
      rate: load.rate || '',
      rateType: load.rateType || 'Flat Rate',
      bidDeadline: load.bidDeadline ? new Date(load.bidDeadline).toISOString().split('T')[0] : '',
      
      // OTR specific fields - origins and destinations arrays
      origins: load.origins && load.origins.length > 0 ? load.origins.map(origin => ({
        addressLine1: origin.addressLine1 || '',
        addressLine2: origin.addressLine2 || '',
        city: origin.city || '',
        state: origin.state || '',
        zip: origin.zip || '',
        weight: origin.weight || '',
        commodity: origin.commodity || '',
        pickupDate: origin.pickupDate ? new Date(origin.pickupDate).toISOString().split('T')[0] : '',
        deliveryDate: origin.deliveryDate ? new Date(origin.deliveryDate).toISOString().split('T')[0] : ''
      })) : [{
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
      
      destinations: load.destinations && load.destinations.length > 0 ? load.destinations.map(destination => ({
        addressLine1: destination.addressLine1 || '',
        addressLine2: destination.addressLine2 || '',
        city: destination.city || '',
        state: destination.state || '',
        zip: destination.zip || '',
        weight: destination.weight || '',
        commodity: destination.commodity || '',
        deliveryDate: destination.deliveryDate ? new Date(destination.deliveryDate).toISOString().split('T')[0] : ''
      })) : [{
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        weight: '',
        commodity: '',
        deliveryDate: ''
      }],
      
      // Rate details
      lineHaul: load.rateDetails?.lineHaul || '',
      fsc: load.rateDetails?.fsc || '',
      others: load.rateDetails?.other?.reduce((sum, item) => sum + (item.total || item.amount || 0), 0) || '',
      total: load.rateDetails?.totalRates || load.rate || '',
      
      // Clear DRAYAGE fields
      fromAddress: '',
      fromCity: '',
      fromState: '',
      fromZip: '',
      toAddress: '',
      toCity: '',
      toState: '',
      toZip: '',
      weight: '',
      commodity: '',
      pickupDate: '',
      deliveryDate: '',
      containerNo: '',
      poNumber: '',
      bolNumber: '',
      returnDate: '',
      returnLocation: '',
      returnAddress: '',
      returnCity: '',
      returnState: '',
      returnZip: ''
    });
  }

  // Set charges for charges calculator
  if (load.rateDetails?.other && load.rateDetails.other.length > 0) {
    const chargesFromLoad = load.rateDetails.other.map(charge => ({
      id: Date.now() + Math.random(),
      name: charge.name || '',
      quantity: charge.quantity || 1,
      amount: charge.amount || 0,
      total: charge.total || (charge.amount * (charge.quantity || 1))
    }));
    setCharges(chargesFromLoad);
  } else {
    setCharges([]);
  }

  setErrors({});
  setModalOpen(true);
};

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedLoad(null);
    setEditLoadType('OTR');
    setEditForm({
      loadType: 'OTR',
      vehicleType: '',
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
      weight: '',
      commodity: '',
      pickupDate: '',
      deliveryDate: '',
      containerNo: '',
      poNumber: '',
      bolNumber: '',
      returnDate: '',
      returnLocation: '',
      returnAddress: '',
      returnCity: '',
      returnState: '',
      returnZip: '',
      lineHaul: '',
      fsc: '',
      others: '',
      total: '',
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
      }]
    });
    setEditErrors({});
  };

  const handleEditFormChange = (e) => {
    const newForm = { ...editForm, [e.target.name]: e.target.value };
    
    // Calculate Total Rate when Line Haul, FSC, or Other Charges change
    if (e.target.name === 'lineHaul' || e.target.name === 'fsc' || e.target.name === 'others') {
      const lineHaul = parseFloat(newForm.lineHaul) || 0;
      const fscPercent = parseFloat(newForm.fsc) || 0;
      const otherCharges = parseFloat(newForm.others) || 0;
      
      // FSC is percentage of Line Haul: FSC Amount = Line Haul × (FSC / 100)
      const fscAmount = lineHaul * (fscPercent / 100);
      
      // Total Rate = Line Haul + FSC Amount + Other Charges
      const totalRate = lineHaul + fscAmount + otherCharges;
      newForm.total = totalRate.toFixed(2);
      newForm.rate = totalRate.toFixed(2); // Also update rate field
    }
    
    setEditForm(newForm);
    // Clear error when user starts typing
    if (editErrors[e.target.name]) {
      setEditErrors({ ...editErrors, [e.target.name]: false });
    }
  };

  const handleEditOriginChange = (index, field, value) => {
    const newOrigins = [...editForm.origins];
    newOrigins[index] = { ...newOrigins[index], [field]: value };
    setEditForm({ ...editForm, origins: newOrigins });
  };

  const handleEditDestinationChange = (index, field, value) => {
    const newDestinations = [...editForm.destinations];
    newDestinations[index] = { ...newDestinations[index], [field]: value };
    setEditForm({ ...editForm, destinations: newDestinations });
  };

  const handleAddEditOrigin = () => {
    setEditForm({
      ...editForm,
      origins: [...editForm.origins, {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        weight: '',
        commodity: '',
        pickupDate: '',
        deliveryDate: ''
      }]
    });
  };

  const handleAddEditDestination = () => {
    setEditForm({
      ...editForm,
      destinations: [...editForm.destinations, {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        weight: '',
        commodity: '',
        deliveryDate: ''
      }]
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    const newErrors = {};

    // Validate based on load type
    if (editLoadType === 'DRAYAGE') {
      const requiredFields = ['fromAddress', 'fromCity', 'fromState', 'fromZip', 'toAddress', 'toCity', 'toState', 'toZip', 'weight', 'commodity', 'vehicleType', 'pickupDate', 'deliveryDate', 'returnDate', 'returnAddress', 'returnCity', 'returnState', 'returnZip', 'bidDeadline'];
      requiredFields.forEach(field => {
        if (!editForm[field]) newErrors[field] = true;
      });
      // Rate or Total must be present
      if (!editForm.rate && !editForm.total) {
        newErrors.rate = true;
      }
    } else if (editLoadType === 'OTR') {
      const requiredFields = ['vehicleType', 'bidDeadline'];
      requiredFields.forEach(field => {
        if (!editForm[field]) newErrors[field] = true;
      });
      // Rate or Total must be present
      if (!editForm.rate && !editForm.total) {
        newErrors.rate = true;
      }

      // Validate origins
      if (!editForm.origins || editForm.origins.length === 0) {
        newErrors.origins = true;
      } else {
        editForm.origins.forEach((origin, index) => {
          const requiredOriginFields = ['addressLine1', 'city', 'state', 'zip', 'weight', 'commodity', 'pickupDate'];
          requiredOriginFields.forEach(field => {
            if (!origin[field]) {
              newErrors[`origin_${index}_${field}`] = true;
            }
          });
        });
      }

      // Validate destinations
      if (!editForm.destinations || editForm.destinations.length === 0) {
        newErrors.destinations = true;
      } else {
        editForm.destinations.forEach((destination, index) => {
          const requiredDestinationFields = ['addressLine1', 'city', 'state', 'zip', 'weight', 'commodity', 'deliveryDate'];
          requiredDestinationFields.forEach(field => {
            if (!destination[field]) {
              newErrors[`destination_${index}_${field}`] = true;
            }
          });
        });
      }
    }

    setEditErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      setEditLoading(false);
      alertify.warning('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alertify.error('Authentication required. Please login again.');
        setEditLoading(false);
        return;
      }

      let updateData;

      if (editLoadType === 'DRAYAGE') {
        // Prepare rateDetails for DRAYAGE
        const otherCharges = editCharges.length > 0 
          ? editCharges
              .filter(charge => charge.name && charge.name.trim() !== '')
              .map(charge => ({
                name: charge.name || '',
                quantity: Number(charge.quantity) || 1,
                amount: parseFloat(charge.amount) || 0,
                total: parseFloat(charge.total) || 0
              }))
          : [];
        
        let parsedOtherCharges = [];
        if (otherCharges.length === 0 && editForm.others) {
          const totalOthers = parseFloat(editForm.others) || 0;
          if (totalOthers > 0) {
            parsedOtherCharges = [{
              name: 'Other Charges',
              quantity: 1,
              amount: totalOthers,
              total: totalOthers
            }];
          }
        } else {
          parsedOtherCharges = otherCharges;
        }

        updateData = {
          loadType: 'DRAYAGE',
          fromCity: editForm.fromCity,
          fromState: editForm.fromState,
          fromAddressLine1: editForm.fromAddress || '',
          fromAddressLine2: '',
          fromZip: editForm.fromZip || '',
          toCity: editForm.toCity,
          toState: editForm.toState,
          toAddressLine1: editForm.toAddress || '',
          toAddressLine2: '',
          toZip: editForm.toZip || '',
          weight: Number(editForm.weight),
          commodity: editForm.commodity,
          vehicleType: editForm.vehicleType,
          pickupDate: editForm.pickupDate ? new Date(editForm.pickupDate).toISOString() : '',
          deliveryDate: editForm.deliveryDate ? new Date(editForm.deliveryDate).toISOString() : '',
          returnDate: editForm.returnDate ? new Date(editForm.returnDate).toISOString() : '',
          rate: Number(editForm.total) || Number(editForm.rate) || 0,
          rateType: editForm.rateType || 'Flat Rate',
          bidDeadline: editForm.bidDeadline ? new Date(editForm.bidDeadline).toISOString() : '',
          containerNo: editForm.containerNo || '',
          poNumber: editForm.poNumber || '',
          bolNumber: editForm.bolNumber || '',
          returnAddress: editForm.returnAddress || '',
          returnCity: editForm.returnCity || '',
          returnState: editForm.returnState || '',
          returnZip: editForm.returnZip || '',
          rateDetails: {
            lineHaul: Number(editForm.lineHaul) || 0,
            fsc: Number(editForm.fsc) || 0,
            other: parsedOtherCharges,
            totalRates: Number(editForm.total) || Number(editForm.rate) || 0
          }
        };
      } else {
        // OTR Load
        const otherCharges = editCharges.length > 0 
          ? editCharges
              .filter(charge => charge.name && charge.name.trim() !== '')
              .map(charge => ({
                name: charge.name || '',
                quantity: Number(charge.quantity) || 1,
                amount: parseFloat(charge.amount) || 0,
                total: parseFloat(charge.total) || 0
              }))
          : [];
        
        let parsedOtherCharges = [];
        if (otherCharges.length === 0 && editForm.others) {
          const totalOthers = parseFloat(editForm.others) || 0;
          if (totalOthers > 0) {
            parsedOtherCharges = [{
              name: 'Other Charges',
              quantity: 1,
              amount: totalOthers,
              total: totalOthers
            }];
          }
        } else {
          parsedOtherCharges = otherCharges;
        }

        updateData = {
          loadType: 'OTR',
          vehicleType: editForm.vehicleType,
          rate: Number(editForm.total) || Number(editForm.rate) || 0,
          rateType: editForm.rateType || 'Flat Rate',
          bidDeadline: editForm.bidDeadline ? new Date(editForm.bidDeadline).toISOString() : '',
          poNumber: editForm.poNumber || '',
          bolNumber: editForm.bolNumber || '',
          origins: editForm.origins.map(origin => ({
            addressLine1: origin.addressLine1,
            addressLine2: origin.addressLine2 || '',
            city: origin.city,
            state: origin.state || '',
            zip: origin.zip || '',
            weight: Number(origin.weight) || 0,
            commodity: origin.commodity,
            pickupDate: origin.pickupDate ? new Date(origin.pickupDate).toISOString() : '',
            deliveryDate: origin.deliveryDate ? new Date(origin.deliveryDate).toISOString() : ''
          })),
          destinations: editForm.destinations.map(destination => ({
            addressLine1: destination.addressLine1,
            addressLine2: destination.addressLine2 || '',
            city: destination.city,
            state: destination.state || '',
            zip: destination.zip || '',
            weight: Number(destination.weight) || 0,
            commodity: destination.commodity,
            deliveryDate: destination.deliveryDate ? new Date(destination.deliveryDate).toISOString() : ''
          })),
          rateDetails: {
            lineHaul: Number(editForm.lineHaul) || 0,
            fsc: Number(editForm.fsc) || 0,
            other: parsedOtherCharges,
            totalRates: Number(editForm.total) || Number(editForm.rate) || 0
          }
        };
      }

      const response = await axios.put(
        `${BASE_API_URL}/api/v1/load/shipper/load/${selectedLoad._id}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        await dispatch(fetchShipperLoads());
        handleCloseEditModal();
        alertify.success('Load updated successfully!');
      } else {
        alertify.error('Failed to update load: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating load:', error);
      if (error.response) {
        alertify.error(error.response?.data?.message || error.response?.data?.error || 'Failed to update load');
      } else if (error.request) {
        alertify.error('Network error: Could not reach server. Please check your connection.');
      } else {
        alertify.error('An error occurred: ' + error.message);
      }
    } finally {
      setEditLoading(false);
    }
  };

  // Handle CMT Agent Details
  const handleCmtAgentDetails = async (loadId) => {
    setSelectedLoadForCmt(loadId);
    setCmtModalOpen(true);
    setCmtLoading(true);
    setCmtData(null);

    // Find the load from current Redux-managed loads with loose equality check
    let currentLoad = (loads || []).find(load => load._id == loadId);
    // If not found in current view (e.g. filtered), check original data
    if (!currentLoad && originalLoadData && originalLoadData.length > 0) {
      currentLoad = originalLoadData.find(load => load._id == loadId);
    }
    console.log('Current Load from Redux loads:', currentLoad);
    // Log full object to debug keys
    console.log('Full Current Load Object:', JSON.stringify(currentLoad || {}, null, 2));
    console.log('Current Load Message:', currentLoad?.message);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_API_URL}/api/v1/load/shipper/load/${loadId}/cmt-assignment`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        console.log('CMT API Response:', response.data.data);
        
        // Try to find the approved bid message
        let approvedBidMessage = response.data.data.approvedBidMessage || null;
        
        // 1. Check if it's directly in the response
        if (response.data.data.winningBid?.message) {
          approvedBidMessage = response.data.data.winningBid.message;
        } 
        // 2. Check in response loadDetails.bids
        else if (response.data.data.loadDetails?.bids && Array.isArray(response.data.data.loadDetails.bids)) {
           // Case insensitive check for Accepted/Assigned
           const winning = response.data.data.loadDetails.bids.find(b => 
             b.status?.toLowerCase() === 'accepted' || b.status?.toLowerCase() === 'assigned'
           );
           if (winning) approvedBidMessage = winning.message;
        }
        // 3. Check in currentLoad.bids
        else if (currentLoad?.bids && Array.isArray(currentLoad.bids)) {
           // Case insensitive check for Accepted/Assigned
           const winning = currentLoad.bids.find(b => 
             b.status?.toLowerCase() === 'accepted' || b.status?.toLowerCase() === 'assigned'
           );
           if (winning) approvedBidMessage = winning.message;
        }

        // 4. Fallback: Check if there is a 'message' field in the CMT response that is not the same as the main message
         // Sometimes the API might return the bid message as 'bidMessage' or similar
         if (!approvedBidMessage && response.data.data.bidMessage) {
            approvedBidMessage = response.data.data.bidMessage;
         }

         // 5. Fallback: Match by rate if available
         if (!approvedBidMessage && (currentLoad?.rate || response.data.data.loadDetails?.rate)) {
             const targetRate = currentLoad?.rate || response.data.data.loadDetails?.rate;
             // Check in response bids
             if (response.data.data.loadDetails?.bids) {
                 const match = response.data.data.loadDetails.bids.find(b => b.amount == targetRate || b.rate == targetRate);
                 if (match) approvedBidMessage = match.message;
             }
             // Check in currentLoad bids
             if (!approvedBidMessage && currentLoad?.bids) {
                 const match = currentLoad.bids.find(b => b.amount == targetRate || b.rate == targetRate);
                 if (match) approvedBidMessage = match.message;
             }
         }
 
         // Re-verify the message from currentLoad right before merging
          const messageFromLoad = currentLoad?.acceptedBid?.message || currentLoad?.message;
          console.log('Message directly from currentLoad:', messageFromLoad);

          let extractedBidMessage = messageFromLoad || currentLoad?.Message || response.data.data.loadDetails?.message || response.data.data.message;
          
          // Deduplicate message if it repeats itself (e.g. "Text\nText")
          if (extractedBidMessage && typeof extractedBidMessage === 'string') {
            const parts = extractedBidMessage.split('\n');
            // Check if we can split into two identical halves
            if (parts.length >= 2 && parts.length % 2 === 0) {
              const mid = parts.length / 2;
              const firstHalf = parts.slice(0, mid).join('\n');
              const secondHalf = parts.slice(mid).join('\n');
              if (firstHalf.trim() === secondHalf.trim()) {
                console.log('Detected repeated message, cleaning up...');
                extractedBidMessage = firstHalf;
              }
            }
          }
          
          console.log('Final Extracted Bid Message:', extractedBidMessage);
 
          // Merge load data from Redux-managed loads state with CMT response
          const mergedData = {
             ...response.data.data,
             approvedBidMessage,
             // Explicitly set bidMessage
             bidMessage: extractedBidMessage,
             loadDetails: {
               ...response.data.data.loadDetails,
            // Ensure createdAt and shipmentNumber are present
            createdAt: response.data.data.loadDetails?.createdAt || currentLoad?.createdAt,
            shipmentNumber: response.data.data.loadDetails?.shipmentNumber || currentLoad?.shipmentNumber,
            
            // Add origins and destinations from the main load data
            origins: currentLoad?.origins || response.data.data.loadDetails?.origins,
            destinations: currentLoad?.destinations || response.data.data.loadDetails?.destinations,
            // Also add DRAYAGE fields as fallback
            fromAddress: currentLoad?.fromAddress || response.data.data.loadDetails?.fromAddress,
            fromCity: currentLoad?.fromCity || response.data.data.loadDetails?.fromCity,
            fromState: currentLoad?.fromState || response.data.data.loadDetails?.fromState,
            fromZip: currentLoad?.fromZip || response.data.data.loadDetails?.fromZip,
            toAddress: currentLoad?.toAddress || response.data.data.loadDetails?.toAddress,
            toCity: currentLoad?.toCity || response.data.data.loadDetails?.toCity,
            toState: currentLoad?.toState || response.data.data.loadDetails?.toState,
            toZip: currentLoad?.toZip || response.data.data.loadDetails?.toZip,
          }
        };
        
        console.log('Merged CMT Data:', mergedData);
        console.log('Origins:', mergedData.loadDetails?.origins);
        console.log('Destinations:', mergedData.loadDetails?.destinations);
        setCmtData(mergedData);
      } else {
        setCmtData(null);
        if (window.alertify) {
          window.alertify.error(response.data.message || 'Failed to fetch CMT assignment details');
        } else {
          alert(response.data.message || 'Failed to fetch CMT assignment details');
        }
      }
    } catch (err) {
      console.error('Error fetching CMT assignment details:', err);
      setCmtData(null);
      if (window.alertify) {
        window.alertify.error(err.response?.data?.message || 'Failed to fetch CMT assignment details');
      } else {
        alert(err.response?.data?.message || 'Failed to fetch CMT assignment details');
      }
    } finally {
      setCmtLoading(false);
    }
  };

  const handleCloseCmtModal = () => {
    setCmtModalOpen(false);
    setCmtData(null);
    setSelectedLoadForCmt(null);
  };

  // Rate suggestion API call
  const fetchRateSuggestions = async (pickupLocation, deliveryLocation) => {
    if (!pickupLocation || !deliveryLocation) {
      setRateSuggestions(null);
      setShowRateSuggestions(false);
      return;
    }

    setRateSuggestionsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BASE_API_URL}/api/v1/load/rate-suggestion?pickupLocation=${encodeURIComponent(pickupLocation)}&deliveryLocation=${encodeURIComponent(deliveryLocation)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setRateSuggestions(response.data.data);
        setShowRateSuggestions(true);
      } else {
        setRateSuggestions(null);
        setShowRateSuggestions(false);
      }
    } catch (err) {
      console.error('Error fetching rate suggestions:', err);
      setRateSuggestions(null);
      setShowRateSuggestions(false);
    } finally {
      setRateSuggestionsLoading(false);
    }
  };

  // Apply suggested rate to form
  const applySuggestedRate = (rate) => {
    setForm({ ...form, rate: rate });
    setShowRateSuggestions(false);
  };

  // Handle suggestion details modal
  const handleSuggestionDetails = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setSuggestionDetailsModalOpen(true);
  };

  const handleCloseSuggestionDetails = () => {
    setSuggestionDetailsModalOpen(false);
    setSelectedSuggestion(null);
  };

  // Handle smart rate suggestion button
  const handleSmartRateSuggestion = async () => {
    if (!form.fromCity || !form.toCity) {
      alert('Please fill in both pickup and delivery locations first');
      return;
    }

    setSmartRateModalOpen(true);
    await fetchRateSuggestions(form.fromCity, form.toCity);
  };

  const handleCloseSmartRateModal = () => {
    setSmartRateModalOpen(false);
  };

  // Handle refresh load created-at
  const handleRefreshLoad = async (loadId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${BASE_API_URL}/api/v1/load/shipper/load/${loadId}/update-created-at`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Show success notification
        if (window.alertify) {
          window.alertify.success('Load timestamp updated successfully!');
        } else {
          alert('Load timestamp updated successfully!');
        }

        // Refresh the loads data
        dispatch(fetchShipperLoads());
      } else {
        // Show error notification
        if (window.alertify) {
          window.alertify.error('Failed to update load timestamp: ' + (response.data.message || 'Unknown error'));
        } else {
          alert('Failed to update load timestamp: ' + (response.data.message || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error updating load timestamp:', error);
      // Show error notification
      if (window.alertify) {
        window.alertify.error('Error updating load timestamp: ' + (error.response?.data?.message || error.message));
      } else {
        alert('Error updating load timestamp: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleAcceptFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'acceptanceAttachment1' && files && files[0]) {
      const file = files[0];
      setAcceptForm((prev) => ({ ...prev, [name]: file }));
      // Create preview for image files
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAcceptFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setAcceptFilePreview(null);
      }
    } else {
      setAcceptForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleAcceptSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!acceptForm.shipmentNumber?.trim()) {
      newErrors.shipmentNumber = 'Shipment Number is required';
    }
    if (!acceptForm.poNumber?.trim()) {
      newErrors.poNumber = 'PO Number is required';
    }
    if (!acceptForm.bolNumber?.trim()) {
      newErrors.bolNumber = 'BOL Number is required';
    }
    setAcceptErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      alertify.error('Please fill in all required fields');
      return;
    }
    setAcceptingBid(true);
    try {
      const token = localStorage.getItem('token');

      // If file is present, use FormData, otherwise use JSON
      if (acceptForm.acceptanceAttachment1) {
        const formData = new FormData();
        formData.append('status', 'Accepted');
        formData.append('shipmentNumber', acceptForm.shipmentNumber.trim());
        formData.append('poNumber', acceptForm.poNumber.trim());
        formData.append('bolNumber', acceptForm.bolNumber.trim());
        formData.append('acceptanceAttachment1', acceptForm.acceptanceAttachment1);

        await axios.put(`${BASE_API_URL}/api/v1/bid/${acceptBidId}/status`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.put(`${BASE_API_URL}/api/v1/bid/${acceptBidId}/status`, {
          status: 'Accepted',
          shipmentNumber: acceptForm.shipmentNumber.trim(),
          poNumber: acceptForm.poNumber.trim(),
          bolNumber: acceptForm.bolNumber.trim()
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      setBids((prev) => prev.map((bid) => {
        if (bid._id === acceptBidId) {
          return { ...bid, status: 'Accepted' };
        } else {
          return { ...bid, status: 'Rejected' };
        }
      }));
      alertify.success('Bid accepted successfully!');
      setAcceptModalOpen(false);
      setAcceptBidId(null);
      setAcceptForm({ shipmentNumber: '', poNumber: '', bolNumber: '', acceptanceAttachment1: null });
      setAcceptErrors({});
      setAcceptFilePreview(null);
      // Refresh bids commented out to preserve local state updates
      // if (selectedLoadId) {
      //   handleViewBids(selectedLoadId);
      // }
    } catch (err) {
      alertify.error(err.response?.data?.message || 'Failed to accept bid');
    } finally {
      setAcceptingBid(false);
    }
  };

  // Memoized combined filtering: tab filter + search filter (optimized for performance)
  const filteredData = useMemo(() => {
    return filteredLoadsByTab.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [filteredLoadsByTab, searchTerm]);

  // Export CSV function (Consignment.jsx style)
  const exportToCSV = () => {
    const headers = ['Load ID', 'Weight', 'Pick-Up', 'Drop', 'Vehicle', 'Bids', 'Status'];
    const csvRows = [headers.join(',')];
    (loads || []).forEach(row => {
      const values = [row.id, row.weight, row.pickup, row.drop, row.vehicle, row.bids, row.status];
      csvRows.push(values.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'loadboard_data.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3 }}>
      <SearchNavigationFeedback
        searchResult={location.state?.selectedShipment}
        searchQuery={location.state?.searchQuery}
      />
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
            Load Board
          </Typography>
          {isFiltered && (
            <Chip
              label={`Filtered: ${filteredData.length} result${filteredData.length !== 1 ? 's' : ''}`}
              color="primary"
              onDelete={clearSearchFilter}
              deleteIcon={<Clear />}
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
            variant="outlined"
            onClick={exportToCSV}
            sx={{
              borderRadius: 2,
              fontSize: '0.75rem',
              px: 2,
              py: 0.8,
              fontWeight: 500,
              textTransform: 'none',
              color: '#1976d2',
              borderColor: '#1976d2',
              '&:hover': {
                borderColor: '#0d47a1',
                color: '#0d47a1',
              },
            }}

          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenModal}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Add Load
          </Button>
        </Stack>
      </Box>

      {/* Beautiful Gradient Tabs Section */}
      <Paper elevation={2} sx={{ borderRadius: 3, mb: 3, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': {
              height: 4,
              borderRadius: '2px 2px 0 0',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              py: 2,
              px: 3,
              minHeight: 60,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              color: '#495057',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)',
                color: '#212529',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
              '&.Mui-selected': {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                fontWeight: 700,
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transform: 'translateY(-2px)',
              },
            },
          }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: activeTab === 0 ? '#ffffff' : '#ffc107',
                  boxShadow: activeTab === 0 ? '0 0 10px rgba(255,255,255,0.6)' : '0 0 10px rgba(255,193,7,0.6)',
                  border: '2px solid rgba(255,255,255,0.3)'
                }} />
                <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                  Pending Approval ({tabCounts[0]})
                </Typography>
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: activeTab === 1 ? '#ffffff' : '#17a2b8',
                  boxShadow: activeTab === 1 ? '0 0 10px rgba(255,255,255,0.6)' : '0 0 10px rgba(23,162,184,0.6)',
                  border: '2px solid rgba(255,255,255,0.3)'
                }} />
                <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                  Bidding ({tabCounts[1]})
                </Typography>
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: activeTab === 2 ? '#ffffff' : '#28a745',
                  boxShadow: activeTab === 2 ? '0 0 10px rgba(255,255,255,0.6)' : '0 0 10px rgba(40,167,69,0.6)',
                  border: '2px solid rgba(255,255,255,0.3)'
                }} />
                <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                  Transit ({tabCounts[2]})
                </Typography>
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: activeTab === 3 ? '#ffffff' : '#6f42c1',
                  boxShadow: activeTab === 3 ? '0 0 10px rgba(255,255,255,0.6)' : '0 0 10px rgba(111,66,193,0.6)',
                  border: '2px solid rgba(255,255,255,0.3)'
                }} />
                <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                  Delivered ({tabCounts[3]})
                </Typography>
              </Box>
            }
          />
        </Tabs>
      </Paper>

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', backgroundColor: (themeConfig?.content?.bgImage ? 'rgba(255,255,255,0.94)' : (themeConfig?.table?.bg || '#fff')), position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>
        {themeConfig?.table?.bgImage && (
          <Box sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${themeConfig.table.bgImage})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: themeConfig.table?.bgImageOpacity ?? 0,
            pointerEvents: 'none',
            zIndex: 0,
          }} />
        )}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: (themeConfig.table?.headerBg || '#f0f4f8') }}>
              <TableCell sx={{ fontWeight: 600 }}>Load ID</TableCell>
              
              {/* Hide Shipment No column for Pending Approval (0) and Bidding (1) tabs */}
              {activeTab !== 0 && activeTab !== 1 && (
                <TableCell sx={{ fontWeight: 600 }}>Shipment No</TableCell>
              )}
              <TableCell sx={{ fontWeight: 600 }}>Weight</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Pick-Up</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Drop</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="text" width={150} /></TableCell>
                  {activeTab !== 0 && activeTab !== 1 && (
                    <TableCell><Skeleton variant="text" width={120} /></TableCell>
                  )}
                  <TableCell><Skeleton variant="text" width={80} /></TableCell>
                  <TableCell><Skeleton variant="text" width={150} /></TableCell>
                  <TableCell><Skeleton variant="text" width={150} /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="rectangular" width={80} height={26} sx={{ borderRadius: 1 }} /></TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 1 }} />
                      <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 1 }} />
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={activeTab === 0 || activeTab === 1 ? 8 : 9} align="center">No data found</TableCell>
              </TableRow>
            ) : (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((load, i) => {
                  const isSearchedItem = isFiltered && location.state?.selectedShipment &&
                    (load.shipmentNumber === location.state.selectedShipment.shipmentNumber ||
                      load._id === location.state.selectedShipment.id ||
                      load.id === location.state.selectedShipment.id);

                  return (
                    <TableRow
                      key={load._id}
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
                      <TableCell>{load._id ? `L-${load._id.slice(-4)}` : '-'}</TableCell>
                      {/* Hide Shipment No cell for Pending Approval (0) and Bidding (1) tabs */}
                      {activeTab !== 0 && activeTab !== 1 && (
                        <TableCell>{load.shipmentNumber}</TableCell>
                      )}
                      <TableCell>{load.weight !== undefined && load.weight !== null && load.weight !== '' ? `${load.weight} Kg` : '-'}</TableCell>
                      <TableCell>
                        {load.origins && load.origins.length > 0 && load.origins[0].city ?
                          `${load.origins[0].city}${load.origins[0].state ? `, ${load.origins[0].state}` : ''}` :
                          '-'
                        }
                      </TableCell>
                      <TableCell>
                        {load.destinations && load.destinations.length > 0 && load.destinations[0].city ?
                          `${load.destinations[0].city}${load.destinations[0].state ? `, ${load.destinations[0].state}` : ''}` :
                          '-'
                        }
                      </TableCell>
                      <TableCell>{load.vehicleType || '-'}</TableCell>
                      <TableCell>
                        <Chip label={load.status || '-'} color={getStatusColor(load.status || '')} size="small" />
                      </TableCell>
                                            <TableCell>{load.createdAt ? new Date(load.createdAt).toLocaleString() : '-'}</TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewBids(load._id)}
                            disabled={['Assigned', 'In Transit', 'Delivered'].includes(load.status)}
                            sx={{
                              opacity: ['Assigned', 'In Transit', 'Delivered'].includes(load.status) ? 0.5 : 1,
                              cursor: ['Assigned', 'In Transit', 'Delivered'].includes(load.status) ? 'not-allowed' : 'pointer'
                            }}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleEditLoad(load)}
                            disabled={!['Pending', 'Approval', 'Pending Approval', 'Posted'].includes(load.status)}
                            sx={{
                              opacity: !['Pending', 'Approval', 'Pending Approval', 'Posted'].includes(load.status) ? 0.5 : 1,
                              cursor: !['Pending', 'Approval', 'Pending Approval', 'Posted'].includes(load.status) ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Edit
                          </Button>
                          {/* <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleDuplicateLoad(load)}
                            sx={{
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              '&:hover': {
                                backgroundColor: '#bbdefb'
                              }
                            }}
                          >
                            Duplicate
                          </Button> */}
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleCmtAgentDetails(load._id)}
                            sx={{
                              fontSize: '0.7rem',
                              px: 1,
                              py: 0.5,
                              textTransform: 'none',
                              fontWeight: 500
                            }}
                          >
                            CMT Agent Details
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleRefreshLoad(load._id)}
                            disabled={!['Posted', 'Pending', 'Approval'].includes(load.status)}
                            sx={{
                              minWidth: 'auto',
                              px: 1,
                              opacity: !['Posted', 'Pending', 'Approval'].includes(load.status) ? 0.5 : 1,
                              cursor: !['Posted', 'Pending', 'Approval'].includes(load.status) ? 'not-allowed' : 'pointer'
                            }}
                            title="Refresh Load Timestamp"
                          >
                            <Refresh fontSize="small" />
                          </Button>

                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
        </Box>
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 15, 20]}
        />
      </Paper>

      {/* Modern Add Load Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
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
        <DialogTitle className="border-b-0 flex items-center justify-between gap-3 py-4 px-6 relative rounded-t-lg" sx={{ backgroundColor: brand, color: headerTextColor }}>
          <Box className="flex items-center gap-3 flex-1">
            <Box className="bg-white rounded-lg w-12 h-12 flex items-center justify-center border-2 border-blue-300 shadow-sm">
              <LocalShipping className="text-xl text-blue-500" />
            </Box>
            <Box>
              <Typography variant="h5" className="font-bold mb-0.5 text-xl text-white" sx={{ color: headerTextColor }}>
                Create New Load
              </Typography>
              <Typography variant="body2" className="text-sm opacity-95" sx={{ color: headerTextColor }}>
                Fill in the details to create a new shipment
              </Typography>
            </Box>
          </Box>

          {/* Load Type Toggle and Close Button */}
          <Stack direction="row" spacing={1.5} className="items-center">
            <ToggleButtonGroup
              value={loadType}
              exclusive
              onChange={(e, val) => { if (val) handleLoadTypeChange(val); }}
              sx={{
                bgcolor: 'transparent',
                '& .MuiToggleButton-root': {
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: headerTextColor,
                  borderColor: 'rgba(255,255,255,0.7)',
                },
                '& .Mui-selected': {
                  bgcolor: '#ffffff !important',
                  color: primary + ' !important',
                  borderColor: 'transparent',
                },
              }}
            >
              <ToggleButton value="OTR">OTR</ToggleButton>
              <ToggleButton value="DRAYAGE">DRAYAGE</ToggleButton>
            </ToggleButtonGroup>
            {/* Close Button */}
            <IconButton
              onClick={handleCloseModal}
              sx={{
                color: headerTextColor,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                },
                ml: 1.5
              }}
              size="small"
            >
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent className="p-0 bg-gray-100 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-gray-500">
          {createLoadLoading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '400px',
              position: 'relative',
              zIndex: 1000
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 2 }}>
                <CircularProgress size={50} />
                <Typography variant="h6" color="primary">
                  Creating Load...
                </Typography>
              </Box>
            </Box>
          ) : (
          <Box component="form" onSubmit={handleSubmit} className="p-3">

            {/* Form Sections */}
            <Box className="flex flex-col gap-3">

              {/* DRAYAGE Location Section - Only for DRAYAGE */}
              {loadType === 'DRAYAGE' && (
                <>
                  {/* Location Details Section */}
                  <Paper elevation={0} className="p-3 rounded-lg bg-white shadow-sm">
                    <Box className="flex items-center gap-2 mb-3">
                      <Box className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <LocationOn className="text-green-600 text-2xl" />
                      </Box>
                      <Typography variant="h6" className="font-semibold text-gray-800 text-lg">
                        Location Details
                      </Typography>
                    </Box>

                    {/* Pick Up Location Sub-section */}
                    <Box
                      className="mb-6 p-4 rounded-2xl shadow-sm bg-gradient-to-b from-white to-gray-50 border border-gray-200"
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
                            value={form.fromAddress}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.fromAddress}
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
                            value={form.fromCity}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.fromCity}
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
                            value={form.fromState}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.fromState}
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
                            value={form.fromZip}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.fromZip}
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
                      className="mb-6 p-4 rounded-2xl shadow-sm bg-gradient-to-b from-white to-gray-50 border border-gray-200"
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
                            value={form.toAddress}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.toAddress}
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
                            value={form.toCity}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.toCity}
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
                            value={form.toState}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.toState}
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
                            value={form.toZip}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.toZip}
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
                      className="mb-6 p-4 rounded-2xl shadow-sm bg-gradient-to-b from-white to-gray-50 border border-gray-200"
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
                        <Room sx={{ color: '#4A90E2', fontSize: 20 }} /> {/* Location icon */}
                        Return Location
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Full Address *"
                            name="returnAddress"
                            value={form.returnAddress}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.returnAddress}
                            placeholder="Full address"
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
                            label="City *"
                            name="returnCity"
                            value={form.returnCity}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.returnCity}
                            placeholder="Enter city"
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
                            value={form.returnState}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.returnState}
                            placeholder="Enter state"
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
                            value={form.returnZip}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.returnZip}
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
                  </Paper>
                </>
              )}

              {/* OTR Origins and Destinations - Only for OTR */}
              {loadType === 'OTR' && (
                <>
                  {/* 🟦 PICKUP SECTION */}
                  <Box
                    sx={{
                      backgroundColor: '#fff',
                      borderRadius: 3,
                      p: 3,
                      mt: 3,
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

                    {form.origins.map((origin, index) => (
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
                          {form.origins.length > 1 && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Delete />}
                              onClick={() => {
                                const newOrigins = form.origins.filter((_, i) => i !== index);
                                setForm({ ...form, origins: newOrigins });
                              }}
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
                          {[
                            { label: 'Full Address *', name: 'addressLine1', value: origin.addressLine1, placeholder: 'Enter full address', required: true },
                            { label: 'City *', name: 'city', value: origin.city, placeholder: 'Enter city', required: true },
                            { label: 'State *', name: 'state', value: origin.state, placeholder: 'Enter state', required: true },
                            { label: 'Zip Code *', name: 'zip', value: origin.zip, placeholder: 'Enter zip code', required: true },
                            { label: 'Weight (lbs) *', name: 'weight', value: origin.weight, placeholder: 'e.g., 26000', required: true },
                            { label: 'Commodity *', name: 'commodity', value: origin.commodity, placeholder: 'Enter commodity', required: true },
                            { label: 'Pickup Date *', name: 'pickupDate', value: origin.pickupDate, type: 'datetime-local', required: true },
                            { label: 'Delivery Date', name: 'deliveryDate', value: origin.deliveryDate, type: 'datetime-local' },
                          ].map((field, i) => (
                            <Grid item xs={12} sm={6} key={i}>
                              <TextField
                                type={field.type || 'text'}
                                label={field.label}
                                name={`origins[${index}].${field.name}`}
                                value={field.value}
                                placeholder={field.placeholder}
                                onChange={(e) => {
                                  const newOrigins = [...form.origins];
                                  newOrigins[index][field.name] = e.target.value;
                                  setForm({ ...form, origins: newOrigins });
                                }}
                                fullWidth
                                error={!!errors[`origin_${index}_${field.name}`]}
                                InputLabelProps={field.type === 'datetime-local' ? { shrink: true } : undefined}
                                sx={{
                                  minWidth: '270px',
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
                          ))}
                        </Grid>
                      </Paper>
                    ))}

                    <Button
                      variant="outlined"
                      onClick={() =>
                        setForm({
                          ...form,
                          origins: [
                            ...form.origins,
                            {
                              addressLine1: '',
                              city: '',
                              state: '',
                              zip: '',
                              weight: '',
                              commodity: '',
                              pickupDate: '',
                              deliveryDate: '',
                            },
                          ],
                        })
                      }
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

                    {form.destinations.map((destination, index) => (
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
                          {form.destinations.length > 1 && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Delete />}
                              onClick={() => {
                                const newDestinations = form.destinations.filter((_, i) => i !== index);
                                setForm({ ...form, destinations: newDestinations });
                              }}
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

                        {/* Fields (same as pickup) */}
                        <Grid container spacing={2.5}>
                          {[
                            { label: 'Full Address *', name: 'addressLine1', value: destination.addressLine1, placeholder: 'Enter full address', required: true },
                            { label: 'City *', name: 'city', value: destination.city, placeholder: 'Enter city', required: true },
                            { label: 'State *', name: 'state', value: destination.state, placeholder: 'Enter state', required: true },
                            { label: 'Zip Code *', name: 'zip', value: destination.zip, placeholder: 'Enter zip code', required: true },
                            { label: 'Weight (lbs) *', name: 'weight', value: destination.weight, placeholder: 'e.g., 26000', required: true },
                            { label: 'Commodity *', name: 'commodity', value: destination.commodity, placeholder: 'Enter commodity', required: true },
                            { label: 'Delivery Date *', name: 'deliveryDate', value: destination.deliveryDate, type: 'datetime-local', required: true },
                          ].map((field, i) => (
                            <Grid item xs={12} sm={6} key={i}>
                              <TextField
                                type={field.type || 'text'}
                                label={field.label}
                                name={`destinations[${index}].${field.name}`}
                                value={field.value}
                                placeholder={field.placeholder}
                                onChange={(e) => {
                                  const newDestinations = [...form.destinations];
                                  newDestinations[index][field.name] = e.target.value;
                                  setForm({ ...form, destinations: newDestinations });
                                }}
                                fullWidth
                                error={!!errors[`destination_${index}_${field.name}`]}
                                InputLabelProps={field.type === 'datetime-local' ? { shrink: true } : undefined}
                                sx={{
                                  minWidth: '270px',
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
                          ))}
                        </Grid>
                      </Paper>
                    ))}

                    <Button
                      variant="outlined"
                      onClick={() =>
                        setForm({
                          ...form,
                          destinations: [
                            ...form.destinations,
                            {
                              addressLine1: '',
                              city: '',
                              state: '',
                              zip: '',
                              weight: '',
                              commodity: '',
                              pickupDate: '',
                              deliveryDate: '',
                            },
                          ],
                        })
                      }
                      sx={{ mt: 1 }}
                    >
                      Add Delivery Location
                    </Button>
                  </Box>
                </>
              )}


              {/* Load Details Section */}
              <Paper elevation={0} className="p-3 rounded-lg bg-white shadow-sm">
                <Box className="flex items-center gap-2 mb-3">
                  <Box className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Business className="text-purple-600 text-2xl" />
                  </Box>
                  <Typography variant="h6" className="font-semibold text-gray-800 text-lg">
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
                      {/* Header */}
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

                      {/* ✅ Row - 5 Fields */}
                      <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControl
                            fullWidth
                            error={!!errors.vehicleType}
                            sx={{
                              '& .MuiInputBase-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                              },
                              '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                            }}
                          >
                            <InputLabel>Vehicle Type *</InputLabel>
                            <Select
                              name="vehicleType"
                              value={form.vehicleType}
                              onChange={handleFormChange}
                              label="Vehicle Type *"
                              sx={{
                                height: '56px',
                                minWidth: '295px',
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
                            value={form.lineHaul}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.lineHaul}
                            placeholder="e.g., 7500"
                            sx={{
                              minWidth: '295px',
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
                            value={form.fsc}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.fsc}
                            placeholder="e.g., 10"
                            sx={{
                              minWidth: '295px',
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
                            name="others"
                            value={form.others}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.others}
                            placeholder="Click to add charges"
                            onClick={handleOpenChargesCalculator}
                            InputProps={{ readOnly: true }}
                            sx={{
                              minWidth: '295px',
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
                            value={form.total || '00.00'}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.total}
                            placeholder="00.00"
                            InputProps={{ readOnly: true }}
                            sx={{
                              minWidth: '295px',
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
                      {/* Header */}
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

                      {/* ✅ Row 1 - 4 Fields */}
                      <Grid container spacing={2.5} mb={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControl
                            fullWidth
                            error={!!errors.vehicleType}
                            sx={{
                              '& .MuiInputBase-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
                              },
                              '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                            }}
                          >
                            <InputLabel>Vehicle Type *</InputLabel>
                            <Select
                              name="vehicleType"
                              value={form.vehicleType}
                              onChange={handleFormChange}
                              label="Vehicle Type *"
                              sx={{
                                height: '56px',
                                minWidth: '295px',
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

                        <Grid item xs={12} sm={6} md={3}>
                          <TextField
                            label="Weight (lbs) *"
                            name="weight"
                            value={form.weight}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.weight}
                            placeholder="e.g., 26000"
                            sx={{
                              minWidth: '295px',
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
                            label="Commodity *"
                            name="commodity"
                            value={form.commodity}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.commodity}
                            placeholder="e.g., Electronics, Furniture"
                            sx={{
                              minWidth: '295px',
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

                      {/* ✅ Row 2 - 4 Fields */}
                      <Grid container spacing={2.5} mb={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <TextField
                            label="Line Haul ($)"
                            name="lineHaul"
                            value={form.lineHaul}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.lineHaul}
                            placeholder="e.g., 1600 or 1600.00"
                            sx={{
                              minWidth: '295px',
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
                            label="FRC (%)"
                            name="fsc"
                            value={form.fsc}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.fsc}
                            placeholder="e.g., 10 for 10%"
                            sx={{
                              minWidth: '295px',
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
                            name="others"
                            value={form.others}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.others}
                            placeholder="Click to add charges"
                            onClick={handleOpenChargesCalculator}
                            InputProps={{ readOnly: true }}
                            sx={{
                              minWidth: '295px',
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
                            value={form.total || '00.00'}
                            onChange={handleFormChange}
                            fullWidth
                            error={!!errors.total}
                            placeholder="00.00"
                            InputProps={{ readOnly: true }}
                            sx={{
                              minWidth: '295px',
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





              {/* Schedule & Timeline Section - Only for DRAYAGE */}
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
                  {/* Header */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: '#2D3748',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2.5,
                      borderLeft: '4px solid #4A90E2',
                      pl: 1.5,
                      letterSpacing: '0.3px',
                    }}
                  >
                    <CalendarToday sx={{ fontSize: 22, color: '#4A90E2' }} />
                    Schedule & Timeline
                  </Typography>

                  {/* Grid Rows */}
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        type="datetime-local"
                        label="Pickup Date *"
                        name="pickupDate"
                        value={form.pickupDate}
                        onChange={handleFormChange}
                        fullWidth
                        error={!!errors.pickupDate}
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

                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        type="datetime-local"
                        label="Delivery Date *"
                        name="deliveryDate"
                        value={form.deliveryDate}
                        onChange={handleFormChange}
                        fullWidth
                        error={!!errors.deliveryDate}
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

                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        type="datetime-local"
                        label="Return Date *"
                        name="returnDate"
                        value={form.returnDate}
                        onChange={handleFormChange}
                        fullWidth
                        error={!!errors.returnDate}
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

                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        type="datetime-local"
                        label="Bid Deadline"
                        name="bidDeadline"
                        value={form.bidDeadline}
                        onChange={handleFormChange}
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
                </Box>
              )}


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
                        type="datetime-local"
                        label="Bid Deadline"
                        name="bidDeadline"
                        value={form.bidDeadline}
                        onChange={handleFormChange}
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
                {/* Header */}
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

                {/* Fields */}
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Container No."
                      name="containerNo"
                      value={form.containerNo}
                      onChange={handleFormChange}
                      fullWidth
                      placeholder="Alphanumeric only"
                      sx={{
                        minWidth: '270px',
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
                      value={form.poNumber}
                      onChange={handleFormChange}
                      fullWidth
                      placeholder="Alphanumeric only"
                      sx={{
                        minWidth: '270px',
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
                      value={form.bolNumber}
                      onChange={handleFormChange}
                      fullWidth
                      placeholder="Alphanumeric only"
                      sx={{
                        minWidth: '270px',
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
                      label="Reference ID"
                      name="referenceId"
                      value={form.referenceId || ''}
                      onChange={handleFormChange}
                      fullWidth
                      placeholder="Optional reference"
                      sx={{
                        minWidth: '270px',
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




              {/* Smart Rate Suggestion Button */}
              {/* <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 3,
                p: 2,
                background: 'white',
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <Button
                  variant="outlined"
                  onClick={handleSmartRateSuggestion}
                  disabled={!form.fromCity || !form.toCity}
                  sx={{
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)',
                    border: '2px solid #1976d2',
                    '&:hover': {
                      borderColor: '#0d47a1',
                      color: '#0d47a1',
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
                    },
                    '&:disabled': {
                      borderColor: '#e0e0e0',
                      color: '#9e9e9e',
                      backgroundColor: '#f5f5f5'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  💡 Smart Rate Suggestion
                </Button>
              </Box> */}
            </Box>

            {/* Rate Suggestions */}
            {rateSuggestionsLoading && (
              <Box sx={{
                textAlign: 'center',
                mt: 3,
                p: 3,
                backgroundColor: '#f8f9fa',
                borderRadius: 3,
                border: '2px dashed #e0e0e0'
              }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  mb: 1
                }}>
                  <Box sx={{
                    width: 20,
                    height: 20,
                    border: '2px solid #1976d2',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }} />
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                    Analyzing Market Data...
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Fetching rate suggestions for your route
                </Typography>
              </Box>
            )}



          </Box>
          )}
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
            onClick={handleCloseModal}
            variant="outlined"
            disabled={createLoadLoading}
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
              '&:disabled': {
                borderColor: '#cccccc',
                color: '#999999',
              },
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createLoadLoading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
             background: primary,
              px: 4,
              py: 1,
              fontWeight: 600,
              fontSize: '0.95rem',
              '&:hover': { opacity: 0.9 },
              '&:disabled': {
                background: '#cccccc',
                color: '#666666',
              },
            }}
          >
            {createLoadLoading ? 'Creating...' : 'Create Load'}
          </Button>
        </DialogActions>


      </Dialog>

      {/* Bids Modal */}
      <Dialog
        open={bidsModalOpen}
        onClose={handleCloseBidsModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 2, sm: 4 },
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            margin: { xs: 2, sm: 4 },
            maxHeight: { xs: '90vh', sm: '80vh' }
          }
        }}
      >
        <DialogTitle sx={{
          background: brand,
          color: headerTextColor,
          fontWeight: 700,
          fontSize: { xs: 18, sm: 24 },
          py: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 4 },
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            📋
          </Box>
          Bids for Load
        </DialogTitle>
        <DialogContent sx={{
          px: { xs: 2, sm: 4 },
          py: { xs: 2, sm: 4 },
          background: '#f8fafc',
          minHeight: { xs: 300, sm: 400 },
          overflow: 'auto'
        }}>
          {bidsLoading ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              gap: 2
            }}>
              <Box sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)', opacity: 1 },
                  '50%': { transform: 'scale(1.1)', opacity: 0.7 },
                  '100%': { transform: 'scale(1)', opacity: 1 }
                }
              }}>
                ⏳
              </Box>
              <Typography sx={{
                fontSize: 18,
                fontWeight: 600,
                color: '#1976d2',
                mt: 2
              }}>
                Loading bids...
              </Typography>
            </Box>
          ) : bids.length === 0 ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              gap: 2
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #e3f2fd, #bbdefb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 40
              }}>
                📭
              </Box>
              <Typography sx={{
                fontSize: 20,
                fontWeight: 600,
                color: '#666',
                textAlign: 'center'
              }}>
                No bids found for this load
              </Typography>
              <Typography sx={{
                fontSize: 14,
                color: '#999',
                textAlign: 'center',
                maxWidth: 300
              }}>
                Bids will appear here once truckers start bidding on your load
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ minHeight: 300, mt: 1 }}>
              {bids.map((bid, i) => (
                <Grid item xs={12} sm={6} lg={4} key={bid._id || i}>
                  <Box sx={{
                    background: '#fff',
                    borderRadius: { xs: 3, sm: 4 },
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    p: { xs: 2, sm: 3 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: { xs: 250, sm: 280 },
                    border: '1px solid #e8f4fd',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: { xs: 'translateY(-4px)', sm: 'translateY(-8px)' },
                      boxShadow: '0 16px 48px rgba(25, 118, 210, 0.2)',
                      borderColor: '#1976d2',
                      '&::before': {
                        opacity: 1
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    }
                  }}>
                    {/* Bid Number Badge */}
                    <Box sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                      color: '#fff',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                      zIndex: 1
                    }}>
                      #{i + 1}
                    </Box>

                    {/* Driver Section */}
                    <Box sx={{ textAlign: 'center', mb: 3, mt: 2 }}>
                      <Avatar
                        src={bid.bidder?.avatar || ''}
                        alt="Driver"
                        sx={{
                          width: 70,
                          height: 70,
                          mb: 2,
                          bgcolor: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                          color: '#1976d2',
                          border: '3px solid #1976d2',
                          fontSize: 28,
                          fontWeight: 700,
                          mx: 'auto',
                          boxShadow: '0 8px 24px rgba(25, 118, 210, 0.2)'
                        }}
                      >
                        {bid.driver?.name ?
                          (bid.driver.name.split(' ').map(w => w[0]).join('').toUpperCase()) :
                          <PersonIcon sx={{ fontSize: 32, color: '#1976d2' }} />
                        }
                      </Avatar>
                      <Typography sx={{
                        fontWeight: 700,
                        fontSize: 20,
                        color: '#1976d2',
                        mb: 0.5,
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}>
                        {bid.driver?.name || bid.driverName || 'Driver Name'}
                      </Typography>
                      <Typography sx={{
                        fontSize: 12,
                        color: '#666',
                        fontWeight: 500
                      }}>
                        Professional Driver
                      </Typography>
                    </Box>

                    {/* Information Cards Grid */}
                    <Box sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: { xs: 1.5, sm: 2 },
                      mb: { xs: 2, sm: 3 },
                      width: '100%'
                    }}>
                      {/* Vehicle Info */}
                      <Box sx={{
                        background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                        borderRadius: 3,
                        p: 2,
                        border: '1px solid #dee2e6',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }
                      }}>
                        <Typography sx={{
                          fontWeight: 600,
                          fontSize: 11,
                          color: '#666',
                          mb: 1,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}>
                          🚛 Vehicle
                        </Typography>
                        <Typography sx={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: '#333'
                        }}>
                          {bid.vehicle?.number || bid.vehicleNumber || 'N/A'}
                        </Typography>
                      </Box>

                      {/* Bid Amount */}
                      <PremiumTooltip
                        TransitionComponent={Zoom}
                        title={
                          <Box sx={{ p: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                              <Avatar sx={{ 
                                width: 36, 
                                height: 36, 
                                bgcolor: 'rgba(76, 175, 80, 0.15)', 
                                color: '#66bb6a',
                                border: '1px solid rgba(102, 187, 106, 0.3)'
                              }}>
                                <Description sx={{ fontSize: 18 }} />
                              </Avatar>
                              <Box>
                                <Typography sx={{ 
                                  fontWeight: 700, 
                                  color: '#a5d6a7', 
                                  fontSize: '0.75rem',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  mb: 0.5
                                }}>
                                  Message
                                </Typography>
                                <Typography sx={{ 
                                  color: '#eceff1', 
                                  lineHeight: 1.5,
                                  fontSize: '0.85rem',
                                  maxWidth: 220,
                                  fontWeight: 400,
                                  whiteSpace: 'pre-wrap'
                                }}>
                                  "{bid.message || 'No details provided.'}"
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        }
                        arrow
                        placement="top"
                      >
                        <Box sx={{
                          position: 'relative',
                          background: bid.message 
                            ? 'linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%)' 
                            : 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                          borderRadius: 4,
                          p: '16px 12px',
                          border: bid.message ? '1px solid #a5d6a7' : '1px solid #eeeeee',
                          boxShadow: bid.message 
                            ? '0 10px 20px -5px rgba(51, 105, 30, 0.15)' 
                            : '0 2px 8px rgba(0,0,0,0.04)',
                          textAlign: 'center',
                          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-5px) scale(1.02)',
                            boxShadow: bid.message 
                              ? '0 20px 30px -10px rgba(51, 105, 30, 0.25)' 
                              : '0 8px 20px rgba(0,0,0,0.08)',
                          }
                        }}>
                          {/* Pulsing Dot Indicator */}
                          {bid.message && (
                            <Box sx={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: '#43a047',
                              boxShadow: '0 0 0 0 rgba(67, 160, 71, 0.7)',
                              animation: 'pulse 2s infinite',
                              '@keyframes pulse': {
                                '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(67, 160, 71, 0.7)' },
                                '70%': { transform: 'scale(1)', boxShadow: '0 0 0 6px rgba(67, 160, 71, 0)' },
                                '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(67, 160, 71, 0)' },
                              }
                            }} />
                          )}
                          
                          <Typography sx={{
                            fontWeight: 700,
                            fontSize: 10,
                            color: bid.message ? '#33691e' : '#90a4ae',
                            textTransform: 'uppercase',
                            letterSpacing: 1.5,
                            mb: 0.5
                          }}>
                            Bid Amount
                          </Typography>
                          
                          <Typography sx={{
                            fontWeight: 800,
                            fontSize: 20,
                            background: bid.message 
                              ? 'linear-gradient(45deg, #1b5e20, #4caf50)' 
                              : 'linear-gradient(45deg, #37474f, #78909c)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontFamily: '"Roboto Mono", monospace',
                            letterSpacing: -0.5
                          }}>
                            ${bid.intermediateRate?.toLocaleString() || '-'}
                          </Typography>
                          
                          {bid.message && (
                            <Typography sx={{
                              fontSize: 9,
                              color: '#558b2f',
                              mt: 1,
                              fontWeight: 700,
                              opacity: 0,
                              transform: 'translateY(5px)',
                              transition: 'all 0.3s ease',
                              '.MuiBox-root:hover &': {
                                opacity: 1,
                                transform: 'translateY(0)'
                              }
                            }}>
                              VIEW NOTE
                            </Typography>
                          )}
                        </Box>
                      </PremiumTooltip>

                      {/* Pickup ETA */}
                      <Box sx={{
                        background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                        borderRadius: 3,
                        p: 2,
                        border: '1px solid #ff9800',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(255, 152, 0, 0.2)'
                        }
                      }}>
                        <Typography sx={{
                          fontWeight: 600,
                          fontSize: 11,
                          color: '#e65100',
                          mb: 1,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}>
                          📅 Pickup
                        </Typography>
                        <Typography sx={{
                          fontWeight: 600,
                          fontSize: 12,
                          color: '#bf360c'
                        }}>
                          {bid.estimatedPickupDate ?
                            new Date(bid.estimatedPickupDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Not specified'}
                        </Typography>
                      </Box>

                      {/* Drop ETA */}
                      <Box sx={{
                        background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                        borderRadius: 3,
                        p: 2,
                        border: '1px solid #2196f3',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)'
                        }
                      }}>
                        <Typography sx={{
                          fontWeight: 600,
                          fontSize: 11,
                          color: '#1565c0',
                          mb: 1,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}>
                          🎯 Delivery
                        </Typography>
                        <Typography sx={{
                          fontWeight: 600,
                          fontSize: 12,
                          color: '#0d47a1'
                        }}>
                          {bid.estimatedDeliveryDate ?
                            new Date(bid.estimatedDeliveryDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Not specified'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Negotiation Details - Show if bid is in negotiation */}
                    {bid.status === 'Negotiating' && bid.negotiationDetails && (
                      <Box sx={{
                        background: '#fff3e0',
                        borderRadius: 2,
                        p: 2,
                        border: '2px solid #ff9800',
                        mt: 2
                      }}>
                        <Typography sx={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: '#ff9800',
                          mb: 1,
                          textAlign: 'center'
                        }}>
                          🤝 Negotiation in Progress
                        </Typography>

                        {bid.negotiationDetails.shipperCounterRate && (
                          <Box sx={{ mb: 1 }}>
                            <Typography sx={{
                              fontWeight: 600,
                              fontSize: 12,
                              color: '#333',
                              mb: 0.5
                            }}>
                              Your Counter Offer:
                            </Typography>
                            <Typography sx={{
                              fontWeight: 700,
                              fontSize: 16,
                              color: '#ff9800'
                            }}>
                              ${bid.negotiationDetails.shipperCounterRate.toLocaleString()}
                            </Typography>
                          </Box>
                        )}

                        {bid.negotiationDetails.shipperNegotiationMessage && (
                          <Box sx={{ mb: 1 }}>
                            <Typography sx={{
                              fontWeight: 600,
                              fontSize: 12,
                              color: '#333',
                              mb: 0.5
                            }}>
                              Your Message:
                            </Typography>
                            <Typography sx={{
                              fontWeight: 500,
                              fontSize: 13,
                              color: '#333',
                              fontStyle: 'italic',
                              whiteSpace: 'pre-wrap'
                            }}>
                              "{bid.negotiationDetails.shipperNegotiationMessage}"
                            </Typography>
                          </Box>
                        )}

                        {bid.negotiationDetails.truckerResponse && bid.negotiationDetails.truckerResponse !== 'Pending' && (
                          <Box sx={{ mb: 1 }}>
                            <Typography sx={{
                              fontWeight: 600,
                              fontSize: 12,
                              color: '#333',
                              mb: 0.5
                            }}>
                              Trucker Response:
                            </Typography>
                            <Typography sx={{
                              fontWeight: 600,
                              fontSize: 13,
                              color: bid.negotiationDetails.truckerResponse === 'Accepted' ? '#4caf50' :
                                bid.negotiationDetails.truckerResponse === 'Rejected' ? '#f44336' : '#ff9800'
                            }}>
                              {bid.negotiationDetails.truckerResponse}
                            </Typography>
                            {bid.negotiationDetails.truckerNegotiationMessage && (
                              <Typography sx={{
                                fontWeight: 500,
                                fontSize: 12,
                                color: '#333',
                                fontStyle: 'italic',
                                mt: 0.5,
                                whiteSpace: 'pre-wrap'
                              }}>
                                "{bid.negotiationDetails.truckerNegotiationMessage}"
                              </Typography>
                            )}
                          </Box>
                        )}

                        {bid.negotiationDetails.truckerCounterRate && (
                          <Box>
                            <Typography sx={{
                              fontWeight: 600,
                              fontSize: 12,
                              color: '#333',
                              mb: 0.5
                            }}>
                              Trucker Counter Offer:
                            </Typography>
                            <Typography sx={{
                              fontWeight: 700,
                              fontSize: 16,
                              color: '#ff9800'
                            }}>
                              ${bid.negotiationDetails.truckerCounterRate.toLocaleString()}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}

                {/* Status Text or Action Buttons */}
                {(() => {
                  const isAnyAccepted = bids.some(b => b.status === 'Accepted');
                  const effectiveStatus = bid.status === 'Accepted' ? 'Accepted' : (bid.status === 'Rejected' || isAnyAccepted) ? 'Rejected' : null;

                  if (effectiveStatus) {
                    return (
                      <Box sx={{
                        mt: 2,
                        p: 1.5,
                        width: '100%',
                        textAlign: 'center',
                        borderRadius: 2,
                        bgcolor: effectiveStatus === 'Accepted' ? '#e8f5e9' : '#ffebee',
                        border: '1px solid',
                        borderColor: effectiveStatus === 'Accepted' ? '#a5d6a7' : '#ef9a9a'
                      }}>
                         <Typography sx={{
                            fontWeight: 700,
                            color: effectiveStatus === 'Accepted' ? '#2e7d32' : '#c62828',
                            fontSize: 16
                         }}>
                            {effectiveStatus === 'Accepted' ? '✅ Accepted' : '❌ Rejected'}
                         </Typography>
                      </Box>
                    );
                  }

                  return (
                    <Box sx={{
                      display: 'flex',
                      gap: { xs: 1, sm: 1.5 },
                      width: '100%',
                      justifyContent: 'center',
                      mt: 'auto',
                      flexDirection: { xs: 'column', sm: 'row' }
                    }}>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          borderRadius: 3,
                          fontWeight: 700,
                          px: 3,
                          py: 1,
                          textTransform: 'none',
                          fontSize: 13,
                          background: 'linear-gradient(135deg, #4caf50, #388e3c)',
                          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #388e3c, #2e7d32)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)'
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        onClick={() => handleAcceptBid(bid)}
                      >
                        ✅ Accept
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          borderRadius: 3,
                          fontWeight: 700,
                          px: 3,
                          py: 1,
                          textTransform: 'none',
                          fontSize: 13,
                          background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                          boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #f57c00, #ef6c00)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(255, 152, 0, 0.4)'
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        onClick={() => handleViewNegotiationHistory(bid)}
                      >
                        🤝 Negotiate
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          borderRadius: 3,
                          fontWeight: 700,
                          px: 3,
                          py: 1,
                          textTransform: 'none',
                          fontSize: 13,
                          background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                          boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #d32f2f, #c62828)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(244, 67, 54, 0.4)'
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        onClick={() => handleRejectBid(bid)}
                      >
                        ❌ Reject
                      </Button>
                    </Box>
                  );
                })()}
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{
          p: { xs: 2, sm: 3 },
          background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
          borderTop: '1px solid #e2e8f0',
          justifyContent: 'center'
        }}>
          <Button
            onClick={handleCloseBidsModal}
            variant="contained"
            sx={{
              borderRadius: 3,
              fontWeight: 700,
              px: { xs: 3, sm: 4 },
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: 13, sm: 14 },
              background: 'linear-gradient(135deg, #1976d2, #1565c0)',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0, #0d47a1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            ✨ Close Modal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bid Details Modal - Redesigned full-screen view */}
      <Dialog
        open={bidDetailsModalOpen}
        onClose={handleCloseBidDetailsModal}
        fullScreen
        PaperProps={{
          sx: {
            backgroundColor: '#fff'
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            px: 3,
            py: 2,
            background: brand,
            color: headerTextColor,
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>🚛</Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }}>
                Bid Details {selectedLoadId ? `(Load #: L-${String(selectedLoadId).slice(-5)})` : ''}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                Driver, vehicle and bid information
              </Typography>
            </Box>
            {selectedBid && (
              <Chip
                label={selectedBid.status}
                sx={{
                  ml: 2,
                  fontWeight: 700,
                  color: '#fff',
                  backgroundColor:
                    selectedBid.status === 'Pending' ? 'rgba(255,255,255,0.25)' :
                    selectedBid.status === 'Negotiating' ? '#ff9800' :
                    selectedBid.status === 'Accepted' ? '#4caf50' :
                    selectedBid.status === 'Rejected' ? '#f44336' : 'rgba(255,255,255,0.25)'
                }}
                size="small"
              />
            )}
          </Box>
          <IconButton onClick={handleCloseBidDetailsModal} sx={{ color: headerTextColor }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {selectedBid ? (
            <Grid container sx={{ height: 'calc(100vh - 64px)' }}>
              {/* Left Summary Panel */}
              <Grid item xs={12} md={4} sx={{ backgroundColor: '#f8fafc', borderRight: '1px solid #e0e0e0', p: 3, overflowY: 'auto' }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Avatar
                    src={selectedBid.bidder?.avatar || ''}
                    alt="Driver"
                    sx={{
                      width: 84,
                      height: 84,
                      mb: 1.5,
                      bgcolor: '#e3f2fd',
                      color: '#1976d2',
                      border: '3px solid #1976d2',
                      fontSize: 28,
                      fontWeight: 700,
                      mx: 'auto'
                    }}
                  >
                    {selectedBid.driver?.name ?
                      (selectedBid.driver.name.split(' ').map(w => w[0]).join('').toUpperCase()) :
                      <PersonIcon sx={{ fontSize: 32, color: '#1976d2' }} />
                    }
                  </Avatar>
                  <Typography sx={{ fontWeight: 800, fontSize: 20, color: '#1976d2' }}>
                    {selectedBid.driver?.name || selectedBid.driverName || 'Driver Name'}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#666' }}>Professional Driver</Typography>
                </Box>

                <Stack spacing={2}>
                  <Paper sx={{ p: 2 }} variant="outlined">
                    <Typography sx={{ fontWeight: 600, fontSize: 12, color: '#666', mb: 0.5 }}>Vehicle</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: 15 }}>🚛 {selectedBid.vehicle?.number || selectedBid.vehicleNumber || 'N/A'}</Typography>
                  </Paper>
                  <Paper sx={{ p: 2 }} variant="outlined">
                    <Typography sx={{ fontWeight: 600, fontSize: 12, color: '#2e7d32', mb: 0.5 }}>Bid Amount</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#1b5e20' }}>${selectedBid.intermediateRate?.toLocaleString() || '-'}</Typography>
                  </Paper>
                  <Paper sx={{ p: 2 }} variant="outlined">
                    <Typography sx={{ fontWeight: 600, fontSize: 12, color: '#f57c00', mb: 0.5 }}>Pickup ETA</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                      {selectedBid.estimatedPickupDate ? new Date(selectedBid.estimatedPickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Not specified'}
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2 }} variant="outlined">
                    <Typography sx={{ fontWeight: 600, fontSize: 12, color: '#1565c0', mb: 0.5 }}>Drop ETA</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                      {selectedBid.estimatedDeliveryDate ? new Date(selectedBid.estimatedDeliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Not specified'}
                    </Typography>
                  </Paper>
                </Stack>

                {selectedBid.status === 'Negotiating' && selectedBid.negotiationDetails && (
                  <Paper sx={{ p: 2, mt: 2 }} variant="outlined">
                    <Typography sx={{ fontWeight: 800, fontSize: 14, color: '#ff9800', mb: 1 }}>🤝 Negotiation</Typography>
                    {selectedBid.negotiationDetails.shipperCounterRate && (
                      <Box sx={{ mb: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 12, color: '#333', mb: 0.5 }}>Your Counter Offer</Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#ff9800' }}>${selectedBid.negotiationDetails.shipperCounterRate.toLocaleString()}</Typography>
                      </Box>
                    )}
                    {selectedBid.negotiationDetails.shipperNegotiationMessage && (
                      <Box sx={{ mb: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 12, color: '#333', mb: 0.5 }}>Your Message</Typography>
                        <Typography sx={{ fontWeight: 500, fontSize: 13, color: '#333', fontStyle: 'italic' }}>
                          "{selectedBid.negotiationDetails.shipperNegotiationMessage}"
                        </Typography>
                      </Box>
                    )}
                    {selectedBid.negotiationDetails.truckerResponse && selectedBid.negotiationDetails.truckerResponse !== 'Pending' && (
                      <Box sx={{ mb: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 12, color: '#333', mb: 0.5 }}>Trucker Response</Typography>
                        <Typography sx={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: selectedBid.negotiationDetails.truckerResponse === 'Accepted' ? '#4caf50' : selectedBid.negotiationDetails.truckerResponse === 'Rejected' ? '#f44336' : '#ff9800'
                        }}>
                          {selectedBid.negotiationDetails.truckerResponse}
                        </Typography>
                        {selectedBid.negotiationDetails.truckerNegotiationMessage && (
                          <Typography sx={{ fontWeight: 500, fontSize: 12, color: '#333', fontStyle: 'italic', mt: 0.5 }}>
                            "{selectedBid.negotiationDetails.truckerNegotiationMessage}"
                          </Typography>
                        )}
                      </Box>
                    )}
                    {selectedBid.negotiationDetails.truckerCounterRate && (
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: 12, color: '#333', mb: 0.5 }}>Trucker Counter Offer</Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#ff9800' }}>${selectedBid.negotiationDetails.truckerCounterRate.toLocaleString()}</Typography>
                      </Box>
                    )}
                  </Paper>
                )}
              </Grid>

              {/* Right Detail Panel */}
              <Grid item xs={12} md={8} sx={{ p: 3, overflowY: 'auto' }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1976d2' }}>Overview</Typography>
                  <Divider sx={{ my: 1 }} />
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2 }} variant="outlined">
                      <Typography sx={{ fontWeight: 600, fontSize: 12, color: '#666', mb: 0.5 }}>Driver Name</Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{selectedBid.driver?.name || selectedBid.driverName || 'N/A'}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2 }} variant="outlined">
                      <Typography sx={{ fontWeight: 600, fontSize: 12, color: '#666', mb: 0.5 }}>Vehicle Number</Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{selectedBid.vehicle?.number || selectedBid.vehicleNumber || 'N/A'}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2 }} variant="outlined">
                      <Typography sx={{ fontWeight: 600, fontSize: 12, color: '#666', mb: 0.5 }}>Bid Amount</Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#1b5e20' }}>${selectedBid.intermediateRate?.toLocaleString() || '-'}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2 }} variant="outlined">
                      <Typography sx={{ fontWeight: 600, fontSize: 12, color: '#666', mb: 0.5 }}>Status</Typography>
                      <Chip
                        label={selectedBid.status}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          backgroundColor:
                            selectedBid.status === 'Pending' ? '#e0e0e0' :
                            selectedBid.status === 'Negotiating' ? '#ffecb3' :
                            selectedBid.status === 'Accepted' ? '#c8e6c9' :
                            selectedBid.status === 'Rejected' ? '#ffcdd2' : '#e0e0e0'
                        }}
                      />
                    </Paper>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1976d2' }}>Negotiation Details</Typography>
                  <Divider sx={{ my: 1 }} />
                  {selectedBid.status === 'Negotiating' && selectedBid.negotiationDetails ? (
                    <Grid container spacing={2}>
                      {selectedBid.negotiationDetails.shipperCounterRate && (
                        <Grid item xs={12} sm={6}>
                          <Paper sx={{ p: 2 }} variant="outlined">
                            <Typography sx={{ fontWeight: 600, fontSize: 12, color: '#666', mb: 0.5 }}>Your Counter Offer</Typography>
                            <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#ff9800' }}>${selectedBid.negotiationDetails.shipperCounterRate.toLocaleString()}</Typography>
                          </Paper>
                        </Grid>
                      )}
                      {selectedBid.negotiationDetails.truckerCounterRate && (
                        <Grid item xs={12} sm={6}>
                          <Paper sx={{ p: 2 }} variant="outlined">
                            <Typography sx={{ fontWeight: 600, fontSize: 12, color: '#666', mb: 0.5 }}>Trucker Counter Offer</Typography>
                            <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#ff9800' }}>${selectedBid.negotiationDetails.truckerCounterRate.toLocaleString()}</Typography>
                          </Paper>
                        </Grid>
                      )}
                      {selectedBid.negotiationDetails.shipperNegotiationMessage && (
                        <Grid item xs={12}>
                          <Paper sx={{ p: 2 }} variant="outlined">
                            <Typography sx={{ fontWeight: 600, fontSize: 12, color: '#666', mb: 0.5 }}>Your Message</Typography>
                            <Typography sx={{ fontWeight: 500, fontSize: 13, color: '#333', fontStyle: 'italic' }}>
                              "{selectedBid.negotiationDetails.shipperNegotiationMessage}"
                            </Typography>
                          </Paper>
                        </Grid>
                      )}
                      {selectedBid.negotiationDetails.truckerNegotiationMessage && (
                        <Grid item xs={12}>
                          <Paper sx={{ p: 2 }} variant="outlined">
                            <Typography sx={{ fontWeight: 600, fontSize: 12, color: '#666', mb: 0.5 }}>Trucker Message</Typography>
                            <Typography sx={{ fontWeight: 500, fontSize: 13, color: '#333', fontStyle: 'italic' }}>
                              "{selectedBid.negotiationDetails.truckerNegotiationMessage}"
                            </Typography>
                          </Paper>
                        </Grid>
                      )}
                    </Grid>
                  ) : (
                    <Typography sx={{ fontSize: 13, color: '#777' }}>No negotiation details available.</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)' }}>
              <Typography sx={{ color: '#666' }}>No bid selected</Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0', background: '#f8fafc' }}>
          <Button onClick={handleCloseBidDetailsModal} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600, px: 3, py: 1, borderColor: '#1976d2', color: '#1976d2' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

<Dialog
  open={acceptModalOpen}
  onClose={handleCloseAcceptModal}
  maxWidth="xs"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: "24px",
      overflow: "visible", 
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
      border: "1px solid #f1f5f9",
    },
  }}
>
  {/* --- PREMIUM HEADER SECTION --- */}
  <Box
    sx={{
      position: "relative",
      height: "110px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
      borderTopLeftRadius: "24px",
      borderTopRightRadius: "24px",
      borderBottom: "1px solid #e2e8f0",
    }}
  >
    {/* Floating Icon */}
    <Box
      sx={{
        position: "absolute",
        top: "-25px",
        width: "55px",
        height: "55px",
        borderRadius: "16px",
        background: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.25)",
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    </Box>

    <Typography
      variant="h6"
      sx={{ fontWeight: 800, color: "#0f172a", mt: 2, letterSpacing: "-0.02em" }}
    >
      Finalize Acceptance
    </Typography>
    <Typography
      sx={{ color: "#3b82f6", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}
    >
      Shipment Verification
    </Typography>
  </Box>

  <DialogContent sx={{ p: 4, pt: 4 }}>
    <Box component="form" onSubmit={handleAcceptSubmit}>
      <Stack spacing={3}>
        {/* Shipment Number - Full Width */}
        <TextField
          label="Shipment Number"
          placeholder="Enter number"
          fullWidth
          variant="outlined"
          name="shipmentNumber"
          value={acceptForm.shipmentNumber}
          onChange={handleAcceptFormChange}
          InputLabelProps={{ shrink: true, sx: { fontWeight: 600, color: "#475569" } }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", bgcolor: "#f8fafc" } }}
        />

        {/* PO & BOL - Side by Side */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="PO Number"
            placeholder="PO#"
            fullWidth
            variant="outlined"
            name="poNumber"
            value={acceptForm.poNumber}
            onChange={handleAcceptFormChange}
            InputLabelProps={{ shrink: true, sx: { fontWeight: 600, color: "#475569" } }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", bgcolor: "#f8fafc" } }}
          />
          <TextField
            label="BOL Number"
            placeholder="BOL#"
            fullWidth
            variant="outlined"
            name="bolNumber"
            value={acceptForm.bolNumber}
            onChange={handleAcceptFormChange}
            InputLabelProps={{ shrink: true, sx: { fontWeight: 600, color: "#475569" } }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", bgcolor: "#f8fafc" } }}
          />
        </Box>

        {/* Upload Section - Modern Look */}
        <Box>
           <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569", mb: 1 }}>
            Delivery Order
          </Typography>
          <Box
            sx={{
              p: 2,
              borderRadius: "12px",
              border: "1px dashed #cbd5e1",
              bgcolor: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography noWrap sx={{ fontSize: "0.8rem", color: "#64748b", maxWidth: "180px" }}>
              {acceptForm.acceptanceAttachment1 ? acceptForm.acceptanceAttachment1.name : "No file chosen"}
            </Typography>
            <Button
              component="label"
              size="small"
              sx={{ textTransform: "none", fontWeight: 700, color: "#2563eb" }}
            >
              Upload
              <input hidden type="file" onChange={handleAcceptFormChange} name="acceptanceAttachment1" />
            </Button>
          </Box>
        </Box>
      </Stack>

      {/* Action Buttons */}
      <Box sx={{ mt: 5, display: "flex", gap: 2 }}>
        <Button
          onClick={handleCloseAcceptModal}
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: "12px",
            color: "#64748b",
            textTransform: "none",
            fontWeight: 600,
            bgcolor: "#f8fafc",
            "&:hover": { bgcolor: "#f1f5f9" },
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disableElevation
          disabled={acceptingBid}
          sx={{
            py: 1.5,
            borderRadius: "12px",
            background: "#0f172a",
            color: "#fff",
            fontWeight: 600,
            textTransform: "none",
            "&:hover": { background: "#1e293b" },
          }}
        >
          {acceptingBid ? <CircularProgress size={24} color="inherit" /> : "Confirm Bid"}
        </Button>
      </Box>
    </Box>
  </DialogContent>
</Dialog>







      {/* Negotiation Modal */}
      <Dialog open={negotiationModalOpen} onClose={handleCloseNegotiationModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1976d2', fontSize: 22, borderBottom: '1px solid #e0e0e0' }}>
          🤝 Start Negotiation
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 3, background: '#f8fafc' }}>
          <Box component="form" onSubmit={handleNegotiationSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              <TextField
                label="Your Counter Rate ($)"
                name="shipperCounterRate"
                type="number"
                value={negotiationForm.shipperCounterRate}
                onChange={handleNegotiationFormChange}
                fullWidth
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                error={!!negotiationErrors.shipperCounterRate}
                helperText={negotiationErrors.shipperCounterRate}
                inputProps={{ min: 0, step: 0.01 }}
              />

              <TextField
                label="Negotiation Message"
                name="shipperNegotiationMessage"
                value={negotiationForm.shipperNegotiationMessage}
                onChange={handleNegotiationFormChange}
                fullWidth
                multiline
                rows={4}
                required
                placeholder="Explain your counter offer and any terms..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                error={!!negotiationErrors.shipperNegotiationMessage}
                helperText={negotiationErrors.shipperNegotiationMessage}
              />
            </Box>
            <DialogActions sx={{ mt: 3, p: 0 }}>
              <Button
                onClick={handleCloseNegotiationModal}
                variant="outlined"
                sx={{ borderRadius: 2, fontWeight: 600, color: '#1976d2', borderColor: '#1976d2' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{ borderRadius: 2, fontWeight: 700, bgcolor: primary, '&:hover': { opacity: 0.9 } }}
              >
                Start Negotiation
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Modal */}
      <Dialog open={rejectModalOpen} onClose={handleCloseRejectModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#f44336', fontSize: 22, borderBottom: '1px solid #e0e0e0' }}>
          ❌ Reject Bid
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 3, background: '#f8fafc' }}>
          {rejectBidData && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{
                fontWeight: 600,
                fontSize: 16,
                color: '#333',
                mb: 2
              }}>
                Are you sure you want to reject this bid?
              </Typography>

              <Box sx={{
                background: '#fff',
                borderRadius: 2,
                p: 2,
                border: '1px solid #e0e0e0',
                mb: 2
              }}>
                <Typography sx={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#1976d2',
                  mb: 1
                }}>
                  Driver: {rejectBidData.driver?.name || rejectBidData.driverName || 'N/A'}
                </Typography>
                <Typography sx={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#333',
                  mb: 1
                }}>
                  Vehicle: {rejectBidData.vehicle?.number || rejectBidData.vehicleNumber || 'N/A'}
                </Typography>
                <Typography sx={{
                  fontWeight: 700,
                  fontSize: 16,
                  color: '#4caf50'
                }}>
                  Bid Amount: ${rejectBidData.intermediateRate?.toLocaleString() || '-'}
                </Typography>
              </Box>

              <Typography sx={{
                fontWeight: 500,
                fontSize: 14,
                color: '#666',
                fontStyle: 'italic'
              }}>
                This action cannot be undone.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, background: '#f8fafc', justifyContent: 'center', gap: 2 }}>
          <Button
            onClick={handleCloseRejectModal}
            variant="outlined"
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              px: 3,
              py: 1,
              borderColor: '#666',
              color: '#666',
              '&:hover': {
                borderColor: '#333',
                color: '#333'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmReject}
            variant="contained"
            disabled={rejectingBid}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              px: 3,
              py: 1,
              bgcolor: primary,
              '&:hover': { opacity: 0.9 }
            }}
          >
            {rejectingBid ? <CircularProgress size={24} color="inherit" /> : 'Yes, Reject Bid'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Negotiation History Modal */}
      <Dialog
        open={negotiationHistoryModalOpen}
        onClose={handleCloseNegotiationHistoryModal}
        maxWidth="sm"
        fullWidth={false}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            background: '#f0f2f5',
            maxWidth: '450px',
            width: '450px',
            height: '600px',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 700,
          color: '#fff',
          fontSize: 18,
          borderBottom: '1px solid #e0e0e0',
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.5,
          px: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontWeight: 700 }}>Negotiation History</Typography>
            {socket && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                px: 1,
                py: 0.5
              }}>
                <Box sx={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  backgroundColor: '#4caf50',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)', opacity: 1 },
                    '50%': { transform: 'scale(1.2)', opacity: 0.7 },
                    '100%': { transform: 'scale(1)', opacity: 1 }
                  }
                }} />
                <Typography sx={{ 
                  fontSize: '0.7rem', 
                  color: '#fff',
                  fontWeight: 500
                }}>
                  Live
                </Typography>
              </Box>
            )}
          </Box>
          <IconButton onClick={handleCloseNegotiationHistoryModal} size="small" sx={{ color: '#fff' }}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent 
          ref={negotiationHistoryRef}
          sx={{
          px: 2,
          py: 2,
          background: '#f0f2f5',
          flex: 1,
          overflowY: 'auto',
          pb: '100px', // Add padding bottom so content doesn't get hidden behind fixed input
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '3px',
          },
        }}>
          {negotiationHistoryLoading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress size={30} />
              <Typography sx={{ mt: 2, color: '#666', fontSize: '0.875rem' }}>Loading...</Typography>
            </Box>
          ) : negotiationHistoryError ? (
            <Alert severity="error" sx={{ fontSize: '0.875rem' }}>
              {negotiationHistoryError}
            </Alert>
          ) : negotiationHistory?.internalNegotiation?.history ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {negotiationHistory.internalNegotiation.history.length > 0 ? (
                negotiationHistory.internalNegotiation.history.map((item, index) => {
                  const isShipper = item.by === 'shipper';
                  return (
                    <Box
                      key={item._id || index}
                      sx={{
                        display: 'flex',
                        justifyContent: isShipper ? 'flex-end' : 'flex-start',
                        mb: 1
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '75%',
                          background: isShipper ? '#dcf8c6' : '#ffffff',
                          borderRadius: isShipper ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                          padding: '10px 12px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          border: isShipper ? 'none' : '1px solid #e0e0e0'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: isShipper ? '#128c7e' : '#ff9800',
                              fontSize: '0.7rem',
                              textTransform: 'capitalize'
                            }}
                          >
                            {item.by === 'shipper' ? 'You' : (viewBidData?.driver?.name || viewBidData?.driverName || 'Driver')}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#999',
                              fontSize: '0.65rem',
                              ml: 1
                            }}
                          >
                            {item.at ? new Date(item.at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : ''}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: '#2e7d32',
                            mb: 0.5,
                            fontSize: '1rem'
                          }}
                        >
                          ${item.rate?.toLocaleString() || 'N/A'}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#333',
                            fontSize: '0.875rem',
                            lineHeight: 1.4,
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {item.message || 'No message'}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })
              ) : (
                <Typography sx={{ textAlign: 'center', py: 4, color: '#666', fontSize: '0.875rem' }}>
                  No negotiation history available
                </Typography>
              )}
            </Box>
          ) : (
            <Typography sx={{ textAlign: 'center', py: 4, color: '#666', fontSize: '0.875rem' }}>
              No negotiation history found
            </Typography>
          )}
        </DialogContent>

        {/* Fixed Input Section at Bottom - WhatsApp style */}
        {!negotiationHistoryLoading && !negotiationHistoryError && viewBidId && (
          <DialogActions sx={{
            p: 2,
            pt: 1.5,
            background: '#fff',
            borderTop: '1px solid #e0e0e0',
            position: 'sticky',
            bottom: 0,
            zIndex: 10
          }}>
            <Box component="form" onSubmit={(e) => {
              e.preventDefault();
              if (negotiationForm.shipperCounterRate && negotiationForm.shipperNegotiationMessage && viewBidId) {
                handleNegotiationSubmit(e, viewBidId);
              } else if (!viewBidId) {
                alertify.error('Bid ID not found. Please try again.');
              }
            }} sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Rate Field with Send Button */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="Rate"
                    value={negotiationForm.shipperCounterRate}
                    onChange={(e) => setNegotiationForm({ ...negotiationForm, shipperCounterRate: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        borderRadius: '8px',
                        background: '#f0f0f0',
                        border: '1px solid #e0e0e0',
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      minWidth: 'auto',
                      width: '48px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#4caf50',
                      border: '2px solid #fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      '&:hover': {
                        background: '#45a049',
                      },
                    }}
                  >
                    <Send sx={{ fontSize: 20, color: '#fff' }} />
                  </Button>
                </Box>

                {/* Message Field - Full Width */}
                <TextField
                  fullWidth
                  multiline
                  rows={1}
                  size="small"
                  placeholder="Type your message..."
                  value={negotiationForm.shipperNegotiationMessage}
                  onChange={(e) => setNegotiationForm({ ...negotiationForm, shipperNegotiationMessage: e.target.value })}
                  sx={{
                    '& .MuiInputBase-root': {
                      borderRadius: '8px',
                      background: '#fff',
                      border: '1px solid #e0e0e0',
                    },
                    '& .MuiInputBase-input': {
                      padding: '10px 14px',
                    },
                  }}
                />
              </Box>
            </Box>
          </DialogActions>
        )}
      </Dialog>

      {/* Modern Edit Load Modal */}
      <Dialog
        open={editModalOpen}
        onClose={handleCloseEditModal}
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
        <DialogTitle className="border-b-0 flex items-center justify-between gap-3 py-4 px-6 relative rounded-t-lg" sx={{ background: brand, color: headerTextColor }}>
          <Box className="flex items-center gap-3 flex-1">
            <Box className="bg-white rounded-lg w-12 h-12 flex items-center justify-center border-2 border-blue-300 shadow-sm">
              <LocalShipping className="text-xl text-blue-500" />
            </Box>
            <Box>
              <Typography variant="h5" className="font-bold mb-0.5 text-xl" sx={{ color: headerTextColor }}>
                Edit Load
              </Typography>
              <Typography variant="body2" className="text-sm opacity-95" sx={{ color: headerTextColor }}>
                Update the load details
              </Typography>
            </Box>
          </Box>

          {/* Load Type Toggle and Close Button */}
          <Stack direction="row" spacing={1.5} className="items-center">
            {/* OTR Button */}
            <Button
              onClick={() => {
                setEditLoadType('OTR');
                setEditForm({ ...editForm, loadType: 'OTR', vehicleType: '' });
              }}
              variant={editLoadType === 'OTR' ? 'contained' : 'outlined'}
              className={`rounded-lg min-w-[90px] font-semibold normal-case py-1.5 px-3 text-sm transition-all duration-200`}
              disableRipple
              sx={{
                textTransform: 'none',
                ...(editLoadType === 'OTR' ? {
                  backgroundColor: '#ffffff !important',
                  color: primary + ' !important',
                  border: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: '#f3f4f6 !important',
                    color: primary + ' !important',
                    boxShadow: 'none'
                  },
                  '&:active': { color: primary + ' !important' },
                  '&:focus': { color: primary + ' !important' }
                } : {
                  color: headerTextColor + ' !important',
                  borderColor: headerTextColor + ' !important',
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08) !important',
                    color: headerTextColor + ' !important',
                    boxShadow: 'none'
                  },
                  '&:active': { color: headerTextColor + ' !important' },
                  '&:focus': { color: headerTextColor + ' !important' }
                })
              }}
            >
              OTR
            </Button>
            {/* DRAYAGE Button */}
            <Button
              onClick={() => {
                setEditLoadType('DRAYAGE');
                setEditForm({ ...editForm, loadType: 'DRAYAGE', vehicleType: '' });
              }}
              variant={editLoadType === 'DRAYAGE' ? 'contained' : 'outlined'}
              className={`rounded-lg min-w-[110px] font-semibold normal-case py-1.5 px-3 text-sm transition-all duration-200`}
              disableRipple
              sx={{
                textTransform: 'none',
                ...(editLoadType === 'DRAYAGE' ? {
                  backgroundColor: '#ffffff !important',
                  color: primary + ' !important',
                  border: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: '#f3f4f6 !important',
                    color: primary + ' !important',
                    boxShadow: 'none'
                  },
                  '&:active': { color: primary + ' !important' },
                  '&:focus': { color: primary + ' !important' }
                } : {
                  color: headerTextColor + ' !important',
                  borderColor: headerTextColor + ' !important',
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08) !important',
                    color: headerTextColor + ' !important',
                    boxShadow: 'none'
                  },
                  '&:active': { color: headerTextColor + ' !important' },
                  '&:focus': { color: headerTextColor + ' !important' }
                })
              }}
            >
              DRAYAGE
            </Button>
            {/* Close Button */}
            <IconButton
              onClick={handleCloseEditModal}
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

        <DialogContent className="p-0 bg-gray-100 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-gray-500">
          <Box component="form" onSubmit={handleEditSubmit} className="p-3">

            {/* Form Sections */}
            <Box className="flex flex-col gap-3">

              {/* DRAYAGE Location Section - Only for DRAYAGE */}
              {editLoadType === 'DRAYAGE' && (
                <>
                  {/* Location Details Section */}
                  <Paper elevation={0} className="p-3 rounded-lg bg-white shadow-sm">
                    <Box className="flex items-center gap-2 mb-3">
                      <Box className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <LocationOn className="text-green-600 text-2xl" />
                      </Box>
                      <Typography variant="h6" className="font-semibold text-gray-800 text-lg">
                        Location Details
                      </Typography>
                    </Box>

                    {/* Pick Up Location Sub-section */}
                    <Box
                      className="mb-6 p-4 rounded-2xl shadow-sm bg-gradient-to-b from-white to-gray-50 border border-gray-200"
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
                            value={editForm.fromAddress}
                            onChange={handleEditFormChange}
                            fullWidth
                            error={!!editErrors.fromAddress}
                            placeholder="Select from dropdown or type full address"
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
                            value={editForm.fromCity}
                            onChange={handleEditFormChange}
                            fullWidth
                            error={!!editErrors.fromCity}
                            placeholder="Auto filled from ZIP (editable)"
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
                            value={editForm.fromState}
                            onChange={handleEditFormChange}
                            fullWidth
                            error={!!editErrors.fromState}
                            placeholder="Auto filled from ZIP (editable, e.g., NJ)"
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
                            value={editForm.fromZip}
                            onChange={handleEditFormChange}
                            fullWidth
                            error={!!editErrors.fromZip}
                            placeholder="Enter 5 digit ZIP code"
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
                      className="mb-6 p-4 rounded-2xl shadow-sm bg-gradient-to-b from-white to-gray-50 border border-gray-200"
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
                        Loading/Unloading Location
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Loading/Unloading Full Address *"
                            name="toAddress"
                            value={editForm.toAddress}
                            onChange={handleEditFormChange}
                            fullWidth
                            error={!!editErrors.toAddress}
                            placeholder="Select from dropdown or type full address"
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
                            value={editForm.toCity}
                            onChange={handleEditFormChange}
                            fullWidth
                            error={!!editErrors.toCity}
                            placeholder="Auto filled from ZIP (editable)"
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
                            value={editForm.toState}
                            onChange={handleEditFormChange}
                            fullWidth
                            error={!!editErrors.toState}
                            placeholder="Auto filled from ZIP (editable, e.g., AZ)"
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
                            value={editForm.toZip}
                            onChange={handleEditFormChange}
                            fullWidth
                            error={!!editErrors.toZip}
                            placeholder="Enter 5 digit ZIP code"
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
                      className="mb-6 p-4 rounded-2xl shadow-sm bg-gradient-to-b from-white to-gray-50 border border-gray-200"
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
                            label="Return Full Address *"
                            name="returnAddress"
                            value={editForm.returnAddress}
                            onChange={handleEditFormChange}
                            fullWidth
                            error={!!editErrors.returnAddress}
                            placeholder="Enter full address"
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
                            label="City *"
                            name="returnCity"
                            value={editForm.returnCity}
                            onChange={handleEditFormChange}
                            fullWidth
                            error={!!editErrors.returnCity}
                            placeholder="Enter city"
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
                            value={editForm.returnState}
                            onChange={handleEditFormChange}
                            fullWidth
                            error={!!editErrors.returnState}
                            placeholder="Enter state (e.g., CA)"
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
                            value={editForm.returnZip}
                            onChange={handleEditFormChange}
                            fullWidth
                            error={!!editErrors.returnZip}
                            placeholder="Enter 5 digit ZIP code"
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
                  </Paper>
                </>
              )}

              {/* OTR Origins and Destinations - Only for OTR */}
              {editLoadType === 'OTR' && (
                <>
                  {/* 🟦 PICKUP SECTION */}
                  <Box
                    sx={{
                      backgroundColor: '#fff',
                      borderRadius: 3,
                      p: 3,
                      mt: 3,
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

                    {editForm.origins.map((origin, index) => (
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
                          {editForm.origins.length > 1 && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Delete />}
                              onClick={() => {
                                const newOrigins = editForm.origins.filter((_, i) => i !== index);
                                setEditForm({ ...editForm, origins: newOrigins });
                              }}
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
                          {[
                            { label: 'Full Address *', name: 'addressLine1', value: origin.addressLine1, placeholder: 'Enter full address', required: true },
                            { label: 'City *', name: 'city', value: origin.city, placeholder: 'Enter city', required: true },
                            { label: 'State *', name: 'state', value: origin.state, placeholder: 'Enter state', required: true },
                            { label: 'Zip Code *', name: 'zip', value: origin.zip, placeholder: 'Enter zip code', required: true },
                            { label: 'Weight (lbs) *', name: 'weight', value: origin.weight, placeholder: 'e.g., 26000', required: true },
                            { label: 'Commodity *', name: 'commodity', value: origin.commodity, placeholder: 'Enter commodity', required: true },
                            { label: 'Pickup Date *', name: 'pickupDate', value: origin.pickupDate, type: 'date', required: true },
                            { label: 'Delivery Date', name: 'deliveryDate', value: origin.deliveryDate, type: 'date' },
                          ].map((field) => (
                            <Grid item xs={12} sm={6} key={field.name}>
                              <TextField
                                label={field.label}
                                type={field.type || 'text'}
                                value={field.value}
                                onChange={(e) => handleEditOriginChange(index, field.name, e.target.value)}
                                fullWidth
                                placeholder={field.placeholder}
                                InputLabelProps={field.type === 'date' ? { shrink: true } : {}}
                                sx={{
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
                          ))}
                        </Grid>
                      </Paper>
                    ))}

                    {/* Add Origin Button */}
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={handleAddEditOrigin}
                      sx={{
                        mt: 2,
                        borderRadius: 2,
                        textTransform: 'none',
                        borderColor: '#4A90E2',
                        color: '#4A90E2',
                        '&:hover': {
                          borderColor: '#357ABD',
                          backgroundColor: '#f0f7ff',
                        },
                      }}
                    >
                      Add Another Pickup Location
                    </Button>
                  </Box>

                  {/* 🟩 DESTINATION SECTION */}
                  <Box
                    sx={{
                      backgroundColor: '#fff',
                      borderRadius: 3,
                      p: 3,
                      mt: 3,
                      boxShadow: '0px 2px 6px rgba(0,0,0,0.08)',
                      border: '1px solid #E0E0E0',
                    }}
                  >
                    {/* Header */}
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
                      <LocationOn sx={{ fontSize: 22, color: '#2E7D32' }} />
                      Delivery Locations
                    </Typography>

                    {editForm.destinations.map((destination, index) => (
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
                            Delivery Location {index + 1}
                          </Typography>
                          {editForm.destinations.length > 1 && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Delete />}
                              onClick={() => {
                                const newDestinations = editForm.destinations.filter((_, i) => i !== index);
                                setEditForm({ ...editForm, destinations: newDestinations });
                              }}
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
                          {[
                            { label: 'Full Address *', name: 'addressLine1', value: destination.addressLine1, placeholder: 'Enter full address', required: true },
                            { label: 'City *', name: 'city', value: destination.city, placeholder: 'Enter city', required: true },
                            { label: 'State *', name: 'state', value: destination.state, placeholder: 'Enter state', required: true },
                            { label: 'Zip Code *', name: 'zip', value: destination.zip, placeholder: 'Enter zip code', required: true },
                            { label: 'Weight (lbs) *', name: 'weight', value: destination.weight, placeholder: 'e.g., 26000', required: true },
                            { label: 'Commodity *', name: 'commodity', value: destination.commodity, placeholder: 'Enter commodity', required: true },
                            { label: 'Delivery Date *', name: 'deliveryDate', value: destination.deliveryDate, type: 'date', required: true },
                          ].map((field) => (
                            <Grid item xs={12} sm={6} key={field.name}>
                              <TextField
                                label={field.label}
                                type={field.type || 'text'}
                                value={field.value}
                                onChange={(e) => handleEditDestinationChange(index, field.name, e.target.value)}
                                fullWidth
                                placeholder={field.placeholder}
                                InputLabelProps={field.type === 'date' ? { shrink: true } : {}}
                                sx={{
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
                          ))}
                        </Grid>
                      </Paper>
                    ))}

                    {/* Add Destination Button */}
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={handleAddEditDestination}
                      sx={{
                        mt: 2,
                        borderRadius: 2,
                        textTransform: 'none',
                        borderColor: '#2E7D32',
                        color: '#2E7D32',
                        '&:hover': {
                          borderColor: '#1B5E20',
                          backgroundColor: '#e8f5e9',
                        },
                      }}
                    >
                      Add Another Delivery Location
                    </Button>
                  </Box>
                </>
              )}

              {/* Load Details Section - Common for both */}
              <Paper elevation={2} sx={{
                p: 3,
                borderRadius: 3,
                background: 'white',
                border: '1px solid #e0e0e0',
                mt: 3
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}>
                    <Inventory2 sx={{ color: '#fff', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#2D3748' }}>
                    Load Details
                  </Typography>
                </Box>

                <Grid container spacing={2.5}>
                  {/* Pickup Date */}
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      type="date"
                      label="Pickup Date *"
                      name="pickupDate"
                      value={editForm.pickupDate}
                      onChange={handleEditFormChange}
                      fullWidth
                      error={!!editErrors.pickupDate}
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

                  {/* Delivery Date */}
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      type="date"
                      label="Delivery Date *"
                      name="deliveryDate"
                      value={editForm.deliveryDate}
                      onChange={handleEditFormChange}
                      fullWidth
                      error={!!editErrors.deliveryDate}
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

                  {/* Return Date - Only for DRAYAGE */}
                  {editLoadType === 'DRAYAGE' && (
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        type="date"
                        label="Return Date *"
                        name="returnDate"
                        value={editForm.returnDate}
                        onChange={handleEditFormChange}
                        fullWidth
                        error={!!editErrors.returnDate}
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
                  )}

                  {/* Vehicle Type */}
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl
                      fullWidth
                      error={!!editErrors.vehicleType}
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
                    >
                      <InputLabel>Vehicle Type *</InputLabel>
                      <Select
                        name="vehicleType"
                        value={editForm.vehicleType}
                        onChange={handleEditFormChange}
                        label="Vehicle Type *"
                        sx={{
                          borderRadius: 2,
                        }}
                      >
                        {(editLoadType === 'DRAYAGE' ? DRAYAGE_VEHICLE_TYPES : OTR_VEHICLE_TYPES).map((vehicleType) => (
                          <MenuItem
                            key={vehicleType}
                            value={vehicleType}
                            sx={{
                              whiteSpace: 'normal',
                              wordWrap: 'break-word'
                            }}
                          >
                            {vehicleType}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Weight */}
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Weight (lbs) *"
                      name="weight"
                      value={editForm.weight}
                      onChange={handleEditFormChange}
                      fullWidth
                      error={!!editErrors.weight}
                      placeholder="e.g., 26000"
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

                  {/* Commodity */}
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Commodity *"
                      name="commodity"
                      value={editForm.commodity}
                      onChange={handleEditFormChange}
                      fullWidth
                      error={!!editErrors.commodity}
                      placeholder="Enter commodity"
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

                  {/* Container No - Only for DRAYAGE */}
                  {editLoadType === 'DRAYAGE' && (
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        label="Container No"
                        name="containerNo"
                        value={editForm.containerNo}
                        onChange={handleEditFormChange}
                        fullWidth
                        placeholder="Optional"
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
                  )}

                  {/* PO Number */}
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="PO Number"
                      name="poNumber"
                      value={editForm.poNumber}
                      onChange={handleEditFormChange}
                      fullWidth
                      placeholder="Optional"
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

                  {/* BOL Number */}
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="BOL Number"
                      name="bolNumber"
                      value={editForm.bolNumber}
                      onChange={handleEditFormChange}
                      fullWidth
                      placeholder="Optional"
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

                  {/* BOL Deadline */}
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      type="date"
                      label="BOL Deadline *"
                      name="bidDeadline"
                      value={editForm.bidDeadline}
                      onChange={handleEditFormChange}
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

              {/* Rate Details Section - Common for both */}
              <Paper elevation={2} sx={{
                p: 3,
                borderRadius: 3,
                background: 'white',
                border: '1px solid #e0e0e0',
                mt: 3
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}>
                    <AttachMoney sx={{ color: '#fff', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#2D3748' }}>
                    Rate Details
                  </Typography>
                </Box>

                <Grid container spacing={2.5}>
                  {/* Line Haul */}
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Line Haul ($) *"
                      name="lineHaul"
                      type="number"
                      value={editForm.lineHaul}
                      onChange={handleEditFormChange}
                      fullWidth
                      error={!!editErrors.lineHaul}
                      placeholder="Enter line haul"
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>
                      }}
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

                  {/* FSC */}
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="FSC (%) *"
                      name="fsc"
                      type="number"
                      value={editForm.fsc}
                      onChange={handleEditFormChange}
                      fullWidth
                      error={!!editErrors.fsc}
                      placeholder="Enter FSC percentage"
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end"><Percent sx={{ fontSize: 18, color: '#666' }} /></InputAdornment>
                      }}
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

                  {/* Other Charges */}
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Other Charges ($) *"
                      name="others"
                      value={editForm.others}
                      onChange={handleEditFormChange}
                      fullWidth
                      error={!!editErrors.others}
                      placeholder="Click to add charges"
                      onClick={handleOpenEditChargesCalculator}
                      InputProps={{ readOnly: true }}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        minWidth: '295px',
                        cursor: 'pointer',
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

                  {/* Total Rate */}
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Total Rate ($) *"
                      name="total"
                      value={editForm.total}
                      onChange={handleEditFormChange}
                      fullWidth
                      error={!!editErrors.total}
                      placeholder="Auto calculated"
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        readOnly: true,
                        startAdornment: <InputAdornment position="start">$</InputAdornment>
                      }}
                      sx={{
                        minWidth: '270px',
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                          backgroundColor: '#E6F7E6',
                          '& .MuiOutlinedInput-input': {
                            fontWeight: 600,
                            color: '#2d5016'
                          }
                        },
                        '& .MuiInputLabel-root': { color: '#555', fontSize: '0.875rem' },
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>

            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{
          p: 4,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          borderTop: '2px solid #e8f4fd',
          gap: 2,
          justifyContent: 'flex-end'
        }}>
          <Button
            onClick={handleCloseEditModal}
            variant="outlined"
            disabled={editLoading}
            sx={{
              borderRadius: 3,
              fontWeight: 700,
              color: '#667eea',
              borderColor: '#667eea',
              borderWidth: 2,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              textTransform: 'none',
              background: '#ffffff',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#764ba2',
                color: '#764ba2',
                backgroundColor: '#f8f9fa',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={editLoading}
            sx={{
              borderRadius: 3,
              fontWeight: 800,
              background: primary,
              color: headerTextColor,
              px: 5,
              py: 1.5,
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                opacity: 0.9,
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)'
              },
              '&:active': {
                transform: 'translateY(0px)'
              },
              '&.Mui-disabled': {
                background: primary,
                color: headerTextColor,
                opacity: 0.6,
                boxShadow: 'none'
              }
            }}
          >
            {editLoading ? 'Updating...' : 'Update Load'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Charges Calculator Modal */}
      <Dialog
        open={editChargesCalculatorModalOpen}
        onClose={handleCloseEditChargesCalculator}
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
            onClick={handleCloseEditChargesCalculator}
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
          {editCharges.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                color: '#94a3b8'
              }}
            >
              <Typography>No charges added yet. Click "+ Add New Charge" to get started.</Typography>
            </Box>
          ) : (
            editCharges.map((charge) => (
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
                  onChange={(e) => handleEditChargeChange(charge.id, 'name', e.target.value)}
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
                  onChange={(e) => handleEditChargeChange(charge.id, 'quantity', e.target.value)}
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
                  onChange={(e) => handleEditChargeChange(charge.id, 'amount', e.target.value)}
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
                  onClick={() => handleDeleteEditCharge(charge.id)}
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
            onClick={handleAddEditCharge}
            variant="contained"
            startIcon={<Add />}
            sx={{
                background: primary,
                color: headerTextColor,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.9375rem',
                '&:hover': { opacity: 0.9 }
              }}
          >
            + Add New Charge
          </Button>
          </Box>
        </DialogContent>

        {/* Footer with Total */}
        <Box
          sx={{
            p: 3,
            backgroundColor: '#f8f9fa',
            borderTop: '2px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoney sx={{ fontSize: 20 }} />
            <Typography>
              $ Total Charges ${editCharges.reduce((sum, charge) => {
                return sum + (parseFloat(charge.total) || 0);
              }, 0).toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={handleCloseEditChargesCalculator}
              variant="outlined"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                color: '#4A90E2',
                borderColor: '#4A90E2',
                px: 3,
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
              onClick={handleApplyEditCharges}
              variant="contained"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                backgroundColor: primary,
                px: 4,
                py: 1,
                fontWeight: 600,
                fontSize: '0.95rem',
                '&:hover': { opacity: 0.9 },
              }}
            >
              Apply to Carrier Fees
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* CMT Agent Details Modal */}
      <Dialog open={cmtModalOpen} onClose={handleCloseCmtModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: headerTextColor, fontSize: 22, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: brand }}>
          CMT Agent Details
          <IconButton onClick={handleCloseCmtModal} sx={{ color: headerTextColor }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 3, background: '#fff' }}>
          {cmtLoading ? (
            <Typography align="center" sx={{ my: 4 }}>Loading CMT assignment details...</Typography>
          ) : cmtData ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Load Information Table */}
              <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ background: '#1976d2', p: 2 }}>
                  <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: 18 }}>
                    📋 Load Information
                  </Typography>
                </Box>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '25%', background: '#f8f9fa' }}>Load ID</TableCell>
                      <TableCell sx={{ fontWeight: 500, width: '25%' }}>
                        {cmtData.loadId ? `L-${cmtData.loadId.slice(-4)}` : '-'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, width: '25%', background: '#f8f9fa' }}>Status</TableCell>
                      <TableCell sx={{ width: '25%' }}>
                        <Chip label={cmtData.loadDetails?.status || 'N/A'} color={getStatusColor(cmtData.loadDetails?.status || '')} size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, background: '#f8f9fa' }}>Created Date</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {cmtData.loadDetails?.createdAt ? new Date(cmtData.loadDetails.createdAt).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, background: '#f8f9fa' }}>Shipment No</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {cmtData.loadDetails?.shipmentNumber || 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, background: '#f8f9fa' }}>Origin</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {cmtData.loadDetails?.origins && cmtData.loadDetails.origins.length > 0 ? (
                          <>
                            {cmtData.loadDetails.origins[0].addressLine1 && (
                              <>{cmtData.loadDetails.origins[0].addressLine1}<br /></>
                            )}
                            {cmtData.loadDetails.origins[0].addressLine2 && (
                              <>{cmtData.loadDetails.origins[0].addressLine2}<br /></>
                            )}
                            {cmtData.loadDetails.origins[0].city && cmtData.loadDetails.origins[0].state ? 
                              `${cmtData.loadDetails.origins[0].city}, ${cmtData.loadDetails.origins[0].state}` : 
                              cmtData.loadDetails.origins[0].city || cmtData.loadDetails.origins[0].state || 'N/A'
                            }
                            {cmtData.loadDetails.origins[0].zip && ` ${cmtData.loadDetails.origins[0].zip}`}
                          </>
                        ) : cmtData.loadDetails?.fromAddress || cmtData.loadDetails?.fromCity ? (
                          <>
                            {cmtData.loadDetails.fromAddress && (
                              <>{cmtData.loadDetails.fromAddress}<br /></>
                            )}
                            {cmtData.loadDetails.fromCity && cmtData.loadDetails.fromState ? 
                              `${cmtData.loadDetails.fromCity}, ${cmtData.loadDetails.fromState}` : 
                              cmtData.loadDetails.fromCity || cmtData.loadDetails.fromState || ''
                            }
                            {cmtData.loadDetails.fromZip && ` ${cmtData.loadDetails.fromZip}`}
                          </>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, background: '#f8f9fa' }}>Destination</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {cmtData.loadDetails?.destinations && cmtData.loadDetails.destinations.length > 0 ? (
                          <>
                            {cmtData.loadDetails.destinations[0].addressLine1 && (
                              <>{cmtData.loadDetails.destinations[0].addressLine1}<br /></>
                            )}
                            {cmtData.loadDetails.destinations[0].addressLine2 && (
                              <>{cmtData.loadDetails.destinations[0].addressLine2}<br /></>
                            )}
                            {cmtData.loadDetails.destinations[0].city && cmtData.loadDetails.destinations[0].state ? 
                              `${cmtData.loadDetails.destinations[0].city}, ${cmtData.loadDetails.destinations[0].state}` : 
                              cmtData.loadDetails.destinations[0].city || cmtData.loadDetails.destinations[0].state || 'N/A'
                            }
                            {cmtData.loadDetails.destinations[0].zip && ` ${cmtData.loadDetails.destinations[0].zip}`}
                          </>
                        ) : cmtData.loadDetails?.toAddress || cmtData.loadDetails?.toCity ? (
                          <>
                            {cmtData.loadDetails.toAddress && (
                              <>{cmtData.loadDetails.toAddress}<br /></>
                            )}
                            {cmtData.loadDetails.toCity && cmtData.loadDetails.toState ? 
                              `${cmtData.loadDetails.toCity}, ${cmtData.loadDetails.toState}` : 
                              cmtData.loadDetails.toCity || cmtData.loadDetails.toState || ''
                            }
                            {cmtData.loadDetails.toZip && ` ${cmtData.loadDetails.toZip}`}
                          </>
                        ) : 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, background: '#f8f9fa' }}>Weight</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{cmtData.loadDetails?.weight} lbs</TableCell>
                      <TableCell sx={{ fontWeight: 600, background: '#f8f9fa' }}>Commodity</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{cmtData.loadDetails?.commodity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, background: '#f8f9fa' }}>Vehicle Type</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{cmtData.loadDetails?.vehicleType}</TableCell>
                      <TableCell sx={{ fontWeight: 600, background: '#f8f9fa' }}>Rate</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: '#2e7d32', fontSize: 16 }}>${cmtData.loadDetails?.rate}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, background: '#f8f9fa' }}>Rate Type</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{cmtData.loadDetails?.rateType}</TableCell>
                      <TableCell sx={{ fontWeight: 600, background: '#f8f9fa' }}>Load Type</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{cmtData.loadDetails?.loadType}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, background: '#f8f9fa' }}>Pickup Date</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {cmtData.loadDetails?.pickupDate ? new Date(cmtData.loadDetails.pickupDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, background: '#f8f9fa' }}>Delivery Date</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {cmtData.loadDetails?.deliveryDate ? new Date(cmtData.loadDetails.deliveryDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>

               {/* Bid Message - Show only for Assigned, In Transit, Delivered */}
              {cmtData.bidMessage && ['assigned', 'in transit', 'delivered'].includes(cmtData.loadDetails?.status?.toLowerCase()) && (
                <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ background: '#1976d2', p: 2 }}>
                    <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: 18 }}>
                      💬 Bid Message
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, background: '#e3f2fd' }}>
                    <Typography sx={{ fontWeight: 500, fontStyle: 'italic', fontSize: 16, whiteSpace: 'pre-line' }}>
                      {cmtData.bidMessage}
                    </Typography>
                  </Box>
                </Paper>
              )}

              {/* CMT Assignment Information Table */}
              {cmtData.cmtAssignment && (
                <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ background: '#2e7d32', p: 2 }}>
                    <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: 18 }}>
                      👤 CMT Assignment Details
                    </Typography>
                  </Box>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: '25%', background: '#e8f5e8' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 500, fontSize: 16, color: '#2e7d32', width: '25%' }}>
                          {cmtData.cmtAssignment.assignedCMTUser?.displayName || cmtData.cmtAssignment.assignedCMTUser?.aliasName || 'N/A'}
                        </TableCell>


                      </TableRow>

                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, background: '#e8f5e8' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{cmtData.cmtAssignment.assignedCMTUser?.email || 'N/A'}</TableCell>

                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, background: '#e8f5e8' }}>Mobile No</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{cmtData.cmtAssignment.assignedCMTUser?.mobileNo || 'N/A'}</TableCell>

                      </TableRow>


                    </TableBody>
                  </Table>
                </Paper>
              )}


            
             


             

              {/* Message */}
              {cmtData.message && (
                <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ background: '#1976d2', p: 2 }}>
                    <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: 18 }}>
                      💬 Message
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, background: '#e3f2fd' }}>
                    <Typography sx={{ fontWeight: 500, fontStyle: 'italic', fontSize: 16 }}>
                      {cmtData.message}
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Box>
          ) : (
            <Typography align="center" sx={{ my: 4 }}>No CMT assignment details found.</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, background: '#fff' }}>
          <Button onClick={handleCloseCmtModal} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600, color: '#1976d2', borderColor: '#1976d2' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>


      {/* Rate Suggestion Details Modal */}
      <Dialog
        open={suggestionDetailsModalOpen}
        onClose={handleCloseSuggestionDetails}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)'
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 700,
          color: '#1976d2',
          fontSize: 24,
          borderBottom: '2px solid #e0e0e0',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          💡 Rate Suggestion Details
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 3 }}>
          {selectedSuggestion && rateSuggestions && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Selected Suggestion Card */}
              <Paper elevation={3} sx={{
                p: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                border: '2px solid #e0e0e0'
              }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h4" sx={{
                    fontWeight: 800,
                    color: '#1976d2',
                    mb: 1
                  }}>
                    {selectedSuggestion.type}
                  </Typography>
                  <Typography variant="h2" sx={{
                    fontWeight: 900,
                    color: '#2e7d32',
                    mb: 2,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    ${selectedSuggestion.rate.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: '#666',
                    mb: 2,
                    fontSize: '1.1rem'
                  }}>
                    {selectedSuggestion.description}
                  </Typography>
                  <Chip
                    label={`${selectedSuggestion.confidence} Confidence`}
                    color={selectedSuggestion.confidence === 'High' ? 'success' :
                      selectedSuggestion.confidence === 'Medium' ? 'warning' : 'default'}
                    sx={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      px: 2,
                      py: 1
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => {
                      applySuggestedRate(selectedSuggestion.rate);
                      handleCloseSuggestionDetails();
                    }}
                    sx={{
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      background: 'linear-gradient(45deg, #4caf50, #8bc34a)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #388e3c, #689f38)'
                      }
                    }}
                  >
                    Apply This Rate
                  </Button>
                </Box>
              </Paper>

              {/* Route Information */}
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{
                  fontWeight: 700,
                  color: '#1976d2',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  🗺️ Route Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: '#1976d2', fontWeight: 600 }}>
                        Pickup Location
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {rateSuggestions.route.pickup}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, backgroundColor: '#e8f5e8', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                        Delivery Location
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {rateSuggestions.route.delivery}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Detailed Statistics */}
              {rateSuggestions.statistics && (
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" sx={{
                    fontWeight: 700,
                    color: '#1976d2',
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    📊 Detailed Market Statistics
                  </Typography>

                  <Grid container spacing={3}>
                    {/* Overall Statistics */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 2 }}>
                          Overall Statistics
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ color: '#666' }}>Total Loads</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                              {rateSuggestions.statistics.overall.totalLoads}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ color: '#666' }}>Average Rate</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                              ${rateSuggestions.statistics.overall.averageRate.toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ color: '#666' }}>Min Rate</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f57c00' }}>
                              ${rateSuggestions.statistics.overall.minRate.toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ color: '#666' }}>Max Rate</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                              ${rateSuggestions.statistics.overall.maxRate.toLocaleString()}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>

                    {/* Recent Statistics */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 3, backgroundColor: '#fff3e0', borderRadius: 2, border: '1px solid #ffcc02' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f57c00', mb: 2 }}>
                          Recent (Last 30 Days)
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ color: '#666' }}>Recent Loads</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f57c00' }}>
                              {rateSuggestions.statistics.recent.totalLoads}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ color: '#666' }}>Recent Average</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f57c00' }}>
                              ${rateSuggestions.statistics.recent.averageRate.toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ color: '#666' }}>Recent Min</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f57c00' }}>
                              ${rateSuggestions.statistics.recent.minRate.toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ color: '#666' }}>Recent Max</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f57c00' }}>
                              ${rateSuggestions.statistics.recent.maxRate.toLocaleString()}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              )}


              {/* Market Insights */}
              {rateSuggestions.marketInsights && rateSuggestions.marketInsights.length > 0 && (
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" sx={{
                    fontWeight: 700,
                    color: '#1976d2',
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    📊 Market Insights & Analysis
                  </Typography>
                  <Grid container spacing={2}>
                    {rateSuggestions.marketInsights.map((insight, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box sx={{
                          p: 2,
                          backgroundColor: '#e3f2fd',
                          borderRadius: 2,
                          border: '1px solid #90caf9',
                          textAlign: 'center'
                        }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {insight}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, background: '#f8f9fa' }}>
          <Button
            onClick={handleCloseSuggestionDetails}
            variant="contained"
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              px: 3,
              py: 1,
              textTransform: 'none'
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Smart Rate Suggestion Modal */}
      <Dialog
        open={smartRateModalOpen}
        onClose={handleCloseSmartRateModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            background: '#fff'
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 600,
          color: '#1976d2',
          fontSize: 18,
          borderBottom: '2px solid #e0e0e0',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 2
        }}>
          💡 Smart Rate Suggestions
        </DialogTitle>
        <DialogContent sx={{
          px: 3,
          py: 2,
          background: '#fff'
        }}>
          {rateSuggestionsLoading ? (
            <Box sx={{
              textAlign: 'center',
              py: 4,
              background: '#f8f9fa',
              borderRadius: 2,
              border: '1px solid #e0e0e0'
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                mb: 2
              }}>
                <Box sx={{
                  width: 24,
                  height: 24,
                  border: '2px solid #e0e0e0',
                  borderTop: '2px solid #1976d2',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', fontSize: '1.1rem' }}>
                  Analyzing Market Data...
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Fetching intelligent rate suggestions for your route
              </Typography>
            </Box>
          ) : rateSuggestions ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Route Header */}
              <Paper elevation={1} sx={{
                p: 2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                border: '1px solid #e0e0e0'
              }}>
                <Typography variant="h6" sx={{
                  fontWeight: 600,
                  color: '#1976d2',
                  mb: 0.5,
                  textAlign: 'center',
                  fontSize: '1.1rem'
                }}>
                  🚛 {rateSuggestions.route.pickup} → {rateSuggestions.route.delivery}
                </Typography>
                <Typography variant="body2" sx={{
                  color: '#666',
                  textAlign: 'center',
                  fontSize: '0.9rem'
                }}>
                  🚚 {rateSuggestions.route.vehicleType}
                </Typography>
              </Paper>

              {/* Rate Suggestions Grid */}
              <Grid container spacing={2}>
                {rateSuggestions.suggestions.map((suggestion, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Paper elevation={0} sx={{
                      p: 2,
                      borderRadius: 2,
                      background: suggestion.confidence === 'High' ?
                        'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)' :
                        suggestion.confidence === 'Medium' ?
                          'linear-gradient(135deg, #fff3e0 0%, #fff8e1 100%)' :
                          'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                      border: 'none',
                      textAlign: 'center',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                      }
                    }}>
                      {/* Confidence Badge */}
                      <Box sx={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        background: 'rgba(255,255,255,0.9)',
                        color: suggestion.confidence === 'High' ? '#4caf50' :
                          suggestion.confidence === 'Medium' ? '#ff9800' : '#9e9e9e',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 600
                      }}>
                        {suggestion.confidence === 'High' ? '✓' :
                          suggestion.confidence === 'Medium' ? '~' : '?'}
                      </Box>

                      {/* Suggestion Type */}
                      <Typography variant="subtitle1" sx={{
                        fontWeight: 600,
                        color: '#1976d2',
                        mb: 1,
                        fontSize: '1rem'
                      }}>
                        {suggestion.type}
                      </Typography>

                      {/* Rate */}
                      <Typography variant="h4" sx={{
                        fontWeight: 700,
                        color: '#2e7d32',
                        mb: 1,
                        fontSize: '1.8rem'
                      }}>
                        ${suggestion.rate.toLocaleString()}
                      </Typography>

                      {/* Description */}
                      <Typography variant="body2" sx={{
                        color: '#666',
                        mb: 2,
                        lineHeight: 1.3,
                        minHeight: '2.5em',
                        fontSize: '0.85rem'
                      }}>
                        {suggestion.description}
                      </Typography>

                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => {
                            applySuggestedRate(suggestion.rate);
                            handleCloseSmartRateModal();
                          }}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 2,
                            py: 0.5,
                            fontSize: '0.8rem',
                            background: '#4caf50',
                            color: '#fff',
                            '&:hover': {
                              background: '#388e3c',
                              transform: 'scale(1.05)'
                            }
                          }}
                        >
                          Apply
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleSuggestionDetails(suggestion)}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 2,
                            py: 0.5,
                            fontSize: '0.8rem',
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            '&:hover': {
                              borderColor: '#0d47a1',
                              backgroundColor: 'rgba(25, 118, 210, 0.04)'
                            }
                          }}
                        >
                          Details
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Market Statistics */}
              {rateSuggestions.statistics && (
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" sx={{
                    fontWeight: 700,
                    color: '#1976d2',
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    📊 Market Statistics
                  </Typography>

                  <Grid container spacing={3}>
                    {/* Overall Statistics */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 2 }}>
                          Overall Statistics
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ color: '#666' }}>Total Loads</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                              {rateSuggestions.statistics.overall.totalLoads}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ color: '#666' }}>Average Rate</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                              ${rateSuggestions.statistics.overall.averageRate.toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ color: '#666' }}>Min Rate</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f57c00' }}>
                              ${rateSuggestions.statistics.overall.minRate.toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ color: '#666' }}>Max Rate</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                              ${rateSuggestions.statistics.overall.maxRate.toLocaleString()}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>

                    {/* Recent Statistics */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 3, backgroundColor: '#fff3e0', borderRadius: 2, border: '1px solid #ffcc02' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f57c00', mb: 2 }}>
                          Recent (Last 30 Days)
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ color: '#666' }}>Recent Loads</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f57c00' }}>
                              {rateSuggestions.statistics.recent.totalLoads}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ color: '#666' }}>Recent Average</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f57c00' }}>
                              ${rateSuggestions.statistics.recent.averageRate.toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ color: '#666' }}>Recent Min</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f57c00' }}>
                              ${rateSuggestions.statistics.recent.minRate.toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ color: '#666' }}>Recent Max</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f57c00' }}>
                              ${rateSuggestions.statistics.recent.maxRate.toLocaleString()}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              )}



              {/* Market Insights */}
              {rateSuggestions.marketInsights && rateSuggestions.marketInsights.length > 0 && (
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" sx={{
                    fontWeight: 700,
                    color: '#1976d2',
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    📊 Market Insights & Analysis
                  </Typography>
                  <Grid container spacing={2}>
                    {rateSuggestions.marketInsights.map((insight, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box sx={{
                          p: 2,
                          backgroundColor: '#e3f2fd',
                          borderRadius: 2,
                          border: '1px solid #90caf9',
                          textAlign: 'center'
                        }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {insight}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
                No rate suggestions available
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                Please ensure both pickup and delivery locations are filled correctly
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{
          p: 2,
          background: '#f8f9fa',
          borderTop: '1px solid #e0e0e0'
        }}>
          <Button
            onClick={handleCloseSmartRateModal}
            variant="contained"
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              px: 3,
              py: 1,
              textTransform: 'none',
              background: '#1976d2',
              color: '#fff',
              '&:hover': {
                background: '#0d47a1',
                transform: 'scale(1.05)'
              }
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
            {/* <AttachMoney sx={{ fontSize: 20 }} /> */}
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
      
      {/* Message Tester for Development */}
      {/* <MessageTester /> */}
    </Box>
  );
};

export default LoadBoard;