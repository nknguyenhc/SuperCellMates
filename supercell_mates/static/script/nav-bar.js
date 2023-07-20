const requestTagLink = document.querySelector("#request-tag-link");
if (requestTagLink !== null) {
    requestTagLink.addEventListener("click", () => {
        document.querySelector("#add_tag").style.display = "block";
    });
}

(() => {
    if (window.location.pathname === '/') {
        document.querySelector("#nav-home").classList.add('bg-info');
    } else if (window.location.pathname.startsWith('/profile')) {
        document.querySelector("#nav-profile").classList.add('bg-info');
    } else if (window.location.pathname.startsWith('/messages')) {
        document.querySelector("#nav-message").classList.add('bg-info');
    } else if (window.location.pathname.startsWith('/manage_page')) {
        document.querySelector("#nav-admin").classList.add('bg-info');
    } else if (window.location.pathname.startsWith('/settings')) {
        document.querySelector("#nav-settings").classList.add('bg-info');
    }
})();