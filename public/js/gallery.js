import PhotoSwipeLightbox from '/js/vendor/photoswipe-lightbox.esm.min.js';
import PhotoSwipe from '/js/vendor/photoswipe.esm.min.js';

// Masonry and imagesLoaded are loaded as UMD scripts and available on window
var Masonry = window.Masonry;
var imagesLoaded = window.imagesLoaded;

// --- Masonry Layout ---
var grid = document.querySelector('.image-grid');
if (grid) {
  var msnry = new Masonry(grid, {
    itemSelector: '.image-figure',
    percentPosition: true,
    horizontalOrder: true
  });

  imagesLoaded(grid).on('progress', function () {
    msnry.layout();
  });

  // --- Scroll Entrance Animations ---
  var figures = grid.querySelectorAll('.image-figure');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var rect = entry.target.getBoundingClientRect();
        var col = Math.floor(rect.left / (window.innerWidth / 4));
        entry.target.style.transitionDelay = (col * 0.08) + 's';
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  figures.forEach(function (fig) {
    observer.observe(fig);
  });

  // --- PhotoSwipe Lightbox ---
  var metadataEl = null;
  var metadataOpen = false;

  var lightbox = new PhotoSwipeLightbox({
    gallery: '.image-grid',
    children: 'a',
    pswpModule: PhotoSwipe,
    padding: { top: 20, bottom: 20, left: 20, right: 20 }
  });

  lightbox.on('uiRegister', function () {
    lightbox.pswp.ui.registerElement({
      name: 'info-button',
      className: 'pswp__button--info',
      order: 9,
      isButton: true,
      html: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      onClick: function () {
        toggleMetadata();
      }
    });
  });

  lightbox.on('openingAnimationEnd', function () {
    var pswpEl = lightbox.pswp.element;
    if (!pswpEl.querySelector('.pswp__metadata')) {
      metadataEl = document.createElement('div');
      metadataEl.className = 'pswp__metadata';
      pswpEl.appendChild(metadataEl);
    } else {
      metadataEl = pswpEl.querySelector('.pswp__metadata');
    }
    updateMetadata();
  });

  lightbox.on('change', function () {
    if (metadataEl) {
      updateMetadata();
    }
  });

  lightbox.on('close', function () {
    metadataOpen = false;
    if (metadataEl) {
      metadataEl.classList.remove('pswp__metadata--open');
    }
  });

  function toggleMetadata() {
    metadataOpen = !metadataOpen;
    if (metadataEl) {
      metadataEl.classList.toggle('pswp__metadata--open', metadataOpen);
    }
  }

  function updateMetadata() {
    if (!metadataEl || !lightbox.pswp) return;

    var slide = lightbox.pswp.currSlide;
    if (!slide || !slide.data || !slide.data.element) return;

    var el = slide.data.element;
    var items = [];

    var fields = [
      { attr: 'data-meta-date', label: 'Date' },
      { attr: 'data-meta-camera', label: 'Camera' },
      { attr: 'data-meta-location', label: 'Location' },
      { attr: 'data-meta-dimensions', label: 'Dimensions' },
      { attr: 'data-meta-tech', label: 'Settings', cls: 'meta-value--tech' },
      { attr: 'data-meta-description', label: 'Description' }
    ];

    fields.forEach(function (field) {
      var val = el.getAttribute(field.attr);
      if (val) {
        var cls = field.cls ? ' ' + field.cls : '';
        items.push(
          '<div class="meta-item">' +
          '<span class="meta-label">' + field.label + '</span>' +
          '<span class="meta-value' + cls + '">' + val + '</span>' +
          '</div>'
        );
      }
    });

    metadataEl.innerHTML =
      '<h3>Photo Details</h3>' +
      '<div class="meta-items">' + items.join('') + '</div>';
  }

  lightbox.init();
}
