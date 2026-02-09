/**
 * Appends query parameters to a URL, handling both pretty and parameterized URLs
 * @param {string} baseUrl - The base URL (may already contain '?')
 * @param {URLSearchParams} params - The parameters to append
 * @returns {string} - The URL with parameters appended
 */
const appendQueryParams = (baseUrl, params) => {
  const queryString = params.toString()
  if (!queryString) return baseUrl
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}${queryString}`
}

/**
 * Handles API responses according to the standard format
 * @param {Response} response - Fetch Response object
 * @returns {Promise<*>} - The result data on success
 * @throws {Error} - Throws an error with the API error message on failure
 */
const handleResponse = async (response) => {
  const data = await response.json()

  // Success case - return the result directly
  if (response.ok && data.status === 'success') {
    return data.result
  }

  // Error case - throw an error with details from the response
  const errorMessage = data.message || 'Unknown API error'
  const errorCode = data.code || 'api_error'
  const error = new Error(errorMessage)
  error.code = errorCode
  error.data = data.data
  error.status = response.status
  throw error
}

/**
 * Load date units calendar
 * @param {Object} data - request data (date from, date to, rate plan)
 * @returns {Promise<Object>} - Date units calendar data
 */
const loadDateUnitCalendar = async (data) => {
  const endpoint = `${window.wpApiSettings.root}bflex/v1/dateUnits/calendar`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-WP-Nonce': window.BookiFlex.nonce,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('Failed to load reservation:', error)
    throw error
  }
}

/**
 * Load reservation details by ID
 * @param {string|number} id - Reservation ID
 * @returns {Promise<Object>} - Reservation details
 */
const loadReservation = async (id) => {
  const endpoint = `${window.wpApiSettings.root}bflex/v1/reservation/${id}`

  try {
    const response = await fetch(endpoint, {
      headers: {
        'X-WP-Nonce': window.BookiFlex.nonce,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    return await handleResponse(response)
  } catch (error) {
    console.error('Failed to load reservation:', error)
    throw error
  }
}

/**
 * Change reservation status
 * @param {Object} data - Status change data
 * @returns {Promise<Object>} - Updated status information
 */
const changeStatus = async (data) => {
  const endpoint = `${window.wpApiSettings.root}bflex/v1/reservation/status/update`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-WP-Nonce': window.BookiFlex.nonce,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('Failed to change status:', error)
    throw error
  }
}

/**
 * Find payment by ID
 * @param {Object} data - Contains payment ID
 * @returns {Promise<Object>} - Payment details
 */
const findPayment = async (data) => {
  const endpoint = `${window.wpApiSettings.root}bflex/v1/payment/item/${data.id}`

  try {
    const response = await fetch(endpoint, {
      headers: {
        'X-WP-Nonce': window.BookiFlex.nonce,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    return await handleResponse(response)
  } catch (error) {
    console.error('Failed to load payment:', error)
    throw error
  }
}

/**
 * Resolve payment penalty
 * @returns {Promise<Object>} - Updated status information
 * @param id - Reservation ID
 * @param comment - Comment for resolving
 */
const resolvePenalty = async (id, comment) => {
  const endpoint = `${window.wpApiSettings.root}bflex/v1/reservation/penalty/resolve`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-WP-Nonce': window.BookiFlex.nonce,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, comment }),
      credentials: 'include',
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('Failed to resole a penalty:', error)
    throw error
  }
}

/**
 * Create a capture payment token
 * @param {number} paymentId - Payment ID
 * @param {string} reservationSid - Reservation SID
 * @returns {Promise<Object>} - Token data
 */
const createCaptureToken = async (paymentId, reservationSid) => {
  const endpoint = `${window.wpApiSettings.root}bflex/v1/payment/token/capture`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-WP-Nonce': window.BookiFlex.nonce,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentId, reservationSid }),
      credentials: 'include',
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('Failed to create payment token:', error)
    throw error
  }
}

/**
 * Create a cancel payment token
 * @param {number} paymentId - Payment ID
 * @param {string} reservationSid - Reservation SID
 * @returns {Promise<Object>} - Token data
 */
const createCancelToken = async (paymentId, reservationSid) => {
  const endpoint = `${window.wpApiSettings.root}bflex/v1/payment/token/cancel`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-WP-Nonce': window.BookiFlex.nonce,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentId, reservationSid }),
      credentials: 'include',
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('Failed to create payment token:', error)
    throw error
  }
}

const processPaymentToken = async (token) => {
  try {
    const response = await fetch(token, {
      method: 'GET',
      credentials: 'include',
      redirect: 'follow',
    })

    return Promise.resolve({
      status: response.status === 200 ? 'success' : 'failure',
    })
  } catch (error) {
    console.error('Failed to create payment token:', error)
    throw error
  }
}

/**
 * Sync DateUnit Calendar with a parent rate plan
 * @param {Object} data - Contains rate plan ID and accommodation type ID
 * @returns {Promise<Object>} - Updated status information
 */
const syncDateUnits = async (data) => {
  const endpoint = `${window.wpApiSettings.root}bflex/v1/dateUnits/sync`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-WP-Nonce': window.BookiFlex.nonce,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('Failed to synchronization:', error)
    throw error
  }
}

const updateDateUnits = async (data) => {
  const endpoint = `${window.wpApiSettings.root}bflex/v1/dateUnits`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-WP-Nonce': window.BookiFlex.nonce,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('Failed to synchronization:', error)
    throw error
  }
}

/**
 * Load accommodation types
 * @returns {Promise<Object>} - Accommodation types data
 */
const loadAccommodationTypes = async () => {
  const endpoint = `${window.wpApiSettings.root}bflex/v1/accommodation-types`

  try {
    const response = await fetch(endpoint, {
      headers: {
        'X-WP-Nonce': window.BookiFlex.nonce,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('Failed to load accommodation types:', error)
    throw error
  }
}

/**
 * Load quota calendar
 * @param {Object} params - request params (dateFrom, dateTo, accommodationTypeId?)
 * @returns {Promise<Object>} - Quota data
 */
const loadQuotaCalendar = async ({ dateFrom, dateTo, accommodationTypeId }) => {
  const params = new URLSearchParams()
  if (dateFrom) params.append('dateFrom', dateFrom)
  if (dateTo) {
    // API uses exclusive dateTo, but calendar displays it inclusively
    const date = new Date(dateTo)
    date.setDate(date.getDate() + 1)
    params.append('dateTo', date.toISOString().split('T')[0])
  }
  if (accommodationTypeId) params.append('accommodationTypeId', accommodationTypeId)

  const baseUrl = `${window.wpApiSettings.root}bflex/v1/quota`
  const endpoint = appendQueryParams(baseUrl, params)

  try {
    const response = await fetch(endpoint, {
      headers: {
        'X-WP-Nonce': window.BookiFlex.nonce,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('Failed to load quota calendar:', error)
    throw error
  }
}

/**
 * Update stop sale flag for a specific accommodation type and date
 * @param {Object} data - Contains accommodationTypeId, date, stopSale
 * @returns {Promise<Object>} - Updated quota item
 */
const updateStopSale = async ({ accommodationTypeId, date, stopSale }) => {
  const endpoint = `${window.wpApiSettings.root}bflex/v1/quota/stop-sale/update`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-WP-Nonce': window.BookiFlex.nonce,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accommodationTypeId, date, stopSale }),
      credentials: 'include',
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('Failed to update stop sale:', error)
    throw error
  }
}

/**
 * Update available units for a specific accommodation type and date
 * @param {Object} data - Contains accommodationTypeId, date, available
 * @returns {Promise<Object>} - Updated quota item
 */
const updateAvailable = async ({ accommodationTypeId, date, available }) => {
  const endpoint = `${window.wpApiSettings.root}bflex/v1/quota/available/update`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-WP-Nonce': window.BookiFlex.nonce,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accommodationTypeId, date, available }),
      credentials: 'include',
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('Failed to update available:', error)
    throw error
  }
}

export {
  changeStatus,
  loadReservation,
  findPayment,
  resolvePenalty,
  createCaptureToken,
  createCancelToken,
  loadDateUnitCalendar,
  syncDateUnits,
  updateDateUnits,
  processPaymentToken,
  loadAccommodationTypes,
  loadQuotaCalendar,
  updateStopSale,
  updateAvailable,
}
