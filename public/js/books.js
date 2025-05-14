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
});
