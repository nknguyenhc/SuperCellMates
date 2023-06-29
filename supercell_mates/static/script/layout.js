function postRequestContent(dict) {
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

    const formData = new FormData();
    for (key in dict) {
        if (Array.isArray(dict[key])) {
            for (let i = 0; i < dict[key].length; i++) {
                formData.append(key, dict[key][i]);
            }
        } else {
            formData.append(key, dict[key]);
        }
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

function formatNumber(num, numOfDigits) {
    const str = num.toString();
    if (numOfDigits >= str.length) {
        return '0'.repeat(numOfDigits - str.length) + str;
    } else {
        return str.slice(str.length - numOfDigits, str.length);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const editPages = document.querySelectorAll(".edit-page");
    editPages.forEach(editPage => editPage.addEventListener("click", event => {
        const window = editPage.querySelector(".edit-window");
        if (!window.contains(event.target) && editPage.contains(event.target)) {
            editPage.style.display = "none";
        }
    }));
})