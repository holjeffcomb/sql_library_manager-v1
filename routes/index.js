var express = require('express');
var router = express.Router();
var Book = require('../models').Book;
var asyncHandler = require('express-async-handler');

/* GET home page. */
router.get('/', asyncHandler(async (req, res) => {
  res.redirect('/books');
}));

router.get('/books', asyncHandler(async(req, res) => {
  const books = await Book.findAll();
  res.render('index', { books });
}));

router.get('/books/new', (req, res) => {
  console.log('test');
  res.render('new-book');
});

router.post('/books/new', asyncHandler(async(req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect('/books/' + book.id);
  } catch (error) {
    if(error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      res.render('/books/new', { book, errors: error.errors, title: "New Book" });
    }
  }
}));

router.get('/books/:id', asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render('update-book', { book });
  } else {
    res.sendStatus(404);
  }
}));

router.post('/books/:id', asyncHandler(async(req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect('/books');
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render('update-book', { book, errors: error.errors })
    } else {
      throw error;
    }
  }
}));

router.post('/books/:id/delete', asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect('/books');
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;
