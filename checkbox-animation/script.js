// Team Members data
const teamMembers = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
  { id: '4', name: 'Diana' }
];

// DOM elements
const singleCheckbox = document.querySelector('.checkbox-section:first-of-type input[type="checkbox"]');
const selectAllCheckbox = document.querySelector('.select-all-input');
const memberCheckboxes = document.querySelectorAll('.member-checkbox');
const noSelected = document.querySelector('.no-selected');
const selectedList = document.querySelector('.selected-list');

// Handle single checkbox state changes
singleCheckbox.addEventListener('change', function() {
  const checkbox = this;
  const customCheckbox = checkbox.nextElementSibling;
  const checkmark = customCheckbox.querySelector('.checkmark');
  
  if (checkbox.checked) {
    checkmark.classList.remove('hidden');
  } else {
    checkmark.classList.add('hidden');
  }
});

// Handle select all checkbox
selectAllCheckbox.addEventListener('change', function() {
  const isChecked = this.checked;
  const selectAllCustomCheckbox = this.nextElementSibling;
  const checkmark = selectAllCustomCheckbox.querySelector('.checkmark');
  const indeterminateIndicator = selectAllCustomCheckbox.querySelector('.indeterminate-indicator');
  
  // Update UI
  if (isChecked) {
    checkmark.classList.remove('hidden');
    indeterminateIndicator.classList.add('hidden');
  } else {
    checkmark.classList.add('hidden');
    indeterminateIndicator.classList.add('hidden');
  }
  
  // Update all member checkboxes
  memberCheckboxes.forEach(checkbox => {
    checkbox.checked = isChecked;
    updateMemberCheckboxUI(checkbox);
  });
  
  // Update selected list
  updateSelectedList();
});

// Handle member checkbox changes
memberCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', function() {
    updateMemberCheckboxUI(this);
    updateSelectAllState();
    updateSelectedList();
  });
});

// Update the member checkbox UI
function updateMemberCheckboxUI(checkbox) {
  const customCheckbox = checkbox.nextElementSibling;
  const checkmark = customCheckbox.querySelector('.checkmark');
  
  if (checkbox.checked) {
    checkmark.classList.remove('hidden');
  } else {
    checkmark.classList.add('hidden');
  }
}

// Update select all checkbox state based on member checkboxes
function updateSelectAllState() {
  const totalCheckboxes = memberCheckboxes.length;
  const checkedCount = Array.from(memberCheckboxes).filter(checkbox => checkbox.checked).length;
  
  const selectAllCustomCheckbox = selectAllCheckbox.nextElementSibling;
  const checkmark = selectAllCustomCheckbox.querySelector('.checkmark');
  const indeterminateIndicator = selectAllCustomCheckbox.querySelector('.indeterminate-indicator');
  
  if (checkedCount === 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
    checkmark.classList.add('hidden');
    indeterminateIndicator.classList.add('hidden');
  } else if (checkedCount === totalCheckboxes) {
    selectAllCheckbox.checked = true;
    selectAllCheckbox.indeterminate = false;
    checkmark.classList.remove('hidden');
    indeterminateIndicator.classList.add('hidden');
  } else {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = true;
    checkmark.classList.add('hidden');
    indeterminateIndicator.classList.remove('hidden');
  }
}

// Update the selected members list
function updateSelectedList() {
  const selectedMembers = Array.from(memberCheckboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => {
      const memberId = checkbox.value;
      return teamMembers.find(member => member.id === memberId);
    });
  
  if (selectedMembers.length === 0) {
    noSelected.style.display = 'block';
    selectedList.style.display = 'none';
    selectedList.innerHTML = '';
  } else {
    noSelected.style.display = 'none';
    selectedList.style.display = 'block';
    
    selectedList.innerHTML = selectedMembers
      .map(member => `<li>${member.name}</li>`)
      .join('');
  }
} 