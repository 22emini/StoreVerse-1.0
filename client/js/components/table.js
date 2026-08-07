/**
 * Data Table Component
 * Usage: Table.render(containerId, { columns, rows, searchable, onRowClick, emptyText, emptyIcon })
 */
const Table = {
  render(containerId, options) {
    const {
      columns = [],
      rows = [],
      searchable = true,
      onRowClick = null,
      emptyText = 'No data found',
      emptyIcon = '📋',
      actions = null,
      filterOptions = null,
      onFilter = null,
      onSearch = null,
    } = options;

    const container = document.getElementById(containerId);
    if (!container) return;

    let filteredRows = [...rows];

    const renderTable = (displayRows) => {
      let html = '<div class="data-table-wrapper">';

      // Toolbar
      if (searchable || filterOptions) {
        html += '<div class="data-table-toolbar">';
        if (searchable) {
          html += `<input type="text" class="input search-input" placeholder="Search..." id="${containerId}-search">`;
        }
        if (filterOptions || actions) {
          html += '<div class="filter-group">';
          if (filterOptions) {
            html += `<select class="select btn btn-sm" id="${containerId}-filter" style="height:32px;width:auto;">`;
            html += '<option value="">All</option>';
            filterOptions.forEach(opt => {
              html += `<option value="${opt.value}">${opt.label}</option>`;
            });
            html += '</select>';
          }
          if (actions) {
            html += actions;
          }
          html += '</div>';
        }
        html += '</div>';
      }

      // Table
      if (displayRows.length === 0) {
        html += `
          <div class="empty-state">
            <div class="empty-icon">${emptyIcon}</div>
            <div class="empty-title">${emptyText}</div>
            <div class="empty-text">Try adjusting your search or filters.</div>
          </div>`;
      } else {
        html += '<div style="overflow-x:auto;"><table class="data-table">';
        html += '<thead><tr>';
        columns.forEach(col => {
          html += `<th style="${col.width ? 'width:' + col.width : ''}">${col.label}</th>`;
        });
        html += '</tr></thead>';
        html += '<tbody>';
        displayRows.forEach((row, idx) => {
          const clickAttr = onRowClick ? `data-row-idx="${idx}" style="cursor:pointer"` : '';
          html += `<tr ${clickAttr}>`;
          columns.forEach(col => {
            const val = col.render ? col.render(row) : (row[col.key] ?? '—');
            html += `<td>${val}</td>`;
          });
          html += '</tr>';
        });
        html += '</tbody></table></div>';
      }

      // Footer
      html += `<div class="data-table-footer"><span>${displayRows.length} result${displayRows.length !== 1 ? 's' : ''}</span></div>`;
      html += '</div>';

      container.innerHTML = html;

      // Bind search
      const searchInput = document.getElementById(`${containerId}-search`);
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const q = e.target.value.toLowerCase();
          if (onSearch) {
            onSearch(q);
          } else {
            const filtered = rows.filter(row =>
              columns.some(col => {
                const v = row[col.key];
                return v && String(v).toLowerCase().includes(q);
              })
            );
            renderTable(filtered);
            // Re-focus and restore search value
            const newSearch = document.getElementById(`${containerId}-search`);
            if (newSearch) { newSearch.value = e.target.value; newSearch.focus(); }
          }
        });
      }

      // Bind filter
      const filterSelect = document.getElementById(`${containerId}-filter`);
      if (filterSelect && onFilter) {
        filterSelect.addEventListener('change', (e) => onFilter(e.target.value));
      }

      // Bind row clicks
      if (onRowClick) {
        container.querySelectorAll('tr[data-row-idx]').forEach(tr => {
          tr.addEventListener('click', () => {
            const idx = parseInt(tr.dataset.rowIdx);
            onRowClick(displayRows[idx], idx);
          });
        });
      }
    };

    renderTable(filteredRows);
  },
};

window.Table = Table;
