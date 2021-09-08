var express = require('express');
var router = express.Router();
var Book = require('../models').Book;
var asyncHandler = require('express-async-handler');

/* GET home page. */
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  res.json({books});
}));

module.exports = router;
