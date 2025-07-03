const MongoLib = require("../lib/mongo");

class QuestionsService {
  constructor() {
    this.collection = "questions";
    this.mongoDB = new MongoLib();
  }

  async getQuestions() {
    return await this.mongoDB.getQuestions(this.collection);
  }

  async getQuestionById(id) {
    return await this.mongoDB.getQuestionById(this.collection, id);
  }

  async updateQuestion(id, question) {
    return await this.mongoDB.updateQuestion(this.collection, id, question);
  }

  async addQuestion(question) {
    return await this.mongoDB.addQuestion(this.collection, question);
  }

  async addQuestionsBulk(preguntas) {
    return await this.mongoDB.addQuestionsBulk(this.collection, preguntas);
  }

  async deleteQuestion(id) {
    return await this.mongoDB.deleteQuestion(this.collection, id);
  }
  
  async getDistinctCategories() {
  return await this.mongoDB.getDistinctCategories(this.collection);
}
async getQuestionsByCategory(category) {
  return await this.mongoDB.getQuestionsByCategory(this.collection, category);
}
  async getUniqueLettersByCategories(categories = []) {
  return await this.mongoDB.getByQuery(this.collection, categories);
}
async getUniqueAllLetters() {
  return await this.mongoDB.getAllByQuery(this.collection);
}

}

module.exports = QuestionsService;
