const ffi = require('ffi-napi');
const ref = require('ref-napi');

// Load the shared library (adjust the path to the built BACnet library)
const bacnet = ffi.Library('./bacnet-stack/bacnet-stack.dylib', {
    'bacnet_function': ['return_type', ['arg_type1', 'arg_type2']]
});

// Example of using a BACnet function
const result = bacnet.bacnet_function(arg1, arg2);
console.log(result);
