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
            updateMessage("UPass is renewing, click button to refresh status");
            jobId = data.jobId;
            Utils.setStorage('jobId', jobId);
            $('#getStatus').prop('disabled', false);
            $("#msg_chk").removeClass("hidden");
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
                } else if (status === "RUNNING") {
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

function updateMessage(message) {
    $("#message").text(message);
}

var errorHandler = function (err) {
    console.log(err)
};
