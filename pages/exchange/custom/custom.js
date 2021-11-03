import DianliService from "../../../lib/service"

Page({

    /**
     * 页面的初始数据
     */
    data: {
        collocate: {
            cy_exchange_pic: '',     //兑换图
            cy_exchange_title: '卡券兑换',   // 兑换标题
            cy_show_protocol: 0,           // 显示用户协议0隐藏1显示
            cy_protocol_title: '用户协议',   // 用户协议标题
            cy_protocol: '协议内容',         // 用户协议
            cy_exchange_theme: 1,          // 主题
            cy_exchage_tel: '',            // 兑换热线
        },
        qrinfo: {},
        cardid: 0,//卡id
        cardtypeid: 0 //卡类型id
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.service = new DianliService();
        if(options.cardtypeid) {
            this.setData({
                cardtypeid: options.cardtypeid
            }, () => {
                this.loadLayout();
            })
        } else {
            this.checkService(options.cusid)
                .finally(() => {
                    this.loadParameters(options);
                })
                .catch(e => {
                    console.log(e);
                });
        }
    },

    loadParameters: function (options) {
        console.log(options);
        let cusid = options.cusid;
        let cardNo = options.cardNo;
        let pwd = options.pwd;
        let qr = {
            userid: cusid,
            no: cardNo,
            cardtypeid: 0,
        }
        this.setData({
            qrinfo: qr
        }, () => {
            this.checkcardQr(cardNo, cusid, pwd);
        });
    },

    onShow: function () {
        const version = wx.getSystemInfoSync().SDKVersion;
        if (this.service.compareVersion(version, '2.8.3') >= 0) {
            wx.hideHomeButton();
        }
    },

    getpageSet: function (no, userid) {
        this.service.postPromise('/partner/card/check', {
            cardNo: no,
            type: 1,
            cusid: userid,
            cardtypeid: this.data.cardtypeid
        }).then(([code, res]) => {
            res.data.type != 2 ? this.checkErrorCode(res, no) : '';
        }).catch(e => {
            console.log(e);
        })
    },

    checkErrorCode: function (res, no) {
        if (res.data.errorCode == 300) {
            wx.redirectTo({
                url: '/pages/cards/order/detail?presentid=' + res.data.data.present_id,
            })
        }
        this.setData({
            cardid: res.data.cardid
        }, () => {
            this.loadLayout();
        });
    },

    loadLayout() {
        if(this.data.cardtypeid) {
            let cardtypeid = this.data.cardtypeid;
            var promise = this.service.getPromise(`/partner/card/layout?cardtypeid=${cardtypeid}`)
        } else {
            let cardid = this.data.cardid;
            promise = this.service.getPromise(`/partner/card/layout?cardid=${cardid}`);
        }
        promise.then(([code, res]) => {
                if (code == 200) {
                    this.setData({
                        collocate: res.data
                    });
                    if (res.data.cy_exchange_title != null) {
                        wx.setNavigationBarTitle({title: res.data.cy_exchange_title});
                    }
                }
            });
    },

    toast: function (value, icon = 'none') {
        this.service.toastPromise(value, icon);
    },

    validate: function (data) {
        if (data.cardNo === '') {
            this.toast('卡号不能为空！');
            return false;
        }
        if (data.Pwd === '') {
            this.toast('密码不能为空！');
            return false;
        }
        return true;
    },

    formSubmit: function (e) {
        this.validate(e.detail.value) ? this.checkcard2(e.detail.value,) : '';
    },

    checkService: function (cusid) {
        return this.service.postPromise('/partner/service/check', {cusid: cusid})
            .then(([code, res]) => {
                console.log(res);
                if (code == 200) {
                    this.setData({
                        ["collocate.cy_exchange_pic"]: res.data.cy_exchange_pic
                    })
                }
            }).catch(e => {
                console.log(e);
            })
    },

    checkcard2: function (data) {
        this.service.postPromise('/partner/card/check', {
            cardNo: data.cardNo,
            Pwd: data.Pwd,
            type: 1,
            cusid: this.data.qrinfo.userid,
            cardtypeid: this.data.cardtypeid
        }).then(([code, res]) => {
            code === 200 ? this.checkStatus(res, data.cardNo) : this.toast(res.message);
        })
    },

    checkcardQr: function (no, userid, pwd) {
        this.service.postPromise('/partner/card/check', {
            cardNo: no,
            Pwd: pwd,
            type: 1,
            cusid: userid
        }).then(([code, res]) => {
            code === 200 ? this.checkStatus(res, no) : this.toast(res.message);
            this.getpageSet(no, userid);
        })
    },

    checkStatus: function (res, cardNo) {
        let cusid = res.data.cusid;
        if(res.data.digest != null || res.data.camilotype == 2) {
            if (res.data.status == 2) {
                if (res.data.type == 3) {
                    wx.navigateTo({
                        url: '/pages/about/exchange-unify/package?cardid=' + res.data.cardid
                    })
                }
                if (res.data.type == 4) {
                    let flextype = this.data.collocate.cy_exchange_theme || 1;
                    wx.navigateTo({
                        url: `/pages/about/exchange-unify/multiple?id=${cardNo}&company=${res.data.company}&cusid=${this.data.qrinfo.userid}&flextype=${flextype}`
                    })
                } else {
                    let digest = res.data.digest || "";
                    let cardid = res.data.cardid;
                    wx.navigateTo({
                        url: `/miniexchange/pages/exchange/choice/single?cardid=${cardid}&digest=${digest}`
                    });
                }
            } else {
                this.showModal(res);
            }
        }
    },
    showModal: function (res) {
        wx.showModal({
            title: '提示',
            content: res.message,
            showCancel: false
        })
    },


    viewAgreement: function () {
        let cardtypeid = this.data.collocate.cardtypeid;
        wx.navigateTo({
            url: `/miniexchange/pages/exchange/agreement/agreement?cardtypeid=${cardtypeid}`
        })
    }
});
