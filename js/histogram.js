Ext.define('Ext.ux.Histogram', {
	extend : 'Ext.Component',
	
	initComponent : function() {
		this.callParent(arguments);
	},
	
	afterRender : function() {
		var width = this.getWidth();
		var height = this.getHeight();
		
		this.gbEl = this.el.createChild({
			tag : 'img',
			src : 'https://lh4.ggpht.com/7ZmqGpfppjHqn1cdszOaAcWxdpDWWZf6N-MooB-tSkLiH5hiqQ7YY6oKj47AwJ0Wuqp1=s113',
			cls : 'ext-ux-clock-img',
			width : width,
			height : height
		});
		
		this.canvas = Raphael(this.el.dom, width, height);
		
		this.drawHands();
		
		// this.on('resize', this.refresh, this);
		
		this.callParent(arguments);
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