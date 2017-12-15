/**
 * Created by Prayansh on 2017-11-05.
 */
var Utils = function () {
    return {
        setStorage: function (key, value, callback) {
            chrome.storage.local.set({key: value}, function () {
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