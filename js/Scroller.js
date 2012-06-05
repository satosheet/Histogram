Ext.define('Ext.ux.Scroller', {
	extend : 'Ext.Component',
	
	alias : 'widget.textscroller',
	
	interval : 2000,
	
	initComponent : function() {
		this.callParent(arguments);
	},
	
	afterRender : function() {
		this.callParent(arguments);

		this.running = false;

		this.setData(this.data);
	},
	
	stop : function() {
		if(this._interval)
        	clearInterval(this.autoInterval);
	},
	
	start : function() {
		var self = this;
		this.stop();
		this._interval = setInterval(function() {
			self.scroll();
		}, this.interval);
	},
	
	getData : function() {
		return this._data || [];
	},
	
	setData : function(data) {
		this.stop();
		
		if(!data || !(data instanceof Array))
			data = [];
		
		this._data = Ext.clone(data);
		
		var cloned = Ext.clone(data);
		if(cloned.length > 0) {
			cloned.push(data[0]);
		}
		
		this.update(cloned);
		
		if(cloned.length < 2)
			return;

		this.current = 0;
		
		var el = this.getEl();
		this.div = el.down('div');
		this.ul = this.div.down('ul');
		var lis = this.ul.query('li');

		Ext.Array.each(lis, function(li) {
			li.style['overflow'] = 'hidden';
			li.style['float'] = 'none';
		}); 
		this.ul.setStyle({
			margin : '0',
			padding : '0',
			position : 'relative',
			'list_style-type' : 'none',
			'z-index' : '1'
		});
		this.div.setStyle({
			visibility : 'visible',
			overflow : 'hidden',
			position : 'relative',
			'z-index' : '2',
			left : '0px'
		});

		var li = lis[0];
		
		var liSize = li.offsetHeight + (parseInt(li.style['marginTop']) || 0) + (parseInt(li.style['marginBottom']) || 0);
        var ulSize = liSize * lis.length;
        var divSize = liSize;

		Ext.Array.each(lis, function(li) {
			li.style['width'] = li.offsetWidth;
			li.style['height'] = li.offsetHeight;
		}); 
		this.ul.setStyle({
			height : ulSize + 'px',
			top : 0
		});
		this.div.setStyle({
			height : divSize + 'px'
		});
		
		this.liHeight = liSize;

		el.hover(this.stop, this.start, this);
		
		this.start();
	},
	
	scroll : function() {
		if(this.data.length < 1)
			return;
		
		if(!this.running) {
			if(this.current >= this.data.length - 1) {
				this.current = 0;
				this.ul.setStyle('top', 0 + 'px')
			}
			this.current++;

			this.running = true;

			var sz = -(this.current * this.liHeight);

			this.ul.setY(sz, {
				duration : 500,
				easing : 'bounceOut',
				callback : function() {
					this.running = false;
				},
				scope : this
			});
		}
	},
	
	tpl : [
	'<div>',
	'<ul>',
	'<tpl for=".">',
	'<li>{text}</li>',
	'</tpl>',
	'</ul>',
	'</div>'
	]
	
});