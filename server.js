const http = require("http");
const fs = require("fs");
const path = require("path");
const qs = require("querystring");

const server = http.createServer((req, res) => {
    let { method } = req;

    // Function to serve static files
    const serveStaticFile = (filePath, contentType) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error(`Error reading file ${filePath}:`, err);
                res.writeHead(404);
                res.end("File Not Found");
            } else {
                res.writeHead(200, { "Content-Type": contentType });
                res.end(data);
            }
        });
    };

    if (method === "GET") {
        if (req.url === "/") {
            fs.readFile("pets.json", "utf8", (err, data) => {
                if (err) {
                    console.error("Error reading file:", err);
                    res.writeHead(500);
                    res.end("Server Error");
                } else {
                    const pets = JSON.parse(data);
                    let html = `<html><head><title>Registered Pets</title></head><body><h1>Registered Pets</h1><ul>`;
                    pets.forEach(pet => {
                        html += `<li>Name: ${pet.name}, Breed: ${pet.breed}, Age: ${pet.age}, Owner: ${pet.owner}, Contact: ${pet.contact}</li>`;
                    });
                    html += `</ul></body></html>`;
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(html);
                }
            });
        } else if (req.url === "/allPets") {
            serveStaticFile(path.join(__dirname, "allPets.html"), "text/html");
        } else if (req.url === "/register") {
            serveStaticFile(path.join(__dirname, "registerPet.html"), "text/html");
        } else if (req.url === "/a.jpg") {
            serveStaticFile(path.join(__dirname, "a.jpg"), "image/jpeg");
        } else {
            const ext = path.extname(req.url);
            let contentType = "application/octet-stream";
            switch (ext) {
                case ".html": contentType = "text/html"; break;
                case ".js": contentType = "application/javascript"; break;
                case ".css": contentType = "text/css"; break;
                case ".jpg": contentType = "image/jpeg"; break;
                case ".png": contentType = "image/png"; break;
                case ".ico": contentType = "image/x-icon"; break;
            }
            serveStaticFile(path.join(__dirname, req.url), contentType);
        }
    } else if (method === "POST" && req.url === "/register") {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });
        req.on("end", () => {
            let readdata;
            try {
                readdata = fs.readFileSync("pets.json", "utf-8");
            } catch (err) {
                console.error("Error reading pets.json:", err);
                res.writeHead(500);
                res.end("Server Error");
                return;
            }

            let pets = [];
            if (readdata) {
                try {
                    pets = JSON.parse(readdata);
                } catch (err) {
                    console.error("Error parsing JSON:", err);
                    res.writeHead(500);
                    res.end("Error parsing data");
                    return;
                }
            }

            let convertedbody = qs.decode(body);
            pets.push(convertedbody);

            fs.writeFile("pets.json", JSON.stringify(pets), (err) => {
                if (err) {
                    console.error("Error writing to pets.json:", err);
                    res.writeHead(500);
                    res.end("Server Error");
                } else {
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end("Pet registered successfully! <a href='/'>View Registered Pets</a>");
                }
            });
        });
    } else {
        res.writeHead(404);
        res.end("Not Found");
    }
});

server.listen(3002, () => {
    console.log("Server listening on port 3002");
});
