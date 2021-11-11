import DianliService from "../../../lib/service"

Page({
    /**
     * 页面的初始数据
     */
    data: {
        present: null,
        cardid: '',
        source: '',
        dl_orderid: '',
        statusName: '',
        tipchoose: false,    //默认不显示 客服/申请售后弹出框
        applyIssueStatus: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.service = new DianliService();
        this.promise = this.service.resolve(1);
        this.setData({
            cardid: options.id
        }, () => {
            this.loadData(options);
        });
    },

    loadData(options) {
        this.hotline(options.cardid);
        this.service.getPromise('/partner/single/detail?cardid=' + options.cardid )
            .then(([code, res]) => {
                if (code == 200) {
                    this.setData({
                        source: res.data.source,
                        dl_orderid: res.data.dl_orderid,
                        statusName: res.data.statusName,
                        modifyable: res.data.modifyable,
                        present: res.data,
                        applyIssueStatus: res.data.applyIssueStatus,
                        presentid: options.presentid,
                    });
                }
            })
            .then(() => {
                if (this.data.present.modifyable == 1) {
                    this.modifyjishi();
                }
            });
    },

    hotline: function (id) {
        this.service.getPromise('/partner/card/hotline?cardid=' + id)
            .then(([code, res]) => {
                this.setData({
                    hotline: res.data
                })
            })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        if (wx.canIUse('hideHomeButton')) {
            wx.hideHomeButton()
        }
    },

    //复制
    copy: function (e) {
        var express = e.currentTarget.dataset.express;
        wx.setClipboardData({
            data: '流水号:' + express,
            success: res => {
            }
        })
    },

    copy_tel: function () {
        wx.setClipboardData({
            data: 'salveza',
            success: res => {
            }
        })
    },

    //产看物流
    logistics: function () {
        var presentid = this.data.presentid;
        wx.navigateTo({
            url: "/pages/cards/order/logistics?presentid=" + presentid
        })
    },

    //卡券商品详情
    exchangedetail: function (e) {
        wx.navigateTo({
            url: '/pages/cards/product/detail?id=' + e.currentTarget.dataset.id,
        })
    },

    onUnload: function () {
    },

    hideallrange: function () {
        this.setData({tipchoose: false});
    },

    //修改地址
    modifyAddress: function (e) {
        wx.redirectTo({
            url: '/pages/gifts/pages/address/address?presentid=' + e.currentTarget.dataset.presentid + '&modify=1',
        });
    },

    //选择  人工客服/申请售后
    tipchoose: function () {
        this.setData({tipchoose: true});
    },

    //申请工单
    workorder: function () {
        var presentid = this.data.presentid;
        wx.navigateTo({
            url: '/pages/gifts/pages/workorder/workorder?presentid=' + presentid
        })
    },
    //查看工单
    view_workorder: function () {
        var presentid = this.data.presentid;
        wx.navigateTo({
            url: '/pages/gifts/pages/workorder/detail/detail?presentid=' + presentid
        })
    },

    //订阅消息
    subscribe: function () {
        app.func.wxPromisify('requestSubscribeMessage', {
            tmplIds: ['Mu33E3EUUb3z-_jcDfYVzPSF6j1jZRrG0kqCiT7_kiA']
        }).then((res) => {
            if (res["Mu33E3EUUb3z-_jcDfYVzPSF6j1jZRrG0kqCiT7_kiA"] == 'accept') {
                app.func.toastPromise('订阅成功');
            }
            return app.func.postPromise('/subscribe/ship/' + this.options.presentid + "?access_token={{access_token}}", res)
        }).then(([code, res]) => {
            console.log(res);
        }, (res) => {
            console.log(res);
        });
    },

    makePhoneCall: function (e) {
        let tel = e.currentTarget.dataset.express;
        wx.makePhoneCall({
            phoneNumber: tel
        })
    },

    jumpServer: function () {
        let src = 'https://mp.weixin.qq.com/s/70y9CDEcCzG_5mtFguS30w';
        wx.navigateTo({
            url: '/pages/about/webview/webview?src=' + src
        })
    }

})
