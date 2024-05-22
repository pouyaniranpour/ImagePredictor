const fs = require('fs');
const PredictionApi = require("@azure/cognitiveservices-customvision-prediction");
const msRest = require("@azure/ms-rest-js");
require("dotenv").config();

const express = require("express");
const PORT = process.env.PORT;
const app = express();
const cors = require("cors");
const mysql = require('mysql2');



const predictionKey = process.env.VISION_PREDICTION_KEY;
//const predictionResourceId = process.env.VISION_PREDICTION_RESOURCE_ID;
const predictionEndpoint = process.env.VISION_PREDICTION_ENDPOINT;

const publishIterationName = "Iteration6";

const projectId = '05db217b-873f-4712-84ac-82491c6cf7a9';

const predictor_credentials = new msRest.ApiKeyCredentials({ inHeader: { "Prediction-key": predictionKey } });
const predictor = new PredictionApi.PredictionAPIClient(predictor_credentials, predictionEndpoint);

app.use(cors());

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD, // your password for root
  database: process.env.MYSQL_DATABASE, // database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.get ('/type', async (req, res) => {
    const testFile = fs.readFileSync(`./uploads/test.jpg`);

    const results = await predictor.classifyImage(projectId, publishIterationName, testFile);
    res.send({ type: results.predictions[0].tagName});

});

app.post("/uploadImage", uploadImage);
function uploadImage(req, res) {
    console.log(req.body);
}

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, 'test.jpg')
  }
})

const upload = multer({ storage: storage })

app.post('/upload', upload.single('file'), (req, res) => {
  const { body, file } = req;
  console.log({ body, file });
  res.send('Data received successfully');
});




// app.post("/uploadImage", function (req, res) {
//   const customerId = 1; //the field will be overwritten each time for this app
//   console.log(req.body);
//   //const image = req.body.name;

//   const sql = `REPLACE INTO cars (CustomerId, Image) VALUES (?, ?)`;
//   pool.query(sql, [customerId, image], (err, result) => {
//     if (err) {
//       //Handle the error
//       console.log("Database error: ", err);
//       return res.status(500).json({
//         errorMessage:
//           "An error occurred while fetching data from the database.",
//         error: err,
//       });
//     } else {
//       //Query was successful, send result
//       console.log("Successfully inserted into table")
//     }
//   });
// });




app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

