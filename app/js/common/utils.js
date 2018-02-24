/**
 * Created by Prayansh on 2017-11-05.
 */
var Utils = function () {
    return {
        setStorage: function (key, value, callback) {
            var obj = {};
            obj[key] = value;
            chrome.storage.local.set(obj, function () {
                if (callback)
                    callback();
            });
        },
        getStorage: function (key, callback) {
            chrome.storage.local.get(key, function (result) {
                if (callback)
                    callback(result[key]);
            });
        }
    };
}();