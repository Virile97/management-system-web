"use server"

import axios from "axios"

const api = axios.create({
  baseURL: process.env.BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
    "App-Api-Key": process.env.APP_API_KEY,
  },
})

function withAuthHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export { api, withAuthHeader }
export default api
