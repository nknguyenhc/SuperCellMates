type Dict = {
    [key: string]: any
}

export function postRequestContent(dict: Dict) {
    function getCSRF(): string {
        const csrftoken = "csrftoken";
        const cookies = document.cookie.split("; ")
        for (let i in cookies) {
            if (cookies[i].slice(0, csrftoken.length) === csrftoken) {
                return cookies[i].slice(csrftoken.length + 1);
            }
        }
        return '';
    }

    const formData = new FormData();
    for (let key in dict) {
        if (Array.isArray(dict[key])) {
            for (let i = 0; i < dict[key].length; i++) {
                formData.append(key, dict[key][i]);
            }
        } else {
            formData.append(key, dict[key]);
        }
    }

    return {
        method: "POST",
        headers: {
            "X-CSRFToken": getCSRF()
        },
        body: formData
    }
}