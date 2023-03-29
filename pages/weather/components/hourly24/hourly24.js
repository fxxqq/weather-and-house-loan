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
            this.getHourly()
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
            console.log("hourly24DatasRes", hourly24DatasRes)
            hourly24DatasRes.hourly.map(item => {
                item.fxTimeFormat = formatDate(new Date(item.fxTime), 'hh:mm')
            })
            this.setData({
                hourly24Datas: hourly24DatasRes.hourly || []
            })
            console.log("hourly24DatasRes", hourly24DatasRes)
        },
    },


})
