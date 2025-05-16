document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.querySelector("button");
    const searchInput = document.getElementById("searchInput");
    const booksContainer = document.querySelector("main > div.grid");

    searchButton.addEventListener("click", async function () {
        const query = searchInput.value.trim();
        if (!query) return;

        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            booksContainer.innerHTML = "";

            if (!data.items || data.items.length === 0) {
                booksContainer.innerHTML = "<p class='col-span-full text-center text-red-500'>Not Found.</p>";
                return;
            }

            data.items.forEach(item => {
                const volumeInfo = item.volumeInfo;
                const bookId = item.id;

                const title = volumeInfo.title || "Unknown Book";
                const authors = volumeInfo.authors ? volumeInfo.authors.join(", ") : "Unknown Author";
                const coverUrl = volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/150x200?text=No+Cover";
                const avgRating = volumeInfo.averageRating || "?";
                const stars = avgRating !== "?" ? "★".repeat(Math.floor(avgRating)) + "☆".repeat(5 - Math.floor(avgRating)) : "";

                const bookCard = `
                    <div class="bg-white shadow rounded-lg p-4">
                        <img src="${coverUrl}" alt="Cover" class="mx-auto mb-2 rounded">
                        <h2 class="text-md font-bold text-center">${title}</h2>
                        <p class="text-sm text-gray-600 text-center mb-2">${authors}</p>
                        <div class="flex justify-center items-center mb-2">
                            <span class="text-yellow-500">${stars}</span>
                            <span class="ml-2 text-sm text-gray-600">${avgRating !== "?" ? avgRating : "No Rating"}</span>
                        </div>
                        <div class="flex justify-between space-x-2 mb-2">
                            <button data-book-id="${bookId}" data-title="${title}" class="btn-read flex-1 bg-green-500 text-white py-1 rounded hover:bg-green-600 flex items-center justify-center">
                                ✅ <span class="ml-1">Read</span>
                            </button>
                            <button data-book-id="${bookId}" data-title="${title}" class="btn-to-read flex-1 bg-blue-500 text-white py-1 rounded hover:bg-blue-600 flex items-center justify-center">
                                📚 <span class="ml-1">To Read</span>
                            </button>
                        </div>
                        <button class="w-full bg-indigo-600 text-white py-1 rounded hover:bg-indigo-700">Details</button>
                    </div>
                `;

                booksContainer.innerHTML += bookCard;
            });
        } catch (error) {
            console.error("Hata:", error);
            booksContainer.innerHTML = "<p class='col-span-full text-center text-red-500'>Bir hata oluştu.</p>";
        }
    });

    document.addEventListener("click", async function (e) {
        if (e.target.closest(".btn-read") || e.target.closest(".btn-to-read")) {
            const button = e.target.closest("button");
            const bookId = button.dataset.bookId;
            const title = button.dataset.title;
            const action = button.classList.contains("btn-read") ? "read" : "to_read";

            try {
                const response = await fetch("/update-book-status", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ bookId, title, action })
                });

                const result = await response.json();
                if (result.success) {
                    alert(`${action === "read" ? "Marked as Read" : "Added to To Read list"}: ${title}`);
                } else {
                    alert("This book is already in your list.");
                }
            } catch (err) {
                console.error("Request failed:", err);
                alert("An error occurred.");
            }
        }
    });
});