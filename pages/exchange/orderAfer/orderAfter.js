import DianliService from "../../../lib/service"

Page({

    data: {
        imglist: [],
        noteMaxLen: 200,         //详细地址的字数限制
        currentNoteLen: 0,       //输入的字数
        type: null,
        content: '',
        tel: '',
        presentid: '',
        skuid: [],
        shopdetail: '',
        deleteindex: '',
        current: 0,
        shipments: '',
        showapply: false,
        showapplycontent: false,
        status: ['待处理', '待反馈', '已解决'],
        caseThat:0,
    },


    onLoad: function (options) {
      let service = new DianliService();
      service.getPromise('partner/dict/dict_list')
            .then(([code, res]) => {
              console.log(res);
                this.setData({dictvalue: res.data, presentid: options.presentid});
            })
            .then(() => {
                return app.func.getPromise('/ship/detail/' + options.presentid + "?access_token={{access_token}}")
                    .then(([code, res]) => {
                        if (code == 200) {
                            this.setData({shipments: res.data.shipments,});
                             wxparse.wxParse('dkcontent', 'html', res.data.shipments[0].policy, this, 5);
                            console.log(res.data.shipments[0].policy)
                        }
                    })
            })
            .then(() => {
                var shipid = this.data.shipments[0].shipid;
                this.setData({shipid: shipid}, () => this.applyconment(shipid));
            })
    },
    onShow: function () {
    },

    applyconment: function (shipid) {
        if (shipid == null) {
            shipid = 0
        }
        app.func.getPromise('/issue/detail/' + shipid + '/' + this.data.presentid + '?access_token={{access_token}}')
            .then(([code, res]) => {
                if (code == 6001 && !res.data) {
                    this.setData({showapply: false, showapplycontent: false});
                } else if (code == 6001 && res.data) {
                    this.setData({showapply: true, showapplycontent: false});
                } else if (code == 200) {
                    this.setData({applyContent: res.data, showapplycontent: true, showapply: false,});
                }
            })
    },
    clickbag: function (e) {
        var index = e.currentTarget.dataset.index;
        var shipid = e.currentTarget.dataset.shipid;
        this.setData({current: index, shipid: shipid}, () => this.applyconment(shipid));
    },

    img_w_show: function () {
        var that = this;
        var count = 3 - this.data.imglist.length;
        wx.chooseImage({
            count: count,
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                console.log(res);
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                var tempFilePaths = res.tempFilePaths;
                that.setData({
                    imglist: that.data.imglist.concat(tempFilePaths)
                })

            }
        })
    },
    //图片点击事件
    imgYu: function (e) {
        var src = e.currentTarget.dataset.src;
        wx.previewImage({
            urls: [src]
        })
    },


    formsubmit: function (e) {
        console.log(e);
        var shipid = this.data.shipid;
        if (shipid == null) {
            shipid = 0
        }
        var type = e.detail.value.radioChange;
        var content = e.detail.value.content;
        if (type == null) {
            app.func.toastPromise('请选择原因');
            return;
        } else if (content.length == 0) {
            app.func.toastPromise('请填写问题描述');
            return;
        }
        wx.showLoading({
            title: '提交中'
        });
        var that = this;
        var presentid = this.data.presentid;
        var tel = e.detail.value.tel;
        var formId = e.detail.formId;
        var imglise = this.data.imglist;
        var promise = app.func.resolve();
        var result = [];
        for (var i = 0; i < imglise.length; i++) {
            let file = imglise[i];
            let suffix = i;
            promise = promise.then(() => {
                return app.func.uploadPromise("/v2/image/upload?access_token={{access_token}}",
                    file, 'file', {suffix: suffix}).then(function ([code, res]) {
                    if (code == 3102 || code == 3103) {
                        that.setData({deleteindex: suffix});
                        return app.func.toastPromise('图片内容违规').then((resolve, reject) => {
                            reject();
                        });
                    } else {
                        result.push(res.data);
                    }
                });
            });
        }
        promise.then(function () {
            return app.func.postPromise('/issue/issueorder?access_token={{access_token}}&form_id=' + formId,
                {
                    ship_id: shipid,
                    img: result,
                    type: type,
                    content: content,
                    receive_id: presentid,
                    tel: tel
                })
                .then(([code, res]) => {
                    wx.hideLoading();
                    if (code == 200) {
                        wx.showToast({
                            title: '提交成功',
                            icon: 'success',
                            duration: 1000,
                            mask: true,
                            success(res) {
                                setTimeout(function () {
                                    wx.redirectTo({
                                        url: '/pages/cards/order/detail?presentid=' + presentid
                                    })
                                }, 1500)
                            }
                        })
                    } else {
                        app.func.toastPromise(res.message);
                    }
                })
        });


    },


    preimg: function (e) {
        var src = e.currentTarget.dataset.src;
        wx.previewImage({
            urls: [src]
        })
    },
    layoutvalue: function (e) {
        console.log(e);
        this.setData({sendinfo: e.detail.value});
    },

    send: function (e) {
        var that = this;
        var presentid = this.data.presentid;
        var shipid = this.data.shipid;
        if (shipid == null) {
            shipid = 0;
        }
        var tel = this.data.applyContent.tel;
        var type = this.data.applyContent.type;
        var content = this.data.sendinfo;
        var formId = e.detail.formId;
        app.func.postPromise('/issue/issueorder?access_token={{access_token}}&form_id=' + formId,
            {
                content: content,
                img: [],
                receive_id: presentid,
                ship_id: shipid,
                tel: tel,
                type: type,
            })
            .then(([code, res]) => {
                if (code == 200) {
                    wx.showToast({
                        title: '提交成功',
                        icon: 'success',
                        duration: 1000,
                        mask: true,
                        success(res) {
                            setTimeout(function () {
                                wx.redirectTo({
                                    url: '/pages/gifts/pages/workorder/workorder?presentid=' + presentid
                                })
                            }, 1500)
                        }
                    })
                } else {
                    wx.showToast({
                        title: res.message,
                        icon: 'none',
                        duration: 2000,
                        mask: true,
                        success(res) {
                        }
                    })
                }
            })
    },
    showkeyinfo: function () {
        this.setData({showkeyinfo: true});
    },
    showCase:function(){
        this.setData({
            caseThat:0
        })

    },
    unset:function(){
        this.setData({
            caseThat:1
        })
    },
    workorder: function () {
        var shipid = this.data.shipid;
        if (shipid == null) {
            shipid = 0
        }
        var presentid = this.data.presentid;
        app.func.getPromise('/issue/resolved/' + shipid + '/' + presentid + '?access_token={{access_token}}')
            .then(([code, res]) => {
                if (code == 200) {
                    wx.showToast({
                        title: '提交成功',
                        icon: 'success',
                        duration: 1000,
                        mask: true,
                        success(res) {
                            setTimeout(function () {
                                wx.redirectTo({
                                    url: '/pages/gifts/pages/workorder/workorder?presentid=' + presentid
                                })
                            }, 1500)
                        }
                    })
                }
            })
    }

})
