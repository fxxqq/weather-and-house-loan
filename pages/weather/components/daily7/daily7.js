import { formatDate } from '../../../../utils/util'
import request from '../../../../service/request'

Component({
    properties: {
        location: {
            type: String,
            value: '',
            observer(val) {
                if (val) {
                    let nowTimeDaily7 = +new Date()
                    this.getDaily(nowTimeDaily7)
                }
            }
        }
    },
    lifetimes: {
        ready() {
            let cacheData = wx.getStorageSync('cache-data') ? JSON.parse(wx.getStorageSync('cache-data')) : null;
            let nowTimeDaily7 = +new Date()
            if (cacheData && cacheData.daily7Datas) {
                if (nowTimeDaily7 - cacheData.nowTimeDaily7 < 10 * 60 * 1000) {
                    this.setData({
                        daily7Datas: cacheData.daily7Datas
                    })
                } else {
                    this.getDaily(nowTimeDaily7)
                }
            } else {
                this.getDaily(nowTimeDaily7)
            }


        },
    },
    data: {
        daily7Datas: [],

    },
    observers: {
        location() {

        }
    },


    methods: {
        async getDaily(nowTimeDaily7, day = 7) {
            let dailyRes = await request({
                apiType: 'qweather',
                url: `/v7/weather/${day}d`,
                data: {
                    location: this.data.location,

                },
            })
            dailyRes.daily.map((item, index) => {
                item.fxDateFormat = '周' + '日一二三四五六'.charAt(new Date(item.fxDate).getDay()) + ' ' + formatDate(new Date(item.fxDate), 'MM-dd')
                dailyRes.daily[index] = {
                    fxDateFormat: item.fxDateFormat,
                    iconDay: item.iconDay,
                    iconNight: item.iconNight,
                    tempMin: item.tempMin,
                    tempMax: item.tempMax,
                    textDay: item.textDay,
                    textNight: item.textNight
                }
                if (index === 0) {
                    dailyRes.daily[index].fxDateFormat = '今天' + ' ' + formatDate(new Date(item.fxDate), 'MM-dd')
                }
                if (index === 1) {
                    dailyRes.daily[index].fxDateFormat = '明天' + ' ' + formatDate(new Date(item.fxDate), 'MM-dd')
                }

            })
            console.log("dailyRes.daily", dailyRes.daily)
            this.setData({
                daily7Datas: dailyRes.daily
            })

            let cacheData = wx.getStorageSync('cache-data') ? JSON.parse(wx.getStorageSync('cache-data')) : null;
            cacheData.nowTimeDaily7 = nowTimeDaily7
            cacheData.daily7Datas = dailyRes.daily
            wx.setStorageSync("cache-data", JSON.stringify(cacheData))


        },



    }
})
