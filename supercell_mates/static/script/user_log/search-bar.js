document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.querySelector('#search-form');
    const searchField = document.querySelector("#search-input")
    const searchResultBox = document.querySelector("#search-result-box");
    if (searchForm !== null) {
        searchForm.addEventListener('submit', event => {
            event.preventDefault();
            searchUser();
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

        let currTimeout = null;
        let isSearching = false;
        searchField.addEventListener('input', () => {
            clearTimeout(currTimeout);
            currTimeout = setTimeout(() => {
                if (searchField === document.activeElement) {
                    searchUser();
                }
            }, 800);
        })

        function searchUser() {
            if (searchField.value !== '' && !isSearching) {
                isSearching = true;
                if (searchField.value[0] === '@') {
                    fetch('/user/search_username?username=' + searchField.value.slice(1))
                        .then(response => {
                            isSearching = false;
                            if (response.status !== 200) {
                                triggerErrorMessage();
                            } else {
                                response.json().then(response => displayResult(response.users))
                            }
                        });
                } else {
                    fetch('/user/search?username=' + searchField.value)
                        .then(response => {
                            isSearching = false;
                            if (response.status !== 200) {
                                triggerErrorMessage();
                            } else {
                                response.json().then(response => displayResult(response.users))
                            }
                        });
                }
            }
        }
    }
});