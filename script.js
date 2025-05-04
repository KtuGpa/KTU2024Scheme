// Grade point mapping
const gradePoints = {
    'S': 10, 'A+': 9, 'A': 8.5, 'B+': 8, 'B': 7.5,
    'C+': 7, 'C': 6.5, 'D': 6, 'P': 5.5, 'F': 0
};

// Initialize like count from localStorage
let likeCount = localStorage.getItem('likeCount') ? parseInt(localStorage.getItem('likeCount')) : 0;

// Function to navigate to selected group
function navigateToGroup(group) {
    window.location.href = `group-${group}.html`;
}

// Function to update like count display
function updateLikeCountDisplay() {
    const likeCountElement = document.getElementById('like-count');
    if (likeCountElement) {
        likeCountElement.textContent = likeCount;
    }
}

// Function to toggle between grade and marks input
function toggleInputType(selectElement) {
    const row = selectElement.closest('tr');
    const gradeSelect = row.querySelector('.grade');
    const marksInput = row.querySelector('.marks');
    
    if (selectElement.value === 'grade') {
        gradeSelect.style.display = '';
        marksInput.style.display = 'none';
        marksInput.disabled = true;
    } else {
        gradeSelect.style.display = 'none';
        marksInput.style.display = '';
        marksInput.disabled = false;
        
        // If marks already has a value, update the grade
        if (marksInput.value && !isNaN(marksInput.value)) {
            updateGradeFromMarks(marksInput);
        }
    }
    calculateSGPA();
}

// Function to update grade based on marks
function updateGradeFromMarks(marksInput) {
    const marks = parseFloat(marksInput.value);
    let grade = marksToGrade(marks);
    
    // Update the grade select
    const gradeSelect = marksInput.closest('td').querySelector('.grade');
    if (gradeSelect) {
        gradeSelect.value = grade;
    }
}

// Function to convert marks to grade
function marksToGrade(marks) {
    if (marks >= 90) return 'S';
    if (marks >= 80) return 'A+';
    if (marks >= 70) return 'A';
    if (marks >= 60) return 'B+';
    if (marks >= 50) return 'B';
    if (marks >= 45) return 'C+';
    if (marks >= 40) return 'C';
    if (marks >= 35) return 'D';
    if (marks >= 30) return 'P';
    return 'F';
}

// Function to switch between semesters
function openSemester(semesterId) {
    // Hide all semester contents
    document.querySelectorAll('.semester-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show the selected semester content
    document.getElementById(semesterId).style.display = 'block';
    
    // Add active class to the clicked button
    event.currentTarget.classList.add('active');
    
    // Recalculate SGPA when switching semesters
    calculateSGPA();
}

// Function to calculate SGPA for a specific semester
function calculateSemesterSGPA(semesterId) {
    const semesterTable = document.getElementById(semesterId);
    if (!semesterTable) return 0;
    
    let totalCredits = 0;
    let totalGradePoints = 0;
    
    const courseRows = semesterTable.querySelectorAll('.course-table tbody tr');
    courseRows.forEach(row => {
        const credit = parseFloat(row.querySelector('.credit').textContent);
        const inputType = row.querySelector('.input-type').value;
        let grade;
        
        if (inputType === 'grade') {
            grade = row.querySelector('.grade').value;
        } else {
            const marksInput = row.querySelector('.marks');
            const marks = parseFloat(marksInput.value) || 0;
            grade = marksToGrade(marks);
        }
        
        if (grade in gradePoints) {
            totalCredits += credit;
            totalGradePoints += credit * gradePoints[grade];
        }
    });
    
    return totalCredits > 0 ? (totalGradePoints / totalCredits) : 0;
}

// Function to calculate and display SGPA for both semesters
function calculateSGPA() {
    const sgpa1 = calculateSemesterSGPA('sem1');
    const sgpa2 = calculateSemesterSGPA('sem2');
    
    const sgpaResult1 = document.getElementById('sgpa-result-sem1');
    const sgpaResult2 = document.getElementById('sgpa-result-sem2');
    
    if (sgpaResult1) sgpaResult1.textContent = sgpa1.toFixed(2);
    if (sgpaResult2) sgpaResult2.textContent = sgpa2.toFixed(2);
    
    calculateCGPA();
}

// Function to calculate CGPA
function calculateCGPA() {
    const sgpa1 = parseFloat(document.getElementById('sgpa-result-sem1')?.textContent) || 0;
    const sgpa2 = parseFloat(document.getElementById('sgpa-result-sem2')?.textContent) || 0;
    
    const cgpa = (sgpa1 + sgpa2) / 2;
    
    const cgpaResult = document.getElementById('cgpa-result');
    if (cgpaResult) {
        cgpaResult.textContent = `CGPA: ${cgpa.toFixed(2)}`;
    }
}

// Download as image functionality
function downloadAsImage() {
    const activeSemester = document.querySelector('.semester-content[style="display: block;"]') || 
                          document.querySelector('.semester-content:not([style])');
    
    if (!activeSemester) return;
    
    const container = activeSemester.querySelector('.download-container');
    
    if (!container) return;
    
    // Temporarily hide the download button to avoid capturing it
    const downloadBtn = document.getElementById('download-btn');
    const originalDisplay = downloadBtn.style.display;
    downloadBtn.style.display = 'none';
    
    html2canvas(container, {
        scale: 2,
        logging: false,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: container.scrollWidth,
        windowHeight: container.scrollHeight
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'ktu-semester-result.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        downloadBtn.style.display = originalDisplay;
    });
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize like count display
    updateLikeCountDisplay();
    
    // Set up event listeners for input type changes
    document.querySelectorAll('.input-type').forEach(input => {
        input.addEventListener('change', function() {
            toggleInputType(this);
        });
    });
    
    // Set up event listeners for grade changes
    document.querySelectorAll('.grade').forEach(grade => {
        grade.addEventListener('change', calculateSGPA);
    });
    
    // Set up event listeners for marks input
    document.querySelectorAll('.marks').forEach(marks => {
        marks.addEventListener('input', function() {
            if (this.disabled) return;
            updateGradeFromMarks(this);
            calculateSGPA();
        });
    });
    
    // Set up semester tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const semesterId = this.getAttribute('data-semester');
            openSemester(semesterId);
        });
    });
    
    // Set up download button
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadAsImage);
    }
    
    // Set up like button (with removal of previous listener first)
    const likeBtn = document.getElementById('like-btn');
    if (likeBtn) {
        likeBtn.removeEventListener('click', incrementLike); // Remove if it exists
        likeBtn.addEventListener('click', incrementLike);
    }
    
    // Set up CGPA button
    const cgpaBtn = document.getElementById('cgpa-btn');
    if (cgpaBtn) {
        cgpaBtn.addEventListener('click', calculateCGPA);
    }
    
    // Calculate initial SGPA/CGPA
    calculateSGPA();
});
