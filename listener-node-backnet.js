const Bacnet = require('node-bacnet');

// Create a new Bacnet client with specific options
const client = new Bacnet({
    apduTimeout: 6000, // Timeout for APDU messages
    port: 47808,       // Default BACnet port
});

// Define the listener device settings
const settings = {
    deviceId: 445,  // Unique device ID
    vendorId: 7     // Vendor ID
};

// Set up an event listener for 'whoIs' requests
client.on('whoIs', (data) => {
    console.log('Received whoIs request:', data);

    // Check if the device ID is within the specified limits
    const lowLimit = data.payload.lowLimit;
    const highLimit = data.payload.highLimit;

    console.log('Device ID:', settings.deviceId);
    console.log('Low Limit:', lowLimit);
    console.log('High Limit:', highLimit);

    if (lowLimit !== undefined && lowLimit > settings.deviceId) {
        console.log('Device ID is below the low limit.');
        return;
    }

    if (highLimit !== undefined && highLimit < settings.deviceId) {
        console.log('Device ID is above the high limit.');
        return;
    }

    // Respond with an 'I Am' message if within limits
    console.log('Sending I Am response...');

    client.iAmResponse(data.header.sender.address, settings.deviceId, Bacnet.enum.Segmentation.SEGMENTED_BOTH, settings.vendorId)
});


console.log('node-bacnet whoIs listener started.');
