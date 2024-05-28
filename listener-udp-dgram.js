const dgram = require('dgram');

// Create a new UDP client
const client = dgram.createSocket('udp4');

// Define the listener device settings
const settings = {
    deviceId: 444,  // Unique device ID
    vendorId: 7    // Vendor ID
};

// Set up an event listener for incoming messages
client.on('message', (msg, rinfo) => {
    console.log(`Received message from ${rinfo.address}:${rinfo.port}`);

    // Parse the received message (this part needs to be implemented based on your protocol)
    const data = parseMessage(msg);

    // Check if the device ID is within the specified limits
    if (data.lowLimit && data.lowLimit > settings.deviceId) return;
    if (data.highLimit && data.highLimit < settings.deviceId) return;

    // Respond with an 'I Am' message if within limits
    const response = createIAmMessage(settings.deviceId, settings.vendorId);
    client.send(response, 0, response.length, rinfo.port, rinfo.address, (err) => {
        if (err) console.error('Error sending response:', err);
    });
});


// deviceId: 444,
//     maxApdu: 1482,
//     segmentation: 0,
//     vendorId: 7
// }
// Sending Who-Is request
// Received whoIs request: {
//     address: '192.168.31.195',


// Bind the UDP client to a port
client.bind(47808, '0.0.0.0',() => {
    console.log('UDP listener started on port 47808');
});

// Function to parse the incoming message
function parseMessage(msg) {
    // Implement the parsing logic based on your protocol
    return {
        lowLimit: parseInt(msg.toString().split(',')[0]),
        highLimit: parseInt(msg.toString().split(',')[1])
    };
}

// Function to create an 'I Am' message
function createIAmMessage(deviceId, vendorId) {
    // Implement the creation of the 'I Am' message based on your protocol
    return Buffer.from(`IAm,${deviceId},${vendorId}`);
}
