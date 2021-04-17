"use strict"

const fsSync = require("fs")
const fs = fsSync.promises
const path = require("path")
const core = require("@actions/core")
const exec = require("@actions/exec")

const toBoolean = (str) =>
{
	if (str === true || str === 1) return true
	const lower = typeof(str) === "string" ? str.toLowerCase() : ""
	if (lower === "true") return true
	if (!str || lower === "false") return false
	throw new Error(`Your whimsical input "${str}" couldn't be converted to a Boolean.`)
}

const CreateRedirects = async () =>
{
	try
	{
		// Make sure everything's in order before getting started.

		const outputPath = core.getInput("output-path", { required: true })
		const routesJsonPath = core.getInput("routes", { required: true })
		let canonicalUrl = core.getInput("canonical-url", { required: true })
		if (canonicalUrl.endsWith("/"))
			canonicalUrl = canonicalUrl.substring(0, canonicalUrl.length - 1)

		const indexHtmlPath = path.join(outputPath, "index.html")
		if (!fsSync.existsSync(indexHtmlPath))
		{
			core.setFailed(`The file "${indexHtmlPath}" wasn't found. It should be set to the directory containing already-built static website files.`)
			return
		}

		if (!fsSync.existsSync(routesJsonPath))
		{
			core.setFailed("The routes.json file was not found at the specified location.")
			return
		}

		// Okay, let's crack open routes.json and see what we need to do.

		const routesJson = JSON.parse(await fs.readFile(routesJsonPath))

		for (const routeData of routesJson.routes)
		{
			const canonical = (new URL(routeData.serve, canonicalUrl)).toString()
			const contents = `<meta http-equiv=refresh content="0;url=${encodeURI(routeData.serve)}"><link rel=canonical href="${encodeURI(canonical)}">`
	
			// If the route doesn't have an extension, or it has a non-HTML extension, treat it as a folder containing index.html so that it gets the right content-type.
			let filename = path.join(outputPath, routeData.route)
			const ext = path.extname(filename)
			if (ext !== ".html" && ext !== ".htm")
				filename = path.join(filename, "index.html")

			// Before saving the file, create its folder if necessary.
			const dir = path.dirname(filename)
			if (!fsSync.existsSync(dir))
				await fs.mkdir(dir, { recursive: true })
	
			await fs.writeFile(filename, contents)

			core.info(`  ${filename} => ${canonical}`)
		}

		core.info("")
		core.info("------------------------------------------------------------")
		core.info("Done.")
		core.info("------------------------------------------------------------")
	}
	catch (error)
	{
		core.setFailed(error.message)
	}
}

CreateRedirects()
