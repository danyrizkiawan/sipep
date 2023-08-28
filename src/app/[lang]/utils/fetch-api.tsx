import qs from "qs";
import { getStrapiURL } from "./api-helpers";
import { getLocalToken } from "./session";

export async function fetchAPI(
  path: string,
  urlParamsObject = {},
  options = {}
) {
  try {
    // Merge default and user options
    const mergedOptions = {
      next: { revalidate: 60 },
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    };

    // Build request URL
    const queryString = qs.stringify(urlParamsObject);
    const requestUrl = `${getStrapiURL(
      `/api${path}${queryString ? `?${queryString}` : ""}`
    )}`;

    // Trigger API call
    const response = await fetch(requestUrl, mergedOptions);
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error(error);
    throw new Error(`Please check if your server is running and you set all the required tokens.`);
  }
}

export async function fetchAuthenticatedAPI(
  path: string,
  urlParamsObject = {}
) {
  const token = getLocalToken();
  const options = { headers: { Authorization: `Bearer ${token}` } };
  return fetchAPI(path, urlParamsObject, options)
}

export async function sendPUTRequest(
  path: string,
  body: {},
) {
  try {
    const token = getLocalToken();
    const options = {
      next: { revalidate: 60 },
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };
    const requestUrl = `${getStrapiURL(`/api${path}`)}`;

    const response = await fetch(requestUrl, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(`Please check if your server is running and you set all the required tokens.`);
  }
}
