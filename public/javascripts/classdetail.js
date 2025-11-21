// class.ejsのadd-infoで複数評価ができないようにする仕組み
document.querySelectorAll('.add-info form').forEach(form => {
  form.addEventListener('submit', e => {
    const classId = form.dataset.classId;
    if (localStorage.getItem(`reviewed-${classId}`)) {
      e.preventDefault();
      alert('この授業はすでに評価済みです');
    } else {
      localStorage.setItem(`reviewed-${classId}`, 'true');
    }
  });
});
