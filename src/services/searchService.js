import { BASE_API_URL } from '../apiConfig';

class SearchService {
  constructor() {
    this.baseURL = BASE_API_URL;
  }

  // Get authentication token
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Generic API call method
  async makeAPICall(endpoint, options = {}) {
    const token = this.getAuthToken();
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...defaultOptions,
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Search shipments/loads
  async searchShipments(query) {
    try {
      const data = await this.makeAPICall('/api/v1/load/shipper/my-loads-detailed');
      
      if (!data.success || !data.data.loads) {
        return [];
      }

      // Process API data
      const apiResults = data.data.loads
        .filter(load => 
          load.shipmentNumber?.toLowerCase().includes(query.toLowerCase()) ||
          load.origin?.city?.toLowerCase().includes(query.toLowerCase()) ||
          load.origin?.state?.toLowerCase().includes(query.toLowerCase()) ||
          load.destination?.city?.toLowerCase().includes(query.toLowerCase()) ||
          load.destination?.state?.toLowerCase().includes(query.toLowerCase()) ||
          load.commodity?.toLowerCase().includes(query.toLowerCase()) ||
          load.status?.toLowerCase().includes(query.toLowerCase()) ||
          load.loadType?.toLowerCase().includes(query.toLowerCase()) ||
          load.vehicleType?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8)
        .map(load => ({
          id: load._id,
          type: 'shipments',
          title: `Shipment ${load.shipmentNumber}`,
          subtitle: `${load.origin?.city}, ${load.origin?.state} → ${load.destination?.city}, ${load.destination?.state}`,
          status: load.status,
          rate: load.rate,
          pickupDate: load.pickupDate,
          deliveryDate: load.deliveryDate,
          commodity: load.commodity,
          weight: load.weight,
          loadType: load.loadType,
          vehicleType: load.vehicleType,
          driverName: load.acceptedBid?.driverName,
          vehicleNumber: load.acceptedBid?.vehicleNumber,
          shipmentNumber: load.shipmentNumber,
          // Additional searchable fields
          searchableText: [
            load.shipmentNumber,
            load.origin?.city,
            load.origin?.state,
            load.destination?.city,
            load.destination?.state,
            load.commodity,
            load.status,
            load.loadType,
            load.vehicleType,
            load.acceptedBid?.driverName,
            load.acceptedBid?.vehicleNumber,
          ].filter(Boolean).join(' ').toLowerCase(),
        }));

      // Add mock data for cross-module testing if API results are limited
      const mockShipments = [
        {
          id: 'MOCK_LD0331',
          type: 'shipments',
          title: 'Shipment LD0331',
          subtitle: 'Houston, TX → Dallas, TX',
          status: 'In Transit',
          rate: 4500,
          pickupDate: '2024-01-15',
          deliveryDate: '2024-01-20',
          commodity: 'Electronics',
          weight: 1500,
          loadType: 'OTR',
          vehicleType: 'Dry Van',
          shipmentNumber: 'LD0331',
          searchableText: 'shipment ld0331 houston tx dallas tx electronics in transit otr dry van',
        },
        {
          id: 'MOCK_SHP1806011',
          type: 'shipments',
          title: 'Shipment SHP1806011',
          subtitle: 'Jenkins Township, PA → Fresno, CA',
          status: 'Posted',
          rate: 2900,
          pickupDate: '2024-01-18',
          deliveryDate: '2024-01-25',
          commodity: 'Furniture',
          weight: 2000,
          loadType: 'OTR',
          vehicleType: 'Flatbed',
          shipmentNumber: 'SHP1806011',
          searchableText: 'shipment shp1806011 jenkins township pa fresno ca furniture posted otr flatbed',
        }
      ];

      // Filter mock data based on query
      const filteredMockResults = mockShipments.filter(shipment =>
        shipment.searchableText.includes(query.toLowerCase()) ||
        shipment.title.toLowerCase().includes(query.toLowerCase()) ||
        shipment.subtitle.toLowerCase().includes(query.toLowerCase())
      );

      return [...apiResults, ...filteredMockResults].slice(0, 8);
    } catch (error) {
      console.error('Error searching shipments:', error);
      return [];
    }
  }

  // Search bills (mock data for now - replace with actual API when available)
  async searchBills(query) {
    try {
      // Mock bill data - replace with actual API call
      const mockBills = [
        {
          id: 'BILL001',
          billNumber: 'BILL001',
          title: 'Invoice #BILL001',
          subtitle: 'JBL Logistics → Client A',
          amount: 2500,
          status: 'Pending',
          dueDate: '2024-01-15',
          clientName: 'Client A',
          type: 'bills',
          searchableText: 'bill001 invoice jbl logistics client a pending 2500',
        },
        {
          id: 'BILL002',
          billNumber: 'BILL002',
          title: 'Invoice #BILL002',
          subtitle: 'JBL Logistics → Client B',
          amount: 3200,
          status: 'Overdue',
          dueDate: '2024-01-10',
          clientName: 'Client B',
          type: 'bills',
          searchableText: 'bill002 invoice jbl logistics client b overdue 3200',
        },
        {
          id: 'BILL003',
          billNumber: 'BILL003',
          title: 'Invoice #BILL003',
          subtitle: 'JBL Logistics → Client C',
          amount: 1800,
          status: 'Paid',
          dueDate: '2024-01-05',
          clientName: 'Client C',
          type: 'bills',
          searchableText: 'bill003 invoice jbl logistics client c paid 1800',
        },
        {
          id: 'BILL004',
          billNumber: 'TEST-BILL',
          title: 'Test Invoice #TEST-BILL',
          subtitle: 'Test Company → Test Client',
          amount: 1000,
          status: 'Pending',
          dueDate: '2024-01-30',
          clientName: 'Test Client',
          type: 'bills',
          searchableText: 'test-bill test invoice test company test client pending 1000',
        },
      ];

      return mockBills.filter(bill =>
        bill.searchableText.includes(query.toLowerCase()) ||
        bill.title.toLowerCase().includes(query.toLowerCase()) ||
        bill.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        bill.status.toLowerCase().includes(query.toLowerCase()) ||
        bill.clientName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    } catch (error) {
      console.error('Error searching bills:', error);
      return [];
    }
  }

  // Search users (mock data for now - replace with actual API when available)
  async searchUsers(query) {
    try {
      const mockUsers = [
        {
          id: 'USER001',
          name: 'John Smith',
          title: 'John Smith',
          subtitle: 'Shipper - Houston, TX',
          email: 'john@example.com',
          phone: '+1-555-0123',
          role: 'Shipper',
          location: 'Houston, TX',
          type: 'users',
          searchableText: 'john smith shipper houston tx john@example.com',
        },
        {
          id: 'USER002',
          name: 'Sarah Johnson',
          title: 'Sarah Johnson',
          subtitle: 'Trucker - Dallas, TX',
          email: 'sarah@example.com',
          phone: '+1-555-0124',
          role: 'Trucker',
          location: 'Dallas, TX',
          type: 'users',
          searchableText: 'sarah johnson trucker dallas tx sarah@example.com',
        },
        {
          id: 'USER003',
          name: 'Mike Davis',
          title: 'Mike Davis',
          subtitle: 'Admin - Austin, TX',
          email: 'mike@example.com',
          phone: '+1-555-0125',
          role: 'Admin',
          location: 'Austin, TX',
          type: 'users',
          searchableText: 'mike davis admin austin tx mike@example.com',
        },
      ];

      return mockUsers.filter(user =>
        user.searchableText.includes(query.toLowerCase()) ||
        user.title.toLowerCase().includes(query.toLowerCase()) ||
        user.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.role.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  // Search drivers (mock data for now - replace with actual API when available)
  async searchDrivers(query) {
    try {
      const mockDrivers = [
        {
          id: 'DRV001',
          name: 'Mike Wilson',
          title: 'Mike Wilson',
          subtitle: 'CDL Class A - 5 years experience',
          licenseNumber: 'CDL123456',
          phone: '+1-555-0125',
          cdlClass: 'Class A',
          experience: '5 years',
          status: 'Active',
          type: 'drivers',
          searchableText: 'mike wilson cdl class a 5 years experience cdl123456 active',
        },
        {
          id: 'DRV002',
          name: 'David Brown',
          title: 'David Brown',
          subtitle: 'CDL Class B - 3 years experience',
          licenseNumber: 'CDL789012',
          phone: '+1-555-0126',
          cdlClass: 'Class B',
          experience: '3 years',
          status: 'Active',
          type: 'drivers',
          searchableText: 'david brown cdl class b 3 years experience cdl789012 active',
        },
        {
          id: 'DRV003',
          name: 'Robert Taylor',
          title: 'Robert Taylor',
          subtitle: 'CDL Class A - 8 years experience',
          licenseNumber: 'CDL345678',
          phone: '+1-555-0127',
          cdlClass: 'Class A',
          experience: '8 years',
          status: 'On Leave',
          type: 'drivers',
          searchableText: 'robert taylor cdl class a 8 years experience cdl345678 on leave',
        },
      ];

      return mockDrivers.filter(driver =>
        driver.searchableText.includes(query.toLowerCase()) ||
        driver.title.toLowerCase().includes(query.toLowerCase()) ||
        driver.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        driver.licenseNumber.toLowerCase().includes(query.toLowerCase()) ||
        driver.cdlClass.toLowerCase().includes(query.toLowerCase()) ||
        driver.status.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    } catch (error) {
      console.error('Error searching drivers:', error);
      return [];
    }
  }

  // Search fleet (mock data for now - replace with actual API when available)
  async searchFleet(query) {
    try {
      const mockFleet = [
        {
          id: 'TRK001',
          vehicleNumber: 'TRK001',
          title: 'Truck #TRK001',
          subtitle: 'Freightliner Cascadia - 2020',
          licensePlate: 'TX-ABC123',
          make: 'Freightliner',
          model: 'Cascadia',
          year: '2020',
          status: 'Active',
          type: 'fleet',
          searchableText: 'truck trk001 freightliner cascadia 2020 tx-abc123 active',
        },
        {
          id: 'TRK002',
          vehicleNumber: 'TRK002',
          title: 'Truck #TRK002',
          subtitle: 'Peterbilt 579 - 2019',
          licensePlate: 'TX-DEF456',
          make: 'Peterbilt',
          model: '579',
          year: '2019',
          status: 'Maintenance',
          type: 'fleet',
          searchableText: 'truck trk002 peterbilt 579 2019 tx-def456 maintenance',
        },
        {
          id: 'TRK003',
          vehicleNumber: 'TRK003',
          title: 'Truck #TRK003',
          subtitle: 'Volvo VNL - 2021',
          licensePlate: 'TX-GHI789',
          make: 'Volvo',
          model: 'VNL',
          year: '2021',
          status: 'Active',
          type: 'fleet',
          searchableText: 'truck trk003 volvo vnl 2021 tx-ghi789 active',
        },
      ];

      return mockFleet.filter(vehicle =>
        vehicle.searchableText.includes(query.toLowerCase()) ||
        vehicle.title.toLowerCase().includes(query.toLowerCase()) ||
        vehicle.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        vehicle.licensePlate.toLowerCase().includes(query.toLowerCase()) ||
        vehicle.make.toLowerCase().includes(query.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(query.toLowerCase()) ||
        vehicle.status.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    } catch (error) {
      console.error('Error searching fleet:', error);
      return [];
    }
  }

  // Search reports (mock data for now - replace with actual API when available)
  async searchReports(query) {
    try {
      const mockReports = [
        {
          id: 'RPT001',
          title: 'Monthly Delivery Report',
          subtitle: 'January 2024 - Delivery Performance',
          reportType: 'Delivery Report',
          date: '2024-01-31',
          status: 'Completed',
          type: 'reports',
          searchableText: 'monthly delivery report january 2024 delivery performance completed',
        },
        {
          id: 'RPT002',
          title: 'Fleet Utilization Report',
          subtitle: 'Q1 2024 - Fleet Performance',
          reportType: 'Fleet Report',
          date: '2024-03-31',
          status: 'In Progress',
          type: 'reports',
          searchableText: 'fleet utilization report q1 2024 fleet performance in progress',
        },
        {
          id: 'RPT003',
          title: 'Financial Summary',
          subtitle: '2024 - Revenue & Expenses',
          reportType: 'Financial Report',
          date: '2024-12-31',
          status: 'Pending',
          type: 'reports',
          searchableText: 'financial summary 2024 revenue expenses pending',
        },
      ];

      return mockReports.filter(report =>
        report.searchableText.includes(query.toLowerCase()) ||
        report.title.toLowerCase().includes(query.toLowerCase()) ||
        report.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        report.type.toLowerCase().includes(query.toLowerCase()) ||
        report.status.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    } catch (error) {
      console.error('Error searching reports:', error);
      return [];
    }
  }

  // Find cross-module duplicates (same item in different modules)
  findCrossModuleDuplicates(allResults) {
    const duplicates = {};
    const processed = new Set();
    
    allResults.forEach(result => {
      const key = this.generateDuplicateKey(result);
      if (key && !processed.has(key)) {
        const matches = allResults.filter(r => this.generateDuplicateKey(r) === key);
        if (matches.length > 1) {
          duplicates[key] = matches;
          matches.forEach(match => processed.add(this.generateDuplicateKey(match)));
        }
      }
    });
    
    return duplicates;
  }

  // Generate a key to identify potential duplicates across modules
  generateDuplicateKey(result) {
    // Extract searchable text from title and subtitle
    const searchableText = `${result.title || ''} ${result.subtitle || ''}`.toLowerCase();
    
    // For shipments - use shipment number or extract from title
    if (result.type === 'shipments') {
      if (result.shipmentNumber) {
        return `shipment_${result.shipmentNumber.toLowerCase()}`;
      }
      // Extract shipment number from title like "Shipment LD0331"
      const shipmentMatch = searchableText.match(/shipment\s+([a-z0-9]+)/i);
      if (shipmentMatch) {
        return `shipment_${shipmentMatch[1].toLowerCase()}`;
      }
    }
    
    // For bills - use bill number or extract from title
    if (result.type === 'bills') {
      if (result.billNumber) {
        return `bill_${result.billNumber.toLowerCase()}`;
      }
      // Extract bill number from title
      const billMatch = searchableText.match(/invoice\s+#?([a-z0-9]+)/i);
      if (billMatch) {
        return `bill_${billMatch[1].toLowerCase()}`;
      }
    }
    
    // For users - use name and email
    if (result.type === 'users' && result.name && result.email) {
      return `user_${result.name.toLowerCase()}_${result.email.toLowerCase()}`;
    }
    
    // For drivers - use name and license
    if (result.type === 'drivers' && result.name && result.licenseNumber) {
      return `driver_${result.name.toLowerCase()}_${result.licenseNumber.toLowerCase()}`;
    }
    
    // For fleet - use vehicle number
    if (result.type === 'fleet' && result.vehicleNumber) {
      return `fleet_${result.vehicleNumber.toLowerCase()}`;
    }
    
    // Generic fallback - use title for cross-module matching
    if (result.title) {
      // Extract common identifiers from title
      const commonIdMatch = result.title.match(/([A-Z]{2,}\d+|[A-Z]+\d+)/);
      if (commonIdMatch) {
        return `common_${commonIdMatch[1].toLowerCase()}`;
      }
    }
    
    return null;
  }

  // Main search method that combines all search results
  async performUniversalSearch(query) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const trimmedQuery = query.trim().toLowerCase();
    
    try {
      // Execute all search functions in parallel
      const searchPromises = [
        this.searchShipments(trimmedQuery),
        this.searchBills(trimmedQuery),
        this.searchUsers(trimmedQuery),
        this.searchDrivers(trimmedQuery),
        this.searchFleet(trimmedQuery),
        this.searchReports(trimmedQuery),
      ];

      const results = await Promise.allSettled(searchPromises);
      
      // Combine all successful results
      const allResults = [];
      results.forEach((result) => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          allResults.push(...result.value);
        }
      });

      
      
      // Create cross-module duplicates for shipments (Loadboard + Consignment)
      const crossModuleResults = [];
      allResults.forEach(result => {
        if (result.type === 'shipments') {
          // Only add cross-module versions, don't keep original
          // Add Loadboard version
          crossModuleResults.push({
            ...result,
            id: `${result.id}_loadboard`,
            type: 'shipments',
            moduleInfo: this.getModuleInfo('shipments', 'shipper'),
            isDuplicate: true,
            moduleType: 'loadboard'
          });
          
          // Add Consignment version
          crossModuleResults.push({
            ...result,
            id: `${result.id}_consignment`,
            type: 'shipments',
            moduleInfo: this.getModuleInfo('shipments', 'trucker'),
            isDuplicate: true,
            moduleType: 'consignment'
          });
        } else {
          // Keep other results as is
          crossModuleResults.push({
            ...result,
            moduleInfo: this.getModuleInfo(result.type),
            isDuplicate: false
          });
        }
      });

      // Group cross-module duplicates properly
      const enhancedResults = crossModuleResults.map(result => {
        if (result.isDuplicate && result.type === 'shipments') {
          // Find the other module version of the same shipment
          const duplicateGroup = crossModuleResults.filter(r => 
            r.isDuplicate && 
            r.type === 'shipments' && 
            r.id !== result.id &&
            r.title === result.title // Same shipment title
          );
          return {
            ...result,
            duplicateGroup: duplicateGroup
          };
        }
        return {
          ...result,
          duplicateGroup: null
        };
      });

      // Sort results by relevance
      return this.sortResultsByRelevance(enhancedResults, trimmedQuery);
    } catch (error) {
      console.error('Universal search error:', error);
      return [];
    }
  }

  // Get module information for display
  getModuleInfo(type, userType = 'shipper') {
    const moduleMap = {
      'shipments': { 
        name: userType === 'shipper' ? 'Loadboard' : 'Consignment', 
        path: userType === 'shipper' ? '/loadboard' : '/consignment', 
        icon: '🚛', 
        color: '#1976d2' 
      },
      'bills': { name: 'Bills', path: '/bills', icon: '🧾', color: '#4caf50' },
      'users': { name: 'Users', path: '/profile', icon: '👤', color: '#ff9800' },
      'drivers': { name: 'Drivers', path: '/driver', icon: '🚚', color: '#607d8b' },
      'fleet': { name: 'Fleet', path: '/fleet', icon: '🚛', color: '#795548' },
      'reports': { name: 'Reports', path: '/reports', icon: '📊', color: '#f44336' },
    };
    return moduleMap[type] || { name: 'Unknown', path: '/dashboard', icon: '❓', color: '#666' };
  }

  // Sort results by relevance (exact matches first, then partial matches)
  sortResultsByRelevance(results, query) {
    return results.sort((a, b) => {
      // Exact match in title gets highest priority
      const aTitleExact = a.title.toLowerCase().includes(query) ? 1 : 0;
      const bTitleExact = b.title.toLowerCase().includes(query) ? 1 : 0;
      
      if (aTitleExact !== bTitleExact) {
        return bTitleExact - aTitleExact;
      }

      // Then check subtitle
      const aSubtitleExact = a.subtitle?.toLowerCase().includes(query) ? 1 : 0;
      const bSubtitleExact = b.subtitle?.toLowerCase().includes(query) ? 1 : 0;
      
      if (aSubtitleExact !== bSubtitleExact) {
        return bSubtitleExact - aSubtitleExact;
      }

      // Then check searchable text
      const aSearchableExact = a.searchableText?.includes(query) ? 1 : 0;
      const bSearchableExact = b.searchableText?.includes(query) ? 1 : 0;
      
      if (aSearchableExact !== bSearchableExact) {
        return bSearchableExact - aSearchableExact;
      }

      // Finally, sort by type priority (shipments first, then bills, etc.)
      const typePriority = {
        shipments: 1,
        bills: 2,
        users: 3,
        drivers: 4,
        fleet: 5,
        reports: 6,
      };
      
      return (typePriority[a.type] || 99) - (typePriority[b.type] || 99);
    });
  }

  // Get search suggestions based on recent searches or popular terms
  async getSearchSuggestions(query) {
    if (!query || query.trim().length < 1) {
      return [];
    }

    const suggestions = [
      'Shipment LD0331',
      'Bill BILL001',
      'User John Smith',
      'Driver Mike Wilson',
      'Truck TRK001',
      'Report Monthly',
      'Houston',
      'Dallas',
      'Pending',
      'Delivered',
      'In Transit',
    ];

    return suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5);
  }
}

// Create and export a singleton instance
const searchService = new SearchService();
export default searchService;
