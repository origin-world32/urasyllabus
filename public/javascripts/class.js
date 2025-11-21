document.addEventListener('DOMContentLoaded', async () => {
  const addBtn = document.getElementById('addBtn');
  const formContainer = document.getElementById('addClassForm');
  const form = document.getElementById('classForm');

  let facultyData = {};
  try {
    const res = await fetch('/faculties');
    facultyData = await res.json();
  } catch (err) {
    console.error('学部データ取得失敗:', err);
  }

  const facultySelect = document.getElementById('facultySelect');
  const departmentSelect = document.getElementById('departmentSelect');

  // 1️⃣ bodyから検索された学部学科を取得
  const selectedFaculty = document.body.dataset.faculty;
  const selectedDepartment = document.body.dataset.department;

  // 2️⃣ 学部Selectを先に作成
  Object.keys(facultyData).forEach(fac => {
    const opt = document.createElement('option');
    opt.value = fac;
    opt.textContent = fac;
    facultySelect.appendChild(opt);
  });

  // 3️⃣ まず、学部の初期値をセット
  if (selectedFaculty) {
    facultySelect.value = selectedFaculty;
  }

  // 4️⃣ 学科リストを生成（学部初期値を反映）
  updateDepartmentSelect(facultySelect.value);

  // 5️⃣ 学科の初期値をセット
  if (selectedDepartment) {
    departmentSelect.value = selectedDepartment;
  }

  // 学科 select を更新する関数
  function updateDepartmentSelect(faculty) {
    departmentSelect.innerHTML = '<option value="">選択してください</option>';
    if (faculty && facultyData[faculty]) {
      facultyData[faculty].forEach(dep => {
        const opt = document.createElement('option');
        opt.value = dep;
        opt.textContent = dep;
        departmentSelect.appendChild(opt);
      });
    }
  }

  // 学部変更時に学科を更新
  facultySelect.addEventListener('change', () => {
    updateDepartmentSelect(facultySelect.value);
  });

  // フォーム表示切り替え
  addBtn.addEventListener('click', () => {
    formContainer.classList.toggle('hidden');
  });

  // フォーム送信処理
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const difficulty = parseInt(document.getElementById('difficultySelect').value);
    const satisfaction = parseInt(document.getElementById('satisfactionSelect').value);

    const newClass = {
      faculty: facultySelect.value.trim(),
      department: departmentSelect.value.trim(),
      title: document.getElementById('titleInput').value.trim(),
      teacher: document.getElementById('teacherInput').value.trim(),
      attendance: document.getElementById('attendance').value,
      description: document.getElementById('descriptionInput').value.trim()
    };

    // レビュー情報
    const review = {
      difficulty,
      satisfaction,
      review_date: new Date().toISOString().split('T')[0]
    };





    if (!newClass.faculty || !newClass.department || !newClass.title || !newClass.attendance || !newClass.teacher || !difficulty || !satisfaction) {
      alert('必須項目 * を入力してください。');
      return;
    }

    try {
      const response = await fetch('/class/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({newClass, review})
      });
      const result = await response.json();

      if (response.ok) {
        alert('授業を追加しました！');
        formContainer.classList.add('hidden');
        form.reset();
        window.location.reload();

      } else {
        alert(result.message || '追加に失敗しました。');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('サーバーとの通信に失敗しました。');
    }
  });
});
