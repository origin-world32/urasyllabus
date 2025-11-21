document.addEventListener('DOMContentLoaded', async () => {
  const addBtn = document.getElementById('addBtn');
  const formContainer = document.getElementById('addLabForm');
  const form = document.getElementById('LabForm');

  // 学部データを取得
  let facultyData = {};
  try {
    const res = await fetch('/faculties');
    facultyData = await res.json();
  } catch (err) {
    console.error('学部データ取得失敗:', err);
  }

  const facultySelect = document.getElementById('facultySelect');
  const departmentSelect = document.getElementById('departmentSelect');

  // 1️⃣ body の dataset から検索条件取得
  const selectedFaculty = document.body.dataset.faculty;
  const selectedDepartment = document.body.dataset.department;

  // 2️⃣ 学部 select を作成
  Object.keys(facultyData).forEach(fac => {
    const opt = document.createElement('option');
    opt.value = fac;
    opt.textContent = fac;
    facultySelect.appendChild(opt);
  });

  // 3️⃣ 学部の初期選択をセット
  if (selectedFaculty) {
    facultySelect.value = selectedFaculty;
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

  // 4️⃣ 学科リストを生成（学部の初期値を反映）
  updateDepartmentSelect(facultySelect.value);

  // 5️⃣ 学科の初期値をセット
  if (selectedDepartment) {
    departmentSelect.value = selectedDepartment;
  }

  // 学部変更時に学科更新
  facultySelect.addEventListener('change', () => {
    updateDepartmentSelect(facultySelect.value);
  });

  // フォーム表示/非表示
  addBtn.addEventListener('click', () => {
    formContainer.classList.toggle('hidden');
  });

  // フォーム送信処理
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const newData = {
      faculty: facultySelect.value.trim(),
      department: departmentSelect.value.trim(),
      title: document.getElementById('titleInput').value.trim(),
      teacher: document.getElementById('teacherInput').value.trim(),
      coretime: document.getElementById('coretimeInput').value.trim(),
      keyword: document.getElementById('keywordInput').value.trim(),
      description: document.getElementById('descriptionInput').value.trim(),
    };

    // 必須チェック
    if (!newData.faculty || !newData.department || !newData.title || !newData.teacher || !newData.coretime || !newData.keyword) {
      alert('必須項目 * を入力してください。');
      return;
    }

    try {
      const response = await fetch('/Lab/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      const result = await response.json();

      if (response.ok) {
        alert('研究室を追加しました！');
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
