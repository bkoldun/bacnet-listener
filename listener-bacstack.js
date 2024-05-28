const Bacnet = require('bacstack');

// Create a new Bacnet client with specific options
const client = new Bacnet({
    apduTimeout: 6000, // Timeout for APDU messages
    port: 47808, // Default BACnet port
});

// Define the listener device settings
const settings = {
    deviceId: 444,  // Unique device ID
    vendorId: 7    // Vendor ID
};

// Set up an event listener for 'whoIs' requests
client.on('whoIs', (data) => {
    console.log('Received whoIs request:', data);

    // Check if the device ID is within the specified limits
    if (data.lowLimit && data.lowLimit > settings.deviceId) return;
    if (data.highLimit && data.highLimit < settings.deviceId) return;

    // Respond with an 'I Am' message if within limits
    client.iAmResponse(settings.deviceId, Bacnet.enum.Segmentation.SEGMENTED_BOTH, settings.vendorId);
});


console.log('BACnet whoIs listener started.');

