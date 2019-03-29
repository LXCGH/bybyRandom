// pages/basicMessage/index.js
let app = getApp();
let util = require('../../utils/util.js');
Page({
  data: {
    items: [
      {name: '1', value: '男', checked: 'true'},
      {name: '2', value: '女'}
    ],
    reqData: {
      "filterCode": "",                     //(string)筛选号
      "name": "",                           //(string)
      "sex": 1,
      "signDate": app.getTodayFn(),                       //(string)知情通知书日期
    },
    hrefUrl:""
  },
  radioChange(e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value);
    let reqData = this.data.reqData;
    reqData.sex = e.detail.value;
    this.setData({
      reqData: reqData
    })
  },
  bindDateChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    let reqData = this.data.reqData;
    reqData.signDate = e.detail.value;
    this.setData({
      reqData: reqData
    })
  },
  getInputValue(e) {
    let type = e.currentTarget.dataset.type;
    let getValue = e.detail.value.toUpperCase();
    let reqData = this.data.reqData;
    reqData[type] = getValue;
    console.log(reqData);
    this.setData({
      "reqData": reqData
    });
    console.log(this.data.reqData)
  },
  nextStep:function (ev) {
    if (this.data.reqData.filterCode === "") {
      wx.showToast({
        title: "筛选号不能为空！",
        icon: 'none',
        mask: true,
        duration: 1500
      });
      return;
    }
    if (this.data.reqData.name === "") {
      wx.showToast({
        title: "姓名缩写不能为空！",
        icon: 'none',
        mask: true,
        duration: 1500
      });
      return;
    }
    if (!/^[A-Z]+$/.test(this.data.reqData.name)) {
      wx.showToast({
        title: "姓名缩写格式不正确！",
        icon: 'none',
        mask: true,
        duration: 1500
      });
      return;
    }
    if (this.data.reqData.sex === "") {
      wx.showToast({
        title: "性别不能为空！",
        icon: 'none',
        mask: true,
        duration: 1500
      });
      return;
    }
    if (this.data.reqData.sex === "") {
      wx.showToast({
        title: "知情同意书签署日期不能为空！",
        icon: 'none',
        mask: true,
        duration: 1500
      });
      return;
    }
    console.log(this.data.reqData);
    let dataset = ev.currentTarget.dataset;
    let url = dataset.url;
    this.setData({
      hrefUrl: url
    });
    let dataUrl = app.globalData.baseUrl + "object/save/0/";
    util.httpRequest(dataUrl, "post", this.saveBasicDataFn, this.data.reqData);
  },
  saveBasicDataFn:function (data) {
    console.log(data);
    wx.setStorageSync('submitId',data.data.data.id);
    if(data.data.status === 200){
      app.hrefToPageFn(this.data.hrefUrl);
    }else{
      wx.showToast({
        title: data.data.info,
        icon: 'none',
        mask: true,
        duration: 1500
      });
    }
  },
  backPage:function (ev) {
    let dataset = ev.currentTarget.dataset;
    let url = dataset.url;
    app.hrefToPageFn(url);
  }
});
