# Interactive Portfolio

This is a single-page portfolio website designed to showcase projects and skills in a unique, engaging, and visually stunning way. The entire experience is built around a series of full-screen, vertically scrolling sections, each featuring a unique set of animations and interactions. The project has a rich, "funky classy" aesthetic with a "Neon Noir" theme, combining a dark, atmospheric background with vibrant, glowing interactive elements.

## ✨ Features

This portfolio is built as a single, self-contained `index.html` file, but it integrates several complex and high-performance animations:

* **Full-Screen Vertical Sections:** The portfolio is structured as a series of immersive, full-screen pages that you navigate by scrolling vertically.
* **Bubble Navigation Menu:** A stylish, animated menu with circular elements. It features a "blur-out" effect on the main content when opened and provides smooth, animated scrolling to any section on the page.
* **Interactive "MetaBalls" Section:** A mesmerizing, full-screen WebGL animation featuring fluid, lava-lamp-like blobs that react to the user's cursor. This effect is performance-optimized to run only when its section is in view.
* **Animated "Tech Stack" Section:** A showcase of technical skills that includes several subtle animations:
    * **Scroll-Triggered Title:** The section title animates into view as it scrolls onto the screen.
    * **Proximity Hover:** Skill "pills" react as the mouse gets near them, revealing a high-contrast version of the text in a circular "lens" that follows the cursor.
* **Atmospheric Background:** A dynamic "Light Rays" effect is rendered in the background of the entire site, which subtly follows the user's cursor and pulses gently to create a sense of life and depth.

## 🛠️ Technologies Used

This project was built from the ground up using core web technologies and powerful animation libraries.

* **HTML5:** For the main structure of the page.
* **CSS3:** For all styling, including the modern layout, color themes, and some hover effects.
* **JavaScript (ES6+):** For all the dynamic logic, interactivity, and animation orchestration.
* **GSAP (GreenSock Animation Platform):** The primary engine for all animations. It's used for:
    * The scroll-triggered animations (`ScrollTrigger`).
    * The smooth scroll-to-section navigation (`ScrollToPlugin`).
    * The animations for the bubble menu and the tech stack.
* **OGL (Minimal WebGL Library):** A lightweight library used to render the high-performance "MetaBalls" and "Light Rays" WebGL effects, ensuring a smooth experience by leveraging the GPU.

## 🚀 Getting Started

Since this entire project is self-contained in a single file, running it is incredibly simple.

### Prerequisites

You only need a modern web browser (like Chrome, Firefox, or Safari).

### Installation & Running

1.  **Save the file:** Make sure you have the complete `index.html` file saved on your computer.
2.  **Open in browser:** Double-click the `index.html` file. It will open directly in your default web browser, and all animations and features will be fully functional. There's no need for a local server or any other setup.

## 🔧 Customization

The project is designed to be easily customizable.

* **Menu Items:** To add or remove a menu item, you just need to edit the `<li>` elements in the `<ul class="pill-list">`. Make sure the `href` attribute matches the `id` of the section you want to link to.
* **Sections:** To add a new section, simply add a new `<section class="fullscreen-section">` inside the `<div class="main-content">` and give it a unique `id`. The navigation menu will automatically be able to scroll to it.
* **MetaBalls & Light Rays:** The colors and physics of these effects can be tweaked in their respective JavaScript configuration objects.
```eof