function getCSRF() {
    const csrftoken = "csrftoken";
    const cookies = document.cookie.split("; ")
    for (i in cookies) {
        if (cookies[i].slice(0, csrftoken.length) === csrftoken) {
            return cookies[i].slice(csrftoken.length + 1);
        }
    }
    return '';
}

function postRequestContent(dict) {
    const formData = new FormData();
    for (key in dict) {
        formData.append(key, dict[key]);
    }
    return {
        method: "POST",
        headers: {
            "X-CSRFToken": getCSRF()
        },
        body: formData
    }
}

function triggerErrorMessage() {
    alert("An error has occurred, please try again later.");
}