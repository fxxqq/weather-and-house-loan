import { httpUrl, errCodeArr, errMsgMap, freeUrl, geoapiUrl } from '../utils/constant'
// 这几个方法主要是从本次取出后台返回的token、判断变量是否是Object、返回网络情况，代码就不展示了
// import { getToken } from '../utils/storage'
import { privateKey, freeKey } from '../utils/private-key'
import { isObject } from '../utils/type'
import { getNetworkType } from '../utils/system'

export default function request(options, finishCb) {
    let isFree = true //是否使用免费开发api


    return new Promise(async (resolve, reject) => {
        const networkRes = await getNetworkType()
        if (networkRes.networkType === 'none') {
            wx.showToast({
                title: '无网络！',
                icon: 'none'
            })
            reject(networkRes)
            return
        }

        // const token = getToken()
        // if (!token) {
        //     wx.showToast({
        //         title: '暂未登录',
        //         icon: 'none'
        //     })
        //     return
        // }

        let {
            apiType,
            url,
            method = 'GET',
            title = '加载中...',      // loading文字
            failText = '请求数据失败', // 请求失败描述
            errTip = 'toast',        // 错误提示，是Toast还说Modal
            data = {},
            header = {},
            isHideErrorTip = false,
            mask = false,            // 是否开启mask
            loading = false,          // 是否loading
            timeout = 8000,          // 超时时间
            hideLoadingTime = 500,   // 多少毫秒隐藏loading
            isVip = false
        } = options
        if (isVip) {
            isFree = false
        }
        const tHeader = {
            // 'cookie': token,
            ...header
        }
        if (apiType) {
            data = {
                ...data,
                key: isFree ? freeKey : privateKey
            }
        }
        if (apiType === 'qweather') {
            url = (isFree ? freeUrl : httpUrl) + url
        } else if (apiType === 'geo') {
            url = geoapiUrl + url
        }

        loading && wx.showLoading({ title, mask })
        wx.request({
            url,
            method,
            timeout,
            data,
            header: tHeader,
            success(res) {
                wx.hideLoading()
                if (!isObject(res.data)) {
                    wx.showToast({
                        title: '服务端异常',
                        icon: 'error'
                    })
                    return
                }
                // 针对错误码进行处理
                const { data = {} } = res
                const statusCode = Number(data.code)

                if (errCodeArr.includes(statusCode)) {
                    if (!isHideErrorTip) {
                        wx.showToast({
                            title: data.msg || errMsgMap[statusCode] || '',
                            icon: 'error'
                        })
                    }

                    return Promise.reject(res)
                }



                resolve(data)
            },
            fail(err) {
                console.log("err", err)
                wx.showToast({
                    title: failText || '',
                    icon: 'error',
                    duration: 250000,
                })

                reject(err)
            },
            complete() {
                const timer = setTimeout(() => {
                    wx.hideLoading()
                    clearTimeout(timer)
                }, hideLoadingTime)
                options.finishCb && options.finishCb()
            }
        })
    })
}

