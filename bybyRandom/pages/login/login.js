var app = getApp();
var util = require('../../utils/util.js');
Page({
  data: {
    account: "",
    password: "",
    url: ""
  },
  onLoad: function (options) {

  },
  getInputValue: function (e) {
    let type = e.currentTarget.dataset.type;
    let getValue = e.detail.value;
    console.log(getValue);
    this.setData({
      [type]: getValue
    });
  },
  loginFn: function (ev) {
    let data = {
      "account": this.data.account,
      "password": this.data.password,
    };
    if (data.account == "") {
      wx.showToast({
        title: "账号不能为空！",
        icon: 'none',
        mask: true,
        duration: 1500
      });
      return;
    }
    let telReg=/^[1][3,2,1,4,5,7,8,9][0-9]{9}$/;
    if (!telReg.test(data.account)) {
      wx.showToast({
        title: "账号格式不正确！",
        icon: 'none',
        mask: true,
        duration: 1500
      });
      return;
    }
    if (data.password == "") {
      wx.showToast({
        title: "密码不能为空！",
        icon: 'none',
        mask: true,
        duration: 1500
      });
      return;
    }
    let dataset = ev.currentTarget.dataset;
    let url = dataset.url;
    this.setData({
      url: url
    });
    let that = this;
    wx.login({
      success: function (res) {
        let dataUrl = app.globalData.baseUrl + "user/login/"+ res.code +"/";
        util.httpRequest(dataUrl, "post", that.loginCallBack, data);
      }
    });
  },
  loginCallBack: function (res) {
    wx.setStorageSync('token',res.header.puh3randomToken);
    let tel = wx.setStorageSync('account',this.data.account);
    app.hrefToPageFn(this.data.url);
  }

});
