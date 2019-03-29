function httpRequest(url, method, callBack, data) {
  var header = null;
  if(wx.getStorageSync('telVerCodeToken')){
    header = {
      'content-type': 'application/json',// 默认值
      'telVerCodeToken':wx.getStorageSync('telVerCodeToken')||""
    }
  }else{
    header = {
      'content-type': 'application/json',// 默认值
      'puh3randomToken':wx.getStorageSync('token')||""
    }
  }
  wx.showLoading({
    title: '加载中',
    icon: 'none',
    mask: true
    // duration: 1500
  });
  wx.request({
    url: url,
    data: data || "",
    method: method,
    dataType: "json",
    header: header,
    success: function (res,resStatus,resStatus1) {
      wx.hideLoading();
      if (res.data.status == 200) {
        callBack(res);  // 成功后回调方法
      } else {
        wx.showToast({
          title: res.data.info,
          icon: 'none',
          mask: true,
          duration: 1500
        });
      }
    },
    fail: function () {
      setTimeout(function () {
        wx.hideLoading();
        wx.showToast({
          title: '网络繁忙，请耐心等待',
          icon: 'none',
          mask:true,
          duration: 3000
        });
      },1000);
    }
  })
}

function uploadImg(url,fn){
  wx.chooseImage({
    count: 1,  //最多可以选择的图片总数
    sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
    success: function (res) {
      // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
      var tempFilePaths = res.tempFilePaths;
      //启动上传等待中...
      // console.log(tempFilePaths)
      wx.showToast({
        title: '正在上传...',
        icon: 'loading',
        mask: true,
        duration: 10000
      });
      var uploadImgCount = 0;
      for (var i = 0, h = tempFilePaths.length; i < h; i++) {
        wx.uploadFile({
          url: url,
          filePath: tempFilePaths[i],
          name: 'files',
          formData: {
            'imgIndex': i
          },
          header: {
            "Content-Type": "multipart/form-data",
            'token':wx.getStorageSync('token')||""
          },
          complete:function(){
            wx.hideToast();
          },
          success: function (res) {
            if (uploadImgCount == tempFilePaths.length) {
              wx.hideToast();
            }
            fn(res);
          },
          fail: function (res) {
            wx.hideToast();
            wx.showModal({
              title: '错误提示',
              content: '上传图片失败',
              showCancel: false,
              success: function (res) { }
            })
          }
        });
      }
    }
  });
}

function uploadFile(url,filePath,fn){
  wx.showLoading({
    title: '正在上传录音...',
    icon: 'none',
    mask: true
    // duration: 1500
  });
  wx.uploadFile({
    url: url,
    filePath: filePath,
    name: 'file',
    header: {
      'content-type': 'multipart/form-data',
      'token':wx.getStorageSync('token')||""
    },
    success: function (res) {
      wx.hideLoading();
      fn(res);
    },
    fail: function (res) {
      wx.hideLoading();
      wx.showModal({
        title: '错误提示',
        content: '上传录音失败',
        showCancel: false,
        success: function (res) { }
      })
    }
  });
}

function checkTel(tel) {
  var regTel = /^1[1,2,3,4,4,5,6,7,0,8,9][0-9]{9}$/;
  var pass = true;
  if (!regTel.test(tel)) {
    wx.showToast({
      title: '请输入正确的手机号',
      icon: 'none',
      mask: true,
      duration: 1500
    });
    pass = false;
  }
  return pass;
}

function IdentityCodeValid(code) {
  var city = {
    11: "北京",
    12: "天津",
    13: "河北",
    14: "山西",
    15: "内蒙古",
    21: "辽宁",
    22: "吉林",
    23: "黑龙江 ",
    31: "上海",
    32: "江苏",
    33: "浙江",
    34: "安徽",
    35: "福建",
    36: "江西",
    37: "山东",
    41: "河南",
    42: "湖北 ",
    43: "湖南",
    44: "广东",
    45: "广西",
    46: "海南",
    50: "重庆",
    51: "四川",
    52: "贵州",
    53: "云南",
    54: "西藏 ",
    61: "陕西",
    62: "甘肃",
    63: "青海",
    64: "宁夏",
    65: "新疆",
    71: "台湾",
    81: "香港",
    82: "澳门",
    91: "国外 "
  };
  var tip = "";
  var pass = true;

  //if(!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)){
  if (!code || !/^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/i.test(code)) {

    tip = "身份证号格式错误";
    pass = false;
  }

  else if (!city[code.substr(0, 2)]) {
    tip = "身份证号地址编码错误";
    pass = false;
  }
  else {
    //18位身份证需要验证最后一位校验位
    if (code.length == 18) {
      code = code.split('');
      //∑(ai×Wi)(mod 11)
      //加权因子
      var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
      //校验位
      var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
      var sum = 0;
      var ai = 0;
      var wi = 0;
      for (var i = 0; i < 17; i++) {
        ai = code[i];
        wi = factor[i];
        sum += ai * wi;
      }
      var last = parity[sum % 11];
      if (parity[sum % 11] != code[17]) {
        tip = "身份证号校验位错误";
        pass = false;
      }
    }
  }
  if (!pass) {
    wx.showToast({
      title: "身份证填写错误",
      icon: 'none',
      mask: true,
      duration: 1500
    });
  }
  return pass;
}

//获取当前时间
function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var seperator2 = ":";
  var month = date.getMonth() + 1;
  var monthIndex = date.getMonth();
  var strDate = date.getDate();
  var strDateIndex = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdateAll = date.getFullYear() + seperator1 + month + seperator1 + strDate
    + " " + date.getHours() + seperator2 + date.getMinutes()
    + seperator2 + date.getSeconds();
  var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
  return {
    currentdateAll: currentdateAll,
    currentdate: currentdate,
    monthIndex: monthIndex,
    strDateIndex: strDateIndex
  };
}

//加n天后的时间
function GetDateStr(AddDayCount) {
  var dd = new Date();
  dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期
  var y = dd.getFullYear();
  var m = dd.getMonth() + 1;//获取当前月份的日期
  var d = dd.getDate();
  return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d);
}

function unixToDateTime(unixtime) {
  var date = new Date(unixtime);
  //return unixTimestamp.toLocaleString();
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = (date.getDate() < 10 ? "0" : "") + date.getDate() + '';
  var h = (date.getHours() < 10 ? "0" : "") + date.getHours() + ':';
  var m = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
  return {
    date: Y + M + D,
    time: h + m
  };
}

function unixToDate(unixtime) {
  var date = new Date(unixtime);
  //return unixTimestamp.toLocaleString();
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = (date.getDate() < 10 ? "0" : "") + date.getDate() + ' ';
  var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  var m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  return Y + M + D + h + m;
}

function dateAddDays(dd, days) {
  //var dd = new Date();
  var ddUnix = dateToUnix(dd)
  var nextDayUnix = ddUnix + days * 24 * 60 * 60 * 1000;
  return unixToDateTime(nextDayUnix).date;
}

function addUrlFrom(url, part, value) {
  if (!part || !value || value == "null")
    return url;
  var tmp = url.indexOf("?") == -1 ? "?" : "&";
  return url + tmp + part + "=" + value
}

function DateDiff(sDate1, sDate2) {    //sDate1和sDate2是2006-12-18格式
  var aDate, oDate1, oDate2, iDays;
  if (sDate1 == "" || sDate2 == "") {
    return 1;
  }
  aDate = sDate1.split("-");
  oDate1 = new Date(aDate[0], aDate[1], aDate[2]);   //转换为12-18-2006格式
  aDate = sDate2.split("-");
  oDate2 = new Date(aDate[0], aDate[1], aDate[2]);
  iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24);    //把相差的毫秒数转换为天数
  return iDays;
}

function dateToUnix(str) {
  str = str.replace(/-/g, "/");
  var date = new Date(str);
  var humanDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
  return (humanDate.getTime() / 1000 - 8 * 60 * 60) * 1000;
}

function getCity(currProvince) {
  var tmpcityArray;
  var cityArrayArr = [
    "-省份-",
    "北京市",
    "上海市",
    "天津市",
    "重庆市",
    "河北省",
    "山西省",
    "内蒙古自治区",
    "辽宁省",
    "吉林省",
    "黑龙江省",
    "江苏省",
    "浙江省",
    "安徽省",
    "福建省",
    "江西省",
    "山东省",
    "河南省",
    "湖北省",
    "湖南省",
    "广东省",
    "广西壮族自治区",
    "海南省",
    "四川省",
    "贵州省",
    "云南省"
  ];
  var cityArray = new Array();
  cityArray[0] = new Array("北京市", "东城|西城|崇文|宣武|朝阳|丰台|石景山|海淀|门头沟|房山|通州|顺义|昌平|大兴|平谷|怀柔|密云|延庆");
  cityArray[1] = new Array("上海市", "黄浦|卢湾|徐汇|长宁|静安|普陀|闸北|虹口|杨浦|闵行|宝山|嘉定|浦东|金山|松江|青浦|南汇|奉贤|崇明");
  cityArray[2] = new Array("天津市", "和平|东丽|河东|西青|河西|津南|南开|北辰|河北|武清|红挢|塘沽|汉沽|大港|宁河|静海|宝坻|蓟县");
  cityArray[3] = new Array("重庆市", "万州|涪陵|渝中|大渡口|江北|沙坪坝|九龙坡|南岸|北碚|万盛|双挢|渝北|巴南|黔江|长寿|綦江|潼南|铜梁 |大足|荣昌|壁山|梁平|城口|丰都|垫江|武隆|忠县|开县|云阳|奉节|巫山|巫溪|石柱|秀山|酉阳|彭水|江津|合川|永川|南川");
  cityArray[4] = new Array("河北省", "石家庄|邯郸|邢台|保定|张家口|承德|廊坊|唐山|秦皇岛|沧州|衡水");
  cityArray[5] = new Array("山西省", "太原|大同|阳泉|长治|晋城|朔州|吕梁|忻州|晋中|临汾|运城");
  cityArray[6] = new Array("内蒙古自治区", "呼和浩特|包头|乌海|赤峰|呼伦贝尔盟|阿拉善盟|哲里木盟|兴安盟|乌兰察布盟|锡林郭勒盟|巴彦淖尔盟|伊克昭盟");
  cityArray[7] = new Array("辽宁省", "沈阳|大连|鞍山|抚顺|本溪|丹东|锦州|营口|阜新|辽阳|盘锦|铁岭|朝阳|葫芦岛");
  cityArray[8] = new Array("吉林省", "长春|吉林|四平|辽源|通化|白山|松原|白城|延边");
  cityArray[9] = new Array("黑龙江省", "哈尔滨|齐齐哈尔|牡丹江|佳木斯|大庆|绥化|鹤岗|鸡西|黑河|双鸭山|伊春|七台河|大兴安岭");
  cityArray[10] = new Array("江苏省", "南京|镇江|苏州|南通|扬州|盐城|徐州|连云港|常州|无锡|宿迁|泰州|淮安");
  cityArray[11] = new Array("浙江省", "杭州|宁波|温州|嘉兴|湖州|绍兴|金华|衢州|舟山|台州|丽水");
  cityArray[12] = new Array("安徽省", "合肥|芜湖|蚌埠|马鞍山|淮北|铜陵|安庆|黄山|滁州|宿州|池州|淮南|巢湖|阜阳|六安|宣城|亳州");
  cityArray[13] = new Array("福建省", "福州|厦门|莆田|三明|泉州|漳州|南平|龙岩|宁德");
  cityArray[14] = new Array("江西省", "南昌市|景德镇|九江|鹰潭|萍乡|新馀|赣州|吉安|宜春|抚州|上饶");
  cityArray[15] = new Array("山东省", "济南|青岛|淄博|枣庄|东营|烟台|潍坊|济宁|泰安|威海|日照|莱芜|临沂|德州|聊城|滨州|菏泽");
  cityArray[16] = new Array("河南省", "郑州|开封|洛阳|平顶山|安阳|鹤壁|新乡|焦作|濮阳|许昌|漯河|三门峡|南阳|商丘|信阳|周口|驻马店|济源");
  cityArray[17] = new Array("湖北省", "武汉|宜昌|荆州|襄樊|黄石|荆门|黄冈|十堰|恩施|潜江|天门|仙桃|随州|咸宁|孝感|鄂州");
  cityArray[18] = new Array("湖南省", "长沙|常德|株洲|湘潭|衡阳|岳阳|邵阳|益阳|娄底|怀化|郴州|永州|湘西|张家界");
  cityArray[19] = new Array("广东省", "广州|深圳|珠海|汕头|东莞|中山|佛山|韶关|江门|湛江|茂名|肇庆|惠州|梅州|汕尾|河源|阳江|清远|潮州|揭阳|云浮");
  cityArray[20] = new Array("广西壮族自治区", "南宁|柳州|桂林|梧州|北海|防城港|钦州|贵港|玉林|南宁地区|柳州地区|贺州|百色|河池");
  cityArray[21] = new Array("海南省", "海口|三亚");
  cityArray[22] = new Array("四川省", "成都|绵阳|德阳|自贡|攀枝花|广元|内江|乐山|南充|宜宾|广安|达川|雅安|眉山|甘孜|凉山|泸州");
  cityArray[23] = new Array("贵州省", "贵阳|六盘水|遵义|安顺|铜仁|黔西南|毕节|黔东南|黔南");
  cityArray[24] = new Array("云南省", "昆明|大理|曲靖|玉溪|昭通|楚雄|红河|文山|思茅|西双版纳|保山|德宏|丽江|怒江|迪庆|临沧");
  cityArray[25] = new Array("西藏自治区", "拉萨|日喀则|山南|林芝|昌都|阿里|那曲");
  cityArray[26] = new Array("陕西省", "西安|宝鸡|咸阳|铜川|渭南|延安|榆林|汉中|安康|商洛");
  cityArray[27] = new Array("甘肃省", "兰州|嘉峪关|金昌|白银|天水|酒泉|张掖|武威|定西|陇南|平凉|庆阳|临夏|甘南");
  cityArray[28] = new Array("宁夏回族自治区", "银川|石嘴山|吴忠|固原");
  cityArray[29] = new Array("青海省", "西宁|海东|海南|海北|黄南|玉树|果洛|海西");
  cityArray[30] = new Array("新疆维吾尔族自治区", "乌鲁木齐|石河子|克拉玛依|伊犁|巴音郭勒|昌吉|克孜勒苏柯尔克孜|博尔塔拉|吐鲁番|哈密|喀什|和田|阿克苏");
  cityArray[31] = new Array("香港特别行政区", "香港特别行政区");
  cityArray[32] = new Array("澳门特别行政区", "澳门特别行政区");
  cityArray[33] = new Array("台湾省", "台北|高雄|台中|台南|屏东|南投|云林|新竹|彰化|苗栗|嘉义|花莲|桃园|宜兰|基隆|台东|金门|马祖|澎湖");
  cityArray[34] = new Array("其它", "北美洲|南美洲|亚洲|非洲|欧洲|大洋洲");

  //当前 所选择 的 省
  for (var i = 0; i < cityArray.length; i++) {
    //得到 当前省 在 城市数组中的位置
    if (cityArray[i][0] == currProvince) {
      //得到 当前省 所辖制的 地市
      tmpcityArray = cityArray[i][1].split("|");
      break;
    }
  }
  if (currProvince == "-省份-") {
    tmpcityArray = ['-市区-'];
  }
  return {
    cityArray: cityArrayArr,
    tmpcityArray: tmpcityArray
  };
}

module.exports = {
  httpRequest: httpRequest,
  checkTel: checkTel,
  IdentityCodeValid: IdentityCodeValid,
  getCity: getCity,
  getNowFormatDate: getNowFormatDate,
  GetDateStr: GetDateStr,
  dateAddDays: dateAddDays,
  addUrlFrom: addUrlFrom,
  dateToUnix: dateToUnix,
  DateDiff: DateDiff,
  uploadImg:uploadImg,
  uploadFile:uploadFile
};
