document.addEventListener("DOMContentLoaded", () => {
  const businessForm = document.querySelector("#business_form");
  const payForm = document.querySelector("#pay_form");
  const history = document.querySelector("#historyItems");
  const carouselContainer = document.querySelector(".carousel-inner");
  const carouselIndicators = document.querySelector(".carousel-indicators");
  const dbUrl = "http://localhost:3000";
  let i = 0;

  fetchCarousel();

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

        history.appendChild(li);
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
});
