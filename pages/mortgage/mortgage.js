var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    commercialTotal: 1000000,
    gjjTotal: 500000,
    tabs: ["公积金贷款", "商业贷款", "组合贷款"],
    activeIndex: 0,
    loansType: ['按房价总额', '按贷款总额'],
    loanIndex: 0,
    ratesName: [
      ['基准利率（3.25%）', '基准利率7折（2.27%）', '基准利率75折（2.44%）', '基准利率8折（2.60%）',
        '基准利率85折（2.76%）', '基准利率9折（2.93%）', '基准利率95折（3.09%）', '基准利率1.05倍（3.41%）',
        '基准利率1.1倍（3.58%）', '基准利率1.2倍（3.90%）', '基准利率1.3倍（4.23%）', '其他利率（可输入）'],
      ['基准利率（4.9%）', '基准利率7折（3.43%）', '基准利率75折（3.68%）', '基准利率8折（3.92%）',
        '基准利率85折（4.17%）', '基准利率9折（4.41%）', '基准利率95折（4.66%）', '基准利率1.05倍（5.15%）',
        '基准利率1.1倍（5.39%）', '基准利率1.2倍（5.88%）', '基准利率1.3倍（6.37%）', '其他利率（可输入）']
    ],
    rates: [
      [0.0325, 0.0227, 0.0244, 0.026, 0.0276, 0.0293, 0.0309, 0.0341, 0.0358, 0.039, 0.0423],
      [0.049, 0.034, 0.0368, 0.0392, 0.0417, 0.0441, 0.0466, 0.0515, 0.0539, 0.0588, 0.0637]
    ],
    rateIndex0: 0,
    rateIndex1: 0,
    percentArr: [7, 6, 5, 4, 3, 2],
    percentIndex: 0,
    years: [30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19.18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    yearIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    MDI_commercial_loan: null,//手动输入商贷
    MDI_provident_fund_loan: null,//手动输入商贷: null,//手动输入公积金贷
  },
  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
  },
  loanChange(e) {
    this.setData({
      loanIndex: e.detail.value
    });
  },
  rateChange0(e) {
    this.setData({
      MDI_commercial_loan: null,
      rateIndex0: e.detail.value
    });
  },
  rateChange1(e) {
    this.setData({
      MDI_provident_fund_loan: null,
      rateIndex1: e.detail.value
    });
  },
  percentChange(e) {
    this.setData({
      percentIndex: e.detail.value
    });
  },
  yearChange(e) {
    this.setData({
      yearIndex: e.detail.value
    });
  },
  commercialTotalChange(e) {
    this.setData({
      commercialTotal: e.detail.value
    });
  },
  gjjTotalChange(e) {
    this.setData({
      gjjTotal: e.detail.value
    });
  },
  rateChangeCommercial(e) {
    this.setData({
      MDI_commercial_loan: e.detail.value
    });
  },
  rateChangeProvident(e) {
    this.setData({
      MDI_provident_fund_loan: e.detail.value
    });
  },
  showDetail() {
    var commercialTotal;
    var gjjTotal;
    var interestRatePerMou0;
    var interestRatePerMou1;
    var totalMouths;
    commercialTotal = this.data.loanIndex == 1 || this.data.activeIndex == 2 ? this.data.commercialTotal : this.data.commercialTotal * this.data.percentArr[this.data.percentIndex] / 10;
    gjjTotal = this.data.loanIndex == 1 || this.data.activeIndex == 2 ? this.data.gjjTotal : this.data.gjjTotal * this.data.percentArr[this.data.percentIndex] / 10;
    interestRatePerMou0 = this.data.rates[0][this.data.rateIndex0];
    interestRatePerMou1 = this.data.rates[1][this.data.rateIndex1];
    totalMouths = this.data.years[this.data.yearIndex] * 12;
    console.log("interestRatePerMou0", interestRatePerMou0, interestRatePerMou1);
    if (this.data.MDI_commercial_loan) {
      interestRatePerMou0 = this.data.MDI_commercial_loan
    }
    if (this.data.MDI_provident_fund_loan) {
      interestRatePerMou1 = this.data.MDI_provident_fund_loan
    }
    wx.navigateTo({
      url: './detail/detail?parentActiveIndex=' + this.data.activeIndex + '&commercialTotal=' + commercialTotal + '&gjjTotal=' + gjjTotal + '&interestRatePerMou0=' + interestRatePerMou0 + '&interestRatePerMou1=' + interestRatePerMou1 + '&totalMouths=' + totalMouths
    })
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '买房月供一算遍知',
      path: '/pages/mortgage/mortgage',

    }
  }
});