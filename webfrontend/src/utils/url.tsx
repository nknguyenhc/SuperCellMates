type Dict = {
    [key: string]: any
}

export const getURLParams = (): Dict => {
    if (window.location.search === '') {
        return {};
    }
    return window.location.search.slice(1)
        .split('&')
        .map((query: string): Dict => {
            const splitQuery = query.split('=')
                .map((elem: string) => decodeURI(elem));
            return {
                [splitQuery[0]]: splitQuery[1],
            };
        })
        .reduce((prev: Dict, curr: Dict) => ({
            ...prev,
            ...curr,
        }), {});
}