const KlaviyoReady = () => {
  const klaviyoImages = document.querySelectorAll(".needsclick img");

  klaviyoImages.forEach(img => {
    if (img.alt) {
      console.log("have alt!");
    } else {
      img.setAttribute("alt", "ADA Alt Text")
    }
  });

  const btnModal = document.querySelector('.kl-teaser-U4kxrD');
  if (btnModal && btnModal.parentNode.tagName !== 'NAV') {
    const navTag = document.createElement("nav");
    navTag.style.height = '64px';
    btnModal.parentNode.insertBefore(navTag, btnModal);
    navTag.appendChild(btnModal);
  }
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
    slidesPerGroup: 40,
    grid: {
      rows: 10,
      fill: 'row',
    },
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
        slidesPerView: 2,
        slidesPerGroup: 20,
        grid: {
          rows: 10,
          fill: 'row',
        },
      },
      769: {
        slidesPerView: 4,
        slidesPerGroup: 40,
        grid: {
          rows: 10,
          fill: 'row',
        },
      },
    },
  });
}

const pagination = (element, desktopCnt, mobileCnt) => {
  element.forEach((item) => {
    if (item.classList.contains('hidden') == false) {
      const swiperDiv = item.querySelector('.product-pagination');
      if (swiperDiv) {
        const productDivs = Array.from(swiperDiv.querySelectorAll('.grid__item.ui_grid__item'));
        const paginationControls = item.querySelector('.pagination-controls');
        const prevBtn = item.querySelector('.page-previous-btn');
        const nextBtn = item.querySelector('.page-next-btn');
        let currentPage = 1;

        function getProductsPerPage() {
          return window.innerWidth < 750 ? mobileCnt : desktopCnt;
        }

        function setActive(page) {
          currentPage = page;
          const productsPerPage = getProductsPerPage();
          productDivs.forEach((div, idx) => {
            div.classList.toggle('active', !(idx >= (page - 1) * productsPerPage && idx < page * productsPerPage));
          });
          paginationControls.querySelectorAll('button').forEach((btn) => {
            btn.classList.toggle('active', parseInt(btn.dataset.page) === page);
          });
          prevBtn.classList.toggle('disabled', page === 1);
          nextBtn.classList.toggle('disabled', page === getTotalPages());
        }

        function getTotalPages() {
          return Math.ceil(productDivs.length / getProductsPerPage());
        }

        function renderPagination() {
          const totalPages = getTotalPages();
          let html = '';
          for (let i = 1; i <= totalPages; i++) {
            html += `<button data-page="${i}"${i === 1 ? ' class="active"' : ''}>${i}</button>`;
          }
          paginationControls.innerHTML = html;

          paginationControls.querySelectorAll('button').forEach((btn) => {
            btn.addEventListener('click', function () {
              const page = parseInt(this.dataset.page);
              setActive(page);
            });
          });
        }

        prevBtn.addEventListener('click', function () {
          if (currentPage > 1) setActive(currentPage - 1);
        });
        nextBtn.addEventListener('click', function () {
          if (currentPage < getTotalPages()) setActive(currentPage + 1);
        });

        window.addEventListener('resize', () => {
          renderPagination();
          setActive(1);
        });

        renderPagination();
        setActive(1);
      }
    }
  });
}

// For Cart Page
document.addEventListener('DOMContentLoaded', function(){
  fetch('/cart.js')
    .then(response => response.json())
    .then(data => {
      data.items.forEach(item => {
      console.log('Product:', item.product_title, 'Quantity:', item.quantity);
    });
  })
  .catch(error => console.error('Error:', error));
})