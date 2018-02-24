/**
 * Created by Prayansh on 2018-02-22.
 */

$(document).ready(function () {
    Utils.getStorage('username', function (username) {
        Utils.getStorage('school', function (school) {
            Utils.getStorage('password', function (password) {
                $('#renew').click(function () {
                    var _username = $('#username').val();
                    var _password = $('#password').val();
                    var school = $("#school").val();
                    if (!_username || !_password || !school) {
                        updateMessage("Enter your credentials");
                        return;
                    }
                    updateMessage("Renewing UPass....");
                    var username = encrypt.encrypt(_username);
                    var password = encrypt.encrypt(_password);
                    if ($('#remember').is(':checked')) {
                        Utils.setStorage('username', username);
                        Utils.setStorage('password', password);
                        Utils.setStorage('school', school);
                    }
                    renewPass(username, password, school);
                    $("#main").addClass("hidden");
                });
            });
        });
    });
    $('#getStatus').click(function () {
        getStatus();
    });
});