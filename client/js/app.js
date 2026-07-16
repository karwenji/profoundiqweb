// Main Application Logic
document.addEventListener('DOMContentLoaded', async () => {
  // Load popular courses on homepage
  const coursesContainer = document.getElementById('popular-courses');
  if (coursesContainer) {
    try {
      const response = await coursesAPI.getAll();
      const courses = response.data || [];
      
      if (courses.length === 0) {
        coursesContainer.innerHTML = '<p class="text-center" style="grid-column:1/-1;color:var(--gray-500);">No courses available yet.</p>';
      } else {
        coursesContainer.innerHTML = courses.slice(0, 3).map(course => `
          <div class="card course-card">
            <div class="course-thumb">📚</div>
            <div class="course-body">
              <span class="course-category">${course.category || 'General'}</span>
              <h3 class="course-title">${course.title}</h3>
              <p class="course-instructor">by ${course.instructor_name}</p>
              <div class="course-footer">
                <span class="course-price">${course.currency} ${course.price.toLocaleString()}</span>
                <a href="/pages/course-detail.html?id=${course.id}" class="btn btn-primary btn-sm">View Course</a>
              </div>
            </div>
          </div>
        `).join('');
      }
    } catch (err) {
      coursesContainer.innerHTML = '<p class="text-center" style="grid-column:1/-1;color:var(--red-600);">Failed to load courses.</p>';
    }
  }

  // Update cart count
  updateCartCount();
});

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const countEl = document.getElementById('cart-count');
  if (countEl) {
    if (cart.length > 0) {
      countEl.textContent = cart.length;
      countEl.style.display = 'flex';
    } else {
      countEl.style.display = 'none';
    }
  }
}

// Utility: Show alert message
function showAlert(container, message, type = 'error') {
  const div = document.createElement('div');
  div.className = `alert alert-${type}`;
  div.textContent = message;
  container.prepend(div);
  setTimeout(() => div.remove(), 5000);
}

// Utility: Format currency
function formatCurrency(amount, currency = 'KES') {
  return `${currency} ${Number(amount).toLocaleString()}`;
}
