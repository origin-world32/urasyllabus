module.exports = function(db) {
  var express = require('express');
  var router = express.Router();

  // ===== 授業詳細ページ =====
  router.get('/:id', (req, res) => {
    const classId = Number(req.params.id);

    db.get(`SELECT * FROM classes WHERE id = ?`, [classId], (err, classInfo) => {
      if (err) return res.status(500).send("DBエラー");
      if (!classInfo) return res.status(404).send("授業が見つかりません");

      // レビュー取得
      db.all(`SELECT * FROM class_reviews WHERE class_id = ?`, [classId], (err, reviews) => {
        if (err) return res.status(500).send("レビュー読み込みエラー");

        const reviewCount = reviews.length;
        let avgDifficulty = 0;
        let avgSatisfaction = 0;

        if (reviewCount > 0) {
          avgDifficulty =
            reviews.reduce((s, r) => s + r.difficulty, 0) / reviewCount;
          avgSatisfaction =
            reviews.reduce((s, r) => s + r.satisfaction, 0) / reviewCount;
        }

        // 掲示板読み込み
        db.all(
          `SELECT * FROM class_post WHERE class_id = ? ORDER BY created_at DESC`,
          [classId],
          (err, posts) => {
            if (err) return res.status(500).send("掲示板読み込みエラー");

            const classPosts = posts
              .filter(p => p.type === 'class')
              .map(p => ({
                ...p,
                created_at: p.created_at.replace(" ", "T")
              }));

            const examPosts = posts
              .filter(p => p.type === 'exam')
              .map(p => ({
                ...p,
                created_at: p.created_at.replace(" ", "T")
              }));


            res.render('classdetail', {
              page: 'classdetail',
              classInfo: {
                ...classInfo,
                avgDifficulty,
                avgSatisfaction,
                reviewCount
              },
              posts: {
                classPosts,
                examPosts
              }
            });
          }
        );
      });
    });
  });

  // ===== レビュー投稿 =====
  router.post('/:id/review', (req, res) => {
    const classId = Number(req.params.id);
    const { difficulty, satisfaction } = req.body;

    db.run(
      `INSERT INTO class_reviews (class_id, difficulty, satisfaction, review_date)
       VALUES (?, ?, ?, datetime('now'))`,
      [classId, difficulty, satisfaction],
      (err) => {
        if (err) return res.status(500).send("レビュー保存エラー");
        res.redirect(`/classdetail/${classId}`);
      }
    );
  });

  // ===== 掲示板投稿 =====
  router.post('/:id/post', (req, res) => {
    const classId = Number(req.params.id);
    const { message, type } = req.body;

    if (!message || message.trim() === "") {
      return res.redirect(`/classdetail/${classId}?tab=${type}`);
    }

    db.run(
      `INSERT INTO class_post (class_id, type, message, created_at)
      VALUES (?, ?, ?, datetime('now'))`,
      [classId, type, message],
      (err) => {
        if (err) return res.status(500).send("掲示板投稿エラー");
        // 投稿後も元のタブを開く
        res.redirect(`/classdetail/${classId}?tab=${type}`);
      }
    );
  });

  return router;
};
