const lambda_get = async (url, headers = {}) => {
    const res = await fetch(`/api${url}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...headers
        }
    });

    let response = await res.json();

    if (res.status !== 200) {
        return [response.message];
    }

    return [null, response];
}

const lambda_post = (url, payload, headers = {}) => {
    return fetch(`/api${url}`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
            ...headers
        }
    })
}

export const lambda = {
    get: lambda_get,
    post: lambda_post
};