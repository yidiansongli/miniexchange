Page({
    data: {},
    onLoad: function (options) {
        wx.hideHomeButton();
        if (options.q) {
            this.checkQr(options.q);
        }
    },

    //提取卡号
    checkQr: function (qr) {
        let url = decodeURIComponent(qr);
        let no = getNo();
        let userid = getUserid();
        let pwd = getPassword();
        let redirect = `/miniexchange/pages/exchange/verify/verify?cardNo=${no}`
        if (userid) {
            redirect = redirect + `&cusid=${userid}`;
        }
        if (pwd) {
            redirect = redirect + `&pwd=${pwd}`;
        }
        wx.redirectTo({'url': redirect});

        function getNo() {
            let oitem = url.split('?')[0].split('/');
            let result = oitem[oitem.length - 1].trim().replace(/\+/g, "");
            return result;
        }

        function getUserid() {
            return getQueryVariable('cusid');
        }

        function getPassword() {
            return getQueryVariable('pwd');
        }

        function getQueryVariable(variable) {
            var query = url.split('?')[1];
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (pair[0] == variable) {
                    return pair[1];
                }
            }
            return (false);
        }
    }
});