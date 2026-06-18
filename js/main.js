document.addEventListener('DOMContentLoaded', function () {
  // Hamburger / mobile nav toggle
  var hamburger = document.getElementById('hamburger');
  var nav = document.getElementById('nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      nav.classList.toggle('active');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        nav.classList.remove('active');
      });
    });
  }

  // Fade-in on scroll
  var fadeEls = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    fadeEls.forEach(function (el) { observer.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // Menu carousel
  var menuCarousel = document.querySelector('[data-menu-carousel]');
  if (menuCarousel) {
    var mobileQuery = window.matchMedia('(max-width: 991px)');
    var gallery = menuCarousel.querySelector('.menu-gallery');
    var track = menuCarousel.querySelector('.menu-track');
    var slides = Array.from(menuCarousel.querySelectorAll('.menu-slide'));
    var currentCounter = menuCarousel.querySelector('[data-menu-current]');
    var totalCounter = menuCarousel.querySelector('[data-menu-total]');
    var currentSlide = 0;
    var touchStartX = 0;
    var touchStartY = 0;
    var currentDeltaX = 0;
    var isDragging = false;
    var activePointerId = null;
    var swipeThreshold = 0.18;

    function getSlideWidth() {
      return gallery.clientWidth || 1;
    }

    function renderSlide(index, disableTransition) {
      currentSlide = (index + slides.length) % slides.length;
      if (mobileQuery.matches) {
        track.style.transition = disableTransition ? 'none' : '';
        track.style.transform = 'translateX(' + (-currentSlide * getSlideWidth()) + 'px)';
      } else {
        track.style.transition = '';
        track.style.transform = '';
      }

      slides.forEach(function (slide, slideIndex) {
        slide.setAttribute('aria-hidden', String(mobileQuery.matches && slideIndex !== currentSlide));
      });

      if (currentCounter) {
        currentCounter.textContent = String(currentSlide + 1);
      }
      if (totalCounter) {
        totalCounter.textContent = String(slides.length);
      }
    }

    function startDrag(clientX, clientY) {
      if (!mobileQuery.matches) {
        return;
      }

      isDragging = true;
      touchStartX = clientX;
      touchStartY = clientY;
      currentDeltaX = 0;
      track.style.transition = 'none';
    }

    function moveDrag(clientX, clientY, event) {
      if (!isDragging || !mobileQuery.matches) {
        return;
      }

      currentDeltaX = clientX - touchStartX;
      if (Math.abs(currentDeltaX) > Math.abs(clientY - touchStartY)) {
        event.preventDefault();
      }

      track.style.transform = 'translateX(' + ((-currentSlide * getSlideWidth()) + currentDeltaX) + 'px)';
    }

    function endDrag() {
      if (!isDragging || !mobileQuery.matches) {
        return;
      }

      isDragging = false;

      if (Math.abs(currentDeltaX) / getSlideWidth() >= swipeThreshold) {
        if (currentDeltaX < 0) {
          renderSlide(currentSlide + 1);
        } else {
          renderSlide(currentSlide - 1);
        }
      } else {
        renderSlide(currentSlide);
      }
    }

    if ('PointerEvent' in window) {
      gallery.addEventListener('pointerdown', function (event) {
        if (!mobileQuery.matches) {
          return;
        }
        if (event.pointerType === 'mouse' && event.button !== 0) {
          return;
        }

        activePointerId = event.pointerId;
        if (gallery.setPointerCapture) {
          gallery.setPointerCapture(event.pointerId);
        }
        startDrag(event.clientX, event.clientY);
      });

      gallery.addEventListener('pointermove', function (event) {
        if (event.pointerId !== activePointerId) {
          return;
        }
        moveDrag(event.clientX, event.clientY, event);
      });

      function releasePointer(event) {
        if (event.pointerId !== activePointerId) {
          return;
        }
        activePointerId = null;
        endDrag();
      }

      gallery.addEventListener('pointerup', releasePointer);
      gallery.addEventListener('pointercancel', releasePointer);
    } else {
      gallery.addEventListener('touchstart', function (event) {
        startDrag(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
      }, { passive: true });

      gallery.addEventListener('touchmove', function (event) {
        moveDrag(event.changedTouches[0].clientX, event.changedTouches[0].clientY, event);
      }, { passive: false });

      gallery.addEventListener('touchend', function () {
        endDrag();
      }, { passive: true });

      gallery.addEventListener('touchcancel', function () {
        endDrag();
      }, { passive: true });
    }

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', function () {
        isDragging = false;
        renderSlide(currentSlide, true);
      });
    } else if (typeof mobileQuery.addListener === 'function') {
      mobileQuery.addListener(function () {
        isDragging = false;
        renderSlide(currentSlide, true);
      });
    }

    window.addEventListener('resize', function () {
      if (!isDragging) {
        renderSlide(currentSlide, true);
      }
    });

    renderSlide(0, true);
  }
});
