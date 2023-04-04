import { formatDate } from '../../../../utils/util'
import request from '../../../../service/request'

Component({
    properties: {
        location: {
            type: String,
            value: ''
        }
    },
    lifetimes: {
        ready() {
            let cacheData = wx.getStorageSync('cache-data') ? JSON.parse(wx.getStorageSync('cache-data')) : null;
            let nowTime = +new Date()
            if (cacheData && cacheData.hourly24Datas) {
                if (nowTime - cacheData.nowTime < 30 * 60 * 1000) {
                    this.setData({
                        hourly24Datas: cacheData.hourly24Datas
                    })
                } else {
                    cacheData.nowTime = nowTime
                    //超过5分钟重新调用接口数据
                    wx.setStorageSync("cache-data", JSON.stringify(cacheData))
                    this.getHourly()
                }
            } else {
                this.getHourly()
            }
        },

    },
    data: {
        hourly24Datas: [],
    },
    methods: {
        async getHourly(hour = 24) {
            let hourly24DatasRes = await request({
                apiType: 'qweather',
                url: `/v7/weather/${hour}h`,
                data: {
                    location: this.data.location,
                },
            })

            hourly24DatasRes.hourly.map(item => {
                item.fxTimeFormat = formatDate(new Date(item.fxTime), 'hh:mm')
            })
            this.setData({
                hourly24Datas: hourly24DatasRes.hourly || []
            })
            let cacheData = wx.getStorageSync('cache-data') ? JSON.parse(wx.getStorageSync('cache-data')) : null;
            cacheData.nowTime = +new Date()
            cacheData.hourly24Datas = hourly24DatasRes.hourly || []
            wx.setStorageSync("cache-data", JSON.stringify(cacheData))

        },
    },


})
