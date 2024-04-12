document.addEventListener("DOMContentLoaded", () => {
  const businessForm = document.querySelector("#business_form");
  const payForm = document.querySelector("#pay_form");
  const dbUrl = "http://localhost:3000";

  businessForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let businessNumInput = e.target.business_num.value;
    let accountNumInput = e.target.account_num.value;
    let businessName = e.target.business_name.value;

    handlePost(businessNumInput, accountNumInput, businessName);
  });

  //POST function
  function handlePost(businessNum, accountNum, name) {
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
});
