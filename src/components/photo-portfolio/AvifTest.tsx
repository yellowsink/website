import { createResource } from "solid-js";
import { decode } from "base32768";

async function supportsAvif() {
	if (!window.createImageBitmap) return false;

	const avifData = `ҠҧⲎ混ᒋ者牠ҠԖ肹沌㶦熓尅椬Ҡڴ䆙哬㙀ҠҠҠ䞨墖䋀ҠҠҠҡ蜲觔ҠҠҠҠҠҠҠҠұ䂛㐬噠ҠႱҠႠݠҠҠ㜀ҨҠҠҠҰҠҤ島燓㹀ҠҠݠҠᐭ㴦妈■ҠҡҠ㺝汦㙀Ҡԙ蜲髍ҠҠҠ㙀ң䟥蝄陠Ҡ㢚呬嵐Ҡԑ楌垣曰ݠҠҡ䅛搑謼觌扠ڀᇠҨҠҠ伲駐壠ҠҠҠҨҠҢҠҧ䉚啭㙀ҠҤ㙀Ҡ⨴艻劀ҠҠҠҢҡጠ曠蛠Ҡᄣ寱楈㡀ᛃ瑠ߊႭұ溬䙀Ҡ▜䨙鑵忂軠鹮挌驐`;
	const blob = new Blob([decode(avifData)], { type: "image/avif" });

	return createImageBitmap(blob).then(
		(b) => true,
		() => false,
	);
}

export default () => {
	const [doesSupportAvif] = createResource(supportsAvif);

	return (
		<>
			{doesSupportAvif.loading || doesSupportAvif() ? (
				""
			) : (
				<>
					Warning: your browser does not support the <a href="https://aomedia.org/specifications/avif/">AVIF</a>{" "}
					image format. Some images will be displayed in low quality due to this. If you are using Safari on macOS,
					try Chrome or Firefox.
				</>
			)}
		</>
	);
};
