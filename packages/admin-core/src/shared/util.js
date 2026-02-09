const reloadFrame = (frame = 'bflex-custom-tables') => {
  // todo: have a problem with cancelled requests
  if (globalThis.window && window.Turbo) {
    window.Turbo.visit(window.location.href, { frame, action: 'replace' })
  }
}

function formatMoney(cents, currencyCode = 'USD') {
  const amount = cents / 100;

  try {
    // Пытаемся использовать встроенное форматирование
    const formatter = new Intl.NumberFormat(window.navigator.language, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return formatter.format(amount);
  } catch (e) {
    // Fallback
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

const htmlFormatMoney = (money = 0, currency = 'USD', className = '', showFraction = true) => {
  const parts = formatMoney(money, currency)
  let result = ''

  parts.forEach((part) => {
    if (part.type === 'currency') {
      result += `<span class="${className}">${part.value}</span>`
    }

    if (part.type === 'literal') {
      result += `${part.value}`
    }

    if (part.type === 'integer') {
      result += `${part.value}`
    }

    if (showFraction && part.type === 'decimal') {
      result += `${part.value}`
    }

    if (showFraction && part.type === 'fraction') {
      result += `${part.value}`
    }
  })

  return result
}

function getLocalDateFromOffset(offsetStr) {
  const [sign, hours, minutes] = offsetStr.match(/([+-])(\d{1,2}):(\d{2})/).slice(1)
  const offsetMinutes = (parseInt(hours, 10) * 60 + parseInt(minutes, 10)) * (sign === '+' ? 1 : -1)

  const now = new Date()
  const localTimestamp = now.getTime() + offsetMinutes * 60 * 1000
  const localDate = new Date(localTimestamp)

  const year = localDate.getFullYear()
  const month = String(localDate.getMonth() + 1).padStart(2, '0')
  const day = String(localDate.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}` // 'YYYY-MM-DD'
}

function formatDateShort(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short'
  });
}

/**
 * Reinitialize WordPress List Table toggle functionality after Turbo Frame load
 * WordPress uses jQuery to handle row actions toggle in mobile view, but these
 * event handlers are lost after Turbo Frame replaces the table content.
 */
function reinitializeWpListTable() {
  if (!window.jQuery) {
    console.warn('jQuery not available for WP List Table reinitialization');
    return;
  }

  const $ = window.jQuery;

  // Find all WP list tables in the document
  const $tables = $('.wp-list-table');

  if ($tables.length === 0) {
    return;
  }

  // Remove old event handlers to prevent duplicates
  $tables.off('click', '.toggle-row');

  // Reattach toggle row event handler (mobile row actions)
  $tables.on('click', '.toggle-row', function(e) {
    e.preventDefault();
    const $row = $(this).closest('tr');
    $row.toggleClass('is-expanded');
  });

  // Ensure mobile toggle buttons have proper attributes
  $tables.find('tbody tr').each(function() {
    const $row = $(this);
    const $toggleButton = $row.find('.toggle-row');

    // If toggle button doesn't exist but should (mobile view), create it
    if ($toggleButton.length === 0 && $row.find('.row-actions').length > 0) {
      const rowId = $row.attr('id') || '';
      const toggleHtml = `<button type="button" class="toggle-row"><span class="screen-reader-text">Show more details</span></button>`;

      // Add toggle button to the primary column
      const $primaryColumn = $row.find('.column-primary');
      if ($primaryColumn.length > 0 && !$primaryColumn.find('.toggle-row').length) {
        $primaryColumn.append(toggleHtml);
      }
    }
  });

  console.log('WordPress List Table reinitialized');
}

export { reloadFrame, formatMoney, htmlFormatMoney, getLocalDateFromOffset, formatDateShort, reinitializeWpListTable }
