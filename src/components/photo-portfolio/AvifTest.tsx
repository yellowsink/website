import {createResource} from "solid-js";

async function supportsAvif() {
	if (!this.createImageBitmap) return false;

	const avifData = `data:image/avif;base64,AAAAFGZ0eXBhdmlmAAAAAG1pZjEAAACgbWV0YQAAAAAAAAAOcGl0bQAAAAAAAQAAAB5pbG9jAAAAAEQAAAEAAQAAAAEAAAC8AAAAGwAAACNpaW5mAAAAAAABAAAAFWluZmUCAAAAAAEAAGF2MDEAAAAARWlwcnAAAAAoaXBjbwAAABRpc3BlAAAAAAAAAAQAAAAEAAAADGF2MUOBAAAAAAAAFWlwbWEAAAAAAAAAAQABAgECAAAAI21kYXQSAAoIP8R8hAQ0BUAyDWeeUy0JG+QAACANEkA=`;
	const blob = await fetch(avifData).then((r) => r.blob());

	return createImageBitmap(blob).then(() => true, () => false);
}

export default () => {
	const [doesSupportAvif] = createResource(supportsAvif);

	return <>
		{doesSupportAvif.loading || doesSupportAvif() ? '' : <>
			Warning: your browser does not support the <a href="https://aomedia.org/specifications/avif/">AVIF</a> image format.
			Some images will be displayed in low quality due to this.
			If you are using Safari on macOS, try Chrome or Firefox.
		</>}
	</>
}