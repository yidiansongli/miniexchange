import DianliService from "../../../lib/service"

Page({
    /**
     * 页面的初始数据
     */
    data: {
        present: null,
        cardid: '',
        statusName: '',
        applyIssueStatus: false,
        orderids: '',
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
                        present: res.data,
                        applyIssueStatus: res.data.applyIssueStatus,
                        cardid: options.cardid,
                        orderids: res.data.orderids
                    });
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
        var cardid = this.data.cardid;
        var orderids = this.data.orderids;
        wx.navigateTo({
            url: `/miniexchange/pages/exchange/logistics/single?cardid=${cardid}&orderids=${orderids}`
        })
    },

    //卡券商品详情
    exchangedetail: function (e) {
        wx.navigateTo({
            url: '/miniexchange/pages/product/product?id=' + e.currentTarget.dataset.id,
        })
    },

    onUnload: function () {
    },

    //修改地址
    modifyAddress: function (e) {
        var cardid = this.data.cardid;
        var orderids = this.data.orderids;
        wx.navigateTo({
            url: `/miniexchange/pages/exchange/order/address?cardid=${cardid}&orderids=${orderids}`
        });
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
        this.service.wxPromise('requestSubscribeMessage', {
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
