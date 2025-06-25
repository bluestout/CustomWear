const KlaviyoReady = () => {
  const klaviyoImages = document.querySelectorAll(".needsclick img");

  klaviyoImages.forEach(img => {
    if (img.alt) {
      console.log("have alt!");
    } else {
      img.setAttribute("alt", "ADA Alt Text")
    }
  })
}

const observer = new MutationObserver((mutations, obs) => {
  const KlaviyoImage = document.querySelector('.needsclick img');
  if (KlaviyoImage) {
    KlaviyoReady();
    obs.disconnect();
  }
});

observer.observe(document.body, { childList: true, subtree: true });