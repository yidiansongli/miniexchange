import DianliService from "../../../lib/service";

var page = {

    /**
     * 页面的初始数据
     */
    data: {
        orderids: '',
        address: {
            name: "",
            telNumber: "",
            telNumber2: "",
            address: "",
            region: ['请选择', '请选择', '请选择'],
        },
        postalCode: "",
        area: "",
        customItem: '请选择',
        showinfo: false,
        showpage: false,
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
                        ["address.region"]: region,
                        ["address.name"]: res.userName,
                        ["address.postalCode"]: res.postalCode,
                        ["address.telNumber"]: res.telNumber,
                        ["address.address"]: res.detailInfo,
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
            ['address.region']: e.detail.value
        })
    },


    formsubmit: function (e) {
        let data = e.detail.value;
        console.log(data);
        this.setData({
            ["address.name"]: data.name,
            ["address.telNumber"]: data.telNumber,
            ["address.telNumber2"]: data.telNumber2,
            ["address.address"]: data.address,
        }, () => {
            this.apply(data);
        });
    },

    apply: function (data) {
        var that = this;
        var showinfo = this.data.showinfo;
        var name = data.name;
        var telNumber = data.telNumber;
        var telNumber2 = data.telNumber2;
        var region = this.data.address.region;
        var address = data.address;
        var provinceName = region[0]; //国标收货地址第一级地址
        var cityName = region[1];     //国标收货地址第二级地址
        var countyName = region[2];   //国标收货地址第三级地址
        var orderids = that.data.orderids;
        if (name == "" || telNumber == "" || region == "" || address == "" || provinceName == "请选择" || cityName == "请选择" || countyName == "请选择") {
            this.service.toastPromise('请完善信息后重试', 'none', 1500);
        } else if (name.length < 2) {
            this.service.toastPromise('姓名不得小于两个字', 'none', 1000);
        } else if (!showinfo) {
            this.setData({showinfo: true});
        } else {
            wx.showLoading({mask: true});
            this.service.postPromise('/partner/order/modify?cardid=' + this.options.cardid,
                {
                    orderids: orderids,
                    name: name,
                    telNumber: telNumber,
                    telNumber2: telNumber2,
                    area: provinceName + '|' + cityName + '|' + countyName,
                    address: address
                }
            ).then(([code, res]) => {
                if (code == 200) {
                    wx.redirectTo({
                        url: '/miniexchange/pages/exchange/order/redirect?cardid=' + this.options.cardid,
                    });
                } else {
                    this.setData({showinfo: false, message: res.message});
                }
            }).finally(() => {
                wx.hideLoading();
            })
        }
    },

    addressdetail: function () {
        this.service.toastPromise('亲，详细地址填写有误，请重新填写。', 'none', 2000)
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
};
Page(page);
