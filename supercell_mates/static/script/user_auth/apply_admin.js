document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#apply-admin-link").addEventListener('click', () => {
        fetch('/apply_admin', postRequestContent({}))
            .then(async response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                } else {
                    response.text().then(text => {
                        if (text === "ok") {
                            document.querySelector("#apply-admin-message-body").innerText = 'We have received your request.';
                        } else {
                            document.querySelector("#apply-admin-message-body").innerText = 'Press once can already!';
                        }
                        document.querySelector("#apply-admin-notif-button").click();
                    })
                }
            })
    })
})