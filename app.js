const express = require('express');
const app = express();
var Book = require("./models").Book;
var bodyParser = require('body-parser');


app.use("/static", express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var Sequelize = require('sequelize');
const Op = Sequelize.Op;


app.set("view engine", "pug");

app.get('/', (req, res) => {
  res.redirect('/books')
});

app.get('/books', (req, res) => {
  res.redirect('/books/page/1')
});

app.get('/books/page/:page', (req, res) => {
  var limit = 10,
      offset=0;
  Book.findAndCountAll().then((data) => {
    var page = req.params.page;
    var pages = Math.ceil(data.count / limit);
    offset = limit * (page-1);
    Book.findAll({
      limit:limit,
      offset:offset
    }).then((books) => {
      res.render('books', {books: books, pages: pages, n:0})
    })
  })

});

app.get('/books/new', (req, res) => {
  res.render('new_book', {book: Book.build()})
});

app.post('/books/new', (req, res) => {
  Book.create(req.body).then((book) => {
    res.redirect("/books/" + book.id);
  }).catch((err)=>{
    res.render('form_error')
  });
});

app.get('/books/:id', (req, res) => {
  Book.findById(req.params.id).then((book) => {
    if(book){
      res.render('book_detail', {book: book});
    } else {
      res.render('error')
    }
  })

});

app.post('/books/:id', (req, res) => {
  Book.findById(req.params.id).then((book) => {
    if(book){
      return book.update(req.body);
    } else {
      res.render('error')
    }
  }).then((article)=>{
    res.redirect(`/books/${article.id}`)
  })
});

app.post('/books/:id/delete', (req, res) => {
  Book.findById(req.params.id).then((book) => {
    if(book){
      return book.destroy();
    } else {
      res.render('error')
    }

  }).then((article)=>{
    res.redirect(`/books`)
  })
});

app.post('/search', (req, res) => {
  Book.findAll({
    where: {
      [Op.or]: {
        title: {
          [Op.like]: `%${req.body.search}%`
        },
        author: {
          [Op.like]: `%${req.body.search}%`
        },
        genre: {
          [Op.like]: `%${req.body.search}%`
        },
        year: {
          [Op.like]: `%${req.body.search}%`
        }
      }
    }
  }).then((books)=>{
    res.render('books', {books: books})
  })
});

app.get('/search', (req, res) => {
  res.render('books');
})

app.use((req, res, next) => {
    const err = new Error('We are having trouble loading the content you are trying to access');
    err.status = 404;
    console.log(err);
    res.render('page_not_found');
});

app.listen(3000, () => {
  console.log('This app is being run on port 3000');
});
