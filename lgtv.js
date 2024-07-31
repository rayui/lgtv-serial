const serialIO = require("serial-io");

const TYPES = {
  BOOL: 0,
  INT: 1,
  NULL: 2
};

const COMMANDS = {
  power: { cmd: "ka", type: TYPES.BOOL },
  aspect_ratio: { cmd: "kc", type: TYPES.NULL },
  screen_mute: { cmd: "kd", type: TYPES.BOOL },
  volume_mute: { cmd: "ke", type: TYPES.BOOL },
  volume_control: { cmd: "kf", type: TYPES.INT },
  contrast: { cmd: "kg", type: TYPES.INT },
  brightness: { cmd: "kh", type: TYPES.INT },
  colour: { cmd: "ki", type: TYPES.INT },
  tint: { cmd: "kj", type: TYPES.INT },
  sharpness: { cmd: "kk", type: TYPES.INT },
  osd: { cmd: "kl", type: TYPES.BOOL },
  remote: { cmd: "km", type: TYPES.BOOL },
  treble: { cmd: "kr", type: TYPES.INT },
  bass: { cmd: "ks", type: TYPES.INT },
  balance: { cmd: "kt", type: TYPES.INT },
  temperature: { cmd: "ku", type: TYPES.INT },
  energy: { cmd: "jq", type: TYPES.INT },
  auto: { cmd: "ju", type: TYPES.NULL },
  tune: { cmd: "ma", type: TYPES.NULL },
  programme: { cmd: "mb", type: TYPES.BOOL },
  key: { cmd: "mc", type: TYPES.NULL },
  backlight: { cmd: "mg", type: TYPES.INT },
  input: {
    cmd: "xb",
    type: TYPES.INT,
    map: {
      DTV: 0x0,
      Analogue: 0x10,
      AV: 0x20,
      Component: 0x40,
      RGB: 0x60,
      HDMI1: 0x90,
      HDMI2: 0x91,
      HDMI3: 0x92,
      HDMI4: 0x93,
    }
  }
};

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
  #getCommand(command) {
    return COMMANDS[command].cmd;
  }
  #getCommandType(command) {
    return COMMANDS[command].type;
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
  #mapInput(command, value) {
    return COMMANDS[command].map?.[value] ?? value;
  }
  #formatValue(command, value) {
    switch (this.#getCommandType(command)) {
      case TYPES.BOOL:
        return this.#formatBool(value);
      case TYPES.INT:
        return this.#formatInt(value);
      default:
        return value;
    }
  }
  #createLine(command, id, value) {
    const cmd = this.#getCommand(command);
    const tvId = this.#getTVID(id);

    const mappedInput = this.#mapInput(command, value);

    return `${cmd} ${tvId} ${this.#formatValue(command, mappedInput)}`;
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
