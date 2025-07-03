const express = require("express");
const QuestionService = require("../services/questionService");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // guarda en memoria para procesar luego

function questionsApi(app) {
  const router = express.Router();
  app.use("/questions", router);

  const questionService = new QuestionService();

  router.get("/", async (req, res) => {
    try {
      const questions = await questionService.getQuestions();
      res.status(200).json({
        data: questions,
        message: "Question array got successfully",
      });
    } catch (err) {
      console.error({ error: err });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const question = await questionService.getQuestionById(id);

      if (!question) {
        return res.status(404).json({
          message: "Question with id " + id + " not found",
        });
      }

      res.status(200).json({
        data: question,
        message: "Question got successfully",
      });
    } catch (err) {
      console.error({ error: err });
      res.status(500).json({
        message: "Internal server error",
      });
    }
  });
  function parseToArray(input) {
    if (Array.isArray(input)) {
      return input;
    }

    if (typeof input === "string") {
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // No es JSON, lo tratamos como string separado por comas
        return input
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    return [input];
  }

  // POST: Crear pregunta
  router.post(
    "/",
    upload.fields([{ name: "image" }, { name: "audio" }]),
    async (req, res) => {
      try {
        const {
          question,
          letter,
          categories,
          correctAnswer,
          incorrectAnswers,
        } = req.body;

        if (!question || !letter || !correctAnswer) {
          return res
            .status(400)
            .json({ message: "Faltan campos obligatorios" });
        }

        const image = req.files?.image?.[0];
        const audio = req.files?.audio?.[0];

        const imageBase64 = image
          ? `data:${image.mimetype};base64,${image.buffer.toString("base64")}`
          : null;

        const audioBase64 = audio
          ? `data:${audio.mimetype};base64,${audio.buffer.toString("base64")}`
          : null;

        const newQuestion = {
          question,
          letter,
          categories: parseToArray(categories),
          correctAnswer,
          incorrectAnswers: parseToArray(incorrectAnswers),
          image: imageBase64,
          audio: audioBase64,
        };

        const result = await questionService.addQuestion(newQuestion);

        res.status(200).json({
          message: "Question added successfully",
          data: { ...newQuestion, _id: result.insertedId },
        });
      } catch (err) {
        console.error("POST / error:", err);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // PUT: Actualizar pregunta
  router.put(
    "/:id",
    upload.fields([{ name: "image" }, { name: "audio" }]),
    async (req, res) => {
      try {
        const { id } = req.params;
        const {
          question,
          letter,
          categories,
          correctAnswer,
          incorrectAnswers,
        } = req.body;

        const existing = await questionService.getQuestionById(id);
        if (!existing) {
          return res
            .status(404)
            .json({ message: `Question with id ${id} not found` });
        }

        const image = req.files?.image?.[0];
        const audio = req.files?.audio?.[0];

        const imageBase64 = image
          ? `data:${image.mimetype};base64,${image.buffer.toString("base64")}`
          : existing.image;

        const audioBase64 = audio
          ? `data:${audio.mimetype};base64,${audio.buffer.toString("base64")}`
          : existing.audio;

        const updated = {
          question,
          letter,
          categories: parseToArray(categories),
          correctAnswer,
          incorrectAnswers: parseToArray(incorrectAnswers),
          image: imageBase64,
          audio: audioBase64,
        };

        await questionService.updateQuestion(id, updated);

        res.status(200).json({
          message: "Question updated successfully",
          data: { ...updated, _id: id },
        });
      } catch (err) {
        console.error("PUT /:id error:", err);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // DELETE
  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const result = await questionService.deleteQuestion(id);

      if (result) {
        res.status(200).json({
          message: "Question deleted successfully",
        });
      } else {
        res.status(404).json({
          message: "Question not found",
        });
      }
    } catch (err) {
      console.error({ error: err });
      res.status(500).json({
        message: "Internal server error",
      });
    }
  });

  router.post("/bulk", async (req, res) => {
    try {
      const preguntas = req.body;

      if (!Array.isArray(preguntas)) {
        return res
          .status(400)
          .json({ message: "Se esperaba un array de preguntas" });
      }

      const preguntasLimpias = preguntas.map((p) => ({
        question: p.question,
        letter: p.letter,
        categories: p.categories || [],
        correctAnswer: p.correctAnswer,
        incorrectAnswers: Array.isArray(p.incorrectAnswers)
          ? p.incorrectAnswers
          : JSON.parse(p.incorrectAnswers || "[]"),
        image: p.image || null,
        audio: p.audio || null,
      }));

      const result = await questionService.addQuestionsBulk(preguntasLimpias);

      res.status(200).json({
        message: "Preguntas guardadas exitosamente",
        data: result,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al guardar preguntas" });
    }
  });

  router.get("/questions/categories", async (req, res) => {
    try {
      const categories = await questionService.getDistinctCategories(
        questionService.collection
      );
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener categorías" });
    }
  });

  // GET /api/categories-with-questions
  router.get("/questions/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const questions = await questionService.getQuestionsByCategory(category);
      res.json(questions);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error al obtener preguntas por categoría" });
    }
  });

  function parseToArrayLetter(input) {
  if (Array.isArray(input)) return input;
  if (typeof input === 'string') return input.split(',').map(c => c.trim()).filter(Boolean);
  return [];
}

 router.get('/questions/letters', async (req, res) => {
  try {
    const categories = parseToArrayLetter(req.query.categories); 
    const letters = await questionService.getUniqueLettersByCategories(categories);

    res.status(200).json(
      letters
      );
  } catch (err) {
    console.error('GET /letters error:', err);
    res.status(500).json({ message: 'Error al obtener letras únicas' });
  }
});

router.get('/questions/allletters', async (req, res) => {
  try {
    const letters = await questionService.getUniqueAllLetters();

    res.json(
       letters,
      );
  } catch (err) {
    console.error('GET /letters error:', err);
    res.status(500).json({ message: 'Error al obtener letras únicas' });
  }
});

}

module.exports = questionsApi;
