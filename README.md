## 天气查询小程序

是一款好用方便的线上天气预报服务平台软件，你可以对当日地域天气查询，能将天气误差优化至小时，而且还出示天气预报、大暴雨和风险预警、天气指数值服务项目等作用，让用户能够更好地掌握和了解天气。而且在这里了解到该城市的天气情况，及时提醒亲人注意保暖；同时还提供风级、空气质量等数据信息，根据天气变化情况和这里数据来参考，做好出行准备。此外，熊猫天气随时了解明天的天气情况，能够查看明天的最高气温和最低气温，还能根据不同天气的情况，设置符合天气的动图，方便了解，简直就是生活必备工具，为你的生活带来很多的便利，出门更加方便。觉得不错的小伙伴赶紧下载试试！

## 软件功能

1、精准即时与24小时逐小时天气预报，溫度转变冷热早知；<br/>
2、将来2小时雨雪天气气象预报，精准到分鐘级別，让您出行无忧；<br/>
3、较长一个月天气预测分析，预料阴晴为您的生活起居早做准备；<br/>
4、空气指数实时查询，从容面对雾霾问题。<br/>

<img src="./github-image/qrcode.jpg" alt="微信小程序二维码">

## 小程序亮点

## 运行&部署

第 1 步：注册和风天气 API 及卡拉云
（1）注册和风天气 API
打开和风天气开放平台注册账号
在和风天气控制台创建你的应用，获得 API Key
<img src="./github-image/qweather.png" alt="微信小程序二维码">

```js
//部分接口要用到收费api
export const privateKey = '收费api'

export const freeKeyList = [
    //因为和风天气免费api日调取次数有限制，所以可以多申请几个账户
    '免费api1',
    '免费api2',
]
 
```

接下来就是走微信小程序的部署流程
