import axios from 'axios'

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  isRefreshing = false
  failedQueue = []
}

export const setupAxiosInterceptors = (getAuthState) => {
  axios.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then(token => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`
              return axios(originalRequest)
            })
            .catch(err => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const authState = getAuthState()
          await authState.refreshAccessToken()
          const newState = getAuthState()
          processQueue(null, newState.accessToken)
          originalRequest.headers['Authorization'] = `Bearer ${newState.accessToken}`
          return axios(originalRequest)
        } catch (err) {
          processQueue(err, null)
          return Promise.reject(err)
        }
      }

      return Promise.reject(error)
    }
  )
}
