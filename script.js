/* Shivving (IE8 is not supported, but at least it won't look as awful)
/* ========================================================================== */

(function (document) {
	var
	head = document.head = document.getElementsByTagName('head')[0] || document.documentElement,
	elements = 'article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output picture progress section summary time video x'.split(' '),
	elementsLength = elements.length,
	elementsIndex = 0,
	element;

	while (elementsIndex < elementsLength) {
		element = document.createElement(elements[++elementsIndex]);
	}

	element.innerHTML = 'x<style>' +
		'article,aside,details,figcaption,figure,footer,header,hgroup,nav,section{display:block}' +
		'audio[controls],canvas,video{display:inline-block}' +
		'[hidden],audio{display:none}' +
		'mark{background:#FF0;color:#000}' +
	'</style>';

	return head.insertBefore(element.lastChild, head.firstChild);
})(document);

/* Prototyping
/* ========================================================================== */

(function (window, ElementPrototype, ArrayPrototype, polyfill) {
	function NodeList() { [polyfill] }
	NodeList.prototype.length = ArrayPrototype.length;

	ElementPrototype.matchesSelector = ElementPrototype.matchesSelector ||
	ElementPrototype.mozMatchesSelector ||
	ElementPrototype.msMatchesSelector ||
	ElementPrototype.oMatchesSelector ||
	ElementPrototype.webkitMatchesSelector ||
	function matchesSelector(selector) {
		return ArrayPrototype.indexOf.call(this.parentNode.querySelectorAll(selector), this) > -1;
	};

	ElementPrototype.ancestorQuerySelectorAll = ElementPrototype.ancestorQuerySelectorAll ||
	ElementPrototype.mozAncestorQuerySelectorAll ||
	ElementPrototype.msAncestorQuerySelectorAll ||
	ElementPrototype.oAncestorQuerySelectorAll ||
	ElementPrototype.webkitAncestorQuerySelectorAll ||
	function ancestorQuerySelectorAll(selector) {
		for (var cite = this, newNodeList = new NodeList; cite = cite.parentElement;) {
			if (cite.matchesSelector(selector)) ArrayPrototype.push.call(newNodeList, cite);
		}

		return newNodeList;
	};

	ElementPrototype.ancestorQuerySelector = ElementPrototype.ancestorQuerySelector ||
	ElementPrototype.mozAncestorQuerySelector ||
	ElementPrototype.msAncestorQuerySelector ||
	ElementPrototype.oAncestorQuerySelector ||
	ElementPrototype.webkitAncestorQuerySelector ||
	function ancestorQuerySelector(selector) {
		return this.ancestorQuerySelectorAll(selector)[0] || null;
	};
})(this, Element.prototype, Array.prototype);

/* Helper Functions
/* ========================================================================== */

function generateTableRow() {
	var emptyColumn = document.createElement('tr');

	emptyColumn.innerHTML = '<td><a class="cut">-</a><span contenteditable></span></td>' +
		'<td><span contenteditable></span></td>' +
		'<td><span contenteditable></span></td>' +
		'<td><span data-prefix>₹</span><span contenteditable></span></td>' +
		'<td><span contenteditable></span></td>' +
		'<td><span data-prefix>₹</span><span></span></td>' +
		'<td><span data-prefix>&#8377;</span><span></span></td>' +
		'<td><span data-prefix>&#8377;</span><span></span></td>' +
		'<td><span data-prefix>₹</span><span></span></td>';
	return emptyColumn;
}

function parseFloatHTML(element) {
	return parseFloat(element.innerHTML.replace(/[^\d\.\-]+/g, '')) || 0;
}

function parsePrice(number) {
	return number.toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1,');
}

/* Update Number
/* ========================================================================== */

function updateNumber(e) {
	var
	activeElement = document.activeElement,
	value = parseFloat(activeElement.innerHTML),
	wasPrice = activeElement.innerHTML == parsePrice(parseFloatHTML(activeElement));

	if (!isNaN(value) && (e.keyCode == 38 || e.keyCode == 40 || e.wheelDeltaY)) {
		e.preventDefault();

		value += e.keyCode == 38 ? 1 : e.keyCode == 40 ? -1 : Math.round(e.wheelDelta * 0.025);
		value = Math.max(value, 0);

		activeElement.innerHTML = wasPrice ? parsePrice(value) : value;
	}

	updateInvoice();
}

/* Update Invoice
/* ========================================================================== */

function updateInvoice() {
	var total = 0;
	var totalCgstPrice = 0;
	var totalSgstPrice = 0;
	var totalTaxPrice  = 0;
	var totalProductQuantity  = 0;
	var cells, price, total, a, i, taxPrice, gst, totalCgstPrice, totalSgstPrice, totalTaxPrice, totalProductQuantity;

	// update inventory cells
	// ======================

	for (var a = document.querySelectorAll('table.inventory tbody.input_body tr'), i = 0; a[i]; ++i) {
		// get inventory row cells
		cells = a[i].querySelectorAll('span:last-child');

		// set price as cell[2] * cell[3]
		price = parseFloatHTML(cells[3]) * parseFloatHTML(cells[4]);

		// add price to total
		total += price;

		// set row total
		cells[5].innerHTML = price;

		// tax price 
		taxPrice = parseFloatHTML(cells[5]) / 1.18;
		cells[8].innerHTML = taxPrice;

		//gst calc
		gst = (price - taxPrice) / 2;
		cells[6].innerHTML = gst;
		cells[7].innerHTML = gst;

		//add cgst, sgst to totalCgst, total Sgst
		totalCgstPrice += (+cells[6].innerHTML);
		totalSgstPrice += (+cells[7].innerHTML);

		// add taxPrice to totalTaxPrice
		totalTaxPrice += parseFloatHTML(cells[8]);

		//add total quantity
		totalProductQuantity += parseFloatHTML(cells[4]);
	}


	//total body update
	let totalPriceCells = document.querySelectorAll('.totalPrice');
	totalPriceCells.forEach(ele => {
		ele.innerHTML = total;	
	});

	//total CGST
	let totalCgstCells = document.querySelectorAll('.totalCsgt');
	totalCgstCells.forEach(ele => {
		ele.innerHTML = totalCgstPrice;
	});

	//total SGST
	let totalSgstCells = document.querySelectorAll('.totalSgst');
	totalSgstCells.forEach(ele => {
		ele.innerHTML = totalSgstPrice;
	});

	//total body update
	let totalTaxAmountCells = document.querySelectorAll('.totalTaxAmount');
	totalTaxAmountCells.forEach(ele => {
		ele.innerHTML = totalTaxPrice;
	});

	//total quantity update
	let totalQuantity = document.querySelector('.totalQuantity');
	totalQuantity.innerHTML = totalProductQuantity;


	// update balance cells
	// ====================

	// get balance cells
	cells = document.querySelectorAll('table.balance td:last-child span:last-child');

	// set total
	cells[0].innerHTML = total;

	// set balance and meta balance
	/*cells[2].innerHTML = document.querySelector('table.meta tr:last-child td:last-child span:last-child').innerHTML = parsePrice(total - parseFloatHTML(cells[1]));*/

	// update prefix formatting
	// ========================

	//var prefix = document.querySelector('#prefix').innerHTML;
	//for (a = document.querySelectorAll('[data-prefix]'), i = 0; a[i]; ++i) a[i].innerHTML = prefix;

	// update price formatting
	// =======================

	for (a = document.querySelectorAll('span[data-prefix] + span'), i = 0; a[i]; ++i) if (document.activeElement != a[i]) a[i].innerHTML = parsePrice(parseFloatHTML(a[i]));
}

/* On Content Load
/* ========================================================================== */

function onContentLoad() {
	updateInvoice();

	var
	input = document.querySelector('input'),
	image = document.querySelector('img');

	function onClick(e) {
		var element = e.target.querySelector('[contenteditable]'), row;

		element && e.target != document.documentElement && e.target != document.body && element.focus();

		if (e.target.matchesSelector('.add')) {
			document.querySelector('table.inventory tbody').appendChild(generateTableRow());
		}
		else if (e.target.className == 'cut') {
			row = e.target.ancestorQuerySelector('tr');

			row.parentNode.removeChild(row);
		}

		updateInvoice();
	}

	function onEnterCancel(e) {
		e.preventDefault();

		image.classList.add('hover');
	}

	function onLeaveCancel(e) {
		e.preventDefault();

		image.classList.remove('hover');
	}

	function onFileInput(e) {
		image.classList.remove('hover');

		var
		reader = new FileReader(),
		files = e.dataTransfer ? e.dataTransfer.files : e.target.files,
		i = 0;

		reader.onload = onFileLoad;

		while (files[i]) reader.readAsDataURL(files[i++]);
	}

	function onFileLoad(e) {
		var data = e.target.result;

		image.src = data;
	}

	if (window.addEventListener) {
		document.addEventListener('click', onClick);

		document.addEventListener('mousewheel', updateNumber);
		document.addEventListener('keydown', updateNumber);

		document.addEventListener('keydown', updateInvoice);
		document.addEventListener('keyup', updateInvoice);

		input.addEventListener('focus', onEnterCancel);
		input.addEventListener('mouseover', onEnterCancel);
		input.addEventListener('dragover', onEnterCancel);
		input.addEventListener('dragenter', onEnterCancel);

		input.addEventListener('blur', onLeaveCancel);
		input.addEventListener('dragleave', onLeaveCancel);
		input.addEventListener('mouseout', onLeaveCancel);

		input.addEventListener('drop', onFileInput);
		input.addEventListener('change', onFileInput);
	}
}

let print_btn = document.querySelector('.print_btn');
print_btn.addEventListener('click', function(){
	window.print();
});

window.addEventListener && document.addEventListener('DOMContentLoaded', onContentLoad);
