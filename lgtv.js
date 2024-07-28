const _commands = {
    "power" :          [ "k", "a", typeof(bool) ],
    "aspect_ratio" :   [ "k", "c", null ],
    "screen_mute" :    [ "k", "d", typeof(bool) ],
    "volume_mute" :    [ "k", "e", typeof(bool) ],
    "volume_control" : [ "k", "f", typeof(int) ],
    "contrast" :       [ "k", "g", typeof(int) ],
    "brightness" :     [ "k", "h", typeof(int) ],
    "colour" :         [ "k", "i", typeof(int) ],
    "tint" :           [ "k", "j", typeof(int) ],
    "sharpness" :      [ "k", "k", typeof(int) ],
    "osd" :            [ "k", "l", typeof(bool) ],
    "remote" :         [ "k", "m", typeof(bool) ],
    "treble" :         [ "k", "r", typeof(int) ],
    "bass" :           [ "k", "s", typeof(int) ],
    "balance" :        [ "k", "t", typeof(int) ],
    "temperature" :    [ "k", "u", typeof(int) ],
    "energy" :         [ "j", "q", typeof(int) ],
    "auto" :           [ "j", "u", null ],
    "tune" :           [ "m", "a", null ],
    "programme" :      [ "m", "b", typeof(bool) ],
    "key" :            [ "m", "c", null ],
    "backlight" :      [ "m", "g", typeof(int) ],
    "input" :          [ "x", "b", null ]
}

class LGTV {
    constructor(path) {
        this.defaultID=1
        this.path=path
        this.serialIO = require("serial-io")
    }
    send(string) {
        return this.serialIO.send(this.path,string + "\r",{"timeoutInit":500})
    }
    tvID(tvID) {
        const int_tvID=tvID?tvID:this.defaultID
        if (String(int_tvID).length == 1) {
            return "0" + String(int_tvID)
        }
        return String(int_tvID)
    }
    set(command,value,tvID=null){
        if (! _commands.hasOwnProperty(command)) {
            console.log(`Unknown command ${command}`)
            throw new Error(`Unknown command ${command}`)
        }

        const c=_commands[command]
        var line = null

        if (c[2] == typeof(bool)) {
            var v=null
            if (typeof(value) == "bool") {
                v=value?"01":"00"
            }
            else if (typeof(value) == "number") {
                v=(value==0)?"00":"01"
            }
            else if (typeof(value) == "string") {
                if (value=="1" || value =="true"){
                    v="01"
                }
                else if (value=="0" || value =="false"){
                    v="00"
                }
                else {
                    throw new Error(`Cannot convert str from [${value}] for [${command}]`)
                }
            }
            else {
                throw new Error(`Cannot convert type from [${typeof(value)}] for [${command}]`)
            }
            line = `${c[0]}${c[1]} ${this.tvID(tvID)} ${v}`
        }
        else if (c[2] == typeof(int)) {
            line = `${c[0]}${c[1]} ${this.tvID(tvID)} ${value}`
        }
        else {
            if (c[0] == "aspect_ratio") {
            }
            else if (c[0] == "auto") {
                line = `${c[0]}${c[1]} ${this.tvID(tvID)} 01`
            }
            else if (c[0] == "tune") {

            }
            else if (c[0] == "key") {

            }
            else if (c[0] == "input") {

            }
        }
        return this.send(line)
            .then(response => {
                // a 01 OK01x
                const regex = /. \d+ (..)(.*)x/

                var found = null
                if (found=response.match(regex)) {
                    return { status: found[1], result: found[2] }
                }
                else {
                    throw new Error(`Unexpected Response [${response}]`)
                }
            })
    }
    get(command,tvID=null) {
        if (! _commands.hasOwnProperty(command)) {
            console.log(`Unknown command ${command}`)
            throw new Error(`Unknown command ${command}`)
        }

        const c=_commands[command]
        var line = null
        if (c[2] == typeof(bool)) {
            line = `${c[0]}${c[1]} ${this.tvID(tvID)} FF`
        }

        return this.send(line)
            .then(response => {
                const regex = /. \d+ (..)(.*)x/

                // a 01 OK01x
                var found = null
                if (found=response.match(regex)) {
                    return { status: found[1], result: found[2] }
                }
                else {
                    throw new Error(`Unexpected Response [${response}]`)
                }
            })
}
}

module.exports = LGTV
