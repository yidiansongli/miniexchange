import DianliService from "../../../lib/service"

Page({
    data: {},
    onLoad: function (options) {
        let cardid = options.cardid;
        let service = new DianliService();
        service.postPromise('/partner/card/check', {
            cardid: cardid
        }).then(([code, res]) => {
            // if (code === 200) {
            //     this.checkStatus(res, no)
            //         .then(() => {
            //             this.loadLayout();
            //         })
            // } else {
                this.redirectTo({url:"/pages/exchange/verify/verify"})
            // }
        })
    }
});