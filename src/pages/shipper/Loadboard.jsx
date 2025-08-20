import { useEffect, useState } from 'react';
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
import { Add } from '@mui/icons-material';
import { Download, Search } from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';

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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadType, setLoadType] = useState('OTR');
  const [searchTerm, setSearchTerm] = useState('');

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
        } else if (Array.isArray(data)) {
          setLoadData(data);
        } else {
          setLoadData([]);
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
        <Typography variant="h5" fontWeight={700}>
          Load Board
        </Typography>
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
                .map((load, i) => (
                                     <TableRow key={load._id} hover>
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
                      </TableCell>
                   </TableRow>
                ))
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
            <Grid container spacing={3} sx={{ minHeight: 400, alignItems: 'center', justifyContent: 'center' }}>
              {bids.map((bid, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={bid._id || i}>
                  <Box sx={{
                    background: '#eaf4fb',
                    borderRadius: 4,
                    boxShadow: '0 2px 12px rgba(25, 118, 210, 0.08)',
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: 260,
                  }}>
                    <Avatar
                      src={bid.bidder?.avatar || ''}
                      alt="Trucker"
                      sx={{ width: 70, height: 70, mb: 2, fontSize: 32, bgcolor: '#fff', color: '#1976d2', border: '2px solid #fff', boxShadow: 1 }}
                    >
                      {bid.carrier?.compName ?
                        (bid.carrier.compName.split(' ').map(w => w[0]).join('').toUpperCase()) :
                        <PersonIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                      }
                    </Avatar>
                    <Typography sx={{ fontWeight: 600, fontSize: 18, mb: 0.5, textAlign: 'center' }}>
                      {bid.driver?.name || bid.driverName || 'Driver'}
                    </Typography>
                    <Typography sx={{ fontWeight: 500, fontSize: 14, mb: 1, textAlign: 'center', color: '#666' }}>
                      ({bid.vehicle?.number || bid.vehicleNumber || 'N/A'})
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: 20, mb: 2, color: '#222', textAlign: 'center' }}>
                      ${bid.intermediateRate?.toLocaleString() || '-'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'center', mt: 'auto' }}>
                      <Button
                        variant="contained"
                        color="success"
                        sx={{ borderRadius: 3, fontWeight: 600, px: 3, textTransform: 'none', fontSize: 15 }}
                        onClick={() => handleAcceptBid(bid)}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outlined"
                        sx={{ borderRadius: 3, fontWeight: 600, px: 3, textTransform: 'none', fontSize: 15, borderColor: '#222', color: '#222', '&:hover': { borderColor: '#1976d2', color: '#1976d2' } }}
                        onClick={() => handleViewBidDetails(bid)}
                      >
                        View details
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
      <Dialog open={bidDetailsModalOpen} onClose={handleCloseBidDetailsModal} maxWidth="xs" fullWidth PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 8,
          background: '#f8fafc',
        }
      }}>
        <DialogTitle sx={{
          fontWeight: 700,
          color: '#1976d2',
          fontSize: 24,
          background: 'linear-gradient(90deg, #e3f0ff 60%, #dbeafe 100%)',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          py: 3,
          textAlign: 'center',
          letterSpacing: 1,
        }}>
          Bid Details
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 3, background: '#f8fafc' }}>
          {selectedBid && (
            <Box sx={{
              background: '#fff',
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(25, 118, 210, 0.08)',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'flex-start',
              minWidth: 320,
            }}>
                             <Box sx={{ mb: 2, width: '100%' }}>
                                 <Typography sx={{ fontWeight: 600, color: '#1976d2', fontSize: 16 }}>Driver Name</Typography>
                 <Typography sx={{ fontWeight: 500, fontSize: 16, color: '#333', mt: 0.5 }}>{selectedBid.driver?.name || selectedBid.driverName || '-'}</Typography>
              </Box>
              <Box sx={{ mb: 2, width: '100%' }}>
                <Typography sx={{ fontWeight: 600, color: '#1976d2', fontSize: 16 }}>Vehicle Number</Typography>
                <Typography sx={{ fontWeight: 500, fontSize: 16, color: '#333', mt: 0.5 }}>{selectedBid.vehicle?.number || selectedBid.vehicleNumber || '-'}</Typography>
              </Box>
              <Box sx={{ mb: 2, width: '100%' }}>
                <Typography sx={{ fontWeight: 600, color: '#1976d2', fontSize: 16 }}>Message</Typography>
                <Typography sx={{ fontWeight: 500, fontSize: 16, color: '#333', mt: 0.5 }}>{selectedBid.message || '-'}</Typography>
              </Box>
              <Box sx={{ mb: 2, width: '100%' }}>
                <Typography sx={{ fontWeight: 600, color: '#1976d2', fontSize: 16 }}>Pickup ETA</Typography>
                <Typography sx={{ fontWeight: 500, fontSize: 16, color: '#333', mt: 0.5 }}>{selectedBid.estimatedPickupDate ? new Date(selectedBid.estimatedPickupDate).toLocaleString() : '-'}</Typography>
              </Box>
              <Box sx={{ width: '100%' }}>
                <Typography sx={{ fontWeight: 600, color: '#1976d2', fontSize: 16 }}>Drop ETA</Typography>
                <Typography sx={{ fontWeight: 500, fontSize: 16, color: '#333', mt: 0.5 }}>{selectedBid.estimatedDeliveryDate ? new Date(selectedBid.estimatedDeliveryDate).toLocaleString() : '-'}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, background: '#f8fafc', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
          <Button onClick={handleCloseBidDetailsModal} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600, color: '#1976d2', borderColor: '#1976d2' }}>Close</Button>
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
    </Box>
  );
};

export default LoadBoard;
