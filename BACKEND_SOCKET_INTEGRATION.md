# Backend Socket Integration Guide

## Overview
This guide shows how to add socket event emission to your existing backend controllers to enable real-time popup notifications in the frontend.

## Required Backend Changes

### 1. Install Socket.io in Backend (if not already installed)
```bash
npm install socket.io
```

### 2. Initialize Socket.io in your main server file (app.js/server.js)
```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Make io available to all routes
app.set('io', io);

// Socket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_shipper', (userId) => {
    socket.join(userId);
    console.log(`Shipper ${userId} joined room`);
  });
  
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 3. Create Socket Event Emitter Utility (backend/utils/socketEventEmitter.js)
```javascript
// Backend Socket Event Emitter Helper
const emitSocketEvent = (io, eventName, data, targetUserId = null) => {
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
const emitNegotiationMessage = (io, data) => {
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
const emitBidUpdate = (io, data) => {
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
const emitChatMessage = (io, data) => {
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

module.exports = {
  emitSocketEvent,
  emitNegotiationMessage,
  emitBidUpdate,
  emitChatMessage
};
```

### 4. Update shipperInternalNegotiate Controller
Add this to your existing `shipperInternalNegotiate` controller:

```javascript
const { emitNegotiationMessage } = require('../utils/socketEventEmitter');

// In your shipperInternalNegotiate controller function:
// After successfully saving the negotiation message

try {
  // Your existing code to save negotiation...
  
  // ADD THIS: Emit socket event for real-time notifications
  const io = req.app.get('io');
  if (io) {
    emitNegotiationMessage(io, {
      bidId: bid._id,
      loadId: bid.load._id || bid.loadId,
      senderId: req.user._id,
      senderName: req.user.compName || req.user.name,
      sender: 'shipper',
      message: message, // The negotiation message
      rate: shipperCounterRate,
      senderAvatar: req.user.profileImage || null,
      negotiationData: {
        bidId: bid._id,
        loadId: bid.load._id || bid.loadId,
        internalNegotiation: bid.internalNegotiation
      }
    });
  }

  res.json({
    success: true,
    message: 'Negotiation message sent successfully',
    data: bid
  });
} catch (error) {
  // Your error handling...
}
```

### 5. Update inhouseInternalNegotiate Controller
Add this to your existing `inhouseInternalNegotiate` controller:

```javascript
const { emitNegotiationMessage } = require('../utils/socketEventEmitter');

// In your inhouseInternalNegotiate controller function:
// After successfully saving the negotiation message

try {
  // Your existing code to save negotiation...
  
  // ADD THIS: Emit socket event for real-time notifications
  const io = req.app.get('io');
  if (io) {
    emitNegotiationMessage(io, {
      bidId: bid._id,
      loadId: bid.load._id || bid.loadId,
      senderId: req.user.empId || req.user._id,
      senderName: req.user.employeeName || req.user.name,
      sender: 'inhouse',
      message: message, // The negotiation message
      rate: inhouseCounterRate,
      senderAvatar: req.user.profileImage || null,
      negotiationData: {
        bidId: bid._id,
        loadId: bid.load._id || bid.loadId,
        internalNegotiation: bid.internalNegotiation
      }
    });
  }

  res.json({
    success: true,
    message: 'Negotiation message sent successfully',
    data: bid
  });
} catch (error) {
  // Your error handling...
}
```

### 6. Update placeBid Controller
Add this to your existing `placeBid` controller:

```javascript
const { emitBidUpdate } = require('../utils/socketEventEmitter');

// In your placeBid controller function:
// After successfully creating the bid

try {
  // Your existing code to create bid...
  
  // ADD THIS: Emit socket event for new bid
  const io = req.app.get('io');
  if (io) {
    emitBidUpdate(io, {
      bidId: newBid._id,
      loadId: loadId,
      senderId: req.user._id,
      senderName: req.user.compName || req.user.name,
      driverName: driverName,
      message: `New bid placed: $${rate}`,
      rate: rate,
      status: 'PendingApproval'
    });
  }

  res.json({
    success: true,
    message: 'Bid placed successfully',
    data: newBid
  });
} catch (error) {
  // Your error handling...
}
```

### 7. Update updateBidStatus Controller (Accept/Reject)
Add this to your existing `updateBidStatus` controller:

```javascript
const { emitBidUpdate } = require('../utils/socketEventEmitter');

// In your updateBidStatus controller function:
// After successfully updating bid status

try {
  // Your existing code to update bid status...
  
  // ADD THIS: Emit socket event for bid status change
  const io = req.app.get('io');
  if (io) {
    emitBidUpdate(io, {
      bidId: bid._id,
      loadId: bid.load._id || bid.loadId,
      senderId: req.user._id,
      senderName: req.user.compName || req.user.name,
      driverName: bid.driver?.name || 'Driver',
      message: `Bid ${status.toLowerCase()}: $${bid.rate}`,
      rate: bid.rate,
      status: status
    });
  }

  res.json({
    success: true,
    message: `Bid ${status.toLowerCase()} successfully`,
    data: bid
  });
} catch (error) {
  // Your error handling...
}
```

## Testing the Integration

1. **Start your backend server** with the socket.io integration
2. **Open your frontend** and navigate to any page
3. **Send a negotiation message** from the Loadboard.jsx negotiate button
4. **Check browser console** for socket event logs
5. **Verify popup appears** on any page when real messages are sent

## Expected Socket Events

Your backend should now emit these events:
- `new_negotiation_message` - When shipper/inhouse sends negotiation
- `bid_negotiation_update` - When negotiation is updated
- `new_bid` - When new bid is placed
- `bid_update` - When bid status changes

## Troubleshooting

1. **No popups showing**: Check browser console for socket connection errors
2. **Events not emitting**: Verify `req.app.get('io')` returns socket.io instance
3. **Wrong user receiving**: Check user room joining logic in socket connection
4. **Multiple popups**: Ensure event names match exactly between backend and frontend

## Frontend Integration Status ✅

The frontend is already configured with:
- ✅ UniversalSocketListener - Listens for all socket events
- ✅ GlobalMessagePopup - Shows popups on any page
- ✅ Socket connection management
- ✅ Message notification system
- ✅ Cross-page notification support

**Next Step**: Implement the backend socket emission in your controllers using the code above.