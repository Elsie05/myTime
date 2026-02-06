import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
const recmgr = wx.getRecorderManager();

Page({
  data: {
    flag: 0,
    show: false,
    showTextArea: false,
    dialogFlag: false,
    cardFlag: false,
    textFlag: true,
    time: {
      localtime: null,
      date: null
    },
    templateName: '',
    content: '',
    columns: [],
    title: '',
    template: [],
    templateId: '',
    recordId: '',
    cardList: [],
  },
  onShow() {
    let user = wx.getStorageSync('user')
    let record = wx.getStorageSync('recordList')
    this.setData({
      cardList: record
    })
    if (user.length != 0) {
      this.getTemplateList()
    }
  },
  getRecordList() {
    console.log('getRecordList');
    wx.cloud.database().collection('text')
      .where({
        delete: false
      })
      .get()
      .then(res => {
        console.log('get success', res)
        this.setData({
          cardList: res.data
        })
        wx.setStorageSync('recordList', res.data)
      })
      .catch(err => {
        console.log('get error', err)
      })
  },
  getTemplateList() {
    console.log('getTemplateList');
    wx.cloud.database().collection('template')
      .where({
        delete: false
      })
      .get()
      .then(res => {
        console.log('template get success', res.data)
        let columns = res.data.map((value, index) => {
          return value.title
        })
        this.setData({
          template: res.data,
          columns: columns
        })
      })
      .catch(err => {
        console.log('get error', err)
      })
  },
  popupCancel() {
    if (this.data.title == '按模板类型筛选') {
      this.data.columns.shift()
      this.setData({
        colomus: this.data.columns
      })
    }
    this.setData({
      show: false,
    })
  },
  popupConfirm() {
    let picker = this.selectComponent('#picker')
    let index = picker.getIndexes()[0]
    if (this.data.title == '按模板类型筛选') { // 这个是确认筛选
      this.filter(index)
      this.data.columns.shift()
      this.setData({
        show: false,
        colomus: this.data.columns
      })
    } else { // 这个是新建文本
      this.textTemplate(index)
    }
  },
  filter(index) {
    if (index - 1 >= 0) {
      wx.cloud.database().collection('text')
        .where({
          templateName: this.data.columns[index],
          delete: false
        })
        .get()
        .then(res => {
          console.log('filter success', res)
          this.setData({
            cardList: res.data
          })
        })
        .catch(err => {
          console.log('filter error', err)
        })
    } else {
      this.getRecordList()
    }
  },
  showCard(e) {
    let detail = e.currentTarget.dataset.item
    this.setData({
      recordId: detail._id,
      cardFlag: true,
      time: {
        localtime: detail.updateFormatTime,
        date: detail.date,
      },
      templateName: detail.templateName,
      content: detail.content
    })
  },
  formatDay(myDate) {
    let formatDay = {
      year: myDate.getFullYear(),
      month: myDate.getMonth() < 10 ? '0' + (myDate.getMonth() + 1) : myDate.getMonth() + 1,
      date: myDate.getDate() < 10 ? '0' + myDate.getDate() : myDate.getDate(),
      hour: myDate.getHours() < 10 ? '0' + myDate.getHours() : myDate.getHours(),
      min: myDate.getMinutes() < 10 ? '0' + myDate.getMinutes() : myDate.getMinutes(),
      sec: myDate.getSeconds() < 10 ? '0' + myDate.getSeconds() : myDate.getSeconds(),
      Day: new Array("Sun", "Mon", "Tues", "Wed", "Thur", "Fir", "Sat")
    }
    let getDay = {
      localtime: formatDay.year + '-' + formatDay.month + '-' + formatDay.date + ' ' + formatDay.hour + ':' + formatDay.min + ':' + formatDay.sec,
      date: formatDay.Day[myDate.getDay()]
    }
    return getDay
  },
  textTemplate(index) {
    let templateDetail = this.data.template[index]
    let templateName = templateDetail.title
    let content = templateDetail.content
    let myDate = new Date()
    let getDay = this.formatDay(myDate)
    this.setData({
      time: {
        localtime: getDay.localtime,
        date: getDay.date
      },
      templateId: templateDetail._id,
      show: false,
      showTextArea: true,
      flag: 0,
      templateName: templateName,
      content: content
    })
  },
  popupChange(e) {
    // const {
    //   value,
    //   index
    // } = e.detail;
    // Toast(`当前值：${value}, 当前索引：${index}`);
  },
  showSetting() {
    let user = wx.getStorageSync('user')
    if (user.length != 0) {
      this.data.columns.unshift('All')
      this.setData({
        show: true,
        title: '按模板类型筛选',
        columns: this.data.columns
      })
    } else {
      Dialog.confirm({
          title: '请先登录',
          message: '点击“去登录”选项跳转到登录页',
          confirmButtonText: '去登陆',
          cancelButtonText: '取消'
        })
        .then(() => {
          wx.switchTab({
            url: '/pages/person/index'
          })
        })
        .catch(() => {

        })
    }
  },
  showTemplate() {
    let user = wx.getStorageSync('user')
    if (user.length != 0) {
      this.setData({
        show: true,
        title: '选择文本模板',
        flag: 1,
        columns: this.data.columns
      })
    } else {
      Dialog.confirm({
          title: '请先登录',
          message: '点击“去登录”选项跳转到登录界面',
          confirmButtonText: '去登陆',
          cancelButtonText: '取消'
        })
        .then(() => {
          wx.switchTab({
            url: '/pages/person/index'
          })
        })
        .catch(() => {

        })
    }
  },
  onClose() {
    this.setData({
      showTextArea: false,
      cardFlag: false,
      textFlag: true
    })
  },
  Done() {
    let getDate = this.formatDay(new Date())
    wx.cloud.database().collection('text')
      .add({
        data: {
          templateId: this.data.templateId,
          templateName: this.data.templateName,
          content: this.data.content,
          createTime: new Date(),
          createFormatTime: getDate.localtime,
          updateTime: new Date(),
          updateFormatTime: getDate.localtime,
          delete: false,
          deleteTime: new Date(),
          date: getDate.date
        }
      })
      .then(res => {
        console.log('add success', res)
        this.getRecordList()
      })
      .catch(err => {
        console.log('add error', err)
      })
    this.setData({
      showTextArea: false
    })
  },
  Edit() {
    this.setData({
      textFlag: false
    })
  },
  Update() {
    Dialog.alert({
        message: '确认覆盖原记录？',
        showCancelButton: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        console.log('updating')
        let getDate = this.formatDay(new Date())
        wx.cloud.database().collection('text')
          .doc(this.data.recordId)
          .update({
            data: {
              updateTime: new Date(),
              updateFormatTime: getDate.localtime,
              date: getDate.date,
              content: this.data.content
            }
          })
          .then(res => {
            console.log('add success', res)
            this.getRecordList()
          })
          .catch(err => {
            console.log('add error', err)
          })
        this.setData({
          textFlag: true,
          cardFlag: false
        })
      })
      .catch(err => {
        console.log(err)
      })
  },
  delete(e) {
    let id = e.currentTarget.dataset.id
    console.log(id)
    Dialog.alert({
        message: '确认删除？',
        showCancelButton: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      })
      .then(() => {
        console.log('deleting')
        wx.cloud.database().collection('text')
          .doc(id)
          .update({
            data: {
              delete: true,
              deleteTime: new Date()
            }
          })
          .then(res => {
            console.log('delete success', res)
            this.getRecordList()
          })
          .catch(err => {
            console.log('delete error', err)
          })
      })
      .catch(() => {})
  },

  //语音识别
  sayStart:function(){
    //开启录音
    recmgr.start(
      {
        sampleRate:16000,//采样率
        numberOfChannels:1,//单通道
        format:'mp3',//音频格式
        duration:60000//录音时长：60秒
      }
    )
  },

  sayEnd:function(){
    //结束录音
    recmgr.stop();
  },

  onLoad(options){
    let that = this;
    recmgr.onStart(res=>{console.log('开始录音')});
    recmgr.onStop(res=>{
      console.log(res);
      console.log("结束录音");
      console.log('临时文件路径'+res.tempFilePath);
      console.log('大小:'+res.fileSize+'byte');
      console.log('时长:'+res.duration+'毫秒');
      //把音频转成base64的编码
      let base64data=(wx.getFileSystemManager().readFileSync(res.tempFilePath,'base64'));
      console.log(base64data);
      //调用云函数及腾讯云api
      wx.cloud.init()//初始化云函数环境
      wx.cloud.callFunction({//调用云函数
        // 云函数名称
        name:'tc_sound',
        // 传递给云函数的参数
        data:{
          voiceFmt:"m4a", //如果这里写mp3，模拟器会有bug
          soundBase64:base64data, //音频的base64编码
          soundLen:res.fileSize //音频的大小
        },
        // 云函数调用成功后
        success: function(tc_res){
          console.log(tc_res);
          that.setData({content:that.data.content+tc_res.result.result.Result})
        }, // 拼接识别结果到现有的 content 字段
        fail: console.error
      })
      //end调用云函数
    });
  },

})