// Utility to simulate real backend negotiation events
export class NegotiationEventSimulator {
  constructor(socket, user) {
    this.socket = socket;
    this.user = user;
  }

  // Simulate shipper internal negotiate event (from your API)
  simulateShipperInternalNegotiate(bidId, loadId, counterRate, message) {
    if (!this.socket) return false;

    const eventData = {
      bidId: bidId,
      loadId: loadId,
      senderId: this.user._id || this.user.userId,
      senderName: this.user.name || this.user.email || 'Shipper',
      shipperCounterRate: counterRate,
      shipperNegotiationMessage: message,
      message: message,
      rate: counterRate,
      sender: 'shipper',
      timestamp: new Date().toISOString(),
      negotiationType: 'shipper_internal_negotiate',
      threadId: `thread_${bidId}_${Date.now()}`
    };

    // Emit the exact event your backend would emit
    this.socket.emit('shipper_internal_negotiate', eventData);
    console.log('🚢 Simulated shipper internal negotiate:', eventData);
    return true;
  }

  // Simulate inhouse internal negotiate event (from your API)
  simulateInhouseInternalNegotiate(bidId, loadId, counterRate, message, inhouseName = 'Sales Team') {
    if (!this.socket) return false;

    const eventData = {
      bidId: bidId,
      loadId: loadId,
      senderId: `inhouse_${Date.now()}`,
      senderName: inhouseName,
      inhouseName: inhouseName,
      inhouseCounterRate: counterRate,
      inhouseNegotiationMessage: message,
      message: message,
      rate: counterRate,
      sender: 'inhouse',
      timestamp: new Date().toISOString(),
      negotiationType: 'inhouse_internal_negotiate',
      threadId: `thread_${bidId}_${Date.now()}`
    };

    this.socket.emit('inhouse_internal_negotiate', eventData);
    console.log('🏢 Simulated inhouse internal negotiate:', eventData);
    return true;
  }

  // Simulate general internal negotiation update
  simulateInternalNegotiationUpdate(bidId, loadId, rate, message, senderName, senderType = 'negotiator') {
    if (!this.socket) return false;

    const eventData = {
      bidId: bidId,
      loadId: loadId,
      senderId: `${senderType}_${Date.now()}`,
      senderName: senderName,
      message: message,
      rate: rate,
      sender: senderType,
      timestamp: new Date().toISOString(),
      negotiationType: 'internal_negotiation_update',
      threadId: `thread_${bidId}_${Date.now()}`,
      isRealTime: true
    };

    this.socket.emit('internal_negotiation_update', eventData);
    console.log('💰 Simulated internal negotiation update:', eventData);
    return true;
  }

  // Simulate bid negotiation update (from your bid system)
  simulateBidNegotiationUpdate(bidId, loadId, newRate, previousRate, status = 'negotiating') {
    if (!this.socket) return false;

    const eventData = {
      bidId: bidId,
      loadId: loadId,
      senderId: `system_${Date.now()}`,
      senderName: 'Bid System',
      message: `Bid rate updated from $${previousRate?.toLocaleString()} to $${newRate?.toLocaleString()}`,
      rate: newRate,
      previousRate: previousRate,
      status: status,
      timestamp: new Date().toISOString(),
      negotiationType: 'bid_negotiation_update',
      threadId: `thread_${bidId}_${Date.now()}`
    };

    this.socket.emit('bid_negotiation_update', eventData);
    console.log('🎯 Simulated bid negotiation update:', eventData);
    return true;
  }

  // Simulate a complete negotiation sequence
  simulateNegotiationSequence(bidId, loadId, initialRate = 2500) {
    if (!this.socket) return false;

    const sequence = [
      {
        delay: 0,
        rate: initialRate + 200,
        message: 'Counter offer from shipper',
        type: 'shipper'
      },
      {
        delay: 2000,
        rate: initialRate + 100,
        message: 'Driver response: Can we meet in the middle?',
        type: 'driver'
      },
      {
        delay: 4000,
        rate: initialRate + 150,
        message: 'Sales team approval: This is our final offer',
        type: 'inhouse'
      }
    ];

    sequence.forEach((step, index) => {
      setTimeout(() => {
        if (step.type === 'shipper') {
          this.simulateShipperInternalNegotiate(bidId, loadId, step.rate, step.message);
        } else if (step.type === 'inhouse') {
          this.simulateInhouseInternalNegotiate(bidId, loadId, step.rate, step.message);
        } else {
          this.simulateInternalNegotiationUpdate(bidId, loadId, step.rate, step.message, 'Driver', 'driver');
        }
      }, step.delay);
    });

    console.log('🎭 Started negotiation sequence simulation');
    return true;
  }

  // Test real API endpoint (if available)
  async testRealApiEndpoint(bidId, loadId, counterRate, message, token) {
    try {
      const response = await fetch(`${window.location.origin.replace('5173', '3000')}/api/v1/negotiation/shipper-internal-negotiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bidId: bidId,
          loadId: loadId,
          shipperCounterRate: counterRate,
          shipperNegotiationMessage: message
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Real API call successful:', data);
        return { success: true, data };
      } else {
        console.log('⚠️ API call failed, using simulation');
        return { success: false, error: 'API not available' };
      }
    } catch (error) {
      console.log('⚠️ API call error, using simulation:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Helper function to create simulator instance
export const createNegotiationSimulator = (socket, user) => {
  return new NegotiationEventSimulator(socket, user);
};

// Export event types for reference
export const NEGOTIATION_EVENT_TYPES = {
  SHIPPER_INTERNAL_NEGOTIATE: 'shipper_internal_negotiate',
  INHOUSE_INTERNAL_NEGOTIATE: 'inhouse_internal_negotiate',
  INTERNAL_NEGOTIATION_UPDATE: 'internal_negotiation_update',
  BID_NEGOTIATION_UPDATE: 'bid_negotiation_update',
  NEGOTIATION_THREAD_UPDATE: 'negotiation_thread_update'
};

export default NegotiationEventSimulator;