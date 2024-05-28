const dgram = require('dgram');

const settings = {
    deviceId: 443,
    vendorId: 7
};


const udpServer = dgram.createSocket('udp4');

udpServer.on('message', (msg, rinfo) => {
    console.log('Received message')
    // Parse the message to check if it is a Who-Is request
    let decoded;
    try {
        decoded = bacnet.decodeFunction(msg);
    } catch (err) {
        console.error('Failed to decode message', err);
        return;
    }

    if (decoded && decoded.service === bacnet.enum.ConfirmedServices.SERVICE_UNCONFIRMED_WHO_IS) {
        console.log('whoIs', decoded);

        if (decoded.lowLimit && decoded.lowLimit > settings.deviceId) return;
        if (decoded.highLimit && decoded.highLimit < settings.deviceId) return;

        const iAmMsg = bacnet.encodeFunction({
            type: bacnet.enum.PDUTypes.PDU_TYPE_UNCONFIRMED_SERVICE_REQUEST,
            service: bacnet.enum.UnconfirmedServices.SERVICE_UNCONFIRMED_I_AM,
            payload: {
                deviceId: settings.deviceId,
                maxApdu: 1476,
                segmentation: bacnet.enum.Segmentation.SEGMENTED_BOTH,
                vendorId: settings.vendorId
            }
        });

        udpServer.send(iAmMsg, 0, iAmMsg.length, rinfo.port, rinfo.address, (err) => {
            if (err) {
                console.error('Error sending I-Am response', err);
            } else {
                console.log('I-Am response sent to', rinfo.address);
            }
        });
    }
});

udpServer.on('listening', () => {
    const address = udpServer.address();
    console.log(`UDP server listening on ${address.address}:${address.port}`);
});

udpServer.bind(47808); // BACnet default port

console.log('Node BACstack lister started');
