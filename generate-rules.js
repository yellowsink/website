#!/usr/bin/env node
const fs = require("fs");
const fg = require("fast-glob");

//const index = fs.readFileSync("dist/index.html").toString();

let rules = fs.readFileSync("Caddyfile-rules").toString();

const addRule = (rule, route, as) =>
	rule && (rules += `header ${route ?? ""} +Link "<${rule}>; rel=preload${!as ? "" : `; as=${as}`}"\n`);

// read google fonts url and create preload
//addRule(
//	index.match(/href="(https:\/\/fonts\.googleapis\.com\/.*?)"/)?.[1]
//);

// for each page
const pages = fg.sync("dist/*/index.html").map((file) => {
	return [file, `/${file.match(/\/(.*)\//)[1]}*`];
});
pages.push(["dist/index.html", "/"]);

// find more preloads for specific paths
for (const [file, route] of pages) {
	const content = fs.readFileSync(file).toString();

	// find files of ours

	const files = new Set(
		[...content.matchAll(/"(\/[a-zA-Z0-9.-_]+?\.)(css|js)"/g)].filter((m) => m?.[1]).map((m) => [m[1] + m[2], m[2]]),
	);

	for (const [match, type] of files) addRule(`https://{host}${match}`, route, type === "css" ? "style" : "script");
}

// write rules
fs.writeFileSync("dist/Caddyfile-rules", rules);
