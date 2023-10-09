import axios from 'axios'

const client = axios.create({
    baseURL: process.env.blockchainbaseurl,
    timeout: parseInt(process.env.httptimeoutinmilis || '10000')
  });

export default client
