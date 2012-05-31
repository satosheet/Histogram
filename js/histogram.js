Ext.define('Ext.ux.Histogram', {
	extend : 'Ext.Component',
	
	udc : null,
	target : null,
	lsl : null,
	show3sigmaLine : true,
	showNormalLine : true,
	showSpecLimit : true,
	showGridLine : true,
	autoScaleX : true,
	autoScaleY : true,
	showBarLabel : true,
	topTitle : null,
	bottomTitle : null,
	leftTitle : null,
	minX : null,
	maxX : null,
	minY : null,
	maxY : null,
	barCount : 0,
	stddev : null,
	precision : 4,
	scaleY : 0,
	bgColor : null, //Color.WhiteSmoke
	barColor : null, //Color.FromArgb(81, 121, 214)
	
	data : null,
	precisionFormat : '#,##0.0000',
	
	addValue : function(v) {
		this.data.push(v);
	},
	
	resetData : function() {
		
	},
	
	getDataCount : function() {
		
	},
	
	getMax : function() {
		
	},
	
	getMean : function() {
		
	},
	
	getSigma : function() {
		
	},
	
	setData : function(data) {
		
	},
	
	calculate : function() {
		this.initCalc();
		
		if(this.data.length < 2)
			return false;
			
		this.min = Ext.Stat.min(this.data);
		this.max = Ext.Stat.max(this.data);
		
		var range = this.max - this.min;
		
		if(this.binsize === null) {
			var bin = Math.floor(Math.sqrt(this.data.length));
			bin = Math.max(5, bin);
			bin = Math.min(20, bin);
			this.binsize = bin;
		}
		
		var o = Ext.Stat.minunit(range / this.binsize);
		this.binwidth = o.value;
		var minunit = o.minunit;
		
		console.log(o);
		
		if(range == 0) {
			this.binsize = 5;
			this.binfirst = Math.floor(this.min) - 2;
			this.binlast = Math.floor(this.min) + 3;
		} else {
			var temp = this.min;
			
			if(Math.abs(this.binwidth) >= 1) {
				for(var i = 1;i <= minunit;i++) {
					temp /= 10;
				}
				temp = Math.floor(temp) - 0.5;
				for(var i = 1;i <= minunit;i++) {
					temp *= 10;
				}
				this.binfirst = temp;
			} else {
				for(var i = 1;i <= minunit;i++) {
					temp *= 10;
				}
				temp = Math.floor(temp) - 0.5;
				for(var i = 1;i <= minunit;i++) {
					temp /= 10;
				}
				this.binfirst = temp;
			}
			
			this.binlast = this.binfirst + this.binwidth * this.binsize;
			while(this.binlast - this.max <= 0.00000000000001) {
				this.binlast += this.binwidth;
				this.binsize += 1;
			}
		}
		
		for(var i = 0;i <= this.binsize;i++) {
			this.freqData.push(0);
			this.binMesh.push(this.binfirst + this.binwidth * i);
		}
		
		var sum = 0, sqrtsum = 0, idx, dv, sv;
		
		for(var i = 0;i < this.data.length;i++) {
			dv = this.data[i];
			sum += dv;
			sqrtsum += Math.pow(dv, 2);
			
			if(dv === this.binfirst) {
				idx = 0;
			} else {
				idx = Math.floor(Math.floor((dv - this.binfirst) / this.binwidth)); 
			}
			
			this.freqData[idx]++;
		}
		
		if(range !== 0) {
			while(this.freqData.length > 0) {
				if(this.freqData[0] !== 0)
					break;
				this.freqData.shift();
				this.binfirst += this.binwidth;
				this.binMesh.shift();
				this.binlast -= this.binwidth;
				this.binsize -= 1;
			}
		}
		
		if(this.mean === null) {
			this.mean = sum / this.data.length;
		}
		if(this.stddev === null) {
			this.stddev = Math.sqrt(sqrtsum - this.data.length * Math.pow(sum / this.data.length, 2) / (this.data.length - 1));
		}
		
		this.calculated = true;
	},
	
	initCalc : function() {
		this.binMesh = [];
		this.freqData = [];
		this.min = null;
		this.max = null;
		this.stddev = null;
		this.mean = null;
		this.binfirst = null;
		this.binlast = null;
		this.binwidth = null;
		this.binsize = null;
		this.calculated = false;
	},

	initComponent : function() {
		this.callParent(arguments);
	},
	
	afterRender : function() {
		var width = this.getWidth();
		var height = this.getHeight();
		
		// this.gbEl = this.el.createChild({
		// 	tag : 'img',
		// 	src : 'http://miracom.co.kr/images/main_logo.jpg',
		// 	cls : 'ext-ux-clock-img',
		// 	width : width,
		// 	height : height
		// });
		
		this.canvas = Raphael(this.el.dom, width, height);
		
		this.generate();
		this.calculate();
		this.chart();

		// this.drawHands();
		
		// this.on('resize', this.refresh, this);
		
		this.callParent(arguments);
	},
	
	generate : function() {
		const NTEST = 100;
		const RANDMAX = 100000;
		
		this.data = [];
		
		for(var i = 0;i < NTEST;i++)
			this.data[i] = Math.floor(Math.random() * RANDMAX);
		console.log(this.data);
	},
	
	d : function() {
		var xp1, xp2;
		
		for(var i = 0;i < this.binMesh.length - 2;i++) {
			xp1 = this.binMesh[i];
			xp2 = this.binMesh[i + 1];
			yp = this.freqData[i];
			
			xpixel1 = 1;
			
		}
	},
	
	chart : function() {
		var canvas = this.canvas;
		var rects = [];
		
		var width = this.getWidth();
		var height = this.getHeight();

		console.log(this.binMesh[this.binMesh.length - 1]);

		for(var i = 0;i < this.binMesh.length - 1;i++){
			var o = {
				x : (this.binMesh[i] - this.binMesh[0]) / 100,
				y : height - this.freqData[i],
				w : (this.binMesh[1] - this.binMesh[0]) /100,
				h : this.freqData[i]
			};

			rects[i] = canvas.rect(o.x, o.y, o.w, o.h);
			rects[i].attr({
				fill : '#00f',
				opacity : '0.2'
			});
		}		
	},
	
	drawHands : function() {
		const divNum = 20;
		const rndMax = 100000;
		const testNum = 3000;

		var width = this.getWidth();
		var height = this.getHeight();
		
		var canvas = this.canvas;

		// canvas.rect(0, 0, width, height).attr({
		//   fill: "90-#111-#ddd",
		//   "stroke": "#ddd",
		//   "stroke-dasharray": ""
		// });

		var data = new Array(divNum);
		var rects = new Array(divNum);
		for(var i=0;i<divNum;i++){ data[i] = 0; }

		for(var i=0;i<testNum;i++){
		  var r = Math.floor(Math.random()*rndMax);

		  var divVal = rndMax/divNum;
		  var divI = 0;
		  while(divVal <= rndMax){
		    if(r < divVal){
		      data[divI] += 1;
		      break;
		    }
		    divI++;
		    divVal += rndMax/divNum;
		  }
		}

		for(var i=0;i<divNum;i++){
		  rects[i]  = canvas.rect(
		                  width/divNum*i, height-1*data[i],
		                  width/divNum, 1*data[i]);
		  rects[i].attr({
			fill : '#00f',
			opacity : '0.2'
		  });
		}		
	},
	
	onDestroy : function() {
		this.callParent(arguments);
	}
});