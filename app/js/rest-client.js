var RestClient = function () {
    var http = {
        GET: 'GET',
        POST: 'POST',
        PUT: 'PUT',
        DELETE: 'DELETE'
    };

    var refreshTokenRetries = 0;
    var refreshTokenTimeout = 60000;
    var refreshTokenProc = false;

    var request = function (method, url, headers, body, responseType, maxRetryTime) {
        return new Promise(function (resolve, reject) {
            var maxRetries = maxRetryTime ? maxRetryTime : 0;
            var retries = 0;
            var retryProc = false;
            var doRequest = function () {
                var xhr = new XMLHttpRequest();

                xhr.onload = function () {
                    console.log("RestClient: request(): end: status=" + this.status);
                    console.log("RestClient: request(): end: responseType=" + this.responseType);
                    if (this.responseType === '' || this.responseType === 'text') {
                        console.log("RestClient: request(): end: responseText=" + this.responseText);
                        console.log("RestClient: request(): end: responseXml=" + this.responseXML);
                    }

                    if (this.status === 200 || this.status === 201 || this.status === 202 || this.status === 204) {
                        if (resolve) {
                            var data = this.response;
                            if (this.responseType === '' || this.responseType === 'text') {
                                try {
                                    data = JSON.parse(this.responseText);
                                } catch (e) {
                                    console.log("RestClient: request(): end: info=responseText can't be parsed to JSON data, plain text will be passed in");
                                }
                            }
                            resolve({
                                status: this.status,
                                data: data
                            });
                        }
                    } else {
                        handleError({
                            status: this.status,
                            data: (this.responseType === '' || this.responseType === 'text') ? this.responseText : "Couldn't download non-text resource"
                        });
                    }
                };
                xhr.onerror = function () {
                    handleError({
                        status: 0,
                        data: 'Request failed, invalid url or no connection'
                    });
                };

                var setHeaders = function () {
                    for (var key in headers) {
                        console.log("RestClient: request(): setting header: " + key + "=" + headers[key]);
                        xhr.setRequestHeader(key, headers[key]);
                    }
                };

                console.log("RestClient: request(): begin: " + url + " " + method);

                xhr.open(method, url, true);
                setHeaders();

                if (responseType) {
                    xhr.responseType = responseType;
                }

                if (method === http.POST || method === http.PUT) {
                    xhr.send(body);
                } else {
                    xhr.send();
                }
            };

            var handleError = function (error) {
                refreshTokenRetries = 0;
                // Retries:
                // 1.retry 2 times
                // 2.still fails, then retry in 10 minutes
                // 3.still fails, schedule next scan

                retries++;

                if (retries < maxRetries) {
                    console.log("RestClient: request(): failed, retrying for the " +
                        (retries === 1 ? "first time" : "second time"));
                    doRequest();

                } else if (retries === maxRetries) {
                    console.log("RestClient: request(): failed, canceled");
                } else {
                    console.log("RestClient: request(): failed, all retries failed, fall back to normal schedule");
                    if (reject) {
                        reject(error);
                    }
                }
            };

            doRequest();
        });
    };

    return {
        get: function (url, headers, maxRetryTime) {
            return request(http.GET, url, headers, null, null, maxRetryTime);
        },

        post: function (url, headers, data, maxRetryTime) {
            return request(http.POST, url, headers, data, null, maxRetryTime);
        },

        put: function (url, headers, data, maxRetryTime) {
            return request(http.PUT, url, headers, data, null, maxRetryTime);
        },

        delete: function (url, headers, maxRetryTime) {
            return request(http.DELETE, url, headers, null, null, maxRetryTime);
        }
    };
}();

Object.seal(RestClient);