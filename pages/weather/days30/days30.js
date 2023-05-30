import request from '../../../service/request'

import jsonData from './data'
Page({
    data: {
        weekList: ['一', '二', '三', '四', '五', '六', '日'],
        daily30Datas: []
    },
    onLoad() {
        let cacheData = wx.getStorageSync('cache-data') ? JSON.parse(wx.getStorageSync('cache-data')) : null;
        let nowTimeDaily30 = +new Date()
        if (cacheData && cacheData.daily30Datas) {
            if (nowTimeDaily30 - cacheData.nowTimeDaily30 < 60 * 60 * 1000) {
                this.setData({
                    daily30Datas: cacheData.daily30Datas
                })
            } else {
                this.getDaily(nowTimeDaily30)
            }
        } else {
            this.getDaily(nowTimeDaily30)
        }
    },


    async getDaily(nowTimeDaily30, day = 30) {
        console.log("this", this)
        let dailyRes = await request({
            apiType: 'qweather',
            isVip: true,
            url: `/v7/weather/${day}d`,
            data: {
                location: wx.getStorageSync('location') || '',
            },
        })
        console.log("dailyRes", JSON.stringify(dailyRes))
        // let dailyRes = jsonData

        console.log("dailyRes", dailyRes)
        let prefix = []
        if (new Date(dailyRes.daily[0].fxDate).getDay()) {
            prefix = new Array(new Date(dailyRes.daily[0].fxDate).getDay() - 1)
        }

        dailyRes.daily.map((item, index) => {
            dailyRes.daily[index] = {
                day: new Date(item.fxDate).getDate() === 1 ? new Date(item.fxDate).getMonth() + 1 + '月' : new Date(item.fxDate).getDate(),
                iconDay: item.iconDay,
                iconNight: item.iconNight,
                tempMin: item.tempMin,
                tempMax: item.tempMax,
                textDay: item.textDay,
                textNight: item.textNight
            }
            if (index === 0) {
                dailyRes.daily[index].day = '今天'
            }
        })

        console.log("dailyRes.daily", dailyRes.daily)
        this.setData({
            daily30Datas: [...prefix, ...dailyRes.daily]
        })

        let cacheData = wx.getStorageSync('cache-data') ? JSON.parse(wx.getStorageSync('cache-data')) : null;
        cacheData.nowTimeDaily30 = nowTimeDaily30
        cacheData.daily30Datas = [...prefix, ...dailyRes.daily]
        wx.setStorageSync("cache-data", JSON.stringify(cacheData))
        // this.initChart()

    },
})