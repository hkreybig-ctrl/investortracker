// static/app.js - connect to SSE and update filings table live
(function(){
  const status = document.getElementById('statusBar');
  const tableBody = document.querySelector('#filingsTable tbody');
  const clearBtn = document.getElementById('clearBtn');

  function setStatus(text, cls){
    status.textContent = text;
    status.className = 'status ' + (cls||'');
  }

  function rowHtml(f){
    const date = f.reported_date || '';
    const person = f.person || '';
    const ticker = f.ticker || '';
    const side = f.side || '';
    const amt = f.amount || '';
    const source = f.source || '';
    return `<tr>
      <td>${escapeHtml(date)}</td>
      <td>${escapeHtml(person)}</td>
      <td>${escapeHtml(ticker)}</td>
      <td>${escapeHtml(side)}</td>
      <td>${escapeHtml(amt)}</td>
      <td>${escapeHtml(source)}</td>
      <td><button class="btn-mini" onclick="replicate('${escapeHtml(ticker)}')">Replicate</button></td>
    </tr>`;
  }

  window.replicate = function(ticker){
    if(!ticker) return alert('No ticker available to replicate.');
    // Placeholder: you can wire this to a broker or show step-by-step replication guidance
    alert('To replicate: consider amount sizing, risk management. Ticker: ' + ticker);
  };

  function escapeHtml(s){
    return (s+'').replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
  }

  // SSE connection
  let es;
  function connect(){
    es = new EventSource('/events');
    es.onopen = () => setStatus('Live: Connected');
    es.onerror = (e) => setStatus('Disconnected — retrying...', 'muted');
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        if(payload.type === 'hello'){
          console.debug('Server hello', payload);
        } else if(payload.type === 'new_filings'){
          const arr = payload.data || [];
          // prepend rows
          arr.forEach(f => {
            const el = document.createElement('tbody');
            el.innerHTML = rowHtml(f);
            // insert at top
            tableBody.insertBefore(el.firstElementChild, tableBody.firstChild);
          });
          setStatus('Live: updated ' + arr.length + ' new filings', 'live');
        }
      } catch (err){
        console.warn('SSE parse error', err);
      }
    };
  }

  connect();

  // Clear selection helper
  if(clearBtn){
    clearBtn.addEventListener('click', ()=> {
      document.querySelectorAll('input[name="selected"]').forEach(cb => cb.checked = false);
    });
  }

})();
