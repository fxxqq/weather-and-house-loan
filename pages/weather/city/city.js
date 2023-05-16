import request from '../../../service/request'
function uniqueFunc(arr, uniId) {
  const res = new Map();
  let ans = []
  for (let i = 0; i < arr.length; i++) {
    let item = arr[i]
    console.log(item.name, res.has(item[uniId]))
    ans.push(item)
    if (!res.has(item[uniId])) {
      res.set(item[uniId], i)
    } else {
      ans.splice(res.get(item[uniId]), 1)
    }
  }
  console.log('ans', ans)
  if (ans.length > 4) {
    ans = [...ans.slice(1, 5)]
  }

  return ans
}


Page({
  data: {
    alternative: null,
    showItems: null,
    inputText: '',
    hotCities: [],
    hisCities: [],
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
    console.log('e-choose', e)
    const { lon, lat, name } = e.currentTarget.dataset

    let location = `${Number(lon)},${Number(lat)}`
    let pages = getCurrentPages()
    let len = pages.length
    let weatherPage = pages[len - 2]

    if (lon && lat) {
      let hisCities = wx.getStorageSync('city-data') ? wx.getStorageSync('city-data') : []

      hisCities.push({
        name,
        lat,
        lon,
      })

      hisCities = uniqueFunc(hisCities, 'name')
      console.log("hisCities2", hisCities)
      if (hisCities.length > 5) {
        this.setData({
          hisCities: hisCities.reverse()
        }, () => {
          wx.setStorageSync('city-data', hisCities.reverse())
          weatherPage.search(location, () => {
            wx.navigateBack({})
          })
        })
      } else {
        this.setData({
          hisCities: hisCities.reverse()
        }, () => {
          wx.setStorageSync('city-data', hisCities.reverse())
          weatherPage.search(location, () => {
            wx.navigateBack({})
          })
        })
      }


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
      console.log(item.name, JSON.stringify(this.data.popularCities).indexOf(item.name))
      if (JSON.stringify(this.data.popularCities).indexOf(item.name) === -1) {
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
    console.log("hisCities1", wx.getStorageSync('city-data') ? wx.getStorageSync('city-data') : [])

    let cities = []
    this.setData({
      cities,
      showItems: cities,
      hisCities: wx.getStorageSync('city-data') ? wx.getStorageSync('city-data').reverse() : []
    })
  },
})