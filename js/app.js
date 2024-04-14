document.addEventListener("DOMContentLoaded", () => {
  const businessForm = document.querySelector("#business_form");
  const payForm = document.querySelector("#pay_form");
  const history = document.querySelector("#historyItems");
  const carouselContainer = document.querySelector(".carousel-inner");
  const carouselIndicators = document.querySelector(".carousel-indicators");
  const autoCloseElements = document.querySelectorAll(".auto-close");
  const alertContainer = document.querySelector(".alert");
  const alertUl = document.querySelector("#alert_ul");
  const payBusinessInput = document.querySelector("#business_numPay");

  const dbUrl = "http://localhost:3000";
  let i = 0;

  fetchCarousel();

  //search box functionality called on business number input element of payForm
  payBusinessInput.addEventListener("input", () => {
    paySearchBox();
  });

  businessForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let businessNumInput = e.target.business_num.value;
    let accountNumInput = e.target.account_num.value;
    let businessName = e.target.business_name.value;

    handlePaybillPost(businessNumInput, accountNumInput, businessName);
  });

  payForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const businessPayInput = e.target.business_numPay.value;
    const accountPayInput = e.target.account_numPay.value;
    const payAmount = parseInt(e.target.amount.value);

    handlePaymentPost(businessPayInput, accountPayInput, payAmount);
  });

  //POST function
  function handlePaybillPost(businessNum, accountNum, name) {
    fetch(`${dbUrl}/paybill`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        businessNumber: businessNum,
        accountNumber: accountNum,
        businessName: name,
      }),
    })
      .then((res) => res.json())
      .then((body) => console.log(body))
      .catch((error) => alert(error.message));
  }

  function handlePaymentPost(businessNum, accountNum, amount) {
    fetch(`${dbUrl}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        businessNumber: businessNum,
        accountNumber: accountNum,
        amountPaid: amount,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const li = document.createElement("li");
        li.innerHTML = `
        ---------- ---------- -----------
        <p>Business Number: <span>${data.businessNumber}</span></p>
        <p>Account Number: <span>${data.accountNumber}</span></p>
        <p>Amount: <span>${data.amountPaid}</span></p>
        <hr>
        `;

        alertUl.appendChild(li);
        alertContainer.classList.remove("invisible");

        setTimeout(function () {
          autoCloseElements.forEach(function (element) {
            fadeAndSlide(element);
          });
        }, 3000);
      })
      .catch((error) => alert(error.message));
  }

  //GET data carousel function
  function fetchCarousel() {
    fetch(`${dbUrl}/paybill`)
      .then((res) => res.json())
      .then((data) => {
        data.forEach((record) => {
          const divItem = document.createElement("div");
          const carouselBtn = document.createElement("button");
          divItem.classList.add("carousel-item");
          divItem.innerHTML = `
          <h5><span class="badge bg-dark">${record.businessName}</span></h5>
          <p><span class="badge bg-dark">${record.businessNumber}</span></p>
          `;

          carouselBtn.setAttribute("type", "button");
          carouselBtn.setAttribute("data-bs-target", "#demo");
          carouselBtn.setAttribute("data-bs-slide-to", `${(i += 1)}`);

          carouselIndicators.appendChild(carouselBtn);
          carouselContainer.appendChild(divItem);
        });
      })
      .catch((error) => alert(error.message));
  }

  // Define a function to handle the fading and sliding animation
  function fadeAndSlide(element) {
    const fadeDuration = 500;
    const slideDuration = 500;

    // Step 1: Fade out the element
    let opacity = 1;
    const fadeInterval = setInterval(function () {
      if (opacity > 0) {
        opacity -= 0.1;
        element.style.opacity = opacity;
      } else {
        clearInterval(fadeInterval);
        // Step 2: Slide up the element
        let height = element.offsetHeight;
        const slideInterval = setInterval(function () {
          if (height > 0) {
            height -= 10;
            element.style.height = height + "px";
          } else {
            clearInterval(slideInterval);
            // Step 3: Remove the element from the DOM
            element.parentNode.removeChild(element);
          }
        }, slideDuration / 10);
      }
    }, fadeDuration / 10);
  }

  function paySearchBox() {
    const payBusinessValue = payBusinessInput.value.toUpperCase(); // Get the value of the input and convert it to uppercase
    const payAccountNum = document.querySelector("#account_numPay"); //Select the account number input element in payForm

    fetch(`${dbUrl}/paybill`)
      .then((res) => res.json())
      .then((data) => {
        let matchFound = false; // Variable to track if a match is found
        for (let i = 0; i < data.length; i++) {
          let textValue = data[i].businessNumber.toUpperCase(); // Convert businessNumber to uppercase for case-insensitive comparison

          if (textValue.indexOf(payBusinessValue) > -1) {
            payAccountNum.value = data[i].accountNumber; // Autofill the accountNumber

            matchFound = true;
            break; // Exit the loop since a match is found
          }
        }
        if (!matchFound) {
          payAccountNum.value = "";
        }
      })
      .catch((error) => alert(error.message));
  }
});
