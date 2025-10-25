// Function for Animate Up
const observerUp = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.remove('opacity-0', 'translate-y-8');
      entry.target.classList.add('animate-fade-up', 'animate-once', 'animate-duration-500', 'animate-delay-500', 'animate-ease-out');
      
      // Stop observing the element once it has been animated
      observerUp.unobserve(entry.target);
    }
  });
});

// Function for Animate Left
const observerLeft = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.remove('opacity-0', '-translate-x-full');
      entry.target.classList.add('animate-fade-left', 'animate-once', 'animate-duration-1000', 'animate-delay-200', 'animate-ease-in');

      // Stop observing the element once it has been animated
      observerLeft.unobserve(entry.target);
    }
  });
});

// Function for Animate Wiggle
const observerWiggle = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.remove('opacity-0', '-translate-x-full');
      entry.target.classList.add('animate-wiggle', 'animate-once', 'animate-duration-700', 'animate-delay-100', 'animate-ease-in');

      // Stop observing the element once it has been animated
      observerWiggle.unobserve(entry.target);
    }
  });
});
// Select and observe elements for Animate Up
const animatedElementsUp = document.querySelectorAll('[data-animate-up-on-scroll]');
animatedElementsUp.forEach((element) => {
  observerUp.observe(element);
});

// Select and observe elements for Animate Left
const animatedElementsLeft = document.querySelectorAll('[data-animate-left-on-scroll]');
animatedElementsLeft.forEach((element) => {
  observerLeft.observe(element);
});

// Select and observe elements for Animate Wiggle
const animatedElementsWiggle = document.querySelectorAll('[data-animate-wiggle-on-scroll]');
animatedElementsWiggle.forEach((element) => {
  observerWiggle.observe(element);
});