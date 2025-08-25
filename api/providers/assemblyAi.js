const { default: axios } = require("axios")

const baseUrl = 'https://api.assemblyai.com/v2'

const headers = {
    authorization: process.env.ASSEMBLY_AI_TOKEN
}

exports.assemblyAiProvider= axios.create({
        baseURL:baseUrl, headers
    })

