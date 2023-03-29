const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const getOneWord = (code) => {
  const list = [
    '生活是天气，有阴有晴有风雨',
    '心怀感恩，幸福常在',
    '心累的时候，换个心情看世界',
    '想获得人生的金子，就必须淘尽生活的沙烁',
    '因为有明天，今天永远只是起跑线',
    '只要心情是晴朗的，人生就没有雨天',
    '有你的城市下雨也美丽',
    '雨划过我窗前，玻璃也在流眼泪',
    '天空澄碧，纤云不染',
    '人生，不要被安逸所控制',
    '在受伤的时候，也能浅浅的微笑',
    '不抱怨过去，不迷茫未来，只感恩现在',
    '生活向前，你向阳光',
    '在阳光中我学会欢笑，在阴云中我学会坚强'
  ]
  let index = Math.floor(Math.random() * list.length)
  return list[index] ? list[index] : list[0]
}
let isEmptyObject = (obj) => {
  for (let i in obj) {
    return false
  }
  return true
}
let formatDate = (nDate, date) => {
  if (isNaN(nDate.getTime())) {
    // 不是时间格式
    return '--'
  }
  let o = {
    'M+': nDate.getMonth() + 1,
    'd+': nDate.getDate(),
    'h+': nDate.getHours(),
    'm+': nDate.getMinutes(),
    's+': nDate.getSeconds(),
    // 季度
    'q+': Math.floor((nDate.getMonth() + 3) / 3),
    'S': nDate.getMilliseconds()
  }
  if (/(y+)/.test(date)) {
    date = date.replace(RegExp.$1, (nDate.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(date)) {
      date = date.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return date
}
 
// 比较版本号：left > right 1, left < right -1, left == right 0
// 用途：旧版本不执行写入、删除 日历操作
let cmpVersion = (left, right) => {
  if (typeof left + typeof right !== 'stringstring') {
    return false
  }
  let a = left.split('.')
  let b = right.split('.')
  let i = 0
  let len = Math.max(a.length, b.length)
  for (; i < len; i++) {
    if ((a[i] && !b[i] && parseInt(a[i]) > 0) || (parseInt(a[i]) > parseInt(b[i]))) {
      return 1
    } else if ((b[i] && !a[i] && parseInt(b[i]) > 0) || (parseInt(a[i]) < parseInt(b[i]))) {
      return -1
    }
  }
  return 0
}


module.exports = {
  formatTime,
  formatDate,
  getOneWord,
  isEmptyObject,
  cmpVersion,
}
