/* Bing Wallpapers - 前端交互脚本 */

(function () {
  "use strict";

  // ===== 主题切换 =====
  function initTheme() {
    var toggle = document.getElementById("theme-toggle");
    if (!toggle) return;

    var saved = localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = saved || (prefersDark ? "dark" : "light");

    applyTheme(theme);

    toggle.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme");
      var next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("theme", next);
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.textContent = theme === "dark" ? "☀" : "🌙";
    }
  }

  // ===== 搜索功能 =====
  function initSearch() {
    var input = document.getElementById("search-input");
    if (!input) return;

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      var cards = document.querySelectorAll(".gallery-card");

      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var copyright = (card.getAttribute("data-copyright") || "").toLowerCase();
        var date = card.getAttribute("data-date") || "";
        var region = card.getAttribute("data-region") || "";

        var match =
          !query ||
          title.indexOf(query) !== -1 ||
          copyright.indexOf(query) !== -1 ||
          date.indexOf(query) !== -1 ||
          region.indexOf(query) !== -1;

        if (match) {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      }
    });
  }

  // ===== 区域筛选 =====
  function initRegionFilter() {
    var buttons = document.querySelectorAll(".filter-btn");
    if (buttons.length === 0) return;

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        var region = this.getAttribute("data-region");

        // 更新按钮状态
        for (var j = 0; j < buttons.length; j++) {
          buttons[j].classList.remove("active");
        }
        this.classList.add("active");

        // 筛选卡片
        var cards = document.querySelectorAll(".gallery-card");
        for (var k = 0; k < cards.length; k++) {
          var card = cards[k];
          var cardRegion = card.getAttribute("data-region");

          if (region === "all" || cardRegion === region) {
            card.classList.remove("hidden");
          } else {
            card.classList.add("hidden");
          }
        }
      });
    }
  }

  // ===== 地区切换器 =====
  function initRegionSwitcher() {
    var select = document.getElementById("region-select");
    if (!select) return;

    select.addEventListener("change", function () {
      var url = select.value;
      var region = url.replace(/\//g, "");
      localStorage.setItem("region", region);
      window.location.href = url;
    });
  }

  // ===== 初始化 =====
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    initTheme();
    initSearch();
    initRegionFilter();
    initRegionSwitcher();
  }
})();
