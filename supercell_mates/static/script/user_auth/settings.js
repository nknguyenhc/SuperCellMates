document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#change-username-button").addEventListener('click', () => {
        popChangeUsernameWindow();
    });
    document.querySelector("#change-password-button").addEventListener('click', () => {
        popChangePasswordWindow();
    });
    document.querySelector("#change-name-button").addEventListener('click', () => {
        popChangeNameWindow();
    })
});