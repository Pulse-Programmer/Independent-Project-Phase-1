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
  const deleteButton = document.querySelector("#deleteBtn");

  const dbUrl = "https://json-db-independentproject.onrender.com/";
  let i = 0;

  //Extracts carousel items for the slide
  fetchCarousel();

  //Extracts transaction history
  handleHistory();

  //search box functionality called on business number input element of payForm
  payBusinessInput.addEventListener("input", () => {
    paySearchBox();
  });

  //Handles submission of paybill form details to be saved on the server/database
  businessForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let businessNumInput = e.target.business_num.value;
    let accountNumInput = e.target.account_num.value;
    let businessName = e.target.business_name.value;

    handlePaybillPost(businessNumInput, accountNumInput, businessName);
  });

  //Handles submission of payment form details to be saved on the server/database
  payForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const businessPayInput = e.target.business_numPay.value;
    const accountPayInput = e.target.account_numPay.value;
    const payAmount = parseInt(e.target.amount.value);

    handlePaymentPost(businessPayInput, accountPayInput, payAmount);
  });

  //Handles the form autofilling of clicked slide item details
  carouselContainer.addEventListener("click", (e) => {
    // Check if the clicked element is a carousel item
    if (e.target.classList.contains("carousel-item")) {
      // Extract the business number and account number from the clicked item
      const clickedBusinessName = e.target.firstElementChild.textContent;

      getPaybill().then((data) => {
        data.forEach((record) => {
          if (clickedBusinessName === record.businessName) {
            // Autofill the input fields in the payForm
            payBusinessInput.value = record.businessNumber;
            document.querySelector("#account_numPay").value =
              record.accountNumber;

            //Trigger the modal to open
            const modal = new bootstrap.Modal(
              document.getElementById("payModal")
            );
            modal.show();
          }
        });
      });
    }
  });

  //Handles the delete functionality
  deleteButton.addEventListener("click", (e) => {
    let businessVal = e.target.parentNode.business_numPay.value;

    getPaybill().then((data) => {
      let found = data.find((record) => businessVal === record.businessNumber);

      if (found) {
        handleDelete(found.id);
      }
    });

    handleDelete();
  });

  //POST function for handling paybill and save details to server
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

  //Function for handling posting of payment details to server
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
        date: new Date(),
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
        }, 5000);
      })
      .catch((error) => alert(error.message));
  }

  //GET data carousel function
  function fetchCarousel() {
    getPaybill()
      .then((data) => {
        data.forEach((record) => {
          const divItem = document.createElement("div");
          const carouselBtn = document.createElement("button");
          divItem.classList.add("carousel-item");
          divItem.innerHTML = `
          <h5><span class="badge bg-light text-dark">${record.businessName}</span></h5>
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

  // Define a function to handle the fading and sliding animation of alert card
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

  //function to handle character search of details already saved in the database
  function paySearchBox() {
    const payBusinessValue = payBusinessInput.value.toUpperCase(); // Get the value of the input and convert it to uppercase
    const payAccountNum = document.querySelector("#account_numPay"); //Select the account number input element in payForm

    getPaybill()
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

  //Function for delete request
  function handleDelete(paybillId) {
    fetch(`${dbUrl}/paybill/${paybillId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  //Function for handling transactions history
  function handleHistory() {
    getPayments()
      .then((data) => {
        data.forEach((record) => {
          const historyLi = document.createElement("li");

          historyLi.innerHTML = `
          <p>Business Number: <span>${record.businessNumber}</span></p>
          <p>Account Number: <span>${record.accountNumber}</span></p>
          <p>Amount: <span>${record.amountPaid}</span></p>
          <p>Date: <span>${record.date}</span></p>
          <hr>
          `;

          if (history.childElementCount < 10) {
            history.appendChild(historyLi);
          } else {
            history.removeChild(history.lastChild);
            history.appendChild(historyLi);
          }
        });
      })
      .catch((error) => alert(error.message));
  }

  //Get request function on payments resource
  function getPayments() {
    return fetch(`${dbUrl}/payments`).then((res) => res.json());
    //   .then((data) => data);
  }

  //Get request function on paybill resource
  function getPaybill() {
    return fetch(`${dbUrl}/paybill`).then((res) => res.json());
  }
});
