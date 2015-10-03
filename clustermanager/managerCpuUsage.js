var managerCpuUsage = function(load) {
	this.date = new Date().getTime(),
	this.load = load;
};

managerCpuUsage.prototype.toObject = function() {
	var ob = {};
	ob.period = this.date;
	ob.value = this.load;
	return ob;
};

module.exports = managerCpuUsage;