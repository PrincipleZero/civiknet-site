document.addEventListener("DOMContentLoaded", () => {
  const countrySelect = document.querySelector(".country-select");
  const countryChoices = new Choices(countrySelect, {
    placeholder: true,
    itemSelectText: "",
    searchPlaceholderValue: "Search",
  });
  const usersSelect = document.querySelector(".num-users");
  const usersChoices = new Choices(usersSelect, {
    placeholder: true,
    searchEnabled: false,
    shouldSort: false,
    itemSelectText: "",
  });

  const inputs = document.querySelectorAll(".inputs select");
  const countryDropdown = document.getElementById("company-hq");
  const numUsersDropdown = document.getElementById("number-of-users");
  const country = document.querySelector(".choices__inner:has(#company-hq) .choices__item.choices__item--selectable");
  const calculateCost = () => {
    const continent = countryDropdown.options[countryDropdown.selectedIndex].getAttribute("data-values");
    const country = countryDropdown.value;
    // console.log(country);
    const numUsers = numUsersDropdown.value;
    if (country && numUsers) {
      let result;
      document.querySelectorAll(".results > div").forEach((result) => {
        result.classList.remove("active");
      });
      if (numUsers === "<300") {
        result = "a";
      } else if (numUsers === "300-3000") {
        result = "b";
        let currency = "USD";
        let cost = "$13";
        if (continent === "Europe") {
          currency = "EUR";
          cost = "€10";
        }
        if (country === "Sweden") {
          currency = "SEK";
          cost = "100 kr";
        }
        if (country === "United Kingdom") {
          currency = "GBP";
          cost = "£10";
        }
        document.querySelector(".cost").innerText = cost;
        document.querySelector(".currency").innerText = currency;
      } else if (numUsers === "3000+") {
        result = "c";
      }
      document.querySelector(".result-" + result).classList.add("active");

      // console.log(result);
    } else {
      document.querySelectorAll(".results > div").forEach((result) => {
        result.classList.remove("active");
      });
      document.querySelector(".results .start").classList.add("active");
    }
  };
  inputs.forEach((input) => {
    input.addEventListener("change", calculateCost);
  });

  (function () {
    const orig = Element.prototype.scrollIntoView;

    Element.prototype.scrollIntoView = function (...args) {
      if (this.classList?.contains("choices__item--choice")) {
        const list = this.closest(".choices__list--dropdown, .choices__list[role='listbox']");
        if (list) {
          const itemTop = this.offsetTop;
          const itemBottom = itemTop + this.offsetHeight;
          const viewTop = list.scrollTop;
          const viewBottom = viewTop + list.clientHeight;

          if (itemTop < viewTop) list.scrollTop = itemTop;
          else if (itemBottom > viewBottom) list.scrollTop = itemBottom - list.clientHeight;

          return;
        }
      }
      return orig.apply(this, args);
    };
  })();
});
