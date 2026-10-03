const STORAGE_KEY = 'hp_inventory_v2';

const defaultDB = () => ({
  departments: [
    { id: 1, name: 'Marketing' },
    { id: 2, name: 'QA Testing' },
    { id: 3, name: 'IT' },
    { id: 4, name: 'Operasional' },
    { id: 5, name: 'Servis' },
  ],
  users: [
    {
      id: 'usr-1',
      user_code: 'EMP-001',
      name: 'Budi Santoso',
      role: 'Staff',
      departmentId: 1,
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-2',
      user_code: 'EMP-002',
      name: 'Sari Wijaya',
      role: 'QA Analyst',
      departmentId: 2,
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-3',
      user_code: 'EMP-003',
      name: 'Andi Pratama',
      role: 'Technician',
      departmentId: 3,
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ],
  devices: [
    {
      id: 'dev-1',
      barcode: '358912345678901',
      brand: 'Samsung',
      model: 'Galaxy A54',
      serial: 'SN-001',
      status: 'ready',
      userId: null,
      departmentId: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'dev-2',
      barcode: '358912345678902',
      brand: 'Apple',
      model: 'iPhone 14',
      serial: 'SN-002',
      status: 'assigned',
      userId: 'usr-1',
      departmentId: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'dev-3',
      barcode: '358912345678903',
      brand: 'Xiaomi',
      model: 'Redmi Note 12',
      serial: 'SN-003',
      status: 'repair',
      userId: null,
      departmentId: 5,
      createdAt: new Date().toISOString(),
    },
  ],
  transactions: [
    {
      id: 'trx-1',
      type: 'out',
      userId: 'usr-1',
      deviceId: 'dev-2',
      departmentId: 1,
      notes: 'Peminjaman untuk kebutuhan kerja',
      date: new Date().toISOString(),
    },
    {
      id: 'trx-2',
      type: 'repair',
      userId: 'usr-3',
      deviceId: 'dev-3',
      departmentId: 5,
      notes: 'Servis layar retak',
      date: new Date().toISOString(),
    },
  ],
  seq: {
    user: 4,
    device: 4,
    dept: 6,
    trx: 3,
  },
});

const state = {
  page: 'dashboard',
  db: loadDB(),
  theme: localStorage.getItem('hp_inventory_theme') || 'dark',
};

function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDB();
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.departments || !parsed.users || !parsed.devices || !parsed.transactions || !parsed.seq) {
      return defaultDB();
    }
    return parsed;
  } catch {
    return defaultDB();
  }
}

function saveDB() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.db));
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char]));
}

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function notify(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast show ${type}`;
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => {
    el.className = 'toast';
  }, 2200);
}

function getDeptName(id) {
  const d = state.db.departments.find((x) => x.id === Number(id));
  return d ? d.name : '-';
}

function getUserById(id) {
  return state.db.users.find((x) => String(x.id) === String(id));
}

function getDeviceById(id) {
  return state.db.devices.find((x) => String(x.id) === String(id));
}

function getStatusLabel(status) {
  const labels = {
    ready: 'Siap pakai',
    assigned: 'Dipinjam',
    repair: 'Servis',
    lost: 'Hilang',
  };
  return labels[status] || 'Tidak diketahui';
}

function getStatusTone(status) {
  const tones = {
    ready: 'green',
    assigned: 'blue',
    repair: 'orange',
    lost: 'red',
  };
  return tones[status] || 'gray';
}

function setPage(page) {
  state.page = page;
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });

  document.querySelectorAll('.page').forEach((section) => {
    section.classList.toggle('active', section.id === `page-${page}`);
    section.classList.toggle('hidden', section.id !== `page-${page}`);
  });

  const titles = {
    dashboard: ['Dashboard', 'Overview'],
    devices: ['Unit HP', 'Master data perangkat'],
    users: ['Karyawan', 'Daftar pegawai'],
    departments: ['Departemen', 'Struktur organisasi'],
    transactions: ['Transaksi', 'Riwayat peminjaman'],
    settings: ['Pengaturan', 'Backup, tema & data'],
  };

  const [title, eyebrow] = titles[page] || titles.dashboard;
  document.getElementById('pageTitle').textContent = title;
  document.getElementById('pageEyebrow').textContent = eyebrow;

  render();
}

function renderStats() {
  const totalDevices = state.db.devices.length;
  const totalUsers = state.db.users.length;
  const totalTransactions = state.db.transactions.length;
  const totalDepartments = state.db.departments.length;
  const ready = state.db.devices.filter((d) => d.status === 'ready').length;
  const assigned = state.db.devices.filter((d) => d.status === 'assigned').length;
  const repair = state.db.devices.filter((d) => d.status === 'repair').length;

  const cards = [
    { icon: '📱', label: 'Total Unit', value: totalDevices, sub: `${ready} siap pakai` },
    { icon: '👥', label: 'Karyawan', value: totalUsers, sub: `${totalDepartments} departemen` },
    { icon: '🧾', label: 'Transaksi', value: totalTransactions, sub: 'Aktivitas total' },
    { icon: '🏢', label: 'Departemen', value: totalDepartments, sub: `${assigned} dipinjam` },
  ];

  document.getElementById('statsGrid').innerHTML = cards.map((card, index) => `
    <div class="stat-card">
      <div class="stat-header">
        <span>${card.label}</span>
        <span class="stat-icon">${card.icon}</span>
      </div>
      <div class="stat-value">${card.value}</div>
      <div class="stat-sub">${card.sub}</div>
    </div>
  `).join('');

  const statusItems = [
    { label: 'Siap pakai', value: ready, color: 'green' },
    { label: 'Dipinjam', value: assigned, color: 'blue' },
    { label: 'Servis', value: repair, color: 'orange' },
  ];

  const total = Math.max(totalDevices || 1, 1);
  document.getElementById('statusSummary').innerHTML = statusItems.map((item) => {
    const pct = Math.round((item.value / total) * 100);
    return `
      <div class="status-row">
        <div class="label">${item.label}</div>
        <div class="progress"><span style="width:${pct}%;background:linear-gradient(90deg, var(--${item.color}), rgba(255,255,255,0.5));"></span></div>
        <strong>${item.value}</strong>
      </div>
    `;
  }).join('');

  const recent = [...state.db.transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const activityHtml = recent.length ? recent.map((tx) => {
    const user = getUserById(tx.userId);
    const device = getDeviceById(tx.deviceId);
    const tone = tx.type === 'out' ? 'assigned' : tx.type === 'repair' ? 'maintenance' : 'repair';
    return `
      <div class="activity-item">
        <span class="dot ${tone}"></span>
        <div class="activity-info">
          <strong>${escapeHtml(tx.type === 'out' ? 'Peminjaman' : tx.type === 'repair' ? 'Servis' : tx.type)}</strong>
          <small>${escapeHtml(device ? `${device.brand} ${device.model}` : 'Perangkat')} • ${escapeHtml(user ? user.name : 'Unknown')}</small>
        </div>
        <div class="activity-time">${formatDate(tx.date)}</div>
      </div>
    `;
  }).join('') : '<div class="empty-state">Belum ada aktivitas.</div>';

  document.getElementById('recentActivity').innerHTML = activityHtml;
}

function renderDevices() {
  const search = document.getElementById('deviceSearch')?.value || '';
  const filtered = state.db.devices.filter((device) => {
    const haystack = `${device.barcode || ''} ${device.brand || ''} ${device.model || ''} ${device.serial || ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const rows = filtered.length
    ? filtered.map((device) => {
        const user = getUserById(device.userId);
        const statusClass = getStatusTone(device.status);
        return `
          <tr>
            <td><strong>${escapeHtml(device.barcode || '-')}</strong></td>
            <td>${escapeHtml(device.brand || '-')}<br><small>${escapeHtml(device.model || '-')}</small></td>
            <td>${escapeHtml(device.serial || '-')}</td>
            <td><span class="badge ${statusClass}">${getStatusLabel(device.status)}</span></td>
            <td>${escapeHtml(user ? user.name : '-')}</td>
            <td>${formatDate(device.createdAt)}</td>
            <td>
              <div class="table-actions">
                <button class="small-btn" data-action="edit-device" data-id="${device.id}">Edit</button>
                <button class="small-btn danger" data-action="delete-device" data-id="${device.id}">Hapus</button>
              </div>
            </td>
          </tr>
        `;
      }).join('')
    : '<tr><td colspan="7"><div class="empty-state">Tidak ada data unit HP.</div></td></tr>';

  document.getElementById('devicesTable').innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Barcode</th>
            <th>Brand / Model</th>
            <th>Serial</th>
            <th>Status</th>
            <th>Pemilik</th>
            <th>Created</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderUsers() {
  const search = document.getElementById('userSearch')?.value || '';
  const filtered = state.db.users.filter((user) => {
    const haystack = `${user.user_code || ''} ${user.name || ''} ${user.role || ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const rows = filtered.length ? filtered.map((user) => `
    <tr>
      <td>${escapeHtml(user.user_code || '-')}</td>
      <td>${escapeHtml(user.name || '-')}</td>
      <td>${escapeHtml(user.role || '-')}</td>
      <td>${escapeHtml(getDeptName(user.departmentId))}</td>
      <td><span class="badge ${user.status === 'active' ? 'green' : 'gray'}">${user.status || 'active'}</span></td>
      <td>
        <div class="table-actions">
          <button class="small-btn" data-action="edit-user" data-id="${user.id}">Edit</button>
          <button class="small-btn danger" data-action="delete-user" data-id="${user.id}">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="6"><div class="empty-state">Belum ada data karyawan.</div></td></tr>';

  document.getElementById('usersTable').innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama</th>
            <th>Jabatan</th>
            <th>Departemen</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderDepartments() {
  const rows = state.db.departments.length ? state.db.departments.map((dept) => `
    <tr>
      <td>${dept.id}</td>
      <td>${escapeHtml(dept.name)}</td>
      <td>${state.db.users.filter((u) => Number(u.departmentId) === Number(dept.id)).length}</td>
      <td>
        <div class="table-actions">
          <button class="small-btn" data-action="edit-dept" data-id="${dept.id}">Edit</button>
          <button class="small-btn danger" data-action="delete-dept" data-id="${dept.id}">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="4"><div class="empty-state">Belum ada departemen.</div></td></tr>';

  document.getElementById('departmentsTable').innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Anggota</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderTransactions() {
  const search = document.getElementById('transactionSearch')?.value || '';
  const filtered = state.db.transactions.filter((tx) => {
    const device = getDeviceById(tx.deviceId);
    const user = getUserById(tx.userId);
    const haystack = `${tx.type || ''} ${device ? device.brand + ' ' + device.model : ''} ${user ? user.name : ''} ${tx.notes || ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const rows = filtered.length ? filtered.slice().reverse().map((tx) => {
    const device = getDeviceById(tx.deviceId);
    const user = getUserById(tx.userId);
    const label = tx.type === 'out' ? 'Keluar' : tx.type === 'repair' ? 'Servis' : tx.type;
    return `
      <tr>
        <td>${escapeHtml(tx.id)}</td>
        <td><span class="badge ${tx.type === 'out' ? 'blue' : 'orange'}">${label}</span></td>
        <td>${escapeHtml(device ? `${device.brand} ${device.model}` : '-')}</td>
        <td>${escapeHtml(user ? user.name : '-')}</td>
        <td>${escapeHtml(getDeptName(tx.departmentId || user?.departmentId))}</td>
        <td>${formatDate(tx.date)}</td>
        <td>${escapeHtml(tx.notes || '-')}</td>
      </tr>
    `;
  }).join('') : '<tr><td colspan="7"><div class="empty-state">Belum ada transaksi.</div></td></tr>';

  document.getElementById('transactionsTable').innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Jenis</th>
            <th>Device</th>
            <th>Pemegang</th>
            <th>Departemen</th>
            <th>Tanggal</th>
            <th>Catatan</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderSettings() {
  document.getElementById('backupInfo').textContent = 'Data disimpan di browser localStorage. Backup JSON bisa dipindahkan ke file lain.';
  const switchBtn = document.getElementById('themeSwitch');
  switchBtn.classList.toggle('active', state.theme === 'dark');
}

function render() {
  renderStats();
  renderDevices();
  renderUsers();
  renderDepartments();
  renderTransactions();
  renderSettings();
}

function openModal(title, contentHtml) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalContent').innerHTML = contentHtml;
  document.getElementById('modalBackdrop').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.add('hidden');
  document.getElementById('modalContent').innerHTML = '';
}

function openDeviceModal(data = null) {
  const item = data || {
    id: '',
    barcode: '',
    brand: '',
    model: '',
    serial: '',
    status: 'ready',
    userId: '',
    departmentId: '',
  };

  openModal(data ? 'Edit Unit HP' : 'Tambah Unit HP', `
    <div class="form-grid">
      <div class="form-field">
        <label>Barcode</label>
        <input id="f_barcode" value="${escapeHtml(item.barcode || '')}" />
      </div>
      <div class="form-field">
        <label>Brand</label>
        <input id="f_brand" value="${escapeHtml(item.brand || '')}" />
      </div>
      <div class="form-field">
        <label>Model</label>
        <input id="f_model" value="${escapeHtml(item.model || '')}" />
      </div>
      <div class="form-field">
        <label>Serial</label>
        <input id="f_serial" value="${escapeHtml(item.serial || '')}" />
      </div>
      <div class="form-field">
        <label>Status</label>
        <select id="f_status">
          <option value="ready" ${item.status === 'ready' ? 'selected' : ''}>Siap pakai</option>
          <option value="assigned" ${item.status === 'assigned' ? 'selected' : ''}>Dipinjam</option>
          <option value="repair" ${item.status === 'repair' ? 'selected' : ''}>Servis</option>
          <option value="lost" ${item.status === 'lost' ? 'selected' : ''}>Hilang</option>
        </select>
      </div>
      <div class="form-field">
        <label>Pemilik</label>
        <select id="f_userId">
          <option value="">- Pilih pemilik -</option>
          ${state.db.users.map((user) => `
            <option value="${user.id}" ${String(item.userId || '') === String(user.id) ? 'selected' : ''}>${escapeHtml(user.name)} (${escapeHtml(user.user_code)})</option>
          `).join('')}
        </select>
      </div>
      <div class="form-field">
        <label>Departemen</label>
        <select id="f_departmentId">
          <option value="">- Pilih departemen -</option>
          ${state.db.departments.map((dept) => `
            <option value="${dept.id}" ${String(item.departmentId || '') === String(dept.id) ? 'selected' : ''}>${escapeHtml(dept.name)}</option>
          `).join('')}
        </select>
      </div>
      <div class="form-field">
        <label>Catatan</label>
        <input id="f_notes" value="${escapeHtml(item.notes || '')}" />
      </div>
    </div>
    <div class="modal-actions">
      <button class="ghost-btn" type="button" id="cancelModalBtn">Batal</button>
      <button class="primary-btn" type="button" id="saveDeviceBtn">Simpan</button>
    </div>
  `);

  document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
  document.getElementById('saveDeviceBtn').addEventListener('click', () => {
    const payload = {
      barcode: document.getElementById('f_barcode').value.trim(),
      brand: document.getElementById('f_brand').value.trim(),
      model: document.getElementById('f_model').value.trim(),
      serial: document.getElementById('f_serial').value.trim(),
      status: document.getElementById('f_status').value,
      userId: document.getElementById('f_userId').value || null,
      departmentId: document.getElementById('f_departmentId').value || null,
      notes: document.getElementById('f_notes').value.trim(),
      createdAt: data ? data.createdAt : new Date().toISOString(),
    };

    if (!payload.barcode || !payload.brand || !payload.model) {
      notify('Barcode, brand, dan model wajib diisi.', 'error');
      return;
    }

    if (data) {
      const idx = state.db.devices.findIndex((d) => d.id === data.id);
      if (idx >= 0) state.db.devices[idx] = { ...state.db.devices[idx], ...payload };
    } else {
      state.db.devices.push({
        id: `dev-${state.db.seq.device++}`,
        ...payload,
      });
    }

    saveDB();
    closeModal();
    render();
    notify(data ? 'Unit HP diubah.' : 'Unit HP ditambah.', 'success');
  });
}

function openUserModal(data = null) {
  const item = data || {
    id: '',
    user_code: '',
    name: '',
    role: '',
    departmentId: '',
    status: 'active',
  };

  openModal(data ? 'Edit Karyawan' : 'Tambah Karyawan', `
    <div class="form-grid">
      <div class="form-field">
        <label>Kode karyawan</label>
        <input id="f_user_code" value="${escapeHtml(item.user_code || '')}" />
      </div>
      <div class="form-field">
        <label>Nama</label>
        <input id="f_name" value="${escapeHtml(item.name || '')}" />
      </div>
      <div class="form-field">
        <label>Jabatan</label>
        <input id="f_role" value="${escapeHtml(item.role || '')}" />
      </div>
      <div class="form-field">
        <label>Departemen</label>
        <select id="f_departmentId">
          ${state.db.departments.map((dept) => `
            <option value="${dept.id}" ${String(item.departmentId || '') === String(dept.id) ? 'selected' : ''}>${escapeHtml(dept.name)}</option>
          `).join('')}
        </select>
      </div>
      <div class="form-field">
        <label>Status</label>
        <select id="f_status">
          <option value="active" ${item.status === 'active' ? 'selected' : ''}>Aktif</option>
          <option value="inactive" ${item.status === 'inactive' ? 'selected' : ''}>Nonaktif</option>
        </select>
      </div>
    </div>
    <div class="modal-actions">
      <button class="ghost-btn" type="button" id="cancelModalBtn">Batal</button>
      <button class="primary-btn" type="button" id="saveUserBtn">Simpan</button>
    </div>
  `);

  document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
  document.getElementById('saveUserBtn').addEventListener('click', () => {
    const payload = {
      user_code: document.getElementById('f_user_code').value.trim(),
      name: document.getElementById('f_name').value.trim(),
      role: document.getElementById('f_role').value.trim(),
      departmentId: Number(document.getElementById('f_departmentId').value || 0),
      status: document.getElementById('f_status').value,
      createdAt: data ? data.createdAt : new Date().toISOString(),
    };

    if (!payload.user_code || !payload.name) {
      notify('Kode karyawan dan nama wajib diisi.', 'error');
      return;
    }

    if (data) {
      const idx = state.db.users.findIndex((u) => u.id === data.id);
      if (idx >= 0) state.db.users[idx] = { ...state.db.users[idx], ...payload };
    } else {
      state.db.users.push({ id: `usr-${state.db.seq.user++}`, ...payload });
    }

    saveDB();
    closeModal();
    render();
    notify(data ? 'Karyawan diubah.' : 'Karyawan ditambahkan.', 'success');
  });
}

function openDepartmentModal(data = null) {
  const item = data || { id: '', name: '' };

  openModal(data ? 'Edit Departemen' : 'Tambah Departemen', `
    <div class="form-field full">
      <label>Nama departemen</label>
      <input id="f_name" value="${escapeHtml(item.name || '')}" />
    </div>
    <div class="modal-actions">
      <button class="ghost-btn" type="button" id="cancelModalBtn">Batal</button>
      <button class="primary-btn" type="button" id="saveDeptBtn">Simpan</button>
    </div>
  `);

  document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
  document.getElementById('saveDeptBtn').addEventListener('click', () => {
    const name = document.getElementById('f_name').value.trim();
    if (!name) {
      notify('Nama departemen wajib diisi.', 'error');
      return;
    }

    if (data) {
      const idx = state.db.departments.findIndex((d) => d.id === data.id);
      if (idx >= 0) state.db.departments[idx].name = name;
    } else {
      state.db.departments.push({ id: state.db.seq.dept++, name });
    }

    saveDB();
    closeModal();
    render();
    notify(data ? 'Departemen diubah.' : 'Departemen baru ditambahkan.', 'success');
  });
}

function openTransactionModal(data = null) {
  const item = data || {
    id: '',
    type: 'out',
    userId: '',
    deviceId: '',
    departmentId: '',
    notes: '',
    date: new Date().toISOString(),
  };

  openModal(data ? 'Edit Transaksi' : 'Tambah Transaksi', `
    <div class="form-grid">
      <div class="form-field">
        <label>Jenis</label>
        <select id="f_type">
          <option value="out" ${item.type === 'out' ? 'selected' : ''}>Keluar</option>
          <option value="in" ${item.type === 'in' ? 'selected' : ''}>Masuk</option>
          <option value="repair" ${item.type === 'repair' ? 'selected' : ''}>Servis</option>
        </select>
      </div>
      <div class="form-field">
        <label>Tanggal</label>
        <input id="f_date" type="date" value="${new Date(item.date || new Date()).toISOString().slice(0, 10)}" />
      </div>
      <div class="form-field">
        <label>Device</label>
        <select id="f_deviceId">
          <option value="">- Pilih device -</option>
          ${state.db.devices.map((device) => `
            <option value="${device.id}" ${String(item.deviceId || '') === String(device.id) ? 'selected' : ''}>${escapeHtml(device.brand)} ${escapeHtml(device.model)} (${escapeHtml(device.barcode)})</option>
          `).join('')}
        </select>
      </div>
      <div class="form-field">
        <label>User</label>
        <select id="f_userId">
          <option value="">- Pilih user -</option>
          ${state.db.users.map((user) => `
            <option value="${user.id}" ${String(item.userId || '') === String(user.id) ? 'selected' : ''}>${escapeHtml(user.name)} (${escapeHtml(user.user_code)})</option>
          `).join('')}
        </select>
      </div>
      <div class="form-field">
        <label>Departemen</label>
        <select id="f_departmentId">
          <option value="">- Pilih departemen -</option>
          ${state.db.departments.map((dept) => `
            <option value="${dept.id}" ${String(item.departmentId || '') === String(dept.id) ? 'selected' : ''}>${escapeHtml(dept.name)}</option>
          `).join('')}
        </select>
      </div>
      <div class="form-field">
        <label>Catatan</label>
        <input id="f_notes" value="${escapeHtml(item.notes || '')}" />
      </div>
    </div>
    <div class="modal-actions">
      <button class="ghost-btn" type="button" id="cancelModalBtn">Batal</button>
      <button class="primary-btn" type="button" id="saveTransactionBtn">Simpan</button>
    </div>
  `);

  document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
  document.getElementById('saveTransactionBtn').addEventListener('click', () => {
    const payload = {
      type: document.getElementById('f_type').value,
      userId: document.getElementById('f_userId').value || null,
      deviceId: document.getElementById('f_deviceId').value || null,
      departmentId: Number(document.getElementById('f_departmentId').value || 0),
      notes: document.getElementById('f_notes').value.trim(),
      date: new Date(`${document.getElementById('f_date').value}T00:00:00`).toISOString(),
    };

    if (!payload.userId || !payload.deviceId) {
      notify('User dan device wajib dipilih.', 'error');
      return;
    }

    if (data) {
      const idx = state.db.transactions.findIndex((tx) => tx.id === data.id);
      if (idx >= 0) state.db.transactions[idx] = { ...state.db.transactions[idx], ...payload };
    } else {
      state.db.transactions.push({ id: `trx-${state.db.seq.trx++}`, ...payload });
    }

    saveDB();
    closeModal();
    render();
    notify(data ? 'Transaksi diperbarui.' : 'Transaksi ditambah.', 'success');
  });
}

function deleteDevice(id) {
  if (!confirm('Hapus perangkat ini?')) return;
  state.db.devices = state.db.devices.filter((d) => d.id !== id);
  state.db.transactions = state.db.transactions.filter((tx) => tx.deviceId !== id);
  saveDB();
  render();
  notify('Perangkat dihapus.', 'success');
}

function deleteUser(id) {
  if (!confirm('Hapus karyawan ini?')) return;
  state.db.users = state.db.users.filter((u) => u.id !== id);
  state.db.devices = state.db.devices.map((d) => d.userId === id ? { ...d, userId: null, status: 'ready' } : d);
  state.db.transactions = state.db.transactions.filter((tx) => tx.userId !== id);
  saveDB();
  render();
  notify('Karyawan dihapus.', 'success');
}

function deleteDepartment(id) {
  if (!confirm('Hapus departemen ini?')) return;
  state.db.departments = state.db.departments.filter((d) => d.id !== Number(id));
  state.db.users = state.db.users.map((user) => user.departmentId === Number(id) ? { ...user, departmentId: null } : user);
  saveDB();
  render();
  notify('Departemen dihapus.', 'success');
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(state.db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hp-inventory-backup.json';
  a.click();
  URL.revokeObjectURL(url);
  notify('Backup JSON berhasil diunduh.', 'success');
}

function restoreJSON(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed || !parsed.departments || !parsed.users || !parsed.devices || !parsed.transactions || !parsed.seq) {
        throw new Error('File bukan data inventory valid');
      }
      state.db = parsed;
      saveDB();
      render();
      notify('Data berhasil dipulihkan.', 'success');
    } catch (err) {
      notify('File tidak valid: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

function applyTheme(theme) {
  state.theme = theme;
  document.body.classList.toggle('light-mode', theme === 'light');
  localStorage.setItem('hp_inventory_theme', theme);
  document.getElementById('themeSwitch').classList.toggle('active', theme === 'dark');
}

function bindEvents() {
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => setPage(btn.dataset.page));
  });

  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  document.getElementById('themeSwitch').addEventListener('click', () => {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  document.getElementById('exportBtn').addEventListener('click', exportJSON);
  document.getElementById('backupBtn').addEventListener('click', exportJSON);
  document.getElementById('restoreInput').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) restoreJSON(file);
    e.target.value = '';
  });

  document.getElementById('addPrimaryBtn').addEventListener('click', () => {
    if (state.page === 'devices') openDeviceModal();
    else if (state.page === 'users') openUserModal();
    else if (state.page === 'departments') openDepartmentModal();
    else if (state.page === 'transactions') openTransactionModal();
    else openDeviceModal();
  });

  document.getElementById('addDeviceBtn').addEventListener('click', () => openDeviceModal());
  document.getElementById('addUserBtn').addEventListener('click', () => openUserModal());
  document.getElementById('addDepartmentBtn').addEventListener('click', () => openDepartmentModal());
  document.getElementById('addTransactionBtn').addEventListener('click', () => openTransactionModal());

  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  document.getElementById('modalBackdrop').addEventListener('click', (event) => {
    if (event.target === document.getElementById('modalBackdrop')) closeModal();
  });

  document.getElementById('deviceSearch').addEventListener('input', renderDevices);
  document.getElementById('userSearch').addEventListener('input', renderUsers);
  document.getElementById('transactionSearch').addEventListener('input', renderTransactions);

  document.addEventListener('click', (event) => {
    const actionBtn = event.target.closest('[data-action]');
    if (!actionBtn) return;
    const action = actionBtn.dataset.action;
    const id = actionBtn.dataset.id;

    if (action === 'edit-device') {
      const item = state.db.devices.find((d) => d.id === id);
      if (item) openDeviceModal(item);
    }

    if (action === 'delete-device') {
      deleteDevice(id);
    }

    if (action === 'edit-user') {
      const item = state.db.users.find((u) => u.id === id);
      if (item) openUserModal(item);
    }

    if (action === 'delete-user') {
      deleteUser(id);
    }

    if (action === 'edit-dept') {
      const item = state.db.departments.find((d) => String(d.id) === String(id));
      if (item) openDepartmentModal(item);
    }

    if (action === 'delete-dept') {
      deleteDepartment(id);
    }
  });
}

function init() {
  applyTheme(state.theme);
  bindEvents();
  setPage('dashboard');
  render();
}

document.addEventListener('DOMContentLoaded', init);
