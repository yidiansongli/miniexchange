class DianliService {
    constructor() {
        let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
        if (extConfig.host == null) {
            this.host = "www.dianlinet.com";
        } else {
            this.host = extConfig.host;
        }
    }
}