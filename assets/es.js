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

const initESSlider = element => {
  const sw = new Swiper(element, {
    slidesPerView: 4,
    slidesPerGroup: 4,
    grid: {
      rows: 8,
      fill: 'row',
    },
    // spaceBetween: 10,
    navigation: {
      nextEl: element?.querySelector('.swiper-button-next'),
      prevEl: element?.querySelector('.swiper-button-prev'),
    },
    pagination: {
      el: element?.querySelector('.swiper-pagination'),
      clickable: true,
      renderBullet: (index, className) => {
        return '<span class="' + className + '">' + (index + 1) + '</span>';
      },
    },
    breakpoints: {
      0: {
        slidesPerGroup: 4,
        slidesPerView: 2,
        grid: {
          rows: 8,
        },
      },
      769: {
        slidesPerView: 4,
        slidesPerGroup: 4,
        grid: {
          rows: 8,
        },
      },
    },
  });
}