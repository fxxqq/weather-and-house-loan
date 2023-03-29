let systemInfo

export const getSystemInfoSync = () => {
  if (systemInfo === null) {
    systemInfo = wx.getSystemInfoSync()
  }

  console.log(systemInfo)
  return systemInfo
}

export function getRect(context, selector) {
  return new Promise(resolve => {
    wx.createSelectorQuery()
      .in(context)
      .select(selector)
      .boundingClientRect()
      .exec((rect = []) => resolve(rect[0]))
  })
}

export function requestAnimationFrame(cb) {
  const system = getSystemInfoSync()

  if (system.platform === 'devtools') {
    return setTimeout(() => {
      cb()
    }, 1000 / 30)
  }
  return wx
    .createSelectorQuery()
    .selectViewport()
    .boundingClientRect()
    .exec(() => cb())
}

export const getNetworkType = async () => {
  return await wx.getNetworkType()
}