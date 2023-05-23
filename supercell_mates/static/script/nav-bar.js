const requestTagLink = document.querySelector("#request-tag-link");
if (requestTagLink !== null) {
    requestTagLink.addEventListener("click", () => {
        document.querySelector("#add_tag").style.display = "block";
    });
}