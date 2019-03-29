//index.js
const app = getApp();
let util = require('../../utils/util.js');
Page({
  data: {
    countData: {},
    listData: [],
    pageNum: 1,
    pageSign: 20,
    isuploaded: false
  },
  onLoad: function () {
    this.getCountData();
    // this.getListData();
  },
  onShow:function(){
    this.setData({
      listData:[],
      pageNum:1
    });
    this.getListData();
  },
  getCountData: function (e) {
    let dataUrl = app.globalData.baseUrl + "/object/countInfo/";
    util.httpRequest(dataUrl, "get", this.getCountCallBack);
  },
  getCountCallBack: function (data) {
    console.log(data.data.data);
    this.setData({
      countData: data.data.data
    })
  },
  getListData: function () {
    let dataUrl = app.globalData.baseUrl + `object/list/1/${this.data.pageNum}/${this.data.pageSign}/`;
    util.httpRequest(dataUrl, "get", this.getListDataCallBack);
  },
  getListDataCallBack: function (data) {
    let listData = this.data.listData;
    let isuploaded = this.data.isuploaded;
    if (data.data.status == 200) {
      if (data.data.data) {
        let list = data.data.data;
        listData = listData.concat(list);
        if (list.length < 10) {
          isuploaded = true;
        } else {
          isuploaded = false;
        }
        this.setData({
          listData: listData,
          isuploaded: isuploaded
        })
      }
    }
  },
  /*下拉刷新*/
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
    this.setData({
      listData: [],
      pageNum: 1
    });
    this.getListData();
  },
  /*上拉加载更多*/
  onReachBottom: function () {
    let isuploaded = this.data.isuploaded;
    if (isuploaded) {
      return;
    }
    let pageNum = ++this.data.pageNum;
    this.setData({
      pageNum: pageNum
    });
    this.getListData();
    this.getCountData();
  },
  newObject:function (ev) {
    let dataset = ev.currentTarget.dataset;
    wx.setStorageSync('itemData',{step:0});
    let url = dataset.url;
    console.log(url);
    wx.redirectTo({
      url: url
    });
  },
  goNextPage:function (ev) {
    let dataset = ev.currentTarget.dataset;
    let item = dataset.item;
    console.log(item);
    wx.setStorageSync('itemData',item);
    if(item.status === 0){
      let url = '../quest/quest';
      wx.redirectTo({
        url: url
      });
    }else{
      let url = '../groupingResult/index';
      wx.redirectTo({
        url: url
      });
    }
  }
});
