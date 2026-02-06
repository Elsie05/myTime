import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';

Page({
  data: {
    rateFlag: false,
    rateValue: 0,
    feedFlag: false,
    aboutFlag: false,
    aboutText: 'mytime任务管理是一个简单、科学、有效的时间管理应用程序。你可以用它来规划，计时和记录你的经验。数据图表可以实时反馈自己的学习数据。',
    feedbackText: '',
  },
  onChange(e) {
    this.setData({
      rateValue: e.detail,
    });
  },
  showRate() {
    this.setData({
      rateFlag: true
    })
  },
  // 发送邮件
  sendEmail(text) {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'sendEmail',
      data: {
        // 传云函数的参数
        feedbackText: text
      },
      // 调用云函数成功后执行的方法
      success(res) {
        console.log('send success', res);
      },
      // 调用云函数失败后执行的方法
      fail(err) {
        console.log('send error', err);
      }
    })
  },
  onClose() {
    if (this.data.rateFlag && this.data.rateValue > 0) {
      let text = '小程序评分：' + this.data.rateValue
      this.sendEmail(text)
      Notify({ type: 'success', message: '评分成功' });
    }
    this.setData({
      rateFlag: false,
      feedFlag: false,
      aboutFlag: false,
      rateValue: 0
    })
  },
  showFeedback() {
    this.setData({
      feedFlag: true
    })
  },
  Done() {
    if (this.data.feedbackText == 0) {
      Toast('Please enter text.')
    } else {
      this.sendEmail(this.data.feedbackText)
      this.setData({
        feedFlag: false
      })
      Notify({ type: 'success', message: '反馈成功' });
    }
  },
  showAbout() {
    this.setData({
      aboutFlag: true
    })
  },
  logout() {
    wx.removeStorageSync('user')
    wx.removeStorageSync('planList')
    wx.removeStorageSync('tagList')
    wx.removeStorageSync('tagChart')
    wx.removeStorageSync('lineChart')
    wx.removeStorageSync('recordList')
    wx.removeStorageSync('timingPlan')
    wx.navigateBack()
  }
})