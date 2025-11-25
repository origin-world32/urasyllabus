var express = require('express');

module.exports = function(db) { 
  var router = express.Router();

  router.get('/', async function(req, res) {
    const facultyData = req.facultyData;

    try {
      const queries = {
        classReviews: 'SELECT COUNT(*) AS count FROM class_reviews',
        classPost: 'SELECT COUNT(*) AS count FROM class_post',
        lab: 'SELECT COUNT(*) AS count FROM Lab',
        labPost: 'SELECT COUNT(*) AS count FROM Lab_post'
      };

      const counts = {};

      // Promise でまとめて同時に処理
      const results = await Promise.all(
        Object.keys(queries).map(key =>
          db.query(queries[key]).then(r => ({
            key,
            count: Number(r.rows[0].count)
          }))
        )
      );

      // 結果を counts に格納
      results.forEach(r => {
        counts[r.key] = r.count;
      });

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

    } catch (err) {
      console.error(err);
      res.status(500).send("DBエラー");
    }
  });

  // 利用規約
  router.get('/terms', (req, res) => {
    res.render('terms');
  });

  // プライバシーポリシー
  router.get('/privacy', (req, res) => {
    res.render('privacy');
  });

  return router;
};
