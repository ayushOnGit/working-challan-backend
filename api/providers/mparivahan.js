const { default: axios } = require("axios")

exports.mparviahanProvider= axios.create({ baseURL:process.env.MPARVIHANA_REMOTE_SERVER, headers:{
    "ngrok-skip-browser-warning": true
} })

