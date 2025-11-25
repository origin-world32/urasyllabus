const express = require('express');

module.exports = function(db) {
  const router = express.Router();

  /* 授業一覧取得 */
  router.get('/', async (req, res) => {
    const { faculty, department, teacher, difficulty, satisfaction } = req.query;

    try {
      const result = await db.query(`
        SELECT 
          c.*,
          COALESCE(AVG(r.difficulty), 0) AS "avgDifficulty",
          COALESCE(AVG(r.satisfaction), 0) AS "avgSatisfaction"
        FROM classes c
        LEFT JOIN class_reviews r ON c.id = r.class_id
        GROUP BY c.id
      `);

      const classes = result.rows;

      const results = classes.filter(c =>
        (!faculty || c.faculty === faculty) &&
        (!department || c.department === department) &&
        (!teacher || c.teacher.includes(teacher)) &&
        (!difficulty || Math.round(c.avgDifficulty) === Number(difficulty)) &&
        (!satisfaction || Math.round(c.avgSatisfaction) === Number(satisfaction))
      );

      res.render('class', { page: 'class', results, faculty, department });

    } catch (err) {
      console.error(err);
      res.status(500).send("DB Error");
    }
  });




  /* 授業追加処理 */
  router.post('/add', async (req, res) => {
    const { newClass, review } = req.body;

    if (!newClass.faculty || !newClass.department || !newClass.title || !newClass.teacher || 
        !newClass.attendance || !review.difficulty || !review.satisfaction) {
      return res.status(400).json({ message: "必須項目が入力されていません。" });
    }

    const createdAt = new Date().toISOString().split('T')[0];

    try {
      // classes に INSERT
      const result = await db.query(
        `INSERT INTO classes (faculty, department, title, teacher, attendance, description, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          newClass.faculty,
          newClass.department,
          newClass.title,
          newClass.teacher,
          newClass.attendance,
          newClass.description,
          createdAt
        ]
      );

      const classId = result.rows[0].id;

      // レビュー追加
      await db.query(
        `INSERT INTO class_reviews (class_id, difficulty, satisfaction, review_date)
         VALUES ($1, $2, $3, $4)`,
        [
          classId,
          review.difficulty,
          review.satisfaction,
          createdAt
        ]
      );

      res.json({ message: "授業を追加しました！" });

    } catch (err) {
      console.error("授業追加エラー:", err);
      res.status(500).json({ message: "授業の追加に失敗しました。" });
    }
  });

  return router;
};
