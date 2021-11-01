const app = getApp();
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		collocate:{
			cy_exchange_pic: 'https://files.dianlinet.com/dianli/images/2019-12-06/14-44-07.jpg',     //兑换图
			cy_exchange_title: '卡券兑换',   // 兑换标题
			cy_show_protocol: 0,           // 显示用户协议0隐藏1显示
			cy_protocol_title: '用户协议',   // 用户协议标题
			cy_protocol: '协议内容',         // 用户协议
			cy_exchange_theme: 1,          // 主题
			cy_exchage_tel: '',            // 兑换热线
		},
		qrinfo:{},
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		app.func.onPageLoad(this, options);
		// app.func.authpage(this.route, this.options, () => {
			if (options.q) {
				this.checkQr(options.q);
			} else 	{
				this.setData({
					qrinfo:{
						no:"",
						userid:options.cusid
					}
				});
			}
		// });
	},

	onShow:function(){
		const version = wx.getSystemInfoSync().SDKVersion;
		if (this.compareVersion(version, '2.8.3') >= 0) {
			wx.hideHomeButton();
		}
	},

	getpageSet: function (no, userid) {
		app.func.postPromise('/dl/qr?access_token={{access_token}}', {
			uID: wx.getStorageSync('uid'),
			token: wx.getStorageSync('token'),
			cardNo: no,
			cusid: userid
		}).then(([code, res]) => {
			res.data.type != 2 ? this.checkErrorCode(res, no) : '';

		})
	},
	checkErrorCode:function(res, no){
		if (res.data.errorCode == 300) {
			wx.redirectTo({
				url: '/pages/cards/order/detail?presentid=' + res.data.data.present_id,
			})
		} else if(res.data.errorCode == 200) {
			this.setData({companyName:res.data.data.company});
		}
		this.dlexchange(no);
	},
	dlexchange(no){
		let cusid = this.data.qrinfo.userid;
		app.func.getPromise(`/dlexchange/customizelayout/${no}?access_token={{access_token}}&cusid=${cusid}`)
			.then(([code, res]) => {
				if (code == 200) {
					this.setData({
						collocate: res.data
					});
					if(res.data.cy_exchange_title != null) {
						wx.setNavigationBarTitle({title: res.data.cy_exchange_title});
					}
				}
			})
	},


	//提取卡号
	checkQr:function(qr){
		// let url = 'https://www.dianlinet.com/Weixin/Exchange/customer/id/LJ0000019UBE1?cusid=114';
		let url = decodeURIComponent(qr);
		let no = getNo();
		let userid = getUserid();
		let pwd = getPassword();
		this.setData({
			qrinfo:{
				no:no,
				userid:userid,
				password: pwd,
			}
		},()=>{
			if(pwd === false) {
				this.getpageSet(no, userid);
			} else {
				this.checkcardQr(no, userid, pwd);
			}
		});
		function getNo() {
			let oitem = url.split('?')[0].split('/');
            let result = oitem[oitem.length -1].trim().replace(/\+/g, "");
            return result;
		}
		function getUserid() {
			return getQueryVariable('cusid');
		}
		function getPassword() {
			return getQueryVariable('pwd');
		}
		function getQueryVariable (variable) {
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
	},

	toast:function(value){
		app.func.toastPromise(value)
	},
	validate:function(data){
		if (data.cardNo === '') {
			this.toast('卡号不能为空！');
			return false;
		}
		if (data.Pwd === '') {
			this.toast('密码不能为空！');
			return false;
		}
		return true;
	},
	formSubmit: function (e) {
		this.validate(e.detail.value) ? this.checkcard2(e.detail.value,) : '';
	},
	checkcard2:function(data){
		app.func.postPromise('/dl/checkcard2?access_token={{access_token}}',{
			cardNo: data.cardNo,
			Pwd: data.Pwd,
			type: 1,
			cusid: this.data.qrinfo.userid
		}).then(([code,res])=>{
			code === 200 ? this.checkStatus(res,data.cardNo) : this.toast(res.message);
		})
	},

	checkcardQr:function(no, userid, pwd){
		app.func.postPromise('/dl/checkcard2?access_token={{access_token}}',{
			cardNo: no,
			Pwd: pwd,
			type: 1,
			cusid: userid
		}).then(([code,res])=>{
			code === 200 ? this.checkStatus(res,no) : this.toast(res.message);
			this.getpageSet(no, userid);
		})
	},

	checkStatus:function(res,cardNo){
		console.log(res)
		if (res.data.status == 2) {
			if(res.data.type == 3){
				wx.navigateTo({
					url: '/pages/about/exchange-unify/package?cardid=' + res.data.cardid
				})
			}if(res.data.type==4){
				let flextype = this.data.collocate.cy_exchange_theme || 1;
				wx.navigateTo({
					url: `/pages/about/exchange-unify/multiple?id=${cardNo}&company=${res.data.company}&cusid=${this.data.qrinfo.userid}&flextype=${flextype}`
				})
			}
			else {
				let flextype = this.data.collocate.cy_exchange_theme || 1;
				wx.navigateTo({
					url: `/pages/about/exchange/details/details?id=${cardNo}&company=${res.data.company}&cusid=${this.data.qrinfo.userid}&flextype=${flextype}`
				});
			}
		}else {
			this.showModal(res);
		}
	},
	showModal:function(res){
		wx.showModal({
			title: '提示',
			content: res.message,
			showCancel: false,
			success: function (res) {
				if (res.confirm) {
					wx.setStorageSync("tab", "1");
					wx.switchTab({url: '/pages/gifts/gifts'})
				}
			}
		})
	},



	viewAgreement:function(){
		let cusid = this.data.qrinfo.userid;
		wx.navigateTo({
			url:`/pages/cards/agreement/agreement?cardNo=${this.data.qrinfo.no}&defineno=1&cusid=${cusid}`
		})
	},

	compareVersion:function(v1, v2) {
		v1 = v1.split('.')
		v2 = v2.split('.')
		const len = Math.max(v1.length, v2.length)

		while (v1.length < len) {
			v1.push('0')
		}
		while (v2.length < len) {
			v2.push('0')
		}

		for (let i = 0; i < len; i++) {
			const num1 = parseInt(v1[i])
			const num2 = parseInt(v2[i])

			if (num1 > num2) {
				return 1
			} else if (num1 < num2) {
				return -1
			}
		}

		return 0
	},


});
