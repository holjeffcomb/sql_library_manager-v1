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

module.exports = router;
