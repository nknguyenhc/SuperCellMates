document.querySelector("#add_friend_form").addEventListener("submit", event => {
    event.preventDefault();
    fetch('/user/add_friend_request', postRequestContent({
        username: document.querySelector("#add_friend_username").value
    }))
        .then(response => response.text())
        .then(response => {
            document.querySelector("#friend_request_message_button").click();
        });
})