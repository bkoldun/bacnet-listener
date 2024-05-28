const Bacnet = require("bacstack");

const client = new Bacnet({
    port: 47808,
});

// Define the device settings
const settings = {
    deviceId: 443,  // Unique device ID
    vendorId: 7    // Vendor ID
};

// Define the data store with object properties
const dataStore = {
    '1:0': {
        75: [{value: {type: 1, instance: 0}, type: 12}],    // PROP_OBJECT_IDENTIFIER
        77: [{value: 'Analog Output 1', type: 7}],          // PROP_OBJECT_NAME
        79: [{value: 1, type: 9}],                          // PROP_OBJECT_TYPE
        85: [{value: 5, type: 4}]                           // PROP_PRESENT_VALUE
    },
    '8:443': {
        75: [{value: {type: 8, instance: 443}, type: 12}],  // PROP_OBJECT_IDENTIFIER
        76: [
            {value: {type: 8, instance: 443}, type: 12},
            {value: {type: 1, instance: 0}, type: 12}
        ],                                                  // PROP_OBJECT_IDENTIFIER
        77: [{value: 'my-device-443', type: 7}],            // PROP_OBJECT_NAME
        79: [{value: 8, type: 9}],                          // PROP_OBJECT_TYPE
        28: [{value: 'Test Device #443', type: 7}]          // PROP_DESCRIPTION
    }
};

// Event listener for 'iAm' messages
client.on('iAm', (device) => {
    console.log('Received iAm request:', device);
});

// Event listener for 'readProperty' requests
client.on('readProperty', (data) => {
    console.log('Received readProperty request:', data);

    const object = dataStore[data.request.objectId.type + ':' + data.request.objectId.instance];
    if (!object) return client.errorResponse(data.address, Bacnet.enum.ConfirmedServices.SERVICE_CONFIRMED_READ_PROPERTY, data.invokeId, Bacnet.enum.ErrorClasses.ERROR_CLASS_OBJECT, Bacnet.enum.ErrorCodes.ERROR_CODE_UNKNOWN_OBJECT);
    const property = object[data.request.property.id];
    console.log('object', property);
    if (!property) return client.errorResponse(data.address, Bacnet.enum.ConfirmedServices.SERVICE_CONFIRMED_READ_PROPERTY, data.invokeId, Bacnet.enum.ErrorClasses.ERROR_CLASS_PROPERTY, Bacnet.enum.ErrorCodes.ERROR_CODE_UNKNOWN_PROPERTY);
    if (data.request.property.index === 0xFFFFFFFF) {
        client.readPropertyResponse(data.address, data.invokeId, data.request.objectId, data.request.property, property);
    } else {
        const slot = property[data.request.property.index];
        if (!slot) return client.errorResponse(data.address, Bacnet.enum.ConfirmedServices.SERVICE_CONFIRMED_READ_PROPERTY, data.invokeId, Bacnet.enum.ErrorClasses.ERROR_CLASS_PROPERTY, Bacnet.enum.ErrorCodes.ERROR_CODE_INVALID_ARRAY_INDEX);
        client.readPropertyResponse(data.address, data.invokeId, data.request.objectId, data.request.property, [slot]);
    }
});

// Event listener for 'writeProperty' requests
client.on('writeProperty', (data) => {
    console.log('Received writeProperty request:', data);

    const object = dataStore[data.request.objectId.type + ':' + data.request.objectId.instance];
    if (!object) return client.errorResponse(data.address, data.service, data.invokeId, Bacnet.enum.ErrorClasses.ERROR_CLASS_OBJECT, Bacnet.enum.ErrorCodes.ERROR_CODE_UNKNOWN_OBJECT);
    const property = object[data.request.property.id];
    if (!property) return client.errorResponse(data.address, data.service, data.invokeId, Bacnet.enum.ErrorClasses.ERROR_CLASS_PROPERTY, Bacnet.enum.ErrorCodes.ERROR_CODE_UNKNOWN_PROPERTY);
    if (data.request.property.index === 0xFFFFFFFF) {
        property = data.request.value.value;
        client.simpleAckResponse(data.address, data.service, data.invokeId);
    } else {
        const slot = property[data.request.property.index];
        if (!slot) return client.errorResponse(data.address, data.service, data.invokeId, Bacnet.enum.ErrorClasses.ERROR_CLASS_PROPERTY, Bacnet.enum.ErrorCodes.ERROR_CODE_INVALID_ARRAY_INDEX);
        slot = data.request.value.value[0];
        client.simpleAckResponse(data.address, data.service, data.invokeId);
    }
});

// Event listener for 'whoHas' requests
client.on('whoHas', (data) => {
    console.log('Received whoHas request:', data);

    if (data.lowLimit && data.lowLimit > settings.deviceId) return;
    if (data.highLimit && data.highLimit < settings.deviceId) return;
    if (data.objId) {
        var object = dataStore[data.objId.type + ':' + data.objId.instance];
        if (!object) return;
        client.iHaveResponse(settings.deviceId, {type: data.objId.type, instance: data.objId.instance}, object[77][0].value);
    }
    if (data.objName) {
        // TODO: Find stuff...
        client.iHaveResponse(settings.deviceId, {type: 1, instance: 1}, 'test');
    }
});

client.on('timeSync', (data) => {
    console.log('Received timeSync request:', data);
    // TODO: Implement
});

client.on('timeSyncUTC', (data) => {
    console.log('Received timeSyncUTC request:', data);
    // TODO: Implement
});

client.on('readPropertyMultiple', (data) => {
    console.log('Received readPropertyMultiple request:', data);

    const responseList = [];
    const properties = data.request.properties;
    properties.forEach((property) => {
        if (property.objectId.type === Bacnet.enum.ObjectTypes.OBJECT_DEVICE && property.objectId.instance === 4194303) {
            property.objectId.instance = settings.deviceId;
        }
        const object = dataStore[property.objectId.type + ':' + property.objectId.instance];
        if (!object) return; // TODO: Add error
        const propList = [];
        property.properties.forEach((item) => {
            if (item.id === Bacnet.enum.PropertyIds.PROP_ALL) {
                for (let key in object) {
                    propList.push({property: {id: key, index: 0xFFFFFFFF}, value: object[key]});
                }
                return;
            }
            const prop = object[item.id];
            let content;
            if (!prop) return; // TODO: Add error
            if (item.index === 0xFFFFFFFF) {
                content = prop;
            } else {
                const slot = prop[item.index];
                if (!prop) return; // TODO: Add error
                content = [slot];
            }
            propList.push({property: {id: item.id, index: item.index}, value: content});
        });
        responseList.push({objectId: {type: property.objectId.type, instance: property.objectId.instance}, values: propList});
    });
    client.readPropertyMultipleResponse('192.168.178.255', data.invokeId, responseList);
});

client.on('writePropertyMultiple', (data) => {
    console.log('Received writePropertyMultiple request:', data);
    // TODO: Implement
    // TODO: valuesRefs
    //if () client.simpleAckResponse(data.address, data.service, data.invokeId);
    //else client.errorResponse(data.address, data.service, data.invokeId, Bacnet.enum.ErrorClasses.ERROR_CLASS_OBJECT, Bacnet.enum.ErrorCodes.ERROR_CODE_UNKNOWN_OBJECT);
});

client.on('atomicWriteFile', (data) => {
    console.log('Received atomicWriteFile request:', data);
});

client.on('atomicReadFile', (data) => {
    console.log('Received atomicReadFile request:', data);
});

client.on('subscribeCOV', (data) => {
    console.log('Received subscribeCOV request:', data);
});

client.on('subscribeProperty', (data) => {
    console.log('Received subscribeProperty request:', data);
});

client.on('deviceCommunicationControl', (data) => {
    console.log('Received deviceCommunicationControl request:', data);
});

client.on('reinitializeDevice', (data) => {
    console.log('Received reinitializeDevice request:', data);
});

client.on('readRange', (data) => {
    console.log('Received readRange request:', data);
});

client.on('createObject', (data) => {
    console.log('Received createObject request:', data);
});

client.on('deleteObject', (data) => {
    console.log('Received deleteObject request:', data);
});

// Send a 'Who-Is' request every 2000 milliseconds (2 seconds)
setInterval(() => {
    console.log('Sending Who-Is request');
    client.whoIs({
        lowLimit: 1,
        highLimit: 1000
    });
}, 2000);

// Log a message indicating the Node BACstack Device has started
console.log('Node BACstack Device started');