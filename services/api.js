const lambda_get = (url, headers = {}) => {
    return fetch(`/api${url}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...headers
        }
    })
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