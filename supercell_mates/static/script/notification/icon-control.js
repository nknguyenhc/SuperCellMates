document.addEventListener("DOMContentLoaded", () => {
    let isShow = false;
    document.querySelector("#notification-centre").style.display = 'none';
    document.querySelector("#nav-notification-link").addEventListener('click', () => {
        isShow = !isShow;
        document.querySelector("#notification-centre").style.display = isShow ? '' : 'none';
        if (isShow) {
            document.querySelector("#nav-notification").classList.add('bg-info');
        } else {
            document.querySelector("#nav-notification").classList.remove('bg-info');
        }
        renderNotificationCentre();
    })
})