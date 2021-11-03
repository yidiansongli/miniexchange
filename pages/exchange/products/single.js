import DianliService from "../../../lib/service"

Page({
    data: {
        ID: 0,
        showImg: '',
        currentTab: 0,
        prolist: [],
        send_user: '',
        sale: 1,
        companyName: '',
        flextype:1,
        show_company: 1
    },
    onLoad: function (options) {
        this.service = new DianliService();
        if(options.flextype){
            this.setData({
                flextype:options.flextype
            });
        }
        this.service.postPromise('/partner/card/products',
            {
                cardNo: options.id,
                cusid: options.cusid || 0
            }
        ).then(([code, res])=> {
            if(code == 200) {
                if (res.data.sale == 0) {
                    this.setData({
                        clientError: res.clientError,
                        sale: res.sale,
                        tipExpired: 0,
                        tel: res.tel
                    });
                }
                this.setData({
                    ID: options.id,
                    showImg: res.data.cy_pic,
                    prolist: res.data.pro_list,
                    companyName:options.company,
                    cusid:options.cusid,
                    show_company: res.data.show_company
                })
                if(res.data.exchange_show != null && res.data.exchange_show != ""){
                    let content = res.data.exchange_show;
                    app.func.confirm('兑换提示',content,false);
                }
            } else {
                app.func.toastPromise(res.message)
            }
        }).catch(e => console.log(e));
    },


    //查看产品详情
    bindViewTap: function (e) {
        var ID = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/about/exchange/product/product?id=' + ID
        })
    },
    //填写收货地址完成兑换
    bindGiveTap: function (e) {
        let goodsId = e.currentTarget.dataset.id;
        let giftsId = this.data.ID;
        let cusid = this.data.cusid || 0;
        wx.navigateTo({
            url: `/pages/about/exchange/order/order?pid= ${goodsId}&gid=${giftsId}&cusid=${cusid}`
        })
    },

    hideModal: function () {
        this.setData({tipExpired: 1})
    },
    open_tel: function () {
        var tel = this.data.tel;
        wx.makePhoneCall({
            phoneNumber: tel
        })
    },
    copy_tel: function () {
        var tel = this.data.tel;
        wx.setClipboardData({
            data: tel,
            success: res => {
            }
        })
    },

})
