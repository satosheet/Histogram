Ext.define('Ext.ux.Histogram', {
	extend : 'Ext.Component',
	
	udc : null,
	target : null,
	lsl : null,
	show3SigmaLine : true,
	showNormalLine : true,
	showSpecLimit : false,
	showGridLine : true,
	autoScaleX : true,
	autoScaleY : true,
	showBarLabel : true,
	topTitle : null,
	bottomTitle : null,
	leftTitle : null,
	minX : 0,
	maxX : 100000,
	minY : 0,
	maxY : 100,
	barCount : 0,
	stddev : null,
	precision : 4,
	stepY : 10,
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
		
		var sum = 0, idx, dv, sv;
		
		for(var i = 0;i < this.data.length;i++) {
			dv = this.data[i];
			sum += dv;
			
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
			this.stddev = Ext.Stat.stddev(this.data, this.mean);
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
		
		var rect = this.drawRegion();
		this.drawTitle('top title', 'bottom title', 'left title');
		this.drawXAxis(rect);
		this.drawYAxis(rect);
		this.drawBar(rect);
		this.drawNormalLine(rect);
		this.draw3SLine(rect);

		// this.drawHands();
		
		// this.on('resize', this.refresh, this);
		
		this.callParent(arguments);
	},
	
	generate : function() {
		const NTEST = 100;
		const RANDMAX = 100;
		
		this.data = [];
		
		for(var i = 0;i < NTEST /2;i++)
			this.data[i] = 1000 + Math.floor(Math.random() * RANDMAX);
		for(;i < NTEST;i++)
			this.data[i] = 1000 + Math.floor((RANDMAX / 4) + Math.random() * (RANDMAX / 2));
		for(;i < NTEST * 4;i++)
			this.data[i] = 1000 + Math.floor((RANDMAX / 3) + Math.random() * (RANDMAX / 3));
		for(;i < NTEST * 16;i++)
			this.data[i] = 1000 + Math.floor((RANDMAX / 2.5) + Math.random() * (RANDMAX / 4));
	},
	
	drawRegion : function() {
		var bw = this.getWidth();
		var bh = this.getHeight();
		
		const CHART_LEFT_GAP_PIXELS = 60;
		const CHART_RIGHT_GAP_PIXELS = 30;
		const CHART_TOP_GAP_PIXELS = 30;
		const CHART_BOTTOM_GAP_PIXELS = 60;
		
		var rect = {
			x : CHART_LEFT_GAP_PIXELS,
			y : CHART_TOP_GAP_PIXELS,
			w : bw - CHART_LEFT_GAP_PIXELS - CHART_RIGHT_GAP_PIXELS,
			h : bh - CHART_TOP_GAP_PIXELS - CHART_BOTTOM_GAP_PIXELS
		};
		
		var region = this.canvas.rect(rect.x, rect.y, rect.w, rect.h).attr({
			fill : '#fff',
			// opacity : '0.2',
			stroke : 'navy',
			'stroke-width' : '2'
		});
		
		return rect;
	},
	
	drawTitle : function(top, bottom, left) {
		
		const CHART_BORDER_PIXELS = 10;
		
		var bw = this.getWidth();
		var bh = this.getHeight();

		var rect = {
			x : CHART_BORDER_PIXELS,
			y : CHART_BORDER_PIXELS,
			w : bw - 2 * CHART_BORDER_PIXELS,
			h : bh - 2 * CHART_BORDER_PIXELS
		};

		var textattr = {
			'fill' : '#ff7000',
			'font-size' : '16px',
			'font-family' : 'Verdana',
			'font-weight' : 'bold'
		};
		
		if(top)
			this.canvas.text(rect.x + rect.w / 2, rect.y, top).attr(textattr);
		if(bottom)
			this.canvas.text(rect.x + rect.w / 2, rect.y + rect.h - 2, bottom).attr(textattr);
		if(left)
			this.canvas.text(rect.x + 5, rect.y + rect.h / 2, left).attr(textattr).rotate(-90, true);
	},
	
	drawXAxis : function(r) {
		const CHART_Y_SCALE_STEP = 20;

		var min, max, xpos, ypos;
		var textHeight = 10;
		
		if(this.autoScaleX) {
			min = this.binMesh[0];
			max = this.binMesh[this.binMesh.length - 1];
			
			var vs = [min, max];

			if(this.show3SigmaLine) {
				vs.push(this.mean - this.stddev * 3);
				vs.push(this.mean + this.stddev * 3);
			}
			
			if(this.showSpecLimit) {
				vs.push(this.target);
				vs.push(this.lsl);
				vs.push(this.usl);
			}
			
			min = Math.min.apply(null, vs);
			max = Math.max.apply(null, vs);
		} else {
			min = this.minX;
			max = this.maxX;
		}
		
		this.minX = min;
		this.maxX = max;

		var path;
		
		ypos = r.y + r.h;
		
		for(var i = 0;i < this.binMesh.length;i++) {
			xpos = r.x + ((this.binMesh[i] - min) * r.w) / (max - min);

			path = 'M' + xpos + ','  + (ypos + 5) + 'L' + xpos + ',' + ypos;
			this.canvas.path(path);
			this.canvas.text(xpos, ypos + 10, Math.floor(this.binMesh[i]));
		}

		if(this.show3SigmaLine && this.showSpecLimit) {
			ypos = r.y + r.h + 8 + textHeight * 3;
		} else if(!this.showSpecLimit && this.show3SigmaLine) {
			ypos = r.y + r.h + 8 + textHeight;
		} else {
			ypos = r.y + r.h + 8 + textHeight * 2;
		}
		
		path = 'M' + (r.x - 20) + ',' + ypos + 'L' + (r.x + r.w + 20) + ',' + ypos;
		this.canvas.path(path);
		
		var szstep = (this.maxX - this.minX) / CHART_Y_SCALE_STEP;

		for(var i = 0;i <= CHART_Y_SCALE_STEP;i++) {
			var v = this.minX + szstep * i;
			var xpos = r.x + ((v - min) * r.w) / (max - min);

			path = 'M' + xpos + ','  + (ypos + 5) + 'L' + xpos + ',' + ypos;
			this.canvas.path(path);
			this.canvas.text(xpos, ypos + 10, Math.floor(v));
		}
	},
	
	drawYAxis : function(r) {
		const CHART_Y_SCALE_STEP = 20;

		var min = 0, max, ypos, szstep, yinterval;
		
		max = Math.floor(Math.max.apply(null, this.freqData));
		
		if(this.autoScaleY) {
			max += 5;
			max = max - max % 5;
		} else {
			min = this.minY;
			max = this.maxY;
		}
		
		if(max < this.stepY)
			max = this.stepY;
			
		this.maxY = max;
		
		// var path = 'M' + r.x + ',' + r.y + 'L' + r.x + ',' + (r.y + r.h);
		// this.canvas.path(path);
		// path = 'M' + (r.x + r.w) + ',' + (r.y + r.h) + 'L' + (r.x + r.w) + ',' + (r.y + r.h + 1);
		// this.canvas.path(path);
				
		if(this.stepY > 0) {
			yinterval = this.stepY;
			szstep = Math.floor((max - min) / yinterval);
		} else {
			if(max < 10) {
				szstep = max
			} else {
				szstep = CHART_Y_SCALE_STEP;
			}
			
			if(szstep === 0) {
				szstep = CHART_Y_SCALE_STEP;
			}
			
			yinterval = (max - min) / szstep;
		}
		
		for(var i = 0;i <= szstep;i++) {
			var v = min + yinterval * i;
			ypos = (r.y + r.h) - ((v - min) * r.h) / (max - min);
			path = 'M' + (r.x - 5) + ',' + ypos + 'L' + r.x + ',' + ypos;
			this.canvas.path(path);
			
			if(this.showGridLine) {
				path = 'M' + (r.x + 1) + ',' + ypos + 'L' + (r.x + r.w) + ',' + ypos;
				this.canvas.path(path).attr({
					opacity : 0.1
				});
			}
			
			this.canvas.text((r.x - 10), ypos, v).attr({
				'text-anchor': 'end'
			});
		}
	},
	
	drawBar : function(r) {
		var canvas = this.canvas;
		
		var yl, xp1, xp2, hp, yp;
		
		for(var i = 0;i < this.binMesh.length - 1;i++) {
			yl = this.freqData[i];
			
			xp1 = r.x + ((this.binMesh[i] - this.minX) * r.w) / (this.maxX - this.minX); // x pixels
			xp2 = r.x + ((this.binMesh[i + 1] - this.minX) * r.w) / (this.maxX - this.minX);
			hp = (yl - this.minY) * r.h / (this.maxY - this.minY); // height pixels
			
			yp = r.y + r.h - hp;
			
			if(hp > 0) {
				canvas.rect(xp1, yp, xp2 - xp1, hp).attr({
					fill : '#00f',
					opacity : '0.2',
					stroke : 'navy',
					'stroke-width' : '2'
				});
			}
			
			yp = Math.min(yp + hp / 2, r.y + r.h - 20);
			canvas.text((xp1 + xp2) / 2, yp, this.freqData[i]).attr({
				'font-size' : 20,
				'opacity' : 0.2,
				'fill' : '#f00'
			});
		}
	},
	
	draw3Sigma : function() {
		
	},
	
	drawNormalLine : function(r) {
		var min, max;
		
		min = r.x;
		max = r.x + r.w;
		
		var pos = [];
		var cnt = 0;
		
		for(var i = min;i <= max;i++) {
			var x = (i - min) * (this.maxX - this.minX) / r.w + this.minX;
			
			var dnormal = Ext.Stat.dnormal(x, this.mean, this.stddev);
			
			var y = dnormal;
			dnormal = Ext.Stat.dnormal(this.mean, this.mean, this.stddev);

			// console.log(x, this.mean, this.stddev, dnormal, y);
			
			var ypos = (r.y + r.h) - (y * r.h / dnormal);
			
			if(ypos > (r.y + r.h))
				continue;
				
			pos[cnt++] = i + ',' + Math.floor(ypos);
		}
		
		pos[cnt++] = (r.x + r.w) + ',' + (r.y + r.h);
		pos[cnt++] = (r.x) + ',' + (r.y + r.h);
		
		var path = 'M' + pos.join('L');
		this.canvas.path(path).attr({
			fill : '#0f0',
			opacity : 0.2
		});
	},
	
	draw3SLine : function(r) {
		
		/*
        Dim dRegionWidth As Double = DrawRegion.Width
        Dim dRegionHeight As Double = DrawRegion.Height
        Dim ptOrigin As Point = New Point(DrawRegion.Left, DrawRegion.Bottom)
        Dim dMean As Double = ParentControl.DataSet.Mean
        Dim dSigmaLower As Double = dMean - ParentControl.DataSet.StdDev * 3
        Dim dSigmaUpper As Double = dMean + ParentControl.DataSet.StdDev * 3

        Dim penSpecLine As Pen = New Pen(CHART_SIGMA_LINE_COLOR, 1)
        Dim sValue As String = STRING_NULL_DATA
        Dim szText As SizeF = SizeF.Empty
        Dim rcText As RectangleF = RectangleF.Empty
        Dim iXPos As Integer = 0
        Dim iXPos2 As Integer = 0
        Dim iYPos As Integer = 0
        Dim iMeanPos1, iSimgaUpperPos1, iSigmaLowerPos1 As Integer
        Dim iMeanPos2, iSimgaUpperPos2, iSigmaLowerPos2 As Integer
        Dim iMPos1, i3sUpperPos1, i3sLowerPos1 As Integer
        Dim iMPos2, i3sUpperPos2, i3sLowerPos2 As Integer
        iMeanPos1 = 0
        iSimgaUpperPos1 = 0
        iSigmaLowerPos1 = 0
        iMeanPos2 = 0
        iSimgaUpperPos2 = 0
        iSigmaLowerPos2 = 0
        iMPos1 = 0
        i3sUpperPos1 = 0
        i3sLowerPos1 = 0
        iMPos2 = 0
        i3sUpperPos2 = 0
        i3sLowerPos2 = 0

        Dim fmtSigma As StringFormat = New StringFormat
        fmtSigma.Alignment = StringAlignment.Center
        fmtSigma.LineAlignment = StringAlignment.Near
		*/
		
		var origin = {
			x : r.x,
			y : r.y + r.h
		};
		var min = this.minX, max = this.maxX;
		
		var xpos = origin.x + (((this.mean - min) * r.w) / (max - min));
		var ypos = origin.y;
		
		if(xpos > r.x - 20 && xpos < (r.x + r.w) + 20) {
			this.canvas.path('M' + xpos + ',' + ypos + 'L' + xpos + ',' + (ypos - r.h + 30))
		}
		/*

        iYPos = ptOrigin.Y

        iXPos = ptOrigin.X + CInt(((dMean - XAxisMin) * dRegionWidth) / (XAxisMax - XAxisMin))
        If iXPos > DrawRegion.Left - 20 And iXPos < DrawRegion.Right + 20 Then
            g.DrawLine(penSpecLine, iXPos, iYPos, iXPos, iYPos - CInt(dRegionHeight + 30))
            szText = g.MeasureString("M", ParentControl.Font)
            iMPos1 = iXPos - szText.Width / 2.0
            iMPos2 = iXPos + szText.Width / 2.0
            rcText = New RectangleF(iXPos - CInt(szText.Width / 2.0), _
                iYPos - CInt(dRegionHeight + 30 + szText.Height), _
                szText.Width, _
                szText.Height)
            'g.FillRectangle(Brushes.WhiteSmoke, rcText)
            g.DrawString("M", ParentControl.Font, New SolidBrush(CHART_SIGMA_LINE_COLOR), rcText)
            sValue = dMean.ToString(ParentControl.PrecisionFormat)
            szText = g.MeasureString(sValue, ParentControl.Font)
            iMeanPos1 = iXPos - szText.Width / 2.0
            iMeanPos2 = iXPos + szText.Width / 2.0
            If ParentControl.IsViewSpecLimit = True Then
                g.DrawString(sValue, ParentControl.Font, New SolidBrush(CHART_SIGMA_LINE_COLOR), iXPos, iYPos + 5 + szText.Height * 2, fmtSigma)
            Else
                g.DrawString(sValue, ParentControl.Font, New SolidBrush(CHART_SIGMA_LINE_COLOR), iXPos, iYPos + 5 + szText.Height, fmtSigma)
            End If
        End If

        If ParentControl.DataSet.StdDev = 0 Then
            Return True
        End If

        iXPos = ptOrigin.X + CInt(((dSigmaLower - XAxisMin) * dRegionWidth) / (XAxisMax - XAxisMin))
        iXPos2 = iXPos
        If iXPos > DrawRegion.Left - 20 And iXPos < DrawRegion.Right + 20 Then
            g.DrawLine(penSpecLine, iXPos, iYPos, iXPos, iYPos - CInt(dRegionHeight + 30))
            szText = g.MeasureString("3s", ParentControl.Font)
            If iMPos1 <> 0 And iMPos1 < iXPos2 + szText.Width / 2.0 Then
                iXPos2 = iMPos1 - szText.Width / 2.0
            End If
            rcText = New RectangleF(iXPos2 - CInt(szText.Width / 2.0), _
                iYPos - CInt(dRegionHeight + 30 + szText.Height), _
                szText.Width, _
                szText.Height)
            'g.FillRectangle(Brushes.WhiteSmoke, rcText)
            g.DrawString("3s", ParentControl.Font, New SolidBrush(CHART_SIGMA_LINE_COLOR), rcText)
            sValue = dSigmaLower.ToString(ParentControl.PrecisionFormat)
            szText = g.MeasureString(sValue, ParentControl.Font)
            If iMeanPos1 <> 0 And iMeanPos1 < iXPos + szText.Width / 2.0 Then
                iXPos = iMeanPos1 - szText.Width / 2.0
            End If
            iSigmaLowerPos1 = iXPos - szText.Width / 2.0
            iSigmaLowerPos2 = iXPos + szText.Width / 2.0
            If ParentControl.IsViewSpecLimit = True Then
                g.DrawString(sValue, ParentControl.Font, New SolidBrush(CHART_SIGMA_LINE_COLOR), iXPos, iYPos + 5 + szText.Height * 2, fmtSigma)
            Else
                g.DrawString(sValue, ParentControl.Font, New SolidBrush(CHART_SIGMA_LINE_COLOR), iXPos, iYPos + 5 + szText.Height, fmtSigma)
            End If
        End If

        iXPos = ptOrigin.X + CInt(((dSigmaUpper - XAxisMin) * dRegionWidth) / (XAxisMax - XAxisMin))
        iXPos2 = iXPos
        If iXPos > DrawRegion.Left - 20 And iXPos < DrawRegion.Right + 20 Then
            g.DrawLine(penSpecLine, iXPos, iYPos, iXPos, iYPos - CInt(dRegionHeight + 30))
            szText = g.MeasureString("3s", ParentControl.Font)
            If iMPos2 <> 0 And iMPos2 > iXPos2 - szText.Width / 2.0 Then
                iXPos2 = iMPos2 + szText.Width / 2.0
            End If
            rcText = New RectangleF(iXPos2 - CInt(szText.Width / 2.0), _
                iYPos - CInt(dRegionHeight + 30 + szText.Height), _
                szText.Width, _
                szText.Height)
            'g.FillRectangle(Brushes.WhiteSmoke, rcText)
            g.DrawString("3s", ParentControl.Font, New SolidBrush(CHART_SIGMA_LINE_COLOR), rcText)
            sValue = dSigmaUpper.ToString(ParentControl.PrecisionFormat)
            szText = g.MeasureString(sValue, ParentControl.Font)
            If iMeanPos2 <> 0 And iMeanPos2 > iXPos - szText.Width / 2.0 Then
                iXPos = iMeanPos2 + szText.Width / 2.0
            End If
            iSimgaUpperPos1 = iXPos - szText.Width / 2.0
            iSimgaUpperPos2 = iXPos + szText.Width / 2.0
            If ParentControl.IsViewSpecLimit = True Then
                g.DrawString(sValue, ParentControl.Font, New SolidBrush(CHART_SIGMA_LINE_COLOR), iXPos, iYPos + 5 + szText.Height * 2, fmtSigma)
            Else
                g.DrawString(sValue, ParentControl.Font, New SolidBrush(CHART_SIGMA_LINE_COLOR), iXPos, iYPos + 5 + szText.Height, fmtSigma)
            End If
        End If

        Return True
*/
	},
	
	onDestroy : function() {
		this.callParent(arguments);
	}
});