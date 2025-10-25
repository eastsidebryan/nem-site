// Mobile nav drop down
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const menu = document.getElementById("mobile-menu");

  toggleBtn.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });

 // Ticker
  document.addEventListener("DOMContentLoaded", () => {
    const tickerTracks = document.querySelectorAll(".ticker-track");

    if (tickerTracks.length > 0) {
      // Width of one set of items
      const trackWidth = tickerTracks[0].scrollWidth;
      const container = document.querySelector(".ticker-mobile") || document.querySelector(".ticker");

      // Set CSS variable for travel distance
      container.style.setProperty("--ticker-distance", trackWidth + "px");

      // Optional: Adjust speed so it stays constant (~100px/sec)
      const speed = trackWidth / 100; // seconds
      container.style.setProperty("--ticker-speed", speed + "s");
    }
  });

// Carousel
const carousel = document.getElementById('carousel');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const leftBlur = document.getElementById('left-blur');
const rightBlur = document.getElementById('right-blur');

let atLeft = true; // start at left page

rightBtn.addEventListener('click', () => {
  carousel.style.transform = 'translateX(calc(-50% - 12px))'; // move to right page
  atLeft = false;

  // Show left button, hide right
  leftBtn.classList.remove('hidden');
  rightBtn.classList.add('hidden');

  // Show left blur, hide right blur
  leftBlur.classList.remove('hidden');
  rightBlur.classList.add('hidden');
});

leftBtn.addEventListener('click', () => {
  carousel.style.transform = 'translateX(0)'; // move to left page
  atLeft = true;

  // Show right button, hide left
  rightBtn.classList.remove('hidden');
  leftBtn.classList.add('hidden');

  // Show right blur, hide left blur
  rightBlur.classList.remove('hidden');
  leftBlur.classList.add('hidden');
});

