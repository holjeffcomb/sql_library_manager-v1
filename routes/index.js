var express = require('express');
var router = express.Router();
var Book = require('../models').Book;
var asyncHandler = require('express-async-handler');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// redirect to homepage
router.get('/', asyncHandler(async (req, res) => {
  res.redirect('/books');
}));

// main homepage
router.get('/books', asyncHandler(async(req, res) => {
  const page = parseInt(req.query.page)
  !page || page <=0 ? res.redirect('?page=1') : null
  const limit = 10
  const {count, rows} = await Book.findAndCountAll({
    order: [['createdAt', 'DESC']],
    limit,
    offset: (page -1) *limit
  })
  const pageCount = Math.ceil(count / limit)
  page > pageCount ?
  res.redirect(`?page=${pageCount}`) : null
  let links = 1
  res.render('index', {books: rows, pageCount, links})
}));

// search handler
router.get('/books/search', asyncHandler(async(req,res) =>{
  const search = req.query.search.toLowerCase()
  const page = parseInt(req.query.page)
  !page || page <=0 ? res.redirect(`search?search=${search}&page=1`) : null
  const limit = 10
  const {count, rows} = await Book.findAndCountAll({
    where:{
      [Op.or]:[
        {
          title:{[Op.like]: `%${search}%`}
        },
        {
          author:{[Op.like]: `%${search}%`}
        },
        {
          genre:{[Op.like]: `%${search}%`}
        },
        {
          year:{[Op.like]: `%${search}%`}
        },
      ]
    },
    order: [['createdAt', 'DESC']],
    limit,
    offset: (page -1) *limit
  });
  if(count > 0){
    let links = 1
    const pageCount = Math.ceil(count / limit)
    page > pageCount ?
    res.redirect(`?search=${search}&page=${pageCount}`) : null
    res.render('index', {books: rows, pageCount, links, search})
  }else{
    res.render('book-not-found', {search})
  }
}))

// new book handler
router.get('/books/new', (req, res) => {
  res.render('new-book');
});

// new book post handler
router.post('/books/new', asyncHandler(async(req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect('/books/' + book.id);
  } catch (error) {
    if(error.name === "SequelizeValidationError") { // checking the error
      book = await Book.build(req.body);
      res.render("new-book", { book, errors: error.errors })
    } else {
      throw error
    }  
  }
}));

// get individual book handler
router.get('/books/:id', asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render('update-book', { book });
  } else {
    const err = new Error();
    err.status = 404;
    err.message = "Book Not Found";
    throw err
  }
}));

// update individual book handler
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

// delete book handler
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
