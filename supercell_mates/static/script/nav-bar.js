// request tag link
(() => {
    const requestTagLink = document.querySelector("#request-tag-link");
    if (requestTagLink !== null) {
        requestTagLink.addEventListener("click", () => {
            document.querySelector("#add_tag").style.display = "block";
        });
    }
})();

// highlighting the correct div
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
    // tooltip
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

    // message count badge
    if (document.querySelector("#nav-message") !== null) {
        fetch('/notification/chats_new_messages')
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                response.json().then(counts => {
                    const total = counts.privates.length + counts.groups.length;
                    if (total > 0) {
                        document.querySelector("#message-count-badge").innerText = total;
                    }
                });
            });
    }
});