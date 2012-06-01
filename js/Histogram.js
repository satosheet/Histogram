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
		
		this.drawRegion();
		this.drawBar();
		this.drawTitle();

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
	},
	
	drawRegion : function() {
		var bw = this.getWidth();
		var bh = this.getHeight();
		
		const CHART_LEFT_GAP_PIXELS = 10;
		const CHART_RIGHT_GAP_PIXELS = 10;
		const CHART_TOP_GAP_PIXELS = 10;
		const CHART_BOTTOM_GAP_PIXELS = 10;
		
		var region = this.canvas.rect(CHART_LEFT_GAP_PIXELS, CHART_TOP_GAP_PIXELS, bw - CHART_LEFT_GAP_PIXELS - CHART_RIGHT_GAP_PIXELS, bh - CHART_TOP_GAP_PIXELS - CHART_BOTTOM_GAP_PIXELS);
		region.attr({
			fill : '#fff',
			// opacity : '0.2',
			stroke : 'navy',
			'stroke-width' : '2'
		});
	},
	
	drawTitle : function() {
		
		
/*
		Dim ptLocation As Point = New Point(rcDraw.Left + CHART_BORDER_PIXELS, _
            rcDraw.Top + CHART_BORDER_PIXELS)
        Dim szSize As Size = New Size(rcDraw.Right - ptLocation.X - CHART_BORDER_PIXELS, _
            rcDraw.Height - ptLocation.Y - CHART_BORDER_PIXELS * 2 + rcDraw.Top)
        TitleRegion = New Rectangle(ptLocation, szSize)

        Dim fmtTitle As StringFormat = New StringFormat
        If ParentControl.MainTitle <> STRING_NULL_DATA Then
            fmtTitle.LineAlignment = StringAlignment.Near
            fmtTitle.Alignment = StringAlignment.Center
            g.DrawString(ParentControl.MainTitle, _
                ParentControl.Font, _
                New SolidBrush(Color.FromArgb(123, 25, 25)), _
                TitleRegion.Left + TitleRegion.Width / 2.0, _
                TitleRegion.Top, _
                fmtTitle)
        End If

        If ParentControl.BottomTitle <> STRING_NULL_DATA Then
            fmtTitle.LineAlignment = StringAlignment.Center
            fmtTitle.Alignment = StringAlignment.Center
            g.DrawString(ParentControl.BottomTitle, _
                ParentControl.Font, _
                New SolidBrush(Color.FromArgb(123, 25, 25)), _
                TitleRegion.Left + TitleRegion.Width / 2.0, _
                TitleRegion.Bottom - 2, _
                fmtTitle)
        End If

        If ParentControl.LeftTitle <> STRING_NULL_DATA Then
            fmtTitle.FormatFlags = StringFormatFlags.DirectionVertical
            fmtTitle.LineAlignment = StringAlignment.Center
            fmtTitle.Alignment = StringAlignment.Center
            g.DrawString(ParentControl.LeftTitle, _
                ParentControl.Font, _
                New SolidBrush(Color.FromArgb(123, 25, 25)), _
                TitleRegion.Left + 5, _
                TitleRegion.Top + TitleRegion.Height / 2.0, _
                fmtTitle)
        End If
*/

        
	},
	
	drawBar : function() {
		var canvas = this.canvas;
		
		var xmin = 0, xmax = 100000;
		var ymin = 0, ymax = 100;
		
		var xl1, xl2, yl, xp1, xp2, hp, yp;
		var bw = this.getWidth();
		var bh = this.getHeight();
		var rects = [];
		
		for(var i = 0;i < this.binMesh.length - 2;i++) {
			xl1 = this.binMesh[i]; // logical x
			xl2 = this.binMesh[i + 1];
			yl = this.freqData[i];
			
			xp1 = (xl1 - xmin) * bw / (xmax - xmin); // x pixels
			xp2 = (xl2 - xmin) * bw / (xmax - xmin);
			hp = (yl - ymin) * bh / (ymax - ymin); // height pixels
			
			if(hp <= 0)
				continue;
				
			yp = bh - hp;
			
			rects[i] = canvas.rect(xp1, yp, xp2 - xp1, hp);
			rects[i].attr({
				fill : '#00f',
				opacity : '0.2',
				stroke : 'navy',
				'stroke-width' : '2'
			});
		}
	},
	
	draw3Sigma : function() {
		
	},
	
	onDestroy : function() {
		this.callParent(arguments);
	}
});