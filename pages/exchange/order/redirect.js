import DianliService from "../../../lib/service"

Page({
    data: {},
    onLoad: function (options) {
        let cardid = options.cardid;
        let service = new DianliService();
        service.postPromise('/partner/card/check', {
            cardid: cardid
        }).then(([code, res]) => {
            if (code === 200) {
                switch (res.data.type) {
                    case 1:
                        wx.redirectTo({url: "/miniexchange/pages/exchange/order/single?cardid=" + cardid});
                        break;
                }
            } else {
                wx.redirectTo({url: "/miniexchange/pages/exchange/exchange"})
            }
        })
    }
});