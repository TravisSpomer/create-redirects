"use strict"

const fsSync = require("fs")
const fs = fsSync.promises
const path = require("path")
const core = require("@actions/core")

const CreateRedirects = async () =>
{
	try
	{
		// Make sure everything's in order before getting started.

		const outputPath = core.getInput("output-path", { required: true })
		const configPath = core.getInput("routes", { required: true })
		let canonicalUrl = core.getInput("canonical-url", { required: true })
		if (canonicalUrl.endsWith("/"))
			canonicalUrl = canonicalUrl.substring(0, canonicalUrl.length - 1)

		const indexHtmlPath = path.join(outputPath, "index.html")
		if (!fsSync.existsSync(indexHtmlPath))
		{
			core.setFailed(`The file "${indexHtmlPath}" wasn't found. It should be set to the directory containing already-built static website files.`)
			return
		}

		if (!fsSync.existsSync(configPath))
		{
			core.setFailed(`The configuration file "${configPath}" was not found. Be sure to include the full path to the file, not just the folder that contains it.`)
			return
		}

		// Okay, let's crack open the config file and extract its succulent routes.

		const configJson = JSON.parse(await fs.readFile(configPath))

		for (const routeData of configJson.routes)
		{
			const route = routeData.route
			const target = routeData.redirect || routeData.serve
			if (!route || !target) continue
			const canonical = (new URL(target, canonicalUrl)).toString()
			const contents = `<meta http-equiv=refresh content="0;url=${encodeURI(target)}"><link rel=canonical href="${encodeURI(canonical)}">`
	
			// If the route doesn't have an extension, or it has a non-HTML extension, treat it as a folder containing index.html so that it gets the right content-type.
			let filename = path.join(outputPath, route)
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
