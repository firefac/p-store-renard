var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    navList: [],
    goodsList: [],
    id: 0,
    currentCategory: {},
    scrollLeft: 0,
    scrollTop: 0,
    scrollHeight: 0,
    pageNum: 1,
    pageSize: 100,
    lastPage: false
  },

  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    if (options.id) {
      that.setData({
        id: parseInt(options.id)
      });
    }

    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    });

    this.getCategoryInfo();
  },

  onPullDownRefresh() {
    // wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getCategoryInfo();
    // wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  getCategoryInfo: function() {
    let that = this;
    util.request(api.GoodsCategory, {
        id: this.data.id
      })
      .then(function(res) {

        if (res.errcode =="0") {
          that.setData({
            navList: res.data.brotherCategory,
            currentCategory: res.data.currentCategory
          });

          if(that.data.id == res.data.parentCategory.id){
            that.setData({
              id: res.data.currentCategory.id
            })
          }

          wx.setNavigationBarTitle({
            title: res.data.parentCategory.name
          })

          //nav位置
          let currentIndex = 0;
          let navListCount = that.data.navList.length;
          for (let i = 0; i < navListCount; i++) {
            currentIndex += 1;
            if (that.data.navList[i].id == that.data.id) {
              break;
            }
          }
          if (currentIndex > navListCount / 2 && navListCount > 5) {
            that.setData({
              scrollLeft: currentIndex * 60
            });
          }

          that.getGoodsList();
        } else {
          //显示错误信息
        }

      });
  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
    console.log(1);
  },
  onHide: function() {
    // 页面隐藏
  },
  getGoodsList: function() {
    wx.showLoading({
      title: '加载中',
    });

    setTimeout(function() {
      wx.hideLoading()
    }, 2000);

    var that = this;
    util.request(api.GoodsList, {
        categoryId: that.data.currentCategory.id,
        pageNum: that.data.pageNum,
        pageSize: that.data.pageSize
      }, "POST")
      .then(function(res) {
        that.setData({
          goodsList: that.data.goodsList.concat(res.data.list)
        });

        if(res.data.list.length < that.data.pageSize){
          that.data.lastPage = true
        }

        wx.hideLoading();
      });
  },
  onReachBottom() {
    if(this.data.lastPage){
      wx.showToast({
        title: '没有更多商品了',
        icon: 'none',
        duration: 2000
      });
      return false;
    }else{
      this.setData({
        pageNum: this.data.pageNum + 1
      });
      this.getGoodsList();
    }
  },
  onUnload: function() {
    // 页面关闭
  },
  switchCate: function(event) {
    if (this.data.id == event.currentTarget.dataset.id) {
      return false;
    }
    var that = this;
    var clientX = event.detail.x;
    var currentTarget = event.currentTarget;
    if (clientX < 60) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft - 60
      });
    } else if (clientX > 330) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft
      });
    }
    this.setData({
      id: event.currentTarget.dataset.id,
      goodsList: [],
      pageNum: 1,
      pageSize: 10,
      lastPage: false
    });

    this.getCategoryInfo();
  }
})