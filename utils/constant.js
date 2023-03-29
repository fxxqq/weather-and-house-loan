/* 请求地址 */
export const freeUrl = 'https://devapi.qweather.com' //免费订阅api 用于调试
export const httpUrl = 'https://api.qweather.com'    //计费api
export const geoapiUrl = 'https://geoapi.qweather.com'  //城市api
// /* http错误码 */
export const errCodeArr = [500, 502, 503, 504, 403, 404, 400, 401]
export const errMsgMap = {
    400: '参数错误。',
    401: '登录失效',
    403: '拒绝访问',
    404: '地址不存在',
    500: '服务器繁忙',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时'
}

