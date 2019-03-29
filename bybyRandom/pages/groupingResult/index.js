// pages/groupingResult/index.js
const app = getApp();
const util = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resData:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let itemData = wx.getStorageSync('itemData');
    this.setData({
      resData:itemData
    })
  },
  deleteItem:function (ev) {
    let id = ev.currentTarget.dataset.id;
    console.log(id);
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定要放弃筛选吗？',
      success: function (sm) {
        if (sm.confirm) {
          let dataUrl = app.globalData.baseUrl + "object/save/-2/";
          let reqData = that.data.resData;
          util.httpRequest(dataUrl, "post", that.deleteCallBack,reqData);
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    });
  },
  deleteCallBack:function () {
    wx.showToast({
      title: "删除成功！",
      icon: 'none',
      mask: true,
      duration: 1500
    });
    app.hrefToPageFn('../index/index');
  },
  goIndex:function () {
    app.hrefToPageFn('../index/index');
  }
})
