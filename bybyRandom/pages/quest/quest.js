const app = getApp();
const util = require("../../utils/util.js");

Page({
  /*页面的初始数据*/
  data: {
    index: 0,
    questions: [
      {
        title: "年龄在18岁（包含18岁）到45之间",
        answers: [
          {
            title: "是",
            isChecked: false
          },
          {
            title: "否",
            isChecked: false
          }
        ]
      },
      {
        title: "初次行单纯ACL重建术，可以合并软骨修整和半月板部分切除，术后康复计划一致",
        answers: [
          {
            title: "是",
            isChecked: false
          },
          {
            title: "否",
            isChecked: false
          }
        ]
      },
      {
        title: "具有基本读写能力，沟通交流无障碍",
        answers: [
          {
            title: "是",
            isChecked: false
          },
          {
            title: "否",
            isChecked: false
          }
        ]
      },
      {
        title: "有智能手机，会使用微信或能够学会使用微信",
        answers: [
          {
            title: "是",
            isChecked: false
          },
          {
            title: "否",
            isChecked: false
          }
        ]
      },
      {
        title: "有关节感染、关节结核或骨髓炎既往史，或下肢在6个月内曾行外科手术",
        answers: [
          {
            title: "是",
            isChecked: false
          },
          {
            title: "否",
            isChecked: false
          }
        ]
      },
      {
        title: "合并严重心、脑、肾等器官功能障碍",
        answers: [
          {
            title: "是",
            isChecked: false
          },
          {
            title: "否",
            isChecked: false
          }
        ]
      },
      {
        title: "合并其他严重膝关节疾病损伤",
        answers: [
          {
            title: "是",
            isChecked: false
          },
          {
            title: "否",
            isChecked: false
          }
        ]
      },
      {
        title: "伴有精神疾病或认知障碍，不能学习及参与康复训练",
        answers: [
          {
            title: "是",
            isChecked: false
          },
          {
            title: "否",
            isChecked: false
          }
        ]
      },
      {
        title: "己参加其他类似康复功能训练项目，或出院后转往其他医疗机构康复",
        answers: [
          {
            title: "是",
            isChecked: false
          },
          {
            title: "否",
            isChecked: false
          }
        ]
      },
    ],
    reqData: {
      "id":null,
      "data1": "",
      "data2": "",
      "data3": "",
      "data4": "",
      "data5": "",
      "data6": "",
      "data7": "",
      "data8": "",
      "data9": "",
    }
  },
  /*生命周期函数--监听页面加载*/
  onLoad: function (options) {
    let id = wx.getStorageSync('submitId');
    let itemData = wx.getStorageSync('itemData');
    if(itemData.id){
      id = itemData.id;
    }
    let reqData = this.data.reqData;
    reqData.id = id;
    this.setData({
      reqData:reqData,
      index:itemData.step
    })
  },
  radioChange: function (ev) {
    let clickIndex = ev.currentTarget.dataset.index;
    let index = this.data.index;
    let questions = this.data.questions;
    let clickAnswer = questions[index];
    for (var i = 0; i < clickAnswer.answers.length; i++) {
      clickAnswer.answers[i].isChecked = false;
    }
    clickAnswer.answers[clickIndex].isChecked = true;
    //1是是 0是否
    let answerClick = clickIndex === 0 ? 1 : 0;
    console.log(index);
    console.log(answerClick);
    let reqData = this.data.reqData;
    let key = "data"+(index+1);
    reqData[key] = answerClick;
    console.log(reqData);
    this.setData({
      questions: questions,
      reqData:reqData
    });
  },
  nextQuestion: function () {
    let index = this.data.index;
    let questions = this.data.questions;
    let reqData = this.data.reqData;
    if (index >= questions.length) {
      wx.showToast({
        title: "已是最后一题！",
        icon: 'none',
        mask: true,
        duration: 1500
      });
      return;
    }
    if(reqData['data'+(index+1)] === ""){
      wx.showToast({
        title: "请选择答案！",
        icon: 'none',
        mask: true,
        duration: 1500
      });
      return;
    }
    if(index<4&&reqData['data'+(index+1)]===1){
      this.submitFn(reqData,(index+1));
    }else if(index>=4&&reqData['data'+(index+1)]===0){
      this.submitFn(reqData,(index+1));
    }else{
      let that = this;
      wx.showModal({
        title: '提示',
        content: '该答案会导致入组失败，确定要继续吗？',
        success: function (sm) {
          if (sm.confirm) {
            that.submitFn(reqData,-1);
          } else if (sm.cancel) {
            console.log('用户点击取消')
          }
        }
      });
    }
  },
  lastQuestion: function () {
    let index = this.data.index;
    if (index - 1 < 0) {
      return;
    }
    this.setData({
      index: index - 1
    });
  },
  giveUpFn:function(){
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定要放弃筛选吗？',
      success: function (sm) {
        if (sm.confirm) {
          that.submitFn(that.data.reqData,-1);
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    });
  },
  submitFn:function (data,index) {
    let dataUrl = app.globalData.baseUrl + "object/save/"+ index +"/";
    util.httpRequest(dataUrl, "post", this.submitCallBack, data);
  },
  submitCallBack:function (data) {
    if(data.data.data.status === 2){
      console.log(111);
      wx.redirectTo({
        url: '../index/index?_s=' + Math.random()*Math.random()
      });
      return;
    }
    let index = this.data.index;
    console.log(index);
    if(index >= 8){
      wx.setStorageSync('itemData',data.data.data);
      wx.redirectTo({
        url: '../groupingResult/index'
      });
      return;
    }
    this.setData({
      index: index + 1
    });
  }

});
