module.exports = function (db) {
  const express = require("express");
  const router = express.Router();

  // ===== 授業詳細ページ =====
  router.get("/:id", async (req, res) => {
    const classId = Number(req.params.id);

    try {
      // 授業情報取得
      const classRes = await db.query(
        `SELECT * FROM classes WHERE id = $1`,
        [classId]
      );

      const classInfo = classRes.rows[0];

      if (!classInfo) return res.status(404).send("授業が見つかりません");

      // レビュー取得
      const reviewRes = await db.query(
        `SELECT * FROM class_reviews WHERE class_id = $1`,
        [classId]
      );

      const reviews = reviewRes.rows;

      const reviewCount = reviews.length;
      let avgDifficulty = 0;
      let avgSatisfaction = 0;

      if (reviewCount > 0) {
        avgDifficulty =
          reviews.reduce((s, r) => s + Number(r.difficulty), 0) /
          reviewCount;

        avgSatisfaction =
          reviews.reduce((s, r) => s + Number(r.satisfaction), 0) /
          reviewCount;
      }

      // 掲示板取得
      const postRes = await db.query(
        `SELECT * FROM class_post WHERE class_id = $1 ORDER BY created_at DESC`,
        [classId]
      );

      const posts = postRes.rows;

      const classPosts = posts.filter((p) => p.type === "class");
      const examPosts = posts.filter((p) => p.type === "exam");

      res.render("classdetail", {
        page: "classdetail",
        classInfo: {
          ...classInfo,
          avgDifficulty,
          avgSatisfaction,
          reviewCount,
        },
        posts: {
          classPosts,
          examPosts,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("DBエラー");
    }
  });

  // ===== レビュー投稿 =====
  router.post("/:id/review", async (req, res) => {
    const classId = Number(req.params.id);
    const { difficulty, satisfaction } = req.body;

    try {
      await db.query(
        `INSERT INTO class_reviews (class_id, difficulty, satisfaction, review_date)
         VALUES ($1, $2, $3, NOW())`,
        [classId, difficulty, satisfaction]
      );

      res.redirect(`/classdetail/${classId}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("レビュー保存エラー");
    }
  });

  // ===== 掲示板投稿 =====
  router.post("/:id/post", async (req, res) => {
    const classId = Number(req.params.id);
    const { message, type } = req.body;

    if (!message || message.trim() === "") {
      return res.redirect(`/classdetail/${classId}?tab=${type}`);
    }

    try {
      await db.query(
        `INSERT INTO class_post (class_id, type, message, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [classId, type, message]
      );

      res.redirect(`/classdetail/${classId}?tab=${type}`);
    } catch (err) {
      console.error(err);
      return res.status(500).send("掲示板投稿エラー");
    }
  });

  return router;
};
