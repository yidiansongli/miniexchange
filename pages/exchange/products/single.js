// pages/gifts/pages/details/single.js
//获取应用实例
const app = getApp();

Page({
    data: {
        ID: 0,
        showImg: '',
        imgUrl: '',
        currentTab: 0,
        prolist: [],
        send_user: '',
        sale: 1,
        companyName: '',
        flextype:1,
        show_company: 1
    },
    onLoad: function (options) {
        if(options.flextype){
            this.setData({
                flextype:options.flextype
            });
        }
        app.func.onPageLoad(this, options);
        app.func.postapi('/weixin/Gifts/getgifts?access_token={{access_token}}',
            {
                uID: wx.getStorageSync('uid'),
                token: wx.getStorageSync('token'),
                ID: options.id,
                cusid: options.cusid || 0,
            },
            (code, res, that) => {
                if (res.success) {
                    if (res.sale == 0) {
                        that.setData({
                            clientError: res.clientError,
                            sale: res.sale,
                            tipExpired: 0,
                            tel: res.tel
                        });
                    }
                    that.setData({
                        ID: options.id,
                        showImg: res.data.cy_pic,
                        prolist: res.data.pro_list,
                        imgUrl: app.globalData.imgUrl,
                        companyName:options.company,
                        cusid:options.cusid,
                        show_company: res.data.show_company
                    })
                    if(res.data.exchange_show != null && res.data.exchange_show != ""){
                        let content = res.data.exchange_show;
                        app.func.confirm('兑换提示',content,false);
                    }
                } else {
                    app.func.toastPromise(res.message)
                }
            }, (res, that) => {}, this);
    },


    //查看产品详情
    bindViewTap: function (e) {
        var ID = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/about/exchange/product/product?id=' + ID
        })
    },
    //填写收货地址完成兑换
    bindGiveTap: function (e) {
        let goodsId = e.currentTarget.dataset.id;
        let giftsId = this.data.ID;
        let cusid = this.data.cusid || 0;
        wx.navigateTo({
            url: `/pages/about/exchange/order/order?pid= ${goodsId}&gid=${giftsId}&cusid=${cusid}`
        })
    },

    hideModal: function () {
        this.setData({tipExpired: 1})
    },
    open_tel: function () {
        var tel = this.data.tel;
        wx.makePhoneCall({
            phoneNumber: tel
        })
    },
    copy_tel: function () {
        var tel = this.data.tel;
        wx.setClipboardData({
            data: tel,
            success: res => {
            }
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        wx.getSetting({
            success(res) {
                if (res.authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success(res) {
                            console.log(res.userInfo);
                            app.func.ongetuserinfo(res.userInfo);
                            // requestData.ongetuserinfo(res.userInfo);
                            // _succ != null && _succ(res.userInfo);
                        },
                        fail(res) {
                        }
                    })
                }
            }
        })
    },

})
