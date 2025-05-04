
function loadPendingReviews() {
    const pendingReviews = []; // Replace with actual data fetching logic
    // pull pending reviews from the DB
    const tbody = document.getElementById('tblReviewsBody');
    tbody.innerHTML = ''; // Clear existing rows

    if (pendingReviews.length === 0) {
      tbody.innerHTML = '<tr><td class="text-center" colspan="4">No pending reviews</td></tr>';
      return;
    }
  }
  loadPendingReviews();