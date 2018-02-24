/**
 * Created by Prayansh on 2017-12-17.
 */

$(document).ready(function () {
    Utils.getStorage('username', function (username) {
        Utils.getStorage('school', function (school) {
            Utils.getStorage('password', function (password) {
                console.log("Starting up!");
                if (username && school && password) {
                    $('#open').addClass("hidden");
                    $('#renew').click(function () {
                        updateMessage("Please wait....");
                        $('#main').addClass("hidden");
                        renewPass(username, password, school);
                        $('#getStatus').click(function () {
                            getStatus();
                        });
                    });
                }
                else {
                    $('#main').addClass("hidden");
                    $('#open').click(showOptionsMenu);
                }
            });
        });
    });
});

function showOptionsMenu() {
    chrome.runtime.openOptionsPage();
}