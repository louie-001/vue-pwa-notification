import Axios from "axios";

const axios = Axios.create({
    // 实际开发中应使用环境配置
    baseURL: 'http://192.168.3.90:3000',
    timeout: 10 * 1000,
    withCredentials: false
})

/**
 * 请求拦截器
 */
axios.interceptors.request.use(config => {
    config.headers.Authorization = sessionStorage.getItem('access_token')
    return config
}, error => {
    return Promise.reject(error)
})

/**
 * 响应拦截器
 */
axios.interceptors.response.use(response => {
    return response
}, error => {
    // 响应错误
    return Promise.reject(error)
})

export default axios
