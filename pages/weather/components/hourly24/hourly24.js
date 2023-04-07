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
            let nowTimeHourly24 = +new Date()
            if (cacheData && cacheData.hourly24Datas) {
                if (nowTimeHourly24 - cacheData.nowTimeHourly24 < 5 * 60 * 1000) {
                    let startRainTime
                    cacheData.hourly24Datas.map((item, index) => {
                        if (item.text.indexOf('雨') > -1 && startRainTime) {
                            startRainTime = formatDate(new Date(item.fxTime), "hh:mm")
                        }
                      
                        cacheData.hourly24Datas[index] = {
                            fxTimeFormat: formatDate(new Date(item.fxTime), 'hh:mm'),
                            text: item.text,
                            temp: item.temp,
                            windDir: item.windDir,
                            windScale: item.windScale
                        }
                    })
                    this.setData({
                        startRainTime,
                        hourly24Datas: cacheData.hourly24Datas
                    })
                } else {
                    console.log('ready1.2')
                    this.getHourly(nowTimeHourly24)
                }
            } else {
                console.log('ready3')
                this.getHourly(nowTimeHourly24)
            }
        },

    },
    data: {
        hourly24Datas: [],
        startRainTime: ''
    },
    methods: {
        async getHourly(nowTimeHourly24, hour = 24) {
            let hourly24DatasRes = await request({
                apiType: 'qweather',
                url: `/v7/weather/${hour}h`,
                data: {
                    location: this.data.location,
                },
            })
            let startRainTime
            hourly24DatasRes.hourly.map(item => {
                if (item.text.indexOf('雨') > -1 && startRainTime) {
                    startRainTime = formatDate(new Date(item.fxTime), "hh:mm")
                }
                item.fxTimeFormat = formatDate(new Date(item.fxTime), 'hh:mm')
            })
            this.setData({
                startRainTime: startRainTime,
                hourly24Datas: hourly24DatasRes.hourly || []
            })
            let cacheData = wx.getStorageSync('cache-data') ? JSON.parse(wx.getStorageSync('cache-data')) : null;
            cacheData.nowTimeHourly24 = nowTimeHourly24 || +new Date()
            cacheData.hourly24Datas = hourly24DatasRes.hourly || []
            wx.setStorageSync("cache-data", JSON.stringify(cacheData))

        },
    },


})
