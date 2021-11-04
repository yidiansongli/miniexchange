import DianliService from "../../../lib/service"

Page({

    /**
     * 页面的初始数据
     */
    data: {
        cardid: 0,  //卡券ID
        digest: '',//密钥
        productId: 0,  //兑换的产品ID
        addinfo: [],
        hasSuccess: false,
        region: ['请选择', '请选择', '请选择'],
        customItem: '请选择',
        complaintContent: '',  //备注信息
        group_show: false,
        tipsBox: false,
        storeid: null,
        package_id: null,
        clickNum: 0,
        subscribe: true,
        revTimes: null,//[{id:1, name:"2021-05-20"}, {id:2, name:'2021-05-21'}, {id:3, name: '2021-05-22'}],
        revTime: 0,//2,
        revTimesHour: null, //[[{id:1, name:"2021-05-20"}, {id:2, name:'2021-05-21'}, {id:3, name: '2021-05-22'}], [{id:1, name:"9:00~12:00"}, {id: 2, name:"12:00~20:00"}]],
        revTime1: [0, 0], //[0,0]
        reversable: false,
        shipable: true,
        shipablArr: []
    },

    /**
     * 生命周期函数--监听页面加载
     * 参数：cardId:卡券id
     * proid: 产品id
     * cusid：客户id
     * digest：密钥（optional)
     */
    onLoad: function (options) {
        this.service = new DianliService();
        this.setData({
            cardid: options.cardid,
            productId: options.proid,
            digest: options.digest
        }, () => {
            wx.chooseAddress({
                success: (res) => {
                    var region = [res.provinceName, res.cityName, res.countyName];
                    this.setData({addinfo: res, region: region});
                },
                complete: () => {
                    this.checkData(options);
                }
            })
        })
    },

    checkData: function (options) {
        this.loadProduct(options.proid);
    },

    loadProduct: function (proid) {
        let arr = [parseInt(proid)];
        this.service.postPromise('/partner/product/list', {
            proids: arr
        }).then(([code, res]) => {
            this.setData({prodata1: res.data});

            this.checkReserve1 = (id, index) => {
                let address = this.data.region[0] + this.data.region[1] + this.data.region[2];
                this.service.postPromise('/weixin/exchange/reverseable?access_token={{access_token}}', {
                    goodsId: id,
                    cusid: cusid,
                    address: address
                })
                    .then(([code, res]) => {
                        let shiparrrun = [];
                        shiparrrun[index] = res.data.shipable;
                        this.setData({
                            shipablArr: shiparrrun,
                        });
                        if (!res.data.shipablArr[index]) {
                            this.setData({
                                shipable: false,
                                shipablArr: []
                            })
                            app.func.toastPromise('此产品不支持当前区域的配送');
                            return false;
                        }
                    });
            }
            for (let i = 0; i < arr.length; i++) {
                this.checkReserve1(arr[i], i);
            }
            this.setData({
                idrunarr: arr
            })
            for (let i = 0; i < this.data.shipablArr.length; i++) {
                if (i == false) {
                    this.setData({
                        shipable: false,
                        shipablArr: []
                    })
                }
            }

        })
    },

    revTimeChanged: function (e) {
        this.setData({
            revTime: e.detail.value
        })
    },

    revTimeHourChanged: function (e) {
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
    subscribe: function (e) {
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
                        console.log(msg);
                        return this.service.toastPromise(msg);
                    });
            }
        });
    },

    checkInfo: function (formdata) {
        var tipsBox = this.data.tipsBox;
        if (formdata.userName == '') {
            return this.service.reject('收货人姓名不能为空');
        }
        //验证手机号
        if (!this.validatemobile(formdata.telNumber)) {
            return this.service.reject('手机号码有误！');
        }
        if (this.data.region[0] == '请选择') {
            return this.service.reject('省级地址不能为空！');
        }
        if (this.data.region[1] == '请选择') {
            return this.service.reject('市级地址不能为空！');
        }
        if (this.data.region[2] == '请选择') {
            return this.service.reject('区级地址不能为空！');
        }
        if (formdata.Address == '') {
            return this.service.reject('详情地址不能为空！');
        }
        if (this.data.digest == '' && formdata.cardPwd == '') {
            return this.service.reject('密码不能为空！');
        }
        wx.showLoading({
            title: '提交中',
            mask: true,
        })
        let that = this;
        let revTime = 0;
        if (this.data.revTimesHour != null) {
            let day = this.data.revTimesHour[0][this.data.revTime1[0]].id;
            let time = this.data.revTimesHour[1][this.data.revTime1[1]].id;
            revTime = day + time;
        } else {
            if (this.data.revTimes != null) {
                revTime = this.data.revTimes[this.data.revTime].id;
            }
        }
        return this.service.postPromise('/partner/single/check', {
            cardid: that.data.cardid,
            goodsId: that.data.productId,
            userName: formdata.userName,
            provinceName: that.data.region[0],
            cityName: that.data.region[1],
            countyName: that.data.region[2],
            address: formdata.Address,
            telNumber: formdata.telNumber,
            digest: that.data.digest,
            password: formdata.cardPwd,
            revTime: revTime,
            comment: that.data.complaintContent
        }).then(([code, res]) => {
            if (code == 200) {
                return this.service.resolve();
            } else {
                return this.service.reject(res.message);
            }
        }, () => {
            return this.service.resolve();
        }).finally(() => {
            wx.hideLoading({
                success: (res) => {
                },
            })
        });
    },

    submitInfo: function (formdata, subRes) {
        //单选券
        this.cardOrder(formdata, subRes);
    },

    //卡券提交订单
    cardOrder: function (formdata, subRes) {
        var that = this;
        let revTime = 0;
        if (this.data.revTimesHour != null) {
            let day = this.data.revTimesHour[0][this.data.revTime1[0]].id;
            let time = this.data.revTimesHour[1][this.data.revTime1[1]].id;
            revTime = day + time;
        } else {
            if (this.data.revTimes != null) {
                revTime = this.data.revTimes[this.data.revTime].id;
            }
        }
        this.service.postPromise('/dl/order?access_token={{access_token}}', {
            cardid: that.data.cardid,
            goodsId: that.data.productId,
            userName: formdata.userName,
            provinceName: that.data.region[0],
            cityName: that.data.region[1],
            countyName: that.data.region[2],
            address: formdata.Address,
            telNumber: formdata.telNumber,
            digest: that.data.digest,
            password: formdata.cardPwd,
            revTime: revTime,
            comment: that.data.complaintContent
        }).then(([code, res]) => {
            var presentid = res.data.orderid;
            if (res.success) {
                wx.setStorageSync("tab", "1");
                wx.switchTab({url: '/pages/gifts/gifts'});
            } else {
                this.service.toastPromise(res.message);
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
        if (this.data.runid == 0) {
            if (this.checkReserve1 != null) {
                for (let i = 0; i < this.data.idrunarr.length; i++) {
                    this.checkReserve1(this.data.idrunarr[i], i);
                }
            }
        } else {
            if (this.checkReserve != null) {
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
    }

})
