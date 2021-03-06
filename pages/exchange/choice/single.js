import DianliService from "../../../lib/service"

Page({
    data: {
        cardid: 0,
        digest: '',
        showImg: '',
        prolist: [],
        sale: 1,
        companyName: '',
        flextype: 1,
        show_company: 1
    },

    /**
     * param:cardid
     * digest:
     * @param options
     */
    onLoad: function (options) {
        this.service = new DianliService();
        wx.hideHomeButton();
        this.setData({
            cardid: options.cardid,
            digest: options.digest
        }, () => {
            this.loadProducts(options.cardid);
            this.loadLayout(options.cardid);
        });
    },

    loadLayout(cardid) {
        this.service.getPromise(`/partner/card/layout?cardid=${cardid}`)
            .then(([code, res]) => {
                if (code == 200) {
                    this.setData({
                        companyName: res.data.company_name,
                        show_company: res.data.show_company,
                        flextype: res.data.cy_exchange_theme || 1
                    });
                    wx.setNavigationBarTitle({
                        title: res.data.cy_exchange_title
                    })
                }
            });
    },

    loadProducts: function (cardid) {
        this.service.postPromise('/partner/card/products',
            {
                cardid: cardid
            }
        ).then(([code, res]) => {
            if (code == 200) {
                if (res.data.sale == 0) {
                    this.setData({
                        clientError: res.data.error,
                        sale: res.data.sale,
                        tipExpired: 0,
                        tel: res.data.tel
                    });
                }
                this.setData({
                    showImg: res.data.cy_pic,
                    prolist: res.data.pro_list,
                })
                if (res.data.exchange_show != null && res.data.exchange_show != "") {
                    let content = res.data.exchange_show;
                    this.service.confirm('????????????', content, false);
                }
            } else {
                this.service.toastPromise(res.message)
            }
        }).catch(e => console.log(e));
    },


    //??????????????????
    bindViewTap: function (e) {
        var ID = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/miniexchange/pages/product/product?id=' + ID
        })
    },
    //??????????????????????????????
    bindGiveTap: function (e) {
        let goodsId = e.currentTarget.dataset.id;
        let cardid = this.data.cardid;
        let digest = this.data.digest;
        wx.navigateTo({
            url: `/miniexchange/pages/exchange/exchange/single?proid=${goodsId}&cardid=${cardid}&digest=${digest}`
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
