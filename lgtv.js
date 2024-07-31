const serialIO = require("serial-io");
const { TYPES, COMMANDS, CMD_REGEX } = require("./const");

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
    return COMMANDS[command].map?.[value.toString().toLowerCase()] ?? value;
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

    return `${cmd} ${tvId} ${this.#formatValue(command, mappedInput)}\r`;
  }
  #parseResponse(response) {
    const found = response.match(CMD_REGEX);
    if (!!!found) {
      throw new Error(`Unexpected Response [${response}]`)
    }

    return { status: found[1], result: found[2] }
  }
  #send(string) {
    return serialIO.send(this.#path, string, { "timeoutInit": 500 })
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
