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
		return models.User.sync({force: true}).then(() => models.Page.sync({force: true}));
	});
	// describe('Validations', function () {
	// 	it('errors without title', function () {
	// 		const page = models.Page.build({
	// 			content: 'test_content',
	// 			tags: ['test_tag_1', 'test_tag_2', 'test_tag_3']
	// 		})

	// 		return chai.expect(page.save())
	// 			.to.be.rejectedWith('notNull Violation: title cannot be null');

	// 	});	
	describe('Validations', function() {
		it('requires an email', function() {
			let user = models.User.build({
				name: 'bob'
			});
			return chai.expect(user.save())
				.to.be.rejectedWith(/email/);
		});
		it('requires a valid email', function() {
			let user = models.User.build({
				name: 'bob',
				email: 'bobgmailcom'
			});
			return chai.expect(user.save())
				.to.be.rejectedWith(/isEmail/);
		});
	});

});