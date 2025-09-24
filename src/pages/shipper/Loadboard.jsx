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
  InputLabel
} from '@mui/material';
import { Add, Refresh, Clear } from '@mui/icons-material';
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

const LoadBoard = () => {
  const location = useLocation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadType, setLoadType] = useState('OTR');
  const [searchTerm, setSearchTerm] = useState('');
  const [originalLoadData, setOriginalLoadData] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  const [form, setForm] = useState({
    fromCity: '',
    fromState: '',
    toCity: '',
    toState: '',
    pickupDate: '',
    dropDate: '',
    vehicleType: '',
    commodity: '',
    weight: '',
    containerNo: '',
    poNumber: '',
    bolNumber: '',
    price: '',
    returnDate: '',
    drayageLocation: '',
    rateType: '',
    bidDeadline: '',
    loadType: '',
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
    drayageLocation: ''
  });
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);

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
    setForm({ ...form, loadType: loadType, rateType: 'Flat Rate' });
  };
  const handleCloseModal = () => setModalOpen(false);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLoadTypeChange = (type) => {
    setLoadType(type);
    setForm({ ...form, loadType: type });
  };

  const handleSubmit = async (e) => {
    // alert('Form submit triggered');
    console.log('Form submit triggered', form);
    e.preventDefault();
    const newErrors = {};
    // Required fields ki list bana le, loadType ke hisaab se
    const requiredFields = [
      'weight', 'vehicleType', 'commodity', 'fromCity', 'fromState', 'toCity', 'toState', 'pickupDate', 'dropDate', 'price'
    ];
    requiredFields.forEach(field => {
      if (!form[field]) newErrors[field] = true;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      // Map form data to API fields
      const payload = {
        fromAddressLine1: form.fromCity,
        fromAddressLine2: '',
        fromCity: form.fromCity,
        fromState: form.fromState,
        toAddressLine1: form.toCity,
        toAddressLine2: '',
        toCity: form.toCity,
        toState: form.toState,
        weight: Number(form.weight),
        commodity: form.commodity,
        vehicleType: form.vehicleType,
        pickupDate: form.pickupDate,
        deliveryDate: form.dropDate,
        rate: Number(form.price),
        rateType: form.rateType,
        bidDeadline: form.bidDeadline,
        loadType: form.loadType,
        containerNo: form.containerNo || '',
        poNumber: form.poNumber || '',
        bolNumber: form.bolNumber || ''
      };
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
           fromCity: '',
           fromState: '',
           toCity: '',
           toState: '',
           pickupDate: '',
           dropDate: '',
           vehicleType: '',
           commodity: '',
           weight: '',
           containerNo: '',
           poNumber: '',
           bolNumber: '',
           price: '',
           returnDate: '',
           drayageLocation: '',
           rateType: '',
           bidDeadline: '',
           loadType: '',
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
         if (data && data.loads && Array.isArray(data.loads)) {
           setLoadData(data.loads);
         } else if (Array.isArray(data)) {
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
      fromCity: load.origin?.city || '',
      fromState: load.origin?.state || '',
      toCity: load.destination?.city || '',
      toState: load.destination?.state || '',
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
      drayageLocation: load.drayageLocation || ''
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
      drayageLocation: ''
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
        fromCity: editForm.fromCity,
        fromState: editForm.fromState,
        toCity: editForm.toCity,
        toState: editForm.toState,
        pickupDate: new Date(editForm.pickupDate).toISOString(),
        deliveryDate: new Date(editForm.deliveryDate).toISOString(),
        weight: editForm.weight,
        commodity: editForm.commodity,
        vehicleType: editForm.vehicleType,
        rate: editForm.rate,
        rateType: editForm.rateType,
        loadType: editForm.loadType,
        containerNo: editForm.containerNo,
        poNumber: editForm.poNumber,
        bolNumber: editForm.bolNumber,
        notes: editForm.notes
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
  const filteredData = loadData.filter((row) =>
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
                     <TableCell>{(load.origin && load.origin.city) ? load.origin.city : '-'}</TableCell>
                     <TableCell>{(load.destination && load.destination.city) ? load.destination.city : '-'}</TableCell>
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
                            disabled={load.status !== 'Posted'}
                            sx={{
                              opacity: load.status !== 'Posted' ? 0.5 : 1,
                              cursor: load.status !== 'Posted' ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            onClick={() => handleRefreshLoad(load._id)}
                            disabled={load.status !== 'Posted'}
                            sx={{
                              minWidth: 'auto',
                              px: 1,
                              opacity: load.status !== 'Posted' ? 0.5 : 1,
                              cursor: load.status !== 'Posted' ? 'not-allowed' : 'pointer'
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
          count={loadData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 15, 20]}
        />
      </Paper>

      {/* Modal Form */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogContent sx={{ pb: 4 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, px: 2 }}>
                         {/* Tab Toggle */}
             <Stack direction="row" spacing={1} sx={{ mb: 3 }} justifyContent="center">
               <Button
                 variant={loadType === 'OTR' ? 'contained' : 'outlined'}
                 onClick={() => handleLoadTypeChange('OTR')}
                 sx={{ borderRadius: 5, minWidth: 120 }}
               >
                 OTR
               </Button>
               <Button
                 variant={loadType === 'Drayage' ? 'contained' : 'outlined'}
                 onClick={() => handleLoadTypeChange('Drayage')}
                 sx={{ borderRadius: 5, minWidth: 120 }}
               >
                 Drayage
               </Button>
             </Stack>

            {/* Grid Fields */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {/* From City - From State */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="From City"
                  name="fromCity"
                  value={form.fromCity}
                  onChange={handleFormChange}
                  fullWidth
                  error={!!errors.fromCity}
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
                  value={form.fromState}
                  onChange={handleFormChange}
                  fullWidth
                  error={!!errors.fromState}
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
                  value={form.toCity}
                  onChange={handleFormChange}
                  fullWidth
                  error={!!errors.toCity}
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
                  value={form.toState}
                  onChange={handleFormChange}
                  fullWidth
                  error={!!errors.toState}
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
                  value={form.pickupDate}
                  onChange={handleFormChange}
                  fullWidth
                  error={!!errors.pickupDate}
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
                  name="dropDate"
                  value={form.dropDate}
                  onChange={handleFormChange}
                  fullWidth
                  error={!!errors.dropDate}
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
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Vehicle Type"
                  name="vehicleType"
                  value={form.vehicleType}
                  onChange={handleFormChange}
                  fullWidth
                  error={!!errors.vehicleType}
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
                  label="Commodity"
                  name="commodity"
                  value={form.commodity}
                  onChange={handleFormChange}
                  fullWidth
                  error={!!errors.commodity}
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
                  value={form.weight}
                  onChange={handleFormChange}
                  fullWidth
                  error={!!errors.weight}
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
                  value={form.containerNo}
                  onChange={handleFormChange}
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
                  value={form.poNumber}
                  onChange={handleFormChange}
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
                  value={form.bolNumber}
                  onChange={handleFormChange}
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
              {loadType === 'Drayage' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="date"
                      label="Return Date"
                      name="returnDate"
                      value={form.returnDate}
                      onChange={handleFormChange}
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
                      name="drayageLocation"
                      value={form.drayageLocation}
                      onChange={handleFormChange}
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
              label="Expected Price"
              name="price"
              value={form.price}
              onChange={handleFormChange}
              fullWidth
              // required hata diya
              error={!!errors.price}
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
                onClick={handleCloseModal}
                variant="contained"
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
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  px: 4,
                }}
              >
                Submit
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Bids Modal */}
      <Dialog open={bidsModalOpen} onClose={handleCloseBidsModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1976d2', fontSize: 22, borderBottom: '1px solid #e0e0e0' }}>
          Bids for Load
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 3, background: '#fff' }}>
          {bidsLoading ? (
            <Typography align="center" sx={{ my: 4 }}>Loading...</Typography>
          ) : bids.length === 0 ? (
            <Typography align="center" sx={{ my: 4 }}>No bids found for this load.</Typography>
          ) : (
                         <Grid container spacing={2} sx={{ minHeight: 300, mt: 2 }}>
               {bids.map((bid, i) => (
                 <Grid item xs={12} sm={6} md={4} key={bid._id || i}>
                   <Box sx={{
                     background: '#fff',
                     borderRadius: 3,
                     boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                     p: 2.5,
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     minHeight: 200,
                     border: '2px solid #e3f2fd',
                     transition: 'all 0.3s ease',
                     '&:hover': {
                       transform: 'translateY(-4px)',
                       boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)',
                       borderColor: '#1976d2'
                     }
                   }}>
                     {/* Bid Number */}
                     <Box sx={{
                       position: 'absolute',
                       top: 8,
                       right: 8,
                       background: '#1976d2',
                       color: '#fff',
                       borderRadius: '50%',
                       width: 28,
                       height: 28,
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       fontSize: 12,
                       fontWeight: 600
                     }}>
                       {i + 1}
                     </Box>

                                           {/* Avatar */}
                      <Avatar
                        src={bid.bidder?.avatar || ''}
                        alt="Driver"
                        sx={{ 
                          width: 50, 
                          height: 50, 
                          mb: 1.5,
                          bgcolor: '#e3f2fd',
                          color: '#1976d2',
                          border: '2px solid #1976d2'
                        }}
                      >
                        {bid.driver?.name ?
                          (bid.driver.name.split(' ').map(w => w[0]).join('').toUpperCase()) :
                          <PersonIcon sx={{ fontSize: 24, color: '#1976d2' }} />
                        }
                      </Avatar>

                     {/* Driver Name */}
                     <Typography sx={{ 
                       fontWeight: 600, 
                       fontSize: 15, 
                       mb: 0.5, 
                       textAlign: 'center',
                       color: '#333'
                     }}>
                       {bid.driver?.name || bid.driverName || 'Driver'}
                     </Typography>
                     
                     {/* Vehicle Number */}
                     <Typography sx={{ 
                       fontWeight: 500, 
                       fontSize: 12, 
                       mb: 1.5, 
                       textAlign: 'center', 
                       color: '#666'
                     }}>
                       🚛 {bid.vehicle?.number || bid.vehicleNumber || 'N/A'}
                     </Typography>

                     {/* Price */}
                     <Box sx={{
                       background: '#f8f9fa',
                       borderRadius: 2,
                       p: 1.5,
                       mb: 2,
                       width: '100%',
                       textAlign: 'center',
                       border: '1px solid #e9ecef'
                     }}>
                       <Typography sx={{ 
                         fontWeight: 600, 
                         fontSize: 11, 
                         color: '#666',
                         mb: 0.5,
                         textTransform: 'uppercase'
                       }}>
                         Bid Amount
                       </Typography>
                       <Typography sx={{ 
                         fontWeight: 700, 
                         fontSize: 20, 
                         color: '#1976d2'
                       }}>
                         ${bid.intermediateRate?.toLocaleString() || '-'}
                       </Typography>
                     </Box>

                     {/* Action Buttons */}
                     <Box sx={{ 
                       display: 'flex', 
                       gap: 1, 
                       width: '100%', 
                       justifyContent: 'center'
                     }}>
                       <Button
                         variant="contained"
                         size="small"
                         sx={{ 
                           borderRadius: 2, 
                           fontWeight: 600, 
                           px: 2, 
                           py: 0.5,
                           textTransform: 'none', 
                           fontSize: 12,
                           bgcolor: '#4caf50',
                           '&:hover': {
                             bgcolor: '#388e3c'
                           }
                         }}
                         onClick={() => handleAcceptBid(bid)}
                       >
                         Accept
                       </Button>
                       <Button
                         variant="outlined"
                         size="small"
                         sx={{ 
                           borderRadius: 2, 
                           fontWeight: 600, 
                           px: 2, 
                           py: 0.5,
                           textTransform: 'none', 
                           fontSize: 12,
                           borderColor: '#1976d2',
                           color: '#1976d2',
                           '&:hover': { 
                             borderColor: '#0d47a1', 
                             color: '#0d47a1'
                           }
                         }}
                         onClick={() => handleViewBidDetails(bid)}
                       >
                         Details
                       </Button>
                     </Box>
                   </Box>
                 </Grid>
               ))}
             </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, background: '#fff' }}>
          <Button onClick={handleCloseBidsModal} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600, color: '#1976d2', borderColor: '#1976d2' }}>Close</Button>
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
               </Box>
             )}
           </DialogContent>
          <DialogActions sx={{ p: 2, background: '#f8fafc', justifyContent: 'center' }}>
            <Button 
              onClick={handleCloseBidDetailsModal} 
              variant="contained" 
              sx={{ 
                borderRadius: 2, 
                fontWeight: 600, 
                px: 3,
                py: 1,
                bgcolor: '#1976d2',
                '&:hover': {
                  bgcolor: '#1565c0'
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
                onClick={() => setEditForm({ ...editForm, loadType: 'OTR' })}
                sx={{ borderRadius: 5, minWidth: 120 }}
              >
                OTR
              </Button>
              <Button
                variant={editForm.loadType === 'Drayage' ? 'contained' : 'outlined'}
                onClick={() => setEditForm({ ...editForm, loadType: 'Drayage' })}
                sx={{ borderRadius: 5, minWidth: 120 }}
              >
                Drayage
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
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Vehicle Type"
                  name="vehicleType"
                  value={editForm.vehicleType}
                  onChange={handleEditFormChange}
                  fullWidth
                  error={!!editErrors.vehicleType}
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
              {editForm.loadType === 'Drayage' && (
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
                      name="drayageLocation"
                      value={editForm.drayageLocation || ''}
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
              label="Expected Price"
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
    </Box>
  );
};

export default LoadBoard;
