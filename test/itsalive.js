const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);

describe('simple tests', function() {
	it('adds 2+2', function() {
		chai.expect(2+2).to.equal(4);
	});
	it('setTimeout is accurate', function(done) {
		let date_time_before = new Date();
		setTimeout(function() {
			let date_time_after = new Date();
			let difference = date_time_after - date_time_before
			console.log(difference);
			chai.expect(difference).to.be.closeTo(1000, 50);
			done();
		}, 1000);
	});
	it('uses a spy', function() {
		var obj = {
  			foobar: function () {
    			console.log('foo');
    			return 'bar';
  			}
		}
		chai.spy.on(obj, 'foobar');	
		chai.expect(obj.foobar()).to.equal('bar');
		chai.expect(obj.foobar).to.have.been.called();	
	});
});



