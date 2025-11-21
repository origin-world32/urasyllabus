const express = require('express');

module.exports = function(db) {
  const router = express.Router();

  /* 授業一覧取得 */
  router.get('/', (req, res) => {
    const { faculty, department, teacher, difficulty, satisfaction } = req.query;

    db.all(`
      SELECT c.*, 
             IFNULL(AVG(r.difficulty), 0) AS avgDifficulty,
             IFNULL(AVG(r.satisfaction), 0) AS avgSatisfaction
      FROM classes c
      LEFT JOIN class_reviews r ON c.id = r.class_id
      GROUP BY c.id
    `, (err, classes) => {
      if (err) return res.status(500).send("DB Error");

      const results = classes.filter(c =>
        (!faculty || c.faculty === faculty) &&
        (!department || c.department === department) &&
        (!teacher || c.teacher.includes(teacher)) &&
        (!difficulty || Math.round(c.avgDifficulty) === Number(difficulty)) &&
        (!satisfaction || Math.round(c.avgSatisfaction) === Number(satisfaction))
      );

      res.render('class', { page: 'class', results, faculty, department });
    });
  });





  /* 授業追加処理 */
  router.post('/add', (req, res) => {
    const {newClass, review} = req.body;

    if (!newClass.faculty || !newClass.department || !newClass.title || !newClass.teacher || !newClass.attendance || !review.difficulty || !review.satisfaction) {
      return res.status(400).json({ message: "必須項目が入力されていません。" });
    }

    const createdAt = new Date().toISOString().split('T')[0];

    db.run(
      `INSERT INTO classes (faculty, department, title, teacher, attendance, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newClass.faculty, newClass.department, newClass.title, newClass.teacher, newClass.attendance, newClass.description, createdAt],
      function(err) {
        if (err) {
          console.error("授業追加エラー:", err); // ←追加
          return res.status(500).json({ message: "授業の追加に失敗しました。" });}

        const classId = this.lastID;

        db.run(
          `INSERT INTO class_reviews (class_id, difficulty, satisfaction, review_date)
           VALUES (?, ?, ?, ?)`,
          [classId, review.difficulty, review.satisfaction, createdAt],
          function(err2) {
            if (err2) return res.status(500).json({ message: "レビューの追加に失敗しました。" });

            res.json({ message: "授業を追加しました！" });
          }
        );
      }
    );
  });

  return router;
};
