const _commands = {
    "power" :          [ "k", "a", typeof(bool) ],
    "aspect_ratio" :   [ "k", "a", null ],
    "screen_mute" :    [ "k", "a", typeof(bool) ],
    "volume_mute" :    [ "k", "a", typeof(bool) ],
    "volume_control" : [ "k", "a", typeof(int) ],
    "contrast" :       [ "k", "a", typeof(int) ],
    "brightness" :     [ "k", "a", typeof(int) ],
    "colour" :         [ "k", "a", typeof(int) ],
    "tint" :           [ "k", "a", typeof(int) ],
    "sharpness" :      [ "k", "a", typeof(int) ],
    "osd" :            [ "k", "a", typeof(bool) ],
    "remote" :         [ "k", "a", typeof(bool) ],
    "treble" :         [ "k", "a", typeof(int) ],
    "bass" :           [ "k", "a", typeof(int) ],
    "balance" :        [ "k", "a", typeof(int) ],
    "temperature" :    [ "k", "a", typeof(int) ],
    "energy" :         [ "k", "a", typeof(int) ],
    "auto" :           [ "k", "a", null ],
    "tune" :           [ "k", "a", null ],
    "programme" :      [ "k", "a", typeof(bool) ],
    "key" :            [ "k", "a", null ],
    "backlight" :      [ "k", "a", typeof(int) ],
    "input" :          [ "k", "a", null ]
}

class LGTV {
    constructor(path) {
        this.defaultID=1
        this.path=path
        this.serialIO = require("serial-io")
    }
    send(string) {
        return this.serialIO.send(this.path,string + "\r",{"timeoutRolling":100})
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
