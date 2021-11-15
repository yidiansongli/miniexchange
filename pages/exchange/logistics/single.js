import DianliService from "../../../lib/service";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        ship: null,
        current: 0,
        pageshow:false,
        watermark:false,
        tipsinfo:'',
        cardtips:'',
        walletStatus:1,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.service = new DianliService();
        this.promise = this.service.resolve(1);
        this.setData({cardid:options.cardid});
        this.hotline(options.cardid);
    },

    hotline:function(id){
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
        this.service.getPromise('/partner/single/logistics?cardid=' + this.data.cardid)
            .then(([code,res])=>{
                console.log(res);
                this.setData({
                    ship: res.data, pageshow:true
                }, () => {
                    this.tips(0,res.data.shipments)
                });
            });

        this.service.getPromise('/dianli/cardExpressShow/'+ this.data.presentid +'?access_token={{access_token}}')
            .then(([code,res])=>{
                if(code == 200){
                    this.setData({ cardtips:res.data });
                }
            });
    },


    copy: function (e) {
        var express = e.currentTarget.dataset.express;
        wx.setClipboardData({
            data: express,
            success: res => { }
        })
    },

    phone: function(e) {
        var phone = e.currentTarget.dataset.phone;
        wx.makePhoneCall({
            phoneNumber: phone
        })
    },

    sku: function(e) {
        let shipid = e.currentTarget.dataset.shipid;
        let skuid = e.currentTarget.dataset.skuid;
        wx.navigateTo({
            url: 'exchangedetail?skuid=' + skuid,
        })
    },

    visitbags: function (e) {
        var index = e.currentTarget.dataset.index;
        this.setData({
            current: index
        },this.tips(index));
    },

    tips:function(index,shipment){
        var shipments = shipment || this.data.ship.shipments;
        var shipid = shipments[index].shipid;
        var skuid = shipments[index].items[0].skuid;
        app.func.getPromise(`/ship/notice/${shipid}/${skuid}?access_token={{access_token}}`)
            .then(([code,res])=>{
                if(code == 200){
                    this.setData({tipsinfo:res.data});
                }
            })
    },

    makePhoneCall: function (e) {
        let tel = e.currentTarget.dataset.express;
        wx.makePhoneCall({
            phoneNumber: tel
        })
    },
})
