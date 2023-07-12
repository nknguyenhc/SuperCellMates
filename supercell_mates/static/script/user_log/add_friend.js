document.addEventListener("DOMContentLoaded", () => {
    let isLoading = false;
    document.querySelector("#add_friend_form").addEventListener("submit", event => {
        event.preventDefault();
        if (!isLoading) {
            isLoading = true;
            fetch('/user/add_friend_request', postRequestContent({
                username: document.querySelector("#add_friend_username").value
            }))
                .then(response => {
                    isLoading = false;
                    if (response.status !== 200) {
                        triggerErrorMessage();
                    } else {
                        document.querySelector("#friend_request_message_button").click();
                    }
                });
        }
    });
})