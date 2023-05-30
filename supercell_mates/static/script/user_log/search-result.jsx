function PlaceHolder() {
    return (
        <div id="search-box-placeholder" class='text-body-tertiary'>Type something and search ...</div>
    )
}


function renderSearchBoxPlaceholder() {
    const box = document.querySelector("#search-result-box");
    const wrapper = document.createElement('div');
    ReactDOM.render(<PlaceHolder />, wrapper);
    box.appendChild(wrapper);
    wrapper.style.width = 'fit-content';
    box.style = `
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    `;
}


function removeSearchBox() {
    const box = document.querySelector('#search-result-box');
    box.removeChild(box.children[0]);
}