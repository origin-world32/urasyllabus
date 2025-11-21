var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');

//SQLiteの定義
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) console.error(err);
  else console.log('Connected to SQLite database.');
});

// 授業テーブル
db.run(`
  CREATE TABLE IF NOT EXISTS classes(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty TEXT,
    department TEXT,
    title TEXT,
    teacher TEXT,
    attendance TEXT,
    description TEXT,
    created_at TEXT
  )
`);

// 研究室テーブル
db.run(`
  CREATE TABLE IF NOT EXISTS Lab (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty TEXT,
    department TEXT,
    title TEXT,
    teacher TEXT,
    coretime TEXT,
    keyword TEXT,
    description TEXT,
    created_at TEXT
  )
`);

// 授業レビュー
db.run(`
  CREATE TABLE IF NOT EXISTS class_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER,
    difficulty REAL,
    satisfaction REAL,
    review_date TEXT,
    FOREIGN KEY(class_id) REFERENCES classes(id)
  )
`);

// 授業掲示板投稿（授業用 or 過去問用を type で区別）
db.run(`
  CREATE TABLE IF NOT EXISTS class_post (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER,
    type TEXT,            -- 'class' または 'exam'
    message TEXT,
    created_at TEXT,
    FOREIGN KEY(class_id) REFERENCES classes(id)
  )
`);



// 研究室掲示板投稿
db.run(`
  CREATE TABLE IF NOT EXISTS Lab_post (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lab_id INTEGER,
    message TEXT,
    created_at TEXT,
    FOREIGN KEY(lab_id) REFERENCES Lab(id)
  )
`);

console.log("SQLite テーブルの作成が完了しました");
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
  if (err) console.error(err);
  else console.log("テーブル一覧:", rows);
});


var indexRouter = require('./routes/index')(db); // indexルーティング
var usersRouter = require('./routes/users'); // userルーティング → いずれログイン機能を作るかもしれないその時用
var classRouter = require('./routes/class')(db);  // infoルーティング
var classdetailRouter = require('./routes/classdetail')(db); // classルーティング
var LabRouter = require('./routes/Lab')(db); //Labルーティング
var LabdetailRouter = require('./routes/Labdetail')(db); //Labdetailルーティング

var app = express();


// facultyData.jsonを読み込む
const facultyDataPath = path.join(__dirname, 'data', 'facultyData.json');
const facultyData = JSON.parse(fs.readFileSync(facultyDataPath, 'utf8'));

// facultyDataを全ルータで使えるように設定
app.use((req, res, next) => {
  req.facultyData = facultyData;
  next();
});
// facultyデータをJSONとして返すルート
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


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
