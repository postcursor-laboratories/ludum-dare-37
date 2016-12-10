export function resolveUrl(relativeUrl, baseUrl) {
    if (relativeUrl.startsWith("https://") || relativeUrl.startsWith("http://")) {
        return relativeUrl;
    }
    return (baseUrl + "/" + relativeUrl).replace(/\/{2,}/g, "");
}
