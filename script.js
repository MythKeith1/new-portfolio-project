
"use strict";

/* =========================================================
   KEITH GOTOHORI — EXECUTE MODE
   script.js | Vanilla JavaScript
   ========================================================= */

document.documentElement.classList.add("js-enabled");

/* 01. UTILITIES */
const select = (selector, scope = document) =>
  scope.querySelector(selector);

const selectAll = (selector, scope = document) =>
  [...scope.querySelectorAll(selector)];

/* 02. FOOTER YEAR */
const yearElement = select("#current-year");

if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}

/* 03. MOBILE NAVIGATION */
const navToggle = select(".nav-toggle");
const navMenu = select("#nav-menu");
const navLinks = selectAll("#nav-menu a");

function setMenuState(isOpen) {
  if (!navToggle || !navMenu) return;

  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation" : "Open navigation"
  );

  navMenu.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen =
      navToggle.getAttribute("aria-expanded") === "true";

    setMenuState(!isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);

      if (navToggle === document.activeElement) {
        navToggle.focus();
      }
    }
  });

  document.addEventListener("click", (event) => {
    const isOpen =
      navToggle.getAttribute("aria-expanded") === "true";

    if (
      isOpen &&
      !navMenu.contains(event.target) &&
      !navToggle.contains(event.target)
    ) {
      setMenuState(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 680) {
      setMenuState(false);
    }
  });
}

/* 04. PROJECT FILTERING */
const filterButtons = selectAll("[data-filter]");
const projectCards = selectAll(".project-card");

function filterProjects(category) {
  projectCards.forEach((card) => {
    const matches =
      category === "all" ||
      card.dataset.category === category;

    card.hidden = !matches;
  });

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === category;

    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterProjects(button.dataset.filter);
  });
});

/* 05. SCROLL REVEAL */
const revealElements = selectAll(".reveal");

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -35px 0px"
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("is-visible");
  });
}

/* 06. HONEST PLACEHOLDER LINK HANDLING */
const notice = document.createElement("p");

notice.className = "site-notice";
notice.setAttribute("role", "status");
notice.setAttribute("aria-live", "polite");
notice.hidden = true;

const footer = select(".site-footer");

if (footer) {
  footer.before(notice);
}

function showNotice(message) {
  if (!notice) return;

  notice.textContent = message;
  notice.hidden = false;

  notice.scrollIntoView({
    behavior: reducedMotion ? "auto" : "smooth",
    block: "nearest"
  });
}

function isPlaceholder(value) {
  return (
    !value ||
    value === "#" ||
    /^(PROJECT_LINK_|GITHUB_LINK_|LINKEDIN_PROFILE_URL|GITHUB_PROFILE_URL)/i
      .test(value) ||
    /YOUR_EMAIL@example\.com/i.test(value)
  );
}

selectAll(
  "[data-project-link], [data-repo-link], [data-social-link]"
).forEach((link) => {
  link.addEventListener("click", (event) => {
    if (isPlaceholder(link.getAttribute("href"))) {
      event.preventDefault();

      const type = link.hasAttribute("data-repo-link")
        ? "GitHub repository"
        : link.hasAttribute("data-social-link")
          ? "social profile"
          : "live project demo";

      showNotice(
        `This ${type} has not been configured yet. ` +
        "Add and verify the real URL before publishing."
      );
    }
  });
});

/* 07. CONTACT FORM VALIDATION */
const contactForm = select("#contact-form");
const formStatus = select("#form-status");

const fields = {
  name: {
    input: select("#name"),
    error: select("#name-error"),
    message: "Please enter a name with at least 2 characters."
  },
  email: {
    input: select("#email"),
    error: select("#email-error"),
    message: "Please enter a valid email address."
  },
  projectType: {
    input: select("#project-type"),
    error: select("#project-type-error"),
    message: "Please select a project type."
  },
  message: {
    input: select("#message"),
    error: select("#message-error"),
    message: "Please provide at least 10 characters of detail."
  }
};

function validateField(key) {
  const field = fields[key];

  if (!field || !field.input) return true;

  const input = field.input;
  const value = input.value.trim();

  let valid = input.checkValidity();

  if (key === "name") {
    valid = value.length >= 2;
  }

  if (key === "email") {
    valid =
      value.length > 0 &&
      input.validity.valid &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (key === "projectType") {
    valid = value !== "";
  }

  if (key === "message") {
    valid = value.length >= 10;
  }

  input.setAttribute("aria-invalid", String(!valid));

  if (field.error) {
    field.error.textContent = valid ? "" : field.message;
  }

  return valid;
}

Object.keys(fields).forEach((key) => {
  const field = fields[key];

  if (!field.input) return;

  field.input.addEventListener("blur", () => {
    validateField(key);
  });

  field.input.addEventListener("input", () => {
    if (field.input.getAttribute("aria-invalid") === "true") {
      validateField(key);
    }
  });

  field.input.addEventListener("change", () => {
    if (field.input.getAttribute("aria-invalid") === "true") {
      validateField(key);
    }
  });
});

/* 08. PREPARE AN EMAIL WITHOUT A BACKEND */
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const results = Object.keys(fields).map((key) => ({
      key,
      valid: validateField(key)
    }));

    const firstInvalid = results.find(
      (result) => !result.valid
    );

    if (firstInvalid) {
      const invalidInput = fields[firstInvalid.key].input;

      invalidInput?.focus();

      if (formStatus) {
        formStatus.textContent =
          "Please correct the highlighted fields before continuing.";
      }

      return;
    }

    const name = fields.name.input.value.trim();
    const email = fields.email.input.value.trim();
    const projectType =
      fields.projectType.input.selectedOptions[0].textContent.trim();
    const message = fields.message.input.value.trim();

    const recipientLink = select(".contact-email");
    const recipient = recipientLink?.getAttribute("href") || "";

    if (
      !recipient.startsWith("mailto:") ||
      isPlaceholder(recipient.slice("mailto:".length))
    ) {
      if (formStatus) {
        formStatus.textContent =
          "Your form is valid, but the contact email has not been " +
          "configured. Set your real email address before sending.";
      }

      return;
    }

    const subject = `Portfolio enquiry: ${projectType}`;

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Project type: ${projectType}`,
      "",
      "Message:",
      message
    ].join("\n");

    const mailtoURL =
      `${recipient}?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    if (formStatus) {
      formStatus.textContent =
        "Your message is prepared. Your email application will open " +
        "if your device has one configured.";
    }

    window.location.href = mailtoURL;
  });
}

/* 09. OPTIONAL: UPDATE THE CURRENT NAV SECTION */
const sectionLinks = selectAll(
  '.nav-menu a[href^="#"]:not(.nav-cta)'
);

const observedSections = sectionLinks
  .map((link) => select(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        sectionLinks.forEach((link) => {
          const active =
            link.getAttribute("href") === `#${entry.target.id}`;

          if (active) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    {
      rootMargin: "-25% 0px -65% 0px"
    }
  );

  observedSections.forEach((section) => {
    sectionObserver.observe(section);
  });
}

/* 10. INITIAL FILTER STATE */
filterProjects("all");

/* Portfolio interactions initialized. */
