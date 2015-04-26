(function(undefined) {

	var ns = (OM.dashboard = OM.dashboard || {}),
		MT = '', DIV = 'div';

	ns.ReportTable = Class.create({
		// these values need to match the css
		row_height:    16,
		header_height: 17,
		footer_height: 17,
		top_padding:   0,

		initialize: function initialize(o) {
			o = o || {};
			this.element  = o.element || new Element(DIV);
			this.content  = o.content || { header:false, main:false, footer:false };
			this.maxRows  = isNaN(o.maxRows) ? -1 : o.maxRows;
			this.height   = o.height || 0;

			return this.build();
		},

		build: function build() {
			this.element.widget = this;
			var table = [], content = this.content, height = this.height, max_rows;
			if (!content) { return this; }

			// handle custom reportlets
			if (typeof content === 'string') {
				this.element.addClassName('reportlet-html').update('<pre>' + content + '</pre>');
				return this;
			}
			if (content.type === 'iframe') { return this.buildIFrame(content); }
			
			if (content.type === 'html') {
				this.element.addClassName('reportlet-html').update(content.html);
				return this;
			}

			if (content.header && content.header.length) { height -= this.header_height * content.header.length; }
			if (content.footer && content.footer.length) { height -= this.footer_height * content.footer.length; }
			if (height < this.row_height) { return this; }
			max_rows = Math.max(~~(height / this.row_height), 0);
			if (this.maxRows >= 0) { max_rows = Math.min(max_rows, this.maxRows); }

			table.push('<div class="table', content.footer ? MT : ' no-footer', '">');
			if (content.header) { this.pushSection(table, 'head', content.header, content.header.length); }
			if (content.main)   { this.pushSection(table, MT,     content.main,   max_rows); }
			if (content.footer) { this.pushSection(table, 'foot', content.footer, content.footer.length); }
			table.push('</div>');

			this.element.addClassName('ReportTable').update(table.join(MT));
			this.footer = this.element.down('.foot');
			if (this.maxRows === 0 && this.footer) { this.footer.select('li').each(function(li) { li.style.borderTop = 'none'; }); }
			return this;
		},

		buildIFrame: function buildIFrame(content) {
			var html = content.html, supports = OM.supports,
				iframe = new Element('iframe', { src:'javascript:"";', security:'restricted', sandbox:'allow-forms allow-top-navigation', frameBorder:'0', scrolling:'no' });
			function onload() { iframe.contentWindow.document.write(html); }
			iframe.style.height = this.height + 'px';
			if (supports.data) { iframe.src = 'data:text/html;base64;charset=utf-8,' + Base64.encode(html); }
			else if (supports.onload) { iframe.onload = onload; }
			this.element.addClassName('reportlet-iframe').insert(iframe);
			if (!supports.data && !supports.onload) { setTimeout(onload, 0); }
			return this;
		},

		pushSection: function pushSection(table, cls, rows, max_rows) {
			var row, cell, i, j, k, l = Math.min(rows.length, max_rows);
			for (i = 0; i < l; ++i) {
				row = rows[i];
				table.push('<ol class="', cls, (cls || i ? MT : 'first'), '">');
				for (j = 0, k = row.length; j < k; ++j) {
					cell = row[j];
					var align = cell.align ? 'text-align:'+cell.align+';' : MT,
						after = cell.space_after ? 'padding-right:'+cell.space_after+'px;' : MT;
					table.push('<li style="width:', cell.width, 'px;', align, after, '" class="', cell.cls || MT, '">');
					this.pushContent(table, cell.content);
					table.push('</li>');
				}
				table.push('</ol>');
			}
			return this;
		},

		pushContent: function pushContent(table, content) {
			var v = content.value;
			if (content.type === 'image') { v.url && table.push('<img alt="" src="', v.url, '" />'); }
			else if (content.type === 'graph') {
				table.push('<div class="inline-graph" title="', v.text, '"><div><div style="background:', v.color, ';width:', v.percent, '%"></div></div></div>');
			}
			else if (content.type === 'social-post') {
				var text = (v.text||MT).replace(this.url_exp, this.url_link), date = new Date(v.date);
				
				// Convert the date to UTC if it exists.
				if (date)
                    date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());

				table.push('<div class="social-post">',
					(v.audience&&(v.audience.count>0) ? '<span class="audience">'+v.audience.count+' '+v.audience.name+'</span>' : MT),
					//TODO:  Restore the link once we can make it behave properly.
					//'<a class="title ', (v.provider.name||MT).toLowerCase(), '"', (v.author.url ? ' href="'+encodeURI(v.author.url)+'"' : MT), '>', v.author.name, '</a>',
                    '<a class="title ', (v.provider.name||MT).toLowerCase(), '">&nbsp;</a><span style="font-weight: bold">', v.author.name,'</span>',
					'<p title="', v.text, '"><span class="date">', +date ? date.toFormattedString('%a, %b %e %l:%M%p') : MT, '</span> ', text, '</p></div>');
			}
			else if (content.url) {
				table.push('<a title="', (content.o_value ? content.o_value.escapeHTML() : MT),
					'" href="', encodeURI(content.url), '">', v, '</a>');
			}
			else {
				if (content.o_value) { table.push('<span title="', content.o_value.escapeHTML(), '">'); }
				table.push((typeof v === 'string' && v.escapeHTML().replace(/&amp;nbsp;/g, '&nbsp;')) || '&nbsp;');
				if (content.o_value) { table.push('</span>'); }
			}
			return this;
		},

		url_exp: /\b((:?(:?https?|ftp|mailto):\/\/)?[a-z0-9.\-]+\.[a-z]{2,4}\/\S*)/ig,
		url_link: function(sub) {
			var url = sub, protocol = /^(?:https?|^ftp|^mailto):\/\//i;
			if (protocol.test(sub)) { sub = sub.replace(protocol, MT); }
			else { url = 'http://'+url; }
			return '<a class="external" onclick="window.open(\''+url+'\')">'+sub+'</a>';
		}
	});

	OM.Requirement.met('AP:dashboard.ReportTable');
})();
