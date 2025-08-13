import React from "react";
import axios from "axios";

const KhaltiPayment = ({ amount, productName, description }) => {
  const initiatePayment = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/payments/initiate-khalti/",
        {
          amount: amount, // in paisa
          product_name: productName,
          description: description,
          return_url: `${window.location.origin}/payment/success`,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
      } else {
        alert("Failed to get payment URL from server.");
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Failed to initiate payment. Please try again.");
    }
  };

  return (
    <button
      onClick={initiatePayment}
      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
    >
      Pay with Khalti
    </button>
  );
};

export default KhaltiPayment;
