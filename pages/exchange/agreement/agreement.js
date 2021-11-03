import DianliService from "../../../lib/service"

Page({

    /**
     * 页面的初始数据
     */
    data: {
        content:''
    },

    /**
     * 生命周期函数--监听页面加载
     * 参数：cardid
     */
    onLoad: function (options) {
        this.service = new DianliService();
        this.cardinfo(options.cardid);
    },

    cardinfo:function(cardid){
        this.service.getPromise(`/partner/card/layout?cardid=${cardid}`)
            .then(([code,res])=>{
                this.setData({
                    content:res.data.cy_protocol
                });
                wx.setNavigationBarTitle({title: res.data.cy_protocol_title});
            })
    },
})
