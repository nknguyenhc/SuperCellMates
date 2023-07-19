document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.querySelector('#search-form');
    const searchField = document.querySelector("#search-input")
    const searchResultBox = document.querySelector("#search-result-box");
    if (searchForm !== null) {
        searchForm.addEventListener('submit', event => {
            event.preventDefault();
            if (searchField.value !== '') {
                if (searchField.value[0] === '@') {
                    fetch('/user/search_username?username=' + searchField.value.slice(1))
                        .then(response => {
                            if (response.status !== 200) {
                                triggerErrorMessage();
                            } else {
                                response.json().then(response => displayResult(response.users))
                            }
                        });
                } else {
                    fetch('/user/search?username=' + searchField.value)
                        .then(response => {
                            if (response.status !== 200) {
                                triggerErrorMessage();
                            } else {
                                response.json().then(response => displayResult(response.users))
                            }
                        });
                }
            }
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