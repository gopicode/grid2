const ALPHA = 64

const Sheet = {
	init: function($root) {
		this.rowCount = sample.data.length;
		this.colCount = sample.data[0].length;

		const markup = '<table class="table2"><tbody></tbody></table>';
		$root.innerHTML = markup;
		this.$table = $root.querySelector('.table2');

		this.$colMenu = document.getElementById('menu-col')
		this.$rowMenu = document.getElementById('menu-row')

		let $row = this.$table.insertRow(-1)
		$row.className = 'row'
		let $cell = $row.insertCell(0)
		$cell.className = 'colhead'
		$cell.setAttribute('data-col', 0)
		$cell.textContent = ''

		for (let j = 1; j <= this.colCount; j += 1) {
			let $cell = $row.insertCell(j)
			$cell.className = 'colhead'
			$cell.setAttribute('data-col', j)
			$cell.textContent = String.fromCharCode(ALPHA + j)
		}

		for (let i = 1; i <= this.rowCount; i += 1) {
			let $row = this.$table.insertRow(-1)
			$row.className = 'row'
			this.buildRow($row, i)
		}

		this.initEvents($root)
		this.fillSample()
	},

	initEvents: function($root) {
		document.addEventListener('click', this.onDocumentClick.bind(this))
		document.getElementById('append-rows').addEventListener('click', this.appendRows.bind(this))
		document.getElementById('append-cols').addEventListener('click', this.appendCols.bind(this))
	},

	onDocumentClick: function(e) {
		const dx = 8, dy = 8;
		const $elem = e.target;
		if ($elem.classList.contains('colhead')) {
			const rect = $elem.getBoundingClientRect()
			this.colIndex = +$elem.getAttribute('data-col')
			this.$colMenu.style.left = (rect.left + dx) + 'px'
			this.$colMenu.style.top = (rect.top + dy) + 'px'
			this.$colMenu.classList.remove('hide')
		}
		else if ($elem.classList.contains('rowhead')) {
			const rect = $elem.getBoundingClientRect()
			this.rowIndex = +$elem.getAttribute('data-row')
			this.$rowMenu.style.left = (rect.left + dx) + 'px'
			this.$rowMenu.style.top = (rect.top + dy) + 'px'
			this.$rowMenu.classList.remove('hide')
			const $row = this.$table.rows[this.rowIndex]
			$row.classList.add('high')
		}
		else if (this.$colMenu.contains($elem)) {
			const action = $elem.getAttribute('data-action')
			this.$colMenu.classList.add('hide')
			this.colAction(action)
		}
		else if (this.$rowMenu.contains($elem)) {
			const action = $elem.getAttribute('data-action')
			this.$rowMenu.classList.add('hide')
			const $row = this.$table.rows[this.rowIndex]
			$row.classList.remove('high')
			this.rowAction(action)
		}
		else {
			this.$colMenu.classList.add('hide')
			this.$rowMenu.classList.add('hide')
			const $row = this.$table.rows[this.rowIndex]
			if ($row) $row.classList.remove('high')
		}
	},

	onCellFocus: function(event) {
		const $elem = event.target
		const $cell = $elem.parentNode;
		const pos = $cell.getAttribute('data-pos').split(':')
		const i = +pos[0]
		const j = +pos[1]
		document.getElementById('txt-address').textContent = String.fromCharCode(ALPHA + j) + i
		document.getElementById('txt-value').textContent = $elem.value || ' '
	},

	rowAction: function(action) {
		const index = this.rowIndex;
		const $rows = this.$table.rows;

		if (action === "delete") {
			// update the positions of the remaining rows
			for (let k = index + 1; k < this.rowCount; k += 1) {
				const $row = $rows[k]
				let i = k - 1
				for (let j = 0; j < this.colCount; j += 1) {
					const $cell = $row.childNodes[j]
					if (j == 0) {
						$cell.setAttribute('data-row', i)
						$cell.textContent = i
					} else {
						$cell.setAttribute('data-pos', [i, j].join(':'))
					}
				}
			}
			// delete the row
			const $row = $rows[index]
			$row.parentNode.removeChild($row)
			// decrease row count
			this.rowCount -= 1
		} else if (action === "insert-above") {
			// update the positions of the remaining rows
			for (let k = index; k < this.rowCount; k += 1) {
				const $row = $rows[k]
				let i = k + 1
				for (let j = 0; j < this.colCount; j += 1) {
					const $cell = $row.childNodes[j]
					if (j == 0) {
						$cell.setAttribute('data-row', i)
						$cell.textContent = i
					} else {
						$cell.setAttribute('data-pos', [i, j].join(':'))
					}
				}
			}
			// insert the new row
			const i = index
			const $row = this.$table.insertRow(i)
			this.buildRow($row, i)
			// increase row count
			this.rowCount += 1
		} else if (action === "insert-below") {
			// update the positions of the remaining rows
			for (let k = index + 1; k < this.rowCount; k += 1) {
				const $row = $rows[k]
				let i = k + 1
				for (let j = 0; j < this.colCount; j += 1) {
					const $cell = $row.childNodes[j]
					if (j == 0) {
						$cell.setAttribute('data-row', i)
						$cell.textContent = i
					} else {
						$cell.setAttribute('data-pos', [i, j].join(':'))
					}
				}
			}
			// insert the new row
			const i = index + 1
			const $row = this.$table.insertRow(i)
			this.buildRow($row, i)
			// increase row count
			this.rowCount += 1
		}
	},

	colAction: function(action) {
		const index = this.colIndex;
		const $rows = this.$table.rows;

		if (action === "delete") {
			Array.from($rows).forEach(($row, i) => {
				// update the positions of the remaining cells
				for (let j = index; j < this.colCount - 1; j += 1) {
					const $cell = $row.childNodes[j + 1]
					if (i == 0) {
						$cell.setAttribute('data-col', j)
						$cell.textContent = String.fromCharCode(ALPHA + j)
					} else {
						$cell.setAttribute('data-pos', [i, j].join(':'))
					}
				}
				// delete the cell
				const $cell = $row.childNodes[index]
				$row.removeChild($cell)
			})
			// decrease column count
			this.colCount -= 1
		} else if (action === "sort-az") {
			const list = this.getDataList()
			list.sort(($a, $b) => $a[index] > $b[index] ? 1 : -1)
			this.setDataList(list)
		} else if (action === "sort-za") {
			const list = this.getDataList()
			list.sort(($a, $b) => $a[index] > $b[index] ? -1 : 1)
			this.setDataList(list)
		} else if (action === "insert-back") {
			Array.from($rows).forEach(($row, i) => {
				// update the positions of the remaining cells
				for (let k = index; k < this.colCount; k += 1) {
					const $cell = $row.childNodes[k]
					const j = k + 1
					if (i == 0) {
						$cell.setAttribute('data-col', j)
						$cell.textContent = String.fromCharCode(ALPHA + j)
					} else {
						$cell.setAttribute('data-pos', [i, j].join(':'))
					}
				}
				// insert cell
				let j = index
				const $cell = $row.insertCell(j)
				if (i == 0) {
					$cell.className = 'colhead'
					$cell.setAttribute('data-col', j)
					$cell.textContent = String.fromCharCode(ALPHA + j)
				} else {
					$cell.className = 'cell'
					$cell.setAttribute('data-pos', [i, j].join(':'))
					$cell.innerHTML = this.buildInput();
				}
			})
			// increase column count
			this.colCount += 1
		} else if (action === "insert-next") {
			Array.from($rows).forEach(($row, i) => {
				// update the positions of the remaining cells
				for (let k = index + 1; k < this.colCount; k += 1) {
					const $cell = $row.childNodes[k]
					const j = k + 1
					if (i == 0) {
						$cell.setAttribute('data-col', j)
						$cell.textContent = String.fromCharCode(ALPHA + j)
					} else {
						$cell.setAttribute('data-pos', [i, j].join(':'))
					}
				}
				// insert cell
				let j = index + 1
				const $cell = $row.insertCell(j)
				if (i == 0) {
					$cell.className = 'colhead'
					$cell.setAttribute('data-col', j)
					$cell.textContent = String.fromCharCode(ALPHA + j)
				} else {
					$cell.className = 'cell'
					$cell.setAttribute('data-pos', [i, j].join(':'))
					$cell.innerHTML = this.buildInput();
				}
			})
			// increase column count
			this.colCount += 1
		}
	},

	buildInput: function() {
		return '<input class="txt" type="text" onfocus="Sheet.onCellFocus(event)" />'
	},

	buildCell: function($row, i, j) {
		const $cell = $row.insertCell(j)
		if (i === 0) {
			$cell.className = 'colhead'
			$cell.setAttribute('data-col', j)
			$cell.textContent = String.fromCharCode(ALPHA + j)
		} else {
			if (j === 0) {
				$cell.className = 'rowhead'
				$cell.setAttribute('data-row', i)
				$cell.textContent = i;
			} else {
				$cell.className = 'cell'
				$cell.setAttribute('data-pos', [i, j].join(':'))
				$cell.innerHTML = this.buildInput();
			}
		}
	},

	buildRow: function($row, i) {
		for (let j = 0; j <= this.colCount; j += 1) {
			this.buildCell($row, i, j)
		}
	},

	appendRows: function() {
		const count = +document.getElementById('row-count').value
		for (let i = (this.rowCount + 1); i <= (this.rowCount + count); i += 1) {
			let $row = this.$table.insertRow(-1)
			$row.className = 'row'
			this.buildRow($row, i)
		}
		this.rowCount += count;
	},

	appendCols: function() {
		const count = +document.getElementById('col-count').value
		const $rows = this.$table.rows;
		for (let i = 0, n = $rows.length; i < n; i += 1) {
			const $row = $rows[i]
			for (let j = (this.colCount + 1); j <= (this.colCount + count); j += 1) {
				this.buildCell($row, i, j)
			}
		}
		this.colCount += count;
	},

	getDataList: function() {
		const $rows = this.$table.rows
		const list = []
		Array.from($rows).forEach(($row, i) => {
			if (i === 0) return;
			list[i] = []
			Array.from($row.childNodes).forEach(($cell, j) => {
				if (j === 0) return;
				list[i][j] = $cell.querySelector('input').value
			})
		})
		return list
	},

	setDataList: function(list) {
		const $rows = this.$table.rows
		list.forEach((values, i) => {
			if (i === 0) return;
			const $row = $rows[i]
			values.forEach((value, j) => {
				if (j === 0) return;
				$cell = $row.childNodes[j]
				$cell.querySelector('input').value = value
			})
		})
	},

	fillSample: function() {
		sample.data.forEach((list, k) => {
			const i = k + 1;
			const $row = this.$table.rows[i];
			list.forEach((item, m) => {
				const j = m + 1;
				const $cell = $row.childNodes[j]
				const $input = $cell.querySelector('input')
				$input.value = item
			})
		})
	}
}

const $root = document.getElementById('root')
Sheet.init($root)
