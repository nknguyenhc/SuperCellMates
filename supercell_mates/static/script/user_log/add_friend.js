document.querySelector("#add_friend_form").addEventListener("submit", event => {
    event.preventDefault();
    fetch('/user/add_friend', postRequestContent({
        username: document.querySelector("#add_friend_username").value
    }))
        .then(response => response.text())
        .then(response => console.log(response));
})