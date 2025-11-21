module.exports = function(db) {
  const express = require('express');
  const router = express.Router();

  // ===== 研究室一覧ページ =====
  router.get('/', (req, res) => {
    const { faculty, department, teacher, coretime, keyword } = req.query;

    db.all(`SELECT * FROM Lab`, [], (err, labData) => {
      if (err) return res.status(500).send("DB読み込みエラー");

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

      res.render('Lab', { page: 'Lab', results, faculty, department, teacher, keyword, coretime });
    });
  });

  // ===== 研究室追加 =====
  router.post('/add', (req, res) => {
    const { faculty, department, title, teacher, coretime, keyword, description } = req.body;

    const created_at = new Date().toISOString(); // ISO形式で保存

    db.run(
      `INSERT INTO Lab (faculty, department, title, teacher, coretime, keyword, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [faculty, department, title, teacher, coretime, keyword, description, created_at],
      function(err) {
        if (err) {
          console.error('追加エラー:', err);
          return res.status(500).json({ message: '研究室の追加中にエラーが発生しました。' });
        }

        // this.lastID に自動採番された ID が入る
        res.json({ message: '研究室を追加しました！', id: this.lastID });
      }
    );
  });

  return router;
};
