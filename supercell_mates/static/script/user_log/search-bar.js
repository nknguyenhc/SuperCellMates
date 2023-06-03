document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.querySelector('#search-form');
    const searchField = document.querySelector("#search-input")
    const searchResultBox = document.querySelector("#search-result-box");
    if (searchForm !== null) {
        searchForm.addEventListener('submit', event => {
            event.preventDefault();
            fetch('/user/search?username=' + searchField.value)
                .then(response => response.json())
                .then(response => displayResult(response.users))
                .catch(() => triggerErrorMessage());
        });
        searchField.addEventListener('focus', () => {
            if (searchResultBox.style.display === "none") {
                searchResultBox.style.display = "block";
                renderSearchBoxPlaceholder();
            }
        });
        document.addEventListener('click', event => {
            if (!searchForm.contains(event.target) && !searchResultBox.contains(event.target) && searchResultBox.style.display !== "none") {
                searchResultBox.style.display = "none";
                removeSearchBox();
            }
        });
    }
});