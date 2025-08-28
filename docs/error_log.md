# Error Log

This document tracks errors encountered during the development of EcoAlert and the solutions applied.

## 1. `npm run dev` fails with `package.json` not found

- **Error:** The command `npm run dev` failed because the `package.json` file was not in the root directory.
- **Solution:** The `package.json` file was located in the `EcoAlert-1` subdirectory. The command was successfully executed by specifying the correct working directory: `<execute_command><command>npm run dev</command><cwd>EcoAlert-1</cwd></execute_command>`.

## 2. Browser launch fails with "Not attached to an active page"

- **Error:** The `browser_action` tool failed with a "Protocol error (Page.captureScreenshot): Not attached to an active page" error. This has happened multiple times.
- **Solution:** The issue was caused by attempting to connect to the wrong port (`3000` instead of `9002`). The `package.json` file specifies `"dev": "next dev -p 9002"`. The correct URL is `http://localhost:9002`.