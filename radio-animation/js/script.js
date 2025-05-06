// Sample team members data
const teamMembers = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
  { id: '4', name: 'Diana' },
  { id: '5', name: 'Ethan' },
  { id: '6', name: 'Fiona' },
  { id: '7', name: 'George' },
  { id: '8', name: 'Hannah' },
];

// State for selected member
let selectedMemberId = null;

// Function to render team members as radio buttons
function renderTeamMembers() {
  const container = document.getElementById('team-members-container');
  container.innerHTML = ''; // Clear existing content
  
  teamMembers.forEach(member => {
    // Create label element
    const label = document.createElement('label');
    label.className = 'radio-label';
    
    // Create radio input
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'teamMember';
    input.value = member.id;
    input.className = 'hidden-radio';
    input.checked = selectedMemberId === member.id;
    input.addEventListener('change', handleRadioChange);
    
    // Create custom radio span
    const customRadio = document.createElement('span');
    customRadio.className = `custom-radio ${selectedMemberId === member.id ? 'checked' : ''}`;
    
    // Create name span
    const nameSpan = document.createElement('span');
    nameSpan.textContent = member.name;
    
    // Append all elements to label
    label.appendChild(input);
    label.appendChild(customRadio);
    label.appendChild(nameSpan);
    
    // Append label to container
    container.appendChild(label);
  });
}

// Function to handle radio button changes
function handleRadioChange(event) {
  selectedMemberId = event.target.value;
  updateSelectedDisplay();
  updateRadioStyles();
}

// Function to update the selected member display
function updateSelectedDisplay() {
  const displayElement = document.getElementById('selected-member-display');
  const selectedMember = teamMembers.find(m => m.id === selectedMemberId);
  
  if (selectedMember) {
    displayElement.textContent = selectedMember.name;
  } else {
    displayElement.textContent = 'No member selected.';
  }
}

// Function to update radio styles based on selection
function updateRadioStyles() {
  const radioButtons = document.querySelectorAll('.custom-radio');
  radioButtons.forEach(radio => {
    // Remove checked class from all radios
    radio.classList.remove('checked');
  });
  
  // Add checked class to selected radio
  const selectedRadio = document.querySelector(`input[value="${selectedMemberId}"] + .custom-radio`);
  if (selectedRadio) {
    selectedRadio.classList.add('checked');
  }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  renderTeamMembers();
}); 