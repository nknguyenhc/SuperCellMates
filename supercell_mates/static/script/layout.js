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

function isAlphaNumeric(str) {
    return /^[A-Za-z0-9]*$/.test(str);
}

function getJSONItemFrom(key, defaultValue, storage) {
    if (storage.getItem(key)) {
        try {
            return JSON.parse(storage.getItem(key));
        } catch {
            return defaultValue;
        }
    } else {
        return defaultValue;
    }
}

function getStringFrom(key, defaultValue, storage) {
    return storage.getItem(key) ? storage.getItem(key) : defaultValue;
}

const bottomMessageManager = {
    currTimeout: null,
    popMessage: (message) => {
        function backToOriginal() {
            messageDiv.classList.remove('bottom-popup-transition');
            messageDiv.classList.remove('bottom-popup-in');
        }

        const messageDiv = document.querySelector("#bottom-popup");
        messageDiv.innerText = message;
        backToOriginal();
        clearTimeout(this.currTimeout);
        setTimeout(() => {
            messageDiv.classList.add('bottom-popup-transition');
            messageDiv.classList.add('bottom-popup-in');
            this.currTimeout = setTimeout(() => {
                backToOriginal();
            }, 5000);
        }, 50);
    }
}

function displayLoader() {
    document.querySelector("#loader").style.cssText = `
        z-index: 100000;
        background: rgba(0, 0, 0, 0.2);
    `;
    document.querySelector("#loader .loading-icon").style.display = 'block';
}

function hideLoader() {
    document.querySelector("#loader").style.cssText = '';
    document.querySelector("#loader .loading-icon").style.display = '';
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