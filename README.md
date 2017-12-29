# react-coinmiq-miner

React component to mine [Nimiq](https://www.nimiq.com) cryptocurrency in your
browser.

# Installation

```npm install --save react-coinmiq-miner```

# Usage

```
import React from 'react';
import CoinmiqMiner from 'react-coinmiq-miner';

export default MyClass extends React.Component {
    render() {
        return (
            <CoinmiqMiner
              address="NQ27 RC5B 9E5A S09M 95LQ G3N4 LHQ0 U9DX EDKM"
              targetHash="500000"
              width="260px"
              height="310px"
            />
        )
    }
}
```

# Props

- **address**: Required. Must be a valid Nimiq wallet address in user-friendly format, e.g.
`NQ27 RC5B 9E5A S09M 95LQ G3N4 LHQ0 U9DX EDKM` (with the spaces).
This can be created from any wallet app for the Nimiq blockchain.
- **targetHash**: The total number of hashes to mine for., defaults to 500K.
Faster computers will reach this target earlier.
- **width**: Width of the widget box, defaults to 260px.
- **height**: Heights of the widget box, defaults to 310px.