document.addEventListener("DOMContentLoaded", () => {
    if (location.pathname === '/user/friends') {
        document.querySelector("#friends-nav").classList.add('bg-body-secondary');
    }
    if (location.pathname === '/user/friend_requests') {
        document.querySelector("#friend-requests-nav").classList.add('bg-body-secondary');
    }

    const matchingIndexIndicator = document.querySelector("#matching-index-indicator");
    if (matchingIndexIndicator) {
        const tooltipObject = new bootstrap.Tooltip(matchingIndexIndicator);
        let isShow = false;
        let isHovering = false;
        matchingIndexIndicator.addEventListener('mouseenter', () => {
            setTimeout(() => {
                if (!isShow) {
                    tooltipObject.show();
                    isShow = true;
                    setTimeout(() => {
                        const tooltip = document.querySelector(".tooltip");
                        tooltip.addEventListener('mouseenter', () => {
                            if (!isShow) {
                                tooltipObject.show();
                            }
                            isShow = true;
                            isHovering = true;
                        });
                        tooltip.addEventListener('mouseleave', () => {
                            if (isShow) {
                                tooltipObject.hide();
                            }
                            isShow = false;
                            isHovering = false;
                        })
                    }, 50);
                }
            }, 300);
        });
        matchingIndexIndicator.addEventListener('mouseleave', () => {
            setTimeout(() => {
                if (!isHovering && isShow) {
                    tooltipObject.hide();
                    isShow = false;
                }
            }, 300);
        })
    }
})