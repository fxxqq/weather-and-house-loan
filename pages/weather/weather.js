import { formatDate, cmpVersion } from '../../utils/util'
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
    isRainfall: true,
    warning: null,
    warningShow: false,
    // 是否切换了城市
    located: true,
    // 用来清空 input
    searchText: '',

    setting: {},

    locationName: '',
    nowData: {},
    isUseCache: false,
    weatherData: null
  },

  onLoad() {
    this.initPage()
  },
  initPage(location) {
    if (!location) {
      this.initLocation()
    } else {

    }
  },
  initLocation(callback) {
    this.setData({
      located: true,
    })
    wx.getLocation({
      success: (res) => {

        let location = `${res.longitude},${res.latitude}`
        let cacheData = wx.getStorageSync('cache-data') ? JSON.parse(wx.getStorageSync('cache-data')) : null;
        let nowTime = +new Date()
        console.log("cacheData", cacheData)
        if (cacheData) {

          console.log("nowTime - cacheData.nowTime", nowTime - cacheData.nowTime)
          if (nowTime - cacheData.nowTime < 60 * 1000) {
            console.log("调用缓存里的数据", cacheData)
            this.setData({
              globalLoading: false,
              location,
              weatherData: cacheData
            })
          } else {
            cacheData.nowTime = nowTime
            //超过5分钟重新调用接口数据
            wx.setStorageSync("cache-data", JSON.stringify(cacheData))
            this.getWeatherRefresh(location)
          }
        } else {
          wx.setStorageSync("cache-data", JSON.stringify({
            nowTime
          }))
          this.getWeatherRefresh(location)
        }
      },
      fail: (res) => {
        this.getLocationFail(res)
      }
    })
    callback && callback()
  },
  reloadWeather() {
    if (this.data.located) {
      this.initLocation()
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



  search(val, callback) {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300,
    })
    if (val) {
      this.setData({
        located: false,
        location: val,
      })

      this.getWeatherRefresh(val)

    }
    callback && callback()
  },

  getWeatherRefresh(location) {
    console.log("location", location)
    
    wx.setStorageSync("location", location)
    this.setData({ location }, async () => {
      Promise.all([
        await this.getLocationCity(),
        await this.getWeatherNow(),
        await this.indiceServer(),
        await this.airServer(),
        await this.warningServer(),
        await this.minutelyServer()
      ]).then(data => {
        console.log("all-data", data)
        let cacheData = wx.getStorageSync('cache-data') ? JSON.parse(wx.getStorageSync('cache-data')) : null;
        console.log("cacheData", cacheData)
        data.map(item => {
          if (item) {
            cacheData = {
              ...cacheData,
              ...item,
            }
          }

        })

        wx.setStorageSync("cache-data", JSON.stringify(cacheData))
        this.setData({
          globalLoading: false,
          weatherData: cacheData
        })
      })
      // if (this.data.isRainfall) {
      //   this.minutelyServer()
      // }
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
    let locationName
    let res = await request({
      apiType: 'geo',
      url: '/v2/city/lookup',
      data: {
        location: this.data.location,
      },
    })
    console.log("getLocationCity", res.location[0])
    if (res.code === '200') {
      locationName = `${res.location[0].adm1 || ''} ${res.location[0].adm2 || ''}${res.location[0].name}`
      this.setData({
        locationName
      })
    }
    return { locationName }
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

      wx.stopPullDownRefresh()


      return {
        temp: nowData.temp,
        text: nowData.text,
        text_en: nowData.text_en,
        windDir: nowData.windDir,
        windScale: nowData.windScale,
        vis: nowData.vis,
        humidity: nowData.humidity,
        icon: nowData.icon,
        precip: nowData.precip,
        obsTimeFormat: formatDate(new Date(nowData.obsTime), "yy-MM-dd hh:mm"),
        feelsLike: nowData.feelsLike
      }
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
      return {
        comfText: indiceRes.daily[0].text
      }
    } else {
      return null
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
    return {
      rainfall: minutelyRes.summary
    }
  },
  async warningServer(cb) {
    let warning
    let warningRes = await request({
      apiType: 'qweather',
      url: `/v7/warning/now`,
      data: {
        location: this.data.location
      },
    })
    cb && cb()
    if (warningRes.code === '200') {
      warning = warningRes.warning && warningRes.warning.length ? warningRes.warning : null
    }
    return {
      warning
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
      return {
        aqi: airingRes.now.aqi,
        category: airingRes.now.category
      }
    }

  },

  onPullDownRefresh(res) {
    this.reloadPage()
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

    this.setData({
      warningShow: true
    })

  },
  hideWarningToast() {
    this.setData({
      warningShow: false
    })
  },
  refresh() {
    this.getWeatherRefresh(this.data.location)
  },
  goToDay30() {
    wx.navigateTo({
      url: '/pages/weather/days30/days30?location=' + this.data.location
    })
  }
})
