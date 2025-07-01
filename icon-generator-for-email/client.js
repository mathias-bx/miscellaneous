document.addEventListener('DOMContentLoaded', () => {
  const iconGrid = document.getElementById('icon-grid');
  const searchInput = document.getElementById('search-input');
  const sidebar = document.getElementById('conversion-sidebar');
  const closeSidebarBtn = document.getElementById('close-sidebar');
  const sidebarIconName = document.getElementById('sidebar-icon-name');
  const sidebarIconPreview = document.getElementById('sidebar-icon-preview');
  const sizePresetsContainer = document.getElementById('size-presets');
  const customSizeInput = document.getElementById('size-input');
  const colorInput = document.getElementById('color-input');
  const convertBtn = document.getElementById('convert-btn');
  const resultContainer = document.getElementById('result-container');

  let icons = [];
  let selectedIcon = null;
  let currentSvgContent = '';

  // Fetch and render icons
  fetch('/icons')
    .then(response => response.json())
    .then(data => {
      icons = data;
      renderIcons(icons);
    });

  // Render icons in the grid
  function renderIcons(iconsToRender) {
    iconGrid.innerHTML = '';
    iconsToRender.forEach(icon => {
      const card = document.createElement('div');
      card.className = 'icon-card';
      card.dataset.icon = icon;
      card.innerHTML = `
        <div class="icon-item">
          <img src="/icons-32px/${icon}" alt="${icon}">
        </div>
        <span class="icon-name">${icon.replace('.svg', '')}</span>
      `;
      iconGrid.appendChild(card);
    });
  }

  // Search functionality
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredIcons = icons.filter(icon => icon.toLowerCase().includes(searchTerm));
    renderIcons(filteredIcons);
  });

  // Open sidebar
  iconGrid.addEventListener('click', (e) => {
    const iconCard = e.target.closest('.icon-card');
    if (iconCard) {
      // Manage selection state in the grid
      const currentSelected = iconGrid.querySelector('.selected');
      if (currentSelected) {
        currentSelected.classList.remove('selected');
      }
      iconCard.querySelector('.icon-item').classList.add('selected');

      selectedIcon = iconCard.dataset.icon;
      sidebarIconName.textContent = selectedIcon;
      sidebar.classList.add('open');
      resultContainer.innerHTML = '';

      // Reset color to default
      colorInput.value = '#000000';
      
      // Fetch and display SVG for live preview
      fetch(`/icons-32px/${selectedIcon}`)
        .then(response => response.text())
        .then(svgText => {
            currentSvgContent = svgText;
            updatePreviewColor(colorInput.value)
        })

    }
  });

  // Close sidebar
  function closeSidebar() {
    sidebar.classList.remove('open');
    selectedIcon = null;

    const currentSelected = iconGrid.querySelector('.selected');
    if (currentSelected) {
      currentSelected.classList.remove('selected');
    }
  }
  closeSidebarBtn.addEventListener('click', closeSidebar);

  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !e.target.closest('.icon-card')) {
        closeSidebar();
    }
  });

  // Update preview color on input
  colorInput.addEventListener('input', () => {
    updatePreviewColor(colorInput.value);
  })

  function updatePreviewColor(color){
      if(currentSvgContent){
          const coloredSvg = currentSvgContent.replace(/fill="(black|#000|#000000)"/g, `fill="${color}"`);
          sidebarIconPreview.innerHTML = coloredSvg;
      }
  }

  // Handle size preset selection
  sizePresetsContainer.addEventListener('click', (e) => {
    if (e.target.matches('.preset-btn')) {
      sizePresetsContainer.querySelector('.active').classList.remove('active');
      e.target.classList.add('active');

      if (e.target.dataset.size === 'custom') {
        customSizeInput.classList.remove('hidden');
      } else {
        customSizeInput.classList.add('hidden');
      }
    }
  });

  function getSelectedSize() {
    const activePreset = sizePresetsContainer.querySelector('.active');
    if (activePreset.dataset.size === 'custom') {
      return parseInt(customSizeInput.value, 10) || 256;
    }
    return parseInt(activePreset.dataset.size, 10);
  }

  // Handle conversion and download
  convertBtn.addEventListener('click', () => {
    if (!selectedIcon) return;

    const size = getSelectedSize();
    if (!size || size < 1 || size > 2048) {
        resultContainer.innerHTML = `<p style="color: red;">Invalid size. Must be between 1 and 2048.</p>`;
        return;
    }

    const color = colorInput.value;

    resultContainer.innerHTML = 'Converting...';

    fetch(`/convert?icon=${selectedIcon}&size=${size}&color=${encodeURIComponent(color)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Conversion failed');
        }
        return response.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedIcon.replace('.svg', '')}-${size}x${size}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        resultContainer.innerHTML = `<p style="color: green;">Download started!</p>`;
      })
      .catch(error => {
        resultContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
      });
  });
}); 