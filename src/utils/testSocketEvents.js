// Test utility to simulate backend socket events
// This can be used in browser console for testing

export const testNegotiationMessage = (socket) => {
  if (!socket) {
    console.error('Socket not available');
    return;
  }

  const testData = {
    sender: 'Test Driver',
    senderName: 'Test Driver',
    senderType: 'Driver',
    message: 'This is a test negotiation message from the driver.',
    loadId: '6749da1092b6720e79d6d06',
    bidId: 'test_bid_' + Date.now(),
    rate: '$1500',
    timestamp: new Date().toISOString()
  };

  console.log('🧪 Emitting test negotiation message:', testData);
  
  // Simulate receiving the event (as if from backend)
  socket.emit('new_negotiation_message', testData);
};

export const testMultipleMessages = (socket) => {
  if (!socket) {
    console.error('Socket not available');
    return;
  }

  const messages = [
    {
      sender: 'Driver A',
      senderName: 'Driver A',
      senderType: 'Driver',
      message: 'Can we negotiate the rate?',
      loadId: '6749da1092b6720e79d6d06',
      bidId: 'bid_a_' + Date.now(),
      rate: '$1200'
    },
    {
      sender: 'Driver B', 
      senderName: 'Driver B',
      senderType: 'Driver',
      message: 'I am available for immediate pickup.',
      loadId: '6749da1092b6720e79d6d07',
      bidId: 'bid_b_' + Date.now(),
      rate: '$1350'
    },
    {
      sender: 'Driver C',
      senderName: 'Driver C', 
      senderType: 'Driver',
      message: 'What about fuel surcharge?',
      loadId: '6749da1092b6720e79d6d08',
      bidId: 'bid_c_' + Date.now(),
      rate: '$1400'
    }
  ];

  messages.forEach((msg, index) => {
    setTimeout(() => {
      console.log(`🧪 Emitting test message ${index + 1}:`, msg);
      socket.emit('new_negotiation_message', msg);
    }, index * 2000); // 2 second delay between messages
  });
};

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  window.testNegotiationMessage = testNegotiationMessage;
  window.testMultipleMessages = testMultipleMessages;
}