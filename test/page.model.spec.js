const models = require('../models');
const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);
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
      beforeEach(function(done) {
        pages[0] = models.Page.build({title: 'test_title0', content: 'test_content', tags: ['test_tag_1', 'test_tag_2', 'test_tag_3']});
        pages[1] = models.Page.build({title: 'test_title1', content: 'test_content', tags: ['test_tag_3']});
        pages[2] = models.Page.build({title: 'test_title2', content: 'test_content', tags: ['test_tag_4']});
        bluebird.all(pages.map(page => page.save())).then(() => done());
      });
      it('gets pages with the search tag', function(done) {
        bluebird.all([
          models.Page.findByTag('test_tag_1'),
          models.Page.findByTag('test_tag_3'),
          models.Page.findByTag('test_tag_4')
        ]).spread((tag1, tag2, tag3) => {
          chai.expect(tag1).to.equal([pages[0]]); // true
          chai.expect(tag2).to.equal([pages[0], pages[1]]); // true
          chai.expect(tag3).to.equal([pages[2]]); // true
          done();
        })


      });
      it('does not get pages without the search tag', function() {


      });
    });
  });

  describe('Instance methods', function () {
    describe('findSimilar', function () {
      it('never gets itself');
      it('gets other pages with any common tags');
      it('does not get other pages without any common tags');
    });
  });

  describe('Validations', function () {
    it('errors without title');
    it('errors without content');
    it('errors given an invalid status');
  });

  describe('Hooks', function () {
    it('it sets urlTitle based on title before validating');
  });

});