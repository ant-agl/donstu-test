const mainSlider = new Swiper(".main-swiper", {
  loop: true,
  autoplay: {
    delay: 3000,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});

let selectAuthor = document.querySelector('[name="author"]');
let content = document.querySelector(".articles__content");
let articlesNotFound = document.querySelector(".articles__not-found");
let loader = document.querySelector("#load-articles");
let templateArticle = document.querySelector("#template-article").innerHTML;

let xhr = new XMLHttpRequest();
xhr.open("GET", "https://mocki.io/v1/a5814d24-4e22-49fc-96d1-0e9ae2952afc");
xhr.send();
xhr.onload = () => {
  let data = JSON.parse(xhr.response);
  loader.remove();
  console.log(data);

  if (data.status != "ok") {
    insertError();
    return;
  }

  let authorsList = [];
  data.articles.forEach((article) => {
    let tempFn = doT.template(templateArticle);

    // format date
    const date = new Date(article.publishedAt);
    const options = { year: "numeric", month: "long", day: "numeric" };
    article.date = date.toLocaleDateString("ru-RU", options).replace(" г.", "");

    let result = tempFn(article);
    content.innerHTML += result;

    // select author
    let author = article.author;
    if (author) authorsList.push(author);
  });

  authorsList = Array.from(new Set(authorsList));
  authorsList.forEach((author) => {
    selectAuthor.innerHTML += `<option value="${author}">${author}</option>`;
  });

  // обрезка описания
  let articles = document.querySelectorAll(".article");
  if (articles.length == 0) insertNotFound();

  let maxLines = 3;
  articles.forEach((article) => {
    let desc = article.querySelector(".article__desc");
    let lineHeight = parseFloat(window.getComputedStyle(desc).lineHeight);
    let maxH = maxLines * lineHeight;
    let currentH = desc.clientHeight;

    while (currentH > maxH) {
      let html = desc.innerHTML;
      let newHtml = html.split(" ").slice(0, -1).join(" ") + "...";
      desc.innerHTML = newHtml;
      currentH = desc.clientHeight;
    }
  });
};
xhr.onerror = insertError;

function insertError() {
  content.innerHTML = "<p>Произошла ошибка</p>";
}
function insertNotFound() {
  articlesNotFound.classList.remove("hide");
}
function removeNotFound() {
  articlesNotFound.classList.add("hide");
}

// datepicker
let dpMin, dpMax;
dpMin = new AirDatepicker('[name="from"]', {
  isMobile: window.outerWidth <= 700,
  autoClose: true,
  onSelect({ date }) {
    dpMax.update({
      minDate: date,
    });
    filter();
  },
});
dpMax = new AirDatepicker('[name="to"]', {
  isMobile: window.outerWidth <= 700,
  autoClose: true,
  onSelect({ date }) {
    dpMin.update({
      maxDate: date,
    });
    filter();
  },
});

selectAuthor.addEventListener("change", filter);

function filter() {
  removeNotFound();

  let author = selectAuthor.value.trim();

  let minTime, maxTime;
  let filterDate = true;
  // если одна из дат не заполнена, по дате не фильтруем
  if (dpMin.selectedDates.length == 0 || dpMax.selectedDates.length == 0) {
    filterDate = false;
  } else {
    minTime = dpMin.selectedDates[0].getTime();
    maxTime = dpMax.selectedDates[0].getTime() + 24 * 60 * 60 * 1000; // +1 day
  }

  let articles = document.querySelectorAll(".article");
  articles.forEach((article) => {
    let isAuthor = false;
    let currentAuthor = article.querySelector(".article__author");
    if (currentAuthor) currentAuthor = currentAuthor.textContent.trim();
    if (currentAuthor == author || author == "") isAuthor = true;

    let isDate = false;
    let time = new Date(article.getAttribute("data-date")).getTime();
    if (!filterDate || (minTime <= time && time < maxTime)) isDate = true;

    let isShow = isAuthor && isDate;
    if (isShow) article.classList.remove("hide");
    else article.classList.add("hide");
  });

  let hideArticles = document.querySelectorAll(".article.hide");
  if (articles.length == hideArticles.length) insertNotFound();
}
