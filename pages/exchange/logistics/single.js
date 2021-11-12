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
        app.func.getPromise('/ship/detail/' + this.data.presentid + "?access_token={{access_token}}")
            .then(([code,res])=>{
                if(res.data.compensateTime > res.data.apiTime){
                    this.setData({tips:1,compensateTime:res.data.compensateTime,apiTime:res.data.apiTime},()=>this.modifyjishi());
                }else if( res.data.compensatable == 1 ){
                    this.setData({
                        coupon:true,
                    },this.couponinfo(res.data.compensateKey));
                }
                this.setData({
                    ship: res.data, pageshow:true
                }, this.tips(0,res.data.shipments));
            });


        wx.setStorageSync("tab", "1");

        app.func.getPromise('/dianli/cardExpressShow/'+ this.data.presentid +'?access_token={{access_token}}')
            .then(([code,res])=>{
                if(code == 200){
                    this.setData({ cardtips:res.data });
                }
            });

        // 特价礼物
        app.func.getapi('/list/specialgift/0?length=30&access_token={{access_token}}',
            (code, res, that) => {
                if(code == 200){
                    that.setData({
                        assemble: res.data,
                        thispNum: res.data.length,
                        group_show:true,
                    });
                }
            }, (res, that) => {}, this);
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

    promise: app.func.resolve(1),

    makePhoneCall: function (e) {
        let tel = e.currentTarget.dataset.express;
        wx.makePhoneCall({
            phoneNumber: tel
        })
    },
})
