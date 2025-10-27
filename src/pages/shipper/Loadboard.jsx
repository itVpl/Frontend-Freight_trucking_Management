import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../../apiConfig';
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
  Divider
} from '@mui/material';
import { 
  Add, 
  Refresh, 
  Clear, 
  LocationOn, 
  LocalShipping, 
  Assignment, 
  CalendarToday,
  AttachMoney,
  Scale,
  Business,
  Description,
  Delete
} from '@mui/icons-material';
import { Download, Search } from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';
import SearchNavigationFeedback from '../../components/SearchNavigationFeedback';

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

// Vehicle types based on load type
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

const LoadBoard = () => {
  const location = useLocation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadType, setLoadType] = useState('OTR');
  const [searchTerm, setSearchTerm] = useState('');
  const [originalLoadData, setOriginalLoadData] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  // Vehicle type options
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
    "Flatbed",
    "Step Deck (Drop Deck)",
    "Double Drop / Lowboy",
    "Conestoga",
    "Tanker",
    "Livestock Trailer",
    "Car Hauler",
    "Container Chassis",
    "End Dump",
    "Side Dump",
    "Hopper Bottom"
  ];

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
  const [loadData, setLoadData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [bidsModalOpen, setBidsModalOpen] = useState(false);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [bids, setBids] = useState([]);
  const [selectedLoadId, setSelectedLoadId] = useState(null);

  const [bidDetailsModalOpen, setBidDetailsModalOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);

  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [acceptForm, setAcceptForm] = useState({ status: 'Accepted', shipmentNumber: '', origin: { addressLine1: '', addressLine2: '' }, destination: { addressLine1: '', addressLine2: '' }, poNumber: '', bolNumber: '', message: '' });
  const [acceptBidId, setAcceptBidId] = useState(null);
  const [acceptErrors, setAcceptErrors] = useState({});

  // Negotiation modal state
  const [negotiationModalOpen, setNegotiationModalOpen] = useState(false);
  const [negotiationForm, setNegotiationForm] = useState({
    shipperCounterRate: '',
    shipperNegotiationMessage: ''
  });
  const [negotiationErrors, setNegotiationErrors] = useState({});
  const [negotiationBidId, setNegotiationBidId] = useState(null);

  // Reject confirmation modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectBidId, setRejectBidId] = useState(null);
  const [rejectBidData, setRejectBidData] = useState(null);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [editForm, setEditForm] = useState({
    fromCity: '',
    fromState: '',
    toCity: '',
    toState: '',
    pickupDate: '',
    deliveryDate: '',
    weight: '',
    commodity: '',
    vehicleType: '',
    rate: '',
    rateType: 'Flat Rate',
    loadType: 'OTR',
    containerNo: '',
    poNumber: '',
    bolNumber: '',
    notes: '',
    returnDate: '',
    returnLocation: ''
  });
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);

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

  // Filter loads based on active tab
  const getFilteredLoads = () => {
    if (!loadData || loadData.length === 0) return [];
    
    switch (activeTab) {
      case 0: // Pending Approval
        return loadData.filter(load => 
          ['Pending', 'Approval'].includes(load.status)
        );
      case 1: // Bidding
        return loadData.filter(load => 
          ['Bidding', 'Bid Received', 'Posted'].includes(load.status)
        );
      case 2: // Transit
        return loadData.filter(load => 
          ['Assigned', 'In Transit', 'Picked Up'].includes(load.status)
        );
      case 3: // Delivered
        return loadData.filter(load => 
          ['Delivered', 'Completed'].includes(load.status)
        );
      default:
        return loadData;
    }
  };

  // Get counts for each tab
  const getTabCounts = () => {
    if (!loadData || loadData.length === 0) return [0, 0, 0, 0];
    
    return [
      loadData.filter(load => ['Pending', 'Approval'].includes(load.status)).length,
      loadData.filter(load => ['Bidding', 'Bid Received', 'Posted'].includes(load.status)).length,
      loadData.filter(load => ['Assigned', 'In Transit', 'Picked Up'].includes(load.status)).length,
      loadData.filter(load => ['Delivered', 'Completed'].includes(load.status)).length
    ];
  };

  const tabCounts = getTabCounts();

  // Handle search result from universal search
  useEffect(() => {
    if (location.state?.selectedShipment) {
      const shipment = location.state.selectedShipment;
      setSearchTerm(shipment.shipmentNumber || '');
      console.log('Navigated from search:', shipment);
      
      // Filter to show only the searched shipment
      if (originalLoadData.length > 0) {
        const filteredShipment = originalLoadData.find(load => 
          load.shipmentNumber === shipment.shipmentNumber ||
          load._id === shipment.id ||
          load.id === shipment.id
        );
        
        if (filteredShipment) {
          setLoadData([filteredShipment]);
          setIsFiltered(true);
        }
      }
    }
  }, [location.state, originalLoadData]);

  // Clear search filter
  const clearSearchFilter = () => {
    setLoadData(originalLoadData);
    setIsFiltered(false);
    setSearchTerm('');
  };

  useEffect(() => {
    const fetchLoads = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_API_URL}/api/v1/load/shipper`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        let data = response.data;
        if (data && data.loads && Array.isArray(data.loads)) {
          setLoadData(data.loads);
          setOriginalLoadData(data.loads); // Store original data
        } else if (Array.isArray(data)) {
          setLoadData(data);
          setOriginalLoadData(data); // Store original data
        } else {
          setLoadData([]);
          setOriginalLoadData([]);
        }
      } catch (err) {
        console.error('Error fetching loads:', err);
        setLoadData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLoads();
  }, []);

  
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
  };

  const handleFormChange = (e) => {
    const newForm = { ...form, [e.target.name]: e.target.value };
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
    console.log('Form submit triggered', form);
    console.log('loadType being sent to API:', form.loadType);
    console.log('returnDate:', form.returnDate);
    console.log('drayageLocation:', form.drayageLocation);
    e.preventDefault();
    const newErrors = {};
    
    // Validate based on load type
    if (form.loadType === 'DRAYAGE') {
      const requiredFields = ['fromAddress', 'fromCity', 'fromState', 'toAddress', 'toCity', 'toState', 'weight', 'commodity', 'vehicleType', 'pickupDate', 'deliveryDate', 'rate', 'returnDate', 'returnLocation'];
      requiredFields.forEach(field => {
        if (!form[field]) newErrors[field] = true;
      });
    } else if (form.loadType === 'OTR') {
      const requiredFields = ['vehicleType', 'rate'];
      requiredFields.forEach(field => {
        if (!form[field]) newErrors[field] = true;
      });
      
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
    if (Object.keys(newErrors).length === 0) {
      // Create payload based on load type
      let payload;
      
      if (form.loadType === 'DRAYAGE') {
        payload = {
          loadType: 'DRAYAGE',
          fromAddress: form.fromAddress,
          fromCity: form.fromCity,
          fromState: form.fromState,
          toAddress: form.toAddress,
          toCity: form.toCity,
          toState: form.toState,
          weight: Number(form.weight),
          commodity: form.commodity,
          vehicleType: form.vehicleType,
          pickupDate: form.pickupDate,
          deliveryDate: form.deliveryDate,
          rate: Number(form.rate),
          rateType: form.rateType || 'Flat Rate',
          bidDeadline: form.bidDeadline || '',
          containerNo: form.containerNo || '',
          poNumber: form.poNumber || '',
          bolNumber: form.bolNumber || '',
          returnDate: form.returnDate,
          returnLocation: form.returnLocation
        };
      } else {
        payload = {
          loadType: 'OTR',
          vehicleType: form.vehicleType,
          rate: Number(form.rate),
          rateType: form.rateType || 'Flat Rate',
          bidDeadline: form.bidDeadline || '',
          origins: form.origins.map(origin => ({
            addressLine1: origin.addressLine1,
            addressLine2: origin.addressLine2 || '',
            city: origin.city,
            state: origin.state || '',
            zip: origin.zip || '',
            weight: Number(origin.weight),
            commodity: origin.commodity,
            pickupDate: origin.pickupDate,
            deliveryDate: origin.deliveryDate || ''
          })),
          destinations: form.destinations.map(destination => ({
            addressLine1: destination.addressLine1,
            addressLine2: destination.addressLine2 || '',
            city: destination.city,
            state: destination.state || '',
            zip: destination.zip || '',
            weight: Number(destination.weight),
            commodity: destination.commodity,
            deliveryDate: destination.deliveryDate
          }))
        };
      }
             try {
         const token = localStorage.getItem('token');
         await axios.post(`${BASE_API_URL}/api/v1/load/create`, payload, {
           headers: {
             Authorization: `Bearer ${token}`
           }
         });
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
         // Refresh loads
         setLoading(true);
         const response = await axios.get(`${BASE_API_URL}/api/v1/load/shipper`, {
           headers: {
             Authorization: `Bearer ${token}`
           }
         });
         let data = response.data;
         console.log('Load data received from API:', data);
         if (data && data.loads && Array.isArray(data.loads)) {
           console.log('First load structure:', data.loads[0]);
           setLoadData(data.loads);
         } else if (Array.isArray(data)) {
           console.log('First load structure (direct array):', data[0]);
           setLoadData(data);
         } else {
           setLoadData([]);
         }
         setLoading(false);
       } catch (err) {
         setLoading(false);
         alertify.error(err.response?.data?.message || 'Failed to create load');
       }
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
        setBids(response.data.bids);
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

  const handleNegotiationSubmit = async (e) => {
    e.preventDefault();
    
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
      const response = await axios.put(`${BASE_API_URL}/api/v1/bid/${negotiationBidId}/status`, {
        status: 'Negotiating',
        shipperCounterRate: parseFloat(negotiationForm.shipperCounterRate),
        shipperNegotiationMessage: negotiationForm.shipperNegotiationMessage
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alertify.success('Negotiation started successfully');
        handleCloseNegotiationModal();
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
        // Refresh bids to show updated status
        if (selectedLoadId) {
          handleViewBids(selectedLoadId);
        }
      }
    } catch (err) {
      alertify.error(err.response?.data?.message || 'Failed to reject bid');
    }
  };

  const handleAcceptBid = (bid) => {
    setAcceptBidId(bid._id);
    setAcceptForm({
      status: 'Accepted',
      shipmentNumber: bid.shipmentNumber || '',
      origin: { addressLine1: bid.origin?.addressLine1 || '', addressLine2: bid.origin?.addressLine2 || '' },
      destination: { addressLine1: bid.destination?.addressLine1 || '', addressLine2: bid.destination?.addressLine2 || '' },
      poNumber: bid.poNumber || '',
      bolNumber: bid.bolNumber || '',
      message: bid.message || ''
    });
    setAcceptModalOpen(true);
  };
  const handleCloseAcceptModal = () => {
    setAcceptModalOpen(false);
    setAcceptBidId(null);
  };

  // Edit handlers
  const handleEditLoad = (load) => {
    setSelectedLoad(load);
    setEditForm({
      fromCity: (load.origins && load.origins.length > 0) ? load.origins[0].city || '' : load.origin?.city || '',
      fromState: (load.origins && load.origins.length > 0) ? load.origins[0].state || '' : load.origin?.state || '',
      toCity: (load.destinations && load.destinations.length > 0) ? load.destinations[0].city || '' : load.destination?.city || '',
      toState: (load.destinations && load.destinations.length > 0) ? load.destinations[0].state || '' : load.destination?.state || '',
      pickupDate: load.pickupDate ? new Date(load.pickupDate).toISOString().split('T')[0] : '',
      deliveryDate: load.deliveryDate ? new Date(load.deliveryDate).toISOString().split('T')[0] : '',
      weight: load.weight || '',
      commodity: load.commodity || '',
      vehicleType: load.vehicleType || '',
      rate: load.rate || '',
      rateType: load.rateType || 'Flat Rate',
      loadType: load.loadType || 'OTR',
      containerNo: load.containerNo || '',
      poNumber: load.poNumber || '',
      bolNumber: load.bolNumber || '',
      notes: load.notes || '',
      returnDate: load.returnDate ? new Date(load.returnDate).toISOString().split('T')[0] : '',
      returnLocation: load.returnLocation || ''
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedLoad(null);
    setEditForm({
      fromCity: '',
      fromState: '',
      toCity: '',
      toState: '',
      pickupDate: '',
      deliveryDate: '',
      weight: '',
      commodity: '',
      vehicleType: '',
      rate: '',
      rateType: 'Flat Rate',
      loadType: 'OTR',
      containerNo: '',
      poNumber: '',
      bolNumber: '',
      notes: '',
      returnDate: '',
      returnLocation: ''
    });
    setEditErrors({});
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (editErrors[e.target.name]) {
      setEditErrors({ ...editErrors, [e.target.name]: false });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    
    // Validation
    const newErrors = {};
    if (!editForm.fromCity) newErrors.fromCity = true;
    if (!editForm.fromState) newErrors.fromState = true;
    if (!editForm.toCity) newErrors.toCity = true;
    if (!editForm.toState) newErrors.toState = true;
    if (!editForm.pickupDate) newErrors.pickupDate = true;
    if (!editForm.deliveryDate) newErrors.deliveryDate = true;
    if (!editForm.weight) newErrors.weight = true;
    if (!editForm.commodity) newErrors.commodity = true;
    if (!editForm.vehicleType) newErrors.vehicleType = true;
    if (!editForm.rate) newErrors.rate = true;

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      setEditLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const updateData = {
        loadType: editForm.loadType,
        fromCity: editForm.fromCity,
        fromState: editForm.fromState,
        toCity: editForm.toCity,
        toState: editForm.toState,
        pickupDate: new Date(editForm.pickupDate).toISOString(),
        deliveryDate: new Date(editForm.deliveryDate).toISOString(),
        weight: Number(editForm.weight),
        commodity: editForm.commodity,
        vehicleType: editForm.vehicleType,
        rate: Number(editForm.rate),
        rateType: editForm.rateType,
        containerNo: editForm.containerNo || '',
        poNumber: editForm.poNumber || '',
        bolNumber: editForm.bolNumber || '',
        returnDate: editForm.returnDate ? new Date(editForm.returnDate).toISOString() : '',
        returnLocation: editForm.returnLocation || ''
      };

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
        // Refresh the loads data
        const loadsResponse = await axios.get(`${BASE_API_URL}/api/v1/load/shipper`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        let data = loadsResponse.data;
        if (data && data.loads && Array.isArray(data.loads)) {
          setLoadData(data.loads);
        } else if (Array.isArray(data)) {
          setLoadData(data);
        } else {
          setLoadData([]);
        }
        
        handleCloseEditModal();
        // Show success notification
        if (window.alertify) {
          window.alertify.success('Load updated successfully!');
        } else {
          alert('Load updated successfully!');
        }
      } else {
        // Show error notification
        if (window.alertify) {
          window.alertify.error('Failed to update load: ' + (response.data.message || 'Unknown error'));
        } else {
          alert('Failed to update load: ' + (response.data.message || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error updating load:', error);
      // Show error notification
      if (window.alertify) {
        window.alertify.error('Error updating load: ' + (error.response?.data?.message || error.message));
      } else {
        alert('Error updating load: ' + (error.response?.data?.message || error.message));
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
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_API_URL}/api/v1/load/shipper/load/${loadId}/cmt-assignment`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setCmtData(response.data.data);
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
        const loadsResponse = await axios.get(`${BASE_API_URL}/api/v1/load/shipper`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        let data = loadsResponse.data;
        if (data && data.loads && Array.isArray(data.loads)) {
          setLoadData(data.loads);
        } else if (Array.isArray(data)) {
          setLoadData(data);
        } else {
          setLoadData([]);
        }
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
    const { name, value } = e.target;
    if (name.startsWith('origin.')) {
      setAcceptForm((prev) => ({ ...prev, origin: { ...prev.origin, [name.split('.')[1]]: value } }));
    } else if (name.startsWith('destination.')) {
      setAcceptForm((prev) => ({ ...prev, destination: { ...prev.destination, [name.split('.')[1]]: value } }));
    } else {
      setAcceptForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleAcceptSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!acceptForm.shipmentNumber) newErrors.shipmentNumber = true;
    if (!acceptForm.origin.addressLine1) newErrors['origin.addressLine1'] = true;
    if (!acceptForm.destination.addressLine1) newErrors['destination.addressLine1'] = true;
    if (!acceptForm.poNumber) newErrors.poNumber = true;
    if (!acceptForm.bolNumber) newErrors.bolNumber = true;
    if (!acceptForm.reason) newErrors.reason = true;
    setAcceptErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      alertify.error('Please fill in all required fields');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BASE_API_URL}/api/v1/bid/${acceptBidId}/status`, {
        status: acceptForm.status,
        shipmentNumber: acceptForm.shipmentNumber,
        origin: acceptForm.origin,
        destination: acceptForm.destination,
        poNumber: acceptForm.poNumber,
        bolNumber: acceptForm.bolNumber,
        reason: acceptForm.reason
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBids((prev) => prev.map((bid) => bid._id === acceptBidId ? { ...bid, status: 'Accepted' } : bid));
      alertify.success('Bid accepted successfully!');
      setAcceptModalOpen(false);
      setAcceptBidId(null);
    } catch (err) {
      alertify.error(err.response?.data?.message || 'Failed to accept bid');
    }
  };

  // Search and filter logic
  const getSearchFilteredData = () => {
    return loadData.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  // Combined filtering: tab filter + search filter
  const filteredData = getFilteredLoads().filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Export CSV function (Consignment.jsx style)
  const exportToCSV = () => {
    const headers = ['Load ID', 'Weight', 'Pick-Up', 'Drop', 'Vehicle', 'Bids', 'Status'];
    const csvRows = [headers.join(',')];
    loadData.forEach(row => {
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
              label={`Filtered: ${loadData.length} result${loadData.length !== 1 ? 's' : ''}`}
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

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
                     <TableHead>
             <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
               <TableCell sx={{ fontWeight: 600 }}>Load ID</TableCell>
               <TableCell sx={{ fontWeight: 600 }}>Shipment No</TableCell>
               <TableCell sx={{ fontWeight: 600 }}>Weight</TableCell>
               <TableCell sx={{ fontWeight: 600 }}>Pick-Up</TableCell>
               <TableCell sx={{ fontWeight: 600 }}>Drop</TableCell>
               <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
               <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
               <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
             </TableRow>
           </TableHead>
          <TableBody>
                         {loading ? (
               <TableRow>
                 <TableCell colSpan={7} align="center">Loading...</TableCell>
               </TableRow>
             ) : filteredData.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={7} align="center">No data found</TableCell>
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
                     <TableCell>{load.shipmentNumber}</TableCell>
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
                            disabled={!['Pending', 'Approval', 'Posted'].includes(load.status)}
                            sx={{
                              opacity: !['Pending', 'Approval', 'Posted'].includes(load.status) ? 0.5 : 1,
                              cursor: !['Pending', 'Approval', 'Posted'].includes(load.status) ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Edit
                          </Button>
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
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            minHeight: '80vh'
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
          justifyContent: 'space-between',
          gap: 2,
          py: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Add sx={{ fontSize: 28 }} />
            Add New Load
          </Box>
          
          {/* Load Type Toggle in Header */}
          <Stack direction="row" spacing={1}>
               <Button
                 variant={loadType === 'OTR' ? 'contained' : 'outlined'}
                 onClick={() => handleLoadTypeChange('OTR')}
              sx={{ 
                borderRadius: 3, 
                minWidth: 80,
                fontWeight: 600,
                textTransform: 'none',
                py: 1,
                px: 2,
                fontSize: '0.9rem',
                ...(loadType === 'OTR' ? {
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  '&:hover': { background: 'linear-gradient(45deg, #1565c0, #1976d2)' }
                } : {
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  '&:hover': { borderColor: '#0d47a1', backgroundColor: 'rgba(25, 118, 210, 0.04)' }
                })
              }}
               >
                 OTR
               </Button>
               <Button
                 variant={loadType === 'DRAYAGE' ? 'contained' : 'outlined'}
                 onClick={() => handleLoadTypeChange('DRAYAGE')}
              sx={{ 
                borderRadius: 3, 
                minWidth: 80,
                fontWeight: 600,
                textTransform: 'none',
                py: 1,
                px: 2,
                fontSize: '0.9rem',
                ...(loadType === 'DRAYAGE' ? {
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  '&:hover': { background: 'linear-gradient(45deg, #1565c0, #1976d2)' }
                } : {
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  '&:hover': { borderColor: '#0d47a1', backgroundColor: 'rgba(25, 118, 210, 0.04)' }
                })
              }}
               >
                 DRAYAGE
               </Button>
             </Stack>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>

            {/* Form Sections */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* DRAYAGE Location Section - Only for DRAYAGE */}
              {loadType === 'DRAYAGE' && (
                <>
                  {/* Pick Up Location Section */}
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
                        background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <LocationOn sx={{ color: '#1976d2', fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                        Pick Up Location
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          label="Address *"
                          name="fromAddress"
                          value={form.fromAddress}
                          onChange={handleFormChange}
                          fullWidth
                          error={!!errors.fromAddress}
                          placeholder="Enter full address"
                          sx={{
                            '& .MuiInputBase-root': {
                              borderRadius: 2,
                              backgroundColor: '#f8f9fa',
                              '&:hover': { backgroundColor: '#e9ecef' },
                              '&.Mui-focused': { backgroundColor: 'white' }
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
                          placeholder="Enter city name"
                          sx={{
                            '& .MuiInputBase-root': {
                              borderRadius: 2,
                              backgroundColor: '#f8f9fa',
                              '&:hover': { backgroundColor: '#e9ecef' },
                              '&.Mui-focused': { backgroundColor: 'white' }
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
                          placeholder="Enter state"
                          sx={{
                            '& .MuiInputBase-root': {
                              borderRadius: 2,
                              backgroundColor: '#f8f9fa',
                              '&:hover': { backgroundColor: '#e9ecef' },
                              '&.Mui-focused': { backgroundColor: 'white' }
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Delivery Location Section */}
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
                        <LocalShipping sx={{ color: '#2e7d32', fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                        
Loading/Unloading Location
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          label="Address *"
                          name="toAddress"
                          value={form.toAddress}
                          onChange={handleFormChange}
                          fullWidth
                          error={!!errors.toAddress}
                          placeholder="Enter full address"
                          sx={{
                            '& .MuiInputBase-root': {
                              borderRadius: 2,
                              backgroundColor: '#f8f9fa',
                              '&:hover': { backgroundColor: '#e9ecef' },
                              '&.Mui-focused': { backgroundColor: 'white' }
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
                          placeholder="Enter city name"
                          sx={{
                            '& .MuiInputBase-root': {
                              borderRadius: 2,
                              backgroundColor: '#f8f9fa',
                              '&:hover': { backgroundColor: '#e9ecef' },
                              '&.Mui-focused': { backgroundColor: 'white' }
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
                          placeholder="Enter state"
                          sx={{
                            '& .MuiInputBase-root': {
                              borderRadius: 2,
                              backgroundColor: '#f8f9fa',
                              '&:hover': { backgroundColor: '#e9ecef' },
                              '&.Mui-focused': { backgroundColor: 'white' }
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </>
              )}

              {/* Return Details Section - Only for DRAYAGE */}
              {loadType === 'DRAYAGE' && (
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
                      background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Assignment sx={{ color: '#f57c00', fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#f57c00' }}>
                      
Drayage Details
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                        label="Return Date *"
                        name="returnDate"
                        value={form.returnDate}
                  onChange={handleFormChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputBase-root': {
                            borderRadius: 2,
                            backgroundColor: '#f8f9fa',
                            '&:hover': { backgroundColor: '#e9ecef' },
                            '&.Mui-focused': { backgroundColor: 'white' }
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                        label="Return Location *"
                        name="returnLocation"
                        value={form.returnLocation}
                  onChange={handleFormChange}
                  fullWidth
                        placeholder="Enter Return Location"
                  sx={{
                    '& .MuiInputBase-root': {
                            borderRadius: 2,
                            backgroundColor: '#f8f9fa',
                            '&:hover': { backgroundColor: '#e9ecef' },
                            '&.Mui-focused': { backgroundColor: 'white' }
                    },
                  }}
                />
              </Grid>
                  </Grid>
                </Paper>
              )}
{/* OTR Origins and Destinations - Only for OTR */}
{loadType === 'OTR' && (
                <>
                  {/* Origins Section */}
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
                        background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <LocationOn sx={{ color: '#1976d2', fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                      Location Details
                      </Typography>
                    </Box>
                    
                    {form.origins.map((origin, index) => (
                      <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Pickup Locations {index + 1}
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
                                fontSize: '0.75rem'
                              }}
                            >
                              Delete
                            </Button>
                          )}
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              label="Address Line 1 *"
                              name={`origins[${index}].addressLine1`}
                              value={origin.addressLine1}
                              onChange={(e) => {
                                const newOrigins = [...form.origins];
                                newOrigins[index].addressLine1 = e.target.value;
                                setForm({ ...form, origins: newOrigins });
                              }}
                              fullWidth
                              error={!!errors[`origin_${index}_addressLine1`]}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#f8f9fa',
                                  '&:hover': { backgroundColor: '#e9ecef' },
                                  '&.Mui-focused': { backgroundColor: 'white' }
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              label="Address Line 2"
                              name={`origins[${index}].addressLine2`}
                              value={origin.addressLine2}
                              onChange={(e) => {
                                const newOrigins = [...form.origins];
                                newOrigins[index].addressLine2 = e.target.value;
                                setForm({ ...form, origins: newOrigins });
                              }}
                              fullWidth
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#f8f9fa',
                                  '&:hover': { backgroundColor: '#e9ecef' },
                                  '&.Mui-focused': { backgroundColor: 'white' }
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="City *"
                              name={`origins[${index}].city`}
                              value={origin.city}
                              onChange={(e) => {
                                const newOrigins = [...form.origins];
                                newOrigins[index].city = e.target.value;
                                setForm({ ...form, origins: newOrigins });
                              }}
                              fullWidth
                              error={!!errors[`origin_${index}_city`]}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#f8f9fa',
                                  '&:hover': { backgroundColor: '#e9ecef' },
                                  '&.Mui-focused': { backgroundColor: 'white' }
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="State"
                              name={`origins[${index}].state`}
                              value={origin.state}
                              onChange={(e) => {
                                const newOrigins = [...form.origins];
                                newOrigins[index].state = e.target.value;
                                setForm({ ...form, origins: newOrigins });
                              }}
                              fullWidth
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#f8f9fa',
                                  '&:hover': { backgroundColor: '#e9ecef' },
                                  '&.Mui-focused': { backgroundColor: 'white' }
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="ZIP"
                              name={`origins[${index}].zip`}
                              value={origin.zip}
                              onChange={(e) => {
                                const newOrigins = [...form.origins];
                                newOrigins[index].zip = e.target.value;
                                setForm({ ...form, origins: newOrigins });
                              }}
                              fullWidth
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#f8f9fa',
                                  '&:hover': { backgroundColor: '#e9ecef' },
                                  '&.Mui-focused': { backgroundColor: 'white' }
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Weight (lbs) *"
                              name={`origins[${index}].weight`}
                              value={origin.weight}
                              onChange={(e) => {
                                const newOrigins = [...form.origins];
                                newOrigins[index].weight = e.target.value;
                                setForm({ ...form, origins: newOrigins });
                              }}
                              fullWidth
                              error={!!errors[`origin_${index}_weight`]}
                              InputProps={{
                                startAdornment: <Scale sx={{ color: '#666' }} />
                              }}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#f8f9fa',
                                  '&:hover': { backgroundColor: '#e9ecef' },
                                  '&.Mui-focused': { backgroundColor: 'white' }
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Commodity *"
                              name={`origins[${index}].commodity`}
                              value={origin.commodity}
                              onChange={(e) => {
                                const newOrigins = [...form.origins];
                                newOrigins[index].commodity = e.target.value;
                                setForm({ ...form, origins: newOrigins });
                              }}
                              fullWidth
                              error={!!errors[`origin_${index}_commodity`]}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#f8f9fa',
                                  '&:hover': { backgroundColor: '#e9ecef' },
                                  '&.Mui-focused': { backgroundColor: 'white' }
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              type="date"
                              label="Pickup Date *"
                              name={`origins[${index}].pickupDate`}
                              value={origin.pickupDate}
                              onChange={(e) => {
                                const newOrigins = [...form.origins];
                                newOrigins[index].pickupDate = e.target.value;
                                setForm({ ...form, origins: newOrigins });
                              }}
                              fullWidth
                              error={!!errors[`origin_${index}_pickupDate`]}
                              InputLabelProps={{ shrink: true }}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#f8f9fa',
                                  '&:hover': { backgroundColor: '#e9ecef' },
                                  '&.Mui-focused': { backgroundColor: 'white' }
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              type="date"
                              label="Delivery Date"
                              name={`origins[${index}].deliveryDate`}
                              value={origin.deliveryDate}
                              onChange={(e) => {
                                const newOrigins = [...form.origins];
                                newOrigins[index].deliveryDate = e.target.value;
                                setForm({ ...form, origins: newOrigins });
                              }}
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#f8f9fa',
                                  '&:hover': { backgroundColor: '#e9ecef' },
                                  '&.Mui-focused': { backgroundColor: 'white' }
                                },
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                    
                    <Button
                      variant="outlined"
                      onClick={() => {
                        const newOrigins = [...form.origins, {
                          addressLine1: '',
                          addressLine2: '',
                          city: '',
                          state: '',
                          zip: '',
                          weight: '',
                          commodity: '',
                          pickupDate: '',
                          deliveryDate: ''
                        }];
                        setForm({ ...form, origins: newOrigins });
                      }}
                      sx={{ mt: 2 }}
                    >
                      Add Pickup Location
                    </Button>
                  </Paper>

                  {/* Destinations Section */}
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
                        <LocalShipping sx={{ color: '#2e7d32', fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                      Delivery Locations
                      </Typography>
                    </Box>
                    
                    {form.destinations.map((destination, index) => (
                      <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
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
                                fontSize: '0.75rem'
                              }}
                            >
                              Delete
                            </Button>
                          )}
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              label="Address Line 1 *"
                              name={`destinations[${index}].addressLine1`}
                              value={destination.addressLine1}
                              onChange={(e) => {
                                const newDestinations = [...form.destinations];
                                newDestinations[index].addressLine1 = e.target.value;
                                setForm({ ...form, destinations: newDestinations });
                              }}
                              fullWidth
                              error={!!errors[`destination_${index}_addressLine1`]}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#f8f9fa',
                                  '&:hover': { backgroundColor: '#e9ecef' },
                                  '&.Mui-focused': { backgroundColor: 'white' }
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              label="Address Line 2"
                              name={`destinations[${index}].addressLine2`}
                              value={destination.addressLine2}
                              onChange={(e) => {
                                const newDestinations = [...form.destinations];
                                newDestinations[index].addressLine2 = e.target.value;
                                setForm({ ...form, destinations: newDestinations });
                              }}
                              fullWidth
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#f8f9fa',
                                  '&:hover': { backgroundColor: '#e9ecef' },
                                  '&.Mui-focused': { backgroundColor: 'white' }
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="City *"
                              name={`destinations[${index}].city`}
                              value={destination.city}
                              onChange={(e) => {
                                const newDestinations = [...form.destinations];
                                newDestinations[index].city = e.target.value;
                                setForm({ ...form, destinations: newDestinations });
                              }}
                              fullWidth
                              error={!!errors[`destination_${index}_city`]}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#f8f9fa',
                                  '&:hover': { backgroundColor: '#e9ecef' },
                                  '&.Mui-focused': { backgroundColor: 'white' }
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="State"
                              name={`destinations[${index}].state`}
                              value={destination.state}
                              onChange={(e) => {
                                const newDestinations = [...form.destinations];
                                newDestinations[index].state = e.target.value;
                                setForm({ ...form, destinations: newDestinations });
                              }}
                              fullWidth
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#f8f9fa',
                                  '&:hover': { backgroundColor: '#e9ecef' },
                                  '&.Mui-focused': { backgroundColor: 'white' }
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="ZIP"
                              name={`destinations[${index}].zip`}
                              value={destination.zip}
                              onChange={(e) => {
                                const newDestinations = [...form.destinations];
                                newDestinations[index].zip = e.target.value;
                                setForm({ ...form, destinations: newDestinations });
                              }}
                              fullWidth
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#f8f9fa',
                                  '&:hover': { backgroundColor: '#e9ecef' },
                                  '&.Mui-focused': { backgroundColor: 'white' }
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Weight (lbs) *"
                              name={`destinations[${index}].weight`}
                              value={destination.weight}
                              onChange={(e) => {
                                const newDestinations = [...form.destinations];
                                newDestinations[index].weight = e.target.value;
                                setForm({ ...form, destinations: newDestinations });
                              }}
                              fullWidth
                              error={!!errors[`destination_${index}_weight`]}
                              InputProps={{
                                startAdornment: <Scale sx={{ color: '#666' }} />
                              }}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#f8f9fa',
                                  '&:hover': { backgroundColor: '#e9ecef' },
                                  '&.Mui-focused': { backgroundColor: 'white' }
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Commodity *"
                              name={`destinations[${index}].commodity`}
                              value={destination.commodity}
                              onChange={(e) => {
                                const newDestinations = [...form.destinations];
                                newDestinations[index].commodity = e.target.value;
                                setForm({ ...form, destinations: newDestinations });
                              }}
                              fullWidth
                              error={!!errors[`destination_${index}_commodity`]}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#f8f9fa',
                                  '&:hover': { backgroundColor: '#e9ecef' },
                                  '&.Mui-focused': { backgroundColor: 'white' }
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              type="date"
                              label="Delivery Date *"
                              name={`destinations[${index}].deliveryDate`}
                              value={destination.deliveryDate}
                              onChange={(e) => {
                                const newDestinations = [...form.destinations];
                                newDestinations[index].deliveryDate = e.target.value;
                                setForm({ ...form, destinations: newDestinations });
                              }}
                              fullWidth
                              error={!!errors[`destination_${index}_deliveryDate`]}
                              InputLabelProps={{ shrink: true }}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#f8f9fa',
                                  '&:hover': { backgroundColor: '#e9ecef' },
                                  '&.Mui-focused': { backgroundColor: 'white' }
                                },
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                    
                    <Button
                      variant="outlined"
                      onClick={() => {
                        const newDestinations = [...form.destinations, {
                          addressLine1: '',
                          addressLine2: '',
                          city: '',
                          state: '',
                          zip: '',
                          weight: '',
                          commodity: '',
                          deliveryDate: ''
                        }];
                        setForm({ ...form, destinations: newDestinations });
                      }}
                      sx={{ mt: 2 }}
                    >
                      Add Delivery Location
                    </Button>
                  </Paper>
                </>
              )}
              {/* Load Details Section */}
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
                    background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Business sx={{ color: '#7b1fa2', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#7b1fa2' }}>
                    Load Details
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
              <Grid item xs={12} sm={8}>
                <FormControl fullWidth error={!!errors.vehicleType}>
                  <InputLabel>Vehicle Type *</InputLabel>
                  <Select
                    name="vehicleType"
                    value={form.vehicleType}
                    onChange={handleFormChange}
                    label="Vehicle Type *"
                    sx={{
                      borderRadius: 2,
                      backgroundColor: '#f8f9fa',
                      '&:hover': { backgroundColor: '#e9ecef' },
                      '&.Mui-focused': { backgroundColor: 'white' },
                      minWidth: 300
                    }}
                  >
                    {(loadType === 'Drayage' ? DRAYAGE_VEHICLE_TYPES : OTR_VEHICLE_TYPES).map((vehicleType) => (
                      <MenuItem key={vehicleType} value={vehicleType} sx={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                        {vehicleType}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                      label="Target Rate ($)"
                      name="price"
                      value={form.price}
                  onChange={handleFormChange}
                  fullWidth
                      error={!!errors.price}
                      placeholder="e.g., 7500 or 7500/60"
                      InputProps={{
                        startAdornment: <AttachMoney sx={{ color: '#666' }} />
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                          backgroundColor: '#f8f9fa',
                          '&:hover': { backgroundColor: '#e9ecef' },
                          '&.Mui-focused': { backgroundColor: 'white' }
                        },
                      }}
                    />
                  </Grid>
                  {loadType === 'DRAYAGE' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Weight (lbs) *"
                          name="weight"
                          value={form.weight}
                          onChange={handleFormChange}
                          fullWidth
                          error={!!errors.weight}
                          placeholder="e.g., 75000"
                          InputProps={{
                            startAdornment: <Scale sx={{ color: '#666' }} />
                          }}
                          sx={{
                            '& .MuiInputBase-root': {
                              borderRadius: 2,
                              backgroundColor: '#f8f9fa',
                              '&:hover': { backgroundColor: '#e9ecef' },
                              '&.Mui-focused': { backgroundColor: 'white' }
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Commodity *"
                          name="commodity"
                          value={form.commodity}
                          onChange={handleFormChange}
                          fullWidth
                          error={!!errors.commodity}
                          placeholder="e.g., Electronics, Furniture"
                          sx={{
                            '& .MuiInputBase-root': {
                              borderRadius: 2,
                              backgroundColor: '#f8f9fa',
                              '&:hover': { backgroundColor: '#e9ecef' },
                              '&.Mui-focused': { backgroundColor: 'white' }
                            },
                          }}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Paper>





              {/* Schedule & Timeline Section - Only for DRAYAGE */}
              {loadType === 'DRAYAGE' && (
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
                    <Grid item xs={12} sm={4}>
                      <TextField
                        type="date"
                        label="Pickup Date *"
                        name="pickupDate"
                        value={form.pickupDate}
                        onChange={handleFormChange}
                        fullWidth
                        error={!!errors.pickupDate}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiInputBase-root': {
                            borderRadius: 2,
                            backgroundColor: '#f8f9fa',
                            '&:hover': { backgroundColor: '#e9ecef' },
                            '&.Mui-focused': { backgroundColor: 'white' }
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        type="date"
                        label="Delivery Date *"
                        name="deliveryDate"
                        value={form.deliveryDate}
                        onChange={handleFormChange}
                        fullWidth
                        error={!!errors.deliveryDate}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiInputBase-root': {
                            borderRadius: 2,
                            backgroundColor: '#f8f9fa',
                            '&:hover': { backgroundColor: '#e9ecef' },
                            '&.Mui-focused': { backgroundColor: 'white' }
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        type="date"
                        label="Bid Deadline"
                        name="bidDeadline"
                        value={form.bidDeadline}
                        onChange={handleFormChange}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiInputBase-root': {
                            borderRadius: 2,
                            backgroundColor: '#f8f9fa',
                            '&:hover': { backgroundColor: '#e9ecef' },
                            '&.Mui-focused': { backgroundColor: 'white' }
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
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
                        type="date"
                        label="Bid Deadline"
                        name="bidDeadline"
                        value={form.bidDeadline}
                        onChange={handleFormChange}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiInputBase-root': {
                            borderRadius: 2,
                            backgroundColor: '#f8f9fa',
                            '&:hover': { backgroundColor: '#e9ecef' },
                            '&.Mui-focused': { backgroundColor: 'white' }
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* Additional Details Section */}
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
                    background: 'linear-gradient(135deg, #e0f2f1, #b2dfdb)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Description sx={{ color: '#00695c', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#00695c' }}>
                    Additional Details 
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Container No."
                      name="containerNo"
                      value={form.containerNo}
                      onChange={handleFormChange}
                      fullWidth
                      placeholder="Container number"
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                          backgroundColor: '#f8f9fa',
                          '&:hover': { backgroundColor: '#e9ecef' },
                          '&.Mui-focused': { backgroundColor: 'white' }
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="PO Number"
                      name="poNumber"
                      value={form.poNumber}
                      onChange={handleFormChange}
                      fullWidth
                      placeholder="Purchase order number"
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                          backgroundColor: '#f8f9fa',
                          '&:hover': { backgroundColor: '#e9ecef' },
                          '&.Mui-focused': { backgroundColor: 'white' }
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="BOL Number"
                      name="bolNumber"
                      value={form.bolNumber}
                      onChange={handleFormChange}
                      fullWidth
                      placeholder="Bill of lading number"
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                          backgroundColor: '#f8f9fa',
                          '&:hover': { backgroundColor: '#e9ecef' },
                          '&.Mui-focused': { backgroundColor: 'white' }
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Rate Type</InputLabel>
                      <Select
                        name="rateType"
                        value={form.rateType}
                        onChange={handleFormChange}
                        label="Rate Type"
                        sx={{
                          borderRadius: 2,
                          backgroundColor: '#f8f9fa',
                          '&:hover': { backgroundColor: '#e9ecef' },
                          '&.Mui-focused': { backgroundColor: 'white' }
                        }}
                      >
                        <MenuItem value="Flat Rate">Flat Rate</MenuItem>
                        <MenuItem value="Per Mile">Per Mile</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>

              

            {/* Smart Rate Suggestion Button */}
              <Box sx={{ 
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
              </Box>
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
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          borderTop: '2px solid #e0e0e0'
        }}>
              <Button
                onClick={handleCloseModal}
            variant="outlined" 
                sx={{
              borderRadius: 2, 
              fontWeight: 600, 
              color: '#1976d2', 
              borderColor: '#1976d2',
              px: 3,
              py: 1.5,
                  textTransform: 'none',
              '&:hover': {
                borderColor: '#0d47a1',
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
                }}
              >
                Cancel
              </Button>
              <Button
            onClick={handleSubmit} 
                variant="contained"
                sx={{
              borderRadius: 2, 
              fontWeight: 600, 
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  px: 4,
              py: 1.5,
              textTransform: 'none',
              '&:hover': { 
                background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
              }
            }}
          >
            Create Load
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
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: '#fff',
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
                      <Box sx={{
                        background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                        borderRadius: 3,
                        p: 2,
                        border: '1px solid #4caf50',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)'
                        }
                      }}>
                        <Typography sx={{ 
                          fontWeight: 600, 
                          fontSize: 11, 
                          color: '#2e7d32',
                          mb: 1,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}>
                          💰 Bid Amount
                        </Typography>
                        <Typography sx={{ 
                          fontWeight: 700, 
                          fontSize: 16, 
                          color: '#1b5e20'
                        }}>
                          ${bid.intermediateRate?.toLocaleString() || '-'}
                        </Typography>
                      </Box>

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

                    {/* Message Section */}
                    <Box sx={{
                      background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                      borderRadius: 3,
                      p: 2.5,
                      border: '1px solid #dee2e6',
                      width: '100%',
                      mb: 2
                    }}>
                      <Typography sx={{ 
                        fontWeight: 700, 
                        color: '#1976d2', 
                        fontSize: 13,
                        mb: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        💬 Driver Message
                      </Typography>
                      <Typography sx={{ 
                        fontWeight: 500, 
                        fontSize: 14, 
                        color: '#333',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        lineHeight: 1.5,
                        background: '#fff',
                        borderRadius: 2,
                        p: 2,
                        border: '1px solid #e0e0e0'
                      }}>
                        "{bid.message || 'No message provided'}"
                      </Typography>
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
                               fontStyle: 'italic'
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
                                 mt: 0.5
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

                    {/* Action Buttons */}
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
                        onClick={() => handleStartNegotiation(bid)}
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

                                                                                   {/* Bid Details Modal */}
          <Dialog open={bidDetailsModalOpen} onClose={handleCloseBidDetailsModal} maxWidth={false} fullWidth PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              background: '#fff',
              maxHeight: '45vh',
              width: '700px',
              maxWidth: '90vw'
            }
          }}>
          <DialogTitle sx={{
            fontWeight: 700,
            color: '#1976d2',
            fontSize: 20,
            background: '#f8fafc',
            borderBottom: '2px solid #e3f2fd',
            py: 2,
            textAlign: 'center'
          }}>
            🚛 Bid Details
            {selectedBid && (
              <Chip 
                label={selectedBid.status} 
                color={
                  selectedBid.status === 'Pending' ? 'default' :
                  selectedBid.status === 'Negotiating' ? 'warning' :
                  selectedBid.status === 'Accepted' ? 'success' :
                  selectedBid.status === 'Rejected' ? 'error' : 'default'
                } 
                size="small" 
                sx={{ ml: 2, fontWeight: 600 }}
              />
            )}
          </DialogTitle>
                                           <DialogContent sx={{ px: 3, py: 2 }}>
              {selectedBid && (
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}>
                  {/* Driver Name - Centered */}
                  <Box sx={{ textAlign: 'center', mb: 2, mt: 1 }}>
                   <Avatar
                     src={selectedBid.bidder?.avatar || ''}
                     alt="Driver"
                     sx={{ 
                       width: 60, 
                       height: 60, 
                       mb: 1,
                       bgcolor: '#e3f2fd',
                       color: '#1976d2',
                       border: '2px solid #1976d2',
                       fontSize: 24,
                       fontWeight: 600,
                       mx: 'auto'
                     }}
                   >
                     {selectedBid.driver?.name ?
                       (selectedBid.driver.name.split(' ').map(w => w[0]).join('').toUpperCase()) :
                       <PersonIcon sx={{ fontSize: 28, color: '#1976d2' }} />
                     }
                   </Avatar>
                   <Typography sx={{ 
                     fontWeight: 700, 
                     fontSize: 18, 
                     color: '#1976d2',
                     mb: 0.5
                   }}>
                     {selectedBid.driver?.name || selectedBid.driverName || 'Driver Name'}
                   </Typography>
                 </Box>

                 {/* Row 1: Vehicle No, Bid Amount, Pickup ETA, Drop ETA */}
                 <Box sx={{ 
                   display: 'grid', 
                   gridTemplateColumns: '1fr 1fr 1fr 1fr',
                   gap: 2,
                   mb: 2
                 }}>
                   <Box sx={{
                     background: '#f8f9fa',
                     borderRadius: 2,
                     p: 1.5,
                     border: '1px solid #e9ecef',
                     textAlign: 'center'
                   }}>
                     <Typography sx={{ 
                       fontWeight: 600, 
                       color: '#1976d2', 
                       fontSize: 12,
                       mb: 0.5
                     }}>
                       Vehicle No
                     </Typography>
                     <Typography sx={{ 
                       fontWeight: 600, 
                       fontSize: 14, 
                       color: '#333'
                     }}>
                       🚛 {selectedBid.vehicle?.number || selectedBid.vehicleNumber || 'N/A'}
                     </Typography>
                   </Box>

                   <Box sx={{
                     background: '#f8f9fa',
                     borderRadius: 2,
                     p: 1.5,
                     border: '1px solid #e9ecef',
                     textAlign: 'center'
                   }}>
                     <Typography sx={{ 
                       fontWeight: 600, 
                       color: '#1976d2', 
                       fontSize: 12,
                       mb: 0.5
                     }}>
                       Bid Amount
                     </Typography>
                     <Typography sx={{ 
                       fontWeight: 700, 
                       fontSize: 16, 
                       color: '#4caf50'
                     }}>
                       ${selectedBid.intermediateRate?.toLocaleString() || '-'}
                     </Typography>
                   </Box>

                   <Box sx={{
                     background: '#fff3e0',
                     borderRadius: 2,
                     p: 1.5,
                     border: '1px solid #ffcc02',
                     textAlign: 'center'
                   }}>
                     <Typography sx={{ 
                       fontWeight: 600, 
                       color: '#f57c00', 
                       fontSize: 12,
                       mb: 0.5
                     }}>
                       Pickup ETA
                     </Typography>
                     <Typography sx={{ 
                       fontWeight: 600, 
                       fontSize: 13, 
                       color: '#333'
                     }}>
                       {selectedBid.estimatedPickupDate ? 
                         new Date(selectedBid.estimatedPickupDate).toLocaleDateString('en-US', {
                           month: 'short',
                           day: 'numeric',
                           hour: '2-digit',
                           minute: '2-digit'
                         }) : 'Not specified'}
                     </Typography>
                   </Box>

                   <Box sx={{
                     background: '#e8f5e8',
                     borderRadius: 2,
                     p: 1.5,
                     border: '1px solid #4caf50',
                     textAlign: 'center'
                   }}>
                     <Typography sx={{ 
                       fontWeight: 600, 
                       color: '#2e7d32', 
                       fontSize: 12,
                       mb: 0.5
                     }}>
                       Drop ETA
                     </Typography>
                     <Typography sx={{ 
                       fontWeight: 600, 
                       fontSize: 13, 
                       color: '#333'
                     }}>
                       {selectedBid.estimatedDeliveryDate ? 
                         new Date(selectedBid.estimatedDeliveryDate).toLocaleDateString('en-US', {
                           month: 'short',
                           day: 'numeric',
                           hour: '2-digit',
                           minute: '2-digit'
                         }) : 'Not specified'}
                     </Typography>
                   </Box>
                 </Box>

                 {/* Row 2: Message - Full Width */}
                 <Box sx={{
                   background: '#f8f9fa',
                   borderRadius: 2,
                   p: 2,
                   border: '1px solid #e9ecef'
                 }}>
                   <Typography sx={{ 
                     fontWeight: 600, 
                     color: '#1976d2', 
                     fontSize: 13,
                     mb: 1
                   }}>
                     Message
                   </Typography>
                   <Typography sx={{ 
                     fontWeight: 500, 
                     fontSize: 14, 
                     color: '#333',
                     fontStyle: 'italic',
                     textAlign: 'center'
                   }}>
                     "{selectedBid.message || 'No message provided'}"
                   </Typography>
                 </Box>

                 {/* Negotiation Details - Show if bid is in negotiation */}
                 {selectedBid.status === 'Negotiating' && selectedBid.negotiationDetails && (
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
                     
                     {selectedBid.negotiationDetails.shipperCounterRate && (
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
                           ${selectedBid.negotiationDetails.shipperCounterRate.toLocaleString()}
                         </Typography>
                       </Box>
                     )}

                     {selectedBid.negotiationDetails.shipperNegotiationMessage && (
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
                           fontStyle: 'italic'
                         }}>
                           "{selectedBid.negotiationDetails.shipperNegotiationMessage}"
                         </Typography>
                       </Box>
                     )}

                     {selectedBid.negotiationDetails.truckerResponse && selectedBid.negotiationDetails.truckerResponse !== 'Pending' && (
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
                           color: selectedBid.negotiationDetails.truckerResponse === 'Accepted' ? '#4caf50' : 
                                  selectedBid.negotiationDetails.truckerResponse === 'Rejected' ? '#f44336' : '#ff9800'
                         }}>
                           {selectedBid.negotiationDetails.truckerResponse}
                         </Typography>
                         {selectedBid.negotiationDetails.truckerNegotiationMessage && (
                           <Typography sx={{ 
                             fontWeight: 500, 
                             fontSize: 12, 
                             color: '#333',
                             fontStyle: 'italic',
                             mt: 0.5
                           }}>
                             "{selectedBid.negotiationDetails.truckerNegotiationMessage}"
                           </Typography>
                         )}
                       </Box>
                     )}

                     {selectedBid.negotiationDetails.truckerCounterRate && (
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
                           ${selectedBid.negotiationDetails.truckerCounterRate.toLocaleString()}
                         </Typography>
                       </Box>
                     )}
                   </Box>
                 )}
               </Box>
             )}
           </DialogContent>
          <DialogActions sx={{ p: 2, background: '#f8fafc', justifyContent: 'center' }}>
            <Button 
              onClick={handleCloseBidDetailsModal} 
              variant="outlined" 
              sx={{ 
                borderRadius: 2, 
                fontWeight: 600, 
                px: 3,
                py: 1,
                borderColor: '#1976d2',
                color: '#1976d2',
                '&:hover': {
                  borderColor: '#1565c0',
                  color: '#1565c0'
                }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

      {/* Accept Bid Modal */}
      <Dialog open={acceptModalOpen} onClose={handleCloseAcceptModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1976d2', fontSize: 22, borderBottom: '1px solid #e0e0e0' }}>
          Accept Bid
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 3, background: '#f8fafc' }}>
          <Box component="form" onSubmit={handleAcceptSubmit}>
            <Grid container spacing={2} sx={{ mt: 1.5}}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Status"
                  name="status"
                  value={acceptForm.status}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Shipment Number"
                  name="shipmentNumber"
                  value={acceptForm.shipmentNumber}
                  onChange={handleAcceptFormChange}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  error={!!acceptErrors.shipmentNumber}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Origin Address Line 1"
                  name="origin.addressLine1"
                  value={acceptForm.origin.addressLine1}
                  onChange={handleAcceptFormChange}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  error={!!acceptErrors['origin.addressLine1']}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Origin Address Line 2"
                  name="origin.addressLine2"
                  value={acceptForm.origin.addressLine2}
                  onChange={handleAcceptFormChange}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Destination Address Line 1"
                  name="destination.addressLine1"
                  value={acceptForm.destination.addressLine1}
                  onChange={handleAcceptFormChange}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  error={!!acceptErrors['destination.addressLine1']}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Destination Address Line 2"
                  name="destination.addressLine2"
                  value={acceptForm.destination.addressLine2}
                  onChange={handleAcceptFormChange}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Po Number"
                  name="poNumber"
                  value={acceptForm.poNumber}
                  onChange={handleAcceptFormChange}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  error={!!acceptErrors.poNumber}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Bol Number"
                  name="bolNumber"
                  value={acceptForm.bolNumber}
                  onChange={handleAcceptFormChange}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  error={!!acceptErrors.bolNumber}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Message"
                  name="reason"
                  value={acceptForm.reason}
                  onChange={handleAcceptFormChange}
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={10}
                  placeholder="Write a message..."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, width: '29rem' } }}
                  error={!!acceptErrors.reason}
                />
              </Grid>
            </Grid>
            <DialogActions sx={{ mt: 3, p: 0 }}>
              <Button onClick={handleCloseAcceptModal} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600, color: '#1976d2', borderColor: '#1976d2' }}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 2, fontWeight: 700 }}>Accept</Button>
            </DialogActions>
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
                sx={{ borderRadius: 2, fontWeight: 700, bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
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
            sx={{ 
              borderRadius: 2, 
              fontWeight: 600, 
              px: 3,
              py: 1,
              bgcolor: '#f44336',
              '&:hover': {
                bgcolor: '#d32f2f'
              }
            }}
          >
            Yes, Reject Bid
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Load Modal */}
      <Dialog open={editModalOpen} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1976d2', fontSize: 22, borderBottom: '1px solid #e0e0e0' }}>
          Edit Load
        </DialogTitle>
        <DialogContent sx={{ pb: 4 }}>
          <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 1, px: 2 }}>
            {/* Tab Toggle */}
            <Stack direction="row" spacing={1} sx={{ mb: 3 }} justifyContent="center">
              <Button
                variant={editForm.loadType === 'OTR' ? 'contained' : 'outlined'}
                onClick={() => setEditForm({ ...editForm, loadType: 'OTR', vehicleType: '' })}
                sx={{ borderRadius: 5, minWidth: 120 }}
              >
                OTR
              </Button>
              <Button
                variant={editForm.loadType === 'DRAYAGE' ? 'contained' : 'outlined'}
                onClick={() => setEditForm({ ...editForm, loadType: 'DRAYAGE', vehicleType: '' })}
                sx={{ borderRadius: 5, minWidth: 120 }}
              >
                DRAYAGE
              </Button>
            </Stack>

            {/* Grid Fields */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {/* From City - From State */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="From City"
                  name="fromCity"
                  value={editForm.fromCity}
                  onChange={handleEditFormChange}
                  fullWidth
                  error={!!editErrors.fromCity}
                  sx={{
                    '& .MuiInputBase-root': {
                      borderRadius: '12px',
                      paddingRight: 3,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="From State"
                  name="fromState"
                  value={editForm.fromState}
                  onChange={handleEditFormChange}
                  fullWidth
                  error={!!editErrors.fromState}
                  sx={{
                    '& .MuiInputBase-root': {
                      borderRadius: '12px',
                      paddingRight: 3,
                    },
                  }}
                />
              </Grid>

              {/* To City - To State */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="To City"
                  name="toCity"
                  value={editForm.toCity}
                  onChange={handleEditFormChange}
                  fullWidth
                  error={!!editErrors.toCity}
                  sx={{
                    '& .MuiInputBase-root': {
                      borderRadius: '12px',
                      paddingRight: 3,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="To State"
                  name="toState"
                  value={editForm.toState}
                  onChange={handleEditFormChange}
                  fullWidth
                  error={!!editErrors.toState}
                  sx={{
                    '& .MuiInputBase-root': {
                      borderRadius: '12px',
                      paddingRight: 3,
                    },
                  }}
                />
              </Grid>

              {/* Pickup Date - Drop Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  label="Pickup Date"
                  name="pickupDate"
                  value={editForm.pickupDate}
                  onChange={handleEditFormChange}
                  fullWidth
                  error={!!editErrors.pickupDate}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputBase-root': {
                      borderRadius: '12px',
                      paddingRight: 3,
                    },
                    '& input[type="date"]': {
                      fontSize: '16px',
                      height: '1.4375em',
                      padding: '16.5px 14px',
                      width: '195px',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  label="Drop Date"
                  name="deliveryDate"
                  value={editForm.deliveryDate}
                  onChange={handleEditFormChange}
                  fullWidth
                  error={!!editErrors.deliveryDate}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputBase-root': {
                      borderRadius: '12px',
                      paddingRight: 3,
                    },
                    '& input[type="date"]': {
                      fontSize: '16px',
                      height: '1.4375em',
                      padding: '16.5px 14px',
                      width: '195px',
                    },
                  }}
                />
              </Grid>

              {/* Vehicle Type - Commodity */}
              <Grid item xs={12} sm={8}>
                <FormControl fullWidth error={!!editErrors.vehicleType}>
                  <InputLabel>Vehicle Type</InputLabel>
                  <Select
                    name="vehicleType"
                    value={editForm.vehicleType}
                    onChange={handleEditFormChange}
                    label="Vehicle Type"
                    sx={{
                      borderRadius: '12px',
                      paddingRight: 3,
                      minWidth: 300
                    }}
                  >
                    {(editForm.loadType === 'DRAYAGE' ? DRAYAGE_VEHICLE_TYPES : OTR_VEHICLE_TYPES).map((vehicleType) => (
                      <MenuItem key={vehicleType} value={vehicleType} sx={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                        {vehicleType}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Commodity"
                  name="commodity"
                  value={editForm.commodity}
                  onChange={handleEditFormChange}
                  fullWidth
                  error={!!editErrors.commodity}
                  sx={{
                    '& .MuiInputBase-root': {
                      borderRadius: '12px',
                      paddingRight: 3,
                    },
                  }}
                />
              </Grid>

              {/* Weight (kg) - Container No (Optional) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Weight (kg)"
                  name="weight"
                  value={editForm.weight}
                  onChange={handleEditFormChange}
                  fullWidth
                  error={!!editErrors.weight}
                  sx={{
                    '& .MuiInputBase-root': {
                      borderRadius: '12px',
                      paddingRight: 3,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Container No (Optional)"
                  name="containerNo"
                  value={editForm.containerNo}
                  onChange={handleEditFormChange}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-root': {
                      borderRadius: '12px',
                      paddingRight: 3,
                    },
                  }}
                />
              </Grid>

              {/* PO Number (Optional) - BOL Number (Optional) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="PO Number (Optional)"
                  name="poNumber"
                  value={editForm.poNumber}
                  onChange={handleEditFormChange}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-root': {
                      borderRadius: '12px',
                      paddingRight: 3,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="BOL Number (Optional)"
                  name="bolNumber"
                  value={editForm.bolNumber}
                  onChange={handleEditFormChange}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-root': {
                      borderRadius: '12px',
                      paddingRight: 3,
                    },
                  }}
                />
              </Grid>

              {/* Drayage specific fields */}
              {editForm.loadType === 'DRAYAGE' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="date"
                      label="Return Date"
                      name="returnDate"
                      value={editForm.returnDate || ''}
                      onChange={handleEditFormChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: '12px',
                          paddingRight: 3,
                        },
                        '& input[type="date"]': {
                          fontSize: '16px',
                          height: '1.4375em',
                          padding: '16.5px 14px',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Drayage Location"
                      name="returnLocation"
                      value={editForm.returnLocation || ''}
                      onChange={handleEditFormChange}
                      fullWidth
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: '12px',
                          paddingRight: 3,
                        },
                      }}
                    />
                  </Grid>
                </>
              )}
            </Grid>

            {/* Price */}
            <TextField
              label="Target Rate ($)"
              name="rate"
              value={editForm.rate}
              onChange={handleEditFormChange}
              fullWidth
              error={!!editErrors.rate}
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: '12px',
                  fontSize: '20px',
                  fontWeight: 600,
                  paddingY: 1.5,
                  width: '510px',
                },
                '& input': {
                  textAlign: 'center',
                },
              }}
            />

            {/* Buttons */}
            <DialogActions sx={{ mt: 4, justifyContent: 'center', gap: 1 }}>
              <Button
                onClick={handleCloseEditModal}
                variant="contained"
                disabled={editLoading}
                sx={{
                  borderRadius: 3,
                  backgroundColor: '#f0f0f0',
                  color: '#000',
                  textTransform: 'none',
                  px: 4,
                  '&:hover': { backgroundColor: '#e0e0e0' },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={editLoading}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  px: 4,
                }}
              >
                {editLoading ? 'Updating...' : 'Submit'}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* CMT Agent Details Modal */}
      <Dialog open={cmtModalOpen} onClose={handleCloseCmtModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1976d2', fontSize: 22, borderBottom: '1px solid #e0e0e0' }}>
          CMT Agent Details
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
                      <TableCell sx={{ fontWeight: 500, width: '25%' }}>{cmtData.loadId}</TableCell>
                      <TableCell sx={{ fontWeight: 600, width: '25%', background: '#f8f9fa' }}>Status</TableCell>
                      <TableCell sx={{ width: '25%' }}>
                        <Chip label={cmtData.loadDetails?.status || 'N/A'} color={getStatusColor(cmtData.loadDetails?.status || '')} size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, background: '#f8f9fa' }}>Origin</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {cmtData.loadDetails?.origins && cmtData.loadDetails.origins.length > 0 ? 
                          `${cmtData.loadDetails.origins[0].city}, ${cmtData.loadDetails.origins[0].state}` : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, background: '#f8f9fa' }}>Destination</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {cmtData.loadDetails?.destinations && cmtData.loadDetails.destinations.length > 0 ? 
                          `${cmtData.loadDetails.destinations[0].city}, ${cmtData.loadDetails.destinations[0].state}` : 
                          'N/A'
                        }
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, background: '#f8f9fa' }}>Weight</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{cmtData.loadDetails?.weight} Kg</TableCell>
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
                        <TableCell sx={{ fontWeight: 600, width: '25%', background: '#e8f5e8' }}>Alias Name</TableCell>
                        <TableCell sx={{ fontWeight: 500, fontSize: 16, color: '#2e7d32', width: '25%' }}>
                          {cmtData.cmtAssignment.assignedCMTUser?.displayName || cmtData.cmtAssignment.assignedCMTUser?.aliasName || 'N/A'}
                        </TableCell>
                        
                        
                      </TableRow>
                     
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, background: '#e8f5e8' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{cmtData.cmtAssignment.assignedCMTUser?.email || 'N/A'}</TableCell>
                        
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
    </Box>
  );
};

export default LoadBoard;
