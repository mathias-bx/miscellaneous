document.addEventListener('DOMContentLoaded', () => {
  const pageWrapper = document.getElementById('page-wrapper');
  const iconGrid = document.getElementById('icon-grid');
  const searchInput = document.getElementById('search-input');
  const sidebar = document.getElementById('conversion-sidebar');
  const closeSidebarBtn = document.getElementById('close-sidebar');
  const sidebarIconName = document.getElementById('sidebar-icon-name');
  const sidebarIconPreview = document.getElementById('sidebar-icon-preview');
  const sizePresetsContainer = document.getElementById('size-presets');
  const customSizeInput = document.getElementById('size-input');
  const colorSwatchesContainer = document.getElementById('color-swatches');
  const gradientSwatchesContainer = document.getElementById('gradient-swatches');
  const convertBtn = document.getElementById('convert-btn');
  const resultContainer = document.getElementById('result-container');

  let icons = [];
  let colors = [];
  let gradients = [];
  let selectedIcon = null;
  let selectedFill = { type: 'color', value: '#111827' };
  let currentSvgContent = '';

  // Fetch initial data
  Promise.all([
    fetch('/icons').then(res => res.json()),
    fetch('/colors.json').then(res => res.json()),
    fetch('/gradients').then(res => res.json())
  ]).then(([iconData, colorData, gradientData]) => {
    icons = iconData;
    colors = colorData;
    gradients = gradientData;
    renderIcons(icons);
    renderColorSwatches(colors);
    renderGradientSwatches(gradients);
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

  // Render color swatches
  function renderColorSwatches(colorsToRender) {
    colorSwatchesContainer.innerHTML = '';
    colorsToRender.forEach(color => {
      const swatch = document.createElement('div');
      swatch.className = 'color-swatch';
      swatch.dataset.hex = color.hex;
      swatch.style.backgroundColor = color.hex;
      swatch.title = color.name;
      if (color.hex === selectedFill.value && selectedFill.type === 'color') {
        swatch.classList.add('selected');
      }
      colorSwatchesContainer.appendChild(swatch);
    });
  }

  // Render gradient swatches
  function renderGradientSwatches(gradientsToRender) {
    gradientSwatchesContainer.innerHTML = '';
    gradientsToRender.forEach(gradient => {
      const swatch = document.createElement('div');
      swatch.className = 'gradient-swatch';
      swatch.dataset.gradient = gradient;
      swatch.style.backgroundImage = `url(/gradients/${gradient})`;
      swatch.title = gradient.replace('.svg', '').replace(/-/g, ' ');
      gradientSwatchesContainer.appendChild(swatch);
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
      const currentSelectedIcon = iconGrid.querySelector('.selected');
      if (currentSelectedIcon) {
        currentSelectedIcon.classList.remove('selected');
      }
      iconCard.querySelector('.icon-item').classList.add('selected');

      selectedIcon = iconCard.dataset.icon;
      sidebarIconName.textContent = selectedIcon;
      sidebar.classList.add('open');
      pageWrapper.classList.add('sidebar-open');
      resultContainer.innerHTML = '';

      fetch(`/icons-32px/${selectedIcon}`)
        .then(response => response.text())
        .then(svgText => {
          currentSvgContent = svgText;
          updatePreview();
        });
    }
  });

  // Close sidebar
  function closeSidebar() {
    sidebar.classList.remove('open');
    pageWrapper.classList.remove('sidebar-open');
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

  // Handle color selection
  colorSwatchesContainer.addEventListener('click', (e) => {
    if (e.target.matches('.color-swatch')) {
      document.querySelector('.color-swatch.selected')?.classList.remove('selected');
      document.querySelector('.gradient-swatch.selected')?.classList.remove('selected');
      e.target.classList.add('selected');
      selectedFill = { type: 'color', value: e.target.dataset.hex };
      updatePreview();
    }
  });

  // Handle gradient selection
  gradientSwatchesContainer.addEventListener('click', (e) => {
    if (e.target.matches('.gradient-swatch')) {
        document.querySelector('.color-swatch.selected')?.classList.remove('selected');
        document.querySelector('.gradient-swatch.selected')?.classList.remove('selected');
        e.target.classList.add('selected');
        selectedFill = { type: 'gradient', value: e.target.dataset.gradient };
        updatePreview();
    }
  });

  function updatePreview() {
    if (!currentSvgContent) return;

    if (selectedFill.type === 'color') {
        const coloredSvg = currentSvgContent.replace(/fill="(black|#000|#000000)"/g, `fill="${selectedFill.value}"`);
        sidebarIconPreview.innerHTML = coloredSvg;
    } else {
        const patternId = 'gradient-preview';
        const defs = `
          <defs>
            <pattern id="${patternId}" patternUnits="objectBoundingBox" patternContentUnits="objectBoundingBox" width="1" height="1">
              <image href="/gradients/${selectedFill.value}" x="0" y="0" width="1" height="1" preserveAspectRatio="none" />
            </pattern>
          </defs>
        `;
        let finalSvg = currentSvgContent.replace(/<svg(.*?)>/, `<svg$1>${defs}`);
        finalSvg = finalSvg.replace(/fill="(black|#000|#000000)"/g, `fill="url(#${patternId})"`);
        sidebarIconPreview.innerHTML = finalSvg;
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

    resultContainer.innerHTML = 'Converting...';

    const queryParams = new URLSearchParams({
        icon: selectedIcon,
        size: size,
        fillType: selectedFill.type,
        fillValue: selectedFill.value
    });

    fetch(`/convert?${queryParams.toString()}`)
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