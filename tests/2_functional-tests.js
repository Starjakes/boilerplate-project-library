const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {

  let testBookId;

  test('POST /api/books with title', function (done) {
    chai.request(server)
      .post('/api/books')
      .send({ title: 'Test Book' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.property(res.body, 'title');
        assert.equal(res.body.title, 'Test Book');
        testBookId = res.body._id;
        done();
      });
  });

  test('POST /api/books with no title given', function (done) {
    chai.request(server)
      .post('/api/books')
      .send({})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'missing required field title');
        done();
      });
  });

  test('GET /api/books', function (done) {
    chai.request(server)
      .get('/api/books')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test('GET /api/books/[id] with id not in db', function (done) {
    chai.request(server)
      .get('/api/books/invalidid')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'no book exists');
        done();
      });
  });

  test('GET /api/books/[id] with valid id', function (done) {
    chai.request(server)
      .get('/api/books/' + testBookId)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.property(res.body, 'title');
        assert.property(res.body, 'comments');
        done();
      });
  });

  test('POST /api/books/[id] with comment', function (done) {
    chai.request(server)
      .post('/api/books/' + testBookId)
      .send({ comment: 'Nice book!' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'comments');
        assert.include(res.body.comments, 'Nice book!');
        done();
      });
  });

  test('POST /api/books/[id] without comment', function (done) {
    chai.request(server)
      .post('/api/books/' + testBookId)
      .send({})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'missing required field comment');
        done();
      });
  });

  test('DELETE /api/books/[id] with valid id', function (done) {
    chai.request(server)
      .delete('/api/books/' + testBookId)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'delete successful');
        done();
      });
  });

  test('DELETE /api/books/[id] with id not in db', function (done) {
    chai.request(server)
      .delete('/api/books/invalidid')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'no book exists');
        done();
      });
  });

  test('DELETE /api/books to remove all books', function (done) {
    chai.request(server)
      .delete('/api/books')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'complete delete successful');
        done();
      });
  });

});
