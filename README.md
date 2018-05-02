# react-coinmiq-miner

React component to mine [Nimiq](https://www.nimiq.com) cryptocurrency in your
browser. Developed for [Coinmiq](http://www.coinmiq.com).

# Installation

`npm install --save react-coinmiq-miner`

# Usage

```
import React from 'react';
import CoinmiqMiner from 'react-coinmiq-miner';

export default MyClass extends React.Component {
    render() {
        return (
            <CoinmiqMiner
              network="main"            
              address="NQ27 RC5B 9E5A S09M 95LQ G3N4 LHQ0 U9DX EDKM"
              poolServer="eu.sushipool.com",
              poolPort=443,              
              targetHash="500000"
              width="260px"
              height="auto"
              autoStart="false"
              displayMode="full"
              border="false"
            />
        )
    }
}
```

# Props

* **network** specifies whether to mine in the 'main' or the 'test' network. Defaults to main.
* **address**: Required. Must be a valid Nimiq wallet address in user-friendly format, e.g.
  `NQ27 RC5B 9E5A S09M 95LQ G3N4 LHQ0 U9DX EDKM`.
  This can be created from any wallet app for the Nimiq blockchain.
* **poolServer**: The pool server to mine to. Must be running the official Nimiq pool miner code. Defaults to 'eu.sushipool.com' if not specified.
* **poolPort**: The pool port. Defaults to 443 if not specified.
* **targetHash**: The total number of hashes to mine for, e.g. 500K. Useful for timed mining.
  Faster computers will reach this target earlier. If this property is not specified, no progress bar
  will be shown, and mining will run forever.
* **width**: Width of the widget box, defaults to "auto", but you can specify this in pixel, e.g. "260px".
* **height**: Heights of the widget box, defaults to "auto", but you can specify this in pixel, e.g. "310px".
* **autoStart**: Whether to start the miner automatically (without having the user do it). Default to false.
* **displayMode**: Different display modes.
  * "full" will show the complete interface, including Coinmiq logo (thank you!!).
  * "compact" will hide the logo and buttons to increase/decrease thread counts.
  * "none" will not show anything. Progress will be printed to the developer console.
* **border**: whether to show border. Defaults to true.

# TODO

* Automatic thread management: dynamically increase or decrease the number of threads used depending on CPU load.
* Mining pool support.