import Promise from 'es6-promise.min.js';

class DianliService {
    constructor() {
        let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
        if (extConfig.dlhost == null) {
            this.host = "https://www.dianlinet.com/";
        } else {
            this.host = extConfig.host;
        }
    }

    /**
     * url = String 请求地址
     * obj = Object 请求参数
     * success = function 成功回调
     * fail = function 成功回调
     */
    get(url, success, fail, count = 0) {
        var newurl = this.build_url(url);
        wx.request({
            url: newurl,
            data: '',
            method: 'GET',
            dataType: 'json',
            responseType: 'text',
            timeout: 300000,
            success: (res) => {
                if (res.data.code === 200) {
                    success != null && success(res);
                } else if (res.data.code === 403 || res.data.code === 401) {
                    console.log('token过期，需要重新登录');
                    if (count == 3) {
                        fail(res);
                    } else {
                        this.wxlogin(() => {
                            this.get(url, data, success, fail, count + 1);
                        }, function () {
                            console.log('有问题')
                        });
                    }
                } else {
                    success != null && success(res);
                }
            },
            fail(res) {
                if (fail) {
                    console.log('请求失败')
                    fail(res);
                }
                wx.hideLoading();
                wx.showToast({
                    title: '请求超时',
                    icon: 'loading',
                    duration: 2000
                })
            },
            complete: function () {
                wx.hideLoading();
            }
        })
    }

    getapi(url, success, fail, attach) {
        this.get(this.host + url,
            res => {
                success != null && success(res.data.code, res.data, attach);
            },
            res => {
                fail != null && fail(res, attach)
            });
    }

    //没动
    post(url, data, success, fail, count = 0) {
        var newurl = this.build_url(url);
        wx.request({
            url: newurl,
            data: data || '',
            header: {
                'content-type': 'application/json',
                'Accept': 'application/json'
            },
            method: 'POST',
            dataType: 'json',
            responseType: 'text',
            timeout: 300000,
            success: (res) => {
                if (res.data.code === 403 || res.data.code === 401) {
                    console.log('token过期，需要重新登录');
                    if (count == 3) {
                        fail(res);
                    } else {
                        this.wxlogin(() => {
                            this.post(url, data, success, fail, count + 1);
                        }, function () {
                            console.log('有问题')
                        });
                    }
                } else {
                    success(res);
                }
            },
            fail(res) {
                if (fail) {
                    console.log('提交失败');
                    fail(res);
                }
            }
        })
    }

    postapi(url, data, success, fail, attach) {
        this.post(this.host + url, data,
            res => {
                success != null && success(res.data.code, res.data, attach);
            },
            res => {
                fail != null && fail(res, attach)
            })
    }

    //没动
    upload(url, filepath, name, data, success, fail, count = 0) {
        var newurl = this.build_url(url);
        wx.uploadFile({
            url: newurl,
            filePath: filepath,
            name: name,
            formData: data,
            header: {
                'content-type': 'application/json',
                'Accept': 'application/json',
            },
            success(res) {
                try {
                    var data = JSON.parse(res.data);
                    if (data.code === 403 || data.code === 401) {
                        console.log('token过期，需要重新登录');
                        if (count == 3) {
                            fail(res);
                        } else {
                            this.wxlogin(() => {
                                this.upload(url, filepath, name, success, fail, count + 1);
                            }, function () {
                                console.log('有问题')
                            });
                        }
                    } else {
                        success(data);
                    }
                } catch (e) {
                    console.log(e);
                    fail(res);
                }
            },
            fail(res) {
                if (fail) {
                    console.log('提交失败');
                    fail(res);
                }
            }
        })
    }

    build_url(url) {
        var parts = url.split('?');
        if (parts.length === 1) {
            return url + "?service_token=" + wx.getStorageSync('dianli_accesstoken');
        } else {
            return url + "&service_token=" + wx.getStorageSync('dianli_accesstoken');
        }
    }

    uploadapi(url, filePath, name, data, success, fail, attach) {
        this.upload(this.host + url, filePath, name, data,
            res => {
                success != null && success(res.code, res, attach);
            },
            res => {
                fail != null && fail(res, attach)
            })
    }

    wxlogin(_success, _fail, _data) {
        let appid = wx.getAccountInfoSync().miniProgram.appId;
        wx.login({
            success: res => {
                var code = res.code;
                if (code) {
                    wx.request({
                        url: this.host + '/partner/user/login/' + appid + '/' + code,
                        method: 'POST',
                        header: {
                            'content-type': 'application/json'
                        },
                        success: function (res) {
                            if (res.data.code === 200) {
                                console.log(res)
                                wx.setStorageSync('dianli_accesstoken', res.data.data.token);
                                _success != null && _success(_data);
                            } else {
                                _fail != null && _fail(_data);
                            }
                        },
                    })

                } else {
                    _fail(data);
                }
            },
            fail(res) {
                console.log('wxlogin~~~!!!@###$!@@#');
                console.log(res);
            }

        });
    }

    promise(cb) {
        return new Promise(cb);
    }

    resolve(value) {
        return new Promise(function (resolve, reject) {
            resolve(value);
        });
    }

    reject(value) {
        return new Promise(function (resolve, reject) {
            reject(value);
        });
    }

    promise_all(arr) {
        return Promise.all(arr);
    }

    promise_any(arr) {
        return Promise.race(arr);
    }

    getPromise(url, attach) {
        return new Promise((resolve, reject) => {
            wx.getNetworkType({
                success: res => {
                    if (res.networkType == 'none') {
                        reject([res, attach]);
                    } else {
                        this.getapi(url,
                            (code, res) => {
                                resolve([code, res, attach]);
                            }, (res) => {
                                reject([res, attach]);
                            });
                    }
                }
            });
        });
    }

    postPromise(url, data, attach) {
        return new Promise((resolve, reject) => {
            wx.getNetworkType({
                success: (res) => {
                    if (res.networkType == 'none') {
                        reject([res, attach]);
                    } else {
                        this.postapi(url, data,
                            (code, res) => {
                                resolve([code, res, attach]);
                            }, (res) => {
                                reject([res, attach]);
                            })
                    }
                }
            });
        });
    }

    uploadPromise(url, file, name, data, attach) {
        return new Promise((resolve, reject) => {
            wx.getNetworkType({
                success: res => {
                    if (res.networkType == 'none') {
                        reject([res, attach]);
                    } else {
                        this.uploadapi(url, file, name, data,
                            (code, res) => {
                                resolve([code, res, attach]);
                            }, (res) => {
                                reject([res, attach]);
                            })
                    }
                }
            });
        });
    }

    toastPromise(title, icon = 'none', duration = 2000) {
        return new Promise(function (resolve, reject) {
            wx.showToast({
                title: title,
                icon: icon,
                duration: duration,
                success: function () {
                    setTimeout(function () {
                        resolve();
                    }, duration);
                }
            })
        });
    }

    delayPromise(duration = 2000) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve();
            }, duration)
        })
    }

    wxPromise(functionName, params) {
        return new Promise((resolve, reject) => {
            wx[functionName]({
                ...params,
                success: res => resolve(res),
                fail: res => reject(res)
            });
        });
    }

    confirm(title, msg, showCancel = true) {
        return this.wxPromise("showModal",
            {
                title: title,
                content: msg,
                confirmText: "确认",
                cancelText: "取消",
                showCancel:showCancel
            }
        ).then((res) => {
            if (res.confirm) {
                return this.resolve();
            } else {
                return this.reject();
            }
        });
    }

    compareVersion(v1, v2) {
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
    }
}

module.exports = DianliService;