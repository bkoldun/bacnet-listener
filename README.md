# BACnet device simulator and listeners


## The BACnet device simulator

The BACnet device simulator sends a 'whoIs' request every 2 seconds and handles 'iAm' requests.

To run the simulator:
```
 node device_simulator.js
```

## BACnet 'whoIs' Listener #1

This BACnet 'whoIs' listener uses the 'bacstack' npm library. It responds to 'whoIs' requests by 'iAm' requests.

To run this listener:
```
 node listener-bacstack.js
```

## BACnet 'whoIs' Listener #2

This BACnet 'whoIs' listener uses the 'dgram' library.  It responds to 'whoIs' requests by 'iAm' requests.

**!!! It doesn't work yet**

To run this listener:
```
 node listener-udp-dgram.js
```
