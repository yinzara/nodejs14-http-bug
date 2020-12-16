const { createServer } = require("http");
const { createReadStream, readFile, stat } = require("fs");
const { join } = require("path");

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const FILES_PATH = join(__dirname, "files");

function contentTypeForExtension(extension) {
    switch (extension) {
        case "json":
            return "application/json";
        case "js":
            return "text/javascript";
        case "css":
            return "text/css";
        case "html":
            return "text/html";
        case "eot":
            return "application/vnd.ms-fontobject";
        case "svg":
            return "image/svg+xml";
        case "png":
            return "image/png";
        case "woff":
        case "woff2":
            return "application/font-woff";
        default:
            return "application/octet-stream";
    }
}

/**
 * A simple HTTP file server that serves any files
 * located in the "files" folder with the correct content type
 * based on the extension
 */
createServer((request, response) => {
    if (request.url === "/" || request.url.startsWith("/?")) {
        response.writeHead(200, {
            "Content-Type": "text/html",
        });
        createReadStream(join(FILES_PATH, "index.html")).pipe(response);
    } else {
        const fileName = request.url.includes("?")
            ? request.url.slice(1, request.url.indexOf("?"))
            : request.url.slice(1);
        const filePath = join(FILES_PATH, fileName);
        stat(filePath, (error, stats) => {
            if (!error && stats.isFile()) {
                const contentType = contentTypeForExtension(
                    fileName.slice(fileName.lastIndexOf(".") + 1)
                );
                response.statusCode = 200;
                response.setHeader("Content-Type", contentType);
                response.setHeader("Content-Length", stats.size.toString(10));
                switch (contentType) {
                    case "application/octet-stream":
                    case "application/font-woff":
                    case "application/vnd.ms-fontobject":
                        createReadStream(filePath).pipe(response);
                        break;
                    default:
                        readFile(filePath, (error, data) => {
                            if (error) {
                                response.statusCode = 500;
                                response.end(error.message);
                            } else {
                                // response.end(data);
                                response.end(data.toString());
                            }
                        });
                }
            } else {
                response.statusCode =
                    error && error.code !== "ENOENT" ? 500 : 404;
                response.end(
                    error && error.code !== "ENOENT"
                        ? error.message
                        : "File not found!"
                );
            }
        });
    }
}).listen(PORT, () => {
    console.log(`started server at port ${PORT}`);
});
