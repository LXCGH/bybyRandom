//app.js
const baseUrl = "https://www.myrct.cn/rpuh3random-admin/";
// const baseUrl = "http://10.2.7.19:1010/puh3random-admin/";
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);

    wx.setKeepScreenOn({
      keepScreenOn: true
    });

    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate)
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
    });

  //  获取openId
    let tel = wx.getStorageSync('account');
    if(tel == null || tel == "" || tel == undefined){
      this.hrefToPageFn('./pages/login/login');
      return;
    }
    wx.login({
      success: function (res) {
        let url = baseUrl + "user/login/" + tel + "/" + res.code + "/";
        wx.showLoading({ title: '登录中', icon: 'none', mask: true });
        wx.request({
          method: "get",
          url: url,
          success: function (res) {
            console.log(res);
            if (res.data.status == 200) {
              wx.setStorageSync('token',res.header.puh3randomToken);
              if (res.data.data) {
                setTimeout(function(){
                  wx.redirectTo({
                    url: "../index/index"
                  });
                },1000);
              }
            }
          },
          complete: function () {
            setTimeout(function () {
              wx.hideLoading();
            }, 1000);
          }
        })
      }
    });

  },
  hrefToPageFn:function(url,tabPage){
    if(tabPage){
      wx.switchTab({
        url: url
      })
    }else{
      wx.redirectTo({
        url: url
      })
    }
  },

  getTodayFn:function(){
    let date = new Date();
    let year = date.getFullYear();
    let month = (date.getMonth()+1)>=10?(date.getMonth()+1):'0' + (date.getMonth()+1);
    let day = date.getDate()>=10?date.getDate():'0' + date.getDate();
    console.log(year + '-' + month + '-' + day);
    return year + '-' + month + '-' + day;
  },

  globalData:{
    userInfo:null,
    baseUrl: baseUrl
  }
});
