import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

const app = getApp()

Page({
  data: {
    popupFlag: false,
    cardList: [],
    text: '',
  },
  // 页面显示生命周期
  onShow() {
    let user = wx.getStorageSync('user')
    if (user.length != 0) {
      this.getCardList()
    }

  },
  getCardList() {
    wx.cloud.database().collection('tag')
      .where({
        delete: false
      })
      .get()
      .then(res => {
        console.log('查询成功结果：', res.data)
        this.setData({
          cardList: res.data
        })
        wx.setStorageSync('tagList', res.data)
      })
      .catch(err => {
        console.log('查询失败结果：', err)
      })
  },

  add() {
    this.setData({
      popupFlag: true
    })
  },
  onClose() {
    this.setData({
      popupFlag: false,
      title: ''
    })
  },
  Done() {
    let user = wx.getStorageSync('user')
    if (user.length != 0) {
      let text = this.data.text
      if (text.length == 0) {
        Toast('请输入标签名称')
      } else if (text.length >= 20) {
        Toast('标签名称小于20字')
      } else {
        wx.cloud.database().collection('tag')
          .add({
            data: {
              title: this.data.text,
              createTime: new Date(),
              deleteTime: new Date(),
              delete: false,
              totalTime: '0.00'
            }
          })
          .then(res => {
            console.log('add success', res)
            this.getCardList()
          })
          .catch(err => {
            console.log('add error', err)
          })
        this.setData({
          popupFlag: false,
          text: ''
        })
      }
    } else {
      Dialog.confirm({
          title: '请先登录',
          message: '请点击“去登录”选项跳转到登录页面',
          confirmButtonText: '去登陆',
          cancelButtonText: '取消'
        })
        .then(() => {
          wx.navigateBack()
        })
        .catch(() => {

        })
    }
  },
  delete(e) {
    let id = e.currentTarget.dataset.id
    console.log(id)
    Dialog.confirm({
        title: '确认删除？',
        message: '删除标签不会影响已有的时间数据',
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      })
      .then(() => {
        wx.cloud.database().collection('tag')
          .doc(id)
          .update({
            data: {
              delete: true,
              deleteTime: new Date()
            }
          })
          .then(res => {
            console.log('remove success', res)
            this.getCardList()
            app.tagChart()
          })
          .catch(err => {
            console.log('remove err', err)
          })
      })
      .catch(() => {
        // on cancel
      });
  },
})