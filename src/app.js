
import express from "express";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";

import dotenv from "dotenv";
import path from "path";
import expressEjsLayouts from "express-ejs-layouts";
import middleware from "./middleware.js";
import session from "express-session";
import { get } from "http";

dotenv.config();
const __dirname = new URL(".", import.meta.url).pathname;
const publicPath = path.join(__dirname, 'public');
const app = express();
const port = 8000;
const db = new sqlite3.Database(':memory:');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static('public'));
app.use(expressEjsLayouts);
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(
  session({
    secret: "seesion-secret",
    resave: false,
    saveUninitialized: false,
  })
);
// set the axios
import axios from 'axios';

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/", async (req, res) => {
  res.render("home", {
    title: "home",
    session: req.session,
  });
});

app.get("/home", async (req, res) => {
  res.render("home", {
    title: "home",
    session: req.session,
  });
});

app.get("/filename", async (req, res) => {
  res.render("filename", {
    title: "filename",
    session: req.session,
  });
});

app.get("/start", async (req, res) => {
  res.render("start", {
    title: "start",
    session: req.session,
  });
});

app.get("/resultpage", async (req, res) => {
  res.render("resultpage", {
    title: "resultpage",
    session: req.session,
  });
});

app.get("/alldata", async (req, res) => {
  res.render("alldata", {
    title: "alldata",
    session: req.session,
  });
});

// app.get("/open/:id", (req, res) => {
//   const id = req.params.id;

//   // Make the API call to retrieve file data
//   axios
//     .get(`http://192.168.1.101:8000/open/${id}`)
//     .then(response => {
//       const fileData = response.data;

//       // Render the "open" view and pass the file data as variables
//       res.render("open", {
//         title: "Open File",
//         fileId: id,
//         fileContent: fileData.data,
//         fileContent50: fileData.data50,
//         fileContent150: fileData.data150,
//         session:req.session,
//       });
//     })
//     .catch(error => {
//       console.error("Error:", error);
//       // Handle the error and render an appropriate error view
//       res.render("error", {
//         title: "Error",
//         message: "Failed to retrieve file data"
//       });
//     });
// });

// app.get("/open/:id", (req, res) => {
//   const id = req.params.id;

//   // Call the appropriate function to retrieve file data
//   const fileData = getFileData(id);

//   if (fileData) {
//     // Render the "open" view and pass the file data as variables
//     res.render("open", {
//       title: "Open File",
//       fileId: id,
//       fileContent: fileData.data,
//       fileContent50: fileData.data50,
//       fileContent150: fileData.data150,
//       session: req.session,
//     });
//   } else {
//     // Handle the error and render an appropriate error view
//     res.render("error", {
//       title: "Error",
//       message: "Failed to retrieve file data",
//     });
//   }
// });




// app.get('/open/:id', (req, res) => {
//   const id = req.params.id;
//   res.render('open', {
//     title: 'open',
//     session: req.session,
//     id: id
//   });
// });

// app.get("/open/:id", (req, res) => {
//   res.render("open", {
//     title: "open",
//     session: req.session,
//   });
// });

app.get("/open/:id", (req, res) => {
  const id = req.params.id;

  axios
    .get(`http://192.168.1.101:8000/open/${id}`)
    .then(response => {
      const fileData = response.data;

      res.render("open", {
        title: "Playback Data",
        fileId: id,
        fileContent: fileData.data,
        fileContent50: fileData.data50,
        fileContent150: fileData.data150,
        fileName: fileData.name,
        fileTimestamp: fileData.timestamp,
        diffValuesIndices: fileData.diff_values_indices,
      });
    })
    .catch(error => {
      console.error("Error:", error);
      res.render("error", {
        title: "Error",
        message: "Failed to retrieve file data"
      });
    });
});


app.get("/alldata", async (req, res) => {
  res.render("alldata", {
    title: "alldata",
    session: req.session,
  });
});

app.get("/remove", async (req, res) => {
  res.render("remove", {
    title: "Remove File",
    session:req.session,
  });
});

app.get('/remove/:id', async (req, res) => {
  const id = req.params.id;
  axios
    .get(`http://192.168.1.105:8000/remove/${id}`)
    .then(response => {
      const fileData = response.data;

      // Render the "open" view and pass the file data as variables
    });  
});


app.get('/searchdata', (req, res) => {
  res.render('searchdata', {
    title: 'searchdata',
    session: req.session
  });
});


const nums = [1, 2, 3, 4, 5];
let start = true;
app.get('/getdata', (req, res) => {
  if (!start) {
    res.status(400).json({ message: "Can't get data" });
  } else {
    const responseData = {
      data: nums,
      detected: 'not detect'
    };
    res.render('getdata', {
      title: 'getdata',
      session: req.session,
      responseData
    });
  }
});

app.get("/graphresult", async (req, res) => {
  res.render("graphresult", {
    title: "graphresult",
    session: req.session,
  });
});

app.get("/navbar", async (req, res) => {
  res.render("navbar", {
    title: "navbar",
    session: req.session,
  });
});

app.get("/print", async (req, res) => {
  res.render("print", {
    title: "print",
    session: req.session,
  });
});

app.get("/index", async (req, res) => {
  res.render("index", {
    title: "index",
    session: req.session,
  });
});

app.get("/graph", async (req, res) => {
  res.render("graph", {
    title: "graph",
    session: req.session,
  });
});


db.on('error', (err) => {
  console.error('Error connecting to SQLite database:', err);
});

// Create a database schema and initialize tables (if needed)
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS mytable (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)'); // Replace 'mytable' with your desired table name
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});