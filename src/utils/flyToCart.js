export const animateFlyToCart = (e, imageUrl) => {
  const cartIcon = document.getElementById("navbar-cart-icon");
  if (!cartIcon) return;

  const rect = cartIcon.getBoundingClientRect();
  const cartX = rect.left + rect.width / 2;
  const cartY = rect.top + rect.height / 2;

  const startX = e.clientX;
  const startY = e.clientY;

  // Create flyer element
  const flyer = document.createElement("div");
  flyer.className = "flyer-animation-dot";
  flyer.style.left = `${startX - 12}px`; // Offset to center on mouse
  flyer.style.top = `${startY - 12}px`;
  if (imageUrl) {
    flyer.style.backgroundImage = `url(${imageUrl})`;
  }
  
  document.body.appendChild(flyer);

  // Keyframe coordinates
  flyer.style.setProperty("--fly-x", `${cartX - startX}px`);
  flyer.style.setProperty("--fly-y", `${cartY - startY}px`);

  // Force reflow
  flyer.getBoundingClientRect();

  flyer.classList.add("fly");

  // Animate the cart icon jiggle when flyer arrives
  setTimeout(() => {
    cartIcon.classList.add("jiggle");
    flyer.remove();
    setTimeout(() => {
      cartIcon.classList.remove("jiggle");
    }, 500);
  }, 750);
};
