import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

Page({
  data: {
    template: [],
    title: '',
    content: '',
    Flag: false,
    AddOrUpdate: false,
    updateId: '',
    updateFlag: true
  },
  onShow() {
    let user = wx.getStorageSync('user')
    if (user.length != 0) {
      this.getTemplateList()
    }
  },
  getTemplateList() {
    wx.cloud.database().collection('template')
      .where({
        delete: false
      })
      .get()
      .then(res => {
        console.log('get success', res)
        this.setData({
          template: res.data
        })
      })
      .catch(err => {
        console.log('get error', err)
      })
  },
  add() {
    this.setData({
      Flag: true,
      title: '',
      content: '',
      updateFlag: false
    })
  },
  onClose() {
    this.setData({
      Flag: false,
    })
    setTimeout(_ => {
      this.setData({
        Flag: false,
        updateFlag: true
      })
    }, 500)
  },
  showUpdate(e) {
    let item = e.currentTarget.dataset.item
    this.setData({
      Flag: true,
      AddOrUpdate: true,
      title: item.title,
      content: item.content,
      updateId: item._id
    })
  },
  Done() {
    let user = wx.getStorageSync('user')
    if (user.length != 0) {
      let title = this.data.title
      let content = this.data.content
      if (title.length == 0 || content.length == 0) {
        Toast('请输入标题和内容')
      } else if (title.length >= 20) {
        Toast('标题不超过20个字')
      } else if (!this.data.AddOrUpdate) {
        wx.cloud.database().collection('template')
          .add({
            data: {
              title: title,
              content: content,
              createTime: new Date(),
              updateTime: new Date(),
              deleteTime: new Date(),
              delete: false
            }
          })
          .then(res => {
            console.log('add success', res)
            this.getTemplateList()
          })
          .catch(err => {
            console.log('add error', err)
          })
        this.setData({
          Flag: false,
          AddOrUpdate: false,
          updateFlag: true
        })
        setTimeout(_ => {
          this.setData({
            title: '',
            content: '',
          })
        }, 500)
      } else if (this.data.AddOrUpdate) {
        Dialog.alert({
            message: '确认覆盖原模板？',
            showCancelButton: true,
            confirmButtonText: '确认',
            cancelButtonText: '取消'
          }).then(() => {
            wx.cloud.database().collection('template')
              .doc(this.data.updateId)
              .update({
                data: {
                  title: title,
                  content: content,
                  updateTime: new Date(),
                }
              })
              .then(res => {
                console.log('update success', res)
                this.getTemplateList()
              })
              .catch(err => {
                console.log('update error', err)
              })
            this.setData({
              Flag: false,
              AddOrUpdate: false,
              updateId: ''
            })
            setTimeout(_ => {
              this.setData({
                title: '',
                content: '',
              })
            }, 500)
          })
          .catch(() => {})
      }
    } else {
      Dialog.confirm({
          title: '请先登录',
          message: '点击“去登录”选项跳转到登录页',
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
    // e.stopPropagation()
    let title = e.currentTarget.dataset.title
    let id = e.currentTarget.dataset.id
    Dialog.alert({
        message: '确认删除？',
        showCancelButton: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        wx.cloud.database().collection('template')
          .doc(id)
          .update({
            data: {
              delete: true,
              deleteTime: new Date()
            }
          })
          .then(res => {
            console.log('delete success', res)
            this.getTemplateList()
          })
          .catch(err => {
            console.log('delete error', err)
          })
      })
      .catch(() => {
        // on cancel
      });
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