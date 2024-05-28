const Bacnet = require('bacstack');

const client = new Bacnet({
    apduTimeout: 6000,
    port: 47808,
});

const settings = {
    deviceId: 443,
    vendorId: 7
};

client.on('whoIs', (data) => {
    console.log('Received whoIs request:', data);

    if (data.lowLimit && data.lowLimit > settings.deviceId) return;
    if (data.highLimit && data.highLimit < settings.deviceId) return;

    client.iAmResponse(settings.deviceId, Bacnet.enum.Segmentation.SEGMENTED_BOTH, settings.vendorId);
});


console.log('BACnet whoIs listener started.');

