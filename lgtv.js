const TYPES = {
  BOOL: 0,
  INT: 1,
  BITMAP: 2,
  NULL: 3
};

const COMMANDS = {
  "power": { c: "ka", t: TYPES.BOOL },
  "aspect_ratio": { c: "kc", t: TYPES.NULL },
  "screen_mute": { c: "kd", t: TYPES.BOOL },
  "volume_mute": { c: "ke", t: TYPES.BOOL },
  "volume_control": { c: "kf", t: TYPES.INT },
  "contrast": { c: "kg", t: TYPES.INT },
  "brightness": { c: "kh", t: TYPES.INT },
  "colour": { c: "ki", t: TYPES.INT },
  "tint": { c: "kj", t: TYPES.INT },
  "sharpness": { c: "kk", t: TYPES.INT },
  "osd": { c: "kl", t: TYPES.BOOL },
  "remote": { c: "km", t: TYPES.BOOL },
  "treble": { c: "kr", t: TYPES.INT },
  "bass": { c: "ks", t: TYPES.INT },
  "balance": { c: "kt", t: TYPES.INT },
  "temperature": { c: "ku", t: TYPES.INT },
  "energy": { c: "jq", t: TYPES.INT },
  "auto": { c: "ju", t: TYPES.NULL },
  "tune": { c: "ma", t: TYPES.NULL },
  "programme": { c: "mb", t: TYPES.BOOL },
  "key": { c: "mc", t: TYPES.NULL },
  "backlight": { c: "mg", t: TYPES.INT },
  "input": { c: "xb", t: TYPES.NUL }
}

class LGTV {
  constructor(path) {
    this.defaultID = 1;
    this.path = path;
    this.serialIO = require("serial-io");
  }
  #isCommand(command) {
    if (!COMMANDS.hasOwnProperty(command)) {
      console.log(`Unknown command ${command}`)
      throw new Error(`Unknown command ${command}`)
    }
  }
  #isCommandBool(command) {
    return COMMANDS[command].t === TYPES.BOOL;
  }
  #isCommandInt(command) {
    return COMMANDS[command].t === TYPES.INT;
  }
  #getCommand(command) {
    return COMMANDS[command].c;
  }
  #inputToBool(value) {
    switch (typeof (value)) {
      case "boolean":
      case "number":
        return ((value !== 0) * 1).toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false
        });
      default:
        throw new Error(`Cannot convert type from [${typeof (value)}] for [${command}]`)
    }
  }
  #inputToInt(value) {
    switch (typeof (value)) {
      case "boolean":
      case "number":
        const result = (value * 1).toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false
        });
        if (result < 0 || result > 64) {
          throw new Error(`Cannot convert type from [${typeof (value)}] for [${command}]`)
        }
        return result;
      default:
        throw new Error(`Cannot convert type from [${typeof (value)}] for [${command}]`)
    }
  }
  send(string) {
    return this.serialIO.send(this.path, string + "\r", { "timeoutInit": 500 })
  }
  tvID(tvID) {
    const int_tvID = tvID ? tvID : this.defaultID
    if (String(int_tvID).length == 1) {
      return "0" + String(int_tvID)
    }
    return String(int_tvID)
  }
  set(command, value, tvID = null) {
    this.#isCommand(command);
    const cmd = this.#getCommand(command);

    var line = null

    if (this.#isCommandBool(command)) {
      line = `${cmd} ${this.tvID(tvID)} ${this.#inputToBool(value)}`
    }
    else if (this.#isCommandInt(command)) {
      line = `${cmd} ${this.tvID(tvID)} ${this.#inputToInt(value)}`
    }

    if (!line) {
      throw new Error(`Invalid command`)
    }

    return this.send(line)
      .then(response => {
        // a 01 OK01x
        const regex = /. \d+ (..)(.*)x/

        var found = null
        if (found = response.match(regex)) {
          return { status: found[1], result: found[2] }
        }
        else {
          throw new Error(`Unexpected Response [${response}]`)
        }
      })
  }
  get(command, tvID = null) {
    this.#isCommand(command);

    const c = COMMANDS[command]
    const line = `${c[0]}${c[1]} ${this.tvID(tvID)} FF`;

    return this.send(line)
      .then(response => {
        const regex = /. \d+ (..)(.*)x/

        // a 01 OK01x
        var found = null
        if (found = response.match(regex)) {
          return { status: found[1], result: found[2] }
        }
        else {
          throw new Error(`Unexpected Response [${response}]`)
        }
      })
  }
}

module.exports = LGTV
