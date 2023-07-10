function PlaceHolder() {
    return (
        <div id="search-box-placeholder" class='text-body-tertiary'>Type and search for user ...</div>
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


function NoResult() {
    return (
        <div id="search-box-no-result" class="text-body-tertiary">No user match your search</div>
    )
}


function renderNoResult() {
    removeSearchBox();
    const box = document.querySelector("#search-result-box");
    const wrapper = document.createElement('div');
    ReactDOM.render(<NoResult />, wrapper);
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
    Array.from(box.children).forEach(child => box.removeChild(child));
}


function ResultListing(props) {
    return (
        <div className="search-result-listing">
            <div className="search-result-listing-left-side">
                <div className="search-result-listing-profile-pic">
                    <img src={props.profile_pic_url} />
                </div>
                <div className="search-result-listing-name">{props.name}</div>
            </div>
            <div className="search-result-listing-right-side">
                <div className="search-result-listing-username">
                    <a href={props.profile_link}>{props.username}</a>
                </div>
            </div>
        </div>
    );
}


function displayResult(listings) {
    if (listings.length === 0) {
        renderNoResult();
    } else {
        const box = document.querySelector('#search-result-box');
        removeSearchBox();
        listings.forEach(listing => {
            const wrapper = document.createElement('div');
            ReactDOM.render(<ResultListing name={listing.name} username={listing.username} profile_pic_url={listing.profile_pic_url} profile_link={listing.profile_link} />, wrapper);
            box.appendChild(wrapper);
        });
        box.style = `
            display: flex;
            flex-direction: column;
            gap: 2vh;
        `;
    }
}