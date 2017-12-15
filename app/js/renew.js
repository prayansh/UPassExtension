const encrypt = new JSEncrypt();
encrypt.setPublicKey(CONSTANTS.RSA_PUBLIC_KEY);

var jobId = false;

var renewPass = function (_username, _password, school) {
    // set content-type header and data as json in args parameter
    var headers = {
        "username": _username,
        "password": _password,
        "school": school
    };

    RestClient.post(CONSTANTS.BASE_URL + "/renew", headers).then(function (response) {
        // parsed response body as js object
        // console.log(data);
        var responseCode = response.status;
        var data = response.data;
        if (responseCode === 202) {
            updateMessage("UPass is renewing, jobId=" + data.jobId);
            jobId = data.jobId;
            Utils.setStorage('jobId', jobId);
            $('#getStatus').prop('disabled', false);
        } else if (responseCode === 208) {
            updateMessage("Job was already submitted, currently running");
        } else if (responseCode === 503) {
            updateMessage("Server is down for maintenance");
        } else if (responseCode === 401) {
            updateMessage("Invalid Encryption key");
        } else {
            updateMessage("Something went wrong: responseCode=" + responseCode);
        }
    }, function (err) {
        updateMessage('Something went wrong on the request');
        errorHandler(err);
    });

};

function getStatus() {
    if (!jobId) {
        Utils.getStorage('jobId', function (_id) {
            jobId = _id;
        })
    }
    if (jobId) {
        var headers = {
            "id": jobId
        };
        RestClient.get(CONSTANTS.BASE_URL + "/get", headers).then(function (response) {
            var status = response.data.status;
            var responseCode = response.status;
            if (responseCode === 200) {
                if (status === "AUTHENTICATION_ERROR") {
                    updateMessage("Please check the credentials");
                } else if (status === "NOTHING_TO_RENEW") {
                    updateMessage("Your UPass was already renewed");
                } else if (status === "SCHOOL_NOT_FOUND") {
                    updateMessage("Interestingly enough I couldn't find your school")
                } else if (status === "RENEW_SUCCESSFUL") {
                    updateMessage("You are all set!");
                } else if (status === "ERROR") {
                    updateMessage("Something went wrong here");
                } else if (status === "RUNNING"){
                    updateMessage("Job is still running");
                }

            } else if (responseCode === 400) {
                updateMessage("Invalid JobID");
            }
        }, function (err) {
            updateMessage('Something went wrong on the request');
            errorHandler(err);
        });
    } else {
        updateMessage("You haven't submitted a job");
    }
}

$(document).ready(function () {
    Utils.getStorage('username', function (username) {
        Utils.getStorage('school', function (school) {
            Utils.getStorage('password', function (password) {
                if (username && school && password) {
                    updateMessage("Renewing UPass....");
                    renewPass(username, password, school);
                }
                else {
                    $('#renew').click(function () {
                        var _username = $('#username').val();
                        var _password = $('#password').val();
                        var school = $("#school").val();
                        if (!_username || !_password || !school) {
                            updateMessage("Enter your credentials");
                            return;
                        }
                        if ($('#remember').is(':checked')) {
                        }
                        updateMessage("Renewing UPass....");
                        var username = encrypt.encrypt(_username);
                        var password = encrypt.encrypt(_password);
                        Utils.setStorage('username', username);
                        Utils.setStorage('password', password);
                        Utils.setStorage('school', school);
                        renewPass(username, password, school);
                        hideUIElements(true)
                    });
                }
            });
        });
    });
    $('#getStatus').click(function () {
        getStatus();
    });
});

function hideUIElements(main) {
    $("#main").removeClass("hidden");
    $("#msg_chk").removeClass("hidden");
    if (main) {
        $("#main").addClass("hidden");
    }
    else {
        $("#msg_chk").addClass("hidden");
    }
}

function updateMessage(message) {
    $("#message").text(message);
}

var errorHandler = function (err) {
    console.log(err)
};
