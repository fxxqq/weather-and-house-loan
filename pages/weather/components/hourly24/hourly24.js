import { formatDate } from '../../../../utils/util'
import request from '../../../../service/request'
import * as echarts from '../../../components/ec-canvas/echarts' // 或者从本地引入自定义构建的 echarts
function initChart(canvas, width, height, dpr) {
    console.log(canvas, width, height, dpr)

    const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // 像素
    });
    canvas.setChart(chart);

    var option = {
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: [820, 932, 901, 934, 1290, 1330, 1320, 820, 932, 901, 934, 1290, 1330, 1320, 820, 932, 901, 934, 1290, 1330, 1320],
            type: 'line'
        }]


    };
    chart.setOption(option);
    return chart;
}


Component({
    properties: {
        location: {
            type: String,
            value: '',
            observer(val) {
                if (val) {
                    let nowTimeHourly24 = +new Date()
                    this.getHourly(nowTimeHourly24)
                }
            }
        }
    },
    lifetimes: {
        ready() {
            let cacheData = wx.getStorageSync('cache-data') ? JSON.parse(wx.getStorageSync('cache-data')) : null;
            let nowTimeHourly24 = +new Date()
            if (cacheData && cacheData.hourly24Datas) {
                if (nowTimeHourly24 - cacheData.nowTimeHourly24 < 5 * 60 * 1000) {
                    let startRainTimeFormat = ''
                    cacheData.hourly24Datas.map((item, index) => {
                        if (item.text.indexOf('雨') > -1 && !startRainTimeFormat) {
                            startRainTimeFormat = getDayName(item.fxTime) + formatDate(new Date(item.fxTime), "hh:mm")
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
                        startRainTime: startRainTimeFormat,
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
        startRainTime: '',
        ec: {
            onInit: initChart
        }
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
            let startRainTimeFormat = ''
            hourly24DatasRes.hourly.map(item => {
                if (item.text.indexOf('雨') > -1 && !startRainTimeFormat) {
                    startRainTimeFormat = getDayName(item.fxTime) + formatDate(new Date(item.fxTime), "hh:mm")
                }
                item.fxTimeFormat = formatDate(new Date(item.fxTime), 'hh:mm')
            })
            this.setData({
                startRainTime: startRainTimeFormat,
                hourly24Datas: hourly24DatasRes.hourly || []
            })
            let cacheData = wx.getStorageSync('cache-data') ? JSON.parse(wx.getStorageSync('cache-data')) : null;
            cacheData.nowTimeHourly24 = nowTimeHourly24 || +new Date()
            cacheData.hourly24Datas = hourly24DatasRes.hourly || []
            wx.setStorageSync("cache-data", JSON.stringify(cacheData))

        },
    },


})
