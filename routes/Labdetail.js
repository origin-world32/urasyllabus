module.exports = function(db) {
  const express = require('express');
  const router = express.Router();

  // ===== 研究室詳細ページ =====
  router.get('/:id', async (req, res) => {
    const LabId = Number(req.params.id);

    try {
      // 研究室情報取得
      const labResult = await db.query(
        `SELECT * FROM Lab WHERE id = $1`,
        [LabId]
      );

      const LabInfo = labResult.rows[0];
      if (!LabInfo) return res.status(404).send("研究室が見つかりません");

      // 掲示板投稿取得
      const postResult = await db.query(
        `SELECT * FROM Lab_post WHERE lab_id = $1 ORDER BY created_at DESC`,
        [LabId]
      );

      const posts = postResult.rows;

      res.render('Labdetail', {
        page: 'Labdetail',
        LabInfo,
        posts
      });

    } catch (err) {
      console.error("DBエラー:", err);
      return res.status(500).send("DBエラー");
    }
  });

  // ===== 掲示板投稿 =====
  router.post('/:id/post', async (req, res) => {
    const LabId = Number(req.params.id);
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.redirect(`/Labdetail/${LabId}`);
    }

    try {
      await db.query(
        `INSERT INTO Lab_post (lab_id, message, created_at)
         VALUES ($1, $2, NOW())`,
        [LabId, message]
      );

      res.redirect(`/Labdetail/${LabId}`);

    } catch (err) {
      console.error("掲示板投稿エラー:", err);
      res.status(500).send("掲示板投稿エラー");
    }
  });

  return router;
};
