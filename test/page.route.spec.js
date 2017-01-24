var supertest = require('supertest-as-promised');
var app = require('../app');
var agent = supertest.agent(app);
const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);
const models = require('../models');


describe('http requests', function () {
	beforeEach(function() {
		return models.User.sync({force: true}).then(() => models.Page.sync({force: true}));
	});
	describe('GET /wiki/', function () {
		it('responds with 200', function() {
			return agent.get('/wiki/').expect(200); 		
		});
	});

	describe('GET /wiki/add', function () {
		it('responds with 200', function() {
			return agent.get('/wiki/add').expect(200); 		
		});
	});

	describe('GET /wiki/:urlTitle', function () {
		it('responds with 404 on page that does not exist', function() {
			return agent.get('/wiki/everything').expect(404); 					
		});
		it('responds with 200 on page that does exist', function() {
			let page = models.Page.build({title: 'my title', content: 'my content'});
			return page
				.save()
				.then((page) => {
					return agent.get('/wiki/my_title').expect(200);
				});
		});
	});

	describe('GET /wiki/search?search=tag', function () {
		it('responds with 200', function() {
			return agent.get('/wiki/search?search=tag').expect(200); 		
		});  
	});

	describe('GET /wiki/:urlTitle/similar', function () {
		it('responds with 404 on page that does not exist', function() {
			return agent.get('/wiki/everything/similar').expect(404); 					
		});
		it('responds with 200 on page that does exist', function() {
			let page = models.Page.build({title: 'my title', content: 'my content'});
			return page.save()
			.then((page) => {
				return agent.get('/wiki/my_title/similar').expect(200);
			});
		});
	});

	describe('POST /wiki', function () {
		it('responds with 302', function() {
			return agent.post('/wiki')
				.send(encodeURI('name=bob&email=bob@gmail.com&title=the title&content=my best content'))
				.expect(302); 		
		});  		
		it('creates a page in the database', function() {
			chai.spy.on(models.Page, 'create');
			chai.spy.on(models.User, 'findOrCreate');
			return agent.post('/wiki')
				.send(encodeURI('name=bob&email=bob%40gmail.com&title=the title&content=my best content'))
				.end(function(err, res) {
					chai.expect(models.User.findOrCreate).to.have.been.called.once;
					chai.expect(models.Page.create).to.have.been.called.once;
				});
			});  		


	});

});