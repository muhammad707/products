const fs = require("fs");
const http = require("http");
const uuid = require("uuid");
const port = process.env.PORT || 3000;
const products = require("./data/data.json");
const {
  getAllProducts,
  getProductById,
  createProduct,
} = require("./contollers/productController");

const server = http.createServer(function (req, res) {
  if (req.url === "/products" && req.method === "GET") {
    getAllProducts(req, res);
  } else if (req.url.match(/\/products\/\w+/) && req.method === "GET") {
    const id = req.url.split("/")[2];
    getProductById(req, res, id);
  } else if (req.url === "/products" && req.method === "POST") {
    createProduct(req, res);
  } else if (req.url.match(/\/products\/\w+/) && req.method === "DELETE") {
    const id = req.url.split("/")[2];
    const product = products.find((product) => product.id === id);
    if (!product) {
      res.writeHead(404, { "Content-type": "text/json" });
      res.write(JSON.stringify({ message: "Product not found" }));
      res.end();
    } else {
      let newProducts = products.filter((product) => product.id !== id);
      fs.writeFile(
        "./data/data.json",
        JSON.stringify(newProducts),
        "utf8",
        function (err) {
          if (err) {
            console.log(err);
          } else {
            res.writeHead(200, { "Content-type": "text/json" });
            res.write(
              JSON.stringify({
                message: "Product has been deleted",
              })
            );
            res.end();
          }
        }
      );
    }
  } else if (req.url.match(/\/products\/\w+/) && req.method === "PUT") {
    const id = req.url.split("/")[2];
    const product = products.find((product) => product.id === id);
    if (!product) {
      res.writeHead(404, { "Content-type": "text/json" });
      res.write(JSON.stringify({ message: "Product not found" }));
      res.end();
    } else {
      const promise = new Promise((resolve, reject) => {
        let body = "";
        req.on("data", function (chunk) {
          body += chunk;
        });

        req.on("end", function () {
          resolve(body);
        });
        req.on("error", function (err) {
          console.log(err);
          reject("Error");
        });
      });

      promise
        .then((data) => {
          const { name, description, price } = JSON.parse(data);
          let updatedProduct = {
            name: name || product.name,
            description: description || product.description,
            price: price || product.price,
          };
          let index = products.findIndex((p) => p.id === id);
          products[index] = {
            id,
            ...updatedProduct,
          };
          fs.writeFile(
            "./data/data.json",
            JSON.stringify(products, null, 2),
            "utf8",
            function (err) {
              if (err) {
                console.log(err);
              } else {
                res.writeHead(200, { "Content-type": "text/json" });
                res.write(
                  JSON.stringify({
                    message: "Product has been updated",
                  })
                );
                res.end();
              }
            }
          );
        })
        .catch((error) => {
          res.writeHead(400, { "Content-type": "text/json" });
          res.write(
            JSON.stringify({
              message: "Bad request",
            })
          );
          res.end();
        });
    }
  } else {
    console.log("Invalid url");
  }
});
// CRUD => C - Create, R - Read, U - Update, D - Delete
server.listen(port, () => console.log("Server is running"));
