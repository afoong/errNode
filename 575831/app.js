var express = require('express'),
    app = express.createServer(),
    Post = require('./models/post');

app.configure(function () {
    app.use(express.methodOverride());
    app.use(express.bodyDecoder());
    app.use(express.staticProvider(__dirname + '/public'));
    app.use(express.compiler({src: __dirname + '/public', enable: ['sass']}));
    app.use(express.logger());

    app.set('view engine', 'haml');
    app.register('.haml', require('hamljs'));
});

app.get('/', function (req, res) {
    Post.find().all(function (docs) {
       res.render('index', {
           locals: {title: 'Errors', articles: docs}
       });
    });
});

app.get('/err/new', function(req, res) {
    res.render('new', {locals: {title: 'New Post'}});
});

app.get('/err/:id', function(req, res) {
    Post.findById(req.params.id, function(err) {
        res.render('view', {locals: {type: err.type, error: err}});
    });
});

app.listen(8024, 'li21-127.members.linode.com');
