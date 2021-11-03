// pages/gifts/pages/order/order.js
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        giftsId: 0,  //礼迹ID
        goodsId: 0,  //兑换的产品ID
        addinfo: [],
        hasSuccess: false,
        region: ['请选择', '请选择', '请选择'],
        customItem: '请选择',
        complaintContent: '',  //备注信息
        group_show: false,
        tipsBox: false,
        storeid: null,
        package_id: null,
        clickNum:0,
        subscribe:true,
        revTimes: null,//[{id:1, name:"2021-05-20"}, {id:2, name:'2021-05-21'}, {id:3, name: '2021-05-22'}],
        revTime: 0,//2,
        revTimesHour:null, //[[{id:1, name:"2021-05-20"}, {id:2, name:'2021-05-21'}, {id:3, name: '2021-05-22'}], [{id:1, name:"9:00~12:00"}, {id: 2, name:"12:00~20:00"}]],
        revTime1: [0,0], //[0,0]
        reversable: false,
        shipable: true,
        shipablArr:[]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
     
        app.func.onPageLoad(this, options);
        let that = this;
        wx.chooseAddress({
            success: function (res) {
                var region = [res.provinceName, res.cityName, res.countyName];
                that.setData({addinfo: res, region: region});
            },
            complete: function () {
                that.checkData(options, that);
            }
        })
    },
    checkData: function (options, that) {
        if(options.runid==0){
            that.runof(options.proid, options.cusid || 0);
            that.setData({giftsId: options.cardNo,cusid:options.cusid || 0,runid:options.runid,cardId:options.cardId,pid:options.pid});
        }else{
            if (options.storeid) {
                that.dlDetail(options.goodsId, options.cusid || 0);
                that.setData({storeid: options.storeid, goodsId: options.goodsId,cusid:options.cusid || 0});
            } else if (options.package_id) {
                that.packageShop(options.package_id);
                that.setData({package_id: options.package_id, goodsId: options.goodsId,cusid:options.cusid || 0});
            }  else {
                that.dlDetail(options.pid, options.cusid || 0);
                that.setData({goodsId: options.pid, giftsId: options.gid, cusid:options.cusid || 0});
            }
        }
     
    },
    runof:function(idarr,cusid){
        let arrid = idarr.split(",");
        let arr= [];
        arrid.forEach(v=>{
            arr.push(parseInt(v));
        });
        let d = JSON.stringify(arr);
       app.func.getPromise('/dianli/sku/?ids=' + d + "&access_token={{access_token}}")
       .then(([code,res])=>{
             this.setData({ prodata1:res.data });

             this.checkReserve1 = (id,index) => {
                let address = this.data.region[0] + this.data.region[1] + this.data.region[2];
                app.func.postPromise('/weixin/exchange/reverseable?access_token={{access_token}}',{
                    goodsId: id,
                    cusid:cusid,
                    address: address})
                    .then(([code, res]) => {
                        let shiparrrun=[];
                        shiparrrun[index]=res.data.shipable;
                        this.setData({
                            shipablArr: shiparrrun,
                        });
                        if(!res.data.shipablArr[index]) {
                            this.setData({
                                shipable:false,
                                shipablArr:[]
                            })
                            app.func.toastPromise('此产品不支持当前区域的配送');
                            return false;
                        }
                    });
            }
            for(let i=0;i<arr.length;i++){
                this.checkReserve1(arr[i],i);
            }
            this.setData({
                idrunarr:arr
            })
            for(let i=0;i<this.data.shipablArr.length;i++){
                if(i ==false){
                    this.setData({
                        shipable:false,
                        shipablArr:[]
                    })
                }
            }
           
       })
    },
    dlDetail:function(id, cusid) {
        app.func.getPromise('/dianli/dlsku/' + id + "?access_token={{access_token}}")
            .then(([code,res])=>{
                  this.setData({ "prodata[0]":res.data });
            })

        this.checkReserve = () => {
            let address = this.data.region[0] + this.data.region[1] + this.data.region[2];
            app.func.postPromise('/weixin/exchange/reverseable?access_token={{access_token}}',{
                goodsId: id,
                cusid:cusid,
                address: address})
                .then(([code, res]) => {
                    this.setData({
                        reversable: res.data.reversable,
                        revTimes: res.data.revTimes,
                        revTimesHour: res.data.revTimesHour,
                        shipable: res.data.shipable
                    });
                    if(!res.data.shipable) {
                        app.func.toastPromise('此产品不支持当前区域的配送');
                    }
                });
        }
        this.checkReserve();
    },

    revTimeChanged: function(e) {
        this.setData({
            revTime: e.detail.value
        })
    },

    revTimeHourChanged: function(e) {
        this.setData({
            revTime1: e.detail.value
        })
    },

    packageShop: function (id) {
        var that = this;
        app.func.getPromise("/packageDetail/" + id + "?access_token={{access_token}}")
            .then(([code, res]) => {
                that.setData({prodata: res.data.sku});
            })
    },

    hideinfo: function () {
        this.setData({tipsBox: false});
    },

    //订阅消息
    subscribe:function(e){
        // var clickNum = this.data.clickNum;
        wx.requestSubscribeMessage({
            tmplIds: ['Mu33E3EUUb3z-_jcDfYVzPSF6j1jZRrG0kqCiT7_kiA'],
            success: (subRes) => {
                this.submitInfo(this.data.newFormdata, subRes);
            },
            fail: () => {
                this.submitInfo(this.data.newFormdata, null);
            }
        });
    },

    formSubmit: function (e) {
        let formdata = e.detail.value;
        this.setData({
            newFormdata: formdata,
            name: formdata.userName,
            tel: formdata.telNumber,
            address: formdata.Address,
        }, () => {
            if (!this.data.tipsBox) {
                this.checkInfo(formdata)
                    .then(() => {
                        this.setData({tipsBox: true});
                    })
                    .catch((msg) => {
                        return app.func.toastPromise(msg);
                    });
            }
        });
    },

    checkInfo: function (formdata) {
        var tipsBox = this.data.tipsBox;
        if (formdata.userName == '') {
            return app.func.reject('收货人姓名不能为空');
        }
        //验证手机号
        if (!this.validatemobile(formdata.telNumber)) {
            return app.func.reject('手机号码有误！');
        }
        if (this.data.region[0] == '请选择') {
            return app.func.reject('省级地址不能为空！');
        }
        if (this.data.region[1] == '请选择') {
            return app.func.reject('市级地址不能为空！');
        }
        if (this.data.region[2] == '请选择') {
            return app.func.reject('区级地址不能为空！');
        }
        if (formdata.Address == '') {
            return app.func.reject('详情地址不能为空！');
        }
        if (this.data.storeid) {
            return this.func.resolve();
        } else if (this.data.package_id) {
            return this.func.resolve();
        } else {
            if(this.data.runid==0){
                wx:wx.showLoading({
                  title: '提交中',
                  mask: true,
                
                })
                let that = this;
                let revTime = 0;
                if(this.data.revTimesHour != null) {
                    let day = this.data.revTimesHour[0][this.data.revTime1[0]].id;
                    let time = this.data.revTimesHour[1][this.data.revTime1[1]].id;
                    revTime = day + time;
                } else {
                    if(this.data.revTimes != null) {
                        revTime = this.data.revTimes[this.data.revTime].id;
                    }
                }
                let d = JSON.stringify(this.data.idrunarr) ;
                return app.func.postPromise('/weixin/gifts/orderCheckMulti?access_token={{access_token}}', {
                    cardid: that.data.cardId,
                    productid:that.data.pid,
                    name: formdata.userName,
                    province: that.data.region[0],
                    city: that.data.region[1],
                    county: that.data.region[2],
                    address: formdata.Address,
                    mobile: formdata.telNumber,
                }).then(([code, res]) => {
                    wx.hideLoading({
                        success: (res) => {},
                      })
                    if(code == 200) {
                        return app.func.resolve();
                    } else {
                        return app.func.reject(res.message);
                    }
                }, () => {
                    wx.hideLoading({
                        success: (res) => {},
                      })
                    return app.func.resolve();
                });
            }else{
                wx:wx.showLoading({
                    title: '提交中',
                    mask: true,
                  
                  })
                let that = this;
                let revTime = 0;
                if(this.data.revTimesHour != null) {
                    let day = this.data.revTimesHour[0][this.data.revTime1[0]].id;
                    let time = this.data.revTimesHour[1][this.data.revTime1[1]].id;
                    revTime = day + time;
                } else {
                    if(this.data.revTimes != null) {
                        revTime = this.data.revTimes[this.data.revTime].id;
                    }
                }
                return app.func.postPromise('/weixin/gifts/orderCheck?access_token={{access_token}}', {
                    uID: wx.getStorageSync('uid'),
                    token: wx.getStorageSync('token'),
                    giftsId: that.data.giftsId,
                    goodsId: that.data.goodsId,
                    userName: formdata.userName,
                    provinceName: that.data.region[0],
                    cityName: that.data.region[1],
                    countyName: that.data.region[2],
                    detailInfo: formdata.Address,
                    telNumber: formdata.telNumber,
                    cusid:this.data.cusid,
                    revTime: revTime
                }).then(([code, res]) => {
                    wx.hideLoading({
                      success: (res) => {},
                    })
                    if(code == 200) {
                        return app.func.resolve();
                    } else {
                        return app.func.reject(res.message);
                    }
                }, () => {
                    return app.func.resolve();
                });
            }
           
        }
    },

    submitInfo: function (formdata, subRes) {
        if (this.data.storeid) {
            //积分提交订单
            this.storeOrder(formdata, subRes);
        } else if (this.data.package_id) {
            //多选卡提交订单
            this.dlOrderPack(formdata, subRes);
        } else {
            //卡券提交订单
            if(this.data.runid==0){
                // 多选券
                this.runorder(formdata, subRes);
            }else{
                //单选券
                this.cardOrder(formdata, subRes);
            }
           
        }
    },

    //多选卡提交订单
    dlOrderPack: function (formdata, subRes) {
        app.func.postPromise('/dlorderpack?access_token={{access_token}}', {
            "giftsId": this.data.goodsId,
            "package_id": this.data.package_id,
            "userName": formdata.userName,
            "provinceName": this.data.region[0],
            "cityName": this.data.region[1],
            "countyName": this.data.region[2],
            "detailInfo": formdata.Address,
            "telNumber": formdata.telNumber,
            cusid:this.data.cusid
        }).then(([code, res]) => {
            if (res.success) {
                this.ordercommentadd(this.data.goodsId,this.data.complaintContent,3,res.presentid, subRes);
            } else if (code == 2101) {
                wx.setStorageSync("tab", "1");
                wx.switchTab({url: '/pages/gifts/gifts'});
            } else {
                app.func.toastPromise(res.message);
            }
        })
    },
    //卡券提交订单
    cardOrder: function (formdata, subRes) {
        var that = this;
        let revTime = 0;
        if(this.data.revTimesHour != null) {
            let day = this.data.revTimesHour[0][this.data.revTime1[0]].id;
            let time = this.data.revTimesHour[1][this.data.revTime1[1]].id;
            revTime = day + time;
        } else {
            if(this.data.revTimes != null) {
                revTime = this.data.revTimes[this.data.revTime].id;
            }
        }
        app.func.postPromise('/dl/order?access_token={{access_token}}', {
            uID: wx.getStorageSync('uid'),
            token: wx.getStorageSync('token'),
            giftsId: that.data.giftsId,
            goodsId: that.data.goodsId,
            userName: formdata.userName,
            provinceName: that.data.region[0],
            cityName: that.data.region[1],
            countyName: that.data.region[2],
            detailInfo: formdata.Address,
            telNumber: formdata.telNumber,
            cusid:this.data.cusid,
            revTime: revTime
        }).then(([code, res]) => {
            var presentid = res.presentid;
            if (res.success) {
                that.ordercommentadd(that.data.giftsId,that.data.complaintContent,1,presentid, subRes)
            } else if (code == 2101) {
                wx.setStorageSync("tab", "1");
                wx.switchTab({url: '/pages/gifts/gifts'});
            } else {
                app.func.toastPromise(res.message);           
                return;
            }
        })
    },

    //积分提交订单
    storeOrder: function (formdata, subRes) {
        var that = this;
        let revTime = 0;
        if(this.data.revTimesHour != null) {
            let day = this.data.revTimesHour[0][this.data.revTime1[0]].id;
            let time = this.data.revTimesHour[1][this.data.revTime1[1]].id;
            revTime = day + time;
        } else {
            if(this.data.revTimes != null) {
                revTime = this.data.revTimes[this.data.revTime].id;
            }
        }

        app.func.postPromise('/store/order?access_token={{access_token}}', {
            uID: wx.getStorageSync('uid'),
            token: wx.getStorageSync('token'),
            storeid: that.data.storeid,
            giftsId: "0000000",
            goodsId: that.data.goodsId,
            userName: formdata.userName,
            provinceName: that.data.region[0],
            cityName: that.data.region[1],
            countyName: that.data.region[2],
            detailInfo: formdata.Address,
            telNumber: formdata.telNumber,
            cusid:this.data.cusid,
            revTime: revTime
        }).then(([code, res]) => {
            if (res.success) {
                that.ordercommentadd(res.data,that.data.complaintContent,2,res.presentid, subRes);
            } else {
                app.func.toastPromise(res.message);
                return;
            }
        })
    },

    //共用 提交备注接口
    ordercommentadd:function(ID,comment,type,presentid, subRes,cardid){
        
        app.func.postPromise('/subscribe/ship/' + presentid + "?access_token={{access_token}}", subRes)
            .then(()=>{
                if(this.data.runid==0){
                    return  app.func.postPromise('/weixin/Gifts/ordercommentadd?access_token={{access_token}}',
                    {
                        uID: wx.getStorageSync('uid'),
                        token: wx.getStorageSync('token'),
                        ID: ID,
                        commentContent: comment,
                        type: type,
                        cusid:this.data.cusid,
                        cardId:this.data.cardId
                    }).then(([code, res]) => {
                    if (res.success) {
                        wx.redirectTo({
                            url: '/pages/cards/order/detail?presentid=' + presentid + "&addMiniProgram=1"
                        });
                    }
                })
                }else{
                    return  app.func.postPromise('/weixin/Gifts/ordercommentadd?access_token={{access_token}}',
                    {
                        uID: wx.getStorageSync('uid'),
                        token: wx.getStorageSync('token'),
                        ID: ID,
                        commentContent: comment,
                        type: type,
                        cusid:this.data.cusid
                    }).then(([code, res]) => {
                    if (res.success) {
                        wx.redirectTo({
                            url: '/pages/cards/order/detail?presentid=' + presentid + "&addMiniProgram=1"
                        });
                    }
                })
                }
                
            })


    },
    runorder:function(formdata, subRes){
        var that = this;
        let revTime = 0;
        if(this.data.revTimesHour != null) {
            let day = this.data.revTimesHour[0][this.data.revTime1[0]].id;
            let time = this.data.revTimesHour[1][this.data.revTime1[1]].id;
            revTime = day + time;
        } else {
            if(this.data.revTimes != null) {
                revTime = this.data.revTimes[this.data.revTime].id;
            }
        }
        app.func.postPromise('/dlordermulti?access_token={{access_token}}', {
            cardid: that.data.cardId,
            productid:that.data.pid,
            name: formdata.userName,
            province: that.data.region[0],
            city: that.data.region[1],
            county: that.data.region[2],
            address: formdata.Address,
            mobile: formdata.telNumber,

        }).then(([code, res]) => {
            var presentid = res.presentid;
            if (res.success) {
                that.ordercommentadd(that.data.giftsId,that.data.complaintContent,3,presentid, subRes,that.data.cardId)
            } else if (code == 2101) {
                wx.setStorageSync("tab", "1");
                wx.switchTab({url: '/pages/gifts/gifts'});
            } else {
                app.func.toastPromise(res.message);           
                return;
            }
        })
    },


    comSubmit: function () {
        wx.setStorageSync("tab", "1");
        wx.switchTab({
            url: '/pages/gifts/gifts',
        })
    },


    bindRegionChange: function (e) {
        this.setData({
            region: e.detail.value
        })
        if(this.data.runid ==0){
            if(this.checkReserve1 != null) {
                for(let i=0;i<this.data.idrunarr.length;i++){
                    this.checkReserve1(this.data.idrunarr[i],i);
                }
            }
        }else{
            if(this.checkReserve != null) {
                this.checkReserve();
            }
        }
      
    },//备注更新
    commentTxtFn: function (e) {
        this.setData({
            complaintContent: e.detail.value
        })
    },//验证手机号是否正确
    validatemobile: function (mobile) {
        var myreg = /^1\d{10}$/;
        if (!myreg.test(mobile)) {
            return false;
        }
        return true;
    },



    // uID: wx.getStorageSync('uid'),   //用户ID
    // token: wx.getStorageSync('token'),  //token
    // giftsId: that.data.giftsId,       //场景礼记ID  卡号
    // goodsId: that.data.goodsId,       //兑换的产品ID
    // userName: formdata.userName,  //收货人姓名
    // //postalCode: res.postalCode, //邮编
    // provinceName: that.data.region[0],  //国标收货地址第一级地址
    // cityName: that.data.region[1],         //国标收货地址第二级地址
    // countyName: that.data.region[2],     //国标收货地址第三级地址
    // detailInfo: formdata.Address,       //详细收货地址信息
    // //nationalCode: res.nationalCode,   //收货地址国家码
    // telNumber: formdata.telNumber      //收货人手机号码

})
