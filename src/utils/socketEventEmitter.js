// Backend Socket Event Emitter Helper
// Add this to your backend and use it in your controllers

export const emitSocketEvent = (io, eventName, data, targetUserId = null) => {
  console.log(`🔔 Emitting socket event: ${eventName}`, data);
  
  if (targetUserId) {
    // Send to specific user
    io.to(targetUserId).emit(eventName, data);
  } else {
    // Broadcast to all connected users
    io.emit(eventName, data);
  }
};

// Negotiation Events
export const emitNegotiationMessage = (io, data) => {
  const eventData = {
    bidId: data.bidId,
    loadId: data.loadId,
    senderId: data.senderId,
    senderName: data.senderName,
    sender: data.sender, // 'shipper' or 'inhouse'
    message: data.message,
    rate: data.rate,
    timestamp: new Date().toISOString(),
    senderAvatar: data.senderAvatar || null,
    negotiationData: data.negotiationData || null
  };

  // Emit to all users involved in this negotiation
  emitSocketEvent(io, 'new_negotiation_message', eventData);
  emitSocketEvent(io, 'bid_negotiation_update', eventData);
  emitSocketEvent(io, 'negotiation_message', eventData);
};

// Bid Events
export const emitBidUpdate = (io, data) => {
  const eventData = {
    bidId: data.bidId,
    loadId: data.loadId,
    senderId: data.senderId,
    senderName: data.senderName,
    driverName: data.driverName,
    message: data.message,
    rate: data.rate,
    status: data.status,
    timestamp: new Date().toISOString()
  };

  emitSocketEvent(io, 'new_bid', eventData);
  emitSocketEvent(io, 'bid_update', eventData);
};

// Chat Events
export const emitChatMessage = (io, data) => {
  const eventData = {
    senderId: data.senderId,
    senderName: data.senderName,
    message: data.message,
    loadId: data.loadId,
    timestamp: new Date().toISOString(),
    avatarUrl: data.avatarUrl || null
  };

  emitSocketEvent(io, 'new_message', eventData, data.receiverId);
  emitSocketEvent(io, 'receive_message', eventData, data.receiverId);
  emitSocketEvent(io, 'chat_message', eventData, data.receiverId);
};

// Usage Examples for your backend controllers:

/*
// In shipperInternalNegotiate controller:
import { emitNegotiationMessage } from '../utils/socketEventEmitter.js';

// After saving bid negotiation
emitNegotiationMessage(req.app.get('io'), {
  bidId: bid._id,
  loadId: bid.load._id,
  senderId: req.user._id,
  senderName: req.user.compName || req.user.name,
  sender: 'shipper',
  message: message,
  rate: shipperCounterRate,
  negotiationData: bid.internalNegotiation
});

// In inhouseInternalNegotiate controller:
emitNegotiationMessage(req.app.get('io'), {
  bidId: bid._id,
  loadId: bid.load._id,
  senderId: req.user.empId,
  senderName: req.user.employeeName,
  sender: 'inhouse',
  message: message,
  rate: inhouseCounterRate,
  negotiationData: bid.internalNegotiation
});

// In placeBid controller:
import { emitBidUpdate } from '../utils/socketEventEmitter.js';

emitBidUpdate(req.app.get('io'), {
  bidId: bid._id,
  loadId: loadId,
  senderId: req.user._id,
  senderName: req.user.compName,
  driverName: driverName,
  message: `New bid placed: $${rate}`,
  rate: rate,
  status: 'PendingApproval'
});

// In updateBidStatus controller (when accepting/rejecting):
emitBidUpdate(req.app.get('io'), {
  bidId: bid._id,
  loadId: bid.load._id,
  senderId: req.user._id,
  senderName: req.user.compName,
  message: `Bid ${status.toLowerCase()}`,
  rate: bid.rate,
  status: status
});
*/