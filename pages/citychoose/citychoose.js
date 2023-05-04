import request from '../../service/request'
Page({
  data: {
    alternative: null,
    cities: [],
    // 需要显示的城市
    showItems: null,
    inputText: '',
    hotCities: [],

    popularCities: [{
      name: '北京',
      lat: "39.90499",
      lon: "116.40529",
    }, {
      name: '上海',
      lat: "31.23171",
      lon: "121.47264",
    },
    {
      name: '广州',
      lat: "23.12518",
      lon: "113.28064",
    },
    {
      name: '深圳',
      lat: "22.54700",
      lon: "114.08595",
    },
    {
      name: '杭州',
      lat: "30.24603",
      lon: "120.21079",
    },
    {
      name: '南京',
      lat: "32.04155",
      lon: "118.76741",
    },

    {
      name: '天津',
      lat: "39.12560",
      lon: "117.19019",
    },
    {
      name: '武汉',
      lat: "30.58435",
      lon: "114.29857",
    },
    {
      name: '西安',
      lat: "34.34321",
      lon: "108.93965",
    },
    {
      name: '苏州',
      lat: "31.29938",
      lon: "120.61958",
    },
    {
      name: '郑州',
      lat: "34.75798",
      lon: "113.66541",
    },
    {
      name: '重庆',
      lat: "29.56376",
      lon: "106.55046",
    }]
  },
  cancel() {
    this.setData({
      inputText: '',
      showItems: this.data.cities,
    })
  },
  inputFilter(e) {
    let cities = this.data.cities
    let value = e.detail.value.replace(/\s+/g, '')
    console.log("value", value)
    if (value.length) {
      this.lookup(value)
    } else {
      this.setData({
        showItems: cities,
      })
    }

  },

  async lookup(value) {
    let res = await request({
      apiType: 'geo',
      url: '/v2/city/lookup',
      isHideErrorTip: true,
      data: {
        location: value,
      },
    })
    console.log("res", res.location)
    if (value.length && res.code === '200') {
      this.setData({
        showItems: res.location,
      })
    } else {
      this.setData({
        showItems: cities,
      })
    }

  },
  choose(e) {
    console.log('e', e)
    const { lon, lat, name } = e.currentTarget.dataset

    let location = `${Number(lon)},${Number(lat)}`
    let pages = getCurrentPages()
    let len = pages.length
    let weatherPage = pages[len - 2]

    if (lon && lat) {
      weatherPage.search(location, () => {
        wx.navigateBack({})
      })
    } else {

      weatherPage.initLocation(() => {
        wx.navigateBack({})
      })
    }
  },

  async getHotCities() {
    let res = await request({
      apiType: 'geo',
      url: '/v2/city/top',
    })
    let hcList = []
    res.topCityList.map(item => {
      console.log(item.name, this.data.popularCities.includes(item.name))
      if (!this.data.popularCities.includes(item.name)) {
        hcList.push(item)
      }
    })
    console.log("hcList", hcList)
    if (res.code === '200') {
      this.setData({
        hotCities: hcList
      })

    }
  },
  onLoad() {
    this.getHotCities()
    let cities = []
    this.setData({
      cities,
      showItems: cities,
    })
  },
})