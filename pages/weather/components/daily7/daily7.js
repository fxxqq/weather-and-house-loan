import { formatDate } from '../../../../utils/util'
import request from '../../../../service/request'

let Chart = null
import * as echarts from '../../../components/ec-canvas/echarts';
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
        ec: []
        // ec: {
        //     onInit: initChart
        // }
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

            })
            console.log("dailyRes.daily", dailyRes.daily)
            this.setData({
                daily7Datas: dailyRes.daily
            })

            let cacheData = wx.getStorageSync('cache-data') ? JSON.parse(wx.getStorageSync('cache-data')) : null;
            cacheData.nowTimeDaily7 = nowTimeDaily7
            cacheData.daily7Datas = dailyRes.daily
            wx.setStorageSync("cache-data", JSON.stringify(cacheData))
            // this.initChart()

        },
        initChart() {
            //获取到折线图 <ec-canvas> 的id，然后再获取数据塞就可以了。
            this.echartsComponnet = this.selectComponent('#chartLineDaily')
            console.log(this.echartsComponnet)
            this.echartsComponnet.init((canvas, width, height) => {
                console.log(canvas, echarts)
                // 初始化图表
                Chart = echarts.init(canvas, null, {
                    width: width,
                    height: height
                });
                let option = {}
                Chart.setOption(option);
            });


        },
        touchHandler: function (e) {
            console.log(lineChart.getCurrentDataIndex(e));
            lineChart.showToolTip(e, {
                // background: '#7cb5ec',
                format: function (item, category) {
                    return category + ' ' + item.name + ':' + item.data
                }
            });
        },
        createSimulationData: function () {
            var categories = [];
            var data = [];
            for (var i = 0; i < 10; i++) {
                categories.push('2016-' + (i + 1));
                data.push(Math.random() * (20 - 10) + 10);
            }
            // data[4] = null;
            return {
                categories: categories,
                data: data
            }
        },
        updateData: function () {
            var simulationData = this.createSimulationData();
            var series = [{
                name: '成交量1',
                data: simulationData.data,
                format: function (val, name) {
                    return val.toFixed(2) + '万';
                }
            }];
            lineChart.updateData({
                categories: simulationData.categories,
                series: series
            });
        },
    }
})
