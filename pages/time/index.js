import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

const app = getApp()

Page({
  data: {
    time: 25 * 60 * 1000,
    timeData: {
      minutes: 25,
      seconds: 0
    },
    relaxFlag: false,
    lists: [],
    sortList: [],
    show: false,
    start: true,
    pause: false,
    continue: false,
    end: false,
    columns: [],
    startTime: 0,
    endTime: 0,
    tempTime: 0,
    pauseTime: 0,
    totalTime: 0
  },
  onShow() {
    this.sortPlanList()
    this.sortList()
    this.keepScreenOn()
  },
  // 屏幕常亮
  keepScreenOn() {
    wx.setKeepScreenOn({
      keepScreenOn: true,
      fail() { //如果失败 再进行调用
        wx.setKeepScreenOn({
          keepScreenOn: true
        });
      }
    });
  },
  sortPlanList() {
    let lists = {
      "重要 & 紧急": [],
      "重要 & 不紧急": [],
      "不重要 & 紧急": [],
      "不重要 & 不紧急": []
    }
    let planList = wx.getStorageSync('planList')
    for (let i = 0; i < planList.length; i++) {
      switch (planList[i].urgency) {
        case 0:
          lists["重要 & 紧急"].push(planList[i].title);
          break;
        case 1:
          lists["重要 & 不紧急"].push(planList[i].title);
          break;
        case 2:
          lists["不重要 & 紧急"].push(planList[i].title);
          break;
        case 3:
          lists["不重要 & 不紧急"].push(planList[i].title);
          break;
      }
    }
    console.log(lists);
    let columns = [{
        values: Object.keys(lists),
        className: 'column1',
      },
      {
        values: lists['重要 & 紧急'],
        className: 'column2',
        defaultIndex: 0,
      }
    ]
    this.setData({
      lists: lists,
      columns: columns
    })
  },
  sortList() {
    let sortList = {
      "重要 & 紧急": [],
      "重要 & 不紧急": [],
      "不重要 & 紧急": [],
      "不重要 & 不紧急": []
    }
    let planList = wx.getStorageSync('planList')
    for (let i = 0; i < planList.length; i++) {
      switch (planList[i].urgency) {
        case 0:
          sortList["重要 & 紧急"].push(planList[i]);
          break;
        case 1:
          sortList["重要 & 不紧急"].push(planList[i]);
          break;
        case 2:
          sortList["不重要 & 紧急"].push(planList[i]);
          break;
        case 3:
          sortList["不重要 & 不紧急"].push(planList[i]);
          break;
      }
    }
    console.log(sortList);
    this.setData({
      sortList: sortList
    })
  },
  timeChange(e) {
    // if (e.detail.seconds < 10) {
    //   this.setData({
    //     timeData: e.detail,
    //     timeData: {
    //       seconds: '0' + e.detail.seconds
    //     }
    //   });
    // }
    this.setData({
      timeData: e.detail
    })
  },
  timeon() {
    let user = wx.getStorageSync('user')
    if (user.length != 0) {
      this.setData({
        show: true
      })
    } else {
      Dialog.confirm({
          title: '请先登录',
          message: '点击“去登陆”按钮跳转到登录界面',
          confirmButtonText: '去登陆',
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
  startConfirm(e) {
    let index = e.detail.index
    let value = e.detail.value
    let timingPlan = this.data.sortList[value[0]][index[1]]
    console.log(timingPlan);
    if (timingPlan) {
      wx.setStorageSync('timingPlan', timingPlan)
      let start = new Date() // 获得计时开始的时间戳
      let startTime = Date.parse(start)
      this.setData({
        startTime: startTime,
        start: false,
        pause: true,
        show: false,
        relaxFlag: false
      })
      // 获取计时器组件
      const countDown = this.selectComponent('.control-count-down');
      countDown.start(); // 设置计时器开始计时
    } else {
      Dialog.alert({
          message: '该分类没有可计时的任务',
        })
        .then(() => {})
      this.setData({
        show: false
      })
    }
  },
  pause() {
    this.setData({
      pause: false,
      continue: true,
      end: true
    })
    let tempTime = Date.parse(new Date) // 获取暂停开始的时间戳
    this.setData({
      tempTime: tempTime
    })
    const countDown = this.selectComponent('.control-count-down');
    countDown.pause(); // 设置计时器开始暂停
  },
  continue () {
    this.setData({
      pause: true,
      continue: false,
      end: false
    })
    let on = Date.parse(new Date()) // 获取暂停结束的时间戳
    // 统计该次暂停的时间
    let pauseTime = on - this.data.tempTime
    this.setData({
      // 将本次暂停时间加到暂停总时间中
      pauseTime: this.data.pauseTime + pauseTime
    })
    console.log(this.data.pauseTime);
    const countDown = this.selectComponent('.control-count-down');
    countDown.start(); // 设施计时器开始计时
  },
  end() {
    Dialog.alert({
        message: '结束计时?',
        showCancelButton: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        // 获取计时结束时间戳
        let endTime = Date.parse(new Date())
        let pauseTime = endTime - this.data.tempTime
        // 获取本次计时总时间：结束时间 - 暂停总时间 - 开始时间
        let totalTime = endTime - pauseTime - this.data.pauseTime - this.data.startTime
        this.setData({
          start: true,
          relaxFlag: false,
          continue: false,
          end: false,
          timeData: {
            minutes: 25, 
            seconds: 0, 
            time: 25 * 60 * 1000 // 重置时间
          },
          endTime: endTime,
          totalTime: totalTime,
        })
        console.log(totalTime);
        this.addTime() // 调用云开发添加计时数据
        this.addTagTime()
        let min = Math.floor((totalTime / 1000 / 60) << 0)
        let sec = Math.floor((totalTime / 1000) % 60)
        Notify({
          type: 'success',
          message: `本次专注 ${min < 10 ? '0' + min : min}:${sec < 10 ? '0'+sec : sec}`,
          duration: 3000,
          selector: '#van-notify',
        });
      })
      .catch(err => {
        // on cancel
        console.log(err);
      });
    console.log('end')
  },
  addTime() {
    let timingPlan = wx.getStorageSync('timingPlan')
    wx.cloud.database().collection('time')
      .add({
        data: {
          dataTime: Date.parse(new Date()),
          startTime: Date.parse(new Date(this.data.startTime)),
          endTime: Date.parse(new Date(this.data.endTime)),
          totalTime: this.data.totalTime,
          tagId: timingPlan.tagId,
          tagName: timingPlan.tagName,
        }
      })
      .then(res => {
        console.log('add success', res);
        app.tagChart()
        app.timeLine()
      })
      .catch(err => {
        console.log('add error', err);
      })
  },
  addTagTime() {
    let timingPlan = wx.getStorageSync('timingPlan')
    wx.cloud.database().collection('tag')
      .doc(timingPlan.tagId)
      .update({
        data: {
          totalTime: this.data.totalTime
        }
      })
      .then(res => {
        console.log('add tag time success', res);
      })
      .catch(err => {
        console.log('add tag time error', err);
      })
  },
  finished() {
    const countDown = this.selectComponent('.control-count-down');
    let relaxFlag = this.data.relaxFlag
    countDown.pause();
    let message = ''
    if (!relaxFlag) {
      message = '专注结束，休息中'
      this.setData({
        relaxFlag: true,
        time: 5 * 60 * 1000
      })
    } else {
      message = '休息结束，开始专注'
      this.setData({
        relaxFlag: false,
        timeData: {
          minutes: 25, 
          seconds: 0, 
          time: 25 * 60 * 1000 // 重置时间
        },
        // time: 25 * 60 * 1000
      })
    }
    Toast({
      position: 'top',
      message: message
    })
    countDown.start();
    console.log('finish');
  },
  onChange(event) {
    const {
      picker,
      value,
      index
    } = event.detail;
    picker.setColumnValues(1, this.data.lists[value[0]]);
  },
  onClose() {
    this.setData({
      show: false
    })
  },
  startCancel() {
    this.setData({
      show: false,
      start: true,
      continue: false
    })
  },
  onTabItemTap(item) {
    console.log(item)
  },
  onHide() {
    if (!this.data.start) {
      this.pause()
    }
  },
  // 转发分享给好友
  onShareAppMessage: function (res) {
    return {
      title: 'mytime任务管理：简约优美的计时软件',
      path: 'pages/time/index', //这里是被分享的人点击进来之后的页面
      imageUrl: '../../image/person/logo.png' //图片的路径
    }
  },
  // 分享到朋友圈
  onShareTimeline: function () {
    return {
      title: 'mytime任务管理：简约优美的计时软件',
      query: '',
      imageUrl: '../../image/person/logo.png' //图片的路径
    }
  }
})