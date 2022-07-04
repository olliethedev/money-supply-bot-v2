import fetch from 'node-fetch';

export const getScreenshot = async (url: string) => {
    const fullUrl = `${ process.env.URL_TO_IMAGE_CONVERTER_API }/?url=${ encodeURIComponent(url) }`;
    console.log(fullUrl);
    const response = await fetch(fullUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
}