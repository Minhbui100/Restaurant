async function addOrders(cart) {
  const orders = [];
  //   const dishRows = document.querySelectorAll(".dish-row");

  //   dishRows.forEach((row) => {
  //     const dishName = row.querySelector(".dish-name").textContent;
  //     const quantityInput = row.querySelector(".quantity-input");
  //     const quantity = parseInt(quantityInput.value);

  //     if (quantity && quantity > 0) {
  //       orders.push({ name: dishName, quantity });
  //     }
  //   });
  for (const item of cart) {
    orders.push({ name: item.name, quantity: item.quantity });
  }

  if (orders.length === 0) {
    alert("Please select at least one dish with a valid quantity.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders }),
    });

    if (response.status === 201) {
      return response.text();
    } else {
      const errorMessage = await response.text();
      alert(`Error: ${errorMessage}`);
      return -1;
    }
  } catch (error) {
    console.error("Fetch error:", error);
    alert("An unexpected error occurred.");
    return -1;
  }
}

async function addCustomer(name, phone) {
  try {
    const response = await fetch("http://localhost:3000/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, phone }),
    });

    if (response.ok) {
      const responseData = await response.text();
      console.log(responseData.message); // Log the success message
    } else if (response.status === 400) {
      const errorMessage = await response.text();
      console.warn("Validation error:", errorMessage.error);
    } else {
      const errorMessage = await response.text();
      console.error("Unexpected error:", errorMessage);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

async function payment(orderDetails) {
  const {
    orderId,
    customerName,
    customerPhone,
    paymentMethod,
    cardId,
    expireDate,
    tip,
    locationName,
  } = orderDetails;
  try {
    console.log("payment run");
    console.log(customerPhone, locationName, tip, cardId);
    const response = await fetch(`http://localhost:3000/bill/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerPhone,
        locationName,
        tip: `${tip}`,
        cardId,
      }),
    });

    if (response.status === 400) {
      const warningMessage = await response.text();
      console.log(warningMessage);
    } else if (response.ok) {
      alert(`Order placed by ${customerName} at ${locationName}.`);
    } else {
      console.error("An error occurred:", response.statusText);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

async function addCard(id, name, date, spend) {
  try {
    console.log(id);
    const response = await fetch("http://localhost:3000/cards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        name,
        ex_date: date,
        spend,
      }),
    });

    if (response.status === 400) {
      // Read and display the warning message from the response
      const warningMessage = await response.text();
      alert(warningMessage); // Alert the error message
    } else if (response.ok) {
      const result = await response.json();
      console.log(
        "Card added or updated successfully. New balance:",
        result.newBalance
      );
    } else {
      const errorMessage = await response.text();
      alert(`Error: ${errorMessage}`); // Alert other error messages
    }
  } catch (error) {
    console.error("Fetch error:", error);
    alert("An unexpected error occurred while processing your request."); // Alert on unexpected errors
  }
}

async function getMenuItems() {
  try {
    // Fetch data from the /menu API endpoint
    const response = await fetch("http://localhost:3000/menu");

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    // Parse the JSON response
    const data = await response.json();

    // Map the result to the desired structure
    const menuItems = data.map((item) => ({
      name: item.name,
      price: parseFloat(item.price), // Ensuring price is a number
      image: item.image,
      status: item.status,
    }));

    console.log(menuItems); // Display the menu items in the console (for testing)

    return menuItems; // Return the menu items array
  } catch (err) {
    console.error("Error fetching menu items:", err.message);
    return [];
  }
}

export { addOrders, payment, addCustomer, addCard, getMenuItems };
