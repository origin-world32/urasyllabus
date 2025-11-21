var express = require('express');

module.exports = function(db) { // dbを引数で受け取る
  var router = express.Router();

  router.get('/', function(req, res) {
    const facultyData = req.facultyData;

    const counts = {};

    const queries = [
      { key: 'classReviews', sql: 'SELECT COUNT(*) AS count FROM class_reviews' },
      { key: 'classPost', sql: 'SELECT COUNT(*) AS count FROM class_post' },
      { key: 'lab', sql: 'SELECT COUNT(*) AS count FROM Lab' },
      { key: 'labPost', sql: 'SELECT COUNT(*) AS count FROM Lab_post' }
    ];

    let done = 0;

    queries.forEach(q => {
      db.get(q.sql, (err, row) => {
        if (err) console.error(err);
        counts[q.key] = row.count;

        done++;

        // 全て完了したらレンダーする
        if (done === queries.length) {
          const totalReviews =
            counts.classReviews +
            counts.classPost +
            counts.lab +
            counts.labPost;

          res.render('index', {
            page: 'index',
            facultyData,
            totalReviews
          });
        }
      });
    });
  });

  // 利用規約
  router.get('/terms', (req, res) => {
    res.render('terms');
  });

  // プライバシーポリシー
  router.get('/privacy', (req, res) => {
    res.render('privacy');
  });

  return router; // ここでrouterを返す
};
