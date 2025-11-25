var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');

// =======================
//  PostgreSQL へ変更
// =======================
const { Pool } = require("pg");
require("dotenv").config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

db.connect()
  .then(() => console.log("Connected to PostgreSQL database."))
  .catch(err => console.error("PostgreSQL connection error:", err));


// =======================
//  テーブル作成
// =======================

async function createTables() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS classes(
        id SERIAL PRIMARY KEY,
        faculty TEXT,
        department TEXT,
        title TEXT,
        teacher TEXT,
        attendance TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS Lab (
        id SERIAL PRIMARY KEY,
        faculty TEXT,
        department TEXT,
        title TEXT,
        teacher TEXT,
        coretime TEXT,
        keyword TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS class_reviews (
        id SERIAL PRIMARY KEY,
        class_id INTEGER REFERENCES classes(id),
        difficulty REAL,
        satisfaction REAL,
        review_date TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS class_post (
        id SERIAL PRIMARY KEY,
        class_id INTEGER REFERENCES classes(id),
        type TEXT,
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS Lab_post (
        id SERIAL PRIMARY KEY,
        lab_id INTEGER REFERENCES Lab(id),
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log("PostgreSQL テーブル作成完了！");
  } catch (err) {
    console.error("テーブル作成エラー:", err);
  }
}

createTables();


// =======================
//  ルーティング
// =======================

var indexRouter = require('./routes/index')(db);
var usersRouter = require('./routes/users');
var classRouter = require('./routes/class')(db);
var classdetailRouter = require('./routes/classdetail')(db);
var LabRouter = require('./routes/Lab')(db);
var LabdetailRouter = require('./routes/Labdetail')(db);


var app = express();


// facultyData.json を読み込み
const facultyDataPath = path.join(__dirname, 'data', 'facultyData.json');
const facultyData = JSON.parse(fs.readFileSync(facultyDataPath, 'utf8'));

app.use((req, res, next) => {
  req.facultyData = facultyData;
  next();
});

app.get('/faculties', (req, res) => {
  res.json(facultyData);
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/class', classRouter);
app.use('/classdetail', classdetailRouter);
app.use('/Lab', LabRouter);
app.use('/Labdetail', LabdetailRouter);


// catch 404
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
