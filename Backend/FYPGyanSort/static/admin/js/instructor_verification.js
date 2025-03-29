function verifyInstructor(instructorId, event) {
  event.preventDefault();
  if (confirm("Are you sure you want to verify this instructor?")) {
    fetch(`/api/instructors/verify/${instructorId}/`, {
      method: "POST",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          location.reload();
        } else {
          alert("Verification failed: " + data.message);
        }
      });
  }
}

function rejectInstructor(instructorId, event) {
  event.preventDefault();
  if (confirm("Are you sure you want to reject this instructor?")) {
    fetch(`/api/instructors/reject/${instructorId}/`, {
      method: "POST",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          location.reload();
        } else {
          alert("Rejection failed: " + data.message);
        }
      });
  }
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
