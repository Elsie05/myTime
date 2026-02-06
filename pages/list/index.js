import Dialog from "../../miniprogram_npm/@vant/weapp/dialog/dialog";
import Toast from "../../miniprogram_npm/@vant/weapp/toast/toast";
const recmgr = wx.getRecorderManager();

let app = getApp()

Page({
  data: {
    show: false, //显示任务详情
    deadline: '',
    localTime: '',
    urgency: '',
    tagName: '',
    tagId: '',
    pickerShow: false,
    columns: [],
    pickerTitle: '',
    title: '',
    remarks: '',
    planList: [],
    tagList: [],
    updateId: '',
    create: '',
    soundInput:'',
    datetimePickerShow:false,
    minHour: 10,
    maxHour: 20,
    // minDate: new Date().getTime(),
    minDate: new Date(2024, 0, 1).getTime(),
    maxDate: new Date(2035, 0, 1).getTime(),
    currentDate: new Date().getTime(),
  },
  // 生命周期
  onShow() {
    let user = wx.getStorageSync('user')
    if (user.length != 0) {
      this.setData({
        planList: wx.getStorageSync('planList'),
        tagList: wx.getStorageSync('tagList')
      })
      this.getPlanList()
    } else {
      this.setData({
        planList: [],
        tagList:[]
      })
    }
  },
  // ********************************
  // 从plan表get数据
  getPlanList() {
    wx.cloud.database().collection('plan')
      .where({
        delete: false
      })
      .get()
      .then(res => {
        console.log('getPlan success', res);
        this.setData({
          planList: res.data
        })
        wx.setStorageSync('planList', res.data)
        this.setData({
          planList: res.data
        })
      })
      .catch(err => {
        console.log('getPlan error', err);
      })
  },
  // 从plan表add数据
  addPlan() {
    let getDate = new Date()
    wx.cloud.database().collection('plan')
      .add({
        data: {
          title: this.data.title,
          remarks: this.data.remarks,
          createTime: this.data.create,
          createFormatTime: this.data.localTime,
          updateTime: this.data.create,
          updateFormatTime: this.data.localTime,
          delete: false,
          finish: false,
          deleteTime: getDate,
          tagName: this.data.tagName,
          tagId: this.data.tagId,
          urgency: this.data.urgency,
          deadlineFormatTime: this.data.deadline,
        }
      })
      .then(res => {
        console.log('addPlan success', res);
        this.getPlanList()
      })
      .catch(err => {
        console.log('addPlan error', err)
      })
  },
  // 从plan表update delete数据
  deleteDetail(item) {
    wx.cloud.database().collection('plan')
      .doc(item._id)
      .update({
        data: {
          delete: true,
          deleteTime: new Date()
        }
      })
      .then(res => {
        console.log('delete success', res);
        this.getPlanList()
      })
      .catch(err => {
        console.log('delete error', err);
      })
  },
  // 从plan表update finish数据
  finish(e) {
    let item = e.currentTarget.dataset.item
    wx.cloud.database().collection('plan')
      .doc(item._id)
      .update({
        data: {
          finish: !item.finish
        }
      })
      .then(res => {
        console.log('check success', res);
        this.getPlanList()
      })
      .catch(err => {
        console.log('check error', err);
      })
  },
  // 从plan表中更新计划
  updatePlan(id) {
    let getDate = new Date()
    let time = this.formatDay(getDate).localtime
    wx.cloud.database().collection('plan')
      .doc(id)
      .update({
        data: {
          title: this.data.title,
          remarks: this.data.remarks,
          updateTime: getDate,
          updateFormatTime: time,
          tagName: this.data.tagName,
          tagId: this.data.tagId,
          urgency: this.data.urgency,
          deadlineFormatTime: this.data.deadline,
        }
      })
      .then(res => {
        console.log('updatePlan success', res);
        this.getPlanList()
      })
      .catch(err => {
        console.log('updatePlan error', err)
      })
  },
  // ********************************
  // --------------------------------
  onListChange(e) {

  },
  // 格式化时间
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
  // 点击添加按钮触发的事件
  add() {
    let user = wx.getStorageSync('user')
    if (user.length != 0) {
      let getDate = new Date()
      let time = this.formatDay(getDate).localtime
      this.setData({
        create: getDate,
        localTime: time,
        show: true
      })
    } else {
      Dialog.confirm({
          title: '请先登录',
          message: '点击“去登录”选项跳转到登录界面',
          confirmButtonText: '去登录',
          cancelButtonText: '取消'
        })
        .then(() => {
          wx.switchTab({
            url: '/pages/person/index',
          })()
        })
        .catch(() => {

        })
    }
  },
  // 关闭按钮触发的事件
  onClose() {
    this.setData({
      show: false,
    })
    setTimeout(_ => {
      this.setData({
        title: '',
        remarks: '',
        updateId: '',
        urgency: '',
        tagName: '',
        tagId: '',
        deadline:'',
      })
    }, 500)
  },
  // 点击完成按钮触发的事件
  Done() {
    if (this.data.title.length == 0) {
      Toast('请填入任务名称')
    } else if (this.data.urgency.length == 0) {
      Toast('请选择紧急程度')
    } else if (this.data.tagName.length == 0) {
      Toast('请选择标签')
    } else if (this.data.updateId.length == 0) {
      this.addPlan()
      this.onClose()
    } else {
      this.updatePlan(this.data.updateId)
      this.onClose()
    }
  },
  // 选择紧急程度
  urgencySelect() {
    this.setData({
      pickerShow: true,
      pickerTitle: '选择紧急程度',
      columns: ['重要 & 紧急', "重要 & 不紧急", "不重要 & 紧急", "不重要 & 不紧急"]
    })
  },
  // 选择标签
  tagSelect() {
    // 标签从数据库中获取，分两种情况
    let tempcColumns = this.data.tagList.map(value => {
      return value.title
    })
    this.setData({
      pickerShow: true,
      pickerTitle: '选择标签',
      columns: tempcColumns,
    })
  },

  //选择截止日期
  ddlSelect(){
    this.setData({
      datetimePickerShow: true, // 显示日历组件
    });
  },
  onInput(event) {
    this.setData({
      currentDate: event.detail,
    });
  },

  onConfirmDDL(e){
    console.log(e)
    console.log(new Date(e.detail))
    this.setData({ 
      datetimePickerShow: false, 
      deadline: this.formatDate(new Date(e.detail)) })
  },

  formatDate(date) {
    let taskStartTime
    if (date.getMonth() < 9) {
      taskStartTime = date.getFullYear() + "-0" + (date.getMonth() + 1) + "-"
    } else {
      taskStartTime = date.getFullYear() + "-" + (date.getMonth() + 1) + "-"
    }
    if (date.getDate() < 10) {
      taskStartTime += "0" + date.getDate()
    } else {
      taskStartTime += date.getDate()
    }
    taskStartTime += " "
    if (date.getHours() < 10) {
      taskStartTime += "0" + date.getHours()
    } else {
      taskStartTime += date.getHours()
    }
    if (date.getMinutes() < 10) {
      taskStartTime += ":0" + date.getMinutes()
    } else {
      taskStartTime += ":" + date.getMinutes()
    }
    // taskStartTime += " " + date.getHours() + ":" + date.getMinutes()
    this.setData({
      taskStartTime: taskStartTime,
    })
    return taskStartTime;
  },


  textChange() {
    this.setData({
      pickerShow: true
    })
  },
  onChange() {

  },
  onCancel() {
    this.setData({
      pickerShow: false,
      datetimePickerShow: false,
    })
  },
  onConfirm() {
    let picker = this.selectComponent('#picker')
    let index = picker.getIndexes()[0]
    console.log(index)
    if (this.data.pickerTitle == '选择紧急程度') {
      this.setData({
        urgency: index
      })
    } else {
      this.setData({
        tagName: this.data.columns[index],
        tagId: this.data.tagList[index]._id
      })
    }
    this.setData({
      pickerShow: false
    })
  },

  // 点击删除图标按钮触发的事件
  delete(e) {
    let item = e.currentTarget.dataset.item
    if (!item.finish) {
      Dialog.alert({
        message: "这个计划还没完成\n 确定需要删除吗？",
        showCancelButton: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        this.deleteDetail(item)
        this.getPlanList()
      }).catch(() => {})
    } else {
      this.deleteDetail(item)
      this.getPlanList()
    }
  },

  detail(e) {
    let item = e.currentTarget.dataset.item
    console.log(item);
    this.setData({
      show: true,
      title: item.title,
      localTime: item.updateFormatTime,
      urgency: item.urgency,
      tagName: item.tagName,
      remarks: item.remarks,
      updateId: item._id,
      deadline: item.deadlineFormatTime,
    })
  },
  // 转发分享给好友
  onShareAppMessage: function (res) {
    if (res.from == 'button') {
      console.log(res.target, res)
    }
    return {
      title: 'mytime任务管理：简约优美的计时软件',
      path: 'pages/list/index', //这里是被分享的人点击进来之后的页面
      imageUrl: '../../image/person/logo.png' //图片的路径
    }
  },
  // 分享到朋友圈
  onShareTimeline: function () {
    if (res.from == 'button') {
      console.log(res.target, res)
    }
    return {
      title: 'mytime任务管理：简约优美的计时软件',
      query: '',
      imageUrl: '../../image/person/logo.png' //图片的路径
    }
  },
  // 语音识别--------------------------------
    //任务名称
    sayStart:function(e){
      console.log(e);
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
  
    sayEnd:function(e){
      console.log(e);
      if (e.target.dataset.voiceType === 'title-voice') {
        this.setData({ soundInput: 'title' });
      } else {
        this.setData({ soundInput: 'remarks' });
      }
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
            let voiceResult = tc_res.result.result.Result;
            // that.setData({title:that.data.title+tc_res.result.result.Result})// 拼接识别结果到现有的 title 字段
            if (that.data.soundInput === 'title') {
              that.setData({ title: that.data.title + voiceResult });
            } else {
              that.setData({ remarks: that.data.remarks + voiceResult });
            }
            that.setData({ soundInput: '' });
          }, 
          fail: console.error
        })
        //end调用云函数
      });
    },
})