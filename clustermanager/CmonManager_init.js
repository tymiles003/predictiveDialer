var util = require('util');
var cluster = require('cluster');
var manAlert = require('./managerAlert');
var util = require('util');
var os = require('os');
var file = fs = require('fs');
var nconf = require('nconf');

var myClass = function() {};

myClass.prototype.init = function() {
	this.workers = [];
	this.alerts = { timeindexes: []};
	this.stats = [];
	this.managerStats = { timeindexes: [] };
	this.cpucount = os.cpus().length;
	this.cpumodel = os.cpus()[0].model;
	this.cpuavgspeed = 0;
	for (var i = 0; i < os.cpus().length; i++) {
		this.cpuavgspeed = this.cpuavgspeed + os.cpus()[i].speed;
	}
	this.cpuavgspeed = this.cpuavgspeed / os.cpus().length;
	this.ostype = os.platform();
	this.osrelease = os.release();
	this.hostname = os.hostname();
	this.osarch = os.arch();
	this.osmemory = os.totalmem();
	this.uptime = os.uptime();
	this.interfaces = [];
	var ints = os.networkInterfaces();
	
	for (var n in ints) {
		if (ints.hasOwnProperty(n)) {
			var adds = [];
			for (var i = 0; i < ints[n].length; i++) {
				adds.push(ints[n][i].address);
			}
			this.interfaces.push({name: n, addresses: adds});
		}
	}
	ints = null;
	this.cpustats = [];
	this.runningWorkers = 0;
	this.memorystats = [];
	this.timers = {};
	this.startTime = new Date();
	this.workersStats = [];
	//this.alerts.push(new manAlert('system', 'Manager start up', 'Manager has started operations'));
	thisStats = {};
	thisStats.timeindexes = [];
	if (fs.existsSync("clustermanager/_stats/managerStats.json") && false) {
		var lines = fs.readFileSync("clustermanager/_stats/managerStats.json").toString().split("\n")
		var len = lines.length;
		var cnt = 0;
		for (var i = 0; i < len; i++) {
			try {
				
				var o = JSON.parse(lines[i]);
				cnt++;
				thisStats.timeindexes.push(o.timeindex);
				thisStats[o.timeindex] = o.data;
			} catch(e) {
				console.log(e);
			}
		}
		console.log("Loaded " + cnt + " old stats");
	}
	this.nconf = nconf;
	this.nconf.file('conf/config.json');
	this.nconf.defaults({
		'appName' : 'Default cluster app',
		'memoryDebug' : true,
		'appShortName' : 'CMon',
		'workersNumber' : 3, // default is "do not start" workers
		'workersLifetimeSeconds' : 60, //set to 0 to disable killing
		'restartAfterTimeLimit' : false,
		'workersLifetimeRequests' : 0, //set to 0 to disable killing
		'appPort' : 3000,
		'manEnabled' : true,
		'manSessionSecret' : 'setThisToSomethingSecret',
		'manCookieName' : 'WPCLUSTERADM',
		'manPort' : 3001,
		'manUsername' : 'cluster-admin',
		'manPassword' : 'cluster-password',
		'stats' : true,
		'workersStatsMode' : 'interval', // or 'realtime'
		'statsInterval' : 500, // if stastMode == 'interval', this is the interval in ms
		'managerStatsAggregate' : true,
		'statsPersist' : true,
		'statsMaxAge' : 1000 * 60, //in ms
		'workersStatsAggregate' : true,
		'workersRamWarnLimit' : 0,
		'workersRamKillLimit' : 0
	});
	
	if (this.nconf.get('appPort') < 1) {
		var error = new Error("Please set your Application Port (appPort)");
		return error;
	}
	if (this.nconf.get('manPort') < 1) {
		var error = new Error("Please set your Management Port (manPort)");
		return error;
	}
	if (!this.nconf.get('manPassword') || this.nconf.get('manPassword') == "") {
		var error = new Error("Management password must be set");
		return error;
	}
	
	this.expiretimer = setInterval(this.checkOldWorkers.bind(this), 1000);
};
module.exports = myClass;