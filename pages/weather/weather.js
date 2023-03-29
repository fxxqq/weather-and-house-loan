import { formatDate, cmpVersion, isEmptyObject } from '../../utils/util'
import request from '../../service/request'
let globalData = getApp().globalData

Page({
  data: {
    globalLoading: true,
    isIPhoneX: globalData.isIPhoneX,
    location: '',
    weatherIconUrl: globalData.weatherIconUrl,
    comfText: '',

    rainfall: '',
    isRainfall: false,
    warning: null,
    warningShow: false,
    // 是否切换了城市
    located: true,
    // 用来清空 input
    searchText: '',
    // 是否已经弹出
    hasPopped: false,



    // 需要查询的城市
    searchCity: '',
    setting: {},


    locationName: '',
    nowData: {}
  },

  onLoad() {
    this.reloadPage()
  },
  reloadWeather() {
    console.log("this.data.located")
    if (this.data.located) {
      this.init({})
    } else {
      this.search(this.data.searchCity)
      this.setData({
        searchCity: '',
      })
    }
  },
  reloadPage() {
    this.reloadWeather()
  },
  commitSearch(res) {
    let val = ((res.detail || {}).value || '').replace(/\s+/g, '')
    this.search(val)
  },

  clearInput() {
    this.setData({
      searchText: '',
    })
  },
  search(val, callback) {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300,
    })
    if (val) {
      this.setData({
        located: false,
      })
      console.log("val", val)
      this.getWeatherRefresh(val)

    }
    callback && callback()
  },
  getWeatherRefresh(location) {
    console.log("location", location)
    this.setData({ location }, () => {

      Promise.all([this.getLocationCity(), this.getWeatherNow(), this.indiceServer(), this.airServer()]).then(data => {
        this.setData({
          globalLoading: false
        })
      })
      if (this.data.isRainfall) {
        this.minutelyServer()

      }
    })

  },
  // wx.openSetting 要废弃，button open-type openSetting 2.0.7 后支持
  // 使用 wx.canIUse('openSetting') 都会返回 true，这里判断版本号区分
  canUseOpenSettingApi() {
    let systeminfo = getApp().globalData.systeminfo
    let SDKVersion = systeminfo.SDKVersion
    let version = cmpVersion(SDKVersion, '2.0.7')
    if (version < 0) {
      return true
    } else {
      return false
    }
  },
  init(params, callback) {
    this.setData({
      located: true,
    })
    wx.getLocation({
      success: (res) => {
        console.log("res", res)
        let location = `${res.longitude.toFixed(2)},${res.latitude.toFixed(2)}`
        this.getWeatherRefresh(location)
        callback && callback()
      },
      fail: (res) => {
        this.getLocationFail(res)
      }
    })
  },
  success(data, location) {
    this.setData({

      searchCity: location,
    })
    wx.stopPullDownRefresh()
    let now = new Date()
    // 存下来源数据
    data.updateTime = now.getTime()
    data.updateTimeFormat = formatDate(now, "MM-dd hh:mm")
    wx.setStorage({
      key: 'cityDatas',
      data,
    })
    this.setData({
      cityDatas: data,
    })
  },
  getLocationFail(res) {
    wx.stopPullDownRefresh()
    let errMsg = res.errMsg || ''
    // 拒绝授权地理位置权限
    if (errMsg.indexOf('deny') !== -1 || errMsg.indexOf('denied') !== -1) {
      wx.showToast({
        title: '需要开启地理位置权限',
        icon: 'none',
        duration: 2500,
        success: (res) => {
          if (this.canUseOpenSettingApi()) {
            let timer = setTimeout(() => {
              clearTimeout(timer)
              wx.openSetting({})
            }, 2500)
          }
        },
      })
    } else {
      wx.showToast({
        title: '网络不给力，请稍后再试',
        icon: 'none',
      })
    }
  },
  async getLocationCity() {
    this.data.locationName = '定位中...'
    let res = await request({
      apiType: 'geo',
      url: '/v2/city/lookup',
      data: {
        location: this.data.location,
      },
    })
    console.log("getLocationCity", res.location[0].name)
    if (res.code === '200') {
      this.setData({
        locationName: res.location[0].name
      })

    }
  },
  async getWeatherNow() {
    // 实时天气:https://dev.qweather.com/docs/api/weather/weather-now/
    let weatherNowDataRes = await request({
      apiType: 'qweather',
      url: '/v7/weather/now',
      data: {
        location: this.data.location,
      }
    })

    if (weatherNowDataRes.code === '200') {
      let nowData = weatherNowDataRes.now

      nowData.obsTimeFormat = formatDate(new Date(nowData.obsTime), "yy-MM-dd hh:mm")

      const textList = ['晴', '雨', '雪', '云', '雾', '阴']
      const textEnList = ['sun', 'rain', 'snow', 'cloudy', 'haze', 'cloudy']
      for (let i = 0; i < textList.length; i++) {
        if (nowData.text.indexOf(textList[i]) > -1) {
          nowData.text_en = textEnList[i]
        }
      }

      this.setData({
        nowData
      })
      this.clearInput()
      console.log("nowData, location", nowData, location)
      this.success(nowData, location)
    }
  },

  async indiceServer(day = 1) {
    let indiceRes = await request({
      apiType: 'qweather',
      url: `/v7/indices/${day}d`,
      data: {
        location: this.data.location,
        type: '7',
      },
    })
    if (indiceRes.code === '200') {
      this.setData({
        comfText: indiceRes.daily[0].text
      })
    } else {
      this.setData({
        comfText: ''
      })
    }

  },
  async minutelyServer() {
    let minutelyRes = await request({
      apiType: 'qweather',
      url: `/v7/minutely/5m`,
      data: {
        location: this.data.location
      },
    })
    if (minutelyRes.code === '200') {
      this.setData({
        rainfall: minutelyRes.summary
      })
    }

  },
  async warningServer(cb) {
    let warningRes = await request({
      apiType: 'qweather',
      url: `/v7/warning/now`,
      data: {
        location: this.data.location
      },
    })
    cb && cb()
    if (warningRes.code === '200') {
      this.setData({
        warning: warningRes.warning && warningRes.warning.length ? warningRes.warning[0] : null
      })
    }

  },
  async airServer() {
    let airingRes = await request({
      apiType: 'qweather',
      url: `/v7/air/now`,
      data: {
        location: this.data.location
      },
    })

    if (airingRes.code === '200') {
      this.setData({
        airNow: airingRes.now
      })
    }

  },

  onPullDownRefresh(res) {
    this.reloadPage()
  },
  getCityDatas() {
    let cityDatas = wx.getStorage({
      key: 'cityDatas',
      success: (res) => {
        this.setData({
          cityDatas: res.data,
        })

      },
    })
    console.log("cityDatas", cityDatas)
  },
  openSetting() { },




  checkUpdate(setting) {
    // 兼容低版本
    if (!setting.forceUpdate || !wx.getUpdateManager) {
      return
    }
    let updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate((res) => {
      console.error(res)
    })
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已下载完成，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })
    })
  },


  toCitychoose() {
    wx.navigateTo({
      url: '/pages/citychoose/citychoose',
    })
  },
  initSetting(successFunc) {
    wx.getStorage({
      key: 'setting',
      success: (res) => {
        let setting = res.data || {}
        this.setData({
          setting,
        })
        successFunc && successFunc(setting)
      },
      fail: () => {
        this.setData({
          setting: {},
        })
      },
    })
  },
  reloadInitSetting() {
    this.initSetting((setting) => {
      this.checkUpdate(setting)
    })
  },
  onShareAppMessage(res) {
    return {
      title: '出行天气早知道',
      path: '/pages/weather/weather',
      // imageUrl: '/img/share.jpg',
    }
  },
  getRainfall() {
    if (this.data.isRainfall) {
      return
    }
    this.setData({
      isRainfall: true
    }, () => {
      this.minutelyServer(this.data.location)
    })
  },
  openWarningToast() {
    this.warningServer(() => {
      this.setData({
        warningShow: true
      })
    })

  },
  hideWarningToast() {
    this.setData({
      warningShow: false
    })
  }
})
