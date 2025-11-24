// ================= CONFIG =================
const API = "https://script.google.com/macros/s/AKfycbyB_S_dAbrabNpPtjF6MuVECoM_kGCefBRtNNeGk4iYIBYmh-Han2XyuciNy7dov9f8/exec";
// ================= STATE =================
let currentUser = 'she';

// ================= UTIL =================
async function postJSON(payload){
  try {
    console.log('🚀 Sending POST request:', payload);
    console.log('📡 URL:', API);
    
    const res = await fetch(API, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log('📨 Response status:', res.status);
    const text = await res.text();
    console.log('📄 Response text:', text);
    
    let data;
    try {
      data = JSON.parse(text);
      console.log('✅ Parsed response:', data);
    } catch (e) {
      console.error('❌ JSON parse error:', e);
      console.log('Raw response:', text);
      throw new Error('Invalid JSON response from server');
    }
    
    if (data && data.error) {
      throw new Error('Server error: ' + data.error);
    }
    
    return data;
  } catch (error) {
    console.error('❌ POST Error:', error);
    alert('Error: ' + error.message);
    return null;
  }
}

async function getJSON(q){ 
  try {
    const url = API + (q ? ('?' + q) : '');
    console.log('🔍 Fetching:', url);
    
    const res = await fetch(url);
    console.log('📨 GET Response status:', res.status);
    
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }
    
    const text = await res.text();
    console.log('📄 GET Response text:', text);
    
    const data = JSON.parse(text);
    console.log('✅ GET Parsed data:', data);
    return data;
  } catch (error) {
    console.error('❌ GET Error:', error);
    return null;
  }
}

function isoToday(){ return new Date().toISOString().slice(0,10); }
function escapeHtml(s){ 
  return String(s||'')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

// ================= DOM =================
const sheBtn = document.getElementById('sheBtn');
const heBtn = document.getElementById('heBtn');
const amountEl = document.getElementById('amount');
const typeEl = document.getElementById('type');
const categoryEl = document.getElementById('category');
const noteEl = document.getElementById('note');
const addEntryBtn = document.getElementById('addEntryBtn');
const quickDepositBtn = document.getElementById('quickDepositBtn');
const taskTitleEl = document.getElementById('taskTitle');
const taskDateEl = document.getElementById('taskDate');
const taskTimeEl = document.getElementById('taskTime');
const taskAssigneeEl = document.getElementById('taskAssignee');
const addTaskBtn = document.getElementById('addTaskBtn');
const sharedNoteEl = document.getElementById('sharedNote');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const clearNoteBtn = document.getElementById('clearNoteBtn');
const dailyTasksEl = document.getElementById('dailyTasks');
const completedTasksEl = document.getElementById('completedTasks');
const failedTasksEl = document.getElementById('failedTasks');
const entryListEl = document.getElementById('entryList');
const totalListEl = document.getElementById('totalList');
const streakEl = document.getElementById('streak');
const titleEl = document.getElementById('title');

// Set today's date as default for task date
taskDateEl.value = isoToday();

// ================= USER SWITCH =================
function setUser(u){
  currentUser = u;
  sheBtn.classList.toggle('active', u === 'she');
  heBtn.classList.toggle('active', u === 'he');
  titleEl.innerText = u === 'she' ? "She Meow's Cozy Space" : "He Meow's Cozy Space";
  loadAll();
}

sheBtn.onclick = ()=> setUser('she');
heBtn.onclick = ()=> setUser('he');

// ================= ACTION BUTTONS =================
addEntryBtn.onclick = async ()=>{
  const amount = parseFloat(amountEl.value);
  console.log('💰 Add Entry Clicked - Amount:', amount);
  
  if (!amount || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }
  
  const payload = {
    action: "addEntry",
    user: currentUser,
    amount: amount,
    type: typeEl.value,
    category: categoryEl.value,
    note: noteEl.value || ""
  };
  
  console.log('📤 Sending payload:', payload);
  
  const result = await postJSON(payload);

  if (result && result.ok) {
    console.log('✅ Entry added successfully');
    amountEl.value = "";
    noteEl.value = "";
    // Reload all data
    await loadAll();
    alert("✅ Entry added successfully!");
  } else {
    console.error('❌ Failed to add entry');
    alert("❌ Failed to add entry. Check console for details.");
  }
};

quickDepositBtn.onclick = async ()=>{
  const val = prompt("Deposit amount (BDT)");
  const amount = parseFloat(val);
  
  if (!amount || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  console.log('💰 Quick Deposit:', amount);
  
  const result = await postJSON({
    action: "addEntry",
    user: currentUser,
    type: "deposit",
    category: "Income",
    amount: amount,
    note: "Quick deposit"
  });

  if (result && result.ok) {
    console.log('✅ Deposit added successfully');
    await loadAll();
    alert("✅ Deposit added successfully!");
  } else {
    console.error('❌ Failed to add deposit');
    alert("❌ Failed to add deposit. Check console for details.");
  }
};

addTaskBtn.onclick = async ()=>{
  const title = taskTitleEl.value.trim();
  console.log('📝 Add Task Clicked - Title:', title);
  
  if (!title) {
    alert("Please enter a task title");
    return;
  }

  const payload = {
    action: "addTask",
    user: currentUser,
    title: title,
    date: taskDateEl.value || isoToday(),
    time: taskTimeEl.value || "",
    assignee: taskAssigneeEl.value
  };
  
  console.log('📤 Sending task payload:', payload);
  
  const result = await postJSON(payload);

  if (result && result.ok) {
    console.log('✅ Task added successfully');
    taskTitleEl.value = "";
    taskTimeEl.value = "";
    await loadTasks();
    alert("✅ Task added successfully!");
  } else {
    console.error('❌ Failed to add task');
    alert("❌ Failed to add task. Check console for details.");
  }
};

saveNoteBtn.onclick = async ()=>{
  console.log('💾 Save Note Clicked');
  
  const result = await postJSON({
    action: "addNote",
    user: currentUser,
    text: sharedNoteEl.value
  });
  
  if (result && result.ok) {
    console.log('✅ Note saved successfully');
    alert("✅ Note saved successfully!");
  } else {
    console.error('❌ Failed to save note');
    alert("❌ Failed to save note. Check console for details.");
  }
};

clearNoteBtn.onclick = async ()=>{
  if (!confirm("Are you sure you want to clear the note?")) return;
  
  console.log('🗑️ Clear Note Clicked');
  
  const result = await postJSON({
    action: "addNote",
    user: currentUser,
    text: ""
  });
  
  if (result && result.ok) {
    sharedNoteEl.value = "";
    console.log('✅ Note cleared successfully');
    alert("✅ Note cleared!");
  } else {
    console.error('❌ Failed to clear note');
    alert("❌ Failed to clear note. Check console for details.");
  }
};

// ================= LOADERS =================
async function loadEntries(){
  try {
    console.log('📊 Loading entries...');
    const data = await getJSON("action=getExpenses");
    entryListEl.innerHTML = "";
    totalListEl.innerHTML = "";
    
    if (!data || !Array.isArray(data)) {
      console.log('📭 No entries data received');
      entryListEl.innerHTML = "<div style='color:#aaa;padding:6px'>No entries yet</div>";
      totalListEl.innerHTML = "<div style='color:#aaa;padding:6px'>No entries yet</div>";
      return;
    }
    
    console.log(`📋 Loaded ${data.length} entries`);
    const rows = data.slice().reverse();

    // Last 12 entries
    if (rows.length === 0) {
      entryListEl.innerHTML = "<div style='color:#aaa;padding:6px'>No entries yet</div>";
    } else {
      rows.slice(0, 12).forEach(r => {
        const [tsISO, date, user, type, cat, amt, note] = r;
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `
          <div>
            <div class="item-note">${escapeHtml(note || cat)}</div>
            <div class="item-meta">${date} • ${user}</div>
          </div>
          <div style="text-align:right">
            <div class="item-amount ${type === 'deposit' ? 'deposit' : 'expense'}">
              ${type === 'deposit' ? '+' : '-'} ${amt} BDT
            </div>
          </div>
        `;
        entryListEl.appendChild(div);
      });
    }

    // All entries
    rows.forEach(r => {
      const [tsISO, date, user, type, cat, amt, note] = r;
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `
        <div>
          <div class="item-note">${escapeHtml(note || cat)}</div>
          <div class="item-meta">${date} • ${user}</div>
        </div>
        <div class="item-amount ${type === 'deposit' ? 'deposit' : 'expense'}">
          ${type === 'deposit' ? '+' : '-'} ${amt} BDT
        </div>
      `;
      totalListEl.appendChild(el);
    });
  } catch (error) {
    console.error('❌ Error loading entries:', error);
    entryListEl.innerHTML = "<div style='color:#ff6b6b;padding:6px'>Error loading entries</div>";
  }
}

async function loadTasks(){
  try {
    console.log('📝 Loading tasks...');
    const data = await getJSON("action=getTasks");
    dailyTasksEl.innerHTML = "";
    completedTasksEl.innerHTML = "";
    failedTasksEl.innerHTML = "";
    
    if (!data || !Array.isArray(data)) {
      console.log('📭 No tasks data received');
      dailyTasksEl.innerHTML = "<div style='color:#aaa;padding:6px'>No tasks loaded</div>";
      return;
    }

    console.log(`📋 Loaded ${data.length} tasks`);
    const today = isoToday();
    const daily = [], completed = [], failed = [];

    data.forEach(r => {
      const [tsISO, creator, title, completedFlg, date, time, assignee, status, completedAt] = r;
      
      if (date === today && status === "pending") daily.push(r);
      if (status === "completed" && date === today) completed.push(r);
      if (status === "failed") failed.push(r);
    });

    console.log(`📅 Today's tasks: ${daily.length} pending, ${completed.length} completed, ${failed.length} failed`);

    // Daily tasks
    if (daily.length === 0) {
      dailyTasksEl.innerHTML = "<div style='color:#aaa;padding:6px'>No tasks for today</div>";
    } else {
      daily.forEach(r => {
        const [tsISO, cr, title, comp, date, time, assignee] = r;
        const item = document.createElement('div');
        item.className = 'item';
        item.innerHTML = `
          <div>
            <div class="item-note">${escapeHtml(title)}</div>
            <div class="item-meta">Due ${time || 'any time'} • assigned to ${assignee}</div>
          </div>
          <div>
            <button class="task-btn done-btn">Done</button>
          </div>
        `;
        
        const doneBtn = item.querySelector('.done-btn');
        doneBtn.onclick = async () => {
          console.log('✅ Marking task as done:', tsISO);
          const result = await postJSON({ 
            action: "toggleTask", 
            timestamp: tsISO 
          });
          if (result && result.ok) {
            loadTasks();
          }
        };
        
        dailyTasksEl.appendChild(item);
      });
    }

    // Completed tasks
    if (completed.length === 0) {
      completedTasksEl.innerHTML = "<div style='color:#aaa;padding:6px'>No completed tasks today</div>";
    } else {
      completed.forEach(r => {
        const [, , title, , date, time, , status, doneAt] = r;
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `
          <div>
            <div class="item-note">${title}</div>
            <div class="item-meta">Completed: ${doneAt ? new Date(doneAt).toLocaleTimeString() : 'today'}</div>
          </div>
          <div class="item-amount">✓</div>
        `;
        completedTasksEl.appendChild(div);
      });
    }

    // Failed tasks
    if (failed.length === 0) {
      failedTasksEl.innerHTML = "<div style='color:#aaa;padding:6px'>No failed tasks</div>";
    } else {
      failed.forEach(r => {
        const [, , title, , date, time] = r;
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `
          <div>
            <div class="item-note">${title}</div>
            <div class="item-meta">Was due: ${date} ${time || ''}</div>
          </div>
          <div class="item-amount">✕</div>
        `;
        failedTasksEl.appendChild(div);
      });
    }
  } catch (error) {
    console.error('❌ Error loading tasks:', error);
    dailyTasksEl.innerHTML = "<div style='color:#ff6b6b;padding:6px'>Error loading tasks</div>";
  }
}

async function loadSummary(){
  try {
    console.log('📈 Loading summary...');
    const res = await getJSON("action=getSummary&user=" + currentUser);
    
    if (!res) {
      console.log('📭 No summary data received');
      document.getElementById('summaryDaily').innerText = "0 BDT";
      document.getElementById('summaryWeekly').innerText = "0 BDT";
      document.getElementById('summaryMonthly').innerText = "0 BDT";
      document.getElementById('summaryRemaining').innerText = "0 BDT";
      return;
    }

    console.log('📊 Summary loaded:', res);
    document.getElementById('summaryDaily').innerText = (res.daily || 0) + " BDT";
    document.getElementById('summaryWeekly').innerText = (res.weekly || 0) + " BDT";
    document.getElementById('summaryMonthly').innerText = (res.monthly || 0) + " BDT";
    document.getElementById('summaryRemaining').innerText = (res.remaining || 0) + " BDT";
  } catch (error) {
    console.error('❌ Error loading summary:', error);
  }
}

async function loadNotes(){
  try {
    console.log('📝 Loading notes...');
    const res = await getJSON("action=getNotes");
    if (!res || !Array.isArray(res)) {
      console.log('📭 No notes data received');
      return;
    }
    
    const last = res.length ? res[res.length - 1][2] : "";
    sharedNoteEl.value = last || "";
    console.log('💾 Note loaded:', last ? 'Yes' : 'No');
  } catch (error) {
    console.error('❌ Error loading notes:', error);
  }
}

async function loadAll(){
  console.log('🔄 Loading all data...');
  await Promise.all([ 
    loadEntries(), 
    loadTasks(), 
    loadSummary(), 
    loadNotes() 
  ]);
  console.log('✅ All data loaded');
}

// Auto refresh every 30 seconds
setInterval(loadAll, 30000);

// INITIAL LOAD
console.log('🚀 App starting...');
setUser('she');
loadAll();