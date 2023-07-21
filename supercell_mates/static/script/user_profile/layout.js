document.addEventListener("DOMContentLoaded", () => {
    if (location.pathname === '/user/friends') {
        document.querySelector("#friends-nav").classList.add('bg-body-tertiary');
    }
    if (location.pathname === '/user/friend_requests') {
        document.querySelector("#friend-requests-nav").classList.add('bg-body-tertiary');
    }
})