
import { cmpVersion } from '../../utils/util'
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
Page({
  data: {
    setting: {},
    show: false,
    screenBrightness: '获取中',
    keepscreenon: false,
    SDKVersion: '',
    enableUpdate: true,
    weatherPage: {},
    avatarUrl: defaultAvatarUrl
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    this.setData({
      avatarUrl,
    })
  },
  switchChange(e) {
    let dataset = e.currentTarget.dataset
    let switchparam = dataset.switchparam
    let setting = this.data.setting
    if (switchparam === 'forceUpdate') {
      if (this.data.enableUpdate) {
        setting[switchparam] = (e.detail || {}).value
      } else {
        setting[switchparam] = false
        wx.showToast({
          title: '基础库版本较低，无法使用该功能',
          icon: 'none',
          duration: 2000,
        })
      }
    } else if (switchparam === 'keepscreenon') {
      this.setKeepScreenOn(!this.data.keepscreenon)
      getApp().globalData.keepscreenon = !this.data.keepscreenon
    } else {
      setting[switchparam] = !(e.detail || {}).value
    }
    this.setData({
      setting,
    })
    console.log("this.data.",this.data)
    wx.setStorage({
      key: 'setting',
      data: setting,
      success: () => {
        this.data.weatherPage.reloadInitSetting()
      },
    })
  },
  hide() {
    this.setData({
      show: false,
    })
  },
  updateInstruc() {
    this.setData({
      show: true,
    })
  },
  onShow() {
    let pages = getCurrentPages()
    let len = pages.length
    console.log("pages",pages,pages.length)
    let weatherPage = pages[len - 2]
    // 不能初始化到 data 里面！！！！
    this.setData({
      keepscreenon: getApp().globalData.keepscreenon,
      weatherPage,
    })
    this.ifDisableUpdate()
    this.getScreenBrightness()
    wx.getStorage({
      key: 'setting',
      success: (res) => {
        let setting = res.data
        this.setData({
          setting,
        })
      },
      fail: (res) => {
        this.setData({
          setting: {},
        })
      },
    })
  },
  ifDisableUpdate() {
    let systeminfo = getApp().globalData.systeminfo
    let SDKVersion = systeminfo.SDKVersion
    let version = cmpVersion(SDKVersion, '1.9.90')
    if (version >= 0) {
      this.setData({
        SDKVersion,
        enableUpdate: true,
      })
    } else {
      this.setData({
        SDKVersion,
        enableUpdate: false,
      })
    }
  },

  getScreenBrightness() {
    wx.getScreenBrightness({
      success: (res) => {
        this.setData({
          screenBrightness: Number(res.value * 100).toFixed(0),
        })
      },
      fail: (res) => {
        this.setData({
          screenBrightness: '获取失败',
        })
      },
    })
  },
  screenBrightnessChanging(e) {
    this.setScreenBrightness(e.detail.value)
  },
  setScreenBrightness(val) {
    wx.setScreenBrightness({
      value: val / 100,
      success: (res) => {
        this.setData({
          screenBrightness: val,
        })
      },
    })
  },
  setKeepScreenOn(b) {
    wx.setKeepScreenOn({
      keepScreenOn: b,
      success: () => {
        this.setData({
          keepscreenon: b,
        })
      },
    })
  },

  removeStorage(e) {
    let that = this
    let datatype = e.currentTarget.dataset.type
    if (datatype === 'setting') {
      wx.showModal({
        title: '提示',
        content: '确认要初始化设置',
        cancelText: '容朕想想',
        confirmColor: '#40a7e7',
        success: (res) => {
          if (res.confirm) {
            wx.removeStorage({
              key: 'setting',
              success: function (res) {
                wx.showToast({
                  title: '设置已初始化',
                })
                that.setData({
                  setting: {},
                })
                that.data.weatherPage.reloadInitSetting()
              },
            })
          }
        },
      })
    } else if (datatype === 'all') {
      wx.showModal({
        title: '提示',
        content: '确认要删除',
        cancelText: '容朕想想',
        confirmColor: '#40a7e7',
        success(res) {
          if (res.confirm) {
            wx.clearStorage({
              success: (res) => {
                wx.showToast({
                  title: '数据已清除',
                })
                that.setData({
                  setting: {},
                  pos: {},
                })
                that.data.weatherPage.reloadInitSetting()
              },
            })
          }
        },
      })
    }
  },
  goToAbout() {
    wx.navigateTo({
      url: '/pages/setting/about/about'
    })
  },
  goToFinance() {
    wx.navigateTo({
      url: '/pages/finance/finance'
    })
  },
  goToMortgage() {
    wx.navigateTo({
      url: '/pages/mortgage/mortgage'
    })
  },
  goToWxyj() {
    wx.navigateTo({
      url: '/pages/wuxian-yijin/wxyj'
    })
  }

})