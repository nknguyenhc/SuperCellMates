const requestTagLink = document.querySelector("#request-tag-link");
if (requestTagLink !== null) {
    requestTagLink.addEventListener("click", () => {
        document.querySelector("#add_tag").style.display = "block";
    });
}

(() => {
    if (window.location.pathname === '/') {
        document.querySelector("#nav-home").classList.add('bg-info');
    } else if (window.location.pathname.startsWith('/profile') || location.pathname === '/user/friends' || location.pathname === '/user/friend_requests') {
        document.querySelector("#nav-profile").classList.add('bg-info');
    } else if (window.location.pathname.startsWith('/messages')) {
        document.querySelector("#nav-message").classList.add('bg-info');
    } else if (window.location.pathname.startsWith('/manage_page')) {
        document.querySelector("#nav-admin").classList.add('bg-info');
    } else if (window.location.pathname.startsWith('/settings')) {
        document.querySelector("#nav-settings").classList.add('bg-info');
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector("#nav-home") !== null) {
        new bootstrap.Tooltip(document.querySelector("#nav-home"));
        new bootstrap.Tooltip(document.querySelector("#nav-profile"));
        new bootstrap.Tooltip(document.querySelector("#nav-request-tag"));
        new bootstrap.Tooltip(document.querySelector("#nav-message"));
        new bootstrap.Tooltip(document.querySelector("#nav-settings"));
        if (document.querySelector("#nav-admin")) {
            new bootstrap.Tooltip(document.querySelector("#nav-admin"));
        }
    }
});