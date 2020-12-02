## About

This module lets you command a LG TV over the serial port of your computer (or Raspberry Pi).

## Example

```js
const LGTV = require("lgtv-serial")

lgtv = new LGTV("/dev/ttyUSB0")

// Power off TV
lgtv.set("power",0)
    .then(r => { 
        console.log(`Success : ${r}`)
    })

// Get current status
lgtv.get("power")
    .then(r => { 
        console.log(`Current state : ${r}`)
    })
```