function setupFacultyDepartment(facultyId, departmentId, departmentOptions) {
    const facultySelect = document.getElementById(facultyId);
    const departmentSelect = document.getElementById(departmentId);

    facultySelect.addEventListener("change", function() {
        const selectedFaculty = this.value;
        departmentSelect.innerHTML = '<option value="">学科を選択</option>';

        if (departmentOptions[selectedFaculty]) {
        departmentOptions[selectedFaculty].forEach(dep => {
            const option = document.createElement("option");
            option.value = dep;
            option.textContent = dep;
            departmentSelect.appendChild(option);
        });
        }
    });
}

fetch('/faculties')
.then(res => res.json())
.then(departmentOptions => {
    // 授業用
    setupFacultyDepartment("classFaculty", "classDepartment", departmentOptions);
    // 研究室用
    setupFacultyDepartment("labFaculty", "labDepartment", departmentOptions);
});