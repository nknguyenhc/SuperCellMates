function pop_setup_page(page_i) {
    const page_0 = document.querySelector("#setup_tags");
    const page_1 = document.querySelector("#setup_image");
    const pages = [page_0, page_1];
    for (let i = 0; i < pages.length; i++) {
        if (i === page_i) {
            pages[i].style.display = "block";
        } else {
            pages[i].style.display = "none";
        }
    }
}