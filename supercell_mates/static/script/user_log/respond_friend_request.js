document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".friend_request_form").forEach(form => form.addEventListener("submit", event => {
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
            .then(response => console.log(response));
    })
)});