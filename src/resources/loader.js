import $ from "jquery";
import {resolveUrl} from "./url";

const BASE_URL = "${BASE_URL}";

export function loadResource(url) {
    const absUrl = resolveUrl(url, BASE_URL);
    return Promise.resolve($.get(absUrl));
}
