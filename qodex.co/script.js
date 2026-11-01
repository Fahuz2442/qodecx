document.documentElement.classList.replace("no-js", "js");

const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeToggleIcon = themeToggle.querySelector(".theme-toggle-icon");
const themeToggleLabel = themeToggle.querySelector(".theme-toggle-label");
const themeColor = document.querySelector('meta[name="theme-color"]');
let savedTheme = null;
try {
  savedTheme = window.localStorage.getItem("qodecx-theme");
} catch (error) {
  console.warn("Unable to read the saved theme preference.", error);
}

if (savedTheme === "light" || savedTheme === "dark") {
  root.dataset.theme = savedTheme;
}

function updateThemeControl() {
  const isLight = root.dataset.theme === "light";
  const nextTheme = isLight ? "dark" : "light";
  themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
  themeToggle.setAttribute("aria-pressed", String(isLight));
  themeToggleIcon.textContent = isLight ? "◐" : "☼";
  themeToggleLabel.textContent = isLight ? "Dark" : "Light";
  themeColor.content = isLight ? "#f8f7f5" : "#090b12";
}

updateThemeControl();
themeToggle.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
  updateThemeControl();
  try {
    window.localStorage.setItem("qodecx-theme", root.dataset.theme);
  } catch (error) {
    console.warn("Unable to save the theme preference.", error);
  }
});

const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const heroArt = document.querySelector(".hero-art");
const heroCarousel = document.querySelector(".hero-carousel");
if (heroCarousel) {
const heroSlides = [...heroCarousel.querySelectorAll(".hero-slide")];
const carouselDots = [...heroCarousel.querySelectorAll(".carousel-dot")];
const carouselPrevious = heroCarousel.querySelector(".carousel-previous");
const carouselNext = heroCarousel.querySelector(".carousel-next");
const carouselToggle = heroCarousel.querySelector(".carousel-toggle");
const carouselCounter = heroCarousel.querySelector(".carousel-current");
let activeSlide = 0;
let carouselTimer = null;
let userPaused = reducedMotion;
let pointerInsideCarousel = false;
let focusInsideCarousel = false;
let touchStartX = null;

function setActiveSlide(index) {
  activeSlide = (index + heroSlides.length) % heroSlides.length;
  const previousSlide = (activeSlide + heroSlides.length - 1) % heroSlides.length;
  const nextSlide = (activeSlide + 1) % heroSlides.length;
  heroSlides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === activeSlide;
    slide.classList.toggle("is-active", isActive);
    slide.classList.toggle("is-previous", slideIndex === previousSlide);
    slide.classList.toggle("is-next", slideIndex === nextSlide);
    slide.classList.toggle("is-hidden", slideIndex !== activeSlide && slideIndex !== previousSlide && slideIndex !== nextSlide);
    slide.setAttribute("aria-hidden", String(!isActive));
    carouselDots[slideIndex].classList.toggle("is-active", isActive);
    if (isActive) {
      carouselDots[slideIndex].setAttribute("aria-current", "true");
    } else {
      carouselDots[slideIndex].removeAttribute("aria-current");
    }
  });
  carouselCounter.innerHTML = `${String(activeSlide + 1).padStart(2, "0")} <i>/</i> ${String(heroSlides.length).padStart(2, "0")}`;
  heroArt.dataset.slide = ["website", "app", "automation", "iot"][activeSlide];
}

function updateCarouselPlayback() {
  const shouldPlay = !userPaused && !pointerInsideCarousel && !focusInsideCarousel && !document.hidden;
  if (shouldPlay && carouselTimer === null) {
    carouselTimer = window.setInterval(() => setActiveSlide(activeSlide + 1), 5200);
  } else if (!shouldPlay && carouselTimer !== null) {
    window.clearInterval(carouselTimer);
    carouselTimer = null;
  }
  carouselToggle.setAttribute("aria-label", userPaused ? "Resume automatic rotation" : "Pause automatic rotation");
  carouselToggle.setAttribute("aria-pressed", String(userPaused));
  carouselToggle.querySelector(".carousel-pause-icon").textContent = userPaused ? "▶" : "Ⅱ";
  heroCarousel.setAttribute("aria-live", shouldPlay ? "off" : "polite");
}

setActiveSlide(activeSlide);
carouselPrevious.addEventListener("click", () => setActiveSlide(activeSlide - 1));
carouselNext.addEventListener("click", () => setActiveSlide(activeSlide + 1));
carouselDots.forEach((dot, index) => dot.addEventListener("click", () => setActiveSlide(index)));
carouselToggle.addEventListener("click", () => {
  userPaused = !userPaused;
  updateCarouselPlayback();
});
heroCarousel.addEventListener("pointerenter", () => {
  pointerInsideCarousel = true;
  updateCarouselPlayback();
});
heroCarousel.addEventListener("pointerleave", () => {
  pointerInsideCarousel = false;
  updateCarouselPlayback();
});
heroCarousel.addEventListener("touchstart", (event) => {
  if (event.target.closest(".carousel-controls")) return;
  const touch = event.changedTouches[0];
  touchStartX = touch ? touch.clientX : null;
}, { passive: true });
heroCarousel.addEventListener("touchend", (event) => {
  const touch = event.changedTouches[0];
  if (touchStartX === null || !touch) return;
  const touchEndX = touch.clientX;
  const swipeDistance = touchEndX - touchStartX;
  if (Math.abs(swipeDistance) > 45) {
    setActiveSlide(activeSlide + (swipeDistance < 0 ? 1 : -1));
  }
  touchStartX = null;
}, { passive: true });
heroCarousel.addEventListener("focusin", () => {
  focusInsideCarousel = true;
  updateCarouselPlayback();
});
heroCarousel.addEventListener("focusout", (event) => {
  if (!heroCarousel.contains(event.relatedTarget)) {
    focusInsideCarousel = false;
    updateCarouselPlayback();
  }
});
document.addEventListener("visibilitychange", updateCarouselPlayback);
updateCarouselPlayback();

if (!reducedMotion) {
  heroArt.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    const bounds = heroArt.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    heroSlides[activeSlide].querySelector(".showcase-frame").style.setProperty("--tilt-x", `${-y * 4}deg`);
    heroSlides[activeSlide].querySelector(".showcase-frame").style.setProperty("--tilt-y", `${x * 5}deg`);
  });

  heroArt.addEventListener("pointerleave", () => {
    heroSlides.forEach((slide) => {
      slide.querySelector(".showcase-frame").style.setProperty("--tilt-x", "0deg");
      slide.querySelector(".showcase-frame").style.setProperty("--tilt-y", "0deg");
    });
  });
}
}

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  mainNav.classList.remove("is-open");
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  mainNav.classList.toggle("is-open", !isOpen);
});

mainNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menuToggle.focus();
  }
});

let scrollQueued = false;
window.addEventListener("scroll", () => {
  if (scrollQueued) return;
  scrollQueued = true;
  window.requestAnimationFrame(() => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
    scrollQueued = false;
  });
}, { passive: true });

const revealElements = document.querySelectorAll(".reveal");
if (reducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element) => revealObserver.observe(element));
}

const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());

const categorySelect = document.querySelector("#project-category");
if (categorySelect) {
const categoryPrompt = document.querySelector(".category-prompt");
const categoryOptions = [...document.querySelectorAll(".category-options")];
const projectSummary = document.querySelector("#project-summary");
const summaryCount = document.querySelector("#summary-count");

const categoryPrompts = new Map([
  ["Website", "Which pages or features should your website include?"],
  ["Software", "Which workflows, tools, or user groups should the software support?"],
  ["IoT project", "What should the device sense, control, or communicate with?"],
  ["Mobile app", "What should people be able to do in the app?"],
  ["Automation", "Which task or hand-off would you like to make easier?"],
  ["Something else", "What would you like to explore or get help with?"],
]);

categorySelect.addEventListener("change", () => {
  const category = categorySelect.value;
  categoryOptions.forEach((options) => {
    const isActive = options.dataset.category === category;
    if (!isActive) options.querySelectorAll('input[type="checkbox"]').forEach((input) => { input.checked = false; });
    options.hidden = !isActive;
  });
  categoryPrompt.hidden = Boolean(category);
  categoryPrompt.textContent = categoryPrompts.get(category) || "Choose a category and we’ll ask the most useful follow-up.";
});

projectSummary.addEventListener("input", () => {
  summaryCount.textContent = `${projectSummary.value.length} / 3000`;
});
}
