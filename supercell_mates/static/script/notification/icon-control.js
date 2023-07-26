document.addEventListener("DOMContentLoaded", () => {
    let isShow = false;
    const notificationCentre = document.querySelector("#notification-centre");
    const notificationIcon = document.querySelector("#nav-notification");
    document.querySelector("#nav-notification-link").addEventListener('click', () => {
        isShow = !isShow;
        notificationCentre.style.display = isShow ? '' : 'none';
        if (isShow) {
            notificationIcon.classList.add('bg-info');
        } else {
            notificationIcon.classList.remove('bg-info');
        }
    });
    document.addEventListener('click', event => {
        if (!notificationIcon.contains(event.target)) {
            isShow = false;
            notificationCentre.style.display = 'none';
            notificationIcon.classList.remove('bg-info');
        }
    });
})