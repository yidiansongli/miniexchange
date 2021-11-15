import DianliService from "../../../lib/service";

var page = {

    /**
     * 页面的初始数据
     */
    data: {
        cardid: '',
        orderids: '',
        name: "",
        postalCode: "",
        telNumber: "",
        area: "",
        address: "",
        region: ['请选择', '请选择', '请选择'],
        customItem: '请选择',
        showinfo: false,
        showpage: false,
        showrange: true,
        modifyaddress: 0,
        showcurrency: false,
        norange: false,
        addressdetail: false,
        subscribe: true,
        clickNum: 0
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.service = new DianliService();
        this.setData({
            cardid: options.cardid,
            orderids: options.orderids
        }, () => {
            var that = this;
            wx.chooseAddress({
                success: function (res) {
                    var region = [res.provinceName, res.cityName, res.countyName];
                    that.setData({
                        region: region,
                        name: res.userName,
                        postalCode: res.postalCode,
                        telNumber: res.telNumber,
                        address: res.detailInfo,
                        showpage: true
                    })
                }, fail: function () {
                    // console.log('调用失败')
                    that.setData({showpage: true});
                }, complete: function () {
                    //console.log('调用完成')
                }
            });
        });
    },

    //更新选择的地址
    bindRegionChange: function (e) {
        //console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            region: e.detail.value
        })
    },


    formsubmit: function (e) {
        this.apply(e.detail.value);
    },

    apply: function (data) {
        var that = this;
        var showinfo = this.data.showinfo;
        var name = data.name;
        var telNumber = data.telNumber;
        var region = data.region;
        var address = data.address;
        var provinceName = that.data.region[0]; //国标收货地址第一级地址
        var cityName = that.data.region[1];     //国标收货地址第二级地址
        var countyName = that.data.region[2];   //国标收货地址第三级地址
        var orderids = that.data.orderids;
        if (name == "" || telNumber == "" || region == "" || address == "" || provinceName == "请选择" || cityName == "请选择" || countyName == "请选择") {
            this.service.toastPromise('请完善信息后重试', 'none', 1500);
        } else if (name.length < 2) {
            this.service.toastPromise('姓名不得小于两个字', 'none', 1000);
        } else if (!showinfo) {
            this.setData({showinfo: true});
        } else {
            this.service.postPromise('/partner/order/modify?cardid=' + this.options.cardid,
                {
                    orderids:orderids,
                    name: name,
                    telNumber: telNumber,
                    area: provinceName + '|' + cityName + '|' + countyName,
                    address: address
                }
            ).then(([code, res]) => {
                if (code == 200) {
                    wx.redirectTo({
                        url: '/miniexchange/pages/exchange/order/redirect?cardid=' + this.options.cardid,
                    });
                } else if (code == 1620) {
                    this.setData({norange: true, showinfo: false, showcurrency: true});
                } else if (code == 3405) {
                    this.setData({showinfo: false}, () => this.addressdetail());
                } else {
                    this.setData({showinfo: false, message: res.message});
                }
            })
        }
    },

    addressdetail: function () {
        app.func.toastPromise('亲，详细地址填写有误，请重新填写。', 'none', 2000)
    },

    hideinfo: function () {
        this.setData({showinfo: false, showcurrency: false});
    },


    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        wx.hideHomeButton();
    },


    view_range: function () {
        var rangelength = this.data.range.length;
        if (rangelength > 3) {
            this.setData({showallrange: true});
        }
    },
    hideallrange: function () {
        this.setData({showallrange: false});
    },
    hiderange: function () {
        this.setData({showrange: false});
    }
};
Page(page);
