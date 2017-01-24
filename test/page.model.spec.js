const models = require('../models');
const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);
const chai_as_promised = require('chai-as-promised');
chai.use(chai_as_promised);
const marked = require('marked');
const bluebird = require('bluebird');

describe('Page model', function () {
	beforeEach(function() {
		return models.Page.sync({force: true})
	});
	describe('Virtuals', function () {
		let page;
		beforeEach(function() {
			page = models.Page.build();
		});
		describe('route', function () {
			it('returns the url_name prepended by "/wiki/"', function() {
				page.urlTitle = 'test_urlTitle';
				chai.expect(page.route).to.equal('/wiki/' + page.urlTitle);
			});
		});
		describe('renderedContent', function () {
			it('converts the markdown-formatted content into HTML', function() {
				page.content = 'Hello, my name is *Bob*\nAnd my friend\'s name is _Bill_.';
				chai.expect(page.renderedContent).to.equal(marked(page.content));
			});
		});
	});

	describe('Class methods', function () {
		describe('findByTag', function () {
			let pages = [];
			beforeEach(function() {
				pages[0] = models.Page.build({title: 'test_title0', content: 'test_content', tags: ['test_tag_1', 'test_tag_2', 'test_tag_3']});
				pages[1] = models.Page.build({title: 'test_title1', content: 'test_content', tags: ['test_tag_3']});
				pages[2] = models.Page.build({title: 'test_title2', content: 'test_content', tags: ['test_tag_4']});
				return bluebird.all(pages.map(page => page.save()));
			});
			it('gets pages with the search tag', function() {
				return bluebird.all([
					chai.expect(models.Page.findByTag('test_tag_1'))
						.to.eventually.have.lengthOf(1),
					chai.expect(models.Page.findByTag('test_tag_3'))
						.to.eventually.have.lengthOf(2),
					chai.expect(models.Page.findByTag('test_tag_4'))
						.to.eventually.have.lengthOf(1)												
				]);
			});
			it('does not get pages without the search tag', function() {
				return chai.expect(models.Page.findByTag('NotAtTag'))
						.to.eventually.have.lengthOf(0);
			});
		});
	});

	describe('Instance methods', function () {
		let pages = [];
		beforeEach(function() {
			pages[0] = models.Page.build({title: 'test_title0', content: 'test_content', tags: ['test_tag_1', 'test_tag_2', 'test_tag_3']});
			pages[1] = models.Page.build({title: 'test_title1', content: 'test_content', tags: ['test_tag_3']});
			pages[3] = models.Page.build({title: 'test_title3', content: 'test_content', tags: ['test_tag_1', 'test_tag_2']});
			pages[2] = models.Page.build({title: 'test_title2', content: 'test_content', tags: ['test_tag_4']});
			return bluebird.all(pages.map(page => page.save()));
		});

		describe('findSimilar', function () {
			it('never gets itself', function () {
				return chai.expect(pages[2].findSimilar())
					.to.eventually.have.lengthOf(0);
			});
			it('gets other pages with any common tags', function () {
				return chai.expect(pages[0].findSimilar())
					.to.eventually.have.lengthOf(2);	
			});
			it('does not get other pages without any common tags', function () {
				return chai.expect(pages[3].findSimilar())
					.to.eventually.have.lengthOf(1);
			});
		});
	});

	describe('Validations', function () {
		it('errors without title', function () {
			const page = models.Page.build({
				content: 'test_content',
				tags: ['test_tag_1', 'test_tag_2', 'test_tag_3']
			})

			return chai.expect(page.save())
				.to.be.rejectedWith('notNull Violation: title cannot be null');

		});
		it('errors without content', function () {
			const page = models.Page.build({
				title: 'test_title0',
				tags: ['test_tag_1', 'test_tag_2', 'test_tag_3']
			})
			return chai.expect(page.save())
				.to.be.rejectedWith(/content/);
		});
		it('errors given an invalid status', function () {
			const page = models.Page.build({
				title: 'test_title0',
				status: 'invalid',
				content: 'test_content',
				tags: ['test_tag_1', 'test_tag_2', 'test_tag_3']
			})

			return chai.expect(page.save())
				.to.be.rejectedWith(/status/);
		});
	});

	describe('Hooks', function () {
    beforeEach(function() {
      page = models.Page.build({title: 'test title', content: 'test content', });
      page.save();
    });
    describe('hooks', function () {
      it('it sets urlTitle based on title before validating', function() {
        chai.expect(page.urlTitle).to.equal('test_title');
      });
    });
	});


});