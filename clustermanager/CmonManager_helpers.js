var myClass = function() {};

myClass.prototype.getRandomTime = function(avrg) {
	avrg = parseInt(avrg,10);
	avrg = avrg * 1000;
	var offset = avrg/100*15;
	//console.log("Offset = " + offset);
	var min = avrg - offset;
	var max = avrg + offset;
	var num = parseInt(Math.random() * (max - min) + min);
	//console.log("Setting timeout in " + num + " seconds (average = " + avrg + ")",min,max);
	num = (new Date()).getTime() + num;
	//console.log("Setting timeout in " + num + " seconds (average = " + avrg + ")",min,max);
	return num;
};

myClass.prototype.reload = function() {
	if (this.nconf.get('enableWorkers') == true) {
		var newNumber = parseInt(this.nconf.get('workersNumber'),10);
		console.log("Current workers: " + this.workers.length);
		if (newNumber !== this.workers.length) {
			var diff = newNumber - this.workers.length;
			//this.workers.sort(this.workersSorter);
			if (diff < 0) {
				for (var i = 0; i < diff*-1; i++) {
					this.addEvent('system','Worker Kill','Sending worker a kill message');
					var idx = this.workers.length - 1 - i;
					if (idx > -1) {
						console.log("Killing worker");
						this.killWorker(this.workers[idx].pid);
					}
					
				}
			} else {
				for (var i = 0; i < diff; i++) {
					console.log("Starting worker");
					this.addWorker();
				}
			}
		}
		
		if (this.nconf.get('restartAfterTimeLimit') == true) {
			var now = (new Date()).getTime();
			for (var i = 0; i < this.workers.length; i++) {
				if (this.workers[i].killafter == 0) {
					this.workers[i].killafter = (new Date()).getTime() + this.getRandomTime(this.nconf.get('workersTimeLimit'));
				}
			}
		} else {
			for (var i = 0; i < this.workers.length; i++) {
				if (this.workers[i].killafter != 0) {
					this.workers[i].killafter = 0;
				}
			}
		}
		
	} else {
		if (this.workers && this.workers.length > 0) {
			for (var i = 0; i < this.workers.length; i++) {
				this.killWorker(this.workers[i].pid);
			}
		}
	}
};

module.exports = myClass;