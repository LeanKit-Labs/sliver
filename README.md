# sliver
I didn't see any existing Node solutions for Boundary's Flake or Twitter's Snowflake style ids that did everything we wanted as fast as we'd like. Here's our attempt at a clone that does the following:

 * 128 bit keys
 * K-ordered
 * Rendered as base 62
 * Lexicographically sortable
 * Coordination free-ish

### Break down
128 bit key comprised of the following:

`{timestamp}{worker}{sequence}`

 * 64 bit timestamp
 * 48 bit worker id
 * 16 bit sequence number

The sequence number increments for each subsequent id requested within the same millisecond.

## API

### Using MACAddress or HostName as seed
If no seed is provided, Sliver will use either the MAC address or host name plus the process id as the seed. This should prevent duplicate seeds and id collisions, but be aware of any scenario that might cause duplicate MACs or host names in your environment.

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
