// JavaScript content copied from your script tag in the HTML (same as before)

let currentUser = null;

function register() {
  const username = document.getElementById('username').value;
  const password = btoa(document.getElementById('password').value);
  if (!username || !password) return showMessage("Fill in all fields.");

  const users = JSON.parse(localStorage.getItem('users') || '{}');
  if (users[username]) return showMessage("User already exists.");

  users[username] = { password, results: [] };
  localStorage.setItem('users', JSON.stringify(users));
  showMessage("Registered! You can now log in.");
}

function login() {
  const username = document.getElementById('username').value;
  const password = btoa(document.getElementById('password').value);
  const users = JSON.parse(localStorage.getItem('users') || '{}');

  if (!users[username] || users[username].password !== password) {
    return showMessage("Invalid username or password.");
  }

  currentUser = username;
  document.getElementById('auth').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('currentUser').textContent = username;
  resetDateRanges();
  loadResults();
}

function logout() {
  currentUser = null;
  document.getElementById('auth').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  showMessage('');
}

function showMessage(msg) {
  document.getElementById('authMessage').textContent = msg;
}

function createDateRange(withAddButton = false) {
  const div = document.createElement('div');
  div.className = 'date-range';

  const start = document.createElement('input');
  start.type = 'date';
  start.className = 'start-date';

  const end = document.createElement('input');
  end.type = 'date';
  end.className = 'end-date';

  function validateDates() {
    const startDate = new Date(start.value);
    const endDate = new Date(end.value);
    if (start.value && end.value && startDate > endDate) {
      alert("Start date cannot be after end date.");
      start.value = '';
    }
  }

  start.addEventListener('change', validateDates);
  end.addEventListener('change', validateDates);

  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Remove';
  removeBtn.onclick = () => {
    const allRanges = document.querySelectorAll('.date-range');
    if (allRanges.length > 1) {
      div.remove();
      updateAddButton();
    } else {
      alert("At least one date range is required.");
    }
  };

  div.appendChild(start);
  div.appendChild(end);
  div.appendChild(removeBtn);

  if (withAddButton) {
    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add';
    addBtn.className = 'add-btn';
    addBtn.onclick = () => {
      addBtn.remove();
      const newRange = createDateRange(true);
      document.getElementById('dateRanges').appendChild(newRange);
    };
    div.appendChild(addBtn);
  }

  return div;
}

function updateAddButton() {
  const ranges = document.querySelectorAll('.date-range');
  document.querySelectorAll('.add-btn').forEach(btn => btn.remove());
  if (ranges.length > 0) {
    const last = ranges[ranges.length - 1];
    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add';
    addBtn.className = 'add-btn';
    addBtn.onclick = () => {
      addBtn.remove();
      const newRange = createDateRange(true);
      document.getElementById('dateRanges').appendChild(newRange);
    };
    last.appendChild(addBtn);
  }
}

function countTotalDays() {
  const starts = document.querySelectorAll('.start-date');
  const ends = document.querySelectorAll('.end-date');
  let totalDays = 0;

  for (let i = 0; i < starts.length; i++) {
    const start = new Date(starts[i].value);
    const end = new Date(ends[i].value);
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      totalDays += Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }
  }

  document.getElementById('totalDays').textContent = 'Total Days: ' + totalDays;
  return totalDays;
}

function saveResult() {
  if (!currentUser) return;

  const starts = document.querySelectorAll('.start-date');
  const ends = document.querySelectorAll('.end-date');
  const ranges = [];

  for (let i = 0; i < starts.length; i++) {
    if (starts[i].value && ends[i].value) {
      ranges.push({ from: starts[i].value, to: ends[i].value });
    }
  }

  const total = countTotalDays();
  const users = JSON.parse(localStorage.getItem('users') || '{}');

  users[currentUser].results.push({
    id: Date.now(),
    total,
    ranges,
    savedAt: new Date().toLocaleString()
  });

  localStorage.setItem('users', JSON.stringify(users));
  loadResults();
}

function loadResults() {
  const container = document.getElementById('savedList');
  container.innerHTML = '';
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  const results = users[currentUser]?.results || [];

  results.forEach(result => {
    const div = document.createElement('div');
    div.className = 'saved-entry';

    const title = document.createElement('p');
    title.innerHTML = `<strong>${result.savedAt}</strong> — Total: ${result.total} days`;

    const ul = document.createElement('ul');
    result.ranges.forEach(r => {
      const li = document.createElement('li');
      li.textContent = `${r.from} → ${r.to}`;
      ul.appendChild(li);
    });

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => {
      resetDateRanges();
      const container = document.getElementById('dateRanges');
      container.innerHTML = '';
      result.ranges.forEach((r, i) => {
        const rangeDiv = createDateRange(i === result.ranges.length - 1);
        rangeDiv.querySelector('.start-date').value = r.from;
        rangeDiv.querySelector('.end-date').value = r.to;
        container.appendChild(rangeDiv);
      });
      document.getElementById('totalDays').textContent = 'Total Days: ' + result.total;
    };

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.onclick = () => {
      users[currentUser].results = results.filter(r => r.id !== result.id);
      localStorage.setItem('users', JSON.stringify(users));
      loadResults();
    };

    div.appendChild(title);
    div.appendChild(ul);
    div.appendChild(editBtn);
    div.appendChild(delBtn);

    container.appendChild(div);
  });
}

function resetDateRanges() {
  const container = document.getElementById('dateRanges');
  container.innerHTML = '';
  container.appendChild(createDateRange(true));
  document.getElementById('totalDays').textContent = 'Total Days: 0';
}

window.onload = () => {
  document.getElementById('auth').classList.remove('hidden');
};

document.addEventListener('DOMContentLoaded', function() {
    // Use more reliable date format (month is 0-indexed)
    const targetDate = new Date(2024, 4, 1); // May 1, 2024
    const timer = document.getElementById('timer');
    
    function updateCounter() {
        const currentDate = new Date();
        const difference = targetDate - currentDate;
        
        if (difference <= 0) {
            timer.innerHTML = "The event has started!";
            return;
        }
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        document.getElementById('days').innerHTML = days;
        document.getElementById('hours').innerHTML = hours;
        document.getElementById('minutes').innerHTML = minutes;
        document.getElementById('seconds').innerHTML = seconds;
    }
    
    updateCounter();
    setInterval(updateCounter, 1000);
});
