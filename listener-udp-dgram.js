const dgram = require('dgram');

// Define the listener device settings
const settings = {
    deviceId: 444,  // Unique device ID
    vendorId: 7    // Vendor ID
};

// Define the range of ports
const startPort = 47808;
const endPort = 47818;

// Function to create and bind a UDP client to a specific port
function createClient(port) {
    const client = dgram.createSocket('udp4');

    client.on('message', (msg, rinfo) => {
        console.log(`Received message on port ${port} from ${rinfo.address}:${rinfo.port}`);

        // Parse the received message
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

    client.bind(port, '0.0.0.0', () => {
        console.log(`UDP listener started on port ${port}`);
    });

    return client;
}

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

// Create clients for each port in the specified range
for (let port = startPort; port <= endPort; port++) {
    createClient(port);
}
