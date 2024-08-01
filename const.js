const TYPES = {
  BOOL: 0,
  INT: 1,
  NULL: 2
};

const BUTTONS = {
  power: 0x08,
  energy: 0x95,
  av_mode: 0x30,
  input: 0x0B,
  tv_rad: 0xF0,
  num_0: 0x10,
  num_1: 0x11,
  num_2: 0x12,
  num_3: 0x13,
  num_4: 0x14,
  num_5: 0x15,
  num_6: 0x16,
  num_7: 0x17,
  num_8: 0x18,
  num_9: 0x19,
  list: 0x53,
  q_view: 0x1A,
  plus: 0x02,
  min_us: 0x03,
  fav_mark: 0x1E,
  threed: 0xDC,
  mute: 0x09,
  prog_up: 0x00,
  prog_down: 0x01,
  home: 0x43,
  guide: 0xAB,
  q_menu: 0x45,
  back: 0x28,
  info: 0xAA,
  exit: 0x5B,
  ok: 0x44,
  cursor_up: 0x40,
  cursor_down: 0x41,
  cursor_left: 0x07,
  cursor_right: 0x06,
  red: 0x72,
  green: 0x71,
  yellow: 0x63,
  blue: 0x61,
  text: 0x20,
  t_opt: 0x21,
  subtitle: 0x39,
  stop: 0xB1,
  play: 0xB0,
  pause: 0xBA,
  ffw: 0x8E,
  rev: 0x8F,
  simplink: 0x7E,
  ratio: 0x79,
  ad: 0x91,
};

const INPUTS = {
  dtv: 0x0,
  analogue: 0x10,
  av: 0x20,
  component: 0x40,
  rgb: 0x60,
  hdmi1: 0x90,
  hdmi2: 0x91,
  hdmi3: 0x92,
  hdmi4: 0x93,
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
  temperature: { cmd: "xu", type: TYPES.INT },
  energy: { cmd: "jq", type: TYPES.INT },
  auto: { cmd: "ju", type: TYPES.INT },
  tune: { cmd: "ma", type: TYPES.NULL },
  programme: { cmd: "mb", type: TYPES.BOOL },
  key: {
    cmd: "mc",
    type: TYPES.INT,
    map: BUTTONS
  },
  backlight: { cmd: "mg", type: TYPES.INT },
  input: {
    cmd: "xb",
    type: TYPES.INT,
    map: INPUTS
  }
};

// a 01 OK01x
const CMD_REGEX = /. \d+ (..)(.*)x/

module.exports = {
    TYPES,
    COMMANDS,
    CMD_REGEX
};