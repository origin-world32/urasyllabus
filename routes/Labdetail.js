module.exports = function(db) {
  const express = require('express');
  const router = express.Router();

  // ===== 研究室詳細ページ =====
  router.get('/:id', (req, res) => {
    const LabId = Number(req.params.id);

    // 研究室情報取得
    db.get(`SELECT * FROM Lab WHERE id = ?`, [LabId], (err, LabInfo) => {
      if (err) return res.status(500).send("DBエラー");
      if (!LabInfo) return res.status(404).send("研究室が見つかりません");

      // 掲示板投稿取得
      db.all(
        `SELECT * FROM Lab_post WHERE lab_id = ? ORDER BY created_at DESC`,
        [LabId],
        (err, posts) => {
          if (err) return res.status(500).send("掲示板読み込みエラー");

          res.render('Labdetail', {
            page: 'Labdetail',
            LabInfo,
            posts
          });
        }
      );
    });
  });

  // ===== 掲示板投稿 =====
  router.post('/:id/post', (req, res) => {
    const LabId = Number(req.params.id);
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.redirect(`/Labdetail/${LabId}`);
    }

    db.run(
      `INSERT INTO Lab_post (lab_id, message, created_at) VALUES (?, ?, datetime('now'))`,
      [LabId, message],
      (err) => {
        if (err) return res.status(500).send("掲示板投稿エラー");
        res.redirect(`/Labdetail/${LabId}`);
      }
    );
  });

  return router;
}
