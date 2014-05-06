# sliver
I didn't see any existing Node solutions for Boundary's Flake or Twitter's Snowflake style ids that did everything we wanted as fast as we'd like. Here's our attempt at a clone that does the following:

 * 128 bit keys
 * K-ordered
 * Rendered as base 62
 * Lexicographically sortable
 * Coordination free-ish

## API

### Using MACAddress as seed
If no seed is provided during start-up, sliver will attempt to create a seed from the MACAddress. While this is great, it also means that you can't have two processes using sliver independently and still guarantee unique ids (a bad thing).
```javascript

// reading the MAC address is async, hence the ready call.
var sliver = require( 'sliver' )( ready );
id = sliver.getId(); // ta-da
```

### Unique seeds
Anything can seed the node id. sliver uses murmurhash3 to create a unique 32 bit integer from whatever you have lying around. This needs to be unique for every instance creating ids.

```javascript
// no need to provide a call back when specifying a seed
var sliver = require( 'sliver' )( 'Hey, look, a string based seed.' );
id = sliver.getId(); // ta-da
```

### Speed
Looks like this tops out around 20 / ms on modern processors. Do with that what you will :)