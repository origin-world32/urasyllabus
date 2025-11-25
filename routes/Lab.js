module.exports = function(db) {
  const express = require('express');
  const router = express.Router();

  // ===== 研究室一覧ページ =====
  router.get('/', async (req, res) => {
    const { faculty, department, teacher, coretime, keyword } = req.query;

    try {
      // Lab テーブル全件取得
      const result = await db.query(`SELECT * FROM Lab`);
      let labData = result.rows;

      let results = labData;

      // 絞り込み
      if (faculty) results = results.filter(l => l.faculty === faculty);
      if (department) results = results.filter(l => l.department === department);
      if (teacher) results = results.filter(l => l.teacher.includes(teacher));
      if (coretime) results = results.filter(l => l.coretime === coretime);
      if (keyword) {
        const kw = keyword.toLowerCase();
        results = results.filter(l =>
          (l.title && l.title.toLowerCase().includes(kw)) ||
          (l.keyword && l.keyword.toLowerCase().includes(kw))
        );
      }

      res.render('Lab', {
        page: 'Lab',
        results,
        faculty,
        department,
        teacher,
        keyword,
        coretime
      });

    } catch (err) {
      console.error("DB 読み込みエラー:", err);
      res.status(500).send("DB読み込みエラー");
    }
  });

  // ===== 研究室追加 =====
  router.post('/add', async (req, res) => {
    const {
      faculty,
      department,
      title,
      teacher,
      coretime,
      keyword,
      description
    } = req.body;

    const created_at = new Date().toISOString();

    try {
      const result = await db.query(
        `INSERT INTO Lab (faculty, department, title, teacher, coretime, keyword, description, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [faculty, department, title, teacher, coretime, keyword, description, created_at]
      );

      res.json({
        message: "研究室を追加しました！",
        id: result.rows[0].id
      });

    } catch (err) {
      console.error("追加エラー:", err);
      res.status(500).json({ message: "研究室の追加中にエラーが発生しました。" });
    }
  });

  return router;
};
