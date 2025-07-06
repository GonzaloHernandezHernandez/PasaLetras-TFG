const { MongoClient, ObjectId } = require('mongodb')
const USER = 'ghernandezheinf'
const PASSWORD = 'EbonkA3FAoiL3FjR'
const DB_NAME = 'pasaletras'
const MONGO_URI_ATLAS = `mongodb+srv://ghernandezheinf:EbonkA3FAoiL3FjR@cluster0.fj3d1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

class MongoLib {
    async connect() {
        if (MongoLib.connection != null) {
            return MongoLib.connection.db(DB_NAME)
        } else {
            try {
                MongoLib.connection = await MongoClient.connect(MONGO_URI_ATLAS)
                console.log('conectado a la bdd')
                return MongoLib.connection.db(DB_NAME)
            } catch(e){
                console.log('error en conexión a la bdd')
                throw e
            }
        }
    }

  async getQuestions(collection) {
    try {
      const db = await this.connect();
      const result = await db.collection(collection).find().toArray();
      return result;
    } catch (error) {
      console.error("Question error:", error);
      throw new Error("Cannot get questions");
    }
  }

  async getQuestionById(collection, id) {
    try {
      const db = await this.connect();
      const result = await db
        .collection(collection)
        .findOne({ _id: new ObjectId(id) });
      return result;
    } catch (error) {
      console.error("Question error: ", error);
      throw new Error("Cannot find question with id ", id);
    }
  }

  async updateQuestion(collection, id, question) {
    try {
      const db = await this.connect();
      const result = await db
        .collection(collection)
        .updateOne({ _id: new ObjectId(id) }, { $set: question });
      return result;
    } catch (error) {
      console.error("Question error: ", error);
      throw new Error("Cannot update question with id ", id);
    }
  }

  async addQuestion(collection, question) {
    try {
      const db = await this.connect();
      const result = await db.collection(collection).insertOne(question);
      return result;
    } catch (error) {
      console.error("Question error: ", error);
      throw new Error("Cannot add question");
    }
  }

  async deleteQuestion(collection, id) {
    try {
      const db = await this.connect();
      const result = await db
        .collection(collection)
        .deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Question error: ", error);
      throw new Error("Cannot delete question with id ", id);
    }
  }

  async addQuestionsBulk(collection, preguntas) {
    try {
      const db = await this.connect();
      const result = await db.collection(collection).insertMany(preguntas);
      return result;
    } catch (error) {
      console.error("Question error: ", error);
      throw new Error("Cannot bulk insert questions");
    }
  }

  // Obtener categorías únicas (strings)
 async getDistinctCategories(collection) {
  try {
    const db = await this.connect();
    // Obtiene todas las categorías únicas de todas las preguntas
    const categories = await db.collection(collection).distinct('categories');
    
    // Normalizar las categorías (trim + lower case)
    const normalized = categories
      .filter(cat => typeof cat === 'string' && cat.trim())
      .map(cat => cat.trim().toLowerCase());

    // Eliminar duplicados que puedan quedar por normalización
    const uniqueCategories = [...new Set(normalized)].sort();

    return uniqueCategories;
  } catch (error) {
    console.error("Error getting distinct categories:", error);
    throw error;
  }
}

  async getQuestionsByCategory(collection, category) {
  try {
    const db = await this.connect();
    const result = await db.collection(collection)
      .find({ categories: category })
      .toArray();
    return result;
  } catch (error) {
    console.error("Error getting questions by category:", error);
    throw error;
  }
}

async getByQuery(collection, categories = []) {
  try {
    const db = await this.connect();

    const query = categories.length
      ? { categories: { $in: categories } }
      : {};

    const letters = await db.collection(collection).distinct('letter', query);

    const normalized = letters
      .filter(l => typeof l === 'string' && l.trim())
      .map(l => l.trim());

    const uniqueLetters = [...new Set(normalized)].sort();

    return uniqueLetters;
  } catch (error) {
    console.error("Error getting distinct letters by category:", error);
    throw error;
  }
}

async getAllByQuery(collection) {
  try {
    const db = await this.connect();

    // No filtro, consulta todas las letras
    const letters = await db.collection(collection).distinct('letter');

    const normalized = letters
      .filter(l => typeof l === 'string' && l.trim())
      .map(l => l.trim());

    const uniqueLetters = [...new Set(normalized)].sort();

    return uniqueLetters;
  } catch (error) {
    console.error("Error getting distinct letters:", error);
    throw error;
  }
}

}

module.exports = MongoLib;
