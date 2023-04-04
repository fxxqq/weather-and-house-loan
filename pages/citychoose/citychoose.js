let staticData = require('../../data/staticData.js')

import request from '../../service/request'
Page({
  data: {
    alternative: null,
    cities: [],
    // 需要显示的城市
    showItems: null,
    inputText: '',
    hotCities: [],
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
  // 按照字母顺序生成需要的数据格式
  getSortedAreaObj(areas) {
    // let areas = staticData.areas
    areas = areas.sort((a, b) => {
      if (a.letter > b.letter) {
        return 1
      }
      if (a.letter < b.letter) {
        return -1
      }
      return 0
    })
    let obj = {}
    for (let i = 0, len = areas.length; i < len; i++) {
      let item = areas[i]
      delete item.districts
      let letter = item.letter
      if (!obj[letter]) {
        obj[letter] = []
      }
      obj[letter].push(item)
    }
    // 返回一个对象，直接用 wx:for 来遍历对象，index 为 key，item 为 value，item 是一个数组
    return obj
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
      if (name) {
        console.log(name)
      }

      weatherPage.initLocation({}, () => {
        wx.navigateBack({})
      })
    }
  },

  async getHotCities() {
    let res = await request({
      apiType: 'geo',
      url: '/v2/city/top',
    })

    if (res.code === '200') {
      this.setData({
        hotCities: res.topCityList
      })

    }
  },
  onLoad() {
    this.getHotCities()
    let cities = this.getSortedAreaObj(staticData.cities || [])
    this.setData({
      cities,
      showItems: cities,
    })
  },
})