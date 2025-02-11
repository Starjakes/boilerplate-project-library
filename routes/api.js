'use strict';

const mongoose = require('mongoose');

mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: { type: [String], default: [] }
});

const Book = mongoose.model('Book', bookSchema);

// Helper function to check valid ObjectID
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res) {
      const books = await Book.find({}, 'title _id comments');
      res.json(books.map(book => ({
        _id: book._id,
        title: book.title,
        commentcount: book.comments.length
      })));
    })

    .post(async function (req, res) {
      const { title } = req.body;
      if (!title) return res.send('missing required field title');
      const newBook = new Book({ title });
      await newBook.save();
      res.json({ _id: newBook._id, title: newBook.title });
    })

    .delete(async function (req, res) {
      await Book.deleteMany({});
      res.send('complete delete successful');
    });

  app.route('/api/books/:id')
    .get(async function (req, res) {
      const bookId = req.params.id;
      if (!isValidObjectId(bookId)) return res.send('no book exists'); // Changed to match test

      const book = await Book.findById(bookId);
      if (!book) return res.send('no book exists');
      res.json({ _id: book._id, title: book.title, comments: book.comments });
    })

    .post(async function (req, res) {
      const bookId = req.params.id;
      if (!isValidObjectId(bookId)) return res.send('no book exists'); // Changed to match test

      const { comment } = req.body;
      if (!comment) return res.send('missing required field comment');

      const book = await Book.findById(bookId);
      if (!book) return res.send('no book exists');

      book.comments.push(comment);
      await book.save();
      res.json({ _id: book._id, title: book.title, comments: book.comments });
    })

    .delete(async function (req, res) {
      const bookId = req.params.id;
      if (!isValidObjectId(bookId)) return res.send('no book exists'); // Changed to match test

      const book = await Book.findByIdAndDelete(bookId);
      if (!book) return res.send('no book exists');

      res.send('delete successful');
    });
};
