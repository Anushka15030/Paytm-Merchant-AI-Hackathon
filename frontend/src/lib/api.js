import axios from "axios"

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
})

export const invoiceApi = axios.create({
  timeout: 10000,
})

export function getApiError(error) {
  const detail = error?.response?.data?.detail
  if (typeof detail === "string") return detail
  if (detail) return JSON.stringify(detail)
  return error?.message || "Unable to connect to the merchant backend."
}

export default api
