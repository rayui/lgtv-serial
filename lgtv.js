const serialIO = require("serial-io");

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
  "input": { c: "xb", t: TYPES.NULL }
}

// a 01 OK01x
const CMD_REGEX = /. \d+ (..)(.*)x/

class LGTV {
  #defaultId;
  #path;

  constructor(path) {
    this.#defaultId = 1;
    this.#path = path;
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
  #formatHex(value) {
    return (value > 0
      ? value < 0xFF
        ? value
        : 0xFF
      : 0).toString(16).toUpperCase().padStart(2, '0');
  }
  #formatBool(value) {
    switch (typeof (value)) {
      case "boolean":
      case "number":
        return this.#formatHex((value !== 0) * 1)
      default:
        throw new Error(`Cannot convert type from [${typeof (value)}] for [${command}]`)
    }
  }
  #formatInt(value) {
    switch (typeof (value)) {
      case "boolean":
      case "number":
        const result = this.#formatHex(value * 1);
        return result;
      default:
        throw new Error(`Cannot convert type from [${typeof (value)}] for [${command}]`)
    }
  }
  #getTVID(id) {
    return this.#formatInt(id ? id : this.#defaultId);
  }
  #createLine(command, id, value) {
    const c = this.#getCommand(command);
    const i = this.#getTVID(id);
    const v = this.#isCommandBool(command) ?
      this.#formatBool(value) :
      this.#isCommandInt(command) ? 
        this.#formatInt(value) :
        null;

    if (!!!v) {
      throw new Error(`Unrecognized type for command [${command}]`);
    }

    return `${c} ${i} ${v}`;
  }
  #parseResponse(response) {
    const found = response.match(CMD_REGEX);
    if (!!!found) {
      throw new Error(`Unexpected Response [${response}]`)
    }

    return { status: found[1], result: found[2] }
  }
  #send(string) {
    return serialIO.send(this.#path, string + "\r", { "timeoutInit": 500 })
  }
  set(command, value, id = null) {
    this.#isCommand(command);
    const line = this.#createLine(command, id, value);

    return this.#send(line)
      .then(this.#parseResponse)
  }
  get(command, id = null) {
    this.#isCommand(command);
    const line = this.#createLine(command, id, 0xFF);

    return this.#send(line)
      .then(this.#parseResponse)
  }
}

module.exports = LGTV
