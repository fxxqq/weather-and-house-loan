
const screenWidth = wx.getSystemInfoSync().windowWidth // 获取设备信息（宽度)
Component({
    externalClasses: ['tooltip-box1'],
    // 启用插槽
    options: {
        multipleSlots: true
    },
    properties: {
        placement: {
            type: String,
            value: 'top' // right bottom left
        },
        content: String,
        tips: String,
        maxWidth: {
            type: Number,
            value: 354
        },
        duration: {
            type: Number,
            value: 2000
        }
    },
    data() {
        return {
            tooltipWidth: 100
        }
    },
    lifetimes: {
        attached() {
            this.getTooltipWidth()
            this.judgePosition()
        }
    },
    methods: {
        getTooltipWidth() {
            const contentRPXWidth = this.data.tips.length * 28 + 36 * 2 // 自定义的一个tips宽度
            const conetntPXWidth = (contentRPXWidth / 750) * screenWidth // 根据屏幕适配的宽度

            wx.createSelectorQuery().in(this).select('.tooltip-box').boundingClientRect(({ width }) => {
                console.log("width", width)
                const {
                    maxWidth
                } = this.data
                let tooltipWidth = 0
                // 获取自定义元素的宽度 与 屏幕适配宽度做比较
                // 最终参考使用一个合适的宽度作为 tips 的宽度
                if (conetntPXWidth < width) {
                    tooltipWidth = contentRPXWidth
                } else {
                    tooltipWidth = contentRPXWidth < maxWidth ? contentRPXWidth : maxWidth
                }
                this.setData({
                    tooltipWidth
                })
            }).exec()
        },
        // 判断tips是否在某个位置上有足够的空间放置
        judgePosition() {
            // 同理通过 wx.createSelectorQuery().in(this).select('').boundingClientRect去获取自定义元素的位置元素信息以及tips的位置元素信息去做处理
            // 在这里只列举了其中一种情况的例子进行判断来设置该tips的实际放置位置
            // 以下情况可能出现的场景是：自定义元素放置的位置过于偏左 导致上下的tips没办法放置 因此设置tips到右边 别的情况同理
            if (this.placement === 'top' || this.placement === 'bottom') {
                let targetLeftCenter = targetLeft + targetWidth / 2 // 点击元素的中间位置坐标
                if (targetLeftCenter < tipWidth / 2) {
                    this.setData({
                        placement: 'right'
                    })
                }
            }


        },
        clickTips() {
            const { duration } = this.data
            this.setData({ isNeedTips: true }) // 显示tips
            let timer = setTimeout(() => {
                this.setData({
                    isNeedTips: false // 在duration毫秒后隐藏tips
                })
                wx.nextTick(() => {
                    clearTimeout(timer) && (timer = null) // 清理定时器
                })
            }, duration)
            this.triggerEvent('click') // 抛出一个点击事件
        }
    },



})