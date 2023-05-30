document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".friend-request").forEach(request => {
        const form = request.querySelector('.friend_request_form');
        form.addEventListener("submit", event => {
            event.preventDefault();
            const dict = {
                username: form.querySelector(".friend_username").value
            }
            if (event.submitter.value === "Approve") {
                dict["accepted"] = true;
            } else {
                dict["accepted"] = false;
            }
            fetch('/user/add_friend', postRequestContent(dict))
                .then(response => response.text())
                .then(response => {
                    if (dict["accepted"]) {
                        request.querySelector('.friend-accepted-mark').style.display = 'flex';
                    } else {
                        request.querySelector('.friend-rejected-mark').style.display = 'flex';
                    }
                    form.style.display = 'none';
                });
        });
    });
});